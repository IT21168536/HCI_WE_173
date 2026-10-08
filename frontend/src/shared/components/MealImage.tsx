import { Image } from 'expo-image';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { radius } from '@/shared/theme/radius';
import { Icon } from './Icon';

type MealImageProps = {
  uri?: string | null;
  size?: number;
  height?: number;
  rounded?: number;
  dimmed?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** Meal photo, or a plate placeholder when the cook has not added one. */
export function MealImage({ uri, size = 64, height, rounded = radius.md, dimmed = false, style }: MealImageProps) {
  const box = { width: height ? '100%' as const : size, height: height ?? size, borderRadius: rounded };

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={[box, dimmed && styles.dimmed]}
        contentFit="cover"
        accessibilityIgnoresInvertColors
        transition={150}
      />
    );
  }

  return (
    <View style={[styles.placeholder, box, dimmed && styles.placeholderDimmed, style]}>
      <Icon name="restaurant-outline" size={Math.min(height ?? size, size) * 0.42} color={dimmed ? '#9A9A9A' : '#D9502F'} />
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    alignItems: 'center',
    backgroundColor: '#FFE6DF',
    justifyContent: 'center',
  },
  placeholderDimmed: {
    backgroundColor: '#EDEDED',
  },
  dimmed: {
    opacity: 0.5,
  },
});
