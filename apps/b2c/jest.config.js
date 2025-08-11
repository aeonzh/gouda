module.exports = {
  preset: 'jest-expo',
  transform: {
    '^.+\.js$': 'babel-jest',
    '^.+\.tsx?$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!((\\.pnpm/.+?/node_modules/)?(jest-expo|expo|@expo|@expo/vector-icons|react-native|@react-native|react-native-css-interop|expo-router|@react-navigation|@supabase/supabase-js|@react-native-picker/picker|expo-modules-core|msw|shared)/))',
  ],
  setupFilesAfterEnv: [
    '<rootDir>/jest-setup.js',
    '@testing-library/jest-native/extend-expect',
  ],
  collectCoverage: true,
  collectCoverageFrom: [
    '<rootDir>/app/**/*.{ts,tsx}',
    '!<rootDir>/**/_layout.tsx',
  ],
  coverageThreshold: {
    global: {
      lines: 0.6,
      statements: 0.6,
    },
  },
  moduleNameMapper: {
    '^shared/components$': '<rootDir>/testing/mocks/shared-components.js',
    '^packages/shared/components$':
      '<rootDir>/testing/mocks/shared-components.js',
    '^packages/shared/components/AuthProvider$':
      '<rootDir>/testing/mocks/shared-components.js',
    '^shared/components/AuthProvider$':
      '<rootDir>/testing/mocks/shared-components.js',
    '^shared/(.*)$': '<rootDir>/../../packages/shared/$1',
    '^react-native-css-interop$':
      '<rootDir>/testing/mocks/react-native-css-interop.js',
    '^@expo/vector-icons$': '<rootDir>/testing/mocks/vector-icons.js',
    '^@react-native/js-polyfills/error-guard$':
      '<rootDir>/../../__mocks__/@react-native/js-polyfills/error-guard.js',
  },
  testMatch: ['<rootDir>/**/__tests__/**/*.(test|spec).(ts|tsx|js)'],
};
