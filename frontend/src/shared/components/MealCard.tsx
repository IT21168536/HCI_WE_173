import { Pressable, StyleSheet, Text, View } from 'react-native';
import { isMealSoldOut, type Meal } from '@/shared/types/Meal';
import { colors } from '@/shared/theme/colors';
import { radius } from '@/shared/theme/radius';
import { spacing } from '@/shared/theme/spacing';
import { typography } from '@/shared/theme/typography';
import { formatCurrency } from '@/shared/utils/formatCurrency';
import { Icon } from './Icon';
import { MealImage } from './MealImage';
import { Badge } from './ui';

type MealCardProps = {
  meal: Meal;
  onPress?: () => void;
  favorite?: boolean;
  onToggleFavorite?: () => void;
  onAdd?: () => void;
};

/** Customer meal card: photo, cook, rating, price and what's left today. */
export function MealCard({ meal, onPress, favorite, onToggleFavorite, onAdd }: MealCardProps) {
  const soldOut = isMealSoldOut(meal);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${meal.name} by ${meal.cookName ?? 'a local cook'}, ${formatCurrency(meal.price)}${soldOut ? ', sold out' : ''}`}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <MealImage uri={meal.imagePath} size={84} dimmed={soldOut} />
      <View style={styles.copy}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={2}>
            {meal.name}
          </Text>
          {onToggleFavorite ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={favorite ? `Remove ${meal.name} from favourites` : `Save ${meal.name} to favourites`}
              hitSlop={10}
              onPress={onToggleFavorite}
            >
              <Icon name={favorite ? 'heart' : 'heart-outline'} size={20} color={favorite ? colors.brand : colors.muted} />
            </Pressable>
          ) : null}
        </View>
        <Text style={styles.meta} numberOfLines={1}>
          by {meal.cookName ?? 'Local cook'}
          {meal.cookLocation ? ` · ${meal.cookLocation}` : ''}
        </Text>
        <View style={styles.row}>
          {meal.averageRating ? (
            <View style={styles.rating}>
              <Icon name="star" size={13} color={colors.star} />
              <Text style={styles.meta}>
                {meal.averageRating.toFixed(1)} ({meal.reviewCount})
              </Text>
            </View>
          ) : (
            <Text style={styles.meta}>New cook</Text>
          )}
          {soldOut ? (
            <Badge label="Sold out today" tone="neutral" />
          ) : (
            <Text style={styles.portions}>{meal.availableQuantity} left</Text>
          )}
        </View>
        <View style={styles.row}>
          <Text style={styles.price}>{formatCurrency(meal.price)}</Text>
          {onAdd && !soldOut ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Add ${meal.name} to cart`}
              hitSlop={8}
              onPress={onAdd}
              style={({ pressed }) => [styles.add, pressed && styles.pressed]}
            >
              <Icon name="cart-outline" size={18} color={colors.surface} />
            </Pressable>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
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
  copy: {
    flex: 1,
    gap: 3,
  },
  titleRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  title: {
    ...typography.cardTitle,
    color: colors.ink,
    flex: 1,
  },
  meta: {
    ...typography.caption,
    color: colors.muted,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rating: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 3,
  },
  portions: {
    ...typography.captionStrong,
    color: colors.success,
  },
  price: {
    ...typography.cardTitle,
    color: colors.brandText,
    fontWeight: '700',
  },
  add: {
    alignItems: 'center',
    backgroundColor: colors.header,
    borderRadius: radius.sm,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
});
