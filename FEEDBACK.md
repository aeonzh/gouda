# B2C App Review Feedback

Scope: Based on `tasks/b2c_app_review_plan.md`. Organized per task with findings, risks, and recommendations. Sources include `apps/b2c`, `packages/shared/api`, `packages/shared/components`, and testing configs/utilities.

---

## 1. Repository scan and baseline

- Findings
  - App structure aligns with Expo Router conventions: `apps/b2c/app` with `(auth)`, `(tabs)`, `products/[id]`, `storefront/[id]`, `orders`, `profile/*`.
  - Shared logic centralized under `packages/shared` with `api` and `components`.
  - Supabase client provided via lazy getter `getSupabase()` and a `supabase` proxy.
- Risks/Issues
  - Verbose console logs in production paths (auth/layout, cart, product details) may leak identifiers and hurt performance.
  - Addresses flows under `profile/addresses*.tsx` reference API functions not present in `packages/shared/api/profiles.ts` (missing `Address` types + CRUD).
- Recommendations
  - Feature correctness & security: Implement addresses API in shared package or temporarily remove addresses routes until ready.
  - Performance & RN best practices: Gate debug logs behind `__DEV__` and scrub sensitive data.
  - Maintainability: Keep `getSupabase()` as the single access path or consistently import `supabase` across APIs (see §7).

## 2. Navigation and auth correctness

- Files: `apps/b2c/app/_layout.tsx`, `(tabs)/_layout.tsx`
- Findings
  - Splash gated until initial `getSession()` resolves; redirects based on allow-list for authenticated routes; unauthenticated users sent to `(auth)/login`.
- Risks/Issues
  - Allow-list logic depends on `segments` indices (e.g., `segments[1] === '[id]'`), brittle on route changes.
  - Missing abstraction for route guards; hard to unit test.
- Recommendations
  - Maintainability & design patterns: Extract route checks into helpers (e.g., `isAuthRoute`, `isAllowedAuthedRoute`) and unit test them.
  - Feature correctness: Add screen tests for redirect rules (auth vs unauth) using `renderWithProviders` and Expo Router mocks.
  - Memory leaks: Ensure any listeners added in layout (none currently) are cleaned up; leave as watch item.

## 3. Storefront product listing integrity

- Files: `apps/b2c/app/storefront/[id].tsx`, `packages/shared/api/products.ts`
- Findings
  - `getProducts` called with `status: 'published'` and `business_id: storeId`; `getCategories` guards missing `business_id` and returns `[]`.
  - UI sentinel category "All" uses `id: null` and is handled.
- Risks/Issues
  - `storeId` from `useLocalSearchParams()` cast to `string` without validation (could be array/undefined).
  - Unauthorized deep links show default store title; UX may mislead; RLS will still protect data.
- Recommendations
  - Feature correctness & security: Validate `storeId` type; if user not authorized for store, show an “unauthorized storefront” message and block fetch.
  - Performance & RN best practices: Debounce search; memoize `renderItem` and handlers; consider `getItemLayout` for large lists; gate logs with `__DEV__`.
  - Testing: Unit-test `getProducts` filters (status/category/search) and storefront UI for empty/unauthorized cases.

## 4. Cart data shape and UX consistency

- Files: `apps/b2c/app/cart.tsx`, `packages/shared/api/orders.ts`
- Findings
  - Mapping for `product: products!left(...)` handles `null | Product | Product[]`; UI refreshes from server post-mutations.
- Risks/Issues
  - `paramBusinessId` is trusted; no client-side membership check. Duplicate membership queries in component.
- Recommendations
  - Security & UX: Validate `paramBusinessId` against membership (via shared helper) or rely on RLS and surface clear error to user when denied.
  - Maintainability: Extract business-id resolution helper (prefer route param if authorized else fallback to first membership).
  - Performance: Memoize callbacks/renderers; reduce repeated network calls; gate logs with `__DEV__`.
  - Testing: Unit-test cart item mapping; screen-test quantity update/removal and error paths.

## 5. Order creation and history

- Files: `(tabs)/orders.tsx`, `orders/[id].tsx`, `packages/shared/api/orders.ts`
- Findings
  - Multi-step order creation: compute total → insert order → insert `order_items` → clear cart; history sorted by `created_at`; mapping `price_at_time_of_order` → `price_at_order` for UI.
