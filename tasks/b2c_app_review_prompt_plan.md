# B2C App Review Prompt Plan

This plan mirrors the Tasks and subtasks from `tasks/b2c_app_review_plan.md`. Each prompt is explicit and actionable, expanding all implicit requirements: feature correctness, security best practices, code maintainability, performance, React Native best practices, React Native design patterns, unit tests for business logic, integration tests for native modules, and memory leak detection.

---

### 1. Repository scan and baseline (Completed)

Objective:

- Establish a complete baseline of the B2C app’s routes, flows, shared API usage, and current runtime state; produce a prioritized issue list and journal entry.

Inputs:

- `apps/b2c/**`, `packages/shared/**`, `supabase/**`, `docs/memory-bank/*`, `JOURNAL.md`.

Preconditions:

- Tooling installed; able to run `pnpm b2c` and tests.

Steps:

1. Run the app locally: `pnpm b2c`. Capture all console errors/warnings (RN, Expo Router, network).
2. Inventory routes/screens and map to flows:
   - Identify unauth screens `(auth)` and authed screens `(tabs)`, `storefront/[id]`, `products/[id]`, `cart`, `orders/*`, `profile/*`.
   - Record navigation entry/exit conditions per screen (expected redirect behavior; when headers are shown/hidden).
3. Scan `packages/shared/api/*` and list all tables/columns referenced, joins/aliases used, and any assumptions (e.g., `status: 'published'`, aliasing `product:products`). Cross-check with DB schema in migrations (if present) or the Architecture/Tech docs.
4. Enumerate logging usage across screens/APIs. Flag logs printing PII/IDs or large payloads; propose gating with `__DEV__`.
5. Identify missing features/APIs wired from screens (e.g., address CRUD references). Confirm existence or mark as missing with file path expectations.
6. Maintainability/design: note duplication (businessId resolution logic), mixed Supabase access (`getSupabase` vs `supabase`), and type drift (UI sentinel vs DB types).
7. Security: list where RLS is relied upon, any client-side guards, and places where inputs require validation (UUIDs, params).
8. Performance: list heavy screens and large lists; presence of memoization, `getItemLayout`, image caching.
9. Memory leaks: list long-lived subscriptions (auth, navigation) and async effects without cancel guards.
10. Prioritize issues by severity/user impact; write a succinct entry to `JOURNAL.md` (what/why/how/why-it-works) and link the generated issue list.
11. Testing readiness: add a smoke test ensuring key screens and shared APIs import/render with providers without unresolved modules.
12. Supabase access policy: document and agree on a single access approach (lazy `getSupabase()` vs proxy) to be enforced in later steps.

Acceptance criteria:

- Route→flow map produced; API assumptions list completed; missing APIs identified; unified proposal for Supabase access documented; prioritized issue list created; smoke test in place; journal entry added.

Deliverables:

- Route/flow map, API assumption sheet, logging audit, issue list (with severity), smoke test file, `JOURNAL.md` entry.

Status:

- Baseline document created at `docs/b2c/baseline.md`.
- Smoke test added at `apps/b2c/__tests__/smoke.test.tsx`.
- Logging audit and Supabase access policy captured in baseline doc.
- Journal updated for this session.
- Prioritized issues documented at `docs/b2c/issues.md`.

---

### 2. Navigation and auth correctness (Completed)

Objective:

- Guarantee correct redirects for unauthenticated users and allow-list behavior for authenticated users; stabilize route guards and add tests.

Inputs:

- `apps/b2c/app/_layout.tsx`, `(tabs)/_layout.tsx`.

Preconditions:

- Baseline scan complete.

Steps:

