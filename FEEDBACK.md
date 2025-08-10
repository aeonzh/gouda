# B2C App Review Feedback

Scope: Based on `tasks/b2c_app_review_plan.md`. Organized per task with findings, risks, and recommendations. Sources include `apps/b2c`, `packages/shared/api`, `packages/shared/components`, and testing configs/utilities.

---

## 1. Repository scan and baseline
- Findings
  - App structure aligns with Expo Router conventions: `apps/b2c/app` with `(auth)`, `(tabs)`, `products/[id]`, `storefront/[id]`, `orders`, `profile/*`.
  - Shared logic centralized under `packages/shared` with `api` and `components`.
  - Supabase client provided via lazy `getSupabase()` and a `supabase` proxy.
- Risks/Issues
  - Numerous verbose console logs in production paths (auth/layout, cart, product details) may leak identifiers and increase noise.
  - Address flows in `apps/b2c/app/profile/addresses*.tsx` reference API functions that do not exist in `packages/shared/api/profiles.ts` (missing `Address` types + `getAddresses`, `addAddress`, `updateAddress`, `deleteAddress`).
- Recommendations
  - Gate debug logs behind `__DEV__` or remove for production builds.
  - Implement addresses API in shared package or re-scope feature until API is ready.

## 2. Navigation and auth correctness
- Files reviewed: `apps/b2c/app/_layout.tsx`, `(tabs)/_layout.tsx`
- Findings
  - `_layout.tsx` prevents auto-hide splash until session resolved; hides after initial `getSession()` → ok.
  - Redirection allow-list includes `(tabs)`, `storefront`, `products/[id]`, `orders`, `profile`, `cart`, `order-confirmation` for authenticated users.
  - Unauthenticated users are redirected to `(auth)/login`.
- Risks/Issues
  - Allow-list relies on `segments` indices (e.g., `segments[1] === '[id]'`) which can be brittle if route structure changes.
  - Missing explicit `<Stack.Screen name='products' />` is fine with Expo Router auto-registration, but default `headerShown: false` at stack-level requires per-screen overrides (already present in product details). Keep consistent.
- Recommendations
  - Extract route checks into small helpers for maintainability and unit testability.
  - Add basic screen tests covering redirects for protected routes.

## 3. Storefront product listing integrity
- Files reviewed: `apps/b2c/app/storefront/[id].tsx`, `packages/shared/api/products.ts`
- Findings
  - `getProducts` called with `status: 'published'` and `business_id: storeId`.
  - `getCategories` guards missing `business_id` and returns `[]`.
  - Category list injects `All` sentinel with `id: null`; `Category.id` type explicitly allows `null`.
- Risks/Issues
  - `storeId` from `useLocalSearchParams()` is cast to `string` without validation; could be array/undefined.
  - `getAuthorizedBusinesses(session.user.id)` used for store name; for unauthorized deep links, name remains default. RLS should still restrict product/category reads, but UX message may be misleading.
- Recommendations
  - Validate `storeId` type and handle array/invalid input.
  - If org not found in authorized list, show a clear “unauthorized store” message.
  - Debounce search input; consider memoizing filtered results for long lists.

## 4. Cart data shape and UX consistency
- Files reviewed: `apps/b2c/app/cart.tsx`, `packages/shared/api/orders.ts`
- Findings
  - Mapping for `product: products!left(...)` correctly handles `null | Product | Product[]`.
  - After quantity updates/removals, UI refreshes from server via `fetchCartItems()`.
- Risks/Issues
  - `paramBusinessId` is trusted if present; no check against authorized businesses before upsert cart.
  - Multiple member queries in component; duplication of business resolution logic.
- Recommendations
  - Validate `paramBusinessId` by checking membership via shared function or rely on server RLS and adjust UX for denials.
  - Extract “resolve businessId for user” into a shared helper (e.g., prefer route param if authorized else fallback) to reduce duplication.

## 5. Order creation and history
- Files reviewed: `(tabs)/orders.tsx`, `orders/[id].tsx`, `packages/shared/api/orders.ts`
- Findings
  - `createOrderFromCart` computes total from cart items, inserts order and `order_items`, clears cart.
  - History sorted by `created_at`; details map `price_at_time_of_order` → `price_at_order` for UI.
