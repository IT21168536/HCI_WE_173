export type CookProfile = {
  id: number;
  userId: number;
  businessName?: string | null;
  location?: string | null;
  description?: string | null;
  hygieneInfo?: string | null;
  verificationStatus: 'unverified' | 'pending' | 'verified';
};
