import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useCurrentUser } from '@/core/auth/SessionContext';
import { createReview, getOrder, getOrderItems, getReviewForOrder } from '@/features/customer/services/customer.service';
import { AppButton } from '@/shared/components/AppButton';
import { AppInput } from '@/shared/components/AppInput';
import { ErrorView, LoadingView } from '@/shared/components/LoadingView';
import { orderNumber } from '@/shared/components/OrderCard';
import { RatingStars } from '@/shared/components/RatingStars';
import { Screen } from '@/shared/components/Screen';
import { Card, Chip, ChipRow, Notice } from '@/shared/components/ui';
import { useFocusData } from '@/shared/hooks/useFocusData';
import { colors } from '@/shared/theme/colors';
import { spacing } from '@/shared/theme/spacing';
import { typography } from '@/shared/theme/typography';
import { errorMessage } from '@/shared/utils/alerts';

const ratingWords = ['', 'Poor', 'Could be better', 'Good', 'Very good', 'Excellent'];
const quickTags = ['Tasty', 'Generous portion', 'Fresh', 'Well packed', 'Arrived hot', 'Too spicy'];

export default function ReviewOrderScreen() {
  const user = useCurrentUser();
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const id = Number(orderId);
  const [rating, setRating] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [commentError, setCommentError] = useState<string | undefined>();

  const { data, loading, error, reload } = useFocusData(
    async () => {
      const order = await getOrder(id);
      if (!order || order.customerId !== user.id) throw new Error('Order not found.');
      const [items, existing] = await Promise.all([getOrderItems(id), getReviewForOrder(id)]);
      return { order, items, existing };
    },
    null,
    [id, user.id],
  );

  if (loading) {
    return <LoadingView message="Loading order..." fill />;
  }
  if (error || !data) {
    return (
      <Screen title="Review order" back>
        <ErrorView message={error ?? 'Order not found.'} onRetry={() => reload()} />
      </Screen>
    );
  }

  const { order, items, existing } = data;

  async function onSubmit() {
    if (rating === 0) {
      setFormError('Tap the stars to choose a rating.');
      return;
    }
    const text = [tags.join(', '), comment.trim()].filter(Boolean).join('. ');
    if (text.length > 500) {
      setCommentError('Your review, including selected tags, must be 500 characters or fewer.');
      setFormError('Please shorten your review.');
      return;
    }
    try {
      setSaving(true);
      setFormError(null);
      await createReview({ orderId: order.id, customerId: user.id, rating, comment: text });
      Alert.alert('Thanks for your review!', 'It helps neighbours choose trusted home cooks.');
      router.back();
    } catch (err) {
      setFormError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen
      title="Review order"
      back
      footer={
        existing || order.status !== 'delivered' ? undefined : (
          <>
            {formError ? <Text style={styles.error}>{formError}</Text> : null}
            <AppButton title="Submit review" loading={saving} onPress={onSubmit} />
          </>
        )
      }
    >
      <Card>
        <Text style={styles.muted}>{orderNumber(order.id)}</Text>
        <Text style={styles.title}>{order.cookBusinessName}</Text>
        <Text style={styles.body}>{items.map((item) => `${item.mealName} × ${item.quantity}`).join(', ')}</Text>
      </Card>

      {existing ? (
        <Card tone="success">
          <Text style={styles.title}>You already reviewed this order</Text>
          <RatingStars rating={existing.rating} size={20} />
          {existing.comment ? <Text style={styles.body}>{existing.comment}</Text> : null}
        </Card>
      ) : order.status !== 'delivered' ? (
        <Notice text="You can review this order once it has been delivered." />
      ) : (
        <>
          <View style={styles.stars}>
            <Text style={styles.title}>How was your meal?</Text>
            <RatingStars rating={rating} size={40} onChange={setRating} />
            <Text style={styles.ratingWord}>{ratingWords[rating] || 'Tap to rate'}</Text>
          </View>
          <Text style={styles.label}>What stood out?</Text>
          <ChipRow>
            {quickTags.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                selected={tags.includes(tag)}
                onPress={() => setTags((current) => (current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag]))}
              />
            ))}
          </ChipRow>
          <AppInput label="Tell other customers more (optional)" value={comment} onChangeText={(value) => { setComment(value); setCommentError(undefined); }} multiline placeholder="Taste, portion size, packaging..." maxLength={400} error={commentError} />
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    ...typography.sectionTitle,
    color: colors.ink,
  },
  body: {
    ...typography.body,
    color: colors.ink,
  },
  muted: {
    ...typography.caption,
    color: colors.muted,
  },
  label: {
    ...typography.label,
    color: colors.ink,
  },
  stars: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  ratingWord: {
    ...typography.bodyStrong,
    color: colors.muted,
  },
  error: {
    ...typography.body,
    color: colors.danger,
  },
});
