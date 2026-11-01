/**
 * Color tokens. Apps never use hex values directly: they read semantic
 * colors from `useTheme().colors`, which merges the shared neutral system
 * with one brand palette for the active color scheme.
 */

export type BrandName = 'platter' | 'cartly' | 'lumo' | 'minutely' | 'reelhouse';
export type ColorScheme = 'light' | 'dark';

export const BRAND_NAMES: readonly BrandName[] = ['platter', 'cartly', 'lumo', 'minutely', 'reelhouse'];

export interface NeutralColors {
  /** Screen background (#F5F6F8 in light). */
  background: string;
  /** Cards, sheets, bars (#FFFFFF in light). */
  surface: string;
  /** A slightly lifted surface, e.g. a sheet over a card. */
  surfaceRaised: string;
  /** Inputs, chips and wells. */
  surfaceMuted: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  /** Text on a dark or brand fill. */
  textInverse: string;
  border: string;
  divider: string;
  /** Modal backdrop. */
  overlay: string;
  skeleton: string;
  skeletonHighlight: string;
  success: string;
  successSoft: string;
  warning: string;
  warningSoft: string;
  danger: string;
  dangerSoft: string;
  info: string;
  infoSoft: string;
  /** Star icons in reviews. */
  star: string;
  /** Rating pill fills, by score band. */
  ratingHigh: string;
  ratingMid: string;
  ratingLow: string;
  /** Food markers (Indian veg / non-veg convention). */
  veg: string;
  nonVeg: string;
  shadow: string;
  /** Story ring when all stories are seen. */
  ringSeen: string;
  /** Like heart. */
  like: string;
  map: MapColors;
}

export interface MapColors {
  land: string;
  block: string;
  park: string;
  water: string;
  road: string;
  roadMajor: string;
  routeDone: string;
}

export interface BrandColors {
  primary: string;
  primaryPressed: string;
  onPrimary: string;
  /** A tinted background for selected chips, banners and badges. */
  primarySoft: string;
  /** Text or icons in brand color on `primarySoft`. */
  onPrimarySoft: string;
  accent: string;
  onAccent: string;
  accentSoft: string;
  /** Brand gradient, at least two stops. Solid brands repeat the primary. */
  gradient: readonly [string, string, ...string[]];
}

export type ThemeColors = NeutralColors & BrandColors;

export const neutrals: Record<ColorScheme, NeutralColors> = {
  light: {
    background: '#F5F6F8',
    surface: '#FFFFFF',
    surfaceRaised: '#FFFFFF',
    surfaceMuted: '#EEF0F3',
    text: '#111317',
    textSecondary: '#474D59',
    textMuted: '#6B7280',
    textInverse: '#FFFFFF',
    border: '#E2E5EA',
    divider: '#ECEEF1',
    overlay: 'rgba(10, 12, 16, 0.52)',
    skeleton: '#E8EAEE',
    skeletonHighlight: '#F6F7F9',
    success: '#1A8F5C',
    successSoft: '#E5F6EE',
    warning: '#B76E00',
    warningSoft: '#FFF4DB',
    danger: '#D92D3A',
    dangerSoft: '#FDE8EA',
    info: '#2563EB',
    infoSoft: '#E6EEFE',
    star: '#F5A70A',
    ratingHigh: '#1A8F4C',
    ratingMid: '#C98A00',
    ratingLow: '#D2463F',
    veg: '#0F8A3B',
    nonVeg: '#A8361C',
    shadow: '#0B1220',
    ringSeen: '#C9CDD4',
    like: '#ED2E4E',
    map: {
      land: '#F2EFE9',
      block: '#E6E2DA',
      park: '#CDEBC9',
      water: '#BBDDF5',
      road: '#FFFFFF',
      roadMajor: '#FFE9B0',
      routeDone: '#9AA3AF',
    },
  },
  dark: {
    background: '#0E0F12',
    surface: '#17191E',
    surfaceRaised: '#1F2228',
    surfaceMuted: '#24272E',
    text: '#F3F4F6',
    textSecondary: '#BCC1CA',
    textMuted: '#8D94A0',
    textInverse: '#FFFFFF',
    border: '#2E323A',
    divider: '#25282F',
    overlay: 'rgba(0, 0, 0, 0.62)',
    skeleton: '#23262D',
    skeletonHighlight: '#2F333B',
    success: '#34C17E',
    successSoft: '#123324',
    warning: '#F2B33D',
    warningSoft: '#3A2C0E',
    danger: '#F2555F',
    dangerSoft: '#3D171B',
    info: '#6A9BFF',
    infoSoft: '#16264A',
    star: '#FFBF2E',
    ratingHigh: '#23A15A',
    ratingMid: '#D49A12',
    ratingLow: '#E05A52',
    veg: '#35B864',
    nonVeg: '#E0603D',
    shadow: '#000000',
    ringSeen: '#4A4F59',
    like: '#FF4D6A',
    map: {
      land: '#1C1E22',
      block: '#25282E',
      park: '#1E3324',
      water: '#14293B',
      road: '#33373F',
      roadMajor: '#4A4430',
      routeDone: '#5B626D',
    },
  },
};

