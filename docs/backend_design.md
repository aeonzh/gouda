# High-Level Backend API Design (MVP) - Supabase Focused

This document outlines the high-level backend API design for the Gouda project, leveraging Supabase as the primary backend-as-a-service. It covers the initial database schema, core entities, authentication, Row Level Security (RLS) policies, and the planned use of Supabase's auto-generated APIs (PostgREST).

## 1. Supabase Project Setup and Local Development Environment

### 1.1 Supabase Project Initialization

A new Supabase project will be created via the Supabase dashboard. This project will serve as the central backend for both the Customer and Administrative applications.

### 1.2 Local Development Environment Setup (via Docker)

For local development, the Supabase CLI and Docker will be used to run a local instance of the Supabase stack.

**Steps to set up local environment:**

1.  **Install Supabase CLI**:
    ```bash
    brew install supabase/tap/supabase
    # or via npm
    npm install supabase
    ```
2.  **Initialize Supabase in project root**:
    ```bash
    supabase init
    ```
3.  **Link to your Supabase project (optional, for migrations)**:
    ```bash
    supabase link --project-ref your-project-ref
    ```
4.  **Start local Supabase services**:
    ```bash
    supabase start
    ```
    This will start all necessary Docker containers (PostgreSQL, PostgREST, Auth, Storage, etc.) and provide local URLs and keys.

## 2. Core Entities and Database Schema

The following core entities and their relationships will form the initial database schema in Supabase.

### 2.1 `profiles` Table (Extending `auth.users`)

This table will store additional user profile information, linked to Supabase's built-in `auth.users` table.

| Column Name  | Data Type                  | Constraints                  | Description                                                                                        |
| :----------- | :------------------------- | :--------------------------- | :------------------------------------------------------------------------------------------------- |
| `id`         | `uuid`                     | PK, FK (`auth.users.id`)     | Primary key, links to Supabase Auth user ID.                                                       |
| `username`   | `text`                     | UNIQUE, NOT NULL             | User's chosen username.                                                                            |
| `full_name`  | `text`                     | NULLABLE                     | User's full name.                                                                                  |
| `avatar_url` | `text`                     | NULLABLE                     | URL to user's avatar image.                                                                        |
| `role`       | `text`                     | NOT NULL, DEFAULT 'customer' | Global user role: 'admin', 'customer'. Business-specific roles are managed in the `members` table. |
| `created_at` | `timestamp with time zone` | DEFAULT `now()`              | Timestamp of profile creation.                                                                     |
| `updated_at` | `timestamp with time zone` | DEFAULT `now()`              | Last update timestamp.                                                                             |
| `deleted_at` | `timestamp with time zone` | NULLABLE                     | Timestamp when the profile was soft-deleted.                                                       |

### 2.2 `products` Table

Stores information about products available in the catalog.

| Column Name      | Data Type                  | Constraints                         | Description                                       |
| :--------------- | :------------------------- | :---------------------------------- | :------------------------------------------------ |
| `id`             | `uuid`                     | PK, DEFAULT `gen_random_uuid()`     | Unique product identifier.                        |
| `business_id`    | `uuid`                     | FK (`organisations.id`)             | The business associated with the product.         |
| `name`           | `text`                     | NOT NULL                            | Product name.                                     |
| `description`    | `text`                     | NULLABLE                            | Detailed product description.                     |
| `status`         | `text`                     | NOT NULL, DEFAULT 'draft'           | Product status: 'draft', 'published', 'rejected'. |
| `price`          | `numeric`                  | NOT NULL                            | Unit price of the product.                        |
| `image_url`      | `text`                     | NULLABLE                            | URL to product image.                             |
| `category_id`    | `uuid`                     | FK (`categories.id`, `business_id`) | Category the product belongs to.                  |
| `stock_quantity` | `integer`                  | NOT NULL, DEFAULT 0                 | Current stock level.                              |
| `created_at`     | `timestamp with time zone` | DEFAULT `now()`                     | Timestamp of product creation.                    |
| `updated_at`     | `timestamp with time zone` | DEFAULT `now()`                     | Last update timestamp.                            |
| `deleted_at`     | `timestamp with time zone` | NULLABLE                            | Timestamp when the product was soft-deleted.      |

### 2.3 `categories` Table

Stores product categories.

| Column Name   | Data Type                  | Constraints                     | Description                                                          |
| :------------ | :------------------------- | :------------------------------ | :------------------------------------------------------------------- |
| `id`          | `uuid`                     | PK, DEFAULT `gen_random_uuid()` | Unique category identifier.                                          |
| `business_id` | `uuid`                     | FK (`organisations.id`)         | The business associated with the category.                           |
| `name`        | `text`                     | NOT NULL                        | Category name (e.g., 'Dairy', 'Produce'). Unique with `business_id`. |
| `created_at`  | `timestamp with time zone` | DEFAULT `now()`                 | Timestamp of category creation.                                      |
| `updated_at`  | `timestamp with time zone` | DEFAULT `now()`                 | Last update timestamp.                                               |
| `deleted_at`  | `timestamp with time zone` | NULLABLE                        | Timestamp when the category was soft-deleted.                        |

