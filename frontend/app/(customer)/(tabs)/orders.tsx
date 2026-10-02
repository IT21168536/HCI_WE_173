import { ScrollView } from 'react-native';
import { EmptyState } from '@/shared/components/EmptyState';
import { ScreenHeader } from '@/shared/components/ScreenHeader';
import { screenStyles } from '@/shared/theme/screen';

export default function CustomerOrdersScreen() {
  return (
    <ScrollView style={screenStyles.container} contentContainerStyle={screenStyles.content}>
      <ScreenHeader title="Your orders" subtitle="Track requested, preparing, ready, and delivered meals." />
      <EmptyState title="No orders yet" message="Add a meal to your cart and checkout to start an order." />
    </ScrollView>
  );
}
