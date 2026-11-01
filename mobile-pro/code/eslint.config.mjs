// @ts-check
import { defineConfig, globalIgnores } from 'eslint/config';
import expoConfig from 'eslint-config-expo/flat.js';
import { configs as tsConfigs } from 'typescript-eslint';
import globals from 'globals';

// typescript-eslint's recommended rules. eslint-config-expo already registers
// the @typescript-eslint plugin and parser for TS files, so only the rules are
// taken here, to avoid registering the plugin twice.
const tsRecommendedRules = Object.assign(
  {},
  ...tsConfigs.recommended.map((config) => config.rules ?? {}),
);

export default defineConfig([
  globalIgnores([
    '**/node_modules/**',
    '**/dist/**',
    '**/web-build/**',
    '**/.expo/**',
    '**/coverage/**',
    'apps/*/android/**',
    'apps/*/ios/**',
    'server/data/**',
    // Reelhouse TV has its own toolchain (react-native-tvos).
    'tv/**',
  ]),
  expoConfig,
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      ...tsRecommendedRules,
      // CLAUDE.md: no `any` without a comment saying why (an eslint-disable
      // comment with a reason is that comment).
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', ignoreRestSiblings: true },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      '@typescript-eslint/array-type': ['error', { default: 'array' }],
    },
  },
  {
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'prefer-const': 'error',
      'react/jsx-no-useless-fragment': 'error',
      'react/self-closing-comp': 'error',
      'import/no-duplicates': 'error',
    },
  },
  {
    // The Node server and build scripts.
    files: ['server/**/*.ts', '**/scripts/**/*.{js,mjs}', '*.config.{js,mjs,cjs}', '**/*.config.{js,mjs,cjs}'],
    languageOptions: { globals: { ...globals.node } },
    rules: {
      'no-console': 'off',
      // Expo inlines EXPO_PUBLIC_* at bundle time; Node reads process.env at run time.
      'expo/no-dynamic-env-var': 'off',
      'expo/no-env-var-destructuring': 'off',
    },
  },
  {
    files: ['**/*.test.ts', '**/*.test.tsx', '**/jest.setup.{js,ts}'],
    languageOptions: { globals: { ...globals.jest } },
  },
]);
