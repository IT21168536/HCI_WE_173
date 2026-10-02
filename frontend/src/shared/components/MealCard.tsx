import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Meal } from '@/shared/types/Meal';
import { colors } from '@/shared/theme/colors';
import { radius } from '@/shared/theme/radius';
import { spacing } from '@/shared/theme/spacing';
import { typography } from '@/shared/theme/typography';
import { formatCurrency } from '@/shared/utils/formatCurrency';

type MealCardProps = {
  meal: Meal;
  onPress?: () => void;
};

export function MealCard({ meal, onPress }: MealCardProps) {
  const soldOut = meal.availableQuantity <= 0 || !meal.isAvailable;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`View ${meal.name}`}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.header}>
        <View style={styles.copy}>
          <Text style={styles.title}>{meal.name}</Text>
          <Text style={styles.meta}>by {meal.cookName ?? 'Local cook'}</Text>
        </View>
        <Text style={styles.price}>{formatCurrency(meal.price)}</Text>
      </View>
      {meal.ingredients ? <Text style={styles.body}>Ingredients: {meal.ingredients}</Text> : null}
      {meal.allergens ? <Text style={styles.body}>Allergens: {meal.allergens}</Text> : null}
      <Text style={[styles.quantity, soldOut && styles.soldOut]}>
        {soldOut ? 'Sold out for today' : `${meal.availableQuantity} portions available`}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.lg,
  },
  pressed: {
    opacity: 0.85,
  },
  header: {
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  copy: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    ...typography.cardTitle,
    color: colors.ink,
  },
  meta: {
    ...typography.caption,
    color: colors.muted,
  },
  body: {
    ...typography.caption,
    color: colors.ink,
  },
  price: {
    ...typography.cardTitle,
    color: colors.brandDark,
  },
  quantity: {
    ...typography.caption,
    color: colors.success,
    fontWeight: '600',
  },
  soldOut: {
    color: colors.danger,
  },
});
