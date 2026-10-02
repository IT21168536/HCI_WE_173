import { getDatabase } from '@/core/database/database';
import type { CookProfile } from '@/shared/types/CookProfile';

function mapCookProfile(row: any): CookProfile {
  return {
    id: row.id,
    userId: row.user_id,
    businessName: row.business_name,
    location: row.location,
    description: row.description,
    hygieneInfo: row.hygiene_info,
    verificationStatus: row.verification_status,
  };
}

export async function getCookProfile(userId: number): Promise<CookProfile | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync('SELECT * FROM cook_profiles WHERE user_id = ?', [userId]);
  return row ? mapCookProfile(row) : null;
}

export async function listCookProfiles(): Promise<CookProfile[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync('SELECT * FROM cook_profiles ORDER BY business_name');
  return rows.map(mapCookProfile);
}
