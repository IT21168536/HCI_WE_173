import { Stack } from 'expo-router';
import { colors } from '@/shared/theme/colors';

export default function CustomerLayout() {
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.soft } }} />;
}