- Risks/Issues
  - No retry/rollback on partial failures beyond basic logging (e.g., order created but order_items insert fails). RLS should ensure authorization, but transactional semantics are not guaranteed here.
- Recommendations
  - Consider moving multi-step order creation into a DB RPC for atomicity.
  - Improve UI error messages for partial failures; optionally add idempotency keys.

## 6. Profile and addresses routes
- Files reviewed: `profile/_layout.tsx`, `profile/index.tsx`, `profile/edit.tsx`, `profile/addresses*.tsx`
- Findings
  - Profile view/edit flows are sound; use `getProfile`/`updateProfile`.
  - Addresses screens are present but rely on missing shared API.
- Risks/Issues
  - Compilation/runtime errors likely due to missing exports for addresses in `packages/shared/api/profiles.ts`.
- Recommendations
  - Implement addresses CRUD in shared API (types + functions) or remove routes until ready.

## 7. Types, schema, and RLS alignment
- Files reviewed: `packages/shared/api/products.ts`, `orders.ts`, `organisations.ts`, `profiles.ts`
- Findings
  - Products API mixes `getSupabase()` usage with direct `supabase` references.
- Risks/Issues
  - Critical: `products.ts` references `supabase` without importing it in several functions (`adjustInventoryLevel`, `createCategory`, `deleteCategory`, `getInventoryLevels`, `updateCategory`, `updateProduct`). This will fail at runtime/TS.
  - `createCategory` may pass `id: null` if callers reuse `Category` type used for UI sentinel; DB expects `id` default or not null.
- Recommendations
  - Import `supabase` from `./supabase` where used, or consistently use `getSupabase()` to avoid eager init.
  - Separate `Category` used for DB (no `id: null`) from UI sentinel type. Do not send `id` in inserts to allow DB defaults.

## 8. Performance, errors, and UX polish
- Findings
  - Repetitive console logs with large payloads (cart/items, products) across screens.
- Risks/Issues
  - Excessive logging can impact performance and leak data in production.
- Recommendations
  - Wrap logs with `if (__DEV__)`.
  - Add simple skeleton loaders to storefront and orders list.

## 9. Testing strategy expansion (B2C + shared)
- Files reviewed: `apps/b2c/jest.config.js`, `apps/b2c/testing/*`, `packages/shared/jest.config.js`, `packages/shared/jest-setup.js`
- Findings
  - Monorepo Jest configs transform Expo/RN packages; error-guard mock mapped.
  - `renderWithProviders` provides `AuthProvider` + `SafeAreaProvider`.
- Risks/Issues
  - `apps/b2c/jest.config.js` has `testMatch: ['<rootDir>/simple.test.ts']` which likely excludes real tests under `__tests__` or other paths.
  - Coverage thresholds in b2c config use `0.6` which equals 0.6% (Jest expects integer percentages). Probably unintended.
- Recommendations
  - Update `testMatch` to include intended test patterns (e.g., `**/__tests__/**/*.(test|spec).(ts|tsx)`), or remove to rely on defaults.
  - Set coverage thresholds to integer percentages (e.g., 50) or remove if not needed.

## 10. Documentation and Memory Bank updates
- Findings
  - Plan captured in `tasks/b2c_app_review_plan.md`.
  - Memory Bank current and comprehensive.
- Recommendations
  - After addressing above items, update `docs/memory-bank/context.md` and append decisions to `JOURNAL.md`.

---

## High-priority fixes (actionable)
1) Fix `packages/shared/api/products.ts` to import/use `supabase` consistently, or convert all calls to `getSupabase()`.
2) Implement addresses API in `packages/shared/api/profiles.ts` (types + CRUD) or gate routes until ready.
3) Add “published-only” guard in `apps/b2c/app/products/[id].tsx` to prevent adding unpublished products to cart.
4) Harden param validation for `storeId` and `productId` from `useLocalSearchParams()`.
5) Reduce production logs and gate with `__DEV__`.
6) Adjust `apps/b2c/jest.config.js` `testMatch` and coverage thresholds to intended values.

## Nice-to-haves
- Extract business resolution to a shared helper.
- Consider DB RPC for atomic order creation.
- Add skeletons and debounce search.

---

## Concept alignment audit

### Feature correctness
- Coverage
  - Storefront filters published products and respects business scoping; product details, cart flows, and orders history operate end-to-end.
