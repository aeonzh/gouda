## PNPM/Jest Monorepo Test Commands

- pnpm -r --if-present
  - `-r` runs the script recursively across all workspaces
  - `--if-present` skips packages that don’t define the script (prevents failure)

- pnpm -r --if-present test -- --coverage
  - Runs `test` in each workspace that has it
  - `--` forwards flags to the test runner (e.g., Jest)
  - `--coverage` enables coverage collection

- CI=1 pnpm -r --if-present test -- --ci --runInBand
  - `CI=1` signals CI environment
  - Recursively runs tests where present
  - `--ci` makes Jest non-interactive and CI-optimized
  - `--runInBand` runs tests serially to reduce flakiness on CI

## Jest Testing Setup Verification (Monorepo)

- Transforms configured
  - `apps/b2c/jest.config.js` and `packages/shared/jest.config.js` use `preset: 'jest-expo'` and include `expo|@expo|react-native|@react-native|expo-router|@react-navigation|@supabase/supabase-js|@react-native-picker/picker|expo-modules-core` in `transformIgnorePatterns` exceptions.

- error-guard mock mapped and present
  - Both map `^@react-native/js-polyfills/error-guard$` to `__mocks__/@react-native/js-polyfills/error-guard.js` (file exists).

- jest-native matchers loaded
  - `@testing-library/jest-native/extend-expect` is in `setupFilesAfterEnv` and imported in both `jest-setup.js` files.

## Why `renderWithProviders` is necessary

- Provides required context for tests: wraps components with `AuthProvider` (for `useAuth`) and `SafeAreaProvider` (for `useSafeAreaInsets`).
- Prevents provider errors and warnings by matching app runtime environment.
- Removes boilerplate in each test; standardizes setup across suites.
- Centralizes future provider/router mocks in one place, reducing maintenance.
- Improves stability and realism of screen tests.

## MSW infra (what and why)

- What: Mock Service Worker setup for tests
  - Handlers: endpoint definitions and mocked responses
  - Server: `msw/node` `setupServer(...handlers)`
  - Jest wiring: start (listen), reset (resetHandlers), stop (close)
  - Dev dep: `msw`
- Why: Deterministic integration/screen tests without real network
  - Simulates backend contracts (requests, params, responses)
  - Faster, CI-friendly; unhandled requests warn to catch gaps
  - Per-test overrides for error/edge cases
  - Use MSW for integration/screen; jest mocks for pure unit tests


