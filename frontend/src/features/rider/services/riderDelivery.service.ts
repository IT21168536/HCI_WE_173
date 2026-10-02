import { listReadyDeliveries, updateOrderStatus } from '@/core/repositories/order.repository';
import type { OrderStatus } from '@/shared/types/Order';

export async function getAvailableDeliveries() {
  return listReadyDeliveries();
}

export async function moveRiderDelivery(
  orderId: number,
  riderId: number,
  nextStatus: Extract<OrderStatus, 'picked_up' | 'on_the_way' | 'delivered'>,
) {
  return updateOrderStatus(orderId, nextStatus, riderId);
}
