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

export type Order = {
  id: number;
  customerId: number;
  cookId: number;
  riderId?: number | null;
  deliveryType: DeliveryType;
  deliveryAddress?: string | null;
  scheduledTime?: string | null;
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod?: string | null;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  status: OrderStatus;
  createdAt: string;
  updatedAt?: string | null;
  customerName?: string | null;
  cookName?: string | null;
  cookLocation?: string | null;
};
