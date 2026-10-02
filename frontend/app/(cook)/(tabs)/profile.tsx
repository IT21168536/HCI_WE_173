import { ScrollView } from 'react-native';
import { router } from 'expo-router';
import { AppButton } from '@/shared/components/AppButton';
import { ScreenHeader } from '@/shared/components/ScreenHeader';
import { clearSession } from '@/core/auth/session.service';
import { screenStyles } from '@/shared/theme/screen';

export default function CookProfileScreen() {
  async function logout() {
    await clearSession();
    router.replace('/(auth)/login' as any);
  }

  return (
    <ScrollView style={screenStyles.container} contentContainerStyle={screenStyles.content}>
      <ScreenHeader title="Cook profile" subtitle="Business name, hygiene information, and location." />
      <AppButton title="Logout" variant="outline" onPress={logout} />
    </ScrollView>
  );
}
