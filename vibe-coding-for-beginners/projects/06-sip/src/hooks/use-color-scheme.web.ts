import { useEffect, useState } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

/**
 * The web build is statically rendered at build time, where the scheme is always
 * "light". If the first client render read the real scheme, React would hydrate
 * dark styles onto light HTML and silently keep the light DOM. So render "light"
 * first (matching the HTML), then switch to the real value after hydration.
 */
export function useColorScheme(): 'light' | 'dark' {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  const scheme = useRNColorScheme();
  return hydrated && scheme === 'dark' ? 'dark' : 'light';
}
