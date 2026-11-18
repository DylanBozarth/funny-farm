import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * PLACEHOLDER: no hosting exists yet, so this points at the local dev server
 * (server/index.js). Set EXPO_PUBLIC_API_URL to override, e.g. to your
 * computer's LAN IP when testing on a physical phone, or the hosted URL later.
 */
function defaultBaseUrl() {
  // Expo dev server host == your computer, so a real phone on the same Wi-Fi can reach the API.
  const host = Constants.expoConfig?.hostUri?.split(':')[0];
  if (host && Platform.OS !== 'web') return `http://${host}:3001`;
  if (Platform.OS === 'android') return 'http://10.0.2.2:3001'; // Android emulator -> host machine
  return 'http://localhost:3001';
}

export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? defaultBaseUrl();

export type User = { id: string; username: string; points: number };

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

async function request<T>(path: string, init: RequestInit & { token?: string } = {}): Promise<T> {
  const { token, ...rest } = init;
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...rest,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
  } catch {
    throw new ApiError('Cannot reach the server. Is it running?', 0);
  }
  if (res.status === 204) return undefined as T;
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(body.error ?? 'Request failed', res.status);
  return body as T;
}

export const login = (username: string, password: string) =>
  request<{ token: string; user: User }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });

export const getMe = (token: string) => request<{ user: User }>('/auth/me', { token });

export const logout = (token: string) => request<void>('/auth/logout', { method: 'POST', token });

export type UploadedMeme = { id: string; title: string; url: string };

export const listMyMemes = (token: string) => request<{ memes: UploadedMeme[] }>('/memes/mine', { token });

export const listUploadedMemes = () => request<{ memes: UploadedMeme[] }>('/memes');

export async function uploadMeme(token: string, uri: string, mimeType: string) {
  // fetch(uri) turns a local file (native) or blob/data URL (web) into bytes we can POST.
  const blob = await (await fetch(uri)).blob();
  let res: Response;
  try {
    res = await fetch(`${API_URL}/memes`, {
      method: 'POST',
      headers: { 'Content-Type': mimeType, Authorization: `Bearer ${token}` },
      body: blob,
    });
  } catch {
    throw new ApiError('Cannot reach the server. Is it running?', 0);
  }
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(body.error ?? 'Upload failed', res.status);
  return (body as { meme: UploadedMeme }).meme;
}
