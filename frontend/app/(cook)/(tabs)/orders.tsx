import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useCurrentUser } from '@/core/auth/SessionContext';
import { CookOrderCard } from '@/features/cook/components/CookOrderCard';
import { getCookOrders } from '@/features/cook/services/cook.service';
import { EmptyState } from '@/shared/components/EmptyState';
import { Icon } from '@/shared/components/Icon';
import { ErrorView, LoadingView } from '@/shared/components/LoadingView';
import { Screen } from '@/shared/components/Screen';
import { Segmented } from '@/shared/components/ui';
import { useFocusData } from '@/shared/hooks/useFocusData';
import { colors } from '@/shared/theme/colors';
import { radius } from '@/shared/theme/radius';
import { spacing } from '@/shared/theme/spacing';
import { typography } from '@/shared/theme/typography';
import type { Order } from '@/shared/types/Order';
import { isFuture } from '@/shared/utils/dateUtils';

type Tab = 'new' | 'kitchen' | 'ready';

export default function CookOrdersScreen() {
  const user = useCurrentUser();
  const [tab, setTab] = useState<Tab>('new');
  const { data: orders, loading, error, reload, refresh, refreshing } = useFocusData(() => getCookOrders(user.id), [] as Order[], [user.id]);

  const cancellations = orders.filter((order) => order.cancelStatus === 'requested' && !['cancelled', 'delivered'].includes(order.status));
  const groups: Record<Tab, Order[]> = {
    new: orders.filter((order) => order.status === 'requested'),
    kitchen: orders.filter((order) => (order.status === 'accepted' || order.status === 'preparing') && order.cancelStatus !== 'requested'),
    ready: orders.filter((order) => order.status === 'ready'),
  };
  const scheduledCount = orders.filter((order) => isFuture(order.scheduledTime) && !['cancelled', 'delivered'].includes(order.status)).length;

  return (
    <Screen title="Orders" variant="brand" inTabs refreshing={refreshing} onRefresh={refresh}>
      <Segmented
        value={tab}
        onChange={setTab}
        options={[
          { value: 'new', label: `New (${groups.new.length})` },
          { value: 'kitchen', label: `Preparing (${groups.kitchen.length})` },
          { value: 'ready', label: `Ready (${groups.ready.length})` },
        ]}
      />

      {loading ? (
        <LoadingView message="Loading orders..." />
      ) : error ? (
        <ErrorView message={error} onRetry={() => reload()} />
      ) : (
        <>
          {cancellations.map((order) => (
            <CookOrderCard key={`cancel-${order.id}`} order={order} onChanged={() => reload()} />
          ))}
          {groups[tab].length === 0 ? (
            <EmptyState
              title={tab === 'new' ? 'No incoming orders' : tab === 'kitchen' ? 'Nothing cooking right now' : 'No orders waiting for pickup'}
              message={tab === 'new' ? 'Customer requests will appear here.' : undefined}
              icon="receipt-outline"
            />
          ) : (
            groups[tab].map((order) => <CookOrderCard key={order.id} order={order} onChanged={() => reload()} />)
          )}
        </>
      )}

      <View style={styles.tiles}>
        <Pressable accessibilityRole="button" onPress={() => router.push('/(cook)/scheduled')} style={({ pressed }) => [styles.tile, pressed && styles.pressed]}>
          <View style={styles.flex}>
            <Text style={styles.tileTitle}>Scheduled</Text>
            <Text style={styles.muted}>{scheduledCount} pre-order{scheduledCount === 1 ? '' : 's'}</Text>
          </View>
          <Icon name="chevron-forward" size={18} color={colors.muted} />
        </Pressable>
        <Pressable accessibilityRole="button" onPress={() => router.push('/(cook)/history')} style={({ pressed }) => [styles.tile, pressed && styles.pressed]}>
          <View style={styles.flex}>
            <Text style={styles.tileTitle}>History</Text>
            <Text style={styles.muted}>Past orders</Text>
          </View>
          <Icon name="chevron-forward" size={18} color={colors.muted} />
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  tiles: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  tile: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radius.lg,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    minHeight: 60,
    paddingHorizontal: 14,
  },
  pressed: {
    opacity: 0.85,
  },
  flex: {
    flex: 1,
  },
  tileTitle: {
    ...typography.bodyStrong,
    color: colors.ink,
  },
  muted: {
    ...typography.caption,
    color: colors.muted,
  },
});