1. Extract guard helpers into pure functions (e.g., `isAuthRoute(segments)`, `isAllowedAuthedRoute(segments)`), avoiding brittle index checks; prefer named segment checks.
2. In `_layout.tsx`, use helpers to replace inline logic. Ensure allow-list includes: `(tabs)`, `storefront/*`, `products/[id]`, `orders/*`, `profile/*`, `cart`, `order-confirmation`.
3. Verify product details is not shown as a tab: confirm placement outside `(tabs)` and proper `Stack.Screen` config.
4. Add screen tests (with `renderWithProviders` + router mocks) for:
   - Unauth user navigating to protected routes → redirected to `(auth)/login`.
   - Auth user in `(auth)` → redirected to `(tabs)`.
   - Auth user deep-links to `storefront`/`products/[id]`/`orders`/`profile`/`cart`/`order-confirmation` → allowed.
5. Security: validate that no protected route is reachable without session; ensure no sensitive data renders during transition.
6. Memory leaks: ensure any added subscriptions are unsubscribed on unmount (verify none are added here; if so, add cleanup).
7. Performance & RN best practices: keep effects minimal and idempotent; ensure helpers are unit-tested independently of UI to avoid brittle tests.

Acceptance criteria:

- Helper functions in place; layout uses helpers; tests cover redirect matrix and pass; no regressions in UX; helpers have unit tests.

Deliverables:

- Guard helpers, updated `_layout.tsx`, helper unit tests, screen tests and snapshots.

---

### 3. Storefront product listing integrity (Completed)

Objective:

- Ensure storefront lists only published products for a valid/authorized store, with robust search and category filters.

Inputs:

- `apps/b2c/app/storefront/[id].tsx`, `packages/shared/api/products.ts`.

Preconditions:

- Auth guard behavior validated.

Steps:

1. Validate `storeId` from `useLocalSearchParams()`:
   - If array/undefined/invalid UUID, show “Invalid store” state; block fetches.
2. Authorization UX:
   - Check the user’s authorized businesses via shared API; if `storeId` not in list, render “unauthorized storefront” message and block fetches. Do not leak data; rely on RLS as backstop.
3. Call `getProducts` with `{ business_id: storeId, status: 'published', category_id?, search_query?, page, limit }`.
4. Ensure `getCategories` receives a valid `business_id`; return early with `[]` otherwise.
5. Add debounced search (e.g., 250–300ms); memoize `renderItem`; consider `getItemLayout` for large lists; gate logs with `__DEV__`.
6. Unit tests:
   - `getProducts` filters (status/category/search, pagination range) and `getCategories` guard.
7. Screen tests:
   - Empty store, unauthorized store, search filtering, category filtering, nav to product details.
8. Design patterns: extract a `useStorefront` hook to encapsulate fetching, authorization, debounced search, and category logic, improving separation of concerns.

Acceptance criteria:

- Invalid/unauthorized `storeId` handled safely; published-only enforced; filters/search correct; tests pass; `useStorefront` adopted; no excessive logs.

Deliverables:

- Code updates (including `useStorefront`), tests, and performance notes.

Status:

- `useStorefront` hook added at `apps/b2c/app/storefront/useStorefront.ts` and storefront page refactored to use it.
- Storefront enforces published-only products, validates `storeId`, checks authorization, debounced search, and category filtering.
- Tests are green across suites.

---

### 4. Cart data shape and UX consistency (Completed)

Objective:

- Make cart item mapping robust, flows consistent, and UX states clear; reduce duplication and ensure security posture via RLS.

Inputs:

- `apps/b2c/app/cart.tsx`, `packages/shared/api/orders.ts`.

Preconditions:

- Storefront/product details working.

Steps:

1. Standardize `getCartItems` mapping for `product: products!left(...)`:
   - If array → first element or `undefined`; if object → cast; if `null` → `undefined`.
2. Centralize business-id resolution in a shared helper used by cart:
   - Prefer route param if user is authorized for it; else fallback to first membership; handle no-membership error with UX message.
3. Ensure add/update/remove flows call server and then refetch; do not mutate local state blindly.
4. Improve UX: loading/progress on “Create Order”, disabled state during mutations; human-readable errors; show totals update after refetch.
5. Security: rely on RLS for business constraints; show clear messages on denial.
6. Performance: memoize callbacks; avoid repeated membership queries; gate logs with `__DEV__`.
7. Tests:
   - Unit: mapping for `null|object|array`, update/remove edge cases.
   - Screen: quantity update, remove, error paths (not auth, not member, empty cart).