### 2.4 `carts` Table

Represents a user's shopping cart.

| Column Name   | Data Type                  | Constraints                     | Description                               |
| :------------ | :------------------------- | :------------------------------ | :---------------------------------------- |
| `id`          | `uuid`                     | PK, DEFAULT `gen_random_uuid()` | Unique cart identifier.                   |
| `user_id`     | `uuid`                     | FK (`profiles.id`), NOT NULL    | The user who owns the cart.               |
| `business_id` | `uuid`                     | FK (`organisations.id`)         | The business associated with the cart.    |
| `created_at`  | `timestamp with time zone` | DEFAULT `now()`                 | Timestamp of cart creation.               |
| `updated_at`  | `timestamp with time zone` | DEFAULT `now()`                 | Last update timestamp.                    |
| `deleted_at`  | `timestamp with time zone` | NULLABLE                        | Timestamp when the cart was soft-deleted. |

### 2.5 `cart_items` Table

Items within a shopping cart.

| Column Name            | Data Type                  | Constraints                     | Description                                    |
| :--------------------- | :------------------------- | :------------------------------ | :--------------------------------------------- |
| `id`                   | `uuid`                     | PK, DEFAULT `gen_random_uuid()` | Unique cart item identifier.                   |
| `cart_id`              | `uuid`                     | FK (`carts.id`), NOT NULL       | The cart this item belongs to.                 |
| `product_id`           | `uuid`                     | FK (`products.id`), NOT NULL    | The product in the cart.                       |
| `quantity`             | `integer`                  | NOT NULL, DEFAULT 1             | Quantity of the product.                       |
| `price_at_time_of_add` | `numeric`                  | NOT NULL                        | Price of product when added to cart.           |
| `created_at`           | `timestamp with time zone` | DEFAULT `now()`                 | Timestamp of item addition.                    |
| `updated_at`           | `timestamp with time zone` | DEFAULT `now()`                 | Last update timestamp.                         |
| `deleted_at`           | `timestamp with time zone` | NULLABLE                        | Timestamp when the cart item was soft-deleted. |

### 2.6 `orders` Table

Represents a placed order.

| Column Name    | Data Type                  | Constraints                     | Description                                                      |
| :------------- | :------------------------- | :------------------------------ | :--------------------------------------------------------------- |
| `id`           | `uuid`                     | PK, DEFAULT `gen_random_uuid()` | Unique order identifier.                                         |
| `user_id`      | `uuid`                     | FK (`profiles.id`), NOT NULL    | The user who placed the order.                                   |
| `business_id`  | `uuid`                     | FK (`organisations.id`)         | The business associated with the order.                          |
| `total_amount` | `numeric`                  | NOT NULL                        | Total amount of the order.                                       |
| `status`       | `text`                     | NOT NULL, DEFAULT 'pending'     | Order status: 'pending', 'processing', 'completed', 'cancelled'. |
| `created_at`   | `timestamp with time zone` | DEFAULT `now()`                 | Timestamp of order creation.                                     |
| `updated_at`   | `timestamp with time zone` | DEFAULT `now()`                 | Last update timestamp.                                           |
| `deleted_at`   | `timestamp with time zone` | NULLABLE                        | Timestamp when the order was soft-deleted.                       |

### 2.7 `order_items` Table

Items within an order.

| Column Name              | Data Type                  | Constraints                     | Description                                     |
| :----------------------- | :------------------------- | :------------------------------ | :---------------------------------------------- |
| `id`                     | `uuid`                     | PK, DEFAULT `gen_random_uuid()` | Unique order item identifier.                   |
| `order_id`               | `uuid`                     | FK (`orders.id`), NOT NULL      | The order this item belongs to.                 |
| `product_id`             | `uuid`                     | FK (`products.id`), NOT NULL    | The product in the order.                       |
| `quantity`               | `integer`                  | NOT NULL                        | Quantity of the product.                        |
| `price_at_time_of_order` | `numeric`                  | NOT NULL                        | Price of product when order was placed.         |
| `created_at`             | `timestamp with time zone` | DEFAULT `now()`                 | Timestamp of item addition to order.            |
| `updated_at`             | `timestamp with time zone` | DEFAULT `now()`                 | Last update timestamp.                          |
| `deleted_at`             | `timestamp with time zone` | NULLABLE                        | Timestamp when the order item was soft-deleted. |

### 2.8 `organisations` Table

Stores business information, including addresses, for users with 'owner' or 'sales_agent' roles.

