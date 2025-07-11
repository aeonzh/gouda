# Sub-Task: API and Business Logic Refactoring

**Goal for Expert:** Refactor the API and business logic to support the new multi-vendor architecture.

**Key Actions:**

1.  **Cart Management:**
    - When creating a cart, ensure a `business_id` is associated with it.
    - When adding items to a cart, validate that the product's `business_id` matches the cart's `business_id`.
2.  **Order Placement:**
    - When creating an order, transfer the `business_id` from the cart to the order.
    - Update order viewing logic to filter by `user_id` for customers and `business_id` for business owners/sales agents.
3.  **Product/Category Management:**
    - Update the API to validate the `business_id` against the user's permissions when creating or updating products and categories.
    - Ensure that a product's `category_id` belongs to the same `business_id`.
4.  **User Roles & Permissions:**
    - Implement logic for creating organizations and associating profiles with them.
    - Ensure the authentication system includes `user_role` and associated `business_id`s in the JWT.

**Context:**

- [Main Plan Overview](../../../plans/ROO#TASK_20250711001928_1A2B3C_plan_overview.md)
- [Architectural Plan Notes](../../architectural_plan_notes.md)
- Relevant files for API logic are likely in `packages/shared/api/`.