- Gaps
  - Missing validation for `storeId`/`productId` route params; addresses feature references non-existent APIs.
- Actions
  - Validate and guard params from `useLocalSearchParams()`; show unauthorized/invalid messages.
  - Implement addresses API or temporarily remove addresses routes.

### Security best practices
- Coverage
  - Data access relies on Supabase RLS; no direct secrets in repo; auth redirects present.
- Gaps
  - Excessive console logs may leak identifiers; lack of authorization checks for `paramBusinessId` (rely on RLS but UX should handle denials); need input validation pre-DB writes.
- Actions
  - Gate logs with `__DEV__`; scrub sensitive payloads.
  - Validate `paramBusinessId` against membership (or handle RLS denials with clear errors).
  - Ensure `profiles.ts`/`orders.ts` sanitize inputs; avoid passing UI sentinel values (e.g., `id: null`).

### Code maintainability
- Coverage
  - Auth context centralization; shared APIs; Expo Router structure.
- Gaps
  - Mixed use of `getSupabase()` and `supabase` in `products.ts`; duplicated business resolution logic; UI sentinel shares DB type.
- Actions
  - Standardize Supabase access (prefer `getSupabase()` or import `supabase` consistently) and fix missing imports in `products.ts`.
  - Extract business-id resolution helper to shared module.
  - Separate UI `Category` sentinel type from DB `Category` insert/update types.

### Performance
- Coverage
  - FlatList used throughout; basic memoization via `useCallback` in cart.
- Gaps
  - Many inline arrow functions and large logs; no search debounce; repeated queries in cart flows; image loading not optimized.
- Actions
  - Wrap logs with `__DEV__`; debounce storefront search; memoize renderItem/handlers; consider `getItemLayout` where possible.
  - Evaluate image caching strategy (e.g., `Image` caching or libraries suited for Expo).

### React Native best practices
- Coverage
  - `SafeAreaProvider` at root; proper loading/error/empty states; Tailwind/NativeWind classes.
- Gaps
  - Missing cleanup for auth subscription in `AuthProvider`; inline handlers everywhere.
- Actions
  - Add cleanup for `supabase.auth.onAuthStateChange` in `AuthProvider`.
  - Prefer stable callbacks and move complex logic to hooks/services.

### React Native design patterns
- Coverage
  - Context for auth; screens as containers.
- Gaps
  - Business logic embedded in screens; no dedicated hooks for data fetching; inconsistent route guard abstraction.
- Actions
  - Introduce feature hooks (e.g., `useStorefront`, `useCart`), separating data from view.
  - Extract route guard helpers for `_layout.tsx`.

### Unit tests for business logic
- Coverage
  - Shared Jest setup stable; MSW infra available.
- Gaps
  - Limited tests by config (`testMatch`); missing unit tests for `orders.ts` mapping, `products.ts` filters, `organisations.ts` membership logic.
- Actions
  - Fix `apps/b2c/jest.config.js` `testMatch` and integer coverage thresholds.
  - Add unit tests: product status filter, category guards, cart mapping (array/object/null), order mapping `price_at_time_of_order` → `price_at_order`.

### Integration tests for native modules
- Coverage
  - Providers mocked in tests; error-guard mapped; `react-native-safe-area-context` mocked.
- Gaps
  - No explicit integration tests that exercise real native module boundaries (within Jest constraints) or navigation back-stack behavior.
- Actions
  - Add tests that render screens with `renderWithProviders` verifying SafeArea padding behavior and navigation transitions via Expo Router.
  - Verify `getSupabase()` reads `expo-constants` extras (mock values in test) and lazy initialization occurs once.
  - Consider adding Detox/E2E later for true native module integration if needed.

### Memory leak detection
- Coverage
  - `_layout.tsx` unsubscribes auth listener; some effects are simple fetches.
- Gaps
  - `AuthProvider` lacks cleanup for auth subscription; async effects may set state after unmount.
- Actions
  - Add cleanup in `AuthProvider` to unsubscribe on unmount.
  - Use an `isMounted` ref or AbortController pattern in async effects to avoid setting state after unmount.
  - During dev, profile with Flipper/Leaks; add test utilities to ensure subscriptions are cleaned (spy on unsubscribe called).
