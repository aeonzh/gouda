# Analysis of Role Consistency in `docs/backend_design.md`

**Task ID:** `ROO#TASK_20250706230723_1A2B3C`
**File Analyzed:** [`docs/backend_design.md`](docs/backend_design.md)

## 1. Summary of Findings

A detailed review of the backend design document reveals significant inconsistencies in the definition and application of user roles. The primary issues stem from a lack of clarity between global roles (stored in the `profiles` table) and business-specific roles (stored in the `business_members` table), as well as conflicting definitions for the same role across the document.

The roles `owner`, `business_owner`, `sales_agent`, and `manager` are used interchangeably or in a contradictory manner, which could lead to confusion during implementation and bugs in the authorization logic.

## 2. Key Inconsistencies

### 2.1. Conflicting `profiles.role` Definitions

The `role` column in the `profiles` table has two different definitions in the document:

- **On line 51**, the definition is: `User role: 'buyer', 'admin', 'owner'`.
- **On line 166**, the description is: `...including roles ('buyer', 'admin', 'sales_agent', 'business_owner')`.

This is a direct contradiction. The second definition appears to be more comprehensive and aligned with the RLS policies, but it conflicts with the schema definition.

### 2.2. Ambiguous `owner` vs. `business_owner` Role

The terms `owner` and `business_owner` are used in ways that suggest they might be the same, but this is not explicitly stated.

- `owner` is used in the `profiles` table schema ([line 51](docs/backend_design.md:51)).
- `business_owner` is used in the RLS policies for the `profiles` table ([lines 182, 184, 185](docs/backend_design.md:182)).
- `owner` is also defined as a `role_in_business` in the `business_members` table ([line 156](docs/backend_design.md:156)).

This ambiguity makes it unclear if `business_owner` is a global role that should be in the `profiles` table or if it's derived from a user having the `owner` role in the `business_members` table.

### 2.3. Inconsistent `sales_agent` Role

The `sales_agent` role is used extensively in RLS policies and descriptions but is missing from the primary schema definition for the `profiles` table.

- **Missing from Schema:** Not included in the `profiles.role` definition on [line 51](docs/backend_design.md:51).
- **Present Elsewhere:** It is mentioned in the `business` table description ([line 132](docs/backend_design.md:132)), the `business_members` examples ([line 156](docs/backend_design.md:156)), the auth section description ([line 166](docs/backend_design.md:166)), and multiple RLS policies ([lines 208, 210, 214](docs/backend_design.md:208)).

### 2.4. Minor Typo: `Seller Agent`

There is a minor typo on [line 297](docs/backend_design.md:297), where `Seller Agent` is used instead of `sales_agent`.

## 3. Recommendations for Updates

To ensure clarity and consistency, the following updates to [`docs/backend_design.md`](docs/backend_design.md) are recommended:

1.  **Unify Global Roles:** Adopt a single, clear definition for the global roles in the `profiles` table. The recommended set of roles is: `'buyer', 'admin', 'business_owner', 'sales_agent'`.

2.  **Update `profiles` Table Schema:** Modify the description for the `role` column on **line 51** to reflect the unified list of roles.
    - **Current:** `User role: 'buyer', 'admin', 'owner'.`
    - **Suggested:** `User role: 'buyer', 'admin', 'business_owner', 'sales_agent'.`

3.  **Clarify `owner` vs. `business_owner`:**
    - Use `business_owner` exclusively for the global role in the `profiles` table and its corresponding RLS checks.
    - Use `owner` exclusively for the role within the `business_members` table (`role_in_business`).
    - Update the RLS policies on **lines 182, 184, and 185** to use `(auth.jwt() ->> 'role' = 'business_owner')` if the custom claim is named `role`, or keep it as is if the claim is `user_role`. The key is to be consistent with the `profiles.role` column.

4.  **Update Auth Section Description:** Ensure the description on **line 166** matches the final, unified list of roles. The current text is mostly correct but should be reviewed for consistency with the other changes.

5.  **Correct Typo:** Change `Seller Agent` to `sales_agent` on **line 297** for consistency.

By implementing these changes, the document will provide a much clearer and more consistent definition of user roles, which will aid in a smoother and more reliable implementation.
