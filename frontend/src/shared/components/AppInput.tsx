import { forwardRef, useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, TextInput, type TextInputProps, View } from 'react-native';
import { colors } from '@/shared/theme/colors';
import { radius } from '@/shared/theme/radius';
import { spacing } from '@/shared/theme/spacing';
import { typography } from '@/shared/theme/typography';
import { Icon, type IconName } from './Icon';

type AppInputProps = TextInputProps & {
  label: string;
  error?: string;
  hint?: string;
  icon?: IconName;
  /** Adds a show/hide toggle for password fields. */
  password?: boolean;
  right?: ReactNode;
};

export const AppInput = forwardRef<TextInput, AppInputProps>(function AppInput(
  { label, error, hint, icon, password = false, right, multiline, style, ...props },
  ref,
) {
  const [hidden, setHidden] = useState(password);

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.field, multiline && styles.multiline, error ? styles.fieldError : null]}>
        {icon ? <Icon name={icon} size={20} color={colors.muted} /> : null}
        <TextInput
          ref={ref}
          accessibilityLabel={label}
          placeholderTextColor={colors.muted}
          secureTextEntry={hidden}
          multiline={multiline}
          textAlignVertical={multiline ? 'top' : 'center'}
          style={[styles.input, multiline && styles.inputMultiline, style]}
          {...props}
        />
        {password ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={hidden ? 'Show password' : 'Hide password'}
            hitSlop={10}
            onPress={() => setHidden((value) => !value)}
          >
            <Icon name={hidden ? 'eye-outline' : 'eye-off-outline'} size={20} color={colors.muted} />
          </Pressable>
        ) : null}
        {right}
      </View>
      {error ? (
        <Text accessibilityLiveRegion="polite" style={styles.error}>
          {error}
        </Text>
      ) : hint ? (
        <Text style={styles.hint}>{hint}</Text>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    gap: 6,
  },
  label: {
    ...typography.label,
    color: colors.ink,
  },
  field: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: '#DADADA',
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 48,
    paddingHorizontal: 14,
  },
  multiline: {
    alignItems: 'flex-start',
    minHeight: 96,
    paddingVertical: spacing.md,
  },
  fieldError: {
    borderColor: colors.danger,
  },
  input: {
    ...typography.body,
    color: colors.ink,
    flex: 1,
    minHeight: 46,
  },
  inputMultiline: {
    minHeight: 72,
    paddingTop: 0,
  },
  error: {
    ...typography.caption,
    color: colors.danger,
  },
  hint: {
    ...typography.caption,
    color: colors.muted,
  },
});
