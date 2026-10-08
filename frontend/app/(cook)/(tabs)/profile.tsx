import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useCurrentUser, useSession } from '@/core/auth/SessionContext';
import { getCookProfile } from '@/features/cook/services/cook.service';
import { Avatar } from '@/shared/components/Avatar';
import { Screen } from '@/shared/components/Screen';
import { Badge, Card, MenuRow } from '@/shared/components/ui';
import { useFocusData } from '@/shared/hooks/useFocusData';
import { colors } from '@/shared/theme/colors';
import { spacing } from '@/shared/theme/spacing';
import { typography } from '@/shared/theme/typography';
import { confirm } from '@/shared/utils/alerts';

export default function CookProfileScreen() {
  const user = useCurrentUser();
  const { logout } = useSession();
  const { data: profile } = useFocusData(() => getCookProfile(user.id), null, [user.id]);

  async function onLogout() {
    if (await confirm('Log out?', 'You will stop seeing new orders until you log back in.', 'Log out')) {
      await logout();
      router.replace('/(auth)/login');
    }
  }

  return (
    <Screen title="Profile" variant="brand" inTabs actions={[{ icon: 'create-outline', label: 'Edit profile', onPress: () => router.push('/(cook)/edit-profile') }]}>
      <Card style={styles.profile}>
        <Avatar name={user.fullName} uri={user.profileImage} size={64} />
        <View style={styles.flex}>
          <Text style={styles.name}>{user.fullName}</Text>
          <Text style={styles.muted}>
            {profile?.businessName ?? 'Your kitchen'}
            {profile?.location ? ` · ${profile.location}` : ''}
          </Text>
          <View style={styles.badges}>
            {profile?.verificationStatus === 'verified' ? <Badge label="Verified cook" tone="success" /> : <Badge label="Verification pending" tone="warning" />}
            {profile?.rating ? <Badge label={`${profile.rating.toFixed(1)} rating`} /> : null}
          </View>
        </View>
      </Card>

      <View style={styles.menu}>
        <MenuRow icon="person-outline" label="Edit profile & kitchen" onPress={() => router.push('/(cook)/edit-profile')} />
        <MenuRow icon="layers-outline" label="Availability & portions" onPress={() => router.push('/(cook)/availability')} />
        <MenuRow icon="calendar-outline" label="Scheduled orders" onPress={() => router.push('/(cook)/scheduled')} />
        <MenuRow icon="time-outline" label="Order history" onPress={() => router.push('/(cook)/history')} />
        <MenuRow icon="bar-chart-outline" label="Sales & earnings" onPress={() => router.push('/(cook)/sales')} />
        <MenuRow icon="star-outline" label="Reviews & ratings" onPress={() => router.push('/(cook)/reviews')} />
        <MenuRow icon="notifications-outline" label="Notifications" onPress={() => router.push('/(cook)/notifications')} />
        <MenuRow icon="log-out-outline" label="Log out" danger onPress={onLogout} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  profile: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
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
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  menu: {
    gap: spacing.sm,
  },
});