8. Correctness hardening: enforce `QuantitySelector` max <= `stock_quantity`; prevent negative or zero quantities unless removal; ensure currency formatting is consistent.
9. UX resilience: if `product` is missing, render a fallback label and disable quantity changes for that item; guide user to refresh.

Acceptance criteria:

- Mapping and UX robust; helper in place; tests green; quantity bounds enforced; missing-product fallback present.

Deliverables:

- Code updates, helper function, tests.

Status:

- Centralized business-id resolution via `resolveBusinessIdForUser` in `packages/shared/api/organisations.ts` and adopted in `apps/b2c/app/cart.tsx`.
- Kept server-truth workflow for add/update/remove (mutate, then refetch) in `cart.tsx`.
- Robust mapping for `product: products!left(...)` covered in shared tests; UI maps array/object/null safely.
- Memoized total price with `useMemo`; gated cart debug logs behind `__DEV__`.
- Tests green: shared unit tests for resolver; existing cart screen/integration cover render, total, increment, remove.

---

### 5. Order creation and history (Completed)

Objective:

- Ensure atomic order creation and correct history/detail rendering with proper field mapping and auth usage.

Inputs:

- `(tabs)/orders.tsx`, `orders/[id].tsx`, `packages/shared/api/orders.ts` (+ DB RPC if added).

Preconditions:

- Cart flow stable.

Steps:

1. Replace multi-step client flow with DB RPC (transaction):
   - Insert order; insert order_items; clear cart in a single transaction.
   - Expose via Supabase RPC; update shared API to call RPC.
2. Maintain UI mapping: map `price_at_time_of_order` → `price_at_order` for rendering.
3. History: use `supabase.auth.getUser()` and sort by `created_at` desc.
4. Security: remove redundant membership checks in client; rely on RLS; handle denials gracefully.
5. Tests:
   - Integration: success path; order_items failure → whole transaction fails; cart not cleared on failure.
   - Screen: order list renders; details page maps fields correctly; optional addresses safe to render.
6. Robustness: consider idempotency keys for order creation to avoid duplicates on retries; surface progress indicators and final success/failure states.
7. Performance: avoid redundant queries by returning created order and items from RPC when feasible; keep UI in sync via a single refetch.

Acceptance criteria:

- RPC-based atomic creation implemented; mapping correct; tests pass; idempotency considered; minimal redundant queries.

Deliverables:

- RPC SQL/function, API updates, tests.

Status:

- Shared API includes `createOrderFromCartAtomic(userId, businessId, idempotencyKey?)` calling `rpc('create_order_from_cart', ...)`.
- B2C `cart.tsx` uses RPC behind a feature flag with an idempotency key.
- Test infra mocks `supabase.rpc` and MSW adds handler for `/rest/v1/rpc/create_order_from_cart`.
- Integration test updated to assert RPC usage; suites pass locally.

---

### 6. Profile and addresses routes (Completed)

Objective:

- Stabilize profile and address features with shared API support or explicitly gate them off.

Inputs:

- `profile/*`, `packages/shared/api/profiles.ts`.

Preconditions:

- None

Steps:

1. Implement address types and CRUD in shared API:
   - `Address` interface; `getAddresses(userId)`, `addAddress(address)`, `updateAddress(id, data)`, `deleteAddress(id)`.
   - Ensure types match DB schema; nullable fields sent as `null` not `undefined`.
2. Update `profile/addresses*.tsx` to consume shared API; ensure loading/error/empty states render; add navigation success/failure feedback.
3. If deferring implementation, gate routes (hide entry points and show placeholder explaining unavailability).
4. Memory leaks: add cancel guards in async effects; cleanup auth subscriptions.
5. Tests: unit CRUD tests; screen tests for list/add/edit flows.

Acceptance criteria:

- No broken address screens; shared API implemented or routes gated; tests pass.

Deliverables:

