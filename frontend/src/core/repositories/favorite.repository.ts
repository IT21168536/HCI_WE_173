import { getDatabase } from '@/core/database/database';

export async function toggleFavorite(customerId: number, mealId: number) {
  const db = await getDatabase();
  const current = await db.getFirstAsync('SELECT id FROM favorites WHERE customer_id = ? AND meal_id = ?', [customerId, mealId]);

  if (current) {
    await db.runAsync('DELETE FROM favorites WHERE customer_id = ? AND meal_id = ?', [customerId, mealId]);
    return false;
  }

  await db.runAsync('INSERT INTO favorites (customer_id, meal_id, created_at) VALUES (?, ?, ?)', [
    customerId,
    mealId,
    new Date().toISOString(),
  ]);
  return true;
}
