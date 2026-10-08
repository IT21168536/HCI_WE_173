import { StyleSheet } from 'react-native';
import { colors } from './colors';
import { spacing } from './spacing';

export const screenStyles = StyleSheet.create({
  container: {
    backgroundColor: colors.soft,
    flex: 1,
  },
  content: {
    gap: spacing.md,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  between: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
});
