import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useCurrentUser } from '@/core/auth/SessionContext';
import { getCookMeals } from '@/features/cook/services/cook.service';
import { EmptyState } from '@/shared/components/EmptyState';
import { Icon } from '@/shared/components/Icon';
import { ErrorView, LoadingView } from '@/shared/components/LoadingView';
import { MealImage } from '@/shared/components/MealImage';
import { Screen } from '@/shared/components/Screen';
import { SearchBar } from '@/shared/components/SearchBar';
import { Badge, Chip, ChipRow } from '@/shared/components/ui';
import { useFocusData } from '@/shared/hooks/useFocusData';
import { colors } from '@/shared/theme/colors';
import { radius } from '@/shared/theme/radius';
import { spacing } from '@/shared/theme/spacing';
import { typography } from '@/shared/theme/typography';
import { isMealSoldOut, type Meal } from '@/shared/types/Meal';
import { formatCurrency } from '@/shared/utils/formatCurrency';

type Filter = 'all' | 'available' | 'soldout';

export default function CookMealsScreen() {
  const user = useCurrentUser();
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const { data: meals, loading, error, reload, refresh, refreshing } = useFocusData(() => getCookMeals(user.id), [] as Meal[], [user.id]);

  const available = meals.filter((meal) => !isMealSoldOut(meal));
  const soldOut = meals.filter((meal) => isMealSoldOut(meal));
  const base = filter === 'available' ? available : filter === 'soldout' ? soldOut : meals;
  const visible = base.filter((meal) => meal.name.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <View style={styles.root}>
      <Screen
        title="My Meals"
        variant="brand"
        inTabs
        refreshing={refreshing}
        onRefresh={refresh}
        actions={[{ icon: 'add', label: 'Add meal', onPress: () => router.push('/(cook)/meal/add') }]}
        contentStyle={styles.content}
      >
        <SearchBar value={query} onChangeText={setQuery} placeholder="Search your meals" />
        <ChipRow>
          <Chip label={`All (${meals.length})`} selected={filter === 'all'} onPress={() => setFilter('all')} />
          <Chip label={`Available (${available.length})`} selected={filter === 'available'} onPress={() => setFilter('available')} />
          <Chip label={`Sold out (${soldOut.length})`} selected={filter === 'soldout'} onPress={() => setFilter('soldout')} />
        </ChipRow>
        <Pressable accessibilityRole="button" onPress={() => router.push('/(cook)/availability')} style={styles.availabilityLink}>
          <Icon name="layers-outline" size={18} color={colors.brandText} />
          <Text style={styles.link}>Update today&apos;s portions</Text>
          <Icon name="chevron-forward" size={16} color={colors.brandText} />
        </Pressable>

        {loading ? (
          <LoadingView message="Loading meals..." />
        ) : error ? (
          <ErrorView message={error} onRetry={() => reload()} />
        ) : visible.length === 0 ? (
          <EmptyState
            title={meals.length === 0 ? 'No meals yet' : 'No meals here'}
            message={meals.length === 0 ? 'Create your first home-cooked meal.' : 'Try another filter or search.'}
            actionLabel={meals.length === 0 ? 'Add a meal' : undefined}
            onAction={() => router.push('/(cook)/meal/add')}
          />
        ) : (
          visible.map((meal) => {
            const out = isMealSoldOut(meal);
            return (
              <Pressable
                key={meal.id}
                accessibilityRole="button"
                accessibilityLabel={`Edit ${meal.name}, ${formatCurrency(meal.price)}, ${out ? 'sold out' : `${meal.availableQuantity} left`}`}
                onPress={() => router.push({ pathname: '/(cook)/meal/[id]/edit', params: { id: String(meal.id) } })}
                style={({ pressed }) => [styles.meal, pressed && styles.pressed]}
              >
                <MealImage uri={meal.imagePath} size={64} dimmed={out} />
                <View style={styles.flex}>
                  <Text style={styles.name}>{meal.name}</Text>
                  <Text style={styles.muted}>
                    {meal.category ?? 'Meal'} · {out ? (meal.soldToday ? `${meal.soldToday} sold today` : 'Not on today') : `${meal.availableQuantity} left today`}
                  </Text>
                  <View style={styles.row}>
                    <Text style={styles.price}>{formatCurrency(meal.price)}</Text>
                    <Badge label={out ? 'Sold out' : 'Available'} tone={out ? 'neutral' : 'success'} />
                  </View>
                </View>
                <Icon name="create-outline" size={20} color={colors.muted} />
              </Pressable>
            );
          })
        )}
      </Screen>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Add meal"
        onPress={() => router.push('/(cook)/meal/add')}
        style={({ pressed }) => [styles.fab, pressed && styles.pressed]}
      >
        <Icon name="add" size={28} color={colors.surface} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    paddingBottom: 96,
  },
  flex: {
    flex: 1,
    gap: 4,
  },
  availabilityLink: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    flexDirection: 'row',
    gap: 6,
    minHeight: 36,
  },
  link: {
    ...typography.bodyStrong,
    color: colors.brandText,
  },
  meal: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
  },
  pressed: {
    opacity: 0.85,
  },
  name: {
    ...typography.cardTitle,
    color: colors.ink,
  },
  muted: {
    ...typography.caption,
    color: colors.muted,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  price: {
    ...typography.cardTitle,
    color: colors.brandText,
    fontWeight: '700',
  },
  fab: {
    alignItems: 'center',
    backgroundColor: colors.brandStrong,
    borderRadius: 28,
    bottom: spacing.lg,
    elevation: 6,
    height: 56,
    justifyContent: 'center',
    position: 'absolute',
    right: spacing.lg,
    shadowColor: colors.brand,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    width: 56,
  },
});
