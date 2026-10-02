import { ScrollView } from 'react-native';
import { EmptyState } from '@/shared/components/EmptyState';
import { ScreenHeader } from '@/shared/components/ScreenHeader';
import { screenStyles } from '@/shared/theme/screen';

export default function CustomerFavoritesScreen() {
  return (
    <ScrollView style={screenStyles.container} contentContainerStyle={screenStyles.content}>
      <ScreenHeader title="Favorite meals" subtitle="Keep trusted home cooks close." />
      <EmptyState title="No favorites yet" message="Save meals from the home screen for quick ordering." />
    </ScrollView>
  );
}
