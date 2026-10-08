import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useCurrentUser } from '@/core/auth/SessionContext';
import { CookOrderCard } from '@/features/cook/components/CookOrderCard';
import { getCookOrders } from '@/features/cook/services/cook.service';
import { groupByDay } from '@/features/cook/utils/groupByDay';
import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorView, LoadingView } from '@/shared/components/LoadingView';
import { Screen } from '@/shared/components/Screen';
import { Card, Segmented } from '@/shared/components/ui';
import { useFocusData } from '@/shared/hooks/useFocusData';
import { colors } from '@/shared/theme/colors';
import { typography } from '@/shared/theme/typography';
import type { Order } from '@/shared/types/Order';
import { formatCurrency } from '@/shared/utils/formatCurrency';

type Tab = 'completed' | 'cancelled';

export default function CookOrderHistoryScreen() {
  const user = useCurrentUser();
  const [tab, setTab] = useState<Tab>('completed');
  const {
    data: { orders, weekAgo },
    loading,
    error,
    reload,
    refresh,
    refreshing,
  } = useFocusData(
    async () => ({ orders: await getCookOrders(user.id), weekAgo: Date.now() - 7 * 86_400_000 }),
    { orders: [] as Order[], weekAgo: 0 },
    [user.id],
  );

  const completed = orders
    .filter((order) => order.status === 'delivered')
    .sort((a, b) => new Date(b.deliveredAt ?? b.createdAt).getTime() - new Date(a.deliveredAt ?? a.createdAt).getTime());
  const cancelled = orders.filter((order) => order.status === 'cancelled');
  const lastWeek = completed.filter((order) => new Date(order.deliveredAt ?? order.createdAt).getTime() >= weekAgo);
  const list = tab === 'completed' ? completed : cancelled;
  const days = groupByDay(list, (order) => (tab === 'completed' ? order.deliveredAt ?? order.createdAt : order.updatedAt ?? order.createdAt));

  return (
    <Screen title="Order History" back variant="brand" refreshing={refreshing} onRefresh={refresh}>
      <Segmented
        value={tab}
        onChange={setTab}
        options={[
          { value: 'completed', label: 'Completed' },
          { value: 'cancelled', label: 'Cancelled' },
        ]}
      />
      {tab === 'completed' ? (
        <Card style={styles.summary}>
          <View>
            <Text style={styles.muted}>Last 7 days</Text>
            <Text style={styles.strong}>{lastWeek.length} orders</Text>
          </View>
          <Text style={styles.total}>{formatCurrency(lastWeek.reduce((sum, order) => sum + order.subtotal, 0))}</Text>
        </Card>
      ) : null}
      {loading ? (
        <LoadingView />
      ) : error ? (
        <ErrorView message={error} onRetry={() => reload()} />
      ) : days.length === 0 ? (
        <EmptyState title={tab === 'completed' ? 'No completed orders yet' : 'No cancelled orders'} icon="time-outline" />
      ) : (
        days.map((day) => [
          <Text key={day.label} style={styles.day}>
            {day.label}
          </Text>,
          ...day.items.map((order) => <CookOrderCard key={order.id} order={order} onChanged={() => reload()} showActions={false} />),
        ])
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  summary: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  muted: {
    ...typography.caption,
    color: colors.muted,
  },
  strong: {
    ...typography.bodyStrong,
    color: colors.ink,
  },
  total: {
    ...typography.stat,
    color: colors.ink,
  },
  day: {
    ...typography.captionStrong,
    color: colors.muted,
    letterSpacing: 0.5,
    marginTop: 4,
    textTransform: 'uppercase',
  },
});
