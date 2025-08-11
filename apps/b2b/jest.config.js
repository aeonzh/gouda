/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest-setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(expo|@expo|react-native|@react-native|expo-router|@react-navigation|@supabase/supabase-js|@react-native-picker/picker|expo-modules-core)/)',
  ],
  moduleNameMapper: {
    '^@react-native/js-polyfills/error-guard$':
      '<rootDir>/../../__mocks__/@react-native/js-polyfills/error-guard.js',
    'shared/(.*)': '<rootDir>/../../packages/shared/$1',
  },
  testEnvironment: 'jsdom',
};
