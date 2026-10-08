import { StyleSheet, Switch, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useCurrentUser } from '@/core/auth/SessionContext';
import { CookOrderCard } from '@/features/cook/components/CookOrderCard';
import { getCookOrders, getCookProfile, getCookStats, setCookOpen } from '@/features/cook/services/cook.service';
import { Avatar } from '@/shared/components/Avatar';
import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorView, LoadingView } from '@/shared/components/LoadingView';
import { Screen } from '@/shared/components/Screen';
import { Card, MenuRow, Notice, SectionHeader, StatTile } from '@/shared/components/ui';
import { useFocusData } from '@/shared/hooks/useFocusData';
import { colors } from '@/shared/theme/colors';
import { spacing } from '@/shared/theme/spacing';
import { typography } from '@/shared/theme/typography';
import { showError } from '@/shared/utils/alerts';
import { greeting } from '@/shared/utils/dateUtils';
import { formatCurrency } from '@/shared/utils/formatCurrency';

export default function CookDashboardScreen() {
  const user = useCurrentUser();

  const { data, loading, error, reload, refresh, refreshing, setData } = useFocusData(
    async () => {
      const [profile, stats, orders] = await Promise.all([getCookProfile(user.id), getCookStats(user.id), getCookOrders(user.id)]);
      return { profile, stats, orders };
    },
    null,
    [user.id],
  );

  async function toggleOpen(open: boolean) {
    try {
      await setCookOpen(user.id, open);
      setData((current) => (current?.profile ? { ...current, profile: { ...current.profile, isOpen: open } } : current));
    } catch (err) {
      showError('Could not update kitchen status', err);
    }
  }

  const alerts = (data?.stats.newOrders ?? 0) + (data?.stats.pendingCancellations ?? 0);

  return (
    <Screen
      title="Kitchen Dashboard"
      variant="brand"
      inTabs
      refreshing={refreshing}
      onRefresh={refresh}
      actions={[{ icon: 'notifications-outline', label: 'Notifications', badge: alerts, onPress: () => router.push('/(cook)/notifications') }]}
    >
      {loading ? (
        <LoadingView message="Loading your kitchen..." />
      ) : error || !data ? (
        <ErrorView message={error ?? 'Could not load your kitchen.'} onRetry={() => reload()} />
      ) : (
        <>
          {data.profile?.verificationStatus !== 'verified' ? (
            <Notice
              tone="warning"
              icon="shield-checkmark-outline"
              text="Your kitchen is being verified. You can add meals now; we'll let you know when you're approved."
            />
          ) : null}

          <Card style={styles.status}>
            <Avatar name={data.profile?.businessName ?? user.fullName} uri={user.profileImage} size={52} />
            <View style={styles.flex}>
              <Text style={styles.muted}>{greeting()},</Text>
              <Text style={styles.kitchen}>{data.profile?.businessName ?? user.fullName}</Text>
              <View style={styles.openRow}>
                <View style={[styles.dot, { backgroundColor: data.profile?.isOpen ? colors.success : colors.muted }]} />
                <Text style={[styles.openText, { color: data.profile?.isOpen ? colors.success : colors.muted }]}>
                  {data.profile?.isOpen ? 'Open for orders' : 'Closed — customers can’t order'}
                </Text>
              </View>
            </View>
            <Switch
              accessibilityLabel="Open for orders"
              value={Boolean(data.profile?.isOpen)}
              onValueChange={toggleOpen}
              trackColor={{ false: '#C4C4C4', true: colors.brandStrong }}
              thumbColor={colors.surface}
            />
          </Card>

          <View style={styles.grid}>
            <StatTile value={String(data.stats.todayOrders)} label="Today's orders" onPress={() => router.push('/(cook)/(tabs)/orders')} />
            <StatTile value={String(data.stats.newOrders)} label="New, waiting for you" highlight={data.stats.newOrders > 0} onPress={() => router.push('/(cook)/(tabs)/orders')} />
          </View>
          <View style={styles.grid}>
            <StatTile value={formatCurrency(data.stats.todaySales)} label="Today's sales" onPress={() => router.push('/(cook)/sales')} />
            <StatTile
              value={data.stats.rating ? data.stats.rating.toFixed(1) : '–'}
              label={`Rating · ${data.stats.reviewCount} reviews`}
              onPress={() => router.push('/(cook)/reviews')}
            />
          </View>

          {data.stats.pendingCancellations > 0 ? (
            <Card tone="warning" onPress={() => router.push('/(cook)/(tabs)/orders')} accessibilityLabel="Review cancellation requests">
              <Text style={styles.cardTitle}>
                {data.stats.pendingCancellations} cancellation request{data.stats.pendingCancellations > 1 ? 's' : ''}
              </Text>
              <Text style={styles.muted}>A customer asked to cancel. Approve or reject before you cook.</Text>
            </Card>
          ) : null}

          <SectionHeader title="New orders" actionLabel="See all" onAction={() => router.push('/(cook)/(tabs)/orders')} />
          {data.orders.filter((order) => order.status === 'requested').length === 0 ? (
            <EmptyState title="No new orders" message="Customer requests will appear here." icon="receipt-outline" />
          ) : (
            data.orders
              .filter((order) => order.status === 'requested')
              .slice(0, 3)
              .map((order) => <CookOrderCard key={order.id} order={order} onChanged={() => reload()} />)
          )}

          {data.orders.some((order) => order.status === 'accepted' || order.status === 'preparing') ? (
            <>
              <SectionHeader title="In the kitchen" />
              {data.orders
                .filter((order) => order.status === 'accepted' || order.status === 'preparing')
                .slice(0, 3)
                .map((order) => (
                  <CookOrderCard key={order.id} order={order} onChanged={() => reload()} />
                ))}
            </>
          ) : null}

          <SectionHeader title="Manage" />
          <View style={styles.menu}>
            <MenuRow icon="calendar-outline" label="Scheduled orders" onPress={() => router.push('/(cook)/scheduled')} />
            <MenuRow icon="layers-outline" label="Availability & portions" onPress={() => router.push('/(cook)/availability')} />
            <MenuRow icon="bar-chart-outline" label="Sales overview" onPress={() => router.push('/(cook)/sales')} />
          </View>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    gap: 2,
  },
  status: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
  },
  kitchen: {
    ...typography.sectionTitle,
    color: colors.ink,
  },
  muted: {
    ...typography.caption,
    color: colors.muted,
  },
  openRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  openText: {
    ...typography.captionStrong,
  },
  grid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  cardTitle: {
    ...typography.cardTitle,
    color: colors.ink,
  },
  menu: {
    gap: spacing.sm,
  },
});