export const brands: Record<BrandName, Record<ColorScheme, BrandColors>> = {
  platter: {
    light: {
      primary: '#FC5A1E',
      primaryPressed: '#E04A12',
      onPrimary: '#FFFFFF',
      primarySoft: '#FFF0E9',
      onPrimarySoft: '#C2410C',
      accent: '#1BA672',
      onAccent: '#FFFFFF',
      accentSoft: '#E3F6EE',
      gradient: ['#FF7A3D', '#FC5A1E'],
    },
    dark: {
      primary: '#FF6A33',
      primaryPressed: '#FC5A1E',
      onPrimary: '#FFFFFF',
      primarySoft: '#3A1E13',
      onPrimarySoft: '#FFA27A',
      accent: '#2BC285',
      onAccent: '#06261A',
      accentSoft: '#11332A',
      gradient: ['#FF8A52', '#FC5A1E'],
    },
  },
  cartly: {
    light: {
      primary: '#2453FF',
      primaryPressed: '#1A42E0',
      onPrimary: '#FFFFFF',
      primarySoft: '#EAF0FF',
      onPrimarySoft: '#1A3FD1',
      accent: '#FFC21A',
      onAccent: '#1A1400',
      accentSoft: '#FFF6D6',
      gradient: ['#3D6BFF', '#2453FF'],
    },
    dark: {
      primary: '#5277FF',
      primaryPressed: '#2453FF',
      onPrimary: '#FFFFFF',
      primarySoft: '#17224A',
      onPrimarySoft: '#A5B9FF',
      accent: '#FFC933',
      onAccent: '#1A1400',
      accentSoft: '#3A2F0B',
      gradient: ['#5C80FF', '#2453FF'],
    },
  },
  lumo: {
    light: {
      primary: '#DD2A7B',
      primaryPressed: '#C21F69',
      onPrimary: '#FFFFFF',
      primarySoft: '#FDE9F2',
      onPrimarySoft: '#B01C60',
      accent: '#0095F6',
      onAccent: '#FFFFFF',
      accentSoft: '#E1F2FE',
      gradient: ['#F58529', '#DD2A7B', '#8134AF'],
    },
    dark: {
      primary: '#EE4A93',
      primaryPressed: '#DD2A7B',
      onPrimary: '#FFFFFF',
      primarySoft: '#3B1328',
      onPrimarySoft: '#F7A3C8',
      accent: '#1AA3FF',
      onAccent: '#FFFFFF',
      accentSoft: '#0E2B42',
      gradient: ['#F58529', '#DD2A7B', '#8134AF'],
    },
  },
  minutely: {
    light: {
      primary: '#0C831F',
      primaryPressed: '#0A6E1A',
      onPrimary: '#FFFFFF',
      primarySoft: '#E8F5EA',
      onPrimarySoft: '#0A6E1A',
      accent: '#F8CB46',
      onAccent: '#1F1A05',
      accentSoft: '#FEF6DA',
      gradient: ['#1A9A30', '#0C831F'],
    },
    dark: {
      primary: '#22A33A',
      primaryPressed: '#0C831F',
      onPrimary: '#FFFFFF',
      primarySoft: '#11301A',
      onPrimarySoft: '#8EE0A0',
      accent: '#F8CB46',
      onAccent: '#1F1A05',
      accentSoft: '#3A300E',
      gradient: ['#2BB545', '#0C831F'],
    },
  },
  // Reelhouse TV is dark only; the light entry mirrors dark so that a
  // forced light scheme still renders correctly.
  reelhouse: {
    light: {
      primary: '#7C5CFF',
      primaryPressed: '#6A47F5',
      onPrimary: '#FFFFFF',
      primarySoft: '#251E4A',
      onPrimarySoft: '#C3B5FF',
      accent: '#22D3EE',
      onAccent: '#04222A',
      accentSoft: '#0C3540',
      gradient: ['#9B82FF', '#7C5CFF', '#22D3EE'],
    },
    dark: {
      primary: '#7C5CFF',
      primaryPressed: '#6A47F5',
      onPrimary: '#FFFFFF',
      primarySoft: '#251E4A',
      onPrimarySoft: '#C3B5FF',
      accent: '#22D3EE',
      onAccent: '#04222A',
      accentSoft: '#0C3540',
      gradient: ['#9B82FF', '#7C5CFF', '#22D3EE'],
    },
  },
};

