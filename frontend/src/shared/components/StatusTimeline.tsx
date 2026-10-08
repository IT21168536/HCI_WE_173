import { StyleSheet, Text, View } from 'react-native';
import type { Order, OrderStatus } from '@/shared/types/Order';
import { colors } from '@/shared/theme/colors';
import { spacing } from '@/shared/theme/spacing';
import { typography } from '@/shared/theme/typography';
import { Icon } from './Icon';

type Step = { status: OrderStatus; label: string; detail: string };

function stepsFor(order: Order): Step[] {
  const common: Step[] = [
    { status: 'requested', label: 'Order placed', detail: 'Waiting for the cook to confirm' },
    { status: 'accepted', label: 'Accepted', detail: 'The cook confirmed your order' },
    { status: 'preparing', label: 'Preparing', detail: 'Your meal is being cooked' },
  ];
  if (order.deliveryType === 'pickup') {
    return [
      ...common,
      { status: 'ready', label: 'Ready to collect', detail: `Collect from ${order.cookBusinessName ?? 'the kitchen'}` },
      { status: 'delivered', label: 'Collected', detail: 'Enjoy your meal!' },
    ];
  }
  return [
    ...common,
    { status: 'ready', label: 'Ready for pickup', detail: 'Waiting for a rider' },
    { status: 'picked_up', label: 'Picked up', detail: order.riderName ? `${order.riderName} has your meal` : 'A rider has your meal' },
    { status: 'on_the_way', label: 'On the way', detail: 'Heading to your address' },
    { status: 'delivered', label: 'Delivered', detail: 'Enjoy your meal!' },
  ];
}

/** Vertical order progress. Each step is labelled in words, not just coloured. */
export function StatusTimeline({ order }: { order: Order }) {
  const steps = stepsFor(order);
  const currentIndex = steps.findIndex((step) => step.status === order.status);

  return (
    <View accessibilityRole="list" style={styles.list}>
      {steps.map((step, index) => {
        const done = index < currentIndex || order.status === 'delivered';
        const current = index === currentIndex && order.status !== 'delivered';
        const state = done ? 'done' : current ? 'current' : 'upcoming';
        return (
          <View key={step.status} style={styles.row} accessibilityLabel={`${step.label}, ${state}`}>
            <View style={styles.rail}>
              <View style={[styles.dot, done && styles.dotDone, current && styles.dotCurrent]}>
                {done ? <Icon name="checkmark" size={12} color={colors.surface} /> : null}
              </View>
              {index < steps.length - 1 ? <View style={[styles.line, done && styles.lineDone]} /> : null}
            </View>
            <View style={styles.copy}>
              <Text style={[styles.label, !done && !current && styles.upcoming]}>{step.label}</Text>
              {current || (done && index === steps.length - 1) ? <Text style={styles.detail}>{step.detail}</Text> : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 0,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 44,
  },
  rail: {
    alignItems: 'center',
    width: 22,
  },
  dot: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: '#CFCFCF',
    borderRadius: 11,
    borderWidth: 2,
    height: 22,
    justifyContent: 'center',
    width: 22,
  },
  dotDone: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  dotCurrent: {
    backgroundColor: colors.warningSoft,
    borderColor: colors.warning,
  },
  line: {
    backgroundColor: '#E0E0E0',
    flex: 1,
    marginVertical: 2,
    width: 2,
  },
  lineDone: {
    backgroundColor: colors.success,
  },
  copy: {
    flex: 1,
    paddingBottom: spacing.sm,
  },
  label: {
    ...typography.bodyStrong,
    color: colors.ink,
  },
  upcoming: {
    color: colors.muted,
    fontWeight: '400',
  },
  detail: {
    ...typography.caption,
    color: colors.muted,
  },
});
