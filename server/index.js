// Minimal auth service. No dependencies: uses Node's built-in http + crypto.
//
//   POST /auth/login   { username, password } -> { token, user }
//   GET  /auth/me      Authorization: Bearer <token> -> { user }
//   POST /auth/logout  Authorization: Bearer <token> -> 204
//   POST /memes        Authorization: Bearer <token>, body = raw image bytes,
//                      Content-Type image/jpeg|png|webp, ?title=... -> { meme }
//   GET  /memes        -> { memes: [{ id, title, url }] } (all uploaded images)
//   GET  /memes/mine   Authorization: Bearer <token> -> { memes } (only the caller's uploads)
//   GET  /memes/files/<name> -> the image
//
// Uploads are saved into assets/test-images (prefixed "upload-") so they sit next
// to the other test images.

// DEV ONLY: a single hardcoded account and in-memory sessions (lost on restart).
import { randomBytes, timingSafeEqual } from "node:crypto";
import { createServer } from "node:http";
import { mkdir, readdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const PORT = Number(process.env.PORT) || 3001;
const USERS = [{ id: "1", username: "admin@email.com", password: "password" }];
const sessions = new Map(); // token -> user id

const IMAGE_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "assets", "test-images");
// Tiny JSON-file store: loaded once at startup, saved after changes. Writes are
// serialized (temp file + rename) so concurrent requests can't corrupt the file.
const DIR = dirname(fileURLToPath(import.meta.url));
async function openStore(name) {
  const file = join(DIR, name);
  const data = await readFile(file, "utf8").then(JSON.parse, () => ({}));
  let chain = Promise.resolve();
  const save = () => {
    chain = chain.then(async () => {
      await writeFile(`${file}.tmp`, JSON.stringify(data, null, 2));
      await rename(`${file}.tmp`, file);
    });
    return chain;
  };
  return { data, save };
}

// Who uploaded what: { "<upload id>": "<user id>" }.
// Images without an entry (uploaded before ownership was tracked) belong to nobody.
const { data: owners, save: saveOwners } = await openStore("uploads-owners.json");

// Points per account: { "<user id>": number }. An account with no entry has 0.
// Server-side only: clients can read their total but never set it. Call addPoints()
// from whatever future rule awards points (e.g. a completed judgement).
const { data: points, save: savePoints } = await openStore("points.json");
const pointsOf = (userId) => points[userId] ?? 0;
async function addPoints(userId, amount) {
  points[userId] = pointsOf(userId) + amount;
  await savePoints();
  return points[userId];
}
void addPoints; // not wired to anything yet

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const EXT_BY_TYPE = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
const TYPE_BY_EXT = { jpg: "image/jpeg", png: "image/png", webp: "image/webp" };
const UPLOAD_NAME = /^upload-[0-9a-f]{16}\.(jpg|png|webp)$/;

function safeEqual(a, b) {
  const ab = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

function send(res, status, body) {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  });
  res.end(body === undefined ? undefined : JSON.stringify(body));
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
      if (data.length > 10_000) {
        reject(new Error("Body too large"));
        req.destroy();
      }
    });
    req.on("end", () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch {
        reject(new Error("Invalid JSON"));
      }
    });
  });
}

function readBytes(req, limit) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > limit) {
        reject(new Error("File too large (max 10 MB)"));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

// Check the file's magic bytes so a mislabeled Content-Type can't smuggle in other files.
function looksLike(type, b) {
  if (type === "image/jpeg") return b[0] === 0xff && b[1] === 0xd8;
  if (type === "image/png") return b.subarray(0, 4).toString("hex") === "89504e47";
  if (type === "image/webp")
    return b.subarray(0, 4).toString() === "RIFF" && b.subarray(8, 12).toString() === "WEBP";
  return false;
}

const publicUser = (u) => ({ id: u.id, username: u.username, points: pointsOf(u.id) });

function authedUser(req) {
  const token = (req.headers.authorization ?? "").replace(/^Bearer /, "");
  const user = USERS.find((u) => u.id === sessions.get(token));
  return { token, user };
}

createServer(async (req, res) => {
  const { pathname } = new URL(req.url, "http://localhost");

  if (req.method === "OPTIONS") return send(res, 204);

  try {
    if (req.method === "POST" && pathname === "/auth/login") {
      const { username, password } = await readJson(req);
      const user = USERS.find((u) => safeEqual(u.username, username ?? ""));
      // Always compare a password so timing doesn't reveal whether the username exists.
      const ok = safeEqual(user?.password ?? "", password ?? "") && user;
      if (!ok) return send(res, 401, { error: "Invalid username or password" });
      const token = randomBytes(32).toString("hex");
      sessions.set(token, user.id);
      return send(res, 200, { token, user: publicUser(user) });
    }

    if (req.method === "GET" && pathname === "/auth/me") {
      const { user } = authedUser(req);
      return user
        ? send(res, 200, { user: publicUser(user) })
        : send(res, 401, { error: "Not authenticated" });
    }

    if (req.method === "POST" && pathname === "/auth/logout") {
      sessions.delete(authedUser(req).token);
      return send(res, 204);
    }

    if (req.method === "GET" && (pathname === "/memes" || pathname === "/memes/mine")) {
      let onlyUserId;
      if (pathname === "/memes/mine") {
        const { user } = authedUser(req);
        if (!user) return send(res, 401, { error: "Not authenticated" });
        onlyUserId = user.id;
      }
      const files = await readdir(IMAGE_DIR).catch(() => []);
      const memes = files
        .filter((f) => UPLOAD_NAME.test(f))
        .filter((f) => onlyUserId === undefined || owners[f.replace(/\.\w+$/, "")] === onlyUserId)
        .sort()
        .map((f) => ({
          id: f.replace(/\.\w+$/, ""),
          title: "Uploaded meme",
          url: `/memes/files/${f}`,
        }));
      return send(res, 200, { memes });
    }

    if (req.method === "GET" && pathname.startsWith("/memes/files/")) {
      const name = pathname.slice("/memes/files/".length);
      if (!UPLOAD_NAME.test(name)) return send(res, 404, { error: "Not found" });
      const data = await readFile(join(IMAGE_DIR, name)).catch(() => null);
      if (!data) return send(res, 404, { error: "Not found" });
      res.writeHead(200, {
        "Content-Type": TYPE_BY_EXT[name.split(".").pop()],
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=31536000, immutable",
      });
      return res.end(data);
    }

    if (req.method === "POST" && pathname === "/memes") {
      const { user } = authedUser(req);
      if (!user) return send(res, 401, { error: "Not authenticated" });
      const type = (req.headers["content-type"] ?? "").split(";")[0].trim();
      const ext = EXT_BY_TYPE[type];
      if (!ext) return send(res, 415, { error: "Only JPEG, PNG or WebP images are allowed" });
      const bytes = await readBytes(req, MAX_UPLOAD_BYTES);
      if (!bytes.length || !looksLike(type, bytes))
        return send(res, 400, { error: "That file isn't a valid image" });
      const id = `upload-${randomBytes(8).toString("hex")}`;
      await mkdir(IMAGE_DIR, { recursive: true });
      await writeFile(join(IMAGE_DIR, `${id}.${ext}`), bytes);
      owners[id] = user.id;
      await saveOwners();
      return send(res, 201, {
        meme: { id, title: "Uploaded meme", url: `/memes/files/${id}.${ext}` },
      });
    }

    send(res, 404, { error: "Not found" });
  } catch (e) {
    send(res, 400, { error: e.message });
  }
}).listen(PORT, () =>
  console.log(`Auth server listening on http://localhost:${PORT}`),
);
