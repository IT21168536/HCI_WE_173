import { getDatabase } from '@/core/database/database';

type CreateReviewInput = {
  orderId: number;
  customerId: number;
  cookId: number;
  mealId?: number;
  rating: number;
  comment?: string;
};

export async function createReview(input: CreateReviewInput) {
  const db = await getDatabase();
  await db.runAsync(
    'INSERT INTO reviews (order_id, customer_id, cook_id, meal_id, rating, comment, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [
      input.orderId,
      input.customerId,
      input.cookId,
      input.mealId ?? null,
      input.rating,
      input.comment ?? null,
      new Date().toISOString(),
    ],
  );
}
