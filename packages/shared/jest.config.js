module.exports = {
  collectCoverage: true,
  collectCoverageFrom: [
    '<rootDir>/api/**/*.{ts,tsx}',
    '<rootDir>/components/**/*.{ts,tsx}',
  ],
  coverageThreshold: {
    global: {
      lines: 0.8,
      statements: 0.8,
    },
  },
  moduleNameMapper: {
    '^@react-native/js-polyfills/error-guard$':
      '<rootDir>/../../__mocks__/@react-native/js-polyfills/error-guard.js',
    '^react-native$': 'react-native',
  },
  preset: 'jest-expo',
  setupFilesAfterEnv: [
    '<rootDir>/jest-setup.js',
    '@testing-library/jest-native/extend-expect',
  ],
  testEnvironment: 'jsdom',
  testMatch: ['<rootDir>/**/__tests__/**/*.(test|spec).(ts|tsx|js)'],
  transform: {
    '^.+\\.js$': 'babel-jest',
    '^.+\\.tsx?$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!((\\.pnpm/.+?/node_modules/)?(jest-expo|expo|@expo|react-native|@react-native|expo-router|@react-navigation|@supabase/supabase-js|@react-native-picker/picker|expo-modules-core)/))',
  ],
};
