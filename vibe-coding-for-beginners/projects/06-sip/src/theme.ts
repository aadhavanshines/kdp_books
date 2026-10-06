import { useColorScheme } from '@/hooks/use-color-scheme';

export const lightColors = {
  background: '#F4F8FB',
  surface: '#FFFFFF',
  text: '#0B1B2B',
  textSecondary: '#4A5B6B',
  border: '#C9D6E2',
  track: '#D7E6F3',
  primary: '#0A62B5',
  onPrimary: '#FFFFFF',
  secondary: '#E1EEFA',
  onSecondary: '#074B8C',
  danger: '#B3261E',
  disabled: '#E3E8ED',
  onDisabled: '#59656F',
};

export const darkColors: typeof lightColors = {
  background: '#0A121A',
  surface: '#14212E',
  text: '#EAF2F9',
  textSecondary: '#A7B8C8',
  border: '#2C3E50',
  track: '#243648',
  primary: '#5DB4F7',
  onPrimary: '#04223C',
  secondary: '#1F3A54',
  onSecondary: '#BFE0FB',
  danger: '#FF8A80',
  disabled: '#1B2733',
  onDisabled: '#8C9BA8',
};

export type Colors = typeof lightColors;

export function useColors(): Colors {
  return useColorScheme() === 'dark' ? darkColors : lightColors;
}

/** Minimum touch target in points (Apple HIG / WCAG 2.5.5 guidance). */
export const MIN_TARGET = 44;
