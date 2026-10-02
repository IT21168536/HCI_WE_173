import { addToCart } from '@/core/repositories/cart.repository';
import { listAvailableMeals } from '@/core/repositories/meal.repository';

export async function getCustomerMeals(search = '') {
  return listAvailableMeals(search);
}

export async function addMealToCustomerCart(customerId: number, mealId: number) {
  return addToCart(customerId, mealId, 1);
}
