/**
 * Customer feature API (Member 1). Screens in app/(customer) call these
 * instead of reaching into repositories directly.
 */
export { listAvailableMeals as getCustomerMeals, getMealById as getMeal, listMealsByCook as getCookMeals } from '@/core/repositories/meal.repository';
export type { MealFilters } from '@/core/repositories/meal.repository';
export { getCookProfile } from '@/core/repositories/cook.repository';
export { addToCart, listCart, setCartQuantity, removeFromCart, countCartItems } from '@/core/repositories/cart.repository';
export { toggleFavorite, isFavorite, listFavoriteMeals, listFavoriteMealIds } from '@/core/repositories/favorite.repository';
export {
  placeOrdersFromCart as placeOrder,
  listOrdersForCustomer as getCustomerOrders,
  getOrderById as getOrder,
  listOrderItems as getOrderItems,
  cancelOrderByCustomer,
} from '@/core/repositories/order.repository';
export { createReview, getReviewForOrder, listReviewsForCook, getRatingSummary } from '@/core/repositories/review.repository';
