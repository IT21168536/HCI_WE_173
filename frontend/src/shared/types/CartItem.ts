import type { Meal } from './Meal';

export type CartItem = {
  id: number;
  customerId: number;
  mealId: number;
  quantity: number;
  meal: Meal;
};
