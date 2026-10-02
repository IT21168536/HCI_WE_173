import { ScrollView } from 'react-native';
import { EmptyState } from '@/shared/components/EmptyState';
import { ScreenHeader } from '@/shared/components/ScreenHeader';
import { screenStyles } from '@/shared/theme/screen';

export default function RiderHistoryScreen() {
  return (
    <ScrollView style={screenStyles.container} contentContainerStyle={screenStyles.content}>
      <ScreenHeader title="Delivery history" subtitle="Completed handovers and cancelled deliveries." />
      <EmptyState title="No completed deliveries" message="Delivered orders will appear here." />
    </ScrollView>
  );
}
