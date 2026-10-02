import { ScrollView } from 'react-native';
import { ScreenHeader } from '@/shared/components/ScreenHeader';
import { EmptyState } from '@/shared/components/EmptyState';
import { screenStyles } from '@/shared/theme/screen';

export default function EditMealScreen() {
  return (
    <ScrollView style={screenStyles.container} contentContainerStyle={screenStyles.content}>
      <ScreenHeader title="Edit meal" subtitle="Update meal details, availability, portions, and photo." />
      <EmptyState title="Edit form ready" message="Connect this screen to the cook meal service." />
    </ScrollView>
  );
}
