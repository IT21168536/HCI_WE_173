import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Order } from '@/shared/types/Order';
import { colors } from '@/shared/theme/colors';
import { radius } from '@/shared/theme/radius';
import { spacing } from '@/shared/theme/spacing';
import { typography } from '@/shared/theme/typography';
import { formatCurrency } from '@/shared/utils/formatCurrency';
import { formatShortDateTime } from '@/shared/utils/dateUtils';
import { StatusBadge } from './StatusBadge';

type OrderCardProps = {
  order: Order;
  onPress?: () => void;
};

export function OrderCard({ order, onPress }: OrderCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open order ${order.id}`}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Order #{order.id}</Text>
        <StatusBadge status={order.status} />
      </View>
      <Text style={styles.meta}>Cook: {order.cookName ?? order.cookId}</Text>
      <Text style={styles.meta}>Scheduled: {formatShortDateTime(order.scheduledTime)}</Text>
      <Text style={styles.total}>{formatCurrency(order.total)}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.lg,
  },
  pressed: {
    opacity: 0.85,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: {
    ...typography.cardTitle,
    color: colors.ink,
  },
  meta: {
    ...typography.body,
    color: colors.muted,
  },
  total: {
    ...typography.cardTitle,
    color: colors.brandDark,
  },
});
