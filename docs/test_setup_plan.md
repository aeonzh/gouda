## Test Setup Plan

### Overview
- **Unit tests**: Logic in `packages/shared` (API adapters, helpers) with mocked Supabase/network.
- **Integration tests**: End-to-end-in-app flows using MSW; optional separate job against local Supabase for smoke.
- **Screen tests**: `@testing-library/react-native` for B2C screens (and later B2B) with `renderWithProviders` (AuthProvider, SafeArea, router mocks).

### Tooling
- **Runner**: Jest + ts-jest/babel-jest (already in repo)
- **UI**: `@testing-library/react-native`, `@testing-library/jest-native`
- **Network**: MSW (mock PostgREST and RPC); or jest mocks for `@supabase/supabase-js`
- **RN/Expo mocks**: error-guard (added), NativeAnimatedHelper (guarded), plus mocks for `react-native-reanimated`, `@react-native-async-storage/async-storage`, `expo-constants` as needed
- **Optional live**: Supabase CLI for local backend smoke tests

### Structure
- Test file locations
  - `packages/shared/**/__tests__/*.test.ts`
  - `apps/b2c/**/__tests__/*.test.tsx`
  - `apps/b2b/**/__tests__/*.test.tsx` (later)
- Shared utilities (suggested paths)
  - `apps/b2c/testing/renderWithProviders.tsx`
  - `apps/b2c/testing/msw/server.ts` and `apps/b2c/testing/msw/handlers/*.ts`
  - `apps/b2c/testing/supabase.mock.ts`

### Scripts
- Root
  - `pnpm -w test` – run all tests
  - `pnpm -w test:coverage` – run with coverage
  - `pnpm -w test:b2c` – filter B2C
  - `pnpm -w test:shared` – filter shared

### Utilities
```tsx
// apps/b2c/testing/renderWithProviders.tsx
import React from 'react';
import { render } from '@testing-library/react-native';
import { AuthProvider } from 'packages/shared/components';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export function renderWithProviders(ui: React.ReactElement, options?: any) {
  return render(
    <SafeAreaProvider>
      <AuthProvider>{ui}</AuthProvider>
    </SafeAreaProvider>,
    options
  );
}
```

### Tasks and subtasks (dependency-ordered)

- 1. Core config and scripts (deps: —)
  - [x] 1.1 Add root scripts: `test`, `test:ci`, `test:coverage`, `test:b2c`, `test:shared` (deps: —)
    - What: Add scripts in root `package.json` to run tests across workspaces, enable coverage, and target specific packages.
    - Why: Provides a standard entry point for local/CI runs and faster scoped execution.
  - [x] 1.2 Ensure Jest configs transform `expo|@expo|react-native` and map error-guard mock in `apps/b2c` and `packages/shared` (deps: —)
    - What: Use `preset: 'jest-expo'`, extend `transformIgnorePatterns` to include Expo/RN libs, map `@react-native/js-polyfills/error-guard` to root mock.
    - Why: Prevents ESM/transform errors and satisfies RN's error-guard requirement under Jest.
  - [x] 1.3 Add `@testing-library/jest-native/extend-expect` to setup files (deps: 1.2)
    - What: Include matcher setup in `setupFilesAfterEnv` and import in `jest-setup.js`.
    - Why: Enables expressive RN assertions (toBeOnTheScreen, toHaveTextContent, etc.).

- 2. Testing utilities (deps: 1)
  - [x] 2.1 Create `apps/b2c/testing/renderWithProviders.tsx` (AuthProvider, SafeArea, router mock) (deps: 1.2)
    - What: Export a helper that wraps UI with `AuthProvider` and `SafeAreaProvider` for tests.
    - Why: Removes per-test boilerplate and prevents provider-context errors.
  - [x] 2.2 MSW infra: `testing/msw/server.ts`, `testing/msw/handlers/` for `products`, `orders`, `organisations` (deps: 1.1)
    - What: Add `msw` devDep, define `setupServer(...handlers)`, wire lifecycle in `jest-setup.js`.
    - Why: Deterministic integration/screen tests without live backend; validates request/response contracts.
  - [x] 2.3 `testing/supabase.mock.ts` to jest-mock `@supabase/supabase-js` for unit tests (deps: 1.2)
    - What: Provide a reusable mocked Supabase client and module mock utility.
    - Why: Fast, isolated unit tests for shared API logic without MSW.
  - [x] 2.4 Add lightweight mocks for `expo-constants`, `@react-native-async-storage/async-storage`, `react-native-reanimated` (deps: 1.2)
    - What: Add Jest module mocks (or setup) to neutralize native bindings and provide sane defaults.
    - Why: Prevents runtime errors in Jest env for native modules used by UI/components.

- 3. Unit tests – shared APIs (deps: 2)
  - [x] 3.1 `products.ts`: `getProducts` status filtering; `getProductById` happy/error (deps: 2.3 or 2.2)
    - What: Tests for query param shaping, status filter behavior, and error surfaces.
    - Why: Guards product listing correctness and error handling.
  - [x] 3.2 `orders.ts`: `getCartItems` product alias mapping; `createOrderFromCart` payload fields and error surfacing (deps: 2.3)
    - What: Assert `product:products` alias mapping to `product`, and payload uses `price_at_time_of_order`.
    - Why: Prevents regressions that caused "Unknown product" and insert failures.
  - [x] 3.3 `organisations.ts`: `getAuthorizedBusinesses` scoping (deps: 2.3)
    - What: Validate filtering by user id and expected shape for vendors list.
    - Why: Ensures correct vendor visibility per user.
  - [x] 3.4 `profiles.ts`: `getBusinessIdForUser` multi-membership handling (deps: 2.3)
    - What: Cover `.limit(1).single()` path and multiple memberships.
    - Why: Avoids failure when users belong to multiple businesses.

