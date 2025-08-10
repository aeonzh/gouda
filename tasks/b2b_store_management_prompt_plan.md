## B2B Store Management Prompt Plan

This document provides explicit, actionable prompts for each task in `@b2b_store_management_plan.md`. Prompts expand implicit requirements to avoid ambiguity and enumerate concrete steps.

Optimized for:
- Feature correctness
- Security best practices (RLS-first, no client-side elevation, strict validation)
- Maintainability (clear separation of concerns, test seams, typed APIs)
- Performance (minimal round-trips, memoization, debounced inputs where relevant)
- React Native a11y and ergonomics (SafeArea, large touch targets, SR labels)
- Testing (unit for shared APIs, integration for screens and native modules)
- Resource hygiene (cleanup subscriptions, timers, listeners)

Use these prompts verbatim when implementing features.

### Execution Instructions

1) Consult `@b2b_store_management_plan.md` as the source of truth for scope and completion status. If the plan marks an item complete, treat this prompt as a verification/refactor guide rather than a net-new feature task.
2) For each prompt below:
   - Verify whether the feature exists and fully meets the requirements. If not, implement the missing parts.
   - Ensure tests exist and pass. Add missing tests.
   - Keep changes scoped. Stage only relevant files.
   - Prepare a clear commit message (conventional commits) for review.
3) After implementation or verification, update this file’s Tracking section accordingly.

Tracking
- [ ] 1) Add an item for a business (Product Create)
- [ ] 2) Update an item for a business (Product Update)
- [ ] 3) Delete item for a business (Product Delete)
- [ ] 4) Add member for a business
- [ ] 5) Update member for a business
- [ ] 6) Delete member for a business

---

### 1) Add an item for a business (Product Create)

"""
Implement a complete product creation flow in the B2B app.

Scope
- Screen operates in create mode when no `id` param is present: `apps/b2b/app/products/manage.tsx`.
- Uses shared API: `packages/shared/api/products.ts` `createProduct(input)` with lazy `getSupabase()`.
- Business context: actions are scoped to the authenticated user’s single `business_id` (B2B app assumption). Resolve via an existing hook/context or by calling a helper resolving membership. Do not hardcode.

UI Requirements
- Form fields:
  - `name` (required, trimmed, 2–120 chars)
  - `description` (optional, trimmed, ≤ 2,000 chars)
  - `price` (required, numeric, > 0, max two decimals)
  - `category_id` (optional; via `@react-native-picker/picker` or similar)
  - `image_url` (optional; valid URL format if provided)
- Layout: Safe area aware; keyboard-aware scroll when fields focus; dismiss keyboard on submit.
- Validation: Real-time and on-submit; disable submit while invalid or submitting; inline errors with accessible labels.
- Feedback: On success, show toast/alert and navigate back to the products list. On error, show actionable message.
- Accessibility: Labels/aria for all fields; touch targets ≥ 44x44; testIDs for inputs and submit.

Data & Security
- Input sanitation: trim strings, coerce price to string/decimal as needed by API; reject zero/negative or NaN.
- Business ID: obtain from context/hook (e.g., `useBusinessId`) or via a dedicated helper. Never accept business_id from user input.
- Call `createProduct({ business_id, name, description, price, category_id, image_url })` and rely on RLS for authorization.

Code Quality
- Split presentation and logic:
  - `useCreateProduct()` hook encapsulating form state, validation schema, submit, loading/error state.
  - `ProductForm` component for inputs + errors + submit.
- Keep functions small; avoid side effects during render.
- Memoize handlers (`useCallback`) and derived values (`useMemo`).

Tests
- Unit (shared):
  - Add/ensure tests for `createProduct` using a chainable/awaitable Supabase mock via `jest.isolateModules` and `jest.doMock('../supabase', ...)`.
  - Assert insert payload shape, success return, and error propagation.
- Integration (RN):
  - Render `manage.tsx` with no `id`. Fill fields, select category, submit.
  - Assert API called with sanitized payload (trimmed strings, decimal price) and business_id injected from context.
  - Verify disabled state during submit and success navigation/toast on completion.
- Native modules: mock `@react-native-picker/picker`.
- Resource hygiene: unmount and assert no state updates after unmount; clean timers/subscriptions.

Actionable Steps
1. Ensure `packages/shared/api/products.ts` exports `createProduct` using `getSupabase()` (lazy) and returns created row or throws on error.
2. In `apps/b2b/app/products/manage.tsx`, detect create mode (`!id`).
3. Implement `useCreateProduct` with validation schema and submit logic that resolves `business_id` from context.
4. Build `ProductForm` with labeled inputs, error rendering, disabled submit while invalid/submitting, and success/error feedback.
5. Wire navigation back on success; trigger a list refresh signal if applicable.
6. Write/extend unit tests in shared; write integration test for create path (mock Picker).
7. Run tests and verify app build.
"""