| Column Name     | Data Type                  | Constraints                     | Description                                                                         |
| :-------------- | :------------------------- | :------------------------------ | :---------------------------------------------------------------------------------- |
| `id`            | `uuid`                     | PK, DEFAULT `gen_random_uuid()` | Unique organisation identifier.                                                     |
| `profile_id`    | `uuid`                     | FK (`profiles.id`), NOT NULL    | The profile of the business owner.                                                  |
| `name`          | `text`                     | NOT NULL                        | Name of the business.                                                               |
| `address_line1` | `text`                     | NOT NULL                        | Street address line 1.                                                              |
| `address_line2` | `text`                     | NULLABLE                        | Street address line 2.                                                              |
| `city`          | `text`                     | NOT NULL                        | City.                                                                               |
| `state`         | `text`                     | NOT NULL                        | State/Province.                                                                     |
| `postal_code`   | `text`                     | NOT NULL                        | Postal code.                                                                        |
| `country`       | `text`                     | NOT NULL                        | Country.                                                                            |
| `created_at`    | `timestamp with time zone` | DEFAULT `now()`                 | Timestamp of business creation.                                                     |
| `updated_at`    | `timestamp with time zone` | DEFAULT `now()`                 | Last update timestamp.                                                              |
| `status`        | `text`                     | NOT NULL, DEFAULT 'pending'     | Current status of the organisation: 'pending', 'approved', 'suspended', 'rejected'. |
| `deleted_at`    | `timestamp with time zone` | NULLABLE                        | Timestamp when the organisation was soft-deleted.                                   |

### 2.9 `members` Table

This table will link profiles (users) to businesses, allowing multiple users to be associated with a single organisation and defining their specific role within that organisation.

| Column Name        | Data Type                  | Constraints                           | Description                                              |
| :----------------- | :------------------------- | :------------------------------------ | :------------------------------------------------------- |
| `profile_id`       | `uuid`                     | PK, FK (`profiles.id`), NOT NULL      | The user's profile ID.                                   |
| `business_id`      | `uuid`                     | PK, FK (`organisations.id`), NOT NULL | The organisation ID.                                     |
| `role_in_business` | `text`                     | NOT NULL                              | Role within the business (e.g., 'owner', 'sales_agent'). |
| `created_at`       | `timestamp with time zone` | DEFAULT `now()`                       | Timestamp of association creation.                       |
| `updated_at`       | `timestamp with time zone` | DEFAULT `now()`                       | Last update timestamp.                                   |
| `deleted_at`       | `timestamp with time zone` | NULLABLE                              | Timestamp when the member association was soft-deleted.  |

## 3. Supabase Authentication and User Management

Supabase's built-in authentication will be leveraged for user registration, login, and session management.

- **Email/Password Authentication**: Users will register and log in using their email and a password.
- **`auth.users` table**: Supabase automatically manages user data in this table.
- **`profiles` table**: The custom `profiles` table will extend `auth.users` to store additional application-specific user data, including roles (`admin`, `owner`, `sales_agent`, `customer`).
- **JWTs**: Supabase issues JSON Web Tokens (JWTs) upon successful authentication, which will be used to authorize requests to the database via PostgREST.

## 4. Row Level Security (RLS) Policies

RLS policies are crucial for securing data access in Supabase. They will be defined for each table to ensure users can only access data they are authorized to see or modify.

### 4.1 General Principles

- **`auth.uid()`**: Used to identify the currently authenticated user.
- **`auth.jwt()`**: Used to access claims from the user's JWT, such as `user_role` (if custom claims are added).
- **`public` schema**: All application tables will reside in the `public` schema.

### 4.2 Example RLS Policies

- **`profiles` table**:
  - **Admin RLS**:
    - **SELECT**: `(auth.jwt() ->> 'user_role' = 'admin')` (Admins can view all profiles, including deleted ones).
    - **INSERT**: `(auth.jwt() ->> 'user_role' = 'admin')` (Admins can create profiles).
    - **UPDATE**: `(auth.jwt() ->> 'user_role' = 'admin')` (Admins can update any profile).
    - **DELETE**: `(auth.jwt() ->> 'user_role' = 'admin')` (Only admins can hard delete profiles).

  - **User (Self) RLS**: (Applies to all authenticated users for their own profile)
    - **SELECT**: `(deleted_at IS NULL AND (auth.uid() = id))` (Users can view their own non-deleted profile).
    - **INSERT**: `(auth.uid() = id)` (Users can create their own profile upon registration).
    - **UPDATE**: `(auth.uid() = id)` (Users can update their own profile).
    - **SOFT DELETE**: `(auth.uid() = id)` (Users can soft-delete their own profile). This will be an UPDATE operation setting `deleted_at`.

  - **Owner/Sales Agent RLS**:
    - **SELECT**: `(EXISTS (SELECT 1 FROM public.members m_auth WHERE m_auth.profile_id = auth.uid() AND m_auth.role_in_business IN ('owner', 'sales_agent') AND EXISTS (SELECT 1 FROM public.members m_target WHERE m_target.profile_id = profiles.id AND m_target.business_id = m_auth.business_id))) AND deleted_at IS NULL` (Owners/Sales Agents can view non-deleted profiles associated with their business).
    - **INSERT**: `(EXISTS (SELECT 1 FROM public.members m_auth WHERE m_auth.profile_id = auth.uid() AND m_auth.role_in_business IN ('owner', 'sales_agent') AND EXISTS (SELECT 1 FROM public.members m_target WHERE m_target.profile_id = profiles.id AND m_target.business_id = m_auth.business_id)))` (Owners/Sales Agents can create profiles associated with their business).
    - **UPDATE**: `(EXISTS (SELECT 1 FROM public.members m_auth WHERE m_auth.profile_id = auth.uid() AND m_auth.role_in_business IN ('owner', 'sales_agent') AND EXISTS (SELECT 1 FROM public.members m_target WHERE m_target.profile_id = profiles.id AND m_target.business_id = m_auth.business_id)))` (Owners/Sales Agents can update profiles associated with their business).
    - **SOFT DELETE**: `(EXISTS (SELECT 1 FROM public.members m_auth WHERE m_auth.profile_id = auth.uid() AND m_auth.role_in_business IN ('owner', 'sales_agent') AND EXISTS (SELECT 1 FROM public.members m_target WHERE m_target.profile_id = profiles.id AND m_target.business_id = m_auth.business_id)))` (Owners/Sales Agents can soft-delete profiles associated with their business).