- Risks/Issues
  - Not atomic; partial failure could leave inconsistent state.
- Recommendations
  - Security & correctness: Move order creation to a DB RPC (transaction) for atomicity and rely on RLS for auth.
  - UX: Improve error surfaces for partial failure; consider idempotency keys for re-tries.
  - Testing: Integration-style tests to simulate success and failure of `order_items` insertion; verify cart clearing behavior.

## 6. Profile and addresses routes

- Files: `profile/_layout.tsx`, `profile/index.tsx`, `profile/edit.tsx`, `profile/addresses*.tsx`
- Findings
  - Profile view/edit via shared API is sound; addresses screens implemented but API missing.
- Risks/Issues
  - Likely compile/runtime errors due to missing addresses API.
- Recommendations
  - Feature correctness: Implement `Address` types and CRUD in `packages/shared/api/profiles.ts` or remove routes until available.
  - RN best practices & memory leaks: Ensure async effects handle unmount (set an `isMounted` ref or AbortController) to avoid state updates after unmount.

## 7. Types, schema, and RLS alignment

- Files: `packages/shared/api/{products,orders,organisations,profiles}.ts`
- Findings
  - `products.ts` mixes `getSupabase()` and implicit `supabase` usage; several functions call `supabase` without import.
- Risks/Issues
  - Runtime/TS failures from missing import; potential to pass UI sentinel `id: null` into DB writes.
- Recommendations
  - Maintainability: Standardize Supabase access (prefer `getSupabase()` or import `supabase` consistently) and fix missing imports in `products.ts`.
  - Correctness & security: Separate UI Category sentinel type from DB insert/update types; avoid sending `id` on inserts so DB defaults set the primary key.
  - Testing: Add unit tests for product/category CRUD to assert correct column usage and error handling.

## 8. Performance, errors, UX polish, and memory leaks

- Findings
  - FlatList usage is appropriate; many large console logs and inline handlers.
- Risks/Issues
  - Logging overhead; potential state updates after unmount in async effects; image loading not optimized.
- Recommendations
  - Performance: Gate logs with `__DEV__`; debounce search; memoize handlers; consider `getItemLayout` and image caching strategy.
  - Memory leaks: Add cleanup for auth subscriptions and async effects (see §10 cross-cutting); prefer AbortController where supported.
  - UX: Add skeleton loaders for storefront and orders list; centralize error toasts/snackbars.

## 9. Testing strategy expansion (B2C + shared)

- Files: `apps/b2c/jest.config.js`, `apps/b2c/testing/*`, `packages/shared/jest.config.js`, `packages/shared/jest-setup.js`
- Findings
  - Monorepo Jest configs handle Expo/RN module transforms; providers mocked; MSW handlers present.
- Risks/Issues
  - `apps/b2c/jest.config.js` `testMatch` overly narrow (`simple.test.ts`); coverage thresholds use decimals (interpreted as <1%).
- Recommendations
  - Unit tests for business logic: Add tests for `orders.ts` mapping, `products.ts` filters, `organisations.ts` membership logic.
  - Integration tests for native modules: Render screens with `renderWithProviders` to cover SafeArea, Expo Router navigation, and lazy Supabase init via `expo-constants` extras (mocked).
  - Config: Update `testMatch` to include `**/__tests__/**/*.(test|spec).(ts|tsx)` and set integer coverage thresholds (e.g., 50).
  - Memory leak detection: Add tests that assert `onAuthStateChange` unsubscribe is called; use timers/cleanup assertions to catch state updates after unmount.

## 10. Documentation and Memory Bank updates

- Findings
  - Plan captured in `tasks/b2c_app_review_plan.md`; Memory Bank current.
- Recommendations
  - After implementing fixes, update `docs/memory-bank/context.md` and append decisions to `JOURNAL.md`; consider adding a `tasks.md` recipe for address API CRUD and order RPC pattern.

---

## 11. Product details visibility and stock enforcement

