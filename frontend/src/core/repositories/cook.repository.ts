import { getDatabase } from '@/core/database/database';
import type { CookProfile } from '@/shared/types/CookProfile';
import { isShortName, isTextWithin } from '@/shared/utils/validators';
import { mapCookProfile } from './mappers';

const cookSelect = `
  SELECT cook_profiles.*, users.full_name as cook_name, users.mobile, users.profile_image,
    (SELECT AVG(rating) FROM reviews WHERE reviews.cook_id = cook_profiles.user_id) as rating,
    (SELECT COUNT(*) FROM reviews WHERE reviews.cook_id = cook_profiles.user_id) as review_count
  FROM cook_profiles
  JOIN users ON users.id = cook_profiles.user_id
`;

export type CookProfileInput = {
  businessName: string;
  location?: string | null;
  description?: string | null;
  hygieneInfo?: string | null;
};

export async function getCookProfile(userId: number): Promise<CookProfile | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync(`${cookSelect} WHERE cook_profiles.user_id = ?`, [userId]);
  return row ? mapCookProfile(row) : null;
}

export async function listCookProfiles(): Promise<CookProfile[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync(`${cookSelect} ORDER BY cook_profiles.business_name`);
  return rows.map(mapCookProfile);
}

export async function upsertCookProfile(userId: number, input: CookProfileInput, verificationStatus?: CookProfile['verificationStatus']) {
  if (!isShortName(input.businessName)) throw new Error('Enter a kitchen name (2–60 characters).');
  if (!isShortName(input.location ?? '')) throw new Error('Enter an area (2–60 characters).');
  if (!isTextWithin(input.description, 300)) throw new Error('Kitchen description must be 300 characters or fewer.');
  if (!isTextWithin(input.hygieneInfo, 300)) throw new Error('Food safety details must be 300 characters or fewer.');
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO cook_profiles (user_id, business_name, location, description, hygiene_info, verification_status, is_open)
     VALUES (?, ?, ?, ?, ?, ?, 1)
     ON CONFLICT(user_id) DO UPDATE SET
       business_name = excluded.business_name,
       location = excluded.location,
       description = excluded.description,
       hygiene_info = excluded.hygiene_info`,
    [
      userId,
      input.businessName.trim(),
      input.location?.trim() || null,
      input.description?.trim() || null,
      input.hygieneInfo?.trim() || null,
      verificationStatus ?? 'pending',
    ],
  );
}

export async function setCookOpen(userId: number, isOpen: boolean) {
  const db = await getDatabase();
  await db.runAsync('UPDATE cook_profiles SET is_open = ? WHERE user_id = ?', [isOpen ? 1 : 0, userId]);
}

export type CookStats = {
  todayOrders: number;
  newOrders: number;
  activeOrders: number;
  todaySales: number;
  rating: number | null;
  reviewCount: number;
  pendingCancellations: number;
};

function startOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
}

export async function getCookStats(cookId: number): Promise<CookStats> {
  const db = await getDatabase();
  const today = startOfToday();
  const row = await db.getFirstAsync<{
    today_orders: number;
    new_orders: number;
    active_orders: number;
    today_sales: number | null;
    pending_cancellations: number;
  }>(
    `SELECT
       SUM(CASE WHEN created_at >= ? AND status != 'cancelled' THEN 1 ELSE 0 END) as today_orders,
       SUM(CASE WHEN status = 'requested' THEN 1 ELSE 0 END) as new_orders,
       SUM(CASE WHEN status IN ('accepted','preparing','ready') THEN 1 ELSE 0 END) as active_orders,
       SUM(CASE WHEN created_at >= ? AND status != 'cancelled' THEN subtotal ELSE 0 END) as today_sales,
       SUM(CASE WHEN cancel_status = 'requested' AND status NOT IN ('cancelled','delivered') THEN 1 ELSE 0 END) as pending_cancellations
     FROM orders WHERE cook_id = ?`,
    [today, today, cookId],
  );
  const rating = await db.getFirstAsync<{ avg: number | null; count: number }>(
    'SELECT AVG(rating) as avg, COUNT(*) as count FROM reviews WHERE cook_id = ?',
    [cookId],
  );

  return {
    todayOrders: row?.today_orders ?? 0,
    newOrders: row?.new_orders ?? 0,
    activeOrders: row?.active_orders ?? 0,
    todaySales: row?.today_sales ?? 0,
    pendingCancellations: row?.pending_cancellations ?? 0,
    rating: rating?.avg ?? null,
    reviewCount: rating?.count ?? 0,
  };
}

export type DailySales = { date: string; total: number; orders: number };

/** Sales (meal subtotal, excluding cancelled orders) for each of the last `days` days, oldest first. */
export async function getCookDailySales(cookId: number, days = 7): Promise<DailySales[]> {
  const db = await getDatabase();
  const now = new Date();
  const first = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (days - 1));
  const rows = await db.getAllAsync<{ created_at: string; subtotal: number }>(
    `SELECT created_at, subtotal FROM orders WHERE cook_id = ? AND status != 'cancelled' AND created_at >= ?`,
    [cookId, first.toISOString()],
  );

  const buckets: DailySales[] = Array.from({ length: days }, (_, index) => {
    const date = new Date(first.getFullYear(), first.getMonth(), first.getDate() + index);
    return { date: date.toISOString(), total: 0, orders: 0 };
  });

  for (const row of rows) {
    const created = new Date(row.created_at);
    const index = Math.floor(
      (new Date(created.getFullYear(), created.getMonth(), created.getDate()).getTime() - first.getTime()) / 86_400_000,
    );
    if (index >= 0 && index < days) {
      buckets[index].total += row.subtotal;
      buckets[index].orders += 1;
    }
  }

  return buckets;
}

/** `days = 0` means since midnight today. */
function sinceDays(days: number) {
  return days === 0 ? startOfToday() : new Date(Date.now() - days * 86_400_000).toISOString();
}

export async function getCookSalesSince(cookId: number, days: number) {
  const db = await getDatabase();
  const since = sinceDays(days);
  const row = await db.getFirstAsync<{ total: number | null; orders: number; meals: number | null }>(
    `SELECT SUM(orders.subtotal) as total, COUNT(*) as orders,
       (SELECT SUM(order_items.quantity) FROM order_items JOIN orders o2 ON o2.id = order_items.order_id
        WHERE o2.cook_id = ? AND o2.status != 'cancelled' AND o2.created_at >= ?) as meals
     FROM orders WHERE cook_id = ? AND status != 'cancelled' AND created_at >= ?`,
    [cookId, since, cookId, since],
  );
  return { total: row?.total ?? 0, orders: row?.orders ?? 0, meals: row?.meals ?? 0 };
}

export type TopMeal = { mealId: number; name: string; quantity: number; total: number };

export async function getCookTopMeals(cookId: number, days: number, limit = 3): Promise<TopMeal[]> {
  const db = await getDatabase();
  const since = sinceDays(days);
  const rows = await db.getAllAsync<{ meal_id: number; name: string; quantity: number; total: number }>(
    `SELECT order_items.meal_id, meals.name, SUM(order_items.quantity) as quantity, SUM(order_items.quantity * order_items.unit_price) as total
     FROM order_items
     JOIN orders ON orders.id = order_items.order_id
     JOIN meals ON meals.id = order_items.meal_id
     WHERE orders.cook_id = ? AND orders.status != 'cancelled' AND orders.created_at >= ?
     GROUP BY order_items.meal_id
     ORDER BY quantity DESC, total DESC
     LIMIT ?`,
    [cookId, since, limit],
  );
  return rows.map((row) => ({ mealId: row.meal_id, name: row.name, quantity: row.quantity, total: row.total }));
}
