// Minimal auth service. No dependencies: uses Node's built-in http + crypto.
//
//   POST /auth/login   { username, password } -> { token, user }
//   GET  /auth/me      Authorization: Bearer <token> -> { user }
//   POST /auth/logout  Authorization: Bearer <token> -> 204
//
// DEV ONLY: a single hardcoded account and in-memory sessions (lost on restart).
import { randomBytes, timingSafeEqual } from "node:crypto";
import { createServer } from "node:http";

const PORT = Number(process.env.PORT) || 3001;
const USERS = [{ id: "1", username: "admin@email.com", password: "password" }];
const sessions = new Map(); // token -> user id

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

const publicUser = (u) => ({ id: u.id, username: u.username });

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

    send(res, 404, { error: "Not found" });
  } catch (e) {
    send(res, 400, { error: e.message });
  }
}).listen(PORT, () =>
  console.log(`Auth server listening on http://localhost:${PORT}`),
);
