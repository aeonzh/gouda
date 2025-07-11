## Architectural Plan Notes for Multi-Vendor Backend

### Core Concept: Business-Centric Data Model

The fundamental shift is to associate all relevant entities (carts, orders, categories, products) with a specific `business_id` (representing a "shop" or "organisation"). This enables true multi-tenancy and data isolation.

### Database Schema Changes:

- **`carts` table:** Add `business_id` (UUID, FK to `organisations.id`, NOT NULL).
- **`orders` table:** Add `business_id` (UUID, FK to `organisations.id`, NOT NULL).
- **`categories` table:** Add `business_id` (UUID, FK to `organisations.id`, NOT NULL). Change `UNIQUE (name)` to `UNIQUE (business_id, name)`.
- **`products` table:** Add `business_id` (UUID, FK to `organisations.id`, NOT NULL). Add FK constraint `fk_product_category_business` on `(category_id, business_id)` referencing `categories(id, business_id)` to ensure product categories belong to the same business.

### Row Level Security (RLS) Policy Updates:

- **Principle:** RLS policies will filter data based on `business_id` and user roles.
- **General Pattern:** For tables with `business_id`, policies will typically use a `USING` clause like:
  ```sql
  (get_my_claim('user_role')::text = 'admin') OR
  (
    (get_my_claim('user_role')::text IN ('owner', 'sales_agent')) AND
    EXISTS (
      SELECT 1 FROM members m
      WHERE m.business_id = <table_name>.business_id AND m.profile_id = auth.uid()
    )
  )
  ```
- **Business Owner Permissions:** The `owner` role will implicitly gain `sales_agent` permissions for their associated businesses through these consolidated RLS policies.
- **Example (`products` table):**
  - `SELECT`: `USING (TRUE)` for public viewing (or more restrictive if needed).
  - `INSERT`/`UPDATE`/`DELETE`: Use the general pattern above, checking `products.business_id`.

### API/Business Logic Adjustments:

- **Cart Management:**
  - **Create Cart:** `business_id` must be determined (explicit selection or implicit from first product).
  - **Add to Cart:** Validate that product's `business_id` matches cart's `business_id`. Prevent cross-shop additions.
- **Order Placement:**
  - **Create Order:** Transfer `business_id` from cart to order.
  - **View Orders:** Filter by `user_id` for customers; filter by `business_id` for owners/sales agents.
- **Product/Category Management:**
  - **Create/Update:** API must validate `business_id` against user's permissions and ensure `category_id` belongs to the same `business_id`.
  - **View:** Public views can filter by `business_id`. B2B views should automatically scope to the user's managed businesses.
- **User Roles & Permissions:**
  - Need logic for creating `organisations` and associating `profiles` with `organisations` via the `members` table (assigning `owner`/`sales_agent` roles).
  - Authentication system should include `user_role` and associated `business_id`s in JWT for RLS and API logic.

### Migration Strategy (Simplified):

- Since the application is not in production, direct schema modifications can be applied.
- No complex data migration scripts for existing production data are required.
- Focus on applying `ALTER TABLE` statements and `CREATE/ALTER POLICY` statements directly.
