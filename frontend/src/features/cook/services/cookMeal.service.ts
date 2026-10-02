import { createMeal, listMealsByCook, setMealAvailability } from '@/core/repositories/meal.repository';

export async function getCookMeals(cookId: number) {
  return listMealsByCook(cookId);
}

export { createMeal, setMealAvailability };
