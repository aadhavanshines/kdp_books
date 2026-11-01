/** A stand-in for expo-router's imperative API and params in screen tests. */
export const router = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  setParams: jest.fn(),
  canGoBack: jest.fn(() => true),
};

export const params: { current: Record<string, string | undefined> } = { current: {} };

export function useLocalSearchParams() {
  return params.current;
}

export function resetRouter() {
  for (const fn of Object.values(router)) fn.mockClear();
  params.current = {};
}
