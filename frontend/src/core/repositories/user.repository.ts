import { getDatabase } from '@/core/database/database';
import type { User, UserRole } from '@/shared/types/User';
import { mapUser } from './mappers';

type CreateUserInput = {
  fullName: string;
  email: string;
  mobile?: string;
  passwordHash: string;
  role: UserRole;
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
    'INSERT INTO users (full_name, email, mobile, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?, ?)',
    [input.fullName, input.email.trim().toLowerCase(), input.mobile ?? null, input.passwordHash, input.role, createdAt],
  );

  const user = await findUserById(result.lastInsertRowId);
  if (!user) {
    throw new Error('Unable to load created user.');
  }

  return user;
}
