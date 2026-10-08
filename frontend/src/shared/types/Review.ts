export type Review = {
  id: number;
  orderId: number;
  customerId: number;
  cookId: number;
  mealId?: number | null;
  rating: number;
  comment?: string | null;
  createdAt: string;
  customerName?: string | null;
  mealName?: string | null;
};

export type RatingSummary = {
  average: number;
  count: number;
  /** counts for 5,4,3,2,1 stars */
  distribution: [number, number, number, number, number];
};
