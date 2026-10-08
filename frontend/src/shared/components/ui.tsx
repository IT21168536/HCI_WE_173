import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Switch, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors } from '@/shared/theme/colors';
import { radius } from '@/shared/theme/radius';
import { spacing } from '@/shared/theme/spacing';
import { typography } from '@/shared/theme/typography';
import { Icon, type IconName } from './Icon';

/* ---------- Card ---------- */

type CardProps = {
  children: ReactNode;
  onPress?: () => void;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
  tone?: 'default' | 'brand' | 'warning' | 'success';
};

const toneStyle = {
  default: { backgroundColor: colors.surface, borderColor: colors.line },
  brand: { backgroundColor: '#FFF7F5', borderColor: '#F6D3CA' },
  warning: { backgroundColor: colors.warningSoft, borderColor: '#F3DFAF' },
  success: { backgroundColor: colors.successSoft, borderColor: '#C9E6D1' },
};

export function Card({ children, onPress, accessibilityLabel, style, tone = 'default' }: CardProps) {
  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPress={onPress}
        style={({ pressed }) => [styles.card, toneStyle[tone], pressed && styles.pressed, style]}
      >
        {children}
      </Pressable>
    );
  }
  return <View style={[styles.card, toneStyle[tone], style]}>{children}</View>;
}

/* ---------- Text helpers ---------- */

export function SectionHeader({ title, actionLabel, onAction }: { title: string; actionLabel?: string; onAction?: () => void }) {
  return (
    <View style={styles.sectionHeader}>
      <Text accessibilityRole="header" style={styles.sectionTitle}>
        {title}
      </Text>
      {actionLabel && onAction ? (
        <Pressable accessibilityRole="button" hitSlop={10} onPress={onAction}>
          <Text style={styles.link}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function InfoRow({ label, value, strong = false, valueColor }: { label: string; value: string; strong?: boolean; valueColor?: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={[styles.infoLabel, strong && styles.infoStrong]}>{label}</Text>
      <Text style={[styles.infoValue, strong && styles.infoStrong, valueColor ? { color: valueColor } : null]}>{value}</Text>
    </View>
  );
}

export function Divider() {
  return <View style={styles.divider} />;
}

/* ---------- Chips & tabs ---------- */

type ChipProps = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: IconName;
};

export function Chip({ label, selected = false, onPress, icon }: ChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [styles.chip, selected && styles.chipSelected, pressed && styles.pressed]}
    >
      {icon ? <Icon name={icon} size={14} color={selected ? colors.surface : colors.ink} /> : null}
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
  );
}

export function ChipRow({ children }: { children: ReactNode }) {
  return <View style={styles.chipRow}>{children}</View>;
}

type SegmentedProps<T extends string> = {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
};

export function Segmented<T extends string>({ options, value, onChange }: SegmentedProps<T>) {
  return (
    <View accessibilityRole="tablist" style={styles.segmented}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => onChange(option.value)}
            style={[styles.segment, selected && styles.segmentSelected]}
          >
            <Text numberOfLines={1} style={[styles.segmentText, selected && styles.segmentTextSelected]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/* ---------- Badges ---------- */

export type BadgeTone = 'brand' | 'success' | 'warning' | 'info' | 'neutral' | 'danger';

const badgeColors: Record<BadgeTone, { bg: string; fg: string }> = {
  brand: { bg: colors.brandSoft, fg: colors.brandText },
  success: { bg: colors.successSoft, fg: colors.success },
  warning: { bg: colors.warningSoft, fg: colors.warningText },
  info: { bg: colors.infoSoft, fg: colors.infoText },
  neutral: { bg: '#EDEDED', fg: '#4F4F4F' },
  danger: { bg: colors.dangerSoft, fg: colors.danger },
};

export function Badge({ label, tone = 'brand' }: { label: string; tone?: BadgeTone }) {
  return (
    <View style={[styles.badge, { backgroundColor: badgeColors[tone].bg }]}>
      <Text style={[styles.badgeText, { color: badgeColors[tone].fg }]}>{label}</Text>
    </View>
  );
}

/* ---------- Inputs ---------- */

type StepperProps = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  label: string;
};

export function Stepper({ value, onChange, min = 0, max = 999, label }: StepperProps) {
  return (
    <View style={styles.stepper} accessibilityLabel={`${label}: ${value}`}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Decrease ${label}`}
        disabled={value <= min}
        onPress={() => onChange(Math.max(min, value - 1))}
        style={[styles.stepButton, value <= min && styles.stepDisabled]}
      >
        <Icon name="remove" size={18} color={colors.ink} />
      </Pressable>
      <Text style={styles.stepValue}>{value}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Increase ${label}`}
        disabled={value >= max}
        onPress={() => onChange(Math.min(max, value + 1))}
        style={[styles.stepButton, value >= max && styles.stepDisabled]}
      >
        <Icon name="add" size={18} color={colors.ink} />
      </Pressable>
    </View>
  );
}

type ToggleRowProps = {
  title: string;
  description?: string;
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
};

export function ToggleRow({ title, description, value, onChange, disabled }: ToggleRowProps) {
  return (
    <View style={styles.toggleRow}>
      <View style={styles.flex}>
        <Text style={styles.toggleTitle}>{title}</Text>
        {description ? <Text style={styles.caption}>{description}</Text> : null}
      </View>
      <Switch
        accessibilityLabel={title}
        value={value}
        onValueChange={onChange}
        disabled={disabled}
        trackColor={{ false: '#C4C4C4', true: colors.brandStrong }}
        thumbColor={colors.surface}
      />
    </View>
  );
}

/* ---------- Stats & menus ---------- */

export function StatTile({ value, label, onPress, highlight = false }: { value: string; label: string; onPress?: () => void; highlight?: boolean }) {
  return (
    <Card onPress={onPress} accessibilityLabel={`${label}: ${value}`} style={styles.statTile}>
      <Text style={[styles.statValue, highlight && { color: colors.brandText }]}>{value}</Text>
      <Text style={styles.caption}>{label}</Text>
    </Card>
  );
}

export function MenuRow({ icon, label, onPress, danger = false, detail }: { icon: IconName; label: string; onPress: () => void; danger?: boolean; detail?: string }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.menuRow, pressed && styles.pressed]}>
      <View style={styles.menuIcon}>
        <Icon name={icon} size={18} color={colors.brandText} />
      </View>
      <Text style={[styles.menuLabel, danger && { color: colors.brandText }]}>{label}</Text>
      {detail ? <Text style={styles.caption}>{detail}</Text> : null}
      {!danger ? <Icon name="chevron-forward" size={18} color={colors.muted} /> : null}
    </Pressable>
  );
}

