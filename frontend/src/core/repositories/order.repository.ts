import type * as SQLite from 'expo-sqlite';
import { getDatabase } from '@/core/database/database';
import type { DeliveryType, Order, OrderStatus, PaymentMethod } from '@/shared/types/Order';
import { DELIVERY_FEE } from '@/shared/types/Order';
import type { OrderItem } from '@/shared/types/OrderItem';
import { isAddress, isTextWithin } from '@/shared/utils/validators';
import { mapOrder, mapOrderItem } from './mappers';

const validTransitions: Record<OrderStatus, OrderStatus[]> = {
  requested: ['accepted', 'cancelled'],
  accepted: ['preparing', 'cancelled'],
  preparing: ['ready', 'cancelled'],
  ready: ['picked_up', 'delivered', 'cancelled'],
  picked_up: ['on_the_way'],
  on_the_way: ['delivered'],
  delivered: [],
  cancelled: [],
};

const orderSelect = `
  SELECT orders.*,
    customers.full_name as customer_name, customers.mobile as customer_mobile,
    cooks.full_name as cook_name, cooks.mobile as cook_mobile, cooks.address as cook_address,
    cook_profiles.business_name as cook_business_name, cook_profiles.location as cook_location,
    riders.full_name as rider_name, riders.mobile as rider_mobile,
    (SELECT GROUP_CONCAT(meals.name || ' ×' || order_items.quantity, ', ')
       FROM order_items JOIN meals ON meals.id = order_items.meal_id
      WHERE order_items.order_id = orders.id) as items_summary,
    (SELECT COALESCE(SUM(order_items.quantity), 0) FROM order_items WHERE order_items.order_id = orders.id) as item_count,
    (SELECT COUNT(*) FROM reviews WHERE reviews.order_id = orders.id) as review_count
  FROM orders
  LEFT JOIN users customers ON customers.id = orders.customer_id
  LEFT JOIN users cooks ON cooks.id = orders.cook_id
  LEFT JOIN cook_profiles ON cook_profiles.user_id = orders.cook_id
  LEFT JOIN users riders ON riders.id = orders.rider_id
`;

/* ---------- Reads ---------- */

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

/** Ready delivery orders that no rider has taken yet. */
export async function listAvailableDeliveries(): Promise<Order[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync(
    `${orderSelect}
     WHERE orders.status = 'ready' AND orders.delivery_type = 'delivery' AND orders.rider_id IS NULL
     ORDER BY orders.updated_at ASC`,
  );
  return rows.map(mapOrder);
}

/** Deliveries this rider has accepted and not finished yet. */
export async function listActiveDeliveriesForRider(riderId: number): Promise<Order[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync(
    `${orderSelect}
     WHERE orders.rider_id = ? AND orders.status IN ('ready','picked_up','on_the_way')
     ORDER BY orders.updated_at ASC`,
    [riderId],
  );
  return rows.map(mapOrder);
}

export async function listRiderHistory(riderId: number): Promise<Order[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync(
    `${orderSelect}
     WHERE orders.rider_id = ? AND orders.status IN ('delivered','cancelled') AND orders.rider_deleted_at IS NULL
     ORDER BY COALESCE(orders.delivered_at, orders.updated_at) DESC`,
    [riderId],
  );
  return rows.map(mapOrder);
}

/** Hides a completed delivery from the rider only; the shared order remains for customers, cooks, payments and reviews. */
export async function deleteRiderHistoryEntry(orderId: number, riderId: number): Promise<void> {
  const db = await getDatabase();
  const result = await db.runAsync(
    `UPDATE orders SET rider_deleted_at = ?
     WHERE id = ? AND rider_id = ? AND status = 'delivered' AND rider_deleted_at IS NULL`,
    [new Date().toISOString(), orderId, riderId],
  );
  if (result.changes === 0) throw new Error('Completed delivery not found.');
}

export async function getOrderById(id: number): Promise<Order | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync(`${orderSelect} WHERE orders.id = ?`, [id]);
  return row ? mapOrder(row) : null;
}

export async function listOrderItems(orderId: number): Promise<OrderItem[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync(
    `SELECT order_items.*, meals.name as meal_name FROM order_items
     JOIN meals ON meals.id = order_items.meal_id
     WHERE order_items.order_id = ? ORDER BY order_items.id`,
    [orderId],
  );
  return rows.map(mapOrderItem);
}

export type RiderStats = { assigned: number; active: number; completedToday: number; earningsToday: number };

