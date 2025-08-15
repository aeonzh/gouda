import eslint from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import importPlugin from 'eslint-plugin-import';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';
import perfectionist from 'eslint-plugin-perfectionist';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

export default tseslint.config([
  eslint.configs.recommended,
  eslintConfigPrettier,
  perfectionist.configs['recommended-natural'],
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
  reactHooks.configs['recommended-latest'],
  {
    ignores: [
      '**/.expo/**',
      '**/node_modules/**',
      '**/dist/**', // Added to ignore dist files
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
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'import/default': 'off',
      // https://typescript-eslint.io/troubleshooting/typed-linting/performance/#eslint-plugin-import
      'import/named': 'off',
      'import/namespace': 'off',
      'import/no-cycle': 'off',
      'import/no-deprecated': 'off',
      'import/no-named-as-default': 'off',
      'import/no-unused-modules': 'off',
      'import/node-named-as-default-member': 'off',
      'perfectionist/sort-interfaces': [
        'error',
        {
          customGroups: [
            {
              elementNamePattern:
                '^(?:id|business_id|profile_id|user_id|cart_id|product_id|category_id|order_id)',
              groupName: 'top',
              selector: 'property',
            },
            {
              elementNamePattern: '^(?:name|username|full_name|business_name)',
              groupName: 'name-group',
              selector: 'property',
            },
            {
              elementNamePattern:
                '^(?:address_line1|address_line2|city|state|postal_code|country)',
              groupName: 'address-group',
              selector: 'property',
            },
            {
              elementNamePattern: '^(?:created_at|updated_at|deleted_at)',
              groupName: 'bottom',
              selector: 'property',
            },
          ],
          groups: ['top', 'name-group', 'address-group', 'unknown', 'bottom'],
        },
      ],
      'perfectionist/sort-union-types': [
        'error',
        {
          groups: [
            'conditional',
            'function',
            'import',
            'intersection',
            'keyword',
            'literal',
            'named',
            'object',
            'operator',
            'tuple',
            'union',
            'nullish',
          ],
        },
      ],
    },
    settings: {
      'import/resolver': {
        node: true,
        typescript: {
          alwaysTryTypes: true,
          project: ['packages/**/tsconfig.json', 'apps/**/tsconfig.json'],
        },
      },
      languageOptions: {
        parserOptions: {
          projectService: true,
          tsconfigRootDir: import.meta.dirname,
        },
      },
      perfectionist: {
        partitionByComment: true,
      },
      react: {
        version: 'detect',
      },
    },
  },
  // {
  //   files: [
  //     '**/*.test.{js,ts,tsx}',
  //     '**/jest-setup.js',
  //     '**/__mocks__/**/*.js',
  //     '**/__tests__/**/*.js',
  //   ],
  //   languageOptions: {
  //     globals: {
  //       globalThis: true,
  //       jest: true,
  //       module: true,
  //       // Add other Node.js globals if necessary, e.g., process, console, require
  //       // For now, 'module' and 'globalThis' should cover the previous 'node: true'
  //     },
  //   },
  //   rules: {
  //     '@typescript-eslint/no-require-imports': 'off',
  //     'no-undef': 'off',
  //   },
  // },
]);