- **`products` table**:
  - **Admin RLS**:
    - **ALL**: `(auth.jwt() ->> 'user_role' = 'admin')` (Admins have full access to all products).

  - **Owner/Sales Agent RLS**:
    - **SELECT**: `(EXISTS (SELECT 1 FROM public.members m WHERE m.profile_id = auth.uid() AND m.business_id = products.business_id AND m.role_in_business IN ('owner', 'sales_agent'))) AND deleted_at IS NULL` (Owners/Sales Agents can view non-deleted products associated with their business).
    - **INSERT**: `(EXISTS (SELECT 1 FROM public.members m WHERE m.profile_id = auth.uid() AND m.business_id = products.business_id AND m.role_in_business IN ('owner', 'sales_agent')))` (Owners/Sales Agents can add products to their business).
    - **UPDATE**: `(EXISTS (SELECT 1 FROM public.members m WHERE m.profile_id = auth.uid() AND m.business_id = products.business_id AND m.role_in_business IN ('owner', 'sales_agent')))` (Owners/Sales Agents can update products in their business).
    - **SOFT DELETE**: `(EXISTS (SELECT 1 FROM public.members m WHERE m.profile_id = auth.uid() AND m.business_id = products.business_id AND m.role_in_business IN ('owner', 'sales_agent')))` (Owners/Sales Agents can soft-delete products from their business). This will be an UPDATE operation setting `deleted_at`.

  - **Customer RLS**:
    - **SELECT**: `(auth.jwt() ->> 'user_role' = 'customer') AND deleted_at IS NULL` (Customers can view all non-deleted products).

- **`categories` table**:
  - **Admin RLS**:
    - **ALL**: `(auth.jwt() ->> 'user_role' = 'admin')` (Admins have full access to all categories).

  - **Owner/Sales Agent RLS**:
    - **SELECT**: `(EXISTS (SELECT 1 FROM public.members m WHERE m.profile_id = auth.uid() AND m.business_id = categories.business_id AND m.role_in_business IN ('owner', 'sales_agent'))) AND deleted_at IS NULL` (Owners/Sales Agents can view categories associated with their business).
    - **INSERT**: `(EXISTS (SELECT 1 FROM public.members m WHERE m.profile_id = auth.uid() AND m.business_id = categories.business_id AND m.role_in_business = 'owner'))` (Only owners can add categories to their business).
    - **UPDATE**: `(EXISTS (SELECT 1 FROM public.members m WHERE m.profile_id = auth.uid() AND m.business_id = categories.business_id AND m.role_in_business = 'owner'))` (Only owners can update categories in their business).
    - **SOFT DELETE**: `(EXISTS (SELECT 1 FROM public.members m WHERE m.profile_id = auth.uid() AND m.business_id = categories.business_id AND m.role_in_business = 'owner'))` (Only owners can soft-delete categories from their business). This will be an UPDATE operation setting `deleted_at`.

  - **Customer RLS**:
    - **SELECT**: `(auth.jwt() ->> 'user_role' = 'customer') AND deleted_at IS NULL` (Customers can view all categories).

