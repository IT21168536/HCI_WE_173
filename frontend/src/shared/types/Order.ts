export type OrderStatus =
  | 'requested'
  | 'accepted'
  | 'preparing'
  | 'ready'
  | 'picked_up'
  | 'on_the_way'
  | 'delivered'
  | 'cancelled';

export type DeliveryType = 'delivery' | 'pickup';
export type PaymentMethod = 'cash' | 'card';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type CancelStatus = 'requested' | 'approved' | 'rejected';

export type Order = {
  id: number;
  customerId: number;
  cookId: number;
  riderId?: number | null;
  deliveryType: DeliveryType;
  deliveryAddress?: string | null;
  scheduledTime?: string | null;
  customerNote?: string | null;
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod?: PaymentMethod | null;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  cancelStatus?: CancelStatus | null;
  cancelReason?: string | null;
  createdAt: string;
  updatedAt?: string | null;
  deliveredAt?: string | null;
  riderDeletedAt?: string | null;
  /** Joined display fields */
  customerName?: string | null;
  customerMobile?: string | null;
  cookName?: string | null;
  cookBusinessName?: string | null;
  cookMobile?: string | null;
  cookLocation?: string | null;
  cookAddress?: string | null;
  riderName?: string | null;
  riderMobile?: string | null;
  itemsSummary?: string | null;
  itemCount?: number;
  hasReview?: boolean;
};

export const ACTIVE_STATUSES: OrderStatus[] = ['requested', 'accepted', 'preparing', 'ready', 'picked_up', 'on_the_way'];

export const STATUS_LABELS: Record<OrderStatus, string> = {
  requested: 'New',
  accepted: 'Accepted',
  preparing: 'Preparing',
  ready: 'Ready',
  picked_up: 'Picked up',
  on_the_way: 'On the way',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

/** Platform commission taken from the cook's meal subtotal. */
export const PLATFORM_FEE_RATE = 0.1;
export const DELIVERY_FEE = 250;

export function cookEarnings(order: Pick<Order, 'subtotal'>) {
  return Math.round(order.subtotal * (1 - PLATFORM_FEE_RATE));
}
