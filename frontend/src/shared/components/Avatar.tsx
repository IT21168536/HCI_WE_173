import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@/shared/theme/colors';

type AvatarProps = {
  name: string;
  uri?: string | null;
  size?: number;
  tone?: 'brand' | 'blue';
};

export function Avatar({ name, uri, size = 48, tone = 'brand' }: AvatarProps) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const box = { height: size, width: size, borderRadius: size / 2 };

  if (uri) {
    return <Image source={{ uri }} style={box} contentFit="cover" accessibilityLabel={`${name} photo`} />;
  }

  return (
    <View
      accessibilityLabel={name}
      style={[styles.fallback, box, tone === 'blue' && styles.blue]}
    >
      <Text style={[styles.initials, { fontSize: Math.round(size * 0.36) }, tone === 'blue' && styles.blueText]}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: {
    alignItems: 'center',
    backgroundColor: '#FFE6DF',
    justifyContent: 'center',
  },
  initials: {
    color: colors.brandText,
    fontWeight: '700',
  },
  blue: {
    backgroundColor: '#E8EEF9',
  },
  blueText: {
    color: '#2B4C8C',
  },
});
