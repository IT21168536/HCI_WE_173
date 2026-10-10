import * as Crypto from 'expo-crypto';
import type { User, UserRole } from '@/shared/types/User';
import { createUser, findUserByEmail, updatePasswordHash } from '@/core/repositories/user.repository';
import { upsertCookProfile } from '@/core/repositories/cook.repository';
import { isAddress, isEmail, isPassword, isPersonName, isShortName, isTenDigitPhone } from '@/shared/utils/validators';
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

export type RegisterErrors = Partial<Record<'fullName' | 'email' | 'mobile' | 'address' | 'password' | 'kitchenName' | 'kitchenLocation', string>>;

export function validateRegistration(input: RegisterInput): RegisterErrors {
  const errors: RegisterErrors = {};
  if (!isPersonName(input.fullName)) errors.fullName = 'Enter a valid name (2–60 characters, no numbers).';
  if (!isEmail(input.email)) errors.email = 'Enter a valid email address.';
  if (!isTenDigitPhone(input.mobile ?? '')) errors.mobile = 'Enter exactly 10 digits, for example 0771234567.';
  if ((input.role === 'customer' || input.role === 'cook') && !isAddress(input.address ?? '')) {
    errors.address = 'Enter a complete address (5–120 characters).';
  }
  if (!isPassword(input.password)) errors.password = 'Use 6–64 characters with at least one letter and one number.';
  if (input.role === 'cook') {
    if (!isShortName(input.kitchen?.businessName ?? '')) errors.kitchenName = 'Enter a kitchen name (2–60 characters).';
    if (!isShortName(input.kitchen?.location ?? '')) errors.kitchenLocation = 'Enter an area (2–60 characters).';
  }
  return errors;
}

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
  const errors = validateRegistration(input);
  const firstError = Object.values(errors)[0];
  if (firstError) throw new Error(firstError);

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
  if (!isEmail(email)) throw new Error('Enter a valid email address.');
  if (!isTenDigitPhone(mobile)) throw new Error('Enter exactly 10 digits for the phone number.');
  if (!isPassword(newPassword)) throw new Error('Use 6–64 characters with at least one letter and one number.');
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
