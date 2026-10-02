import { Image, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/shared/theme/colors';
import { typography } from '@/shared/theme/typography';

type AvatarProps = {
  name: string;
  uri?: string | null;
  size?: number;
};

export function Avatar({ name, uri, size = 48 }: AvatarProps) {
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  if (uri) {
    return <Image source={{ uri }} style={[styles.avatar, { height: size, width: size, borderRadius: size / 2 }]} />;
  }

  return (
    <View style={[styles.avatar, styles.fallback, { height: size, width: size, borderRadius: size / 2 }]}>
      <Text style={styles.initials}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    backgroundColor: colors.soft,
  },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    ...typography.cardTitle,
    color: colors.brandDark,
  },
});
