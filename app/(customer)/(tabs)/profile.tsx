import { ScrollView } from 'react-native';
import { AppButton } from '@/shared/components/AppButton';
import { ScreenHeader } from '@/shared/components/ScreenHeader';
import { screenStyles } from '@/shared/theme/screen';
import { clearSession } from '@/core/auth/session.service';
import { router } from 'expo-router';

export default function CustomerProfileScreen() {
  async function logout() {
    await clearSession();
    router.replace('/(auth)/login' as any);
  }

  return (
    <ScrollView style={screenStyles.container} contentContainerStyle={screenStyles.content}>
      <ScreenHeader title="Customer profile" subtitle="Manage delivery info, preferences, and account access." />
      <AppButton title="Logout" variant="outline" onPress={logout} />
    </ScrollView>
  );
}
