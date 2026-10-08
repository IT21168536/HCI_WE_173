import { StyleSheet, Text, View } from 'react-native';
import { useCurrentUser } from '@/core/auth/SessionContext';
import { getRatingSummary, listReviewsForCook } from '@/features/cook/services/cook.service';
import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorView, LoadingView } from '@/shared/components/LoadingView';
import { RatingStars } from '@/shared/components/RatingStars';
import { Screen } from '@/shared/components/Screen';
import { Badge, Card } from '@/shared/components/ui';
import { useFocusData } from '@/shared/hooks/useFocusData';
import { colors } from '@/shared/theme/colors';
import { spacing } from '@/shared/theme/spacing';
import { typography } from '@/shared/theme/typography';
import { formatRelative } from '@/shared/utils/dateUtils';

export default function CookReviewsScreen() {
  const user = useCurrentUser();
  const { data, loading, error, reload, refresh, refreshing } = useFocusData(
    async () => {
      const [summary, reviews] = await Promise.all([getRatingSummary(user.id), listReviewsForCook(user.id)]);
      return { summary, reviews };
    },
    null,
    [user.id],
  );

  if (loading) return <LoadingView fill />;
  if (error || !data) {
    return (
      <Screen title="Reviews & Ratings" back variant="brand">
        <ErrorView message={error ?? 'Could not load reviews.'} onRetry={() => reload()} />
      </Screen>
    );
  }

  const { summary, reviews } = data;

  return (
    <Screen title="Reviews & Ratings" back variant="brand" refreshing={refreshing} onRefresh={refresh}>
      <Card style={styles.summary}>
        <View style={styles.score}>
          <Text style={styles.average}>{summary.count ? summary.average.toFixed(1) : '–'}</Text>
          <RatingStars rating={summary.average} />
          <Text style={styles.muted}>{summary.count} reviews</Text>
        </View>
        <View style={styles.bars}>
          {summary.distribution.map((count, index) => {
            const stars = 5 - index;
            const share = summary.count ? count / summary.count : 0;
            return (
              <View key={stars} style={styles.barRow} accessibilityLabel={`${stars} stars: ${count} reviews`}>
                <Text style={styles.barLabel}>{stars}</Text>
                <View style={styles.track}>
                  <View style={[styles.fill, { width: `${Math.round(share * 100)}%` }]} />
                </View>
                <Text style={styles.barCount}>{count}</Text>
              </View>
            );
          })}
        </View>
      </Card>

      {reviews.length === 0 ? (
        <EmptyState title="No reviews yet" message="Customers can review an order after it is delivered." icon="star-outline" />
      ) : (
        reviews.map((review) => (
          <Card key={review.id}>
            <View style={styles.between}>
              <Text style={styles.name}>{review.customerName}</Text>
              <Text style={styles.muted}>{formatRelative(review.createdAt)}</Text>
            </View>
            <View style={styles.row}>
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
  summary: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.lg,
  },
  score: {
    alignItems: 'center',
    gap: 4,
    width: 92,
  },
  average: {
    color: colors.ink,
    fontSize: 34,
    fontWeight: '700',
  },
  muted: {
    ...typography.caption,
    color: colors.muted,
  },
  bars: {
    flex: 1,
    gap: 5,
  },
  barRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  barLabel: {
    ...typography.caption,
    color: colors.muted,
    width: 10,
  },
  track: {
    backgroundColor: '#EEEEEE',
    borderRadius: 3,
    flex: 1,
    height: 6,
    overflow: 'hidden',
  },
  fill: {
    backgroundColor: colors.star,
    borderRadius: 3,
    height: '100%',
  },
  barCount: {
    ...typography.caption,
    color: colors.muted,
    textAlign: 'right',
    width: 28,
  },
  between: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  name: {
    ...typography.bodyStrong,
    color: colors.ink,
  },
  body: {
    ...typography.body,
    color: colors.ink,
    lineHeight: 20,
  },
});
