import { Alert, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { AppButton } from '@/shared/components/AppButton';
import { ScreenHeader } from '@/shared/components/ScreenHeader';
import { screenStyles } from '@/shared/theme/screen';
import { moveCookOrder } from '@/features/cook/services/cookOrder.service';

export default function CookOrderDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const orderId = Number(id);

  async function move(status: 'accepted' | 'preparing' | 'ready' | 'cancelled') {
    try {
      await moveCookOrder(orderId, status);
      Alert.alert('Order updated', `Order moved to ${status}.`);
    } catch (error) {
      Alert.alert('Status update failed', error instanceof Error ? error.message : 'Please try again.');
    }
  }

  return (
    <ScrollView style={screenStyles.container} contentContainerStyle={screenStyles.content}>
      <ScreenHeader title={`Order #${orderId}`} subtitle="Cook workflow: accepted to preparing to ready." />
      <AppButton title="Accept order" onPress={() => move('accepted')} />
      <AppButton title="Mark preparing" variant="secondary" onPress={() => move('preparing')} />
      <AppButton title="Mark ready" variant="secondary" onPress={() => move('ready')} />
      <AppButton title="Cancel order" variant="danger" onPress={() => move('cancelled')} />
    </ScrollView>
  );
}
