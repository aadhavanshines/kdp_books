import { Text as RNText, type StyleProp, type TextProps as RNTextProps, type TextStyle } from 'react-native';

import { s } from '../theme/scale';
import { colors, typography, type TypeVariant } from '../theme/tokens';

export type ColorName = {
  [K in keyof typeof colors]: (typeof colors)[K] extends string ? K : never;
}[keyof typeof colors];

export interface TextProps extends Omit<RNTextProps, 'style'> {
  variant?: TypeVariant;
  color?: ColorName;
  align?: TextStyle['textAlign'];
  style?: StyleProp<TextStyle>;
}

/** Text in the Reelhouse type scale. Sizes are canvas units, scaled to the screen; system font scaling still applies. */
export function Text({ variant = 'body', color = 'text', align, style, ...rest }: TextProps) {
  const t = typography[variant];
  return (
    <RNText
      {...rest}
      style={[
        {
          fontFamily: t.fontFamily,
          fontSize: s(t.fontSize),
          lineHeight: s(t.lineHeight),
          letterSpacing: s(t.letterSpacing),
          color: colors[color],
          textAlign: align,
        },
        style,
      ]}
    />
  );
}