---

### 2) Update an item for a business (Product Update)

"""
Implement a robust product update flow in the B2B app.

Scope
- Screen operates in edit mode when `id` param exists: `apps/b2b/app/products/manage.tsx`.
- Shared APIs: `getProductById(id)` and `updateProduct(id, partial)` with lazy `getSupabase()`.

UI Requirements
- On mount: fetch product by `id`; show loading spinner; if not found, show error and navigate back.
- Prefill form with existing values; same validation rules as create.
- Submit path: disable during submit; show success and navigate back.
- Accessibility: Same as create; ensure readout of loading/error states.

Data & Security
- Only send changed fields if straightforward; otherwise send minimal safe payload.
- Do not allow changes to `business_id` or server-controlled fields.
- Rely on RLS for authorization; surface errors clearly.

Maintainability
- Extract `useProductForm` shared hook (create/update) for form state and validation to reduce duplication.
- Keep effects in `useEffect`; avoid data fetching in render.

Tests
- Unit (shared):
  - `updateProduct` chains `from('products').update(...).eq('id', id).select('*').single()`; asserts success/error.
- Integration (RN):
  - Render edit mode, wait for prefill, modify fields, submit; assert API called with expected partial/payload and success navigate.
  - Cover category Picker interactions.
- Resource hygiene: unmount during in-flight request and assert no warnings/state leaks.

Actionable Steps
1. Ensure shared `getProductById` and `updateProduct` exist and are using `getSupabase()` lazily.
2. In `manage.tsx`, detect edit mode (`id` present); implement fetch with loading/not-found handling.
3. Reuse `useProductForm` for state/validation; initialize with fetched data.
4. Implement submit to call `updateProduct(id, partial)`; map UI to API field names.
5. Add/extend unit tests; add integration test for edit flow.
6. Verify tests green and screen behavior in app.
"""

---

### 3) Delete item for a business (Product Delete)

"""
Implement secure product deletion from the products list with user confirmation.

Scope
- List screen: `apps/b2b/app/(tabs)/products.tsx`.
- Shared API: `deleteProduct(id)`.

UI Requirements
- Provide a visible delete affordance per row (icon/button).
- On press: open a confirm dialog that clearly states the product name and destructive nature; include Cancel/Confirm.
- After confirm: disable the row’s delete control while pending; show success/error toast; refresh list.
- Accessibility: Ensure SR labels for delete buttons; confirmation dialog is accessible.

Data & Security
- Call `deleteProduct(id)`; rely on RLS. Do not attempt client-side role elevation.
- Avoid duplicate deletes with a pending guard.

Performance
- Optional optimistic removal with rollback on API failure.
- Coalesce refreshes to avoid refetch storms.

Tests
- Unit (shared): correctness of delete chain and error surfacing.
- Integration (RN): simulate delete press → confirm → API call → list refresh; verify removal and error path handling.
- Native: mock Alert/confirm module and assert dialog flow.
- Resource hygiene: ensure no setState after unmount.

Actionable Steps
1. Ensure `deleteProduct` exists in shared API and is tested.
2. Add delete UI to the products list; wire accessible labels and testIDs.
3. Implement confirm flow; call API; refresh data source (or optimistic update with rollback).
4. Add integration test covering happy and error paths.
"""

