import { ScrollView } from 'react-native';
import { AppButton } from '@/shared/components/AppButton';
import { ScreenHeader } from '@/shared/components/ScreenHeader';
import { screenStyles } from '@/shared/theme/screen';
import { router } from 'expo-router';

export default function CookDashboardScreen() {
  return (
    <ScrollView style={screenStyles.container} contentContainerStyle={screenStyles.content}>
      <ScreenHeader title="Cook dashboard" subtitle="Today’s menu, incoming orders, and portions at a glance." />
      <AppButton title="Manage meals" onPress={() => router.push('/(cook)/(tabs)/meals' as any)} />
      <AppButton title="View orders" variant="secondary" onPress={() => router.push('/(cook)/(tabs)/orders' as any)} />
    </ScrollView>
  );
}
