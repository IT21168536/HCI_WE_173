import { StyleSheet, Text, View } from 'react-native';
import type { OrderStatus } from '@/shared/types/Order';
import { colors } from '@/shared/theme/colors';
import { radius } from '@/shared/theme/radius';
import { spacing } from '@/shared/theme/spacing';
import { typography } from '@/shared/theme/typography';

const statusColor: Record<OrderStatus, string> = {
  requested: colors.info,
  accepted: colors.warning,
  preparing: colors.warning,
  ready: colors.success,
  picked_up: colors.info,
  on_the_way: colors.info,
  delivered: colors.success,
  cancelled: colors.danger,
};

type StatusBadgeProps = {
  status: OrderStatus;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <View style={[styles.badge, { borderColor: statusColor[status] }]}>
      <Text style={[styles.text, { color: statusColor[status] }]}>{status.replace(/_/g, ' ')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  text: {
    ...typography.caption,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});
