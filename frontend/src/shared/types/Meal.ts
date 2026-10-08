export type Meal = {
  id: number;
  cookId: number;
  name: string;
  description?: string | null;
  price: number;
  category?: string | null;
  ingredients?: string | null;
  allergens?: string | null;
  imagePath?: string | null;
  availableQuantity: number;
  isAvailable: boolean;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt?: string | null;
  cookName?: string | null;
  cookLocation?: string | null;
  /** Average rating of the cook who makes this meal */
  averageRating?: number | null;
  reviewCount?: number;
  soldToday?: number;
};

export const MEAL_CATEGORIES = [
  'Rice & Curry',
  'Breakfast',
  'Lunch',
  'Dinner',
  'Vegetarian',
  'Healthy',
  'Traditional',
  'Desserts',
] as const;

export function isMealSoldOut(meal: Pick<Meal, 'availableQuantity' | 'isAvailable'>) {
  return !meal.isAvailable || meal.availableQuantity <= 0;
}
