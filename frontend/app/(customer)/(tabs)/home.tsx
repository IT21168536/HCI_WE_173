import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useCurrentUser } from '@/core/auth/SessionContext';
import { addToCart, countCartItems, getCustomerMeals, listFavoriteMealIds, toggleFavorite } from '@/features/customer/services/customer.service';
import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorView, LoadingView } from '@/shared/components/LoadingView';
import { MealCard } from '@/shared/components/MealCard';
import { Screen } from '@/shared/components/Screen';
import { SearchBar } from '@/shared/components/SearchBar';
import { Chip, SectionHeader } from '@/shared/components/ui';
import { useFocusData } from '@/shared/hooks/useFocusData';
import { colors } from '@/shared/theme/colors';
import { spacing } from '@/shared/theme/spacing';
import { typography } from '@/shared/theme/typography';
import { MEAL_CATEGORIES, type Meal } from '@/shared/types/Meal';
import { showError } from '@/shared/utils/alerts';
import { greeting } from '@/shared/utils/dateUtils';

export default function CustomerHomeScreen() {
  const user = useCurrentUser();
  const [category, setCategory] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const { data, loading, error, reload, refresh, refreshing, setData } = useFocusData(
    async () => {
      const [meals, favorites, cartCount] = await Promise.all([
        getCustomerMeals({ category, query }),
        listFavoriteMealIds(user.id),
        countCartItems(user.id),
      ]);
      return { meals, favorites, cartCount };
    },
    { meals: [] as Meal[], favorites: [] as number[], cartCount: 0 },
    [category, query, user.id],
  );

  async function onToggleFavorite(meal: Meal) {
    try {
      const saved = await toggleFavorite(user.id, meal.id);
      setData((current) => ({
        ...current,
        favorites: saved ? [...current.favorites, meal.id] : current.favorites.filter((id) => id !== meal.id),
      }));
    } catch (err) {
      showError('Could not update favourites', err);
    }
  }

  async function onAdd(meal: Meal) {
    try {
      await addToCart(user.id, meal.id, 1);
      setData((current) => ({ ...current, cartCount: current.cartCount + 1 }));
      Alert.alert('Added to cart', `${meal.name} is in your cart.`);
    } catch (err) {
      showError('Could not add to cart', err);
    }
  }

  const firstName = user.fullName.split(' ')[0];

  return (
    <Screen
      title={`Deliver to ${firstName}`}
      subtitle={user.address ?? 'Add your delivery address in Profile'}
      inTabs
      refreshing={refreshing}
      onRefresh={refresh}
      actions={[
        { icon: 'cart-outline', label: 'Cart', onPress: () => router.push('/(customer)/cart'), badge: data.cartCount },
      ]}
    >
      <SearchBar
        value={query}
        onChangeText={setQuery}
        placeholder="Search home-cooked meals or cooks"
        onFilterPress={() => router.push({ pathname: '/(customer)/search', params: { q: query } })}
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categories}>
        <Chip label="All" selected={!category} onPress={() => setCategory(null)} />
        {MEAL_CATEGORIES.map((item) => (
          <Chip key={item} label={item} selected={category === item} onPress={() => setCategory(category === item ? null : item)} />
        ))}
      </ScrollView>

      <View style={styles.greeting}>
        <Text style={styles.greetingTitle}>{greeting()},</Text>
        <Text style={styles.greetingName}>{firstName}</Text>
      </View>

      <SectionHeader title={category ?? (query ? 'Search results' : 'Home-cooked near you')} actionLabel="Filters" onAction={() => router.push('/(customer)/search')} />

      {loading ? (
        <LoadingView message="Loading meals..." />
      ) : error ? (
        <ErrorView message={error} onRetry={() => reload()} />
      ) : data.meals.length === 0 ? (
        <EmptyState
          title={query || category ? 'No meals match your filters.' : 'No meals available in this area.'}
          message={query || category ? 'Try another search or category.' : 'Home cooks add new meals every day. Check back soon.'}
          icon="search-outline"
          actionLabel={query || category ? 'Clear filters' : undefined}
          onAction={() => {
            setQuery('');
            setCategory(null);
          }}
        />
      ) : (
        data.meals.map((meal) => (
          <MealCard
            key={meal.id}
            meal={meal}
            favorite={data.favorites.includes(meal.id)}
            onToggleFavorite={() => onToggleFavorite(meal)}
            onAdd={() => onAdd(meal)}
            onPress={() => router.push({ pathname: '/(customer)/meal/[id]', params: { id: String(meal.id) } })}
          />
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  categories: {
    gap: spacing.sm,
    paddingRight: spacing.lg,
  },
  greeting: {
    marginTop: spacing.xs,
  },
  greetingTitle: {
    ...typography.screenTitle,
    color: colors.ink,
  },
  greetingName: {
    ...typography.bodyStrong,
    color: colors.muted,
  },
});
