## B2B Store Management Prompt Plan

This document provides detailed prompts for each task in `b2b_store_management_plan.md`. Each prompt is optimized for:

- Feature correctness
- Security best practices (RLS, role checks, input validation)
- Code maintainability (clear separation, DI seams, testability)
- Performance (minimal round-trips, correct pagination, memoization)
- React Native best practices (a11y, SafeArea, gesture-safe interactions)
- React Native design patterns (container/presentational split, hooks)
- Tests: unit for business logic and API shims; integration for screens/native modules
- Memory leak detection (cleanup subscriptions, timers, listeners)

Use these prompts verbatim when creating features or ask for refinements as needed.

---

### 1) Add an item for a business (Product Create)

Prompt:

"""
Implement a product create flow for the B2B app.

Requirements
- UI
  - Screen: `apps/b2b/app/products/manage.tsx` in create mode when no `id` query is present.
  - Fields: name (required), description (optional), price (required, > 0), category (optional), image_url (optional).
  - UX: form validation with clear error messages; primary CTA disabled while submitting; success toast/alert and navigate back to products list.
  - Accessibility: label each input, ensure touch targets ≥44x44, support keyboard navigation and screen readers; respect SafeAreas.
  - Performance: avoid unnecessary re-renders; memoize derived values; no unbounded lists; debounce network calls when needed.
- Data
  - Use `packages/shared/api/products.createProduct` via the lazy `getSupabase()` client.
  - Validate inputs before calling API; disallow 0/negative prices; trim strings.
  - Security: rely on Supabase RLS; no client-side role elevation; do not expose secrets.
- Code quality
  - Separate presentational UI from data logic using hooks (e.g., `useCreateProduct`); keep functions small.
  - Handle errors with actionable messages; log unexpected errors with context.
- Tests
  - Unit (shared): `createProduct` inserts and returns created entity; surfaces errors (mock `getSupabase()` and chainable builder).
  - Integration (RN): render `manage.tsx` in create mode, fill fields, submit, assert API called with correct payload and success UI state.
  - Native module integration: mock `@react-native-picker/picker`; assert selection reflects in payload.
  - Memory leaks: verify no lingering timers/subscriptions; ensure `useEffect` cleanups are present and covered by tests.

Deliverables
- Validations in the form component
- API invocation and error handling
- Tests passing across shared and app
"""

---

### 2) Update an item for a business (Product Update)

Prompt:

"""
Implement a product update flow for the B2B app.

Requirements
- UI
  - Screen: `apps/b2b/app/products/manage.tsx` in edit mode when `id` query is present.
  - Prefill form by fetching `getProductById(id)`; render a loading state; show not-found error and navigate back if missing.
  - Validate inputs on change and before submit; disable submit while pending; show success and navigate back.
- Data
  - Use `packages/shared/api/products.updateProduct(id, partial)` with lazy `getSupabase()`.
  - Only send changed fields when practical; preserve server-authoritative fields.
  - Security: rely on RLS; do not trust client roles; reject invalid price values.
- Maintainability
  - Extract `useProductForm` hook for shared create/update logic where reasonable.
  - Keep side-effects in effects and actions, not render paths.
- Tests
  - Unit (shared): `updateProduct` updates fields; chains `eq('id', ...)`; surfaces errors.
  - Integration (RN): prefill with existing product; modify fields; submit; assert success; ensure Picker interaction is covered.
  - Memory leaks: ensure any listeners/timeouts are cleaned on unmount; test with RTL unmount + assertions.

Deliverables
- Edit path with prefill, validations, and update
- Passing unit and integration tests
"""

---

### 3) Delete item for a business (Product Delete)

Prompt:

"""
Implement product deletion from the products list with confirmation.

Requirements
- UI
  - Screen: `apps/b2b/app/(tabs)/products.tsx` list view.
  - On delete icon press: show confirm Alert; on confirm call API; refresh list; show success or error toast.
  - Accessibility: ensure buttons are labeled; destructive action clearly indicated.
- Data
  - Use `packages/shared/api/products.deleteProduct(id)`.
  - Security: RLS ensures only authorized roles can delete products.
- Performance
  - Optionally perform optimistic UI removal with rollback on failure.
  - Avoid refetch storm; coalesce refreshes.
- Tests
  - Unit (shared): `deleteProduct` issues correct delete chain and surfaces errors.
  - Integration (RN): simulate press -> confirm -> API call -> refetch/refresh list, assert item removed.
  - Native: mock alert/confirm and ensure flows are covered.
  - Memory leaks: no stale state updates after unmount; ensure async flows are cancelled.

Deliverables
- Confirmed delete with robust error handling
- Tests covering happy/error paths
"""

---

### 4) Add member for a business

Prompt:

"""
Implement adding a member to a business with role assignment.

Requirements
- UI
  - New screen: `apps/b2b/app/members/manage.tsx` in create mode; fields: profile_id (UUID), role_in_business (enum), business_id prefilled from context.
  - Validate UUID format, role choices (`owner`, `sales_agent`, `customer`).
  - Submit with disabled state; success toast and navigate back to members list.
- Data
  - Use `packages/shared/api/members.addMember({ profile_id, business_id, role_in_business })`.
  - Security: rely on RLS; do not expose role elevation; validate input strictly; prevent duplicate membership client-side when possible.
- Maintainability
  - Create `useMemberForm` hook for shared create/update logic.
- Tests
  - Unit (shared): `addMember` inserts row and returns created entity; error surfaced.
  - Integration (RN): fill form, submit, assert API payload and navigation; cover role Picker.
  - Native modules: mock `@react-native-picker/picker`.
  - Memory leaks: cleanup network subscriptions and timers in effects.

Deliverables
- Member create form and API integration with tests
"""

---

### 5) Update member for a business

Prompt:

"""
Implement updating a member's `role_in_business`.

Requirements
- UI
  - Screen: `apps/b2b/app/members/manage.tsx` edit mode (query has `profile_id` + `business_id`); prefill role; business/profile fields read-only.
  - Validate role transitions if business rules require (e.g., at least one owner must remain).
  - Submit with disabled state; success toast; navigate back.
- Data
  - Use `packages/shared/api/members.updateMemberRole(profile_id, business_id, role)`.
  - Security: enforce allowed transitions in backend (RLS/constraints) and mirror in UI.
- Tests
  - Unit (shared): update chain calls and surfaces error.
  - Integration (RN): change role and submit; assert payload; blocked transitions show UI error.
  - Memory leaks: ensure no stale updates on unmount.

Deliverables
- Role update flow with constraints and tests
"""

---

### 6) Delete member for a business

Prompt:

"""
Implement removing a member from a business.

Requirements
- UI
  - From members list screen: confirm destructive action; prevent removing the only remaining `owner` (enforce via backend and UI check).
  - Accessibility: destructive affordance is clearly labeled; confirmation dialog supports screen readers.
- Data
  - Use `packages/shared/api/members.deleteMember(profile_id, business_id)`.
  - Security: rely on RLS; ensure backend prevents last-owner removal.
- Performance
  - Optionally optimistic removal with rollback on failure.
- Tests
  - Unit (shared): composite-key delete and error surface.
  - Integration (RN): confirm dialog, API call, and list refresh; error path (attempt to remove last owner) shows blocking UI.
  - Memory leaks: ensure no dangling async ops after unmount.

Deliverables
- Safe member removal with appropriate guards and tests
"""


