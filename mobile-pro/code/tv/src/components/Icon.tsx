import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';

import { s } from '../theme/scale';
import { colors } from '../theme/tokens';
import type { ColorName } from './Text';

export type IconName = ComponentProps<typeof Ionicons>['name'];

export function Icon({ name, size = 32, color = 'text' }: { name: IconName; size?: number; color?: ColorName }) {
  return <Ionicons name={name} size={s(size)} color={colors[color]} accessibilityElementsHidden importantForAccessibility="no" />;
}
