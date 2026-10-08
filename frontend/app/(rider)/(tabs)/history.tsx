import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useCurrentUser } from '@/core/auth/SessionContext';
import { deleteRiderHistoryEntry, getRiderHistory } from '@/features/rider/services/rider.service';
import { AppButton } from '@/shared/components/AppButton';
import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorView, LoadingView } from '@/shared/components/LoadingView';
import { OrderCard, orderNumber } from '@/shared/components/OrderCard';
import { Screen } from '@/shared/components/Screen';
import { SearchBar } from '@/shared/components/SearchBar';
import { Card } from '@/shared/components/ui';
import { useFocusData } from '@/shared/hooks/useFocusData';
import { colors } from '@/shared/theme/colors';
import { radius } from '@/shared/theme/radius';
import { spacing } from '@/shared/theme/spacing';
import { typography } from '@/shared/theme/typography';
import type { Order } from '@/shared/types/Order';
import { confirm, showError } from '@/shared/utils/alerts';
import { formatCurrency } from '@/shared/utils/formatCurrency';

export default function RiderHistoryScreen() {
  const user = useCurrentUser();
  const [query, setQuery] = useState('');
  const { data: orders, loading, error, reload, refresh, refreshing } = useFocusData(
    () => getRiderHistory(user.id),
    [] as Order[],
    [user.id],
  );

  const delivered = useMemo(() => orders.filter((order) => order.status === 'delivered'), [orders]);
  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return delivered;
    return delivered.filter((order) =>
      [orderNumber(order.id), order.customerName, order.cookName, order.cookBusinessName, order.deliveryAddress, order.itemsSummary].some(
        (value) => value?.toLowerCase().includes(needle),
      ),
    );
  }, [delivered, query]);

  async function remove(order: Order) {
    const accepted = await confirm(
      `Remove ${orderNumber(order.id)}?`,
      'This hides the delivery from your rider history. Customer and cook records will stay safe.',
      'Remove from history',
      true,
    );
    if (!accepted) return;
    try {
      await deleteRiderHistoryEntry(order.id, user.id);
      await reload();
    } catch (err) {
      showError('Could not remove delivery', err);
    }
  }

  const earnings = delivered.reduce((sum, order) => sum + order.deliveryFee, 0);

  return (
    <Screen title="Delivery History" subtitle="Completed trips and earnings" inTabs refreshing={refreshing} onRefresh={refresh}>
      <Card style={styles.summary}>
        <View style={styles.summaryBlock}>
          <View style={styles.iconCircle}>
            <Text style={styles.icon}>✓</Text>
          </View>
          <View>
            <Text style={styles.muted}>Completed</Text>
            <Text style={styles.value}>{delivered.length}</Text>
          </View>
        </View>
        <View style={styles.divider} />
        <View style={[styles.summaryBlock, styles.summaryRight]}>
          <View>
            <Text style={[styles.muted, styles.rightText]}>Total earned</Text>
            <Text style={[styles.value, styles.earning]}>{formatCurrency(earnings)}</Text>
          </View>
        </View>
      </Card>

      <SearchBar
        value={query}
        onChangeText={setQuery}
        placeholder="Search order, customer or address"
        accessibilityLabel="Search delivery history"
      />

      {!loading && !error ? (
        <View style={styles.resultRow}>
          <Text style={styles.resultText}>{query ? `${visible.length} matching deliveries` : 'Most recent first'}</Text>
        </View>
      ) : null}

      {loading ? (
        <LoadingView message="Loading completed deliveries..." />
      ) : error ? (
        <ErrorView message={error} onRetry={() => reload()} />
      ) : delivered.length === 0 ? (
        <EmptyState title="No completed deliveries" message="Finished trips will appear here with their earnings." icon="time-outline" />
      ) : visible.length === 0 ? (
        <EmptyState title="No matching deliveries" message="Try another order number, name or address." icon="search-outline" actionLabel="Clear search" onAction={() => setQuery('')} />
      ) : (
        visible.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            perspective="rider"
            onPress={() => router.push({ pathname: '/(rider)/delivery/[id]', params: { id: String(order.id) } })}
          >
            <AppButton
              title="Remove from history"
              icon="trash-outline"
              size="sm"
              variant="ghost"
              accessibilityLabel={`Remove ${orderNumber(order.id)} from history`}
              onPress={() => remove(order)}
            />
          </OrderCard>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  summary: {
    alignItems: 'center',
    backgroundColor: colors.header,
    borderColor: colors.header,
    flexDirection: 'row',
    padding: spacing.lg,
  },
  summaryBlock: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: spacing.md,
  },
  summaryRight: {
    justifyContent: 'flex-end',
  },
  iconCircle: {
    alignItems: 'center',
    backgroundColor: colors.brand,
    borderRadius: radius.pill,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  icon: {
    color: colors.surface,
    fontSize: 20,
    fontWeight: '700',
  },
  divider: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    height: 44,
    width: 1,
  },
  muted: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.68)',
  },
  value: {
    ...typography.stat,
    color: colors.surface,
    marginTop: 2,
  },
  earning: {
    color: colors.surface,
  },
  rightText: {
    textAlign: 'right',
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  resultText: {
    ...typography.caption,
    color: colors.muted,
  },
});
