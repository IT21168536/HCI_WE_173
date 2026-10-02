import { ScrollView } from 'react-native';
import { EmptyState } from '@/shared/components/EmptyState';
import { ScreenHeader } from '@/shared/components/ScreenHeader';
import { screenStyles } from '@/shared/theme/screen';

export default function CartScreen() {
  return (
    <ScrollView style={screenStyles.container} contentContainerStyle={screenStyles.content}>
      <ScreenHeader title="Cart" subtitle="Review meals, portions, and delivery details." />
      <EmptyState title="Your cart is empty" message="Choose a meal from a local cook to begin checkout." />
    </ScrollView>
  );
}
