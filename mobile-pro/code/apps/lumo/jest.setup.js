// Reanimated 4 ships its own Jest setup: animations run synchronously with
// Jest fake timers, and worklets execute on the JS thread.
require('react-native-reanimated').setUpTests();

// Icon and Inter fonts are bundled assets Jest cannot register; treat them as loaded.
jest.mock('expo-font', () => {
  const actual = jest.requireActual('expo-font');
  return {
    ...actual,
    isLoaded: () => true,
    loadAsync: () => Promise.resolve(),
    useFonts: () => [true, null],
  };
});

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