export function IconCircle({ icon, size = 40, tone = 'brand' }: { icon: IconName; size?: number; tone?: BadgeTone }) {
  return (
    <View style={[styles.iconCircle, { width: size, height: size, backgroundColor: badgeColors[tone].bg }]}>
      <Icon name={icon} size={Math.round(size * 0.45)} color={badgeColors[tone].fg} />
    </View>
  );
}

export function Notice({ icon = 'information-circle-outline', text, tone = 'brand' }: { icon?: IconName; text: string; tone?: BadgeTone }) {
  return (
    <View style={[styles.notice, { backgroundColor: badgeColors[tone].bg }]}>
      <Icon name={icon} size={18} color={badgeColors[tone].fg} />
      <Text style={[styles.noticeText]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.sm,
    padding: 14,
  },
  pressed: {
    opacity: 0.85,
  },
  flex: {
    flex: 1,
  },
  caption: {
    ...typography.caption,
    color: colors.muted,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  sectionTitle: {
    ...typography.sectionTitle,
    color: colors.ink,
  },
  link: {
    ...typography.captionStrong,
    color: colors.brandText,
  },
  infoRow: {
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  infoLabel: {
    ...typography.body,
    color: colors.muted,
    flexShrink: 1,
  },
  infoValue: {
    ...typography.bodyStrong,
    color: colors.ink,
    flexShrink: 1,
    textAlign: 'right',
  },
  infoStrong: {
    color: colors.ink,
    fontWeight: '700',
  },
  divider: {
    backgroundColor: colors.line,
    height: 1,
  },
  chip: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: '#DADADA',
    borderRadius: radius.pill,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6,
    minHeight: 36,
    paddingHorizontal: 14,
  },
  chipSelected: {
    backgroundColor: colors.brandStrong,
    borderColor: colors.brandStrong,
  },
  chipText: {
    ...typography.captionStrong,
    color: colors.ink,
  },
  chipTextSelected: {
    color: colors.surface,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  segmented: {
    backgroundColor: '#EAEAEA',
    borderRadius: radius.md,
    flexDirection: 'row',
    padding: 4,
  },
  segment: {
    alignItems: 'center',
    borderRadius: 9,
    flex: 1,
    justifyContent: 'center',
    minHeight: 36,
    paddingHorizontal: 6,
  },
  segmentSelected: {
    backgroundColor: colors.surface,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  segmentText: {
    ...typography.captionStrong,
    color: '#4F4F4F',
    fontSize: 13,
  },
  segmentTextSelected: {
    color: colors.ink,
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  stepper: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  stepButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: '#DADADA',
    borderRadius: radius.pill,
    borderWidth: 1,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  stepDisabled: {
    opacity: 0.4,
  },
  stepValue: {
    ...typography.sectionTitle,
    minWidth: 24,
    textAlign: 'center',
  },
  toggleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  toggleTitle: {
    ...typography.bodyStrong,
    color: colors.ink,
  },
  statTile: {
    flex: 1,
    gap: spacing.xs,
  },
  statValue: {
    ...typography.stat,
    color: colors.ink,
  },
  menuRow: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 56,
    paddingHorizontal: 14,
  },
  menuIcon: {
    alignItems: 'center',
    backgroundColor: colors.brandSoft,
    borderRadius: radius.pill,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  menuLabel: {
    ...typography.bodyStrong,
    color: colors.ink,
    flex: 1,
  },
  iconCircle: {
    alignItems: 'center',
    borderRadius: radius.pill,
    justifyContent: 'center',
  },
  notice: {
    alignItems: 'flex-start',
    borderRadius: radius.md,
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
  },
  noticeText: {
    ...typography.caption,
    color: colors.ink,
    flex: 1,
    lineHeight: 18,
  },
});
