import type { UserRole } from '@/shared/types/User';
import { createUser, findUserByEmail } from '@/core/repositories/user.repository';
import { saveSession } from './session.service';

type RegisterInput = {
  fullName: string;
  email: string;
  mobile?: string;
  password: string;
  role: UserRole;
};

export async function login(email: string, password: string) {
  const user = await findUserByEmail(email);

  if (!user || user.passwordHash !== hashPassword(password)) {
    throw new Error('Invalid email or password.');
  }

  await saveSession(user.id);
  return user;
}

export async function register(input: RegisterInput) {
  const existing = await findUserByEmail(input.email);
  if (existing) {
    throw new Error('Email already registered.');
  }

  const user = await createUser({
    fullName: input.fullName,
    email: input.email,
    mobile: input.mobile,
    passwordHash: hashPassword(input.password),
    role: input.role,
  });

  await saveSession(user.id);
  return user;
}

function hashPassword(password: string) {
  return password.trim() === 'demo-password' ? 'demo-password' : `local-${password}`;
}