- For now, routes gated with placeholders; entry point removed from `apps/b2c/app/(tabs)/profile.tsx`.
  - `apps/b2c/app/profile/addresses.tsx` now shows an “Addresses Unavailable” placeholder.
  - `apps/b2c/app/profile/addresses/add.tsx` and `.../edit.tsx` show placeholder screens and navigate back.
  - No backend or shared API added yet; to be implemented when feature is prioritized.

---

### 7. Types, schema, and RLS alignment

Objective:

- Align TypeScript models and API calls with DB schema and RLS assumptions; standardize Supabase usage.

Inputs:

- `packages/shared/api/{products,orders,organisations,profiles}.ts`, DB schema docs.

Preconditions:

- Baseline scan notes available.

Steps:

1. Standardize Supabase client access:
   - Choose one: import `supabase` proxy everywhere or call `getSupabase()` everywhere. Fix mixed usage in `products.ts` and add missing imports.
2. Split UI sentinel vs DB types where needed (e.g., `Category` vs `CategoryInsert/Update`). Avoid sending `id` on inserts so DB defaults apply.
3. Guard UUID inputs (no empty strings) before queries; early return on missing `business_id`.
4. Security/RLS: document where RLS is expected to enforce access; ensure helper SQL functions (if any) are used consistently.
5. Tests: unit tests for CRUD and filter logic; assert correct columns and error handling.
6. Pagination/filters: validate `page`/`limit` boundaries; enforce sane defaults; cover in tests.

Acceptance criteria:

- Consistent Supabase usage; accurate types; guards in place; tests pass; pagination defaults enforced.

Deliverables:

- API code updates, type definitions, tests.

---

### 8. Performance, errors, and UX polish

Objective:

- Improve perceived performance and error handling while reducing noise and ensuring clean lifecycles.

Inputs:

- Storefront, Orders list, shared components.

Preconditions:

- None

Steps:

1. Add skeleton loaders/placeholders to storefront and orders list.
2. Debounce search inputs; memoize list renderers; consider `FlashList` or `getItemLayout` for large lists.
3. Centralize error toasts/snackbars for API failures; avoid raw alerts for expected errors; ensure consistent messaging.
4. Gate all debug logs with `__DEV__` and scrub sensitive values.
5. Memory leaks: audit and add cleanup for subscriptions; use AbortController/"isMounted" guards in async effects.
6. Image performance: adopt a basic image caching strategy compatible with Expo; ensure proper `keyExtractor` and stable keys for lists.

Acceptance criteria:

- Smoother list rendering; fewer jank frames; consistent error UI; no production debug logs; no list key warnings.

Deliverables:

- UI updates and a brief perf note (before/after if available).

---

### 9. Testing strategy expansion (B2C + shared)

Objective:

- Ensure comprehensive unit and screen coverage, correct Jest configuration, and stable CI runs.

Inputs:

- `apps/b2c/jest.config.js`, `apps/b2c/testing/*`, `packages/shared/jest.config.js`, `packages/shared/jest-setup.js`.

Preconditions:

- None

Steps:

1. Update `apps/b2c/jest.config.js`:
   - `testMatch`: include `**/__tests__/**/*.(test|spec).(ts|tsx)` and `**/*.test.(ts|tsx)`.
   - Coverage thresholds: use integers (e.g., 50+) or remove if not enforced.
2. Add unit tests for `products`, `orders`, `organisations`, `profiles` covering happy and edge paths.
3. Add screen tests for: auth redirects, storefront list/filter, cart interactions, orders list/details, profile navigation.
4. Integration coverage: verify RN providers (SafeArea), Expo Router navigation, and lazy Supabase initialization via mocked `expo-constants` extras.
5. Memory leak detection: tests asserting auth unsubscribe is invoked and that state is not set after unmount in async flows.
6. Ensure monorepo scripts run in CI: `pnpm -r --if-present test` and `CI=1 ... --runInBand`.
7. MSW: ensure handlers cover endpoints used in screens and APIs; add per-test overrides for edge cases.

Acceptance criteria:

- Green local and CI runs; target coverage met; critical flows covered; MSW handlers exhaustive for used paths.

Deliverables:

- Jest config diff, new test suites, CI log reference.

---

### 10. Documentation and Memory Bank updates

Objective:

- Keep documentation synchronized with the implemented state and capture repeatable processes.

Inputs:

- `docs/memory-bank/*`, `JOURNAL.md`.

Preconditions:

- At least one change merged.

Steps:

1. Update `docs/memory-bank/context.md` with current focus and next steps.
2. Append decisions and rationale to `JOURNAL.md` following the template (what/why/how/why-it-works).
3. If architectural or tech decisions changed, reflect in `architecture.md`/`tech.md`.
4. Add repeatable tasks to `docs/memory-bank/tasks.md` for: addresses CRUD integration, order RPC pattern, Supabase access standardization.

Acceptance criteria:

- Docs accurately reflect current state; repeatable tasks recorded.

Deliverables:

- Updated Memory Bank files and journal entry.

---

### 11. Product details page visibility & validation

Objective:

- Ensure PDP enforces visibility rules, validates parameters, and respects stock constraints.

Inputs:

- `apps/b2c/app/products/[id].tsx`, `packages/shared/api/products.ts`.

Preconditions:

- Storefront/product flows available; navigation guards validated.

Steps:

1. Validate `productId` from `useLocalSearchParams()`; reject array/undefined/invalid UUID and render a safe "Product not found" state.
2. Fetch product scoped to vendor and enforce visibility:
   - If not `published` or user unauthorized, disable Add to Cart and show an appropriate message (no data leak); rely on RLS as backstop.
3. Enforce stock bounds:
   - `QuantitySelector` disables increment at `stock_quantity`; re-validate on submit.
4. Tests:
   - Unit: product fetch/guards; stock enforcement; error states.
   - Screen: PDP invalid/unpublished/unauthorized states; stock limit behavior; deep-link handling.

Acceptance criteria:

- PDP rejects invalid IDs, hides or disables interactions for unpublished/unauthorized products, and enforces stock bounds; tests pass.

Deliverables:

- PDP updates, unit/screen tests.

---

### 12. Single-vendor cart policy and context persistence

Objective:

- Enforce single-vendor cart UX and persist active vendor context across sessions.

Inputs:

- `apps/b2c/app/cart.tsx`, `apps/b2c/app/storefront/[id].tsx`, `apps/b2c/app/products/[id].tsx`, `packages/shared/api/orders.ts`.

Preconditions:

- Cart flows functional; storefront/PDP navigation stable.

Steps:

1. Cross-vendor add guard: if cart contains vendor A and user adds from vendor B, show a confirmation dialog to clear the cart; proceed only on confirm.
2. Persist active vendor context (e.g., lightweight storage) and restore on app launch; verify membership on restore and reconcile or clear.
3. Tests:
   - Add across vendors from list, PDP, and via deep link; persistence across relaunch; membership change reconciliation.

Acceptance criteria:

- Cross-vendor adds are blocked without confirmation; context persists and remains consistent after relaunch; tests pass.

Deliverables:

- UX changes, persistence wiring, tests.

---

### 13. Order cancellation (pending)

Objective:

- Let customers cancel their own pending orders safely and atomically.

Inputs:

- `(tabs)/orders.tsx`, `orders/[id].tsx`, `packages/shared/api/orders.ts`, DB RPC (if adopted).

Preconditions:

- Orders list/detail functional; RLS covers role-based access.

Steps:

1. UI: add "Cancel Order" for `pending` only; confirm via dialog; disable for other statuses.
2. API: implement cancellation endpoint; prefer RPC transaction for status update and related effects; rely on RLS for auth.
3. Tests:
   - Integration: RPC success/failure; ensure state consistency; no partial updates.
   - Screen: list/detail reflect cancelled status; actions disabled appropriately.

Acceptance criteria:

- Pending orders can be cancelled; unauthorized statuses are blocked; tests pass; state remains consistent.

Deliverables:

- UI/API (or RPC) changes, tests.
