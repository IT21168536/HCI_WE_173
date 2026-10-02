import { ScrollView } from 'react-native';
import { ScreenHeader } from '@/shared/components/ScreenHeader';
import { EmptyState } from '@/shared/components/EmptyState';
import { screenStyles } from '@/shared/theme/screen';

export default function CheckoutScreen() {
  return (
    <ScrollView style={screenStyles.container} contentContainerStyle={screenStyles.content}>
      <ScreenHeader title="Checkout" subtitle="Delivery or pickup, schedule time, and confirm order." />
      <EmptyState title="No checkout items" message="Your selected meals will appear here." />
    </ScrollView>
  );
}
