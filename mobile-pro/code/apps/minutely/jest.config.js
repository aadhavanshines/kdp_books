/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  // Reanimated's resolver loads the JS builds of Reanimated and Worklets in tests.
  resolver: 'react-native-reanimated/jest/resolver.js',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testMatch: ['<rootDir>/src/**/*.test.{ts,tsx}'],
};
