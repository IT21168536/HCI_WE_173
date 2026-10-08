import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import type { User } from '@/shared/types/User';
import { findUserById } from '@/core/repositories/user.repository';

const sessionKey = 'worky-kitchen.session-user-id';

function getWebStorage() {
  if (Platform.OS !== 'web' || typeof localStorage === 'undefined') {
    return null;
  }
  return localStorage;
}

export async function saveSession(userId: number) {
  const storage = getWebStorage();
  if (storage) {
    storage.setItem(sessionKey, String(userId));
    return;
  }

  await SecureStore.setItemAsync(sessionKey, String(userId));
}

export async function clearSession() {
  const storage = getWebStorage();
  if (storage) {
    storage.removeItem(sessionKey);
    return;
  }

  await SecureStore.deleteItemAsync(sessionKey);
}

export async function getSessionUser(): Promise<User | null> {
  const storage = getWebStorage();
  const value = storage ? storage.getItem(sessionKey) : await SecureStore.getItemAsync(sessionKey);
  if (!value) {
    return null;
  }

  const id = Number(value);
  if (!Number.isFinite(id)) {
    await clearSession();
    return null;
  }

  return findUserById(id);
}
