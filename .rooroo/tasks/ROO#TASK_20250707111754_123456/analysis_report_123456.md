# Analysis Report: `docs/backend_design.md` Update

**Task ID:** `ROO#TASK_20250707111754_123456`
**Goal:** Review and update `docs/backend_design.md` section by section based on reviewed PRDs.
**Source Documents:**

- [`docs/backend_design.md`](docs/backend_design.md)
- [`docs/03-b2c-side.md`](docs/03-b2c-side.md) (B2C PRD)
- [`docs/04-b2b-side.md`](docs/04-b2b-side.md) (B2B PRD)

## Summary of Findings and Proposed Changes

This report details the analysis of `docs/backend_design.md` against the B2C and B2B PRDs. Several inconsistencies and areas for improvement were identified. The following sections outline the proposed changes to align the backend design with the product requirements.

---

### 2. Core Entities and Database Schema

#### 2.1 `profiles` Table

The user roles defined (`'admin', 'owner', 'sales_agent', 'customer'`) are consistent with the PRDs. No changes are required.

#### 2.8 `organisations` Table & 2.9 `members` Table

There are inconsistencies in naming. The schema defines `organisations` and `members`, but the RLS policies and descriptions later refer to `organisation` and `business_members`.

**Proposed Change:**

- Standardize references to `organisations` and `members` throughout the document to match the schema definition.
- Correct the foreign key in the `members` table definition from `organisation.id` to `organisations.id`.

### 4. Row Level Security (RLS) Policies

This section contains several items that need correction.

#### 4.2 Example RLS Policies

**`orders` Table (Line 208):**

- **Issue:** There is a `TODO` to implement a more granular RLS policy for `owner` and `sales_agent` roles to restrict order visibility to their own organisation's customers.
- **Proposed Solution:** The `SELECT` policy will be updated to check if the `user_id` of the order is associated with the same `organisation` as the currently authenticated `owner` or `sales_agent`. This requires a subquery that joins through the `members` table.

**`organisation` Table (Line 218):**

- **Issue:** The RLS policies for this table incorrectly reference `public.business_members`.
- **Proposed Change:** Correct the table name to `public.members`.

**`business_members` Table (Line 224):**

- **Issue:** The section is titled `business_members` table, and all policies reference `public.business_members`. The actual table name is `members`.
- **Proposed Change:**
  - Change the section title to `members` table.
  - Correct all references from `public.business_members` to `public.members`.

### 6. API Endpoints Definition

The defined endpoints align well with the B2C and B2B PRDs. However, the B2B PRD mentions reporting and analytics, which are not explicitly covered.

**Proposed Addition:**

- Add a new subsection `6.4 Reporting & Analytics Endpoints (Admin/Owner)` to acknowledge this requirement and suggest potential RPCs for generating reports, as mentioned in [`docs/04-b2b-side.md`](docs/04-b2b-side.md).

---

## Conclusion

The proposed changes will resolve inconsistencies, address the outstanding `TODO`, and better align the backend design document with the product requirements. The next step is to apply these changes to `docs/backend_design.md`.
