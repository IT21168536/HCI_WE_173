import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/shared/theme/colors';
import { spacing } from '@/shared/theme/spacing';
import { typography } from '@/shared/theme/typography';

type LoadingViewProps = {
  message?: string;
};

export function LoadingView({ message = 'Loading...' }: LoadingViewProps) {
  return (
    <View style={styles.wrap}>
      <ActivityIndicator color={colors.brand} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    gap: spacing.md,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  text: {
    ...typography.body,
    color: colors.muted,
  },
});
