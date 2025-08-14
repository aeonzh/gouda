module.exports = {
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
    '^../../packages/shared/api/supabase$':
      '<rootDir>/testing/mocks/supabase.js',
    '^@react-native/js-polyfills/error-guard$':
      '<rootDir>/../../__mocks__/@react-native/js-polyfills/error-guard.js',
    '^packages/shared/components$':
      '<rootDir>/testing/mocks/shared-components.js',
    'msw/node': '<rootDir>/node_modules/msw/lib/node/index.js',
  },
  preset: 'jest-expo',
  setupFilesAfterEnv: [
    '<rootDir>/jest-setup.js',
    '@testing-library/jest-native/extend-expect',
  ],
  testMatch: ['<rootDir>/**/__tests__/**/*.(test|spec).(ts|tsx|js)'],
  transformIgnorePatterns: [],
};
