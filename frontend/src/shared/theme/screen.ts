import { StyleSheet } from 'react-native';
import { colors } from './colors';
import { spacing } from './spacing';

export const screenStyles = StyleSheet.create({
  container: {
    backgroundColor: colors.soft,
    flex: 1,
  },
  content: {
    gap: spacing.lg,
    padding: spacing.lg,
    paddingTop: spacing.xxl,
  },
});
