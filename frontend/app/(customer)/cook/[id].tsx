import { ScrollView } from 'react-native';
import { ScreenHeader } from '@/shared/components/ScreenHeader';
import { EmptyState } from '@/shared/components/EmptyState';
import { screenStyles } from '@/shared/theme/screen';

export default function CustomerCookProfileScreen() {
  return (
    <ScrollView style={screenStyles.container} contentContainerStyle={screenStyles.content}>
      <ScreenHeader title="Cook profile" subtitle="Hygiene notes, identity, meals, and reviews." />
      <EmptyState title="Cook profile loading soon" message="This route is ready for Member 1 customer work." />
    </ScrollView>
  );
}
