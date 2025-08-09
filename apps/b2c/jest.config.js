module.exports = {
  preset: 'jest-expo',
  transform: {
    '^.+\.js$': 'babel-jest',
    '^.+\.tsx?$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!((\\.pnpm/.+?/node_modules/)?(jest-expo|expo|@expo|react-native|@react-native|expo-router|@react-navigation|@supabase/supabase-js|@react-native-picker/picker|expo-modules-core|shared)/))',
  ],
  setupFilesAfterEnv: [
    '<rootDir>/jest-setup.js',
    '@testing-library/jest-native/extend-expect',
  ],
  moduleNameMapper: {
    '^shared/(.*)$': '<rootDir>/../../packages/shared/$1',
    '^@react-native/js-polyfills/error-guard$':
      '<rootDir>/../../__mocks__/@react-native/js-polyfills/error-guard.js',
  },
  testMatch: ['<rootDir>/simple.test.ts'],
};
