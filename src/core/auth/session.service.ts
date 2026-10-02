import * as SecureStore from 'expo-secure-store';
import type { User } from '@/shared/types/User';
import { findUserById } from '@/core/repositories/user.repository';

const sessionKey = 'worky-kitchen.session-user-id';

export async function saveSession(userId: number) {
  await SecureStore.setItemAsync(sessionKey, String(userId));
}

export async function clearSession() {
  await SecureStore.deleteItemAsync(sessionKey);
}

export async function getSessionUser(): Promise<User | null> {
  const value = await SecureStore.getItemAsync(sessionKey);
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
