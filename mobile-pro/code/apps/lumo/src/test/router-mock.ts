import { useEffect } from 'react';

/** A stand-in for expo-router's imperative API and params in screen tests. */
export const router = {
  push: jest.fn(),
  navigate: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  setParams: jest.fn(),
  canGoBack: jest.fn(() => true),
};

export const params: { current: Record<string, string | undefined> } = { current: {} };

export function useLocalSearchParams() {
  return params.current;
}

/** Runs the effect once, like a screen that gains focus on mount. */
export function useFocusEffect(effect: () => void | (() => void)) {
  useEffect(() => effect(), [effect]);
}

export function resetRouter() {
  for (const fn of Object.values(router)) fn.mockClear();
  params.current = {};
}
