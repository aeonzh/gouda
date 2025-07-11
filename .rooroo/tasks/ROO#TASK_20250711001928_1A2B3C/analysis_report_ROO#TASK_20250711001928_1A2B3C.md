# Backend Design Analysis for Multi-Vendor Marketplace

## 1. Executive Summary

This report analyzes the existing backend design documented in [`docs/backend_design.md`](docs/backend_design.md) against the multi-vendor marketplace requirements outlined in [`.rooroo/tasks/ROO#TASK_20250711001928_1A2B3C/context.md`](.rooroo/tasks/ROO#TASK_20250711001928_1A2B3C/context.md).

The current design is a strong starting point for a single-vendor e-commerce application but requires specific modifications to support a multi-vendor model. The key findings indicate that changes are needed in the database schema and Row Level Security (RLS) policies to properly associate data with individual businesses (shops) and to align user permissions with the new model.

**Key Recommendations:**

1.  **Associate Carts and Orders with Businesses:** Add a `business_id` to the `carts` and `orders` tables to ensure they are tied to a single shop.
2.  **Implement Business-Specific Categories:** Modify the `categories` table to include a `business_id`, allowing each shop to manage its own product categories.
3.  **Refine RLS Policies for Owners:** Adjust RLS policies to grant business owners the same permissions as sales agents for their own shop, in addition to their management capabilities.

## 2. Detailed Analysis and Recommendations

### 2.1. Requirement: Carts and Orders Tied to a Single Shop

**Analysis:**

- The current schema for `carts` ([`backend_design.md:80`](docs/backend_design.md:80)) and `orders` ([`backend_design.md:104`](docs/backend_design.md:104)) links directly to a `user_id`, but not to a business or "shop".
- This allows a single cart or order to potentially contain products from multiple vendors, which contradicts the core requirement of a multi-vendor marketplace where a transaction is with a single vendor at a time.

**Recommendations:**

1.  **Modify `carts` Table:** Add a `business_id` column to the `carts` table. This will associate a cart with a specific shop from the moment the first item is added.

    | Column Name   | Data Type | Constraints                       | Description                    |
    | :------------ | :-------- | :-------------------------------- | :----------------------------- |
    | `business_id` | `uuid`    | FK (`organisations.id`), NOT NULL | The shop this cart belongs to. |

2.  **Modify `orders` Table:** Add a `business_id` column to the `orders` table. This should be populated from the cart when the order is created.

    | Column Name   | Data Type | Constraints                       | Description                          |
    | :------------ | :-------- | :-------------------------------- | :----------------------------------- |
    | `business_id` | `uuid`    | FK (`organisations.id`), NOT NULL | The shop this order was placed with. |

3.  **Update RLS Policies:** The RLS policies for `carts` and `orders` must be updated to use `business_id` for authorization checks, ensuring users and agents can only access carts and orders for the businesses they are associated with.

### 2.2. Requirement: Shop-Specific Product Categories

**Analysis:**

- The `categories` table ([`backend_design.md:70`](docs/backend_design.md:70)) is currently global, with a `UNIQUE` constraint on the `name`.
- This structure prevents different shops from creating their own, potentially identically named, categories (e.g., two different restaurants both having a "Starters" category).

**Recommendations:**

1.  **Modify `categories` Table:** Add a `business_id` to the `categories` table and update the `UNIQUE` constraint.

    | Column Name   | Data Type | Constraints                       | Description                       |
    | :------------ | :-------- | :-------------------------------- | :-------------------------------- |
    | `id`          | `uuid`    | PK                                | ...                               |
    | `business_id` | `uuid`    | FK (`organisations.id`), NOT NULL | The shop that owns this category. |
    | `name`        | `text`    | NOT NULL                          | Category name.                    |
    | ...           |           |                                   |                                   |

    The `UNIQUE` constraint should be changed from just `(name)` to `(business_id, name)`.

2.  **Update `products` Table:** The `products.category_id` will now reference a category that belongs to the same business as the product itself. A `business_id` should also be added to the `products` table to enforce this relationship.

3.  **Update RLS Policies:** RLS policies for `categories` must be updated so that only members of a business (e.g., 'owner' or 'sales_agent') can manage the categories for that specific business.

### 2.3. Requirement: Business Owner Permissions

**Analysis:**

- The user requirement states that business owners should have all permissions of a sales agent for their shop.
- The current RLS policies in [`backend_design.md`](docs/backend_design.md) are defined separately for different roles. For example, the `orders` table has specific `INSERT` and `UPDATE` rules for `sales_agent` ([`backend_design.md:224-225`](docs/backend_design.md:224-225)) that are not automatically granted to the `owner` role.

**Recommendations:**

1.  **Consolidate RLS Policies:** The RLS policies should be updated to reflect the role hierarchy. For any rule that applies to a `sales_agent`, it should also apply to an `owner` of the same business.

    **Example (Conceptual RLS for `orders` UPDATE):**

    ```sql
    -- Current
    (auth.jwt() ->> 'user_role' = 'admin') OR (auth.jwt() ->> 'user_role' = 'sales_agent')

    -- Recommended
    (
      (get_my_claim('user_role')::text IN ('owner', 'sales_agent')) AND
      EXISTS (
        SELECT 1 FROM members m
        WHERE m.business_id = orders.business_id AND m.profile_id = auth.uid()
      )
    ) OR (get_my_claim('user_role')::text = 'admin')
    ```

    This ensures that both owners and sales agents can update orders, but only for the business they are a member of.

## 3. Conclusion

The proposed changes will align the backend design with the user's requirements for a multi-vendor marketplace. By introducing a `business_id` to key tables and refining the RLS policies, the system will be able to enforce the necessary data separation and permissions for a multi-shop environment. The next step should be to translate these recommendations into a concrete database migration script and updated RLS policy definitions.
