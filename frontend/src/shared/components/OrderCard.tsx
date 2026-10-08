import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Order } from '@/shared/types/Order';
import { colors } from '@/shared/theme/colors';
import { radius } from '@/shared/theme/radius';
import { spacing } from '@/shared/theme/spacing';
import { typography } from '@/shared/theme/typography';
import { formatCurrency } from '@/shared/utils/formatCurrency';
import { formatShortDateTime, formatTime, isFuture } from '@/shared/utils/dateUtils';
import { Icon } from './Icon';
import { StatusBadge } from './StatusBadge';

type OrderCardProps = {
  order: Order;
  /** Whose point of view: decides which name, time and amount the card shows. */
  perspective: 'customer' | 'cook' | 'rider';
  onPress?: () => void;
  /** Extra controls under the card, e.g. Accept / Decline. */
  children?: ReactNode;
  amount?: number;
};

export function orderNumber(id: number) {
  return `#WK${String(1000 + id)}`;
}

function timeLine(order: Order, perspective: OrderCardProps['perspective']) {
  if (order.status === 'delivered') {
    return `Delivered ${formatShortDateTime(order.deliveredAt ?? order.updatedAt)}`;
  }
  if (order.status === 'cancelled') {
    return `Cancelled ${formatShortDateTime(order.updatedAt)}`;
  }
  if (isFuture(order.scheduledTime)) {
    return `Scheduled ${formatShortDateTime(order.scheduledTime)}`;
  }
  if (perspective === 'rider') {
    return order.status === 'ready' ? 'Ready for pickup now' : `Picked up ${formatTime(order.updatedAt ?? order.createdAt)}`;
  }
  return `Placed ${formatShortDateTime(order.createdAt)}`;
}

export function OrderCard({ order, perspective, onPress, children, amount }: OrderCardProps) {
  const who =
    perspective === 'customer'
      ? order.cookBusinessName ?? order.cookName
      : perspective === 'cook'
        ? order.customerName
        : `${order.cookBusinessName ?? order.cookName} → ${order.customerName}`;
  const value = amount ?? (perspective === 'customer' ? order.total : perspective === 'rider' ? order.deliveryFee : order.subtotal);

  const body = (
    <>
      <View style={styles.header}>
        <Text style={styles.title}>{orderNumber(order.id)}</Text>
        <StatusBadge status={order.status} order={order} />
      </View>
      <Text style={styles.meta} numberOfLines={2}>
        {who} · {order.itemsSummary ?? `${order.itemCount} items`}
      </Text>
      <View style={styles.header}>
        <View style={styles.time}>
          <Icon name={order.deliveryType === 'pickup' ? 'bag-handle-outline' : 'time-outline'} size={14} color={colors.muted} />
          <Text style={styles.meta}>
            {order.deliveryType === 'pickup' && perspective !== 'rider' ? 'Pickup · ' : ''}
            {timeLine(order, perspective)}
          </Text>
        </View>
        <Text style={styles.total}>{formatCurrency(value)}</Text>
      </View>
    </>
  );

  return (
    <View style={styles.card}>
      {onPress ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Open order ${orderNumber(order.id)}`}
          onPress={onPress}
          style={({ pressed }) => [styles.body, pressed && styles.pressed]}
        >
          {body}
        </Pressable>
      ) : (
        <View style={styles.body}>{body}</View>
      )}
      {children ? <View style={styles.actions}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.md,
    padding: 14,
  },
  body: {
    gap: spacing.sm,
  },
  pressed: {
    opacity: 0.85,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  title: {
    ...typography.cardTitle,
    color: colors.ink,
    fontWeight: '700',
  },
  meta: {
    ...typography.caption,
    color: colors.muted,
    flexShrink: 1,
  },
  time: {
    alignItems: 'center',
    flexDirection: 'row',
    flexShrink: 1,
    gap: 6,
  },
  total: {
    ...typography.cardTitle,
    color: colors.brandText,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
});
