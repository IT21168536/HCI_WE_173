import { Pressable, StyleSheet, TextInput, type TextInputProps, View } from 'react-native';
import { colors } from '@/shared/theme/colors';
import { radius } from '@/shared/theme/radius';
import { spacing } from '@/shared/theme/spacing';
import { typography } from '@/shared/theme/typography';
import { Icon } from './Icon';

type SearchBarProps = TextInputProps & {
  onFilterPress?: () => void;
  filterActive?: boolean;
};

export function SearchBar({ onFilterPress, filterActive = false, ...props }: SearchBarProps) {
  return (
    <View style={styles.wrap}>
      <Icon name="search" size={20} color={colors.muted} />
      <TextInput
        accessibilityLabel={props.accessibilityLabel ?? props.placeholder ?? 'Search'}
        placeholderTextColor={colors.muted}
        returnKeyType="search"
        style={styles.input}
        {...props}
      />
      {props.value ? (
        <Pressable accessibilityRole="button" accessibilityLabel="Clear search" hitSlop={10} onPress={() => props.onChangeText?.('')}>
          <Icon name="close-circle" size={18} color={colors.muted} />
        </Pressable>
      ) : null}
      {onFilterPress ? (
        <Pressable accessibilityRole="button" accessibilityLabel="Filters" hitSlop={10} onPress={onFilterPress}>
          <Icon name="options-outline" size={22} color={filterActive ? colors.brandText : colors.ink} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: '#BDBDBD',
    borderRadius: radius.pill,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 48,
    paddingHorizontal: spacing.lg,
  },
  input: {
    ...typography.body,
    color: colors.ink,
    flex: 1,
    minHeight: 46,
  },
});
