import { getDatabase } from '@/core/database/database';
import type { Order, OrderStatus } from '@/shared/types/Order';
import { mapOrder } from './mappers';

const validTransitions: Record<OrderStatus, OrderStatus[]> = {
  requested: ['accepted', 'cancelled'],
  accepted: ['preparing', 'cancelled'],
  preparing: ['ready', 'cancelled'],
  ready: ['picked_up', 'cancelled'],
  picked_up: ['on_the_way'],
  on_the_way: ['delivered'],
  delivered: [],
  cancelled: [],
};

const orderSelect = `
  SELECT orders.*, customers.full_name as customer_name, cooks.full_name as cook_name, cook_profiles.location as cook_location
  FROM orders
  LEFT JOIN users customers ON customers.id = orders.customer_id
  LEFT JOIN users cooks ON cooks.id = orders.cook_id
  LEFT JOIN cook_profiles ON cook_profiles.user_id = orders.cook_id
`;

export async function listOrdersForCustomer(customerId: number): Promise<Order[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync(`${orderSelect} WHERE orders.customer_id = ? ORDER BY orders.created_at DESC`, [customerId]);
  return rows.map(mapOrder);
}

export async function listOrdersForCook(cookId: number): Promise<Order[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync(`${orderSelect} WHERE orders.cook_id = ? ORDER BY orders.created_at DESC`, [cookId]);
  return rows.map(mapOrder);
}

export async function listReadyDeliveries(): Promise<Order[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync(`${orderSelect} WHERE orders.status IN ('ready','picked_up','on_the_way') ORDER BY orders.created_at ASC`);
  return rows.map(mapOrder);
}

export async function getOrderById(id: number): Promise<Order | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync(`${orderSelect} WHERE orders.id = ?`, [id]);
  return row ? mapOrder(row) : null;
}

export async function updateOrderStatus(orderId: number, nextStatus: OrderStatus, riderId?: number) {
  const order = await getOrderById(orderId);
  if (!order) {
    throw new Error('Order not found.');
  }

  if (!validTransitions[order.status].includes(nextStatus)) {
    throw new Error(`Cannot move order from ${order.status} to ${nextStatus}.`);
  }

  const db = await getDatabase();
  await db.runAsync('UPDATE orders SET status = ?, rider_id = COALESCE(?, rider_id), updated_at = ? WHERE id = ?', [
    nextStatus,
    riderId ?? null,
    new Date().toISOString(),
    orderId,
  ]);
}
