import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useCurrentUser } from '@/core/auth/SessionContext';
import { Avatar } from '@/shared/components/Avatar';
import { Icon, type IconName } from '@/shared/components/Icon';
import { RiderDeliveryCard } from '@/features/rider/components/RiderDeliveryCard';
import { RiderWeeklyChart } from '@/features/rider/components/RiderWeeklyChart';
import { getActiveDeliveries, getAvailableDeliveries, getRiderHistory, getRiderStats } from '@/features/rider/services/rider.service';
import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorView, LoadingView } from '@/shared/components/LoadingView';
import { Screen } from '@/shared/components/Screen';
import { SectionHeader } from '@/shared/components/ui';
import { useFocusData } from '@/shared/hooks/useFocusData';
import { colors } from '@/shared/theme/colors';
import { radius } from '@/shared/theme/radius';
import { spacing } from '@/shared/theme/spacing';
import { typography } from '@/shared/theme/typography';
import { greeting } from '@/shared/utils/dateUtils';
import { formatCurrency } from '@/shared/utils/formatCurrency';

export default function RiderDashboardScreen() {
  const user = useCurrentUser();
  const { data, loading, error, reload, refresh, refreshing } = useFocusData(
    async () => {
      const [stats, mine, available, history] = await Promise.all([
        getRiderStats(user.id),
        getActiveDeliveries(user.id),
        getAvailableDeliveries(),
        getRiderHistory(user.id),
      ]);
      return { stats, mine, available, history };
    },
    null,
    [user.id],
  );

  return (
    <Screen title="Dashboard" inTabs refreshing={refreshing} onRefresh={refresh} contentStyle={styles.content}>
      <View style={styles.welcomeRow}>
        <View style={styles.welcomeCopy}>
          <Text style={styles.muted}>{greeting()},</Text>
          <Text style={styles.name}>{user.fullName.split(' ')[0]}</Text>
        </View>
        <Avatar name={user.fullName} uri={user.profileImage} size={48} />
      </View>

      {loading ? (
        <LoadingView message="Loading deliveries..." />
      ) : error || !data ? (
        <ErrorView message={error ?? 'Could not load deliveries.'} onRetry={() => reload()} />
      ) : (
        <>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${data.available.length} deliveries ready for pickup`}
            onPress={() => router.push('/(rider)/(tabs)/current')}
            style={({ pressed }) => [styles.hero, pressed && styles.pressed]}
          >
            <View style={styles.heroCopy}>
              <View style={styles.livePill}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>YOU ARE ONLINE</Text>
              </View>
              <Text style={styles.heroTitle}>{data.mine.length > 0 ? 'Your next stop is ready' : 'Ready for the next trip?'}</Text>
              <Text style={styles.heroSubtitle}>
                {data.mine.length > 0
                  ? `${data.mine.length} active ${data.mine.length === 1 ? 'delivery' : 'deliveries'} in your route`
                  : `${data.available.length} ${data.available.length === 1 ? 'order is' : 'orders are'} waiting nearby`}
              </Text>
            </View>
            <View style={styles.heroIcon}>
              <Icon name="bicycle" size={31} color={colors.surface} />
            </View>
          </Pressable>

          <View style={styles.sectionHeading}>
            <Text style={styles.section}>TODAY AT A GLANCE</Text>
            <Text style={styles.date}>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</Text>
          </View>
          <View style={styles.statsGrid}>
            <DashboardStat icon="briefcase-outline" value={String(data.stats.assigned)} label="Assigned" onPress={() => router.push('/(rider)/(tabs)/current')} />
            <DashboardStat icon="navigate-outline" value={String(data.stats.active)} label="In transit" onPress={() => router.push('/(rider)/(tabs)/current')} />
            <DashboardStat icon="checkmark-circle-outline" value={String(data.stats.completedToday)} label="Completed" onPress={() => router.push('/(rider)/(tabs)/history')} />
            <DashboardStat icon="wallet-outline" value={formatCurrency(data.stats.earningsToday)} label="Earnings" compact />
          </View>

          <RiderWeeklyChart orders={data.history} />

          {data.mine.length > 0 ? (
            <>
              <SectionHeader title="Your next delivery" actionLabel="View all" onAction={() => router.push('/(rider)/(tabs)/current')} />
              <RiderDeliveryCard order={data.mine[0]} riderId={user.id} onChanged={() => reload()} />
            </>
          ) : null}

          <SectionHeader title={`Ready for pickup (${data.available.length})`} />
          {data.available.length === 0 ? (
            <EmptyState title="No ready deliveries" message="Orders marked ready by cooks will appear here." icon="bicycle-outline" />
          ) : (
            data.available.map((order) => <RiderDeliveryCard key={order.id} order={order} riderId={user.id} onChanged={() => reload()} />)
          )}
        </>
      )}
    </Screen>
  );
}

function DashboardStat({
  icon,
  value,
  label,
  onPress,
  compact = false,
}: {
  icon: IconName;
  value: string;
  label: string;
  onPress?: () => void;
  compact?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={`${label}: ${value}`}
      onPress={onPress}
      style={({ pressed }) => [styles.statCard, pressed && onPress && styles.pressed]}
    >
      <View style={styles.statTop}>
        <View style={styles.statIcon}>
          <Icon name={icon} size={17} color={colors.brandText} />
        </View>
        {onPress ? <Icon name="chevron-forward" size={15} color={colors.muted} /> : null}
      </View>
      <Text numberOfLines={1} adjustsFontSizeToFit style={[styles.statValue, compact && styles.compactValue]}>
        {value}
      </Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
  },
  welcomeRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  welcomeCopy: {
    flex: 1,
  },
  muted: {
    ...typography.body,
    color: colors.muted,
  },
  name: {
    ...typography.screenTitle,
    color: colors.ink,
    fontSize: 26,
  },
  hero: {
    alignItems: 'center',
    backgroundColor: colors.header,
    borderRadius: radius.xl,
    flexDirection: 'row',
    minHeight: 146,
    overflow: 'hidden',
    padding: spacing.lg,
  },
  heroCopy: {
    flex: 1,
    zIndex: 1,
  },
  livePill: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: radius.pill,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  liveDot: {
    backgroundColor: colors.brand,
    borderRadius: radius.pill,
    height: 7,
    width: 7,
  },
  liveText: {
    color: colors.surface,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  heroTitle: {
    color: colors.surface,
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 25,
    marginTop: spacing.md,
  },
  heroSubtitle: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.72)',
    lineHeight: 17,
    marginTop: spacing.xs,
  },
  heroIcon: {
    alignItems: 'center',
    backgroundColor: colors.brand,
    borderRadius: 34,
    height: 68,
    justifyContent: 'center',
    marginLeft: spacing.md,
    transform: [{ rotate: '-5deg' }],
    width: 68,
  },
  pressed: {
    opacity: 0.86,
  },
  sectionHeading: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: -spacing.sm,
  },
  section: {
    ...typography.captionStrong,
    color: colors.muted,
    fontSize: 10,
    letterSpacing: 0.8,
  },
  date: {
    ...typography.caption,
    color: colors.muted,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  statCard: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radius.lg,
    borderWidth: 1,
    minHeight: 122,
    padding: spacing.md,
    width: '48.5%',
  },
  statTop: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statIcon: {
    alignItems: 'center',
    backgroundColor: colors.brandSoft,
    borderRadius: radius.md,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  statValue: {
    ...typography.stat,
    color: colors.ink,
    fontSize: 24,
    marginTop: spacing.sm,
  },
  compactValue: {
    fontSize: 20,
  },
  statLabel: {
    ...typography.caption,
    color: colors.muted,
    marginTop: 2,
  },
});
