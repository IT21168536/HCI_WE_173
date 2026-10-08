import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { colors } from '@/shared/theme/colors';

export type IconName = ComponentProps<typeof Ionicons>['name'];

type IconProps = {
  name: IconName;
  size?: number;
  color?: string;
};

/** Line icons are decorative by default; pair them with visible text or an accessibilityLabel on the parent. */
export function Icon({ name, size = 20, color = colors.ink }: IconProps) {
  return <Ionicons name={name} size={size} color={color} accessibilityElementsHidden importantForAccessibility="no" />;
}
