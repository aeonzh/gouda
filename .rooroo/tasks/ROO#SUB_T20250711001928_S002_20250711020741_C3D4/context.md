# Sub-Task: Row Level Security (RLS) Policy Implementation

**Goal for Expert:** Implement and update Row Level Security (RLS) policies for the tables modified in the previous step (`carts`, `orders`, `categories`, `products`) to enforce the new business-centric data model.

**Key Actions:**

1.  Enable RLS on the `carts`, `orders`, `categories`, and `products` tables if not already enabled.
2.  Create or update RLS policies for `SELECT`, `INSERT`, `UPDATE`, and `DELETE` operations on these tables.
3.  The policies should filter data based on the `business_id` and the user's role (`admin`, `owner`, `sales_agent`).
4.  Ensure that business owners have the same permissions as sales agents for their own businesses.

**Context:**

- [Main Plan Overview](../../../plans/ROO#TASK_20250711001928_1A2B3C_plan_overview.md)
- [Architectural Plan Notes](../../architectural_plan_notes.md)
- The RLS policies should be implemented in a new migration file.