- **`carts` table**:
  - **Customer RLS**:
    - **SELECT (Customer)**: `(auth.uid() = user_id AND carts.deleted_at IS NULL)` (Users can view their own non-deleted cart).
    - **INSERT (Customer)**: `(auth.uid() = user_id AND carts.deleted_at IS NULL)` (Users can create their own cart).
    - **UPDATE (Customer)**: `(auth.uid() = user_id AND carts.deleted_at IS NULL)` (Users can update their own cart).
    - **SOFT DELETE (Customer)**: `(auth.uid() = user_id AND carts.deleted_at IS NULL)` (Users can soft-delete their own cart). This will be an UPDATE operation setting `deleted_at`.

  - **Owner/Sales Agent RLS**:
    - **SELECT (Owner/Sales Agent)**: `(EXISTS (SELECT 1 FROM public.members m WHERE m.profile_id = auth.uid() AND m.business_id = carts.business_id AND m.role_in_business IN ('owner', 'sales_agent')) AND carts.deleted_at IS NULL)` (Owners/Sales Agents can view carts associated with their business).
    - **INSERT (Owner/Sales Agent)**: `(EXISTS (SELECT 1 FROM public.members m WHERE m.profile_id = auth.uid() AND m.business_id = carts.business_id AND m.role_in_business IN ('owner', 'sales_agent')))` (Owners/Sales Agents can create carts for their business.)
    - **UPDATE (Owner/Sales Agent)**: `(EXISTS (SELECT 1 FROM public.members m WHERE m.profile_id = auth.uid() AND m.business_id = carts.business_id AND m.role_in_business IN ('owner', 'sales_agent')))` (Owners/Sales Agents can update carts associated with their business.)
    - **SOFT DELETE (Owner/Sales Agent)**: `(EXISTS (SELECT 1 FROM public.members m WHERE m.profile_id = auth.uid() AND m.business_id = carts.business_id AND m.role_in_business IN ('owner', 'sales_agent')))` (Owners/Sales Agents can soft-delete carts associated with their business). This will be an UPDATE operation setting `deleted_at`.

- **`cart_items` table**:
  - **Customer RLS**:
    - **SELECT (Customer)**: `(EXISTS (SELECT 1 FROM public.carts WHERE id = cart_id AND user_id = auth.uid()) AND cart_items.deleted_at IS NULL)` (Users can view items in their own non-deleted cart).
    - **INSERT (Customer)**: `(EXISTS (SELECT 1 FROM public.carts WHERE id = cart_id AND user_id = auth.uid()))` (Users can add items to their own cart).
    - **UPDATE (Customer)**: `(EXISTS (SELECT 1 FROM public.carts WHERE id = cart_id AND user_id = auth.uid()))` (Users can update items in their own cart).
    - **SOFT DELETE (Customer)**: `(EXISTS (SELECT 1 FROM public.carts WHERE id = cart_id AND user_id = auth.uid()))` (Users can soft-delete items from their own cart). This will be an UPDATE operation setting `deleted_at`.

  - **Owner/Sales Agent RLS**:
    - **SELECT (Owner/Sales Agent)**: `(EXISTS (SELECT 1 FROM public.carts c JOIN public.members m ON c.business_id = m.business_id WHERE c.id = cart_id AND m.profile_id = auth.uid() AND m.role_in_business IN ('owner', 'sales_agent')) AND cart_items.deleted_at IS NULL)` (Owners/Sales Agents can view cart items for carts associated with their business).
    - **INSERT (Owner/Sales Agent)**: `(EXISTS (SELECT 1 FROM public.carts c JOIN public.members m ON c.business_id = m.business_id WHERE c.id = cart_id AND m.profile_id = auth.uid() AND m.role_in_business IN ('owner', 'sales_agent')))` (Owners/Sales Agents can manage cart items for carts associated with their business.)
    - **UPDATE (Owner/Sales Agent)**: `(EXISTS (SELECT 1 FROM public.carts c JOIN public.members m ON c.business_id = m.business_id WHERE c.id = cart_id AND m.profile_id = auth.uid() AND m.role_in_business IN ('owner', 'sales_agent')))` (Owners/Sales Agents can manage cart items for carts associated with their business.)
    - **SOFT DELETE (Owner/Sales Agent)**: `(EXISTS (SELECT 1 FROM public.carts c JOIN public.members m ON c.business_id = m.business_id WHERE c.id = cart_id AND m.profile_id = auth.uid() AND m.role_in_business IN ('owner', 'sales_agent')))` (Owners/Sales Agents can soft-delete cart items for carts associated with their business). This will be an UPDATE operation setting `deleted_at`.

- **`orders` table**:
  - **Admin RLS**:
    - **ALL**: `(auth.jwt() ->> 'user_role' = 'admin')` (Admins have full access to all orders).

  - **Owner/Sales Agent RLS**:
    - **SELECT**: `(EXISTS (SELECT 1 FROM public.members m WHERE m.profile_id = auth.uid() AND m.business_id = orders.business_id AND m.role_in_business IN ('owner', 'sales_agent'))) AND deleted_at IS NULL` (Owners/Sales Agents can view non-deleted orders associated with their business).
    - **INSERT**: `(EXISTS (SELECT 1 FROM public.members m WHERE m.profile_id = auth.uid() AND m.business_id = orders.business_id AND m.role_in_business IN ('owner', 'sales_agent')))` (Owners/Sales Agents can create orders associated with their business).
    - **UPDATE**: `(EXISTS (SELECT 1 FROM public.members m WHERE m.profile_id = auth.uid() AND m.business_id = orders.business_id AND m.role_in_business IN ('owner', 'sales_agent')))` (Owners/Sales Agents can update orders associated with their business).
    - **SOFT DELETE**: `(EXISTS (SELECT 1 FROM public.members m WHERE m.profile_id = auth.uid() AND m.business_id = orders.business_id AND m.role_in_business IN ('owner', 'sales_agent')))` (Owners/Sales Agents can soft-delete orders associated with their business).

  - **Customer RLS**:
    - **SELECT**: `(auth.uid() = user_id AND deleted_at IS NULL)` (Customers can view their own non-deleted orders).

