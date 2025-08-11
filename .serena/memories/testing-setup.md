Jest testing is configured and passing for the Expo RN monorepo.

- B2C (`apps/b2c`):
  - Uses `jest-expo` preset
  - `transformIgnorePatterns` includes: `jest-expo|expo|@expo|react-native|@react-native|expo-router|@react-navigation|@supabase/supabase-js|@react-native-picker/picker|expo-modules-core|shared`
  - `setupFilesAfterEnv`: `apps/b2c/jest-setup.js`, `@testing-library/jest-native/extend-expect`
  - Module alias for shared: `^shared/(.*)$` -> `../../packages/shared/$1`
  - Error-guard mock mapped to root: `^@react-native/js-polyfills/error-guard$` -> `../../__mocks__/@react-native/js-polyfills/error-guard.js`
  - Example test: `apps/b2c/simple.test.ts`

- Shared (`packages/shared`):
  - Uses `jest-expo` preset & `jsdom` env
  - Same `transformIgnorePatterns` as B2C (includes expo/@expo)
  - `setupFilesAfterEnv`: `packages/shared/jest-setup.js`, `@testing-library/jest-native/extend-expect`
  - Error-guard mock mapped to root `__mocks__`
  - `jest-setup.js` optionally mocks `react-native/Libraries/Animated/NativeAnimatedHelper` (wrapped in try/catch)
  - Button component updated to wrap string/number children in `Text` so tests can query by text

- Root `__mocks__`:
  - `__mocks__/@react-native/js-polyfills/error-guard.js` provides a noop mock used by both workspaces

- Commands:
  - All tests: `pnpm test`
  - B2C tests only: `pnpm test:b2c`

- Next steps:
  - Add real tests in `apps/b2c` for components/screens
  - Consider adding coverage config and CI integration
