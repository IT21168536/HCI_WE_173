import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import type { ColorValue } from 'react-native';
import { colors } from '@/shared/theme/colors';

type IconName = ComponentProps<typeof Ionicons>['name'];

export const tabScreenOptions = {
  headerShown: false,
  tabBarActiveTintColor: colors.brandText,
  tabBarInactiveTintColor: colors.muted,
  tabBarLabelStyle: { fontSize: 11, fontWeight: '600' as const },
  tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.line },
};

/** Filled icon when the tab is active, outline otherwise. */
export function tabIcon(name: IconName, activeName?: IconName) {
  function TabIcon({ color, focused, size }: { color: ColorValue; focused: boolean; size: number }) {
    return <Ionicons name={focused ? (activeName ?? name) : name} size={size} color={color as string} />;
  }
  return TabIcon;
}
