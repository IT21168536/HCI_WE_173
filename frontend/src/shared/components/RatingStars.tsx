import { Pressable, StyleSheet, View } from 'react-native';
import { colors } from '@/shared/theme/colors';
import { Icon } from './Icon';

type RatingStarsProps = {
  rating: number;
  size?: number;
  /** Makes the stars tappable for picking a rating. */
  onChange?: (rating: number) => void;
};

export function RatingStars({ rating, size = 14, onChange }: RatingStarsProps) {
  const stars = [1, 2, 3, 4, 5];

  if (onChange) {
    return (
      <View accessibilityRole="adjustable" accessibilityLabel={`Rating, ${rating} of 5 stars`} style={styles.row}>
        {stars.map((star) => (
          <Pressable
            key={star}
            accessibilityRole="button"
            accessibilityLabel={`${star} star${star > 1 ? 's' : ''}`}
            accessibilityState={{ selected: star <= rating }}
            hitSlop={6}
            onPress={() => onChange(star)}
          >
            <Icon name={star <= rating ? 'star' : 'star-outline'} size={size} color={star <= rating ? colors.star : '#BDBDBD'} />
          </Pressable>
        ))}
      </View>
    );
  }

  return (
    <View accessibilityLabel={`${rating.toFixed(1)} out of 5 stars`} style={styles.row}>
      {stars.map((star) => {
        const name = rating >= star ? 'star' : rating >= star - 0.5 ? 'star-half' : 'star-outline';
        return <Icon key={star} name={name} size={size} color={rating >= star - 0.5 ? colors.star : '#D0D0D0'} />;
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 2,
  },
});
