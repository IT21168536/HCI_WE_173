import type { Order, OrderStatus } from '@/shared/types/Order';
import { STATUS_LABELS } from '@/shared/types/Order';
import { Badge, type BadgeTone } from './ui';

const statusTone: Record<OrderStatus, BadgeTone> = {
  requested: 'brand',
  accepted: 'info',
  preparing: 'warning',
  ready: 'success',
  picked_up: 'info',
  on_the_way: 'info',
  delivered: 'success',
  cancelled: 'neutral',
};

type StatusBadgeProps = {
  status: OrderStatus;
  /** Shows "Cancellation requested" instead of the status while a request is open. */
  order?: Pick<Order, 'cancelStatus' | 'status'>;
};

/** Status is always written out, never shown by colour alone. */
export function StatusBadge({ status, order }: StatusBadgeProps) {
  if (order?.cancelStatus === 'requested' && order.status !== 'cancelled' && order.status !== 'delivered') {
    return <Badge label="Cancellation requested" tone="warning" />;
  }
  return <Badge label={STATUS_LABELS[status]} tone={statusTone[status]} />;
}
