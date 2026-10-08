import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SessionProvider } from '@/core/auth/SessionContext';
import { colors } from '@/shared/theme/colors';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <SessionProvider>
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.soft } }} />
        <StatusBar style="light" />
      </SessionProvider>
    </SafeAreaProvider>
  );
}
