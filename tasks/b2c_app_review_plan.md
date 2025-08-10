# Task: B2C App Review & Hardening Plan

## Project overview
A structured plan to review, harden, and validate the B2C app (`apps/b2c`) across UX, routing, authentication, data flows, performance, security (RLS alignment), and testing. The outcome is a prioritized set of fixes, tests, and docs to reach release readiness.

## Core requirements
- Ensure navigation flows work for authenticated and unauthenticated users (no unwanted redirects).
- Guarantee accurate product visibility per business and status (e.g., only `published`).
- Robust cart and order creation flows with consistent data shapes.
- Align frontend assumptions with Supabase schema and RLS policies.
- Stabilize and expand automated tests (unit, integration, screen).
- Document key decisions and update Memory Bank context after significant changes.

## Core features
- Auth: login, sign up, forgot password; session management via `AuthProvider`.
- Home: authorized vendors list; navigation into storefront.
- Storefront: category/product listing, search/filter, only published products.
- Product details: standalone route (not a tab); add-to-cart guarded by status.
- Cart: view/update quantities, remove items, create order; loading/empty/error states.
- Orders: history list, details screen.
- Profile: view/edit, addresses (list/add/edit).

## Core components
- Navigation: `apps/b2c/app/_layout.tsx`, `(tabs)/_layout.tsx`, `storefront/[id].tsx`, `products/[id].tsx`.
- Screens: `(tabs)/index.tsx`, `(tabs)/orders.tsx`, `cart.tsx`, `orders/[id].tsx`, `profile/*`.
- Shared APIs: `packages/shared/api/{products.ts,orders.ts,organisations.ts,profiles.ts,supabase.ts}`.
- Shared components: `packages/shared/components/*` (e.g., `Button`, `Input`, `AuthProvider`).
- Testing infra: `apps/b2c/jest.config.js`, `apps/b2c/testing/*`, `packages/shared/jest.config.js`, `packages/shared/testing/*`.

## App/user flow
1. Unauthenticated user sees auth flow and is redirected correctly.
2. Authenticated user lands on Home (authorized vendors), navigates to `storefront/[id]`.
3. From Storefront, user filters/browses products, opens product details, adds to cart.
4. From Cart, user updates items and creates an order, lands on order confirmation.
5. User reviews order history in `(tabs)/orders.tsx` and order details in `orders/[id].tsx`.
6. User manages profile and addresses in `profile/*`.

## Techstack
- React Native (Expo), Expo Router, TypeScript, NativeWind/Tailwind.
- Supabase (Postgres, PostgREST, Auth, Storage) with RLS policies.
- Jest + Testing Library + MSW for tests in monorepo with pnpm.

## Implementation plan
- Audit navigation/auth flows and fix route allow-lists.
- Validate product visibility and storefront filters (status, categories).
- Normalize API response shapes and types (cart, orders, products).
- Add/expand tests to cover critical flows and edge cases.
- Profile performance and address hotspots.
- Document findings and update Memory Bank.

---

## Tasks and subtasks (dependency-wired)

- Conventions:
  - Each item is a checklist entry with an ID and dependencies.
  - All tasks are wired; no orphans.

### 1. Repository scan and baseline
- [ ] 1.1 Confirm local run and basic flows work (`pnpm b2c`), note errors/warnings. (Depends on: none)
- [ ] 1.2 Inventory B2C routes and screens; map to flows (auth, home, storefront, products, cart, orders, profile). (Depends on: 1.1)
- [ ] 1.3 Capture current Supabase schema assumptions (fields used, joins, aliases) from `packages/shared/api/*`. (Depends on: 1.2)
- [ ] 1.4 Record gaps and hypotheses for fixes in `JOURNAL.md`. (Depends on: 1.3)

### 2. Navigation and auth correctness
- [ ] 2.1 Review `apps/b2c/app/_layout.tsx` allow-list for `storefront`, `products/[id]`, `order-confirmation`, `orders`, `profile/*`. (Depends on: 1)
- [ ] 2.2 Verify unauthenticated redirect to `(auth)/login` and prevent tab access. (Depends on: 2.1)
- [ ] 2.3 Ensure product details do not appear as a tab; correct stack placement. (Depends on: 2.1)
- [ ] 2.4 Add tests for redirect rules and route access patterns (screen tests with `renderWithProviders`). (Depends on: 2.2, 2.3)