- 4. Integration tests – app flows with MSW (deps: 2)
  - [x] 4.1 Cart flow: add/update/remove → `getCartItems` reflects state (deps: 2.2)
    - What: Handlers for cart endpoints; simulate add/update/delete; assert UI reflects server state.
    - Why: Validates end-to-end cart behavior without a live backend.
  - [ ] 4.2 Order creation: cart → `createOrderFromCart` → `getCustomerOrderHistory` (deps: 2.2)
  - [x] 4.2 Order creation: cart → `createOrderFromCart` → `getCustomerOrderHistory` (deps: 2.2)
    - What: Mock order creation then history fetch; assert new order appears.
    - Why: Ensures critical purchase flow works.
  - [ ] 4.3 Storefront visibility: only `published` products (deps: 2.2)
  - [x] 4.3 Storefront visibility: only `published` products (deps: 2.2)
    - What: Handlers return mixed statuses; UI must filter to `published`.
    - Why: Prevents draft/rejected products from appearing.

- 5. Screen tests – B2C (deps: 2)
  - [x] 5.1 Home `(tabs)/index.tsx`: renders authorized vendors; search filter; navigates to storefront (deps: 2.1, 2.2)
    - What: Render with providers; MSW returns vendors; test search and navigation intent.
    - Why: Validates core discovery UX.
  - [ ] 5.2 Storefront `/storefront/[id].tsx`: lists categories/products; only `published`; navigates to details (deps: 2.1, 2.2)
  - [x] 5.2 Storefront `/storefront/[id].tsx`: lists categories/products; only `published`; navigates to details (deps: 2.1, 2.2)
    - What: Mock categories/products; assert filtering and navigation.
    - Why: Protects storefront UX from regressions.
  - [ ] 5.3 Cart `/cart.tsx`: add/remove/quantity updates; submit button disabled during submit; navigates to confirmation (deps: 2.1, 2.2)
  - [x] 5.3 Cart `/cart.tsx`: add/remove/quantity updates; submit button disabled during submit; navigates to confirmation (deps: 2.1, 2.2)
    - What: Simulate cart item mutations and order submission; assert loading state and navigation.
    - Why: Ensures purchase action feedback and correctness.
  - [ ] 5.4 Orders tab `(tabs)/orders.tsx`: loads user orders; empty/error states (deps: 2.1, 2.2)
  - [x] 5.4 Orders tab `(tabs)/orders.tsx`: loads user orders; empty/error states (deps: 2.1, 2.2)
    - What: Handlers for orders list; cover non-empty, empty, and error.
    - Why: Robustness of order history UX.
  - [ ] 5.5 Auth screens: login/signup happy-path + validation errors (deps: 2.1, 2.2)
  - [x] 5.5 Auth screens: login/signup happy-path + validation errors (deps: 2.1, 2.2)
    - What: Mock auth endpoints; test success and form validation errors.
    - Why: Prevents auth UX regressions.

- 6. Optional live-integration (Supabase local) (deps: 1)
  - [x] 6.1 CI job: `supabase start` + `supabase db reset` + seed; run Node-based smoke suite (deps: 7.1)
    - What: Add CI job to spin up Supabase containers, apply migrations/seed, run a lightweight suite.
    - Why: Catches schema/policy mismatches MSW/unit might miss.
  - [ ] 6.2 Smoke: list products, create cart item, create order; assert 2xx + shapes (deps: 6.1)
  - [x] 6.2 Smoke: list products, create cart item, create order; assert 2xx + shapes (deps: 6.1)
    - What: Implement basic API calls and assertions against local PostgREST.
    - Why: Verifies end-to-end plumbing with real DB/auth.

- 7. Coverage and CI (deps: 3,4,5)
  - [x] 7.1 GitHub Actions workflow with pnpm caching; jobs: unit+screen (MSW) and optional live (deps: 1.1)
    - What: Add workflow running `pnpm -w test` and optional live job; cache pnpm store and node_modules.
    - Why: Fast, reliable CI feedback and reproducible builds.
  - [ ] 7.2 Coverage thresholds: shared 80% lines, apps 60% initially; upload artifacts (deps: 7.1)
  - [x] 7.2 Coverage thresholds: shared 80% lines, apps 60% initially; upload artifacts (deps: 7.1)
    - What: Configure Jest coverage; fail below thresholds; upload HTML reports.
    - Why: Maintains baseline quality while allowing iterative growth.

- 8. Documentation and examples (deps: 3–5)
  - [ ] 8.1 Add `docs/testing.md` with how-to, utilities, patterns (deps: 2)
  - [x] 8.1 Add `docs/testing.md` with how-to, utilities, patterns (deps: 2)
    - What: Document commands, when to use MSW vs jest mocks, render helpers, common pitfalls.
    - Why: Onboarding and consistency across contributors.
  - [ ] 8.2 Add one sample test per layer as templates (deps: 3,4,5)
  - [x] 8.2 Add one sample test per layer as templates (deps: 3,4,5)
    - What: Provide minimal examples for unit (shared), integration (MSW), and screen (RTL) tests.
    - Why: Accelerates adoption and standardizes style.

### Notes
- Command targets:
  - Root: `pnpm -w test`, `pnpm -w test:coverage`
  - B2C: `pnpm --filter @gouda/b2c test`
  - Shared: `pnpm --filter @gouda/shared test`
- Open scope question: Start screen tests with B2C only and add B2B later, or include B2B now?


