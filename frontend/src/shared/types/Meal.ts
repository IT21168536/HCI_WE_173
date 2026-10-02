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
  createdAt: string;
  updatedAt?: string | null;
  cookName?: string | null;
  cookLocation?: string | null;
  averageRating?: number | null;
};
