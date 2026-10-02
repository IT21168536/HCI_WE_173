export type UserRole = 'customer' | 'cook' | 'rider';

export type User = {
  id: number;
  fullName: string;
  email: string;
  mobile?: string | null;
  passwordHash: string;
  role: UserRole;
  profileImage?: string | null;
  createdAt: string;
};
