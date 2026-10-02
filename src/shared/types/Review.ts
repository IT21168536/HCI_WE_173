export type Review = {
  id: number;
  orderId: number;
  customerId: number;
  cookId: number;
  mealId?: number | null;
  rating: number;
  comment?: string | null;
  createdAt: string;
};
