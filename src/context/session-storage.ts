import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const KEY = 'funnyfarm.token';

/**
 * Stores the server-issued session token on the device: Keychain on iOS,
 * Keystore-backed storage on Android. Web has no secure store, so it falls
 * back to localStorage (less secure; fine for development).
 */
export async function loadToken(): Promise<string | null> {
  try {
    return Platform.OS === 'web' ? (globalThis.localStorage?.getItem(KEY) ?? null) : await SecureStore.getItemAsync(KEY);
  } catch {
    return null;
  }
}

export async function saveToken(token: string | null): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      if (token) globalThis.localStorage?.setItem(KEY, token);
      else globalThis.localStorage?.removeItem(KEY);
    } else if (token) {
      await SecureStore.setItemAsync(KEY, token);
    } else {
      await SecureStore.deleteItemAsync(KEY);
    }
  } catch {
    // Best-effort; the in-memory session still works.
  }
}
