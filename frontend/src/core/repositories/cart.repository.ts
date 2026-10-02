import { getDatabase } from '@/core/database/database';

export async function addToCart(customerId: number, mealId: number, quantity = 1) {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO cart_items (customer_id, meal_id, quantity)
     VALUES (?, ?, ?)
     ON CONFLICT(customer_id, meal_id) DO UPDATE SET quantity = quantity + excluded.quantity`,
    [customerId, mealId, quantity],
  );
}

export async function clearCart(customerId: number) {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM cart_items WHERE customer_id = ?', [customerId]);
}

export async function countCartItems(customerId: number): Promise<number> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ count: number }>('SELECT COALESCE(SUM(quantity), 0) as count FROM cart_items WHERE customer_id = ?', [
    customerId,
  ]);
  return row?.count ?? 0;
}