- **`order_items` table**:
  - **Admin RLS**:
    - **ALL**: `(auth.jwt() ->> 'user_role' = 'admin')` (Admins have full access to all order items).

  - **Owner/Sales Agent RLS**:
    - **SELECT**: `(EXISTS (SELECT 1 FROM public.orders o JOIN public.members m ON o.business_id = m.business_id WHERE o.id = order_items.order_id AND m.profile_id = auth.uid() AND m.role_in_business IN ('owner', 'sales_agent')) AND order_items.deleted_at IS NULL)` (Owners/Sales Agents can view non-deleted order items associated with their business).
    - **INSERT**: `(EXISTS (SELECT 1 FROM public.orders o JOIN public.members m ON o.business_id = m.business_id WHERE o.id = order_items.order_id AND m.profile_id = auth.uid() AND m.role_in_business IN ('owner', 'sales_agent')))` (Owners/Sales Agents can create order items associated with their business).
    - **UPDATE**: `(EXISTS (SELECT 1 FROM public.orders o JOIN public.members m ON o.business_id = m.business_id WHERE o.id = order_items.order_id AND m.profile_id = auth.uid() AND m.role_in_business IN ('owner', 'sales_agent')))` (Owners/Sales Agents can update order items associated with their business).
    - **SOFT DELETE**: `(EXISTS (SELECT 1 FROM public.orders o JOIN public.members m ON o.business_id = m.business_id WHERE o.id = order_items.order_id AND m.profile_id = auth.uid() AND m.role_in_business IN ('owner', 'sales_agent')))` (Owners/Sales Agents can soft-delete order items associated with their business).

  - **Customer RLS**:
    - **SELECT**: `(EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND user_id = auth.uid()) AND order_items.deleted_at IS NULL)` (Customers can view items in their own non-deleted orders).

- **`organisations` table**:
  - **Admin RLS**:
    - **ALL**: `(auth.jwt() ->> 'user_role' = 'admin')` (Admins have full access to all organisations).

  - **Owner/Sales Agent RLS**:
    - **SELECT**: `(EXISTS (SELECT 1 FROM public.members m WHERE m.profile_id = auth.uid() AND m.business_id = organisations.id AND m.role_in_business IN ('owner', 'sales_agent'))) AND deleted_at IS NULL` (Owners/Sales Agents can view their own non-deleted organisation).
    - **UPDATE**: `(EXISTS (SELECT 1 FROM public.members m WHERE m.profile_id = auth.uid() AND m.business_id = organisations.id AND m.role_in_business IN ('owner')))` (Only owners can update their own organisation).
    - **SOFT DELETE**: `(EXISTS (SELECT 1 FROM public.members m WHERE m.profile_id = auth.uid() AND m.business_id = organisations.id AND m.role_in_business = 'owner'))` (Only owners can soft-delete their organisation).

  - **Customer RLS**:
    - **SELECT**: `(auth.jwt() ->> 'user_role' = 'customer') AND (SELECT business_id FROM profiles WHERE id = auth.uid()) = id AND deleted_at IS NULL` (Customers can view non-deleted organisations associated with their business_id).

- **`members` table**:
  - **Admin RLS**:
    - **ALL**: `(auth.jwt() ->> 'user_role' = 'admin')` (Admins have full access to all organisation memberships).

  - **Owner RLS**:
    - **SELECT**: `(EXISTS (SELECT 1 FROM public.members m WHERE m.profile_id = auth.uid() AND m.business_id = members.business_id AND m.role_in_business = 'owner')) AND deleted_at IS NULL` (Owners can view non-deleted members within their business).
    - **INSERT**: `(EXISTS (SELECT 1 FROM public.members m WHERE m.profile_id = auth.uid() AND m.business_id = members.business_id AND m.role_in_business = 'owner'))` (Owners can create members within their business).
    - **UPDATE**: `(EXISTS (SELECT 1 FROM public.members m WHERE m.profile_id = auth.uid() AND m.business_id = members.business_id AND m.role_in_business = 'owner'))` (Owners can update members within their business).
    - **SOFT DELETE**: `(EXISTS (SELECT 1 FROM public.members m WHERE m.profile_id = auth.uid() AND m.business_id = members.business_id AND m.role_in_business = 'owner'))` (Owners can soft-delete members within their business).

  - **Sales Agent RLS**:
    - **SELECT**: `(EXISTS (SELECT 1 FROM public.members m WHERE m.profile_id = auth.uid() AND m.business_id = members.business_id AND m.role_in_business = 'sales_agent')) AND deleted_at IS NULL` (Sales agents can view non-deleted members within their business).

  - **Customer RLS**:
    - **SELECT**: `profile_id = auth.uid() AND deleted_at IS NULL` (Customers can view their own non-deleted membership record).

