The user wants to ensure that all non-admin "delete" operations are implemented as "soft deletes" (by updating the `deleted_at` column) and that "hard deletes" (actual `DELETE` operations) are exclusively for admin roles.

Please review the `docs/backend_design.md` file and the `supabase/migrations/20250711022017_add_rls_policies.sql` file.

**Instructions:**

1.  **`docs/backend_design.md`**:
    - For each table's RLS policy section, ensure that any "SOFT DELETE" policy explicitly mentions that it's an `UPDATE` operation setting the `deleted_at` column.
    - Ensure that for non-admin roles, there are no `DELETE` policies that would allow a "hard delete". If there are, change them to `UPDATE` policies that set `deleted_at`.
    - Reiterate that "hard delete" operations are reserved for admin roles only.

**Relevant files:**

- [docs/backend_design.md](docs/backend_design.md)
- [supabase/migrations/20250711022017_add_rls_policies.sql](supabase/migrations/20250711022017_add_rls_policies.sql)
