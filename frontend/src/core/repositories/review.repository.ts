import { getDatabase } from '@/core/database/database';
import type { RatingSummary, Review } from '@/shared/types/Review';
import { mapReview } from './mappers';
import { getOrderById, listOrderItems } from './order.repository';

type CreateReviewInput = {
  orderId: number;
  customerId: number;
  rating: number;
  comment?: string;
};

export async function createReview(input: CreateReviewInput) {
  const order = await getOrderById(input.orderId);
  if (!order || order.customerId !== input.customerId) {
    throw new Error('Order not found.');
  }
  if (order.status !== 'delivered') {
    throw new Error('You can review an order after it is delivered.');
  }
  if (input.rating < 1 || input.rating > 5) {
    throw new Error('Choose a rating from 1 to 5 stars.');
  }

  if (await getReviewForOrder(order.id)) {
    throw new Error('You have already reviewed this order.');
  }

  const [firstItem] = await listOrderItems(order.id);
  const db = await getDatabase();
  await db.runAsync(
    'INSERT INTO reviews (order_id, customer_id, cook_id, meal_id, rating, comment, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [order.id, input.customerId, order.cookId, firstItem?.mealId ?? null, Math.round(input.rating), input.comment?.trim() || null, new Date().toISOString()],
  );
}

export async function getReviewForOrder(orderId: number): Promise<Review | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync('SELECT * FROM reviews WHERE order_id = ?', [orderId]);
  return row ? mapReview(row) : null;
}

export async function listReviewsForCook(cookId: number, limit = 50): Promise<Review[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync(
    `SELECT reviews.*, users.full_name as customer_name, meals.name as meal_name
     FROM reviews
     LEFT JOIN users ON users.id = reviews.customer_id
     LEFT JOIN meals ON meals.id = reviews.meal_id
     WHERE reviews.cook_id = ?
     ORDER BY reviews.created_at DESC
     LIMIT ?`,
    [cookId, limit],
  );
  return rows.map(mapReview);
}

export async function getRatingSummary(cookId: number): Promise<RatingSummary> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{ rating: number; count: number }>(
    'SELECT rating, COUNT(*) as count FROM reviews WHERE cook_id = ? GROUP BY rating',
    [cookId],
  );

  const distribution: RatingSummary['distribution'] = [0, 0, 0, 0, 0];
  let total = 0;
  let count = 0;
  for (const row of rows) {
    distribution[5 - row.rating] = row.count;
    total += row.rating * row.count;
    count += row.count;
  }

  return { average: count ? total / count : 0, count, distribution };
}
