import * as Crypto from 'expo-crypto';
import type { User, UserRole } from '@/shared/types/User';
import { createUser, findUserByEmail, updatePasswordHash } from '@/core/repositories/user.repository';
import { upsertCookProfile } from '@/core/repositories/cook.repository';
import { isEmail, isPhone } from '@/shared/utils/validators';
import { clearSession, saveSession } from './session.service';

/** Demo accounts are seeded with this marker instead of a hash. */
const DEMO_PASSWORD = 'demo-password';

export type RegisterInput = {
  fullName: string;
  email: string;
  mobile?: string;
  address?: string;
  password: string;
  role: UserRole;
  kitchen?: {
    businessName: string;
    location?: string;
    description?: string;
  };
};

async function hashPassword(password: string) {
  const digest = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `worky-kitchen:${password}`);
  return `sha256:${digest}`;
}

async function passwordMatches(stored: string, password: string) {
  if (stored === DEMO_PASSWORD) {
    return password === DEMO_PASSWORD;
  }
  return stored === (await hashPassword(password));
}

export async function login(email: string, password: string): Promise<User> {
  if (!isEmail(email) || !password) {
    throw new Error('Enter your email address and password.');
  }

  const user = await findUserByEmail(email);
  if (!user || !(await passwordMatches(user.passwordHash, password))) {
    throw new Error('That email and password do not match.');
  }

  await saveSession(user.id);
  return user;
}

export async function register(input: RegisterInput): Promise<User> {
  if (!input.fullName.trim()) {
    throw new Error('Enter your full name.');
  }
  if (!isEmail(input.email)) {
    throw new Error('Enter a valid email address.');
  }
  if (input.mobile && !isPhone(input.mobile)) {
    throw new Error('Enter a valid phone number, for example 077 123 4567.');
  }
  if (input.password.length < 6) {
    throw new Error('Use at least 6 characters for your password.');
  }
  if (input.role === 'cook' && !input.kitchen?.businessName.trim()) {
    throw new Error('Enter your kitchen name.');
  }

  const existing = await findUserByEmail(input.email);
  if (existing) {
    throw new Error('An account with this email already exists. Log in instead.');
  }

  const user = await createUser({
    fullName: input.fullName,
    email: input.email,
    mobile: input.mobile,
    address: input.address,
    passwordHash: await hashPassword(input.password),
    role: input.role,
  });

  if (input.role === 'cook' && input.kitchen) {
    await upsertCookProfile(user.id, input.kitchen, 'pending');
  }

  await saveSession(user.id);
  return user;
}

/** Local-only reset: there is no email server in the MVP, so the account is matched by email and phone. */
export async function resetPassword(email: string, mobile: string, newPassword: string) {
  if (newPassword.length < 6) {
    throw new Error('Use at least 6 characters for your new password.');
  }
  const user = await findUserByEmail(email);
  const digits = (value?: string | null) => (value ?? '').replace(/\D/g, '').slice(-9);
  if (!user || !user.mobile || digits(user.mobile) !== digits(mobile)) {
    throw new Error('We could not find an account with that email and phone number.');
  }
  await updatePasswordHash(email, await hashPassword(newPassword));
}

export async function logout() {
  await clearSession();
}

export function homeRouteFor(role: UserRole) {
  switch (role) {
    case 'cook':
      return '/(cook)/(tabs)/dashboard' as const;
    case 'rider':
      return '/(rider)/(tabs)/dashboard' as const;
    default:
      return '/(customer)/(tabs)/home' as const;
  }
}