export async function getRiderStats(riderId: number): Promise<RiderStats> {
  const db = await getDatabase();
  const today = new Date(new Date().setHours(0, 0, 0, 0)).toISOString();
  const row = await db.getFirstAsync<{ assigned: number; active: number; completed: number; earnings: number | null }>(
    `SELECT
       SUM(CASE WHEN status = 'ready' THEN 1 ELSE 0 END) as assigned,
       SUM(CASE WHEN status IN ('picked_up','on_the_way') THEN 1 ELSE 0 END) as active,
       SUM(CASE WHEN status = 'delivered' AND delivered_at >= ? THEN 1 ELSE 0 END) as completed,
       SUM(CASE WHEN status = 'delivered' AND delivered_at >= ? THEN delivery_fee ELSE 0 END) as earnings
     FROM orders WHERE rider_id = ?`,
    [today, today, riderId],
  );
  return {
    assigned: row?.assigned ?? 0,
    active: row?.active ?? 0,
    completedToday: row?.completed ?? 0,
    earningsToday: row?.earnings ?? 0,
  };
}

/* ---------- Checkout ---------- */

export type PlaceOrderInput = {
  deliveryType: DeliveryType;
  deliveryAddress?: string | null;
  scheduledTime?: string | null;
  paymentMethod: PaymentMethod;
  note?: string | null;
};

type CartRow = {
  meal_id: number;
  quantity: number;
  name: string;
  price: number;
  cook_id: number;
  available_quantity: number;
  is_available: number;
  deleted_at: string | null;
  is_open: number | null;
};

/**
 * Turns the customer's cart into one order per cook, reserves the portions
 * and empties the cart. Everything happens in one transaction, so a sold-out
 * meal leaves the cart and the menu unchanged.
 */
export async function placeOrdersFromCart(customerId: number, input: PlaceOrderInput): Promise<number[]> {
  if (input.deliveryType === 'delivery' && !isAddress(input.deliveryAddress ?? '')) {
    throw new Error('Enter a complete delivery address (5–120 characters), or choose pickup.');
  }
  if (!isTextWithin(input.note, 200)) throw new Error('Order note must be 200 characters or fewer.');

  const db = await getDatabase();
  const orderIds: number[] = [];

  await db.withTransactionAsync(async () => {
    const cart = await db.getAllAsync<CartRow>(
      `SELECT cart_items.meal_id, cart_items.quantity, meals.name, meals.price, meals.cook_id,
         meals.available_quantity, meals.is_available, meals.deleted_at, cook_profiles.is_open
       FROM cart_items
       JOIN meals ON meals.id = cart_items.meal_id
       LEFT JOIN cook_profiles ON cook_profiles.user_id = meals.cook_id
       WHERE cart_items.customer_id = ?`,
      [customerId],
    );

    if (cart.length === 0) {
      throw new Error('Your cart is empty.');
    }

    for (const item of cart) {
      if (item.deleted_at || item.is_available !== 1 || item.is_open === 0) {
        throw new Error(`${item.name} is not available right now. Remove it from your cart to continue.`);
      }
      if (item.available_quantity < item.quantity) {
        throw new Error(
          item.available_quantity <= 0
            ? `${item.name} is sold out for today.`
            : `Only ${item.available_quantity} portions of ${item.name} are left.`,
        );
      }
    }

    const byCook = new Map<number, CartRow[]>();
    for (const item of cart) {
      byCook.set(item.cook_id, [...(byCook.get(item.cook_id) ?? []), item]);
    }

    const now = new Date().toISOString();
    for (const [cookId, items] of byCook) {
      const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const deliveryFee = input.deliveryType === 'delivery' ? DELIVERY_FEE : 0;
      const result = await db.runAsync(
        `INSERT INTO orders
          (customer_id, cook_id, delivery_type, delivery_address, scheduled_time, customer_note, subtotal, delivery_fee, total,
           payment_method, payment_status, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'requested', ?, ?)`,
        [
          customerId,
          cookId,
          input.deliveryType,
          input.deliveryType === 'delivery' ? input.deliveryAddress?.trim() ?? null : null,
          input.scheduledTime ?? null,
          input.note?.trim() || null,
          subtotal,
          deliveryFee,
          subtotal + deliveryFee,
          input.paymentMethod,
          input.paymentMethod === 'card' ? 'paid' : 'pending',
          now,
          now,
        ],
      );

      for (const item of items) {
        await db.runAsync('INSERT INTO order_items (order_id, meal_id, quantity, unit_price) VALUES (?, ?, ?, ?)', [
          result.lastInsertRowId,
          item.meal_id,
          item.quantity,
          item.price,
        ]);
        await db.runAsync('UPDATE meals SET available_quantity = available_quantity - ?, updated_at = ? WHERE id = ?', [
          item.quantity,
          now,
          item.meal_id,
        ]);
      }
      orderIds.push(result.lastInsertRowId);
    }

    await db.runAsync('DELETE FROM cart_items WHERE customer_id = ?', [customerId]);
  });

  return orderIds;
}

/* ---------- Status changes ---------- */

