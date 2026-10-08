import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useCurrentUser } from '@/core/auth/SessionContext';
import { getCookDailySales, getCookSalesSince, getCookTopMeals } from '@/features/cook/services/cook.service';
import { AppButton } from '@/shared/components/AppButton';
import { ErrorView, LoadingView } from '@/shared/components/LoadingView';
import { Screen } from '@/shared/components/Screen';
import { Card, Divider, InfoRow } from '@/shared/components/ui';
import { useFocusData } from '@/shared/hooks/useFocusData';
import { colors } from '@/shared/theme/colors';
import { spacing } from '@/shared/theme/spacing';
import { typography } from '@/shared/theme/typography';
import { PLATFORM_FEE_RATE } from '@/shared/types/Order';
import { formatCurrency } from '@/shared/utils/formatCurrency';

const CHART_HEIGHT = 110;

export default function SalesOverviewScreen() {
  const user = useCurrentUser();
  const { data, loading, error, reload, refresh, refreshing } = useFocusData(
    async () => {
      const [daily, todayTotals, week, month, top] = await Promise.all([
        getCookDailySales(user.id, 7),
        getCookSalesSince(user.id, 0),
        getCookSalesSince(user.id, 7),
        getCookSalesSince(user.id, 30),
        getCookTopMeals(user.id, 0),
      ]);
      return { daily, todayTotals, week, month, top };
    },
    null,
    [user.id],
  );

  if (loading) return <LoadingView fill />;
  if (error || !data) {
    return (
      <Screen title="Sales Overview" back variant="brand">
        <ErrorView message={error ?? 'Could not load sales.'} onRetry={() => reload()} />
      </Screen>
    );
  }

  const today = data.daily[data.daily.length - 1];
  const mealsToday = data.todayTotals.meals;
  const max = Math.max(...data.daily.map((day) => day.total), 1);

  return (
    <Screen title="Sales Overview" back variant="brand" refreshing={refreshing} onRefresh={refresh}>
      <Card>
        <Text style={styles.muted}>Today&apos;s sales</Text>
        <Text style={styles.big}>{formatCurrency(today.total)}</Text>
        <View style={styles.row}>
          <View style={styles.mini}>
            <Text style={styles.miniValue}>{today.orders}</Text>
            <Text style={styles.muted}>Orders</Text>
          </View>
          <View style={styles.mini}>
            <Text style={styles.miniValue}>{mealsToday}</Text>
            <Text style={styles.muted}>Meals sold</Text>
          </View>
          <View style={styles.mini}>
            <Text style={[styles.miniValue, { color: colors.brandText }]}>{formatCurrency(today.total * (1 - PLATFORM_FEE_RATE))}</Text>
            <Text style={styles.muted}>You earn</Text>
          </View>
        </View>
      </Card>

      <Card>
        <View style={styles.between}>
          <Text style={styles.cardTitle}>Last 7 days</Text>
          <Text style={styles.cardTitle}>{formatCurrency(data.week.total)}</Text>
        </View>
        <View
          accessible
          accessibilityLabel={`Daily sales for the last 7 days: ${data.daily
            .map((day) => `${new Date(day.date).toLocaleDateString('en-US', { weekday: 'long' })} ${formatCurrency(day.total)}`)
            .join(', ')}`}
          style={styles.chart}
        >
          {data.daily.map((day, index) => {
            const isToday = index === data.daily.length - 1;
            return (
              <View key={day.date} style={styles.barColumn}>
                <Text style={[styles.barValue, !isToday && styles.hidden]}>{Math.round(day.total / 100) / 10}k</Text>
                <View style={[styles.bar, { height: Math.max(4, (day.total / max) * CHART_HEIGHT) }, isToday && styles.barToday]} />
                <Text style={[styles.barLabel, isToday && styles.barLabelToday]}>
                  {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                </Text>
              </View>
            );
          })}
        </View>
        <Divider />
        <InfoRow label="Orders in the last 7 days" value={String(data.week.orders)} />
        <InfoRow label="Last 30 days" value={formatCurrency(data.month.total)} strong />
      </Card>

      <Card>
        <Text style={styles.cardTitle}>Top-selling meals today</Text>
        {data.top.length === 0 ? (
          <Text style={styles.muted}>No meals sold yet today.</Text>
        ) : (
          data.top.map((meal, index) => (
            <View key={meal.mealId} style={styles.topRow}>
              <View style={styles.rank}>
                <Text style={styles.rankText}>{index + 1}</Text>
              </View>
              <Text style={styles.topName}>{meal.name}</Text>
              <Text style={styles.muted}>{meal.quantity} sold</Text>
              <Text style={styles.topTotal}>{formatCurrency(meal.total)}</Text>
            </View>
          ))
        )}
      </Card>

      <Text style={styles.muted}>Sales are meal totals before the {Math.round(PLATFORM_FEE_RATE * 100)}% platform fee. Delivery fees go to riders.</Text>
      <AppButton title="Order history" variant="outline" onPress={() => router.push('/(cook)/history')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  muted: {
    ...typography.caption,
    color: colors.muted,
  },
  big: {
    color: colors.ink,
    fontSize: 28,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  mini: {
    flex: 1,
    gap: 2,
  },
  miniValue: {
    ...typography.sectionTitle,
    color: colors.ink,
  },
  between: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardTitle: {
    ...typography.cardTitle,
    color: colors.ink,
  },
  chart: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: spacing.sm,
    height: CHART_HEIGHT + 40,
    marginVertical: spacing.sm,
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
    gap: 6,
    justifyContent: 'flex-end',
  },
  bar: {
    alignSelf: 'stretch',
    backgroundColor: '#F6C1B4',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  barToday: {
    backgroundColor: colors.brandStrong,
  },
  barValue: {
    ...typography.captionStrong,
    color: colors.ink,
    fontSize: 11,
  },
  hidden: {
    opacity: 0,
  },
  barLabel: {
    ...typography.caption,
    color: colors.muted,
    fontSize: 11,
  },
  barLabelToday: {
    color: colors.ink,
    fontWeight: '700',
  },
  topRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  rank: {
    alignItems: 'center',
    backgroundColor: colors.brandSoft,
    borderRadius: 11,
    height: 22,
    justifyContent: 'center',
    width: 22,
  },
  rankText: {
    color: colors.brandText,
    fontSize: 11,
    fontWeight: '700',
  },
  topName: {
    ...typography.body,
    color: colors.ink,
    flex: 1,
  },
  topTotal: {
    ...typography.bodyStrong,
    color: colors.ink,
    minWidth: 72,
    textAlign: 'right',
  },
});
