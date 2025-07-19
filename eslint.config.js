import tseslint from 'typescript-eslint';
import importPlugin from 'eslint-plugin-import';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';
import perfectionist from 'eslint-plugin-perfectionist';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import reactPlugin from 'eslint-plugin-react';
import eslint from '@eslint/js';

import * as reactHooks from 'eslint-plugin-react-hooks';

export default tseslint.config([
  eslint.configs.recommended,
  eslintConfigPrettier,
  /* eslint-disable import/no-named-as-default-member */
  tseslint.configs.recommended,
  tseslint.configs.strict,
  tseslint.configs.stylistic,
  /* eslint-enable import/no-named-as-default-member */
  importPlugin.flatConfigs.recommended,
  importPlugin.flatConfigs.react,
  importPlugin.flatConfigs['react-native'],
  importPlugin.flatConfigs.typescript,
  jsxA11yPlugin.flatConfigs.recommended,
  reactPlugin.configs.flat.recommended,
  reactPlugin.configs.flat['jsx-runtime'],
  // reactHooks.configs['recommended-latest'],
  {
    ignores: [
      '**/.expo/**',
      '**/node_modules/**',
      '**/*.generated.js',
      '**/*.generated.ts',
      '**/app.config.ts',
      '**/babel.config.js',
      '**/metro.config.js',
      '**/tailwind.config.js',
      'expo-env.d.ts',
      'nativewind-env.d.ts',
    ],
  },
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      perfectionist,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      // https://typescript-eslint.io/troubleshooting/typed-linting/performance/#eslint-plugin-import
      'import/named': 'off',
      'import/namespace': 'off',
      'import/default': 'off',
      'import/node-named-as-default-member': 'off',
      'import/no-named-as-default': 'off',
      'import/no-cycle': 'off',
      'import/no-unused-modules': 'off',
      'import/no-deprecated': 'off',
      'import/order': 'error',
    },
    settings: {
      react: {
        version: 'detect',
      },
      'import/resolver': {
        node: true,
        typescript: {
          alwaysTryTypes: true,
          project: ['packages/**/tsconfig.json', 'apps/**/tsconfig.json'],
        },
      },
      perfectionist: {
        order: 'asc',
        partitionByComment: true,
        type: 'natural',
      },
      languageOptions: {
        parserOptions: {
          projectService: true,
          tsconfigRootDir: import.meta.dirname,
        },
      },
    },
  },
]);