## 5. Supabase Auto-Generated APIs (PostgREST)

Supabase automatically generates RESTful APIs for all tables and views in the database using PostgREST. This will be the primary method for frontend applications to interact with the backend.

- **Direct Table Access**: CRUD operations (SELECT, INSERT, UPDATE, DELETE) will be performed directly against the table endpoints (e.g., `/rest/v1/products`).
- **Filtering and Sorting**: PostgREST supports powerful filtering, sorting, and pagination directly via URL parameters (e.g., `/rest/v1/products?price=gt.10&order=name.asc`).
- **Relationships**: Joins between tables can be performed using `select` parameters (e.g., `/rest/v1/carts?select=*,cart_items(*)`).
- **RPC for Stored Procedures**: For more complex logic (e.g., creating an order from a cart, which might involve multiple table updates and inventory deductions), PostgreSQL stored procedures (functions) will be created and exposed via RPC endpoints (e.g., `/rest/v1/rpc/create_order_from_cart`).

## 6. API Endpoints Definition (via Supabase PostgREST)

The following outlines the conceptual API endpoints and their corresponding Supabase operations.

### 6.1 Product Catalog Endpoints

- **List Products**:
  - **Method**: `GET`
  - **Path**: `/products`
  - **Supabase Operation**: `supabase.from('products').select('*')`
  - **Description**: Retrieves a list of products. Customers see only 'published' products. Admins, owners, and vendors can view all products associated with their business, regardless of status. Supports filtering (e.g., by category, price range), searching (via `ilike` or full-text search if configured), and pagination.
- **Get Product Details**:
  - **Method**: `GET`
  - **Path**: `/products/{id}`
  - **Supabase Operation**: `supabase.from('products').select('*').eq('id', id).single()`
  - **Description**: Retrieves details for a specific product by its ID.
- **Search Products**:
  - **Method**: `GET`
  - **Path**: `/products?name=ilike.*{query}*` (or similar for full-text search)
  - **Supabase Operation**: `supabase.from('products').select('*').ilike('name', `%${query}%`)`
  - **Description**: Searches products by name or description.

### 6.2 Order Management Endpoints

- **Add Item to Cart**:
  - **Method**: `POST`
  - **Path**: `/cart_items`
  - **Supabase Operation**: `supabase.from('cart_items').insert({...})`
  - **Description**: Adds a product to the user's shopping cart.
- **Update Cart Item Quantity**:
  - **Method**: `PATCH`
  - **Path**: `/cart_items?id=eq.{id}`
  - **Supabase Operation**: `supabase.from('cart_items').update({quantity: new_quantity}).eq('id', id)`
  - **Description**: Updates the quantity of a product in the user's cart.
- **Remove Item from Cart**:
  - **Method**: `DELETE`
  - **Path**: `/cart_items?id=eq.{id}`
  - **Supabase Operation**: `supabase.from('cart_items').delete().eq('id', id)`
  - **Description**: Removes a product from the user's cart.
- **Get User's Cart**:
  - **Method**: `GET`
  - **Path**: `/carts?select=*,cart_items(*)`
  - **Supabase Operation**: `supabase.from('carts').select('*,cart_items(*)').eq('user_id', auth.uid()).single()`
  - **Description**: Retrieves the current user's shopping cart with all its items.
- **Create Order from Cart (Customer)**:
  - **Method**: `POST`
  - **Path**: `/rpc/create_customer_order_from_cart` (via a Supabase function)
  - **Supabase Operation**: `supabase.rpc('create_customer_order_from_cart', { cart_id: '...' })`
  - **Description**: Converts the current user's cart into a new order, deducting inventory.
- **List User's Orders (History)**:
  - **Method**: `GET`
  - **Path**: `/orders?user_id=eq.{user_id}&select=*,order_items(*)`
  - **Supabase Operation**: `supabase.from('orders').select('*,order_items(*)').eq('user_id', auth.uid()).order('created_at', { ascending: false })`
  - **Description**: Retrieves a list of all orders placed by the current user.
- **Get Order Details**:
  - **Method**: `GET`
  - **Path**: `/orders/{id}?select=*,order_items(*)`
  - **Supabase Operation**: `supabase.from('orders').select('*,order_items(*)').eq('id', id).single()`
  - **Description**: Retrieves detailed information for a specific order.

### 6.3 User/Customer Management Endpoints

- **Get User Profile**:
  - **Method**: `GET`
  - **Path**: `/profiles?id=eq.{user_id}`
  - **Supabase Operation**: `supabase.from('profiles').select('*').eq('id', auth.uid()).single()`
  - **Description**: Retrieves the current user's profile information.
