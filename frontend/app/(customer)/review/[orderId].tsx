import { ScrollView } from 'react-native';
import { ScreenHeader } from '@/shared/components/ScreenHeader';
import { EmptyState } from '@/shared/components/EmptyState';
import { screenStyles } from '@/shared/theme/screen';

export default function ReviewOrderScreen() {
  return (
    <ScrollView style={screenStyles.container} contentContainerStyle={screenStyles.content}>
      <ScreenHeader title="Review order" subtitle="Rate the meal and help neighbors choose trusted cooks." />
      <EmptyState title="Review form ready" message="Connect this to completed delivered orders." />
    </ScrollView>
  );
}