async function restorePortions(db: SQLite.SQLiteDatabase, orderId: number) {
  await db.runAsync(
    `UPDATE meals SET available_quantity = available_quantity +
       (SELECT COALESCE(SUM(quantity), 0) FROM order_items WHERE order_items.order_id = ? AND order_items.meal_id = meals.id)
     WHERE id IN (SELECT meal_id FROM order_items WHERE order_id = ?)`,
    [orderId, orderId],
  );
}

async function cancelOrder(db: SQLite.SQLiteDatabase, order: Order, reason: string | null, cancelStatus: string | null) {
  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `UPDATE orders SET status = 'cancelled', cancel_status = ?, cancel_reason = COALESCE(?, cancel_reason),
         payment_status = CASE WHEN payment_status = 'paid' THEN 'refunded' ELSE payment_status END, updated_at = ?
       WHERE id = ?`,
      [cancelStatus, reason, new Date().toISOString(), order.id],
    );
    await restorePortions(db, order.id);
  });
}

async function requireOrder(orderId: number) {
  const order = await getOrderById(orderId);
  if (!order) {
    throw new Error('Order not found.');
  }
  return order;
}

export async function updateOrderStatus(orderId: number, nextStatus: OrderStatus, riderId?: number) {
  const order = await requireOrder(orderId);

  if (!validTransitions[order.status].includes(nextStatus)) {
    throw new Error(`This order is already ${order.status.replace(/_/g, ' ')}.`);
  }
  if (order.status === 'ready' && nextStatus === 'delivered' && order.deliveryType !== 'pickup') {
    throw new Error('A rider must pick up and deliver this order.');
  }
  if (order.status === 'ready' && nextStatus === 'picked_up' && order.deliveryType !== 'delivery') {
    throw new Error('The customer collects this order from the kitchen.');
  }
  if (riderId && order.riderId && order.riderId !== riderId) {
    throw new Error('Another rider is handling this delivery.');
  }

  const db = await getDatabase();
  if (nextStatus === 'cancelled') {
    await cancelOrder(db, order, 'Cook declined the order.', null);
    return;
  }

  const now = new Date().toISOString();
  await db.runAsync(
    `UPDATE orders SET status = ?, rider_id = COALESCE(?, rider_id), updated_at = ?,
       delivered_at = CASE WHEN ? = 'delivered' THEN ? ELSE delivered_at END,
       payment_status = CASE WHEN ? = 'delivered' THEN 'paid' ELSE payment_status END
     WHERE id = ?`,
    [nextStatus, riderId ?? null, now, nextStatus, now, nextStatus, orderId],
  );
}

/** A rider takes a ready delivery that nobody has claimed yet. */
export async function claimDelivery(orderId: number, riderId: number) {
  const db = await getDatabase();
  const result = await db.runAsync(
    `UPDATE orders SET rider_id = ?, updated_at = ?
     WHERE id = ? AND status = 'ready' AND delivery_type = 'delivery' AND rider_id IS NULL`,
    [riderId, new Date().toISOString(), orderId],
  );
  if (result.changes === 0) {
    throw new Error('Another rider already took this delivery.');
  }
}

/**
 * Customer cancels. A brand-new order is cancelled straight away; once the cook
 * has accepted it, the customer can only ask, and the cook decides.
 */
export async function cancelOrderByCustomer(orderId: number, customerId: number, reason: string) {
  const order = await requireOrder(orderId);
  if (order.customerId !== customerId) {
    throw new Error('This order belongs to another account.');
  }

  const db = await getDatabase();
  if (order.status === 'requested') {
    await cancelOrder(db, order, reason || 'Cancelled by customer.', 'approved');
    return 'cancelled' as const;
  }

  if (order.status === 'accepted' || order.status === 'preparing') {
    if (order.cancelStatus === 'requested') {
      throw new Error('You have already asked to cancel this order.');
    }
    await db.runAsync("UPDATE orders SET cancel_status = 'requested', cancel_reason = ?, updated_at = ? WHERE id = ?", [
      reason || 'Customer asked to cancel.',
      new Date().toISOString(),
      orderId,
    ]);
    return 'requested' as const;
  }

  throw new Error('This order can no longer be cancelled.');
}

export async function resolveCancellation(orderId: number, approve: boolean) {
  const order = await requireOrder(orderId);
  if (order.cancelStatus !== 'requested' || order.status === 'cancelled' || order.status === 'delivered') {
    throw new Error('There is no open cancellation request on this order.');
  }

  const db = await getDatabase();
  if (approve) {
    await cancelOrder(db, order, null, 'approved');
    return;
  }

  await db.runAsync("UPDATE orders SET cancel_status = 'rejected', updated_at = ? WHERE id = ?", [new Date().toISOString(), orderId]);
}
