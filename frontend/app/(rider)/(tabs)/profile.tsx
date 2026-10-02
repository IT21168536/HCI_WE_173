import { ScrollView } from 'react-native';
import { router } from 'expo-router';
import { AppButton } from '@/shared/components/AppButton';
import { ScreenHeader } from '@/shared/components/ScreenHeader';
import { clearSession } from '@/core/auth/session.service';
import { screenStyles } from '@/shared/theme/screen';

export default function RiderProfileScreen() {
  async function logout() {
    await clearSession();
    router.replace('/(auth)/login' as any);
  }

  return (
    <ScrollView style={screenStyles.container} contentContainerStyle={screenStyles.content}>
      <ScreenHeader title="Rider profile" subtitle="Availability, contact details, and delivery account." />
      <AppButton title="Logout" variant="outline" onPress={logout} />
    </ScrollView>
  );
}
