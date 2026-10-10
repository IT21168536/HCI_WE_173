import { getDatabase } from '@/core/database/database';
import { MEAL_CATEGORIES, type Meal } from '@/shared/types/Meal';
import { mapMeal } from './mappers';

export type MealInput = {
  name: string;
  description?: string | null;
  price: number;
  category?: string | null;
  ingredients?: string | null;
  allergens?: string | null;
  imagePath?: string | null;
  availableQuantity: number;
  isAvailable: boolean;
};

export type MealErrors = Partial<Record<'name' | 'category' | 'price' | 'quantity' | 'description' | 'ingredients' | 'allergens', string>>;

export function validateMealInput(input: MealInput): MealErrors {
  const errors: MealErrors = {};
  const name = input.name.trim();
  const description = input.description?.trim() ?? '';
  const ingredients = input.ingredients?.trim() ?? '';
  if (name.length < 3 || name.length > 60) errors.name = 'Use 3–60 characters for the meal name.';
  if (!input.category || !MEAL_CATEGORIES.includes(input.category as (typeof MEAL_CATEGORIES)[number])) errors.category = 'Choose a valid category.';
  if (!Number.isFinite(input.price) || input.price <= 0 || input.price > 100000) errors.price = 'Enter a price from Rs. 1 to Rs. 100,000.';
  if (!Number.isInteger(input.availableQuantity) || input.availableQuantity < 0 || input.availableQuantity > 999) errors.quantity = 'Enter a whole number from 0 to 999.';
  if (description.length < 10 || description.length > 300) errors.description = 'Use 10–300 characters for the description.';
  if (ingredients.length < 3 || ingredients.length > 300) errors.ingredients = 'List the main ingredients (3–300 characters).';
  if ((input.allergens?.trim().length ?? 0) > 150) errors.allergens = 'Use 150 characters or fewer.';
  return errors;
}

function assertValidMeal(input: MealInput) {
  const firstError = Object.values(validateMealInput(input))[0];
  if (firstError) throw new Error(firstError);
}

export type MealFilters = {
  query?: string;
  category?: string | null;
  maxPrice?: number | null;
  location?: string | null;
  sort?: 'newest' | 'price_low' | 'price_high' | 'rating';
};

const mealSelect = `
  SELECT meals.*, cook_profiles.business_name as cook_name, cook_profiles.location as cook_location,
    (SELECT AVG(rating) FROM reviews WHERE reviews.cook_id = meals.cook_id) as average_rating,
    (SELECT COUNT(*) FROM reviews WHERE reviews.cook_id = meals.cook_id) as review_count
  FROM meals
  LEFT JOIN cook_profiles ON cook_profiles.user_id = meals.cook_id
`;

const sortSql: Record<NonNullable<MealFilters['sort']>, string> = {
  newest: 'meals.created_at DESC',
  price_low: 'meals.price ASC',
  price_high: 'meals.price DESC',
  rating: 'average_rating DESC NULLS LAST, meals.created_at DESC',
};

/** Meals customers can order right now: not deleted, in stock and from an open kitchen. */
export async function listAvailableMeals(filters: MealFilters = {}): Promise<Meal[]> {
  const db = await getDatabase();
  const where = [
    'meals.deleted_at IS NULL',
    'meals.is_available = 1',
    'meals.available_quantity > 0',
    'COALESCE(cook_profiles.is_open, 1) = 1',
  ];
  const params: (string | number)[] = [];

  const query = filters.query?.trim();
  if (query) {
    const like = `%${query}%`;
    where.push('(meals.name LIKE ? OR meals.category LIKE ? OR meals.ingredients LIKE ? OR cook_profiles.business_name LIKE ?)');
    params.push(like, like, like, like);
  }
  if (filters.category) {
    where.push('meals.category = ?');
    params.push(filters.category);
  }
  if (filters.maxPrice) {
    where.push('meals.price <= ?');
    params.push(filters.maxPrice);
  }
  if (filters.location?.trim()) {
    where.push('cook_profiles.location LIKE ?');
    params.push(`%${filters.location.trim()}%`);
  }

  const rows = await db.getAllAsync(
    `${mealSelect} WHERE ${where.join(' AND ')} ORDER BY ${sortSql[filters.sort ?? 'newest']}`,
    params,
  );
  return rows.map(mapMeal);
}

