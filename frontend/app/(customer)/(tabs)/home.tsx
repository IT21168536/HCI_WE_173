import { useState } from 'react';
import { FlatList, Text } from 'react-native';
import { router } from 'expo-router';
import { EmptyState } from '@/shared/components/EmptyState';
import { LoadingView } from '@/shared/components/LoadingView';
import { MealCard } from '@/shared/components/MealCard';
import { ScreenHeader } from '@/shared/components/ScreenHeader';
import { SearchBar } from '@/shared/components/SearchBar';
import { screenStyles } from '@/shared/theme/screen';
import { useCustomerMeals } from '@/features/customer/hooks/useCustomerMeals';
import { colors } from '@/shared/theme/colors';

export default function CustomerHomeScreen() {
  const [search, setSearch] = useState('');
  const { meals, loading, error } = useCustomerMeals(search);

  return (
    <FlatList
      style={screenStyles.container}
      contentContainerStyle={screenStyles.content}
      data={meals}
      keyExtractor={(item) => String(item.id)}
      ListHeaderComponent={
        <>
          <ScreenHeader title="Home-cooked meals" subtitle="Search home-cooked meals or cooks" />
          <SearchBar value={search} onChangeText={setSearch} placeholder="Rice & curry, vegetarian, cook name" />
          {error ? <Text style={{ color: colors.danger }}>{error}</Text> : null}
        </>
      }
      ListEmptyComponent={
        loading ? <LoadingView message="Loading meals..." /> : <EmptyState title="No meals available" message="No meals match your filters." />
      }
      renderItem={({ item }) => <MealCard meal={item} onPress={() => router.push(`/(customer)/meal/${item.id}` as any)} />}
    />
  );
}
