import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useCurrentUser } from '@/core/auth/SessionContext';
import { getCookMeals, setMealAvailability } from '@/features/cook/services/cook.service';
import { AppButton } from '@/shared/components/AppButton';
import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorView, LoadingView } from '@/shared/components/LoadingView';
import { MealImage } from '@/shared/components/MealImage';
import { Screen } from '@/shared/components/Screen';
import { Badge, Card, Notice, Stepper } from '@/shared/components/ui';
import { useFocusData } from '@/shared/hooks/useFocusData';
import { colors } from '@/shared/theme/colors';
import { spacing } from '@/shared/theme/spacing';
import { typography } from '@/shared/theme/typography';
import { isMealSoldOut, type Meal } from '@/shared/types/Meal';
import { confirm, showError } from '@/shared/utils/alerts';
import { formatTime } from '@/shared/utils/dateUtils';

const RESTOCK_PORTIONS = 10;

export default function AvailabilityScreen() {
  const user = useCurrentUser();
  const { data: meals, loading, error, reload, setData } = useFocusData(() => getCookMeals(user.id), [] as Meal[], [user.id]);

  async function save(meal: Meal, quantity: number, isAvailable: boolean) {
    const previous = meals;
    setData((current) =>
      current.map((item) => (item.id === meal.id ? { ...item, availableQuantity: quantity, isAvailable: isAvailable && quantity > 0 } : item)),
    );
    try {
      await setMealAvailability(meal.id, quantity, isAvailable);
    } catch (err) {
      setData(previous);
      showError('Could not update availability', err);
    }
  }

  async function markSoldOut(meal: Meal) {
    if (await confirm(`Mark ${meal.name} sold out?`, 'Customers will not be able to order it today.', 'Mark sold out')) {
      await save(meal, 0, false);
    }
  }

  return (
    <Screen title="Availability" back variant="brand">
      <Notice icon="information-circle-outline" text="Portions go down automatically when customers order. Adjust them here if you cook more or run out." />
      {loading ? (
        <LoadingView />
      ) : error ? (
        <ErrorView message={error} onRetry={() => reload()} />
      ) : meals.length === 0 ? (
        <EmptyState title="No meals yet" message="Add a meal to manage its portions." actionLabel="Add meal" onAction={() => router.push('/(cook)/meal/add')} />
      ) : (
        meals.map((meal) => {
          const out = isMealSoldOut(meal);
          return (
            <Card key={meal.id} style={styles.card}>
              <View style={styles.header}>
                <MealImage uri={meal.imagePath} size={44} rounded={10} dimmed={out} />
                <View style={styles.flex}>
                  <Text style={styles.name}>{meal.name}</Text>
                  <Text style={styles.muted}>
                    {meal.soldToday ? `${meal.soldToday} sold today` : 'None sold yet today'}
                    {out && meal.updatedAt ? ` · sold out at ${formatTime(meal.updatedAt)}` : ''}
                  </Text>
                </View>
                <Badge label={out ? 'Sold out' : 'Available'} tone={out ? 'neutral' : 'success'} />
              </View>
              {out ? (
                <AppButton title="Set available again" size="sm" onPress={() => save(meal, Math.max(meal.availableQuantity, RESTOCK_PORTIONS), true)} />
              ) : (
                <>
                  <View style={styles.between}>
                    <Text style={styles.label}>Remaining portions</Text>
                    <Stepper label={`${meal.name} portions`} value={meal.availableQuantity} min={1} onChange={(value) => save(meal, value, true)} />
                  </View>
                  <AppButton title="Mark sold out" size="sm" variant="outline" onPress={() => markSoldOut(meal)} />
                </>
              )}
            </Card>
          );
        })
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  flex: {
    flex: 1,
    gap: 2,
  },
  name: {
    ...typography.bodyStrong,
    color: colors.ink,
  },
  muted: {
    ...typography.caption,
    color: colors.muted,
  },
  between: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    ...typography.body,
    color: colors.muted,
  },
});
