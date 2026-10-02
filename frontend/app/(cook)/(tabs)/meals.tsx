import { useEffect, useState } from 'react';
import { FlatList } from 'react-native';
import { router } from 'expo-router';
import { AppButton } from '@/shared/components/AppButton';
import { EmptyState } from '@/shared/components/EmptyState';
import { LoadingView } from '@/shared/components/LoadingView';
import { MealCard } from '@/shared/components/MealCard';
import { ScreenHeader } from '@/shared/components/ScreenHeader';
import { screenStyles } from '@/shared/theme/screen';
import type { Meal } from '@/shared/types/Meal';
import { getCookMeals } from '@/features/cook/services/cookMeal.service';
import { useSessionUser } from '@/shared/hooks/useSessionUser';

export default function CookMealsScreen() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, loading: sessionLoading } = useSessionUser();

  useEffect(() => {
    if (sessionLoading) {
      return;
    }

    if (!user || user.role !== 'cook') {
      setLoading(false);
      return;
    }

    getCookMeals(user.id)
      .then(setMeals)
      .finally(() => setLoading(false));
  }, [sessionLoading, user]);

  return (
    <FlatList
      style={screenStyles.container}
      contentContainerStyle={screenStyles.content}
      data={meals}
      keyExtractor={(item) => String(item.id)}
      ListHeaderComponent={
        <>
          <ScreenHeader title="Your meals" subtitle="Availability, ingredients, allergens, and portions." />
          <AppButton title="Add meal" onPress={() => router.push('/(cook)/meal/add' as any)} />
        </>
      }
      ListEmptyComponent={loading ? <LoadingView message="Loading meals..." /> : <EmptyState title="No meals yet" message="Create your first home-cooked meal." />}
      renderItem={({ item }) => <MealCard meal={item} onPress={() => router.push(`/(cook)/meal/${item.id}/edit` as any)} />}
    />
  );
}