---

### 4) Add member for a business

"""
Implement adding a member with role assignment to the current business.

Scope
- New screen: `apps/b2b/app/members/manage.tsx` in create mode.
- Shared API: `packages/shared/api/members.ts` `addMember({ profile_id, business_id, role_in_business })`.

UI Requirements
- Fields: `profile_id` (UUID), `role_in_business` (enum: `owner`, `sales_agent`, `customer`).
- `business_id` is prefilled from app context; not editable.
- Validate UUID format and that a role is selected.
- Submit button disabled while invalid/submitting; success toast and navigate back to `apps/b2b/app/members/index.tsx`.
- Accessibility: proper labels, Picker SR support, testIDs.

Data & Security
- Resolve `business_id` from context/hook; never accept from user.
- Before submit, optionally check for existing membership to avoid duplicate insert (best-effort client-side), but ultimately rely on backend constraints/RLS.
- Rely on RLS to authorize insert; surface backend errors.

Maintainability
- Implement `useMemberForm` hook for create/update reuse (handles state, validation, submit, errors).

Tests
- Unit (shared): `addMember` inserts expected payload; error propagation.
- Integration (RN): fill valid values, submit, assert API payload includes resolved `business_id` and navigates on success.
- Native: mock Role Picker.
- Resource hygiene: cleanup/abort in-flight requests on unmount.

Actionable Steps
1. Ensure `addMember` exists and uses `getSupabase()` lazily.
2. Create `members/manage.tsx` (create mode) UI with validation and submit.
3. Implement `useMemberForm` for state and submission.
4. Add unit tests in shared and integration test for create flow.
"""

---

### 5) Update member for a business

"""
Implement updating a member’s `role_in_business` while preserving composite identity.

Scope
- Screen: `apps/b2b/app/members/manage.tsx` edit mode.
- Route params must include `profile_id` and `business_id` to uniquely identify the member.
- Shared API: `updateMemberRole(profile_id, business_id, role)`.

UI Requirements
- Prefill current role; display read-only `profile_id` and `business_id`.
- Validate role transitions; optionally enforce “at least one owner must remain” at UI level (final authority is backend constraints/RLS).
- Disable submit while pending; show success toast; navigate back to members list.

Data & Security
- Use composite key in API call; never change `profile_id`/`business_id` in edit mode.
- Rely on RLS; map backend errors to user-friendly messages.

Tests
- Unit (shared): update call correctness and error propagation.
- Integration (RN): change role and submit; assert success; error path when blocked transition.
- Resource hygiene: ensure safe unmount.

Actionable Steps
1. Ensure `updateMemberRole` exists and is tested.
2. Implement edit mode in `members/manage.tsx` reading params; prefill role and lock identities.
3. Submit new role via API; handle success/error; navigate back.
4. Add integration test for edit path and blocked transition scenario.
"""

---

### 6) Delete member for a business

"""
Implement removing a member using a composite key with safeguards for ownership continuity.

Scope
- Members list screen (e.g., `apps/b2b/app/members/index.tsx`).
- Shared API: `deleteMember(profile_id, business_id)`.

UI Requirements
- For each member, provide a delete affordance with SR label.
- Confirm dialog names the member and clarifies irreversibility; Cancel/Confirm options.
- Prevent removing the only remaining `owner` with a pre-check if feasible; always rely on backend constraint.
- On confirm, disable control while pending; show success/error toast; refresh list.

Data & Security
- Call delete with composite key; rely on RLS and DB constraints to block last owner removal.

Performance
- Optional optimistic UI with rollback on failure.

Tests
- Unit (shared): composite-key delete call correctness and error propagation.
- Integration (RN): confirm → API → refresh; cover error path (attempt to remove last owner shows blocking UI message).
- Resource hygiene: ensure no dangling async after unmount.

Actionable Steps
1. Ensure `deleteMember` exists and has unit tests.
2. Add delete control to members list; wire confirm dialog and accessible labels.
3. Implement API call and list refresh/optimistic update with rollback.
4. Add integration tests for happy and last-owner error paths.
"""

