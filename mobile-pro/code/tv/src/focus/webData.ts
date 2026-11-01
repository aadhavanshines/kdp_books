import { Platform } from 'react-native';

/**
 * react-native-web turns a `dataSet` prop into data-* attributes, which the
 * web navigator uses to find focusables, groups and traps. Native views get
 * nothing. `dataSet` is not in React Native's prop types, hence the loose
 * return type (spread into a View's props).
 */
export function webData(data: Record<string, string | undefined>): Record<string, unknown> {
  if (Platform.OS !== 'web') return {};
  const clean: Record<string, string> = {};
  Object.entries(data).forEach(([k, v]) => {
    if (v !== undefined) clean[k] = v;
  });
  return { dataSet: clean };
}
