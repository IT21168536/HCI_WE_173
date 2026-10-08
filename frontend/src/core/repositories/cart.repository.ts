import { getDatabase } from '@/core/database/database';
import type { CartItem } from '@/shared/types/CartItem';
import { mapMeal } from './mappers';

export async function addToCart(customerId: number, mealId: number, quantity = 1) {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO cart_items (customer_id, meal_id, quantity)
     VALUES (?, ?, ?)
     ON CONFLICT(customer_id, meal_id) DO UPDATE SET quantity = quantity + excluded.quantity`,
    [customerId, mealId, quantity],
  );
}

export async function listCart(customerId: number): Promise<CartItem[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<Record<string, unknown>>(
    `SELECT cart_items.id as cart_id, cart_items.customer_id, cart_items.quantity as cart_quantity,
       meals.*, cook_profiles.business_name as cook_name, cook_profiles.location as cook_location
     FROM cart_items
     JOIN meals ON meals.id = cart_items.meal_id
     LEFT JOIN cook_profiles ON cook_profiles.user_id = meals.cook_id
     WHERE cart_items.customer_id = ? AND meals.deleted_at IS NULL
     ORDER BY cook_profiles.business_name, meals.name`,
    [customerId],
  );

  return rows.map((row) => ({
    id: row.cart_id as number,
    customerId: row.customer_id as number,
    mealId: row.id as number,
    quantity: row.cart_quantity as number,
    meal: mapMeal(row),
  }));
}

export async function setCartQuantity(customerId: number, mealId: number, quantity: number) {
  const db = await getDatabase();
  if (quantity <= 0) {
    await removeFromCart(customerId, mealId);
    return;
  }
  await db.runAsync('UPDATE cart_items SET quantity = ? WHERE customer_id = ? AND meal_id = ?', [quantity, customerId, mealId]);
}

export async function removeFromCart(customerId: number, mealId: number) {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM cart_items WHERE customer_id = ? AND meal_id = ?', [customerId, mealId]);
}

export async function clearCart(customerId: number) {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM cart_items WHERE customer_id = ?', [customerId]);
}

export async function countCartItems(customerId: number): Promise<number> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ count: number }>(
    `SELECT COALESCE(SUM(cart_items.quantity), 0) as count FROM cart_items
     JOIN meals ON meals.id = cart_items.meal_id
     WHERE cart_items.customer_id = ? AND meals.deleted_at IS NULL`,
    [customerId],
  );
  return row?.count ?? 0;
}
