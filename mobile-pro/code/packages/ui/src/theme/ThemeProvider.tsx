import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';

import type { BrandName, ColorScheme } from '../tokens/colors';
import { createTheme, type Theme } from './createTheme';

const ThemeContext = createContext<Theme>(createTheme('platter', 'light'));

export interface ThemeProviderProps {
  brand: BrandName;
  /** 'system' (default) follows the device setting. */
  scheme?: ColorScheme | 'system';
  children: ReactNode;
}

export function ThemeProvider({ brand, scheme = 'system', children }: ThemeProviderProps) {
  const system = useColorScheme();
  const resolved: ColorScheme = scheme === 'system' ? (system === 'dark' ? 'dark' : 'light') : scheme;
  const theme = useMemo(() => createTheme(brand, resolved), [brand, resolved]);
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

/** The active theme. Outside a provider this is Platter, light. */
export function useTheme(): Theme {
  return useContext(ThemeContext);
}
