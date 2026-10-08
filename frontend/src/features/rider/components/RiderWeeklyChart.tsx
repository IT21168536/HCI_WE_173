import { StyleSheet, Text, View } from 'react-native';
import { Card } from '@/shared/components/ui';
import { colors } from '@/shared/theme/colors';
import { radius } from '@/shared/theme/radius';
import { spacing } from '@/shared/theme/spacing';
import { typography } from '@/shared/theme/typography';
import type { Order } from '@/shared/types/Order';
import { formatCurrency } from '@/shared/utils/formatCurrency';

type ChartDay = {
  key: string;
  label: string;
  count: number;
  earnings: number;
};

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function makeWeek(orders: Order[]): ChartDay[] {
  const today = startOfDay(new Date());
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));
    return {
      key: `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`,
      label: date.toLocaleDateString('en-US', { weekday: 'narrow' }),
      count: 0,
      earnings: 0,
    };
  });

  const byKey = new Map(days.map((day) => [day.key, day]));
  orders.forEach((order) => {
    if (order.status !== 'delivered' || !order.deliveredAt) return;
    const date = new Date(order.deliveredAt);
    const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    const day = byKey.get(key);
    if (day) {
      day.count += 1;
      day.earnings += order.deliveryFee;
    }
  });

  return days;
}

export function RiderWeeklyChart({ orders }: { orders: Order[] }) {
  const days = makeWeek(orders);
  const maxCount = Math.max(...days.map((day) => day.count), 1);
  const totalDeliveries = days.reduce((sum, day) => sum + day.count, 0);
  const totalEarnings = days.reduce((sum, day) => sum + day.earnings, 0);

  return (
    <Card style={styles.card} accessibilityLabel={`${totalDeliveries} deliveries in the last seven days`}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>LAST 7 DAYS</Text>
          <Text style={styles.title}>Delivery activity</Text>
        </View>
        <View style={styles.earnings}>
          <Text style={styles.earningsValue}>{formatCurrency(totalEarnings)}</Text>
          <Text style={styles.earningsLabel}>{totalDeliveries} deliveries</Text>
        </View>
      </View>

      <View style={styles.chart}>
        {days.map((day, index) => {
          const isToday = index === days.length - 1;
          const height = day.count === 0 ? 8 : Math.max(22, (day.count / maxCount) * 76);
          return (
            <View key={day.key} style={styles.column} accessible accessibilityLabel={`${day.label}: ${day.count} deliveries`}>
              <View style={styles.barTrack}>
                {day.count > 0 ? <Text style={styles.count}>{day.count}</Text> : null}
                <View style={[styles.bar, isToday && styles.todayBar, { height }]} />
              </View>
              <View style={[styles.dayPill, isToday && styles.todayPill]}>
                <Text style={[styles.day, isToday && styles.todayDay]}>{day.label}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.lg,
    padding: spacing.lg,
  },
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  eyebrow: {
    ...typography.captionStrong,
    color: colors.brandText,
    fontSize: 10,
    letterSpacing: 0.8,
  },
  title: {
    ...typography.sectionTitle,
    color: colors.ink,
    marginTop: 2,
  },
  earnings: {
    alignItems: 'flex-end',
  },
  earningsValue: {
    ...typography.bodyStrong,
    color: colors.ink,
  },
  earningsLabel: {
    ...typography.caption,
    color: colors.muted,
    marginTop: 2,
  },
  chart: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: spacing.sm,
    height: 126,
  },
  column: {
    alignItems: 'center',
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
  },
  barTrack: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
    width: '100%',
  },
  count: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 4,
  },
  bar: {
    backgroundColor: colors.brandSoft,
    borderRadius: radius.pill,
    maxWidth: 26,
    width: '72%',
  },
  todayBar: {
    backgroundColor: colors.brand,
  },
  dayPill: {
    alignItems: 'center',
    borderRadius: radius.pill,
    justifyContent: 'center',
    marginTop: 7,
    minHeight: 24,
    width: 24,
  },
  todayPill: {
    backgroundColor: colors.header,
  },
  day: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: '600',
  },
  todayDay: {
    color: colors.surface,
  },
});
