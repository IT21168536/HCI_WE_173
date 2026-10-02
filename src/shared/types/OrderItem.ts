export type OrderItem = {
  id: number;
  orderId: number;
  mealId: number;
  quantity: number;
  unitPrice: number;
  mealName?: string | null;
};
