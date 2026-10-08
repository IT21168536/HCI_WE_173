import { getDatabase } from '@/core/database/database';
import type { User, UserRole } from '@/shared/types/User';
import { mapUser } from './mappers';

type CreateUserInput = {
  fullName: string;
  email: string;
  mobile?: string;
  address?: string;
  passwordHash: string;
  role: UserRole;
};

export type UpdateUserInput = {
  fullName: string;
  mobile?: string | null;
  address?: string | null;
  profileImage?: string | null;
};

export async function findUserByEmail(email: string): Promise<User | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync('SELECT * FROM users WHERE email = ?', [email.trim().toLowerCase()]);
  return row ? mapUser(row) : null;
}

export async function findUserById(id: number): Promise<User | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync('SELECT * FROM users WHERE id = ?', [id]);
  return row ? mapUser(row) : null;
}

export async function createUser(input: CreateUserInput): Promise<User> {
  const db = await getDatabase();
  const createdAt = new Date().toISOString();

  const result = await db.runAsync(
    'INSERT INTO users (full_name, email, mobile, address, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [
      input.fullName.trim(),
      input.email.trim().toLowerCase(),
      input.mobile?.trim() || null,
      input.address?.trim() || null,
      input.passwordHash,
      input.role,
      createdAt,
    ],
  );

  const user = await findUserById(result.lastInsertRowId);
  if (!user) {
    throw new Error('Unable to load created user.');
  }

  return user;
}

export async function updateUser(id: number, input: UpdateUserInput): Promise<User> {
  const db = await getDatabase();
  await db.runAsync('UPDATE users SET full_name = ?, mobile = ?, address = ?, profile_image = COALESCE(?, profile_image) WHERE id = ?', [
    input.fullName.trim(),
    input.mobile?.trim() || null,
    input.address?.trim() || null,
    input.profileImage ?? null,
    id,
  ]);

  const user = await findUserById(id);
  if (!user) {
    throw new Error('Account not found.');
  }
  return user;
}

export async function updatePasswordHash(email: string, passwordHash: string) {
  const db = await getDatabase();
  const result = await db.runAsync('UPDATE users SET password_hash = ? WHERE email = ?', [passwordHash, email.trim().toLowerCase()]);
  if (result.changes === 0) {
    throw new Error('No account uses that email address.');
  }
}
