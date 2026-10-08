import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useCurrentUser } from '@/core/auth/SessionContext';
import { deleteMeal, getMeal } from '@/features/cook/services/cook.service';
import { AppButton } from '@/shared/components/AppButton';
import { ErrorView, LoadingView } from '@/shared/components/LoadingView';
import { MealImage } from '@/shared/components/MealImage';
import { Screen } from '@/shared/components/Screen';
import { IconCircle } from '@/shared/components/ui';
import { useFocusData } from '@/shared/hooks/useFocusData';
import { colors } from '@/shared/theme/colors';
import { spacing } from '@/shared/theme/spacing';
import { typography } from '@/shared/theme/typography';
import { showError } from '@/shared/utils/alerts';
import { formatCurrency } from '@/shared/utils/formatCurrency';

export default function DeleteMealScreen() {
  const user = useCurrentUser();
  const { id } = useLocalSearchParams<{ id: string }>();
  const mealId = Number(id);
  const [deleting, setDeleting] = useState(false);

  const { data: meal, loading, error, reload } = useFocusData(
    async () => {
      const found = await getMeal(mealId);
      if (!found || found.cookId !== user.id || found.deletedAt) throw new Error('This meal is not on your menu.');
      return found;
    },
    null,
    [mealId, user.id],
  );

  async function onDelete() {
    if (!meal) return;
    try {
      setDeleting(true);
      await deleteMeal(meal.id);
      router.dismissTo('/(cook)/(tabs)/meals');
    } catch (err) {
      showError('Could not delete meal', err);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Screen title="Delete Meal" back variant="brand">
      {loading ? (
        <LoadingView />
      ) : error || !meal ? (
        <ErrorView message={error ?? 'Meal not found.'} onRetry={() => reload()} />
      ) : (
        <View style={styles.sheet}>
          <IconCircle icon="trash-outline" size={64} />
          <View style={styles.message}>
            <Text accessibilityRole="header" style={styles.heading}>
              Delete this meal?
            </Text>
            <Text style={styles.description}>
              {meal.name} will be removed from your meals and from customers&apos; carts. Past orders stay in your history. This cannot be undone.
            </Text>
          </View>
          <View style={styles.summary}>
            <MealImage uri={meal.imagePath} size={46} rounded={23} />
            <View style={styles.flex}>
              <Text style={styles.name}>{meal.name}</Text>
              <Text style={styles.meta}>
                {meal.category ?? 'Meal'} · {formatCurrency(meal.price)} · {meal.availableQuantity} portions today
              </Text>
            </View>
          </View>
          <View style={styles.actions}>
            <AppButton title="Delete meal" variant="danger" loading={deleting} onPress={onDelete} />
            <AppButton title="Cancel" variant="ghost" onPress={() => router.back()} />
          </View>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  sheet: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    gap: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xxl,
  },
  message: {
    gap: spacing.sm,
  },
  heading: {
    ...typography.sectionTitle,
    color: colors.ink,
    fontSize: 18,
    textAlign: 'center',
  },
  description: {
    ...typography.body,
    color: colors.muted,
    lineHeight: 20,
    textAlign: 'center',
  },
  summary: {
    alignItems: 'center',
    alignSelf: 'stretch',
    backgroundColor: colors.soft,
    borderColor: '#DDDDDD',
    borderRadius: 9,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
  },
  flex: {
    flex: 1,
    gap: 4,
  },
  name: {
    ...typography.bodyStrong,
    color: colors.ink,
  },
  meta: {
    ...typography.caption,
    color: colors.muted,
  },
  actions: {
    alignSelf: 'stretch',
    gap: spacing.sm,
  },
});
