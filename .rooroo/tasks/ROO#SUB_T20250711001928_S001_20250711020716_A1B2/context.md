# Sub-Task: Database Schema Modification

**Goal for Expert:** Modify the Supabase database schema to support the multi-vendor architecture as outlined in the architectural plan.

**Key Actions:**

1.  Add a `business_id` column (UUID, Foreign Key to `organisations.id`) to the following tables:
    - `carts`
    - `orders`
    - `categories`
    - `products`
2.  Update the `UNIQUE` constraint on the `categories` table to be `UNIQUE (business_id, name)`.
3.  Add a foreign key constraint `fk_product_category_business` to the `products` table on `(category_id, business_id)` referencing `categories(id, business_id)`.

**Context:**

- [Main Plan Overview](../../../plans/ROO#TASK_20250711001928_1A2B3C_plan_overview.md)
- [Architectural Plan Notes](../../architectural_plan_notes.md)
- The migration can be done via `ALTER TABLE` statements in a new migration file.
