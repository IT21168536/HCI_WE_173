import { Stack } from 'expo-router';
import { RoleGuard } from '@/shared/navigation/RoleGuard';
import { colors } from '@/shared/theme/colors';

export default function CustomerLayout() {
  return (
    <RoleGuard role="customer">
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.soft } }} />
    </RoleGuard>
  );
}
