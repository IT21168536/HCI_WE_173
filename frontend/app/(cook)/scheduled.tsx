import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { useCurrentUser } from '@/core/auth/SessionContext';
import { CookOrderCard } from '@/features/cook/components/CookOrderCard';
import { getCookOrders } from '@/features/cook/services/cook.service';
import { groupByDay } from '@/features/cook/utils/groupByDay';
import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorView, LoadingView } from '@/shared/components/LoadingView';
import { Screen } from '@/shared/components/Screen';
import { Segmented } from '@/shared/components/ui';
import { useFocusData } from '@/shared/hooks/useFocusData';
import { colors } from '@/shared/theme/colors';
import { typography } from '@/shared/theme/typography';
import type { Order } from '@/shared/types/Order';
import { isFuture } from '@/shared/utils/dateUtils';

type Tab = 'requests' | 'accepted' | 'completed';

export default function ScheduledOrdersScreen() {
  const user = useCurrentUser();
  const [tab, setTab] = useState<Tab>('requests');
  const { data: orders, loading, error, reload, refresh, refreshing } = useFocusData(() => getCookOrders(user.id), [] as Order[], [user.id]);

  const scheduled = orders
    .filter((order) => order.scheduledTime)
    .sort((a, b) => new Date(a.scheduledTime ?? 0).getTime() - new Date(b.scheduledTime ?? 0).getTime());
  const groups: Record<Tab, Order[]> = {
    requests: scheduled.filter((order) => order.status === 'requested' && isFuture(order.scheduledTime)),
    accepted: scheduled.filter((order) => ['accepted', 'preparing', 'ready'].includes(order.status)),
    completed: scheduled.filter((order) => order.status === 'delivered').reverse(),
  };
  const days = groupByDay(groups[tab], (order) => order.scheduledTime);

  return (
    <Screen title="Scheduled Orders" back variant="brand" refreshing={refreshing} onRefresh={refresh}>
      <Segmented
        value={tab}
        onChange={setTab}
        options={[
          { value: 'requests', label: `Pre-orders (${groups.requests.length})` },
          { value: 'accepted', label: 'Accepted' },
          { value: 'completed', label: 'Completed' },
        ]}
      />
      {loading ? (
        <LoadingView />
      ) : error ? (
        <ErrorView message={error} onRetry={() => reload()} />
      ) : days.length === 0 ? (
        <EmptyState
          title={tab === 'requests' ? 'No pre-orders waiting' : tab === 'accepted' ? 'No accepted pre-orders' : 'No completed pre-orders'}
          message="Customers can order ahead for later today or tomorrow."
          icon="calendar-outline"
        />
      ) : (
        days.map((day) => [
          <Text key={day.label} style={styles.day}>
            {day.label}
          </Text>,
          ...day.items.map((order) => <CookOrderCard key={order.id} order={order} onChanged={() => reload()} showActions={tab !== 'completed'} />),
        ])
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  day: {
    ...typography.captionStrong,
    color: colors.muted,
    letterSpacing: 0.5,
    marginTop: 4,
    textTransform: 'uppercase',
  },
});
