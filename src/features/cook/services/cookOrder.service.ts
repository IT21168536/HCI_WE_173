import { listOrdersForCook, updateOrderStatus } from '@/core/repositories/order.repository';
import type { OrderStatus } from '@/shared/types/Order';

export async function getCookOrders(cookId: number) {
  return listOrdersForCook(cookId);
}

export async function moveCookOrder(orderId: number, nextStatus: Extract<OrderStatus, 'accepted' | 'preparing' | 'ready' | 'cancelled'>) {
  return updateOrderStatus(orderId, nextStatus);
}
