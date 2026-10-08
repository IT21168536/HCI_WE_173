import { router } from 'expo-router';
import { useCurrentUser } from '@/core/auth/SessionContext';
import { addToCart, listFavoriteMeals, toggleFavorite } from '@/features/customer/services/customer.service';
import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorView, LoadingView } from '@/shared/components/LoadingView';
import { MealCard } from '@/shared/components/MealCard';
import { Screen } from '@/shared/components/Screen';
import { useFocusData } from '@/shared/hooks/useFocusData';
import type { Meal } from '@/shared/types/Meal';
import { showError } from '@/shared/utils/alerts';

export default function CustomerFavoritesScreen() {
  const user = useCurrentUser();
  const { data: meals, loading, error, reload, refresh, refreshing, setData } = useFocusData(() => listFavoriteMeals(user.id), [] as Meal[], [user.id]);

  async function onRemove(meal: Meal) {
    try {
      await toggleFavorite(user.id, meal.id);
      setData((current) => current.filter((item) => item.id !== meal.id));
    } catch (err) {
      showError('Could not update favourites', err);
    }
  }

  async function onAdd(meal: Meal) {
    try {
      await addToCart(user.id, meal.id, 1);
      router.push('/(customer)/cart');
    } catch (err) {
      showError('Could not add to cart', err);
    }
  }

  return (
    <Screen title="Favorite meals" subtitle="Keep trusted home cooks close" inTabs refreshing={refreshing} onRefresh={refresh}>
      {loading ? (
        <LoadingView message="Loading favourites..." />
      ) : error ? (
        <ErrorView message={error} onRetry={() => reload()} />
      ) : meals.length === 0 ? (
        <EmptyState
          title="No favorites yet"
          message="Tap the heart on a meal to save it here for quick ordering."
          icon="heart-outline"
          actionLabel="Browse meals"
          onAction={() => router.push('/(customer)/(tabs)/home')}
        />
      ) : (
        meals.map((meal) => (
          <MealCard
            key={meal.id}
            meal={meal}
            favorite
            onToggleFavorite={() => onRemove(meal)}
            onAdd={() => onAdd(meal)}
            onPress={() => router.push({ pathname: '/(customer)/meal/[id]', params: { id: String(meal.id) } })}
          />
        ))
      )}
    </Screen>
  );
}
