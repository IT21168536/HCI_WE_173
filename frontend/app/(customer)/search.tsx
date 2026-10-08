import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useCurrentUser } from '@/core/auth/SessionContext';
import { addToCart, getCustomerMeals, listFavoriteMealIds, toggleFavorite, type MealFilters } from '@/features/customer/services/customer.service';
import { AppInput } from '@/shared/components/AppInput';
import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorView, LoadingView } from '@/shared/components/LoadingView';
import { MealCard } from '@/shared/components/MealCard';
import { Screen } from '@/shared/components/Screen';
import { SearchBar } from '@/shared/components/SearchBar';
import { Card, Chip, ChipRow, Segmented } from '@/shared/components/ui';
import { useFocusData } from '@/shared/hooks/useFocusData';
import { colors } from '@/shared/theme/colors';
import { typography } from '@/shared/theme/typography';
import { MEAL_CATEGORIES, type Meal } from '@/shared/types/Meal';
import { showError } from '@/shared/utils/alerts';

const priceOptions = [
  { label: 'Any price', value: null },
  { label: 'Under Rs 400', value: 400 },
  { label: 'Under Rs 600', value: 600 },
  { label: 'Under Rs 800', value: 800 },
];

const sortOptions: { value: NonNullable<MealFilters['sort']>; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_low', label: 'Lowest price' },
  { value: 'rating', label: 'Top rated' },
];

export default function SearchScreen() {
  const user = useCurrentUser();
  const params = useLocalSearchParams<{ q?: string }>();
  const [query, setQuery] = useState(params.q ?? '');
  const [category, setCategory] = useState<string | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [location, setLocation] = useState('');
  const [sort, setSort] = useState<NonNullable<MealFilters['sort']>>('newest');

  const { data, loading, error, reload, setData } = useFocusData(
    async () => {
      const [meals, favorites] = await Promise.all([
        getCustomerMeals({ query, category, maxPrice, location, sort }),
        listFavoriteMealIds(user.id),
      ]);
      return { meals, favorites };
    },
    { meals: [] as Meal[], favorites: [] as number[] },
    [query, category, maxPrice, location, sort, user.id],
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
      router.push('/(customer)/cart');
    } catch (err) {
      showError('Could not add to cart', err);
    }
  }

  const filtersOn = Boolean(category || maxPrice || location || query);

  return (
    <Screen title="Search & Filter" back>
      <SearchBar value={query} onChangeText={setQuery} placeholder="Rice & curry, kottu, cook name" autoFocus={!params.q} />

      <Card style={styles.filters}>
        <Text style={styles.label}>Meal type</Text>
        <ChipRow>
          {MEAL_CATEGORIES.map((item) => (
            <Chip key={item} label={item} selected={category === item} onPress={() => setCategory(category === item ? null : item)} />
          ))}
        </ChipRow>
        <Text style={styles.label}>Price per portion</Text>
        <ChipRow>
          {priceOptions.map((option) => (
            <Chip key={option.label} label={option.label} selected={maxPrice === option.value} onPress={() => setMaxPrice(option.value)} />
          ))}
        </ChipRow>
        <AppInput label="Kitchen area" icon="location-outline" value={location} onChangeText={setLocation} placeholder="e.g. Malabe, Rajagiriya" />
        <Text style={styles.label}>Sort by</Text>
        <Segmented options={sortOptions} value={sort} onChange={setSort} />
      </Card>

      <Text style={styles.count}>
        {loading ? 'Searching...' : `${data.meals.length} meal${data.meals.length === 1 ? '' : 's'} found`}
      </Text>

      {loading ? (
        <LoadingView message="Loading meals..." />
      ) : error ? (
        <ErrorView message={error} onRetry={() => reload()} />
      ) : data.meals.length === 0 ? (
        <EmptyState
          title="No meals match your filters."
          message="Try a different area, price or meal type."
          icon="search-outline"
          actionLabel={filtersOn ? 'Clear filters' : undefined}
          onAction={() => {
            setQuery('');
            setCategory(null);
            setMaxPrice(null);
            setLocation('');
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
  filters: {
    gap: 10,
  },
  label: {
    ...typography.label,
    color: colors.ink,
  },
  count: {
    ...typography.captionStrong,
    color: colors.muted,
  },
});
