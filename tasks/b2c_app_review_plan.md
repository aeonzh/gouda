# Task: B2C App Review & Hardening Plan

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

### 11. Product details page visibility & stock/quantity validation
- [ ] 11.1 Validate `productId` param type (must be a string UUID); handle array/undefined/invalid with a safe "not found" state. (Depends on: 2, 3)
- [ ] 11.2 Enforce visibility rules on PDP: block or disable actions for unpublished or unauthorized products; rely on RLS as backstop. (Depends on: 11.1)
- [ ] 11.3 Enforce `stock_quantity` bounds in `QuantitySelector` and on submit; disable increment at max and re-validate before add/order. (Depends on: 4)
- [ ] 11.4 Tests: unit (product fetch/guards); screen (PDP invalid/unpublished/unauthorized, stock limit behavior). (Depends on: 11.2, 11.3)

### 12. Single-vendor cart policy and context persistence
- [ ] 12.1 Implement cross-vendor add guard: when cart has items from vendor A and user adds from vendor B, prompt to clear cart and confirm; otherwise block. (Depends on: 4)
- [ ] 12.2 Persist active vendor context across relaunch; on session restore, verify membership and reconcile or clear cart/context. (Depends on: 2, 3)
- [ ] 12.3 Tests: flows from storefront and PDP including deep-links; persistence across relaunch; membership-change reconciliation. (Depends on: 12.1, 12.2)

### 13. Order cancellation (pending)
- [ ] 13.1 Add "Cancel Order" action for orders in `pending` status in list and detail screens; confirm via dialog. (Depends on: 5)
- [ ] 13.2 Implement cancellation in shared API; prefer RPC for atomicity and consistent side-effects; rely on RLS for auth. (Depends on: 13.1)
- [ ] 13.3 Tests: integration (RPC success/failure), screen tests (state updates, disabled for non-pending). (Depends on: 13.2)
