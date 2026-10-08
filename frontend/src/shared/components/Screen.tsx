import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, RefreshControl, ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/shared/theme/colors';
import { spacing } from '@/shared/theme/spacing';
import { AppHeader, type HeaderAction } from './AppHeader';

type ScreenProps = {
  title: string;
  subtitle?: string;
  variant?: 'brand' | 'dark';
  back?: boolean;
  onBack?: () => void;
  actions?: HeaderAction[];
  children: ReactNode;
  /** Pinned below the scrolling content, e.g. the main action button. */
  footer?: ReactNode;
  background?: string;
  scroll?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  contentStyle?: StyleProp<ViewStyle>;
  /** Tab screens sit above the tab bar, so they do not need the bottom inset. */
  inTabs?: boolean;
};

export function Screen({
  title,
  subtitle,
  variant,
  back,
  onBack,
  actions,
  children,
  footer,
  background = colors.soft,
  scroll = true,
  refreshing = false,
  onRefresh,
  contentStyle,
  inTabs = false,
}: ScreenProps) {
  const insets = useSafeAreaInsets();
  const bottom = inTabs ? 0 : insets.bottom;

  return (
    <View style={[styles.root, { backgroundColor: background }]}>
      <AppHeader title={title} subtitle={subtitle} variant={variant} back={back} onBack={onBack} actions={actions} />
      <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {scroll ? (
          <ScrollView
            style={styles.root}
            contentContainerStyle={[styles.content, { paddingBottom: (footer ? spacing.lg : spacing.xxl) + (footer ? 0 : bottom) }, contentStyle]}
            keyboardShouldPersistTaps="handled"
            refreshControl={onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand} /> : undefined}
          >
            {children}
          </ScrollView>
        ) : (
          <View style={[styles.root, styles.content, contentStyle]}>{children}</View>
        )}
        {footer ? <View style={[styles.footer, { paddingBottom: spacing.md + bottom }]}>{footer}</View> : null}
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    gap: spacing.md,
    padding: spacing.lg,
  },
  footer: {
    backgroundColor: colors.surface,
    borderTopColor: colors.line,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
});
