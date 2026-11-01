// Reanimated 4 ships its own Jest setup: animations run synchronously with
// Jest fake timers, and worklets execute on the JS thread.
require('react-native-reanimated').setUpTests();

// Icon fonts are bundled assets that Jest cannot register; treat every font
// as already loaded so @expo/vector-icons renders its glyphs synchronously.
jest.mock('expo-font', () => {
  const actual = jest.requireActual('expo-font');
  return {
    ...actual,
    isLoaded: () => true,
    loadAsync: () => Promise.resolve(),
    useFonts: () => [true, null],
  };
});
