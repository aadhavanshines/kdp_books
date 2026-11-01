import { StyleSheet, Text as RNText, View } from 'react-native';

import type { LogoStyle } from '../data/types';
import { s } from '../theme/scale';
import { colors } from '../theme/tokens';

export interface TitleLogoProps {
  name: string;
  logo: LogoStyle;
  /** Cap height of the logo in canvas units. */
  size?: number;
  /** Max lines before shrinking. */
  maxLines?: number;
  align?: 'left' | 'center';
}

/**
 * A title's "logo", set in display type. Each title picks a treatment so
 * rows read like a shelf of real key art rather than a list of labels.
 */
export function TitleLogo({ name, logo, size = 64, maxLines = 2, align = 'left' }: TitleLogoProps) {
  const base = {
    color: colors.text,
    textAlign: align,
    textShadowColor: 'rgba(0,0,0,0.55)',
    textShadowOffset: { width: 0, height: s(2) },
    textShadowRadius: s(12),
  } as const;
  if (logo === 'stack') {
    const words = name.split(' ');
    const first = words.slice(0, Math.ceil(words.length / 2)).join(' ');
    const second = words.slice(Math.ceil(words.length / 2)).join(' ');
    return (
      <View style={{ alignItems: align === 'center' ? 'center' : 'flex-start' }} accessible accessibilityRole="header" accessibilityLabel={name}>
        <RNText numberOfLines={1} style={[base, { fontFamily: 'Inter_900Black', fontSize: s(size), lineHeight: s(size * 1.02), letterSpacing: s(-size * 0.03) }]}>
          {first}
        </RNText>
        {second ? (
          <RNText numberOfLines={1} style={[base, { color: colors.accent, fontFamily: 'Inter_800ExtraBold', fontSize: s(size * 0.62), lineHeight: s(size * 0.7), letterSpacing: s(size * 0.14) }]}>
            {second.toUpperCase()}
          </RNText>
        ) : null}
      </View>
    );
  }
  const style =
    logo === 'wide'
      ? { fontFamily: 'Inter_800ExtraBold', fontSize: s(size * 0.82), lineHeight: s(size * 0.95), letterSpacing: s(size * 0.12), text: name.toUpperCase() }
      : logo === 'italic'
        ? { fontFamily: 'Inter_900Black_Italic', fontSize: s(size), lineHeight: s(size * 1.04), letterSpacing: s(-size * 0.04), text: name }
        : { fontFamily: 'Inter_900Black', fontSize: s(size), lineHeight: s(size * 0.98), letterSpacing: s(-size * 0.02), text: name.toUpperCase() };
  const { text, ...font } = style;
  return (
    <View accessible accessibilityRole="header" accessibilityLabel={name}>
      <RNText numberOfLines={maxLines} adjustsFontSizeToFit style={[base, font]}>
        {text}
      </RNText>
      {logo === 'block' ? <View style={[styles.underline, { width: s(size * 1.4), height: s(Math.max(4, size * 0.08)), alignSelf: align === 'center' ? 'center' : 'flex-start' }]} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  underline: { marginTop: s(8), backgroundColor: colors.primary, borderRadius: 999 },
});
