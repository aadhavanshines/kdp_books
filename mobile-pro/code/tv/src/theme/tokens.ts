/**
 * Reelhouse design tokens, copied from @pro/ui (packages/ui/src/tokens) because
 * tv/ is outside the npm workspace. Reelhouse is dark only: violet primary,
 * cyan accent, near-black neutrals. Screens never use hex values directly;
 * they read from `colors`, `tones` and the scales below.
 */

export const colors = {
  // Neutrals: @pro/ui dark neutrals with the Reelhouse overrides.
  background: '#0A0A10',
  surface: '#14141D',
  surfaceRaised: '#1C1C28',
  surfaceMuted: '#22222F',
  text: '#F3F4F6',
  textSecondary: '#BCC1CA',
  textMuted: '#8D94A0',
  border: '#2E323A',
  divider: '#25282F',
  overlay: 'rgba(0, 0, 0, 0.62)',
  success: '#34C17E',
  warning: '#F2B33D',
  danger: '#F2555F',
  star: '#FFBF2E',
  shadow: '#000000',
  // Brand (reelhouse.dark in @pro/ui).
  primary: '#7C5CFF',
  primaryPressed: '#6A47F5',
  onPrimary: '#FFFFFF',
  primarySoft: '#251E4A',
  onPrimarySoft: '#C3B5FF',
  accent: '#22D3EE',
  onAccent: '#04222A',
  accentSoft: '#0C3540',
  gradient: ['#9B82FF', '#7C5CFF', '#22D3EE'] as const,
  // TV-only: the focus ring, its glow, scrims over backdrops and the LIVE badge.
  focusRing: '#FFFFFF',
  focusGlow: 'rgba(124, 92, 255, 0.85)',
  focusGlowAccent: 'rgba(34, 211, 238, 0.55)',
  focusFill: '#F3F4F6',
  onFocusFill: '#0A0A10',
  scrim: '#0A0A10',
  glass: 'rgba(20, 20, 29, 0.72)',
  glassStrong: 'rgba(20, 20, 29, 0.92)',
  hairline: 'rgba(255, 255, 255, 0.14)',
  track: 'rgba(255, 255, 255, 0.24)',
  live: '#F2555F',
  onLive: '#FFFFFF',
  numeral: '#0A0A10',
  numeralStroke: '#5D6170',
} as const;

/**
 * Rich gradients behind posters and backdrops. The first eight are the dark
 * `artTones` from @pro/ui; the rest are deeper "cinema" tones added for TV.
 */
export const tones = {
  sunset: ['#C2582E', '#B03A64', '#7A3A9A'],
  ocean: ['#1C6E99', '#1B4E9B'],
  dusk: ['#33497E', '#10182E'],
  meadow: ['#4C7A35', '#2C6B33'],
  night: ['#21404D', '#172C33', '#0A161B'],
  candy: ['#8A5A85', '#566C99'],
  ember: ['#B27F12', '#A81C0C'],
  aurora: ['#2C8C6E', '#123F6E'],
  violet: ['#5B3FD9', '#2A1B6E', '#120B33'],
  cyan: ['#0E7490', '#164E63', '#0B2530'],
  crimson: ['#9F1239', '#4C0519', '#1C0209'],
  gold: ['#B45309', '#78350F', '#2B1405'],
  forest: ['#166534', '#14532D', '#05200F'],
  steel: ['#475569', '#1E293B', '#0B1120'],
  orchid: ['#A21CAF', '#581C87', '#1E0838'],
  teal: ['#0F766E', '#134E4A', '#042F2E'],
} as const satisfies Record<string, readonly string[]>;

export type ToneName = keyof typeof tones;
export const TONE_NAMES = Object.keys(tones) as ToneName[];

/** Spacing on the 1920 x 1080 canvas: the @pro/ui scale, extended for TV. */
export const spacing = { xxs: 4, xs: 8, sm: 12, md: 16, lg: 24, xl: 32, xxl: 48, xxxl: 64, safe: 96 } as const;

/** Radii from @pro/ui (8/12/16/24/999). */
export const radii = { sm: 8, md: 12, lg: 16, xl: 24, pill: 999 } as const;

/**
 * Type for a 10-foot screen. Mobile sizes (12 to 34) are far too small across
 * a room, so TV text starts at 22 and display type goes up to 96.
 */
export const typography = {
  display: { fontSize: 96, lineHeight: 100, fontFamily: 'Inter_900Black', letterSpacing: -2 },
  title1: { fontSize: 56, lineHeight: 64, fontFamily: 'Inter_800ExtraBold', letterSpacing: -1 },
  title2: { fontSize: 40, lineHeight: 48, fontFamily: 'Inter_800ExtraBold', letterSpacing: -0.5 },
  title3: { fontSize: 32, lineHeight: 40, fontFamily: 'Inter_700Bold', letterSpacing: 0 },
  headline: { fontSize: 28, lineHeight: 36, fontFamily: 'Inter_700Bold', letterSpacing: 0 },
  body: { fontSize: 26, lineHeight: 38, fontFamily: 'Inter_400Regular', letterSpacing: 0 },
  bodyStrong: { fontSize: 26, lineHeight: 36, fontFamily: 'Inter_600SemiBold', letterSpacing: 0 },
  label: { fontSize: 24, lineHeight: 32, fontFamily: 'Inter_600SemiBold', letterSpacing: 0 },
  caption: { fontSize: 22, lineHeight: 28, fontFamily: 'Inter_500Medium', letterSpacing: 0.2 },
  overline: { fontSize: 20, lineHeight: 24, fontFamily: 'Inter_800ExtraBold', letterSpacing: 2 },
} as const;

export type TypeVariant = keyof typeof typography;

/** Focus motion: how much a focused card grows and how fast. */
export const motion = { focusScale: 1.08, buttonFocusScale: 1.06, focusMs: 160 } as const;
