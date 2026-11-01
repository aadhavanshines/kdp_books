import { Platform, type ViewStyle } from 'react-native';

/** Spacing scale from DESIGN.md: 4/8/12/16/20/24/32/40. */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
} as const;
export type SpacingToken = keyof typeof spacing;

/** Corner radii from DESIGN.md: 8/12/16/24/999. */
export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;
export type RadiusToken = keyof typeof radii;

/** Inter weights loaded by `useProFonts`, keyed by numeric weight. */
export const fontFamilies = {
  400: 'Inter_400Regular',
  500: 'Inter_500Medium',
  600: 'Inter_600SemiBold',
  700: 'Inter_700Bold',
  800: 'Inter_800ExtraBold',
} as const;
export type FontWeight = keyof typeof fontFamilies;

/** Type scale from DESIGN.md: 12/14/16/18/22/28/34. */
export const fontSizes = [12, 14, 16, 18, 22, 28, 34] as const;

export interface TextVariantStyle {
  fontSize: (typeof fontSizes)[number];
  lineHeight: number;
  weight: FontWeight;
  letterSpacing?: number;
  uppercase?: boolean;
}

export const typography = {
  display: { fontSize: 34, lineHeight: 40, weight: 800, letterSpacing: -0.6 },
  title1: { fontSize: 28, lineHeight: 34, weight: 800, letterSpacing: -0.4 },
  title2: { fontSize: 22, lineHeight: 28, weight: 700, letterSpacing: -0.2 },
  title3: { fontSize: 18, lineHeight: 24, weight: 700 },
  headline: { fontSize: 16, lineHeight: 22, weight: 600 },
  body: { fontSize: 16, lineHeight: 24, weight: 400 },
  subhead: { fontSize: 14, lineHeight: 20, weight: 500 },
  footnote: { fontSize: 14, lineHeight: 20, weight: 400 },
  caption: { fontSize: 12, lineHeight: 16, weight: 500 },
  overline: { fontSize: 12, lineHeight: 16, weight: 700, letterSpacing: 0.8, uppercase: true },
} as const satisfies Record<string, TextVariantStyle>;
export type TextVariant = keyof typeof typography;

export type ShadowToken = 'none' | 'sm' | 'md' | 'lg';

interface ShadowSpec {
  y: number;
  blur: number;
  opacity: number;
  elevation: number;
}

const shadowSpecs: Record<Exclude<ShadowToken, 'none'>, ShadowSpec> = {
  sm: { y: 1, blur: 3, opacity: 0.06, elevation: 1 },
  md: { y: 4, blur: 14, opacity: 0.08, elevation: 3 },
  lg: { y: 10, blur: 28, opacity: 0.12, elevation: 8 },
};

function hexToRgb(hex: string): string {
  const value = hex.replace('#', '');
  const n = parseInt(value.length === 3 ? value.replace(/./g, '$&$&') : value, 16);
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
}

/**
 * Soft, low-opacity shadows: native shadow props on iOS, elevation on
 * Android, and the CSS-style `boxShadow` on web (react-native-web
 * deprecates the iOS shadow props).
 */
export function makeShadow(token: ShadowToken, shadowColor: string): ViewStyle {
  if (token === 'none') return {};
  const s = shadowSpecs[token];
  return (
    Platform.select<ViewStyle>({
      ios: {
        shadowColor,
        shadowOffset: { width: 0, height: s.y },
        shadowOpacity: s.opacity * 1.4,
        shadowRadius: s.blur / 2,
      },
      android: { elevation: s.elevation, shadowColor },
      default: { boxShadow: `0px ${s.y}px ${s.blur}px rgba(${hexToRgb(shadowColor)}, ${s.opacity})` },
    }) ?? {}
  );
}

/** Motion constants. Reanimated animations respect the system reduce-motion setting. */
export const motion = {
  pressScale: 0.97,
  duration: { fast: 150, base: 250, slow: 400 },
  spring: {
    press: { damping: 18, stiffness: 320, mass: 0.6 },
    sheet: { damping: 24, stiffness: 240, mass: 0.9 },
    pop: { damping: 10, stiffness: 260, mass: 0.7 },
  },
} as const;

/** Minimum touch target (CLAUDE.md accessibility rule). */
export const MIN_TOUCH = 44;
