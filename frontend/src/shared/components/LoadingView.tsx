import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/shared/theme/colors';
import { spacing } from '@/shared/theme/spacing';
import { typography } from '@/shared/theme/typography';
import { AppButton } from './AppButton';
import { IconCircle } from './ui';

type LoadingViewProps = {
  message?: string;
  fill?: boolean;
};

export function LoadingView({ message = 'Loading...', fill = false }: LoadingViewProps) {
  return (
    <View accessibilityLiveRegion="polite" style={[styles.wrap, fill && styles.fill]}>
      <ActivityIndicator color={colors.brand} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

export function ErrorView({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <View accessibilityLiveRegion="polite" style={styles.wrap}>
      <IconCircle icon="cloud-offline-outline" tone="danger" size={52} />
      <Text style={styles.title}>Couldn&apos;t load data</Text>
      <Text style={styles.text}>{message}</Text>
      {onRetry ? <AppButton title="Try again" size="sm" variant="outline" onPress={onRetry} /> : null}
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
  fill: {
    backgroundColor: colors.soft,
    flex: 1,
  },
  title: {
    ...typography.cardTitle,
    color: colors.ink,
  },
  text: {
    ...typography.body,
    color: colors.muted,
    textAlign: 'center',
  },
});
