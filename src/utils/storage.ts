import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

/**
 * Secure storage for the session token and lightweight preferences.
 *
 * SecureStore is native-only, so Expo web falls back to localStorage. On
 * native the token is stored in the iOS Keychain / Android Keystore.
 */

function webStorage(): Storage | null {
  if (Platform.OS !== "web") {
    return null;
  }

  try {
    return typeof localStorage === "undefined" ? null : localStorage;
  } catch {
    return null;
  }
}

export async function getStoredItem(key: string): Promise<string | null> {
  const web = webStorage();

  if (web) {
    try {
      return web.getItem(key);
    } catch {
      return null;
    }
  }

  try {
    return await SecureStore.getItemAsync(key);
  } catch {
    return null;
  }
}

export async function setStoredItem(key: string, value: string): Promise<void> {
  const web = webStorage();

  if (web) {
    try {
      web.setItem(key, value);
    } catch {
      // Storage can be unavailable (private mode); the in-memory session still
      // works for the current run.
    }

    return;
  }

  try {
    await SecureStore.setItemAsync(key, value, {
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
  } catch {
    // Never crash the app because persistence failed.
  }
}

export async function deleteStoredItem(key: string): Promise<void> {
  const web = webStorage();

  if (web) {
    try {
      web.removeItem(key);
    } catch {
      // ignore
    }

    return;
  }

  try {
    await SecureStore.deleteItemAsync(key);
  } catch {
    // ignore
  }
}
