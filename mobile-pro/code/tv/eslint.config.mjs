// @ts-check
// Reelhouse TV lints itself (the workspace config at the repo root ignores
// tv/). Same rules as the workspace: expo + typescript-eslint recommended.
import { defineConfig, globalIgnores } from 'eslint/config';
import expoConfig from 'eslint-config-expo/flat.js';
import { configs as tsConfigs } from 'typescript-eslint';
import globals from 'globals';

const tsRecommendedRules = Object.assign({}, ...tsConfigs.recommended.map((config) => config.rules ?? {}));

export default defineConfig([
  globalIgnores(['node_modules/**', 'dist/**', '.expo/**', 'android/**', 'ios/**', 'screenshots/**', 'expo-env.d.ts']),
  expoConfig,
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      ...tsRecommendedRules,
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_', ignoreRestSiblings: true }],
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports', fixStyle: 'inline-type-imports' }],
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
    files: ['scripts/**/*.{js,mjs}', '*.config.{js,mjs,cjs}', 'babel.config.js', 'metro.config.js'],
    languageOptions: { globals: { ...globals.node } },
    rules: { 'no-console': 'off' },
  },
  {
    files: ['**/*.test.ts', '**/*.test.tsx'],
    languageOptions: { globals: { ...globals.jest } },
  },
]);
