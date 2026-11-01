import { Text as RNText, type TextProps as RNTextProps, type TextStyle } from 'react-native';

import { useTheme } from '../theme/ThemeProvider';
import type { ThemeColors } from '../tokens/colors';
import { type FontWeight, type TextVariant } from '../tokens/scale';

/** Keys of theme colors that hold a single color string. */
export type ColorToken = {
  [K in keyof ThemeColors]: ThemeColors[K] extends string ? K : never;
}[keyof ThemeColors];

export interface TextProps extends RNTextProps {
  variant?: TextVariant;
  /** A theme color token. Defaults to `text`. */
  color?: ColorToken;
  weight?: FontWeight;
  align?: TextStyle['textAlign'];
  /** Tabular figures, for prices and timers, so digits do not jiggle. */
  tabular?: boolean;
  /** Strike-through, e.g. an MRP. */
  strike?: boolean;
  uppercase?: boolean;
}

/**
 * Themed text in Inter. Text scales with the system font size; the scale is
 * capped at 1.8x (`maxFontSizeMultiplier`) so dense rows stay usable.
 */
export function Text({
  variant = 'body',
  color = 'text',
  weight,
  align,
  tabular,
  strike,
  uppercase,
  style,
  maxFontSizeMultiplier = 1.8,
  ...rest
}: TextProps) {
  const theme = useTheme();
  const v = theme.typography[variant];
  const resolvedWeight = weight ?? v.weight;
  const textStyle: TextStyle = {
    fontFamily: theme.fontFamilies[resolvedWeight],
    fontSize: v.fontSize,
    lineHeight: v.lineHeight,
    letterSpacing: 'letterSpacing' in v ? v.letterSpacing : undefined,
    color: theme.colors[color],
    textAlign: align,
    textTransform: uppercase || ('uppercase' in v && v.uppercase) ? 'uppercase' : undefined,
    textDecorationLine: strike ? 'line-through' : undefined,
    fontVariant: tabular ? ['tabular-nums'] : undefined,
  };
  return <RNText maxFontSizeMultiplier={maxFontSizeMultiplier} style={[textStyle, style]} {...rest} />;
}
