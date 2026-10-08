import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useCurrentUser, useSession } from '@/core/auth/SessionContext';
import { getRiderHistory, getRiderProfile, listRiderSchedules } from '@/features/rider/services/rider.service';
import { Avatar } from '@/shared/components/Avatar';
import { ErrorView, LoadingView } from '@/shared/components/LoadingView';
import { Screen } from '@/shared/components/Screen';
import { Badge, Card, Divider, InfoRow, MenuRow, StatTile } from '@/shared/components/ui';
import { useFocusData } from '@/shared/hooks/useFocusData';
import { colors } from '@/shared/theme/colors';
import { spacing } from '@/shared/theme/spacing';
import { typography } from '@/shared/theme/typography';
import type { Order } from '@/shared/types/Order';
import type { RiderProfile } from '@/shared/types/RiderProfile';
import { VEHICLE_LABELS } from '@/shared/types/RiderProfile';
import type { RiderSchedule } from '@/shared/types/RiderSchedule';
import { confirm } from '@/shared/utils/alerts';
import { formatCurrency } from '@/shared/utils/formatCurrency';

export default function RiderProfileScreen() {
  const user = useCurrentUser();
  const { logout } = useSession();
  const { data, loading, error, reload, refresh, refreshing } = useFocusData(
    async () => {
      const [history, profile, schedules] = await Promise.all([
        getRiderHistory(user.id),
        getRiderProfile(user.id),
        listRiderSchedules(user.id),
      ]);
      return { history, profile, schedules };
    },
    { history: [] as Order[], profile: null as RiderProfile | null, schedules: [] as RiderSchedule[] },
    [user.id],
  );

  const delivered = data.history.filter((order) => order.status === 'delivered');
  const enabledShifts = data.schedules.filter((schedule) => schedule.isAvailable).length;

  async function onLogout() {
    if (await confirm('Log out?', 'You will stop receiving deliveries until you log back in.', 'Log out')) {
      await logout();
      router.replace('/(auth)/login');
    }
  }

  return (
    <Screen title="Profile" inTabs refreshing={refreshing} onRefresh={refresh} actions={[{ icon: 'create-outline', label: 'Edit profile', onPress: () => router.push('/(rider)/edit-profile') }]}>
      <Card style={styles.profile}>
        <Avatar name={user.fullName} uri={user.profileImage} size={64} tone="blue" />
        <View style={styles.flex}>
          <Text style={styles.name}>{user.fullName}</Text>
          <Text style={styles.muted}>{user.email}</Text>
          <View style={styles.badges}>
            <Badge label={data.profile ? 'Profile complete' : 'Setup required'} tone={data.profile ? 'success' : 'warning'} />
            <Badge label={`${enabledShifts} active shifts`} tone={enabledShifts > 0 ? 'brand' : 'neutral'} />
          </View>
        </View>
      </Card>
      {loading ? (
        <LoadingView message="Loading rider profile..." />
      ) : error ? (
        <ErrorView message={error} onRetry={() => reload()} />
      ) : (
        <>
          <View style={styles.row}>
            <StatTile value={String(delivered.length)} label="Deliveries" />
            <StatTile value={formatCurrency(delivered.reduce((sum, order) => sum + order.deliveryFee, 0))} label="Earned" />
          </View>
          <Card style={styles.details}>
            <Text style={styles.cardHeading}>Rider details</Text>
            <InfoRow label="Phone" value={user.mobile ?? 'Not added'} />
            <Divider />
            <InfoRow label="Address" value={user.address ?? 'Not added'} />
            <Divider />
            <InfoRow label="Emergency contact" value={data.profile?.emergencyContact ?? 'Not added'} />
          </Card>
          <Card style={styles.details} tone="brand">
            <Text style={styles.cardHeading}>Delivery vehicle</Text>
            <InfoRow label="Vehicle" value={data.profile ? VEHICLE_LABELS[data.profile.vehicleType] : 'Not added'} />
            {data.profile?.vehicleType !== 'bicycle' ? (
              <>
                <Divider />
                <InfoRow label="Registration" value={data.profile?.vehicleNumber ?? 'Not added'} />
                <Divider />
                <InfoRow label="Driving licence" value={data.profile?.licenseNumber ?? 'Not added'} />
              </>
            ) : null}
          </Card>
          <View style={styles.menu}>
            <MenuRow icon="person-outline" label={data.profile ? 'Edit rider & vehicle details' : 'Create rider profile'} onPress={() => router.push('/(rider)/edit-profile')} />
            <MenuRow icon="calendar-outline" label="Working schedule" detail={`${enabledShifts} active`} onPress={() => router.push('/(rider)/availability')} />
            <MenuRow icon="bicycle-outline" label="Current deliveries" onPress={() => router.push('/(rider)/(tabs)/current')} />
            <MenuRow icon="time-outline" label="Delivery history" onPress={() => router.push('/(rider)/(tabs)/history')} />
            <MenuRow icon="log-out-outline" label="Log out" danger onPress={onLogout} />
          </View>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  profile: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  flex: {
    flex: 1,
    gap: 4,
  },
  name: {
    ...typography.sectionTitle,
    color: colors.ink,
  },
  muted: {
    ...typography.caption,
    color: colors.muted,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  menu: {
    gap: spacing.sm,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  details: {
    gap: spacing.md,
    padding: spacing.lg,
  },
  cardHeading: {
    ...typography.sectionTitle,
    color: colors.ink,
  },
});
