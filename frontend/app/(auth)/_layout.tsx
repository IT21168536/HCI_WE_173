import { Redirect, Stack } from 'expo-router';
import { homeRouteFor } from '@/core/auth/auth.service';
import { useSession } from '@/core/auth/SessionContext';
import { colors } from '@/shared/theme/colors';

export default function AuthLayout() {
  const { user, loading } = useSession();

  if (!loading && user) {
    return <Redirect href={homeRouteFor(user.role)} />;
  }

  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.surface } }} />;
}
