import { StyleSheet, TextInput, TextInputProps } from 'react-native';
import { colors } from '@/shared/theme/colors';
import { radius } from '@/shared/theme/radius';
import { spacing } from '@/shared/theme/spacing';
import { typography } from '@/shared/theme/typography';

export function SearchBar(props: TextInputProps) {
  return (
    <TextInput
      accessibilityLabel={props.accessibilityLabel ?? 'Search'}
      placeholderTextColor={colors.muted}
      style={styles.input}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    ...typography.body,
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radius.pill,
    borderWidth: 1,
    color: colors.ink,
    minHeight: 48,
    paddingHorizontal: spacing.lg,
  },
});
