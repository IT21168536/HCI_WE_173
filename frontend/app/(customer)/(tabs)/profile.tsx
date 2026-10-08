import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useCurrentUser, useSession } from '@/core/auth/SessionContext';
import { getCustomerOrders } from '@/features/customer/services/customer.service';
import { Avatar } from '@/shared/components/Avatar';
import { Screen } from '@/shared/components/Screen';
import { Card, InfoRow, MenuRow, StatTile } from '@/shared/components/ui';
import { useFocusData } from '@/shared/hooks/useFocusData';
import { colors } from '@/shared/theme/colors';
import { spacing } from '@/shared/theme/spacing';
import { typography } from '@/shared/theme/typography';
import type { Order } from '@/shared/types/Order';
import { confirm } from '@/shared/utils/alerts';

export default function CustomerProfileScreen() {
  const user = useCurrentUser();
  const { logout } = useSession();
  const { data: orders } = useFocusData(() => getCustomerOrders(user.id), [] as Order[], [user.id]);

  async function onLogout() {
    if (await confirm('Log out?', 'You can log back in any time.', 'Log out')) {
      await logout();
      router.replace('/(auth)/login');
    }
  }

  const delivered = orders.filter((order) => order.status === 'delivered').length;
  const active = orders.filter((order) => !['delivered', 'cancelled'].includes(order.status)).length;

  return (
    <Screen title="Profile" inTabs actions={[{ icon: 'create-outline', label: 'Edit profile', onPress: () => router.push('/(customer)/edit-profile') }]}>
      <Card style={styles.profile}>
        <Avatar name={user.fullName} uri={user.profileImage} size={64} />
        <View style={styles.flex}>
          <Text style={styles.name}>{user.fullName}</Text>
          <Text style={styles.muted}>{user.email}</Text>
        </View>
      </Card>

      <View style={styles.row}>
        <StatTile value={String(active)} label="Active orders" onPress={() => router.push('/(customer)/(tabs)/orders')} />
        <StatTile value={String(delivered)} label="Meals enjoyed" />
      </View>

      <Card>
        <InfoRow label="Phone" value={user.mobile ?? 'Not added'} />
        <InfoRow label="Delivery address" value={user.address ?? 'Not added'} />
      </Card>

      <View style={styles.menu}>
        <MenuRow icon="person-outline" label="Edit profile" onPress={() => router.push('/(customer)/edit-profile')} />
        <MenuRow icon="receipt-outline" label="My orders" onPress={() => router.push('/(customer)/(tabs)/orders')} />
        <MenuRow icon="heart-outline" label="Favorite meals" onPress={() => router.push('/(customer)/(tabs)/favorites')} />
        <MenuRow icon="cart-outline" label="Cart" onPress={() => router.push('/(customer)/cart')} />
        <MenuRow icon="log-out-outline" label="Log out" danger onPress={onLogout} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    gap: 2,
  },
  profile: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
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
});
