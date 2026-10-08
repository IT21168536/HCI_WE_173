import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/shared/theme/colors';
import { spacing } from '@/shared/theme/spacing';
import { typography } from '@/shared/theme/typography';
import { Icon, type IconName } from './Icon';

export type HeaderAction = {
  icon: IconName;
  label: string;
  onPress: () => void;
  badge?: number;
};

type AppHeaderProps = {
  title: string;
  subtitle?: string;
  /** `brand` = coral bar (home cook), `dark` = charcoal bar (customer, rider). */
  variant?: 'brand' | 'dark';
  back?: boolean;
  onBack?: () => void;
  actions?: HeaderAction[];
};

export function AppHeader({ title, subtitle, variant = 'dark', back = false, onBack, actions = [] }: AppHeaderProps) {
  const insets = useSafeAreaInsets();

  function goBack() {
    if (onBack) {
      onBack();
    } else if (router.canGoBack()) {
      router.back();
    }
  }

  return (
    <View
      style={[styles.bar, { backgroundColor: variant === 'brand' ? colors.brand : colors.header, paddingTop: insets.top + spacing.sm }]}
    >
      {back ? (
        <Pressable accessibilityRole="button" accessibilityLabel="Go back" hitSlop={12} onPress={goBack} style={styles.iconButton}>
          <Icon name="chevron-back" size={26} color={colors.surface} />
        </Pressable>
      ) : null}
      <View style={styles.titles}>
        <Text accessibilityRole="header" numberOfLines={1} style={styles.title}>
          {title}
        </Text>
        {subtitle ? (
          <Text numberOfLines={1} style={styles.subtitle}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {actions.map((action) => (
        <Pressable
          key={action.label}
          accessibilityRole="button"
          accessibilityLabel={action.badge ? `${action.label}, ${action.badge} new` : action.label}
          hitSlop={8}
          onPress={action.onPress}
          style={styles.iconButton}
        >
          <Icon name={action.icon} size={24} color={colors.surface} />
          {action.badge ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{action.badge > 9 ? '9+' : action.badge}</Text>
            </View>
          ) : null}
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  titles: {
    flex: 1,
  },
  title: {
    ...typography.headerTitle,
    color: colors.surface,
  },
  subtitle: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.88)',
  },
  iconButton: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    minWidth: 32,
  },
  badge: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 9,
    height: 18,
    justifyContent: 'center',
    minWidth: 18,
    paddingHorizontal: 4,
    position: 'absolute',
    right: -6,
    top: 2,
  },
  badgeText: {
    color: colors.brandText,
    fontSize: 10,
    fontWeight: '700',
  },
});
