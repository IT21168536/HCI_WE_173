import { ActivityIndicator, Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';
import { colors } from '@/shared/theme/colors';
import { radius } from '@/shared/theme/radius';
import { spacing } from '@/shared/theme/spacing';
import { typography } from '@/shared/theme/typography';
import { Icon, type IconName } from './Icon';

type Variant = 'primary' | 'outline' | 'secondary' | 'danger' | 'ghost';

type AppButtonProps = {
  title: string;
  onPress?: () => void;
  variant?: Variant;
  size?: 'md' | 'sm';
  icon?: IconName;
  disabled?: boolean;
  loading?: boolean;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
  /** Grow to share a row with other buttons. */
  flex?: boolean;
};

const textColor: Record<Variant, string> = {
  primary: colors.surface,
  danger: colors.surface,
  outline: colors.brandText,
  secondary: colors.ink,
  ghost: colors.brandText,
};

export function AppButton({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  disabled = false,
  loading = false,
  accessibilityLabel,
  style,
  flex = false,
}: AppButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        size === 'sm' && styles.small,
        styles[variant],
        flex && styles.flex,
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor[variant]} />
      ) : icon ? (
        <Icon name={icon} size={size === 'sm' ? 16 : 18} color={textColor[variant]} />
      ) : null}
      <Text style={[styles.title, size === 'sm' && styles.smallTitle, { color: textColor[variant] }]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: radius.lg,
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    minHeight: 52,
    paddingHorizontal: spacing.lg,
  },
  small: {
    borderRadius: radius.md,
    minHeight: 40,
    paddingHorizontal: spacing.md,
  },
  flex: {
    flex: 1,
  },
  primary: {
    backgroundColor: colors.brandStrong,
  },
  outline: {
    backgroundColor: colors.surface,
    borderColor: colors.brandStrong,
    borderWidth: 1.5,
  },
  secondary: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderWidth: 1,
  },
  danger: {
    backgroundColor: colors.danger,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.82,
  },
  title: {
    ...typography.button,
  },
  smallTitle: {
    fontSize: 13,
  },
});
