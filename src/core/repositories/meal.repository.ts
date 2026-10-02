import { getDatabase } from '@/core/database/database';
import type { Meal } from '@/shared/types/Meal';
import { mapMeal } from './mappers';

type CreateMealInput = {
  cookId: number;
  name: string;
  description?: string;
  price: number;
  category?: string;
  ingredients?: string;
  allergens?: string;
  imagePath?: string;
  availableQuantity: number;
};

const mealSelect = `
  SELECT meals.*, cook_profiles.business_name as cook_name, cook_profiles.location as cook_location
  FROM meals
  LEFT JOIN cook_profiles ON cook_profiles.user_id = meals.cook_id
`;

export async function listAvailableMeals(query = ''): Promise<Meal[]> {
  const db = await getDatabase();
  const search = `%${query.trim()}%`;
  const rows = await db.getAllAsync(
    `${mealSelect}
     WHERE meals.is_available = 1
       AND meals.available_quantity > 0
       AND (? = '%%' OR meals.name LIKE ? OR meals.category LIKE ? OR cook_profiles.business_name LIKE ?)
     ORDER BY meals.created_at DESC`,
    [search, search, search, search],
  );
  return rows.map(mapMeal);
}

export async function listMealsByCook(cookId: number): Promise<Meal[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync(`${mealSelect} WHERE meals.cook_id = ? ORDER BY meals.created_at DESC`, [cookId]);
  return rows.map(mapMeal);
}

export async function getMealById(id: number): Promise<Meal | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync(`${mealSelect} WHERE meals.id = ?`, [id]);
  return row ? mapMeal(row) : null;
}

export async function createMeal(input: CreateMealInput): Promise<number> {
  const db = await getDatabase();
  const now = new Date().toISOString();
  const result = await db.runAsync(
    `INSERT INTO meals
      (cook_id, name, description, price, category, ingredients, allergens, image_path, available_quantity, is_available, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      input.cookId,
      input.name,
      input.description ?? null,
      input.price,
      input.category ?? null,
      input.ingredients ?? null,
      input.allergens ?? null,
      input.imagePath ?? null,
      input.availableQuantity,
      input.availableQuantity > 0 ? 1 : 0,
      now,
    ],
  );
  return result.lastInsertRowId;
}

export async function setMealAvailability(mealId: number, availableQuantity: number, isAvailable: boolean) {
  const db = await getDatabase();
  await db.runAsync('UPDATE meals SET available_quantity = ?, is_available = ?, updated_at = ? WHERE id = ?', [
    availableQuantity,
    isAvailable ? 1 : 0,
    new Date().toISOString(),
    mealId,
  ]);
}