/** Reelhouse's cinematic background is a touch deeper than the shared dark. */
export const reelhouseNeutralOverrides: Partial<NeutralColors> = {
  background: '#0A0A10',
  surface: '#14141D',
  surfaceRaised: '#1C1C28',
  surfaceMuted: '#22222F',
};

/**
 * Soft and vivid gradients that sit behind 3D art: ArtTile backgrounds,
 * Lumo "photos", banners and posters. Keys are shared with the API
 * (`ArtTone` in @pro/api) so seed data can name a tone.
 */
export const artTones = {
  peach: { light: ['#FFEADB', '#FFD2B8'], dark: ['#3A2418', '#4A2C1C'] },
  mint: { light: ['#E2F7EC', '#C2ECD5'], dark: ['#132E22', '#18392A'] },
  sky: { light: ['#E3EFFF', '#C7DCFF'], dark: ['#152440', '#1B2E52'] },
  lilac: { light: ['#F0E9FF', '#DCCDFF'], dark: ['#251D40', '#2E2450'] },
  butter: { light: ['#FFF7D9', '#FFE9A6'], dark: ['#3A3212', '#463B15'] },
  rose: { light: ['#FFE6EE', '#FFCADB'], dark: ['#3D1A26', '#4A1F2E'] },
  sand: { light: ['#F7F0E6', '#EADCC8'], dark: ['#2E281F', '#383025'] },
  aqua: { light: ['#DFF7F9', '#BBEDF2'], dark: ['#10303A', '#143B46'] },
  sunset: { light: ['#FFB07C', '#FF6F91', '#C86DD7'], dark: ['#C2582E', '#B03A64', '#7A3A9A'] },
  ocean: { light: ['#56CCF2', '#2F80ED'], dark: ['#1C6E99', '#1B4E9B'] },
  dusk: { light: ['#4B6CB7', '#182848'], dark: ['#33497E', '#10182E'] },
  meadow: { light: ['#B6E388', '#5DBB63'], dark: ['#4C7A35', '#2C6B33'] },
  night: { light: ['#2C5364', '#203A43', '#0F2027'], dark: ['#21404D', '#172C33', '#0A161B'] },
  candy: { light: ['#FBC2EB', '#A6C1EE'], dark: ['#8A5A85', '#566C99'] },
  ember: { light: ['#F5AF19', '#F12711'], dark: ['#B27F12', '#A81C0C'] },
  aurora: { light: ['#43CEA2', '#185A9D'], dark: ['#2C8C6E', '#123F6E'] },
} as const satisfies Record<string, Record<ColorScheme, readonly string[]>>;

export type ArtToneName = keyof typeof artTones;
export const ART_TONE_NAMES = Object.keys(artTones) as ArtToneName[];

/**
 * Colors baked into Lumo "photos" (light, glow, shadow and filter washes).
 * Photos are content, so these do not change with the color scheme.
 */
export const photoColors = {
  light: '#FFFFFF',
  shade: '#0B0B12',
  warm: '#FF8A3D',
  cool: '#3D7BFF',
  mono: '#7F7F7F',
  fade: '#F4EFE8',
  dusk: ['#6A3093', '#FF7E5F'],
  /** Story viewer and full-screen media chrome. */
  scrim: 'rgba(0, 0, 0, 0.35)',
  /** Unfilled story progress bar. */
  track: 'rgba(255, 255, 255, 0.38)',
  media: '#000000',
} as const;
