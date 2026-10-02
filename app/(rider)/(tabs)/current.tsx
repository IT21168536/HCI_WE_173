import { ScrollView } from 'react-native';
import { EmptyState } from '@/shared/components/EmptyState';
import { ScreenHeader } from '@/shared/components/ScreenHeader';
import { screenStyles } from '@/shared/theme/screen';

export default function CurrentDeliveryScreen() {
  return (
    <ScrollView style={screenStyles.container} contentContainerStyle={screenStyles.content}>
      <ScreenHeader title="Current delivery" subtitle="Pickup, customer address, and next status action." />
      <EmptyState title="No active delivery" message="Open a ready order from the dashboard to start pickup." />
    </ScrollView>
  );
}
