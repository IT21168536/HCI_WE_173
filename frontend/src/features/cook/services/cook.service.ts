/**
 * Home cook feature API (Member 2). Screens in app/(cook) call these.
 */
import { updateOrderStatus } from '@/core/repositories/order.repository';
import type { Order, OrderStatus } from '@/shared/types/Order';

export {
  listMealsByCook as getCookMeals,
  getMealById as getMeal,
  createMeal,
  updateMeal,
  deleteMeal,
  setMealAvailability,
} from '@/core/repositories/meal.repository';
export type { MealInput } from '@/core/repositories/meal.repository';
export {
  getCookProfile,
  upsertCookProfile,
  setCookOpen,
  getCookStats,
  getCookDailySales,
  getCookSalesSince,
  getCookTopMeals,
} from '@/core/repositories/cook.repository';
export {
  listOrdersForCook as getCookOrders,
  getOrderById as getOrder,
  listOrderItems as getOrderItems,
  updateOrderStatus,
  resolveCancellation,
} from '@/core/repositories/order.repository';
export { listReviewsForCook, getRatingSummary } from '@/core/repositories/review.repository';


/** The single next step a cook can take on an order, if any. */
export function nextCookAction(order: Order): { status: OrderStatus; label: string } | null {
  if (order.cancelStatus === 'requested') return null;
  switch (order.status) {
    case 'requested':
      return { status: 'accepted', label: 'Accept order' };
    case 'accepted':
      return { status: 'preparing', label: 'Start preparing' };
    case 'preparing':
      return { status: 'ready', label: order.deliveryType === 'pickup' ? 'Ready for collection' : 'Mark ready for pickup' };
    case 'ready':
      return order.deliveryType === 'pickup' ? { status: 'delivered', label: 'Customer collected' } : null;
    default:
      return null;
  }
}

export function moveCookOrder(orderId: number, status: OrderStatus) {
  return updateOrderStatus(orderId, status);
}
