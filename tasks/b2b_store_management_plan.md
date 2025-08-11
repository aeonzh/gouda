## B2B Store Management Plan

Checklist of features for the B2B app. Each item includes implementation and tests. Mark items as completed once merged and green.

- [x] 1. Add an item for a business
  - What: Implement create-product flow for B2B: shared API `createProduct`, B2B `products/manage.tsx` create path, and unit tests for shared API.
  - Why: Allow admins/owners to add new products to their catalog.
  - Tests:
    - Unit (shared): `createProduct` inserts row and returns created entity; error surfaces.
  - Deps: none

- [x] 2. Update an item for a business
  - What: Implement update-product flow: shared API `updateProduct` and B2B `products/manage.tsx` edit path; add unit tests.
  - Why: Allow updating product details.
  - Tests:
    - Unit (shared): `updateProduct` updates fields and returns updated entity; error surfaces.
  - Deps: 1

- [x] 3. Delete item for a business
  - What: Implement delete-product flow: shared API `deleteProduct`, hook up B2B products list deletion; add unit tests.
  - Why: Remove obsolete items from catalog.
  - Tests:
    - Unit (shared): `deleteProduct` issues delete by id; error surfaces.
  - Deps: 1

- [x] 4. Add member for a business
  - What: Implement shared API for members insert; B2B screen (new) to add a member with role; unit tests.
  - Why: Manage team access for the business.
  - Tests:
    - Unit (shared): `addMember` inserts `{ profile_id, business_id, role_in_business }`; error surfaces.
  - Deps: none

- [x] 5. Update member for a business
  - What: Implement shared API for updating a member's `role_in_business`; unit tests; B2B screen edit path.
  - Why: Adjust team permissions.
  - Tests:
    - Unit (shared): `updateMemberRole` updates role; error surfaces.
  - Deps: 4

- [x] 6. Delete member for a business
  - What: Implement shared API for deleting a member; unit tests; B2B screen removal.
  - Why: Revoke access cleanly.
  - Tests:
    - Unit (shared): `deleteMember` deletes by composite key `(profile_id,business_id)`; error surfaces.
  - Deps: 4

Notes:

- Follow lazy `getSupabase()` pattern.
- Tests should mock `getSupabase()` with chainable/awaitable query builders.
