import { Alert, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { AppButton } from '@/shared/components/AppButton';
import { ScreenHeader } from '@/shared/components/ScreenHeader';
import { screenStyles } from '@/shared/theme/screen';
import { moveRiderDelivery } from '@/features/rider/services/riderDelivery.service';
import { getSessionUser } from '@/core/auth/session.service';

export default function RiderDeliveryDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const orderId = Number(id);

  async function move(status: 'picked_up' | 'on_the_way' | 'delivered') {
    try {
      const user = await getSessionUser();
      if (!user || user.role !== 'rider') {
        Alert.alert('Login required', 'Please login as a rider to update deliveries.');
        return;
      }

      await moveRiderDelivery(orderId, user.id, status);
      Alert.alert('Delivery updated', `Delivery moved to ${status.replace(/_/g, ' ')}.`);
    } catch (error) {
      Alert.alert('Status update failed', error instanceof Error ? error.message : 'Please try again.');
    }
  }

  return (
    <ScrollView style={screenStyles.container} contentContainerStyle={screenStyles.content}>
      <ScreenHeader title={`Delivery #${orderId}`} subtitle="Rider workflow: picked up to on the way to delivered." />
      <AppButton title="Confirm pickup" onPress={() => move('picked_up')} />
      <AppButton title="Start delivery" variant="secondary" onPress={() => move('on_the_way')} />
      <AppButton title="Complete delivery" variant="secondary" onPress={() => move('delivered')} />
    </ScrollView>
  );
}
