import { getDatabase } from '@/core/database/database';
import type { Meal } from '@/shared/types/Meal';
import { mapMeal } from './mappers';

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

export async function isFavorite(customerId: number, mealId: number) {
  const db = await getDatabase();
  const row = await db.getFirstAsync('SELECT id FROM favorites WHERE customer_id = ? AND meal_id = ?', [customerId, mealId]);
  return Boolean(row);
}

export async function listFavoriteMealIds(customerId: number): Promise<number[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{ meal_id: number }>('SELECT meal_id FROM favorites WHERE customer_id = ?', [customerId]);
  return rows.map((row) => row.meal_id);
}

export async function listFavoriteMeals(customerId: number): Promise<Meal[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync(
    `SELECT meals.*, cook_profiles.business_name as cook_name, cook_profiles.location as cook_location,
       (SELECT AVG(rating) FROM reviews WHERE reviews.cook_id = meals.cook_id) as average_rating,
       (SELECT COUNT(*) FROM reviews WHERE reviews.cook_id = meals.cook_id) as review_count
     FROM favorites
     JOIN meals ON meals.id = favorites.meal_id
     LEFT JOIN cook_profiles ON cook_profiles.user_id = meals.cook_id
     WHERE favorites.customer_id = ? AND meals.deleted_at IS NULL
     ORDER BY favorites.created_at DESC`,
    [customerId],
  );
  return rows.map(mapMeal);
}
