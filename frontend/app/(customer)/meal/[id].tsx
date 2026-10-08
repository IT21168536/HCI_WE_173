import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useCurrentUser } from '@/core/auth/SessionContext';
import { addToCart, getCookProfile, getMeal, isFavorite, listReviewsForCook, toggleFavorite } from '@/features/customer/services/customer.service';
import { AppButton } from '@/shared/components/AppButton';
import { Avatar } from '@/shared/components/Avatar';
import { Icon } from '@/shared/components/Icon';
import { ErrorView, LoadingView } from '@/shared/components/LoadingView';
import { MealImage } from '@/shared/components/MealImage';
import { RatingStars } from '@/shared/components/RatingStars';
import { Screen } from '@/shared/components/Screen';
import { Badge, Card, SectionHeader, Stepper } from '@/shared/components/ui';
import { useFocusData } from '@/shared/hooks/useFocusData';
import { colors } from '@/shared/theme/colors';
import { spacing } from '@/shared/theme/spacing';
import { typography } from '@/shared/theme/typography';
import { isMealSoldOut } from '@/shared/types/Meal';
import { showError } from '@/shared/utils/alerts';
import { formatCurrency } from '@/shared/utils/formatCurrency';
import { formatRelative } from '@/shared/utils/dateUtils';

export default function MealDetailsScreen() {
  const user = useCurrentUser();
  const { id } = useLocalSearchParams<{ id: string }>();
  const mealId = Number(id);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  const { data, loading, error, reload, setData } = useFocusData(
    async () => {
      const meal = await getMeal(mealId);
      if (!meal || meal.deletedAt) {
        throw new Error('This meal is no longer available.');
      }
      const [cook, reviews, favorite] = await Promise.all([
        getCookProfile(meal.cookId),
        listReviewsForCook(meal.cookId, 3),
        isFavorite(user.id, meal.id),
      ]);
      return { meal, cook, reviews, favorite };
    },
    null,
    [mealId, user.id],
  );

  if (loading) {
    return <LoadingView message="Loading meal..." fill />;
  }
  if (error || !data) {
    return (
      <Screen title="Meal" back>
        <ErrorView message={error ?? 'Meal not found.'} onRetry={() => reload()} />
      </Screen>
    );
  }

  const { meal, cook, reviews, favorite } = data;
  const soldOut = isMealSoldOut(meal);

  async function onFavorite() {
    try {
      const saved = await toggleFavorite(user.id, meal.id);
      setData((current) => (current ? { ...current, favorite: saved } : current));
    } catch (err) {
      showError('Could not update favourites', err);
    }
  }

  async function onAdd() {
    try {
      setAdding(true);
      await addToCart(user.id, meal.id, quantity);
      Alert.alert('Added to cart', `${quantity} × ${meal.name}`, [
        { text: 'Keep browsing', style: 'cancel' },
        { text: 'View cart', onPress: () => router.push('/(customer)/cart') },
      ]);
    } catch (err) {
      showError('Could not add to cart', err);
    } finally {
      setAdding(false);
    }
  }

  return (
    <Screen
      title={meal.name}
      back
      actions={[{ icon: favorite ? 'heart' : 'heart-outline', label: favorite ? 'Remove from favourites' : 'Save to favourites', onPress: onFavorite }]}
      footer={
        soldOut ? (
          <AppButton title="Sold out for today" disabled />
        ) : (
          <View style={styles.footerRow}>
            <Stepper label="portions" value={quantity} min={1} max={meal.availableQuantity} onChange={setQuantity} />
            <AppButton title={`Add · ${formatCurrency(meal.price * quantity)}`} loading={adding} onPress={onAdd} flex icon="cart-outline" />
          </View>
        )
      }
    >
      <MealImage uri={meal.imagePath} height={200} rounded={14} dimmed={soldOut} />

      <View style={styles.titleRow}>
        <View style={styles.flex}>
          <Text style={styles.name}>{meal.name}</Text>
          {meal.category ? <Text style={styles.muted}>{meal.category}</Text> : null}
        </View>
        <Text style={styles.price}>{formatCurrency(meal.price)}</Text>
      </View>
      {soldOut ? <Badge label="Sold out for today" tone="neutral" /> : <Badge label={`${meal.availableQuantity} portions available today`} tone="success" />}

      {meal.description ? <Text style={styles.body}>{meal.description}</Text> : null}

      {cook ? (
        <Card
          onPress={() => router.push({ pathname: '/(customer)/cook/[id]', params: { id: String(cook.userId) } })}
          accessibilityLabel={`View ${cook.businessName} profile`}
          style={styles.cookCard}
        >
          <Avatar name={cook.businessName ?? cook.cookName ?? 'Cook'} uri={cook.profileImage} size={46} />
          <View style={styles.flex}>
            <Text style={styles.cookName}>{cook.businessName}</Text>
            <Text style={styles.muted}>
              {cook.cookName} · {cook.location}
            </Text>
            {cook.rating ? (
              <View style={styles.inline}>
                <RatingStars rating={cook.rating} size={12} />
                <Text style={styles.muted}>
                  {cook.rating.toFixed(1)} · {cook.reviewCount} reviews
                </Text>
              </View>
            ) : null}
          </View>
          <Icon name="chevron-forward" size={18} color={colors.muted} />
        </Card>
      ) : null}

      <Card>
        <Text style={styles.cardTitle}>Ingredients</Text>
        <Text style={styles.body}>{meal.ingredients ?? 'Ask the cook for details.'}</Text>
        <Text style={styles.cardTitle}>Allergens</Text>
        <Text style={styles.body}>{meal.allergens ?? 'Not listed'}</Text>
        {cook?.hygieneInfo ? (
          <>
            <Text style={styles.cardTitle}>Kitchen hygiene</Text>
            <Text style={styles.body}>{cook.hygieneInfo}</Text>
          </>
        ) : null}
      </Card>

      {reviews.length > 0 ? (
        <>
          <SectionHeader
            title="What customers say"
            actionLabel="See all"
            onAction={() => router.push({ pathname: '/(customer)/cook/[id]', params: { id: String(meal.cookId) } })}
          />
          {reviews.map((review) => (
            <Card key={review.id}>
              <View style={styles.between}>
                <Text style={styles.cookName}>{review.customerName ?? 'Customer'}</Text>
                <Text style={styles.muted}>{formatRelative(review.createdAt)}</Text>
              </View>
              <RatingStars rating={review.rating} />
              {review.comment ? <Text style={styles.body}>{review.comment}</Text> : null}
            </Card>
          ))}
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  footerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  titleRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.md,
  },
  name: {
    ...typography.screenTitle,
    color: colors.ink,
  },
  price: {
    ...typography.screenTitle,
    color: colors.brandText,
  },
  muted: {
    ...typography.caption,
    color: colors.muted,
  },
  body: {
    ...typography.body,
    color: colors.ink,
    lineHeight: 20,
  },
  cookCard: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  cookName: {
    ...typography.cardTitle,
    color: colors.ink,
  },
  cardTitle: {
    ...typography.label,
    color: colors.muted,
    marginTop: spacing.xs,
    textTransform: 'uppercase',
  },
  inline: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  between: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