- Files: `apps/b2c/app/products/[id].tsx`, `packages/shared/api/products.ts`
- Findings
  - PDP does not explicitly validate `productId` type and vendor authorization before fetching/acting.
  - Visibility rules for unpublished products are enforced in storefront, but PDP may still allow direct access via deep links.
  - No explicit client-side stock enforcement on quantity controls beyond server-side checks.
- Risks/Issues
  - Invalid/array `productId` values can cause runtime errors or unintended queries.
  - Users may see or add unpublished products via deep links if PDP does not guard appropriately.
  - Over-adding beyond `stock_quantity` degrades UX and causes server-side failures.
- Recommendations
  - Validate `productId` (string UUID) and reject array/undefined; render "Product not found" for invalid IDs.
  - Fetch product with business scoping; if product is not `published` or user is unauthorized, block actions and show a clear state.
  - Enforce `stock_quantity` limits in `QuantitySelector` (disable increment at max); re-validate on Add to Cart/Order create.
  - Tests: unit for product fetch/guards; screen tests for invalid/unpublished/unauthorized PDP states and stock limit behavior.

## 12. Single-vendor cart policy and context persistence

- Files: `apps/b2c/app/cart.tsx`, `apps/b2c/app/storefront/[id].tsx`, `apps/b2c/app/products/[id].tsx`, `packages/shared/api/orders.ts`
- Findings
  - The closed-discovery single-vendor model requires explicit UX when adding items from a different vendor.
  - Persistence of the active vendor context across app sessions is unspecified.
- Risks/Issues
  - Cross-vendor cart mixes confuse users and violate the single-vendor constraint.
  - On relaunch, stale context can descope cart or cause unexpected clearing.
- Recommendations
  - When attempting to add from a vendor different than the current cart's, prompt to clear cart and confirm; otherwise block.
  - Persist last active vendor in a lightweight store; on session restore, verify membership and reconcile or clear.
  - Tests: adding across vendors (list, PDP, deep link), persistence across relaunch, and membership-change reconciliation.

## 13. Order cancellation (pending)

- Files: `apps/b2c/app/(tabs)/orders.tsx`, `apps/b2c/app/orders/[id].tsx`, `packages/shared/api/orders.ts` (+ RPC if adopted)
- Findings
  - Customers currently cannot cancel a `pending` order from the app.
- Risks/Issues
  - Lack of cancellation increases support load; accidental orders cannot be reversed by users.
- Recommendations
  - Add a "Cancel Order" action for `pending` status only; confirm via dialog; update status to `cancelled`.
  - Prefer an RPC to ensure atomic status update and any related compensations; rely on RLS for authorization.
  - Tests: integration (RPC happy/failure paths) and screen tests for list/detail actions and state updates.

---

## High-priority fixes (actionable)

1. Fix `packages/shared/api/products.ts` to consistently access Supabase (import `supabase` or use `getSupabase()` everywhere) and add any missing imports.
2. Implement addresses API in `packages/shared/api/profiles.ts` (types + CRUD) or gate/remove addresses routes until ready.
3. Add validation for `storeId`/`productId` route params and show unauthorized/invalid messages; gate all production logs with `__DEV__`.
4. Update `apps/b2c/jest.config.js` `testMatch` and set integer coverage thresholds; add unit tests for products/orders/organisations and screen tests for auth redirects, storefront filters, cart, orders.
5. Consider moving order creation to a DB RPC for atomicity; add error handling for partial failures and idempotency where relevant.
6. Extract business-id resolution helper and reuse in cart/order flows to reduce duplication; memoize screen handlers to improve performance.
7. Add cleanup for auth subscriptions and protect async effects from updating state after unmount (use `isMounted`/AbortController patterns).
8. Enforce single-vendor cart policy: when adding from a different vendor, prompt to clear existing cart or block; cover list, PDP, and deep-link paths with tests.
9. Product details visibility rules: validate `productId`; hide or disable actions for unpublished/unauthorized products; add tests for invalid/unpublished/unauthorized cases.
10. Stock and quantity validation: cap quantity by `stock_quantity`, disable increment at max, and re-validate on submit; add unit/screen tests.
11. Order cancellation (pending): allow customers to cancel orders while status is `pending`; update UI/API, rely on RLS; add tests.
12. Persist single-vendor context across app relaunch; reconcile on membership changes; ensure cart remains scoped and consistent.
