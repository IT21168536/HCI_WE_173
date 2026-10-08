export type VerificationStatus = 'unverified' | 'pending' | 'verified';

export type CookProfile = {
  id: number;
  userId: number;
  businessName?: string | null;
  location?: string | null;
  description?: string | null;
  hygieneInfo?: string | null;
  verificationStatus: VerificationStatus;
  isOpen: boolean;
  /** Joined from users */
  cookName?: string | null;
  mobile?: string | null;
  profileImage?: string | null;
  rating?: number | null;
  reviewCount?: number;
};
