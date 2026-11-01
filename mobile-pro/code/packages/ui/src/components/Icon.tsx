import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import type { ComponentProps } from 'react';
import type { StyleProp, TextStyle } from 'react-native';

import { useTheme } from '../theme/ThemeProvider';
import type { ColorToken } from './Text';

export type IoniconName = ComponentProps<typeof Ionicons>['name'];
export type MciIconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

/** An Ionicons glyph (default set) or a MaterialCommunityIcons glyph. */
export type IconSpec = { set?: 'ion'; name: IoniconName } | { set: 'mci'; name: MciIconName };

export type IconProps = IconSpec & {
  size?: number;
  /** A theme color token. Defaults to `text`. */
  color?: ColorToken;
  style?: StyleProp<TextStyle>;
};

/**
 * Icons are decorative: the touchable that holds one carries the label.
 */
export function Icon({ size = 22, color = 'text', style, ...spec }: IconProps) {
  const { colors } = useTheme();
  const common = {
    size,
    color: colors[color],
    style,
    accessible: false,
    importantForAccessibility: 'no' as const,
  };
  if (spec.set === 'mci') return <MaterialCommunityIcons name={spec.name} {...common} />;
  return <Ionicons name={spec.name} {...common} />;
}