- **Update User Profile**:
  - **Method**: `PATCH`
  - **Path**: `/profiles?id=eq.{user_id}`
  - **Supabase Operation**: `supabase.from('profiles').update({...}).eq('id', auth.uid())`
  - **Description**: Updates the current user's profile information.
- **Manage Business (CRUD)**:
  - **Method**: `GET`, `POST`, `PATCH`, `DELETE`
  - **Path**: `/organisations` (for list/add), `/organisations?id=eq.{id}` (for update/delete)
  - **Supabase Operation**: `supabase.from('organisations').select('*').eq('profile_id', auth.uid())`, `supabase.from('organisations').insert({...})`, etc.
  - **Description**: Allows users to manage their associated organisation information.
- **List All Customers (Admin)**:
  - **Method**: `GET`
  - **Path**: `/profiles?role=eq.customer`
  - **Supabase Operation**: `supabase.from('profiles').select('*').eq('role', 'customer')`
  - **Description**: Retrieves a list of all customer profiles. (Requires Admin, owner, or sales_agent role via RLS for data associated with their respective businesses).
- **Get customer Details (Admin)**:
  - **Method**: `GET`
  - **Path**: `/profiles/{id}`
  - **Supabase Operation**: `supabase.from('profiles').select('*').eq('id', id).single()`
  - **Description**: Retrieves details for a specific customer. (Requires Admin, owner, or sales_agent role via RLS for data associated with their respective businesses).
- **Add/Edit Customer Account (Admin)**:
  - **Method**: `POST`, `PATCH`
  - **Path**: `/profiles` (for add), `/profiles?id=eq.{id}` (for edit)
  - **Supabase Operation**: `supabase.from('profiles').insert({...})`, `supabase.from('profiles').update({...}).eq('id', id)`
  - **Description**: Allows admins, owners, or sales_agents to add new customer accounts or edit existing ones for data associated with their respective businesses. (Requires Admin, owner, or sales_agent role via RLS).

### 6.4 Reporting & Analytics Endpoints (Admin/Owner)

To address the reporting requirements from the B2B PRD, the following conceptual endpoints will be created. These will likely be implemented as PostgreSQL functions and exposed via RPC.

- **Get Sales Report**:
  - **Method**: `POST`
  - **Path**: `/rpc/generate_sales_report`
  - **Supabase Operation**: `supabase.rpc('generate_sales_report', { date_range: '...' })`
  - **Description**: Generates a sales report for a given period. (Requires Admin/Owner role via RLS).
- **Get Inventory Report**:
  - **Method**: `GET`
  - **Path**: `/rpc/generate_inventory_report`
  - **Supabase Operation**: `supabase.rpc('generate_inventory_report')`
  - **Description**: Generates a report of current inventory levels. (Requires Admin/Owner role via RLS).
  - **Method**: `POST`, `PATCH`
  - **Path**: `/profiles` (for add), `/profiles?id=eq.{id}` (for edit)
  - **Supabase Operation**: `supabase.from('profiles').insert({...})`, `supabase.from('profiles').update({...}).eq('id', id)`
  - **Description**: Allows admins to add new customer accounts or edit existing ones. (Requires Admin role via RLS).
- **List Inventory Levels (Admin)**:
  - **Method**: `GET`
  - **Path**: `/products?select=id,name,stock_quantity`
  - **Supabase Operation**: `supabase.from('products').select('id,name,stock_quantity')`
  - **Description**: Retrieves current stock levels for all products. (Requires Admin, owner, or sales_agent role via RLS for data associated with their respective businesses).
- **Adjust Inventory Levels (Admin)**:
  - **Method**: `PATCH`
  - **Path**: `/products?id=eq.{id}`
  - **Supabase Operation**: `supabase.from('products').update({stock_quantity: new_quantity}).eq('id', id)`
  - **Description**: Allows admins, owners, or sales_agents to adjust the stock quantity of a product for data associated with their respective businesses. (Requires Admin, owner, or sales_agent role via RLS).

### 6.5 Organisation Management Endpoints (Admin)

These endpoints allow administrators to manage organisation accounts and their statuses, particularly for those acting as vendors.

- **Update Organisation Status**:
  - **Method**: `PATCH`
  - **Path**: `/organisations?id=eq.{id}`
  - **Supabase Operation**: `supabase.from('organisations').update({status: new_status}).eq('id', id)`
  - **Description**: Changes an organisation's status (e.g., 'approved', 'suspended', 'rejected'). (Requires Admin role via RLS).
- **List All Organisations**:
  - **Method**: `GET`
  - **Path**: `/organisations`
  - **Supabase Operation**: `supabase.from('organisations').select('*')`
  - **Description**: Retrieves a list of all organisation profiles. (Requires Admin role via RLS).
- **Get Organisation Details**:
  - **Method**: `GET`
  - **Path**: `/organisations/{id}`
  - **Supabase Operation**: `supabase.from('organisations').select('*').eq('id', id).single()`
  - **Description**: Retrieves details for a specific organisation. (Requires Admin role via RLS).