### 3. Storefront product listing integrity
- [ ] 3.1 Ensure `getProducts` is called with `status: 'published'` in `storefront/[id].tsx`. (Depends on: 1)
- [ ] 3.2 Verify category filter integrates with `getCategories(business_id)` guarding falsy ids. (Depends on: 3.1)
- [ ] 3.3 Confirm business scoping from `useAuth` and `getBusinessIdForUser` where applicable. (Depends on: 3.1)
- [ ] 3.4 Add tests covering published-only filter, empty states, category filter, and search. (Depends on: 3.2, 3.3)

### 4. Cart data shape and UX consistency
- [ ] 4.1 Standardize `getCartItems` mapping to handle `product: products!left(...)` returning array/object/null. (Depends on: 1, 3)
- [ ] 4.2 Verify add/update/remove flows refresh via `fetchCartItems()` and reflect server truth. (Depends on: 4.1)
- [ ] 4.3 Add loading/disabled states for "Create Order"; error surfaces. (Depends on: 4.1)
- [ ] 4.4 Tests: unit (orders API mapping), screen (cart interactions, edge cases with missing product). (Depends on: 4.2, 4.3)

### 5. Order creation and history
- [ ] 5.1 Ensure `createOrderFromCart` relies on RLS for role authorization (no redundant membership gate). (Depends on: 4)
- [ ] 5.2 Align column names (`price_at_time_of_order`) and UI mapping (`price_at_order`). (Depends on: 5.1)
- [ ] 5.3 Orders list uses real user id via `supabase.auth.getUser()`; sort by `created_at`. (Depends on: 5.1)
- [ ] 5.4 Tests: integration for order creation; screen tests for orders list and details. (Depends on: 5.2, 5.3)

### 6. Profile and addresses routes
- [ ] 6.1 Confirm `_layout.tsx` does not redirect away from `profile/*` routes. (Depends on: 2)
- [ ] 6.2 Harden optional fields rendering (avoid crashes on nulls). (Depends on: 6.1)
- [ ] 6.3 Tests: screen navigation from profile to edit/addresses and back. (Depends on: 6.1)

### 7. Types, schema, and RLS alignment
- [ ] 7.1 Audit TypeScript interfaces in `packages/shared/api/*` vs DB schema (e.g., `Product.status`). (Depends on: 1)
- [ ] 7.2 Validate queries do not pass empty strings for UUIDs; guard `business_id`. (Depends on: 7.1)
- [ ] 7.3 Review RLS assumptions used in UI/API; confirm helper functions and policies cover required reads/writes. (Depends on: 7.1)
- [ ] 7.4 Add minimal regression tests for access-sensitive paths (mocked with MSW responses). (Depends on: 7.2, 7.3)

### 8. Performance, errors, and UX polish
- [ ] 8.1 Add skeletons/placeholders for high-latency screens (storefront, orders list). (Depends on: 3, 5)
- [ ] 8.2 Debounce search inputs; memoize heavy lists or use `FlashList` if needed. (Depends on: 3)
- [ ] 8.3 Centralize error toasts/snackbars for API failures. (Depends on: 4, 5)
- [ ] 8.4 Basic perf profile on large product lists; verify image loading strategy. (Depends on: 3)

### 9. Testing strategy expansion (B2C + shared)
- [ ] 9.1 Unit tests for `packages/shared/api/{products,orders,organisations,profiles}` happy/edge paths. (Depends on: 2, 3, 4)
- [ ] 9.2 Screen tests for auth redirects, storefront list/filter, cart, orders, profile nav. (Depends on: 2, 3, 4, 5)
- [ ] 9.3 MSW handlers for integration-like flows in `apps/b2c/testing/msw`. (Depends on: 9.1)
- [ ] 9.4 Ensure monorepo test scripts run green locally and in CI (`pnpm -r --if-present test`). (Depends on: 9.1, 9.2, 9.3)

### 10. Documentation and Memory Bank updates
- [ ] 10.1 Update `docs/memory-bank/context.md` with current focus and next steps. (Depends on: 1–9)
- [ ] 10.2 Append decisions and rationale to `JOURNAL.md`. (Depends on: 1–9)
- [ ] 10.3 Summarize changes impacting architecture or tech in `architecture.md`/`tech.md` if significant. (Depends on: 1–9)
