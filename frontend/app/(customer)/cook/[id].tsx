import { StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useCurrentUser } from '@/core/auth/SessionContext';
import { getCookMeals, getCookProfile, getRatingSummary, listFavoriteMealIds, listReviewsForCook, toggleFavorite } from '@/features/customer/services/customer.service';
import { Avatar } from '@/shared/components/Avatar';
import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorView, LoadingView } from '@/shared/components/LoadingView';
import { MealCard } from '@/shared/components/MealCard';
import { RatingStars } from '@/shared/components/RatingStars';
import { Screen } from '@/shared/components/Screen';
import { Badge, Card, SectionHeader } from '@/shared/components/ui';
import { useFocusData } from '@/shared/hooks/useFocusData';
import { colors } from '@/shared/theme/colors';
import { spacing } from '@/shared/theme/spacing';
import { typography } from '@/shared/theme/typography';
import { showError } from '@/shared/utils/alerts';
import { formatRelative } from '@/shared/utils/dateUtils';

export default function CustomerCookProfileScreen() {
  const user = useCurrentUser();
  const { id } = useLocalSearchParams<{ id: string }>();
  const cookId = Number(id);

  const { data, loading, error, reload, setData } = useFocusData(
    async () => {
      const cook = await getCookProfile(cookId);
      if (!cook) {
        throw new Error('This cook is not on Worky Kitchen any more.');
      }
      const [meals, reviews, summary, favorites] = await Promise.all([
        getCookMeals(cookId, { onlyOrderable: false }),
        listReviewsForCook(cookId, 10),
        getRatingSummary(cookId),
        listFavoriteMealIds(user.id),
      ]);
      return { cook, meals, reviews, summary, favorites };
    },
    null,
    [cookId, user.id],
  );

  if (loading) {
    return <LoadingView message="Loading cook profile..." fill />;
  }
  if (error || !data) {
    return (
      <Screen title="Cook profile" back>
        <ErrorView message={error ?? 'Cook not found.'} onRetry={() => reload()} />
      </Screen>
    );
  }

  const { cook, meals, reviews, summary, favorites } = data;

  async function onToggleFavorite(mealId: number) {
    try {
      const saved = await toggleFavorite(user.id, mealId);
      setData((current) =>
        current ? { ...current, favorites: saved ? [...current.favorites, mealId] : current.favorites.filter((item) => item !== mealId) } : current,
      );
    } catch (err) {
      showError('Could not update favourites', err);
    }
  }

  return (
    <Screen title={cook.businessName ?? 'Cook profile'} back>
      <Card style={styles.profile}>
        <Avatar name={cook.businessName ?? 'Cook'} uri={cook.profileImage} size={72} />
        <View style={styles.flex}>
          <Text style={styles.name}>{cook.businessName}</Text>
          <Text style={styles.muted}>
            by {cook.cookName} · {cook.location}
          </Text>
          <View style={styles.badges}>
            {cook.verificationStatus === 'verified' ? <Badge label="Verified kitchen" tone="success" /> : <Badge label="Verification pending" tone="warning" />}
            {!cook.isOpen ? <Badge label="Closed today" tone="neutral" /> : null}
          </View>
        </View>
      </Card>

      <Card>
        <View style={styles.ratingRow}>
          <Text style={styles.ratingValue}>{summary.count ? summary.average.toFixed(1) : '–'}</Text>
          <View>
            <RatingStars rating={summary.average} size={16} />
            <Text style={styles.muted}>{summary.count ? `${summary.count} reviews` : 'No reviews yet'}</Text>
          </View>
        </View>
        {cook.description ? <Text style={styles.body}>{cook.description}</Text> : null}
        {cook.hygieneInfo ? (
          <>
            <Text style={styles.label}>Hygiene & food safety</Text>
            <Text style={styles.body}>{cook.hygieneInfo}</Text>
          </>
        ) : null}
      </Card>

      <SectionHeader title={`Meals (${meals.length})`} />
      {meals.length === 0 ? (
        <EmptyState title="No meals on the menu yet" message="Check back later today." />
      ) : (
        meals.map((meal) => (
          <MealCard
            key={meal.id}
            meal={{ ...meal, cookName: cook.businessName, cookLocation: cook.location }}
            favorite={favorites.includes(meal.id)}
            onToggleFavorite={() => onToggleFavorite(meal.id)}
            onPress={() => router.push({ pathname: '/(customer)/meal/[id]', params: { id: String(meal.id) } })}
          />
        ))
      )}

      <SectionHeader title="Reviews" />
      {reviews.length === 0 ? (
        <EmptyState title="No reviews yet" message="Be the first to review this kitchen after your order." icon="star-outline" />
      ) : (
        reviews.map((review) => (
          <Card key={review.id}>
            <View style={styles.between}>
              <Text style={styles.reviewer}>{review.customerName}</Text>
              <Text style={styles.muted}>{formatRelative(review.createdAt)}</Text>
            </View>
            <View style={styles.badges}>
              <RatingStars rating={review.rating} />
              {review.mealName ? <Badge label={review.mealName} tone="neutral" /> : null}
            </View>
            {review.comment ? <Text style={styles.body}>{review.comment}</Text> : null}
          </Card>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    gap: 4,
  },
  profile: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  name: {
    ...typography.sectionTitle,
    color: colors.ink,
  },
  muted: {
    ...typography.caption,
    color: colors.muted,
  },
  badges: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  ratingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  ratingValue: {
    color: colors.ink,
    fontSize: 32,
    fontWeight: '700',
  },
  label: {
    ...typography.label,
    color: colors.muted,
    textTransform: 'uppercase',
  },
  body: {
    ...typography.body,
    color: colors.ink,
    lineHeight: 20,
  },
  between: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  reviewer: {
    ...typography.bodyStrong,
    color: colors.ink,
  },
});
