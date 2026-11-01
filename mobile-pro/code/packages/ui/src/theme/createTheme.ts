import {
  artTones,
  brands,
  neutrals,
  reelhouseNeutralOverrides,
  type ArtToneName,
  type BrandName,
  type ColorScheme,
  type ThemeColors,
} from '../tokens/colors';
import {
  fontFamilies,
  makeShadow,
  motion,
  radii,
  spacing,
  typography,
  type ShadowToken,
} from '../tokens/scale';

export interface Theme {
  brand: BrandName;
  scheme: ColorScheme;
  colors: ThemeColors;
  spacing: typeof spacing;
  radii: typeof radii;
  typography: typeof typography;
  fontFamilies: typeof fontFamilies;
  motion: typeof motion;
  shadow: (token: ShadowToken) => ReturnType<typeof makeShadow>;
  /** Gradient stops for an art tone in this scheme. */
  tone: (name: ArtToneName) => readonly string[];
  /** Readable text color over an art tone: `text` on pastels, `textInverse` on deep gradients. */
  onTone: (name: ArtToneName) => 'text' | 'textInverse';
}

/** Relative luminance (WCAG) of a #RRGGBB color, 0 to 1. */
export function luminance(hex: string): number {
  const v = hex.replace('#', '');
  const full = v.length === 3 ? v.replace(/./g, '$&$&') : v;
  const [r, g, b] = [0, 2, 4].map((i) => {
    const c = parseInt(full.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
}

/** Whether dark text reads better than white over these gradient stops (judged on the average). */
export function prefersDarkText(stops: readonly string[]): boolean {
  const avg = stops.reduce((s, c) => s + luminance(c), 0) / Math.max(1, stops.length);
  // Contrast with black vs white: (L + 0.05) / 0.05 against 1.05 / (L + 0.05).
  return (avg + 0.05) / 0.05 > 1.05 / (avg + 0.05);
}

/** Brands that only exist in a dark scheme. */
const DARK_ONLY: ReadonlySet<BrandName> = new Set(['reelhouse']);

export function resolveScheme(brand: BrandName, requested: ColorScheme): ColorScheme {
  return DARK_ONLY.has(brand) ? 'dark' : requested;
}

export function createTheme(brand: BrandName, requestedScheme: ColorScheme = 'light'): Theme {
  const scheme = resolveScheme(brand, requestedScheme);
  const neutral = brand === 'reelhouse' ? { ...neutrals.dark, ...reelhouseNeutralOverrides } : neutrals[scheme];
  const colors: ThemeColors = { ...neutral, ...brands[brand][scheme] };
  return {
    brand,
    scheme,
    colors,
    spacing,
    radii,
    typography,
    fontFamilies,
    motion,
    shadow: (token) => makeShadow(token, colors.shadow),
    tone: (name) => artTones[name][scheme],
    onTone: (name) => (prefersDarkText(artTones[name][scheme]) ? 'text' : 'textInverse'),
  };
}

/** Rating pill color band: 4.0+ green, 3.0 to 3.9 amber, below 3.0 red. */
export function ratingColor(rating: number, colors: ThemeColors): string {
  if (rating >= 4) return colors.ratingHigh;
  if (rating >= 3) return colors.ratingMid;
  return colors.ratingLow;
}