export async function listMealsByCook(cookId: number, options: { onlyOrderable?: boolean } = {}): Promise<Meal[]> {
  const db = await getDatabase();
  const startOfToday = new Date(new Date().setHours(0, 0, 0, 0)).toISOString();
  const orderable = options.onlyOrderable ? 'AND meals.is_available = 1 AND meals.available_quantity > 0' : '';
  const rows = await db.getAllAsync(
    `SELECT base.*,
       (SELECT COALESCE(SUM(order_items.quantity), 0) FROM order_items JOIN orders ON orders.id = order_items.order_id
        WHERE order_items.meal_id = base.id AND orders.status != 'cancelled' AND orders.created_at >= ?) as sold_today
     FROM (${mealSelect} WHERE meals.cook_id = ? AND meals.deleted_at IS NULL ${orderable}) base
     ORDER BY base.is_available DESC, base.name`,
    [startOfToday, cookId],
  );
  return rows.map(mapMeal);
}

export async function getMealById(id: number): Promise<Meal | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync(`${mealSelect} WHERE meals.id = ?`, [id]);
  return row ? mapMeal(row) : null;
}

export async function listMealCategories(): Promise<string[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{ category: string }>(
    `SELECT DISTINCT category FROM meals WHERE category IS NOT NULL AND deleted_at IS NULL ORDER BY category`,
  );
  return rows.map((row) => row.category);
}

export async function createMeal(cookId: number, input: MealInput): Promise<number> {
  assertValidMeal(input);
  const db = await getDatabase();
  const now = new Date().toISOString();
  const result = await db.runAsync(
    `INSERT INTO meals
      (cook_id, name, description, price, category, ingredients, allergens, image_path, available_quantity, is_available, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      cookId,
      input.name.trim(),
      input.description?.trim() || null,
      input.price,
      input.category || null,
      input.ingredients?.trim() || null,
      input.allergens?.trim() || null,
      input.imagePath ?? null,
      input.availableQuantity,
      input.isAvailable && input.availableQuantity > 0 ? 1 : 0,
      now,
      now,
    ],
  );
  return result.lastInsertRowId;
}

export async function updateMeal(mealId: number, input: MealInput) {
  assertValidMeal(input);
  const db = await getDatabase();
  await db.runAsync(
    `UPDATE meals SET name = ?, description = ?, price = ?, category = ?, ingredients = ?, allergens = ?, image_path = ?,
       available_quantity = ?, is_available = ?, updated_at = ?
     WHERE id = ?`,
    [
      input.name.trim(),
      input.description?.trim() || null,
      input.price,
      input.category || null,
      input.ingredients?.trim() || null,
      input.allergens?.trim() || null,
      input.imagePath ?? null,
      input.availableQuantity,
      input.isAvailable && input.availableQuantity > 0 ? 1 : 0,
      new Date().toISOString(),
      mealId,
    ],
  );
}

export async function setMealAvailability(mealId: number, availableQuantity: number, isAvailable: boolean) {
  const db = await getDatabase();
  const quantity = Math.max(0, Math.floor(availableQuantity));
  await db.runAsync('UPDATE meals SET available_quantity = ?, is_available = ?, updated_at = ? WHERE id = ?', [
    quantity,
    isAvailable && quantity > 0 ? 1 : 0,
    new Date().toISOString(),
    mealId,
  ]);
}

/**
 * Meals are soft-deleted so past orders keep their history.
 * The meal also leaves every customer's cart and favourites.
 */
export async function deleteMeal(mealId: number) {
  const db = await getDatabase();
  await db.withTransactionAsync(async () => {
    const now = new Date().toISOString();
    await db.runAsync('UPDATE meals SET deleted_at = ?, is_available = 0, updated_at = ? WHERE id = ?', [now, now, mealId]);
    await db.runAsync('DELETE FROM cart_items WHERE meal_id = ?', [mealId]);
    await db.runAsync('DELETE FROM favorites WHERE meal_id = ?', [mealId]);
  });
}
