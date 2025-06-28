# High-Level Backend API Design (MVP) - Supabase Focused

This document outlines the high-level backend API design for the Gouda project, leveraging Supabase as the primary backend-as-a-service. It covers the initial database schema, core entities, authentication, Row Level Security (RLS) policies, and the planned use of Supabase's auto-generated APIs (PostgREST).

## 1. Supabase Project Setup and Local Development Environment

### 1.1 Supabase Project Initialization

A new Supabase project will be created via the Supabase dashboard. This project will serve as the central backend for both the Buyer and Administrative applications.

### 1.2 Local Development Environment Setup (via Docker)

For local development, the Supabase CLI and Docker will be used to run a local instance of the Supabase stack.

**Steps to set up local environment:**

1.  **Install Supabase CLI**:
    ```bash
    brew install supabase/supabase/supabase # macOS
    # or via npm
    npm install -g supabase
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

| Column Name  | Data Type                  | Constraints               | Description                                  |
| :----------- | :------------------------- | :------------------------ | :------------------------------------------- |
| `id`         | `uuid`                     | PK, FK (`auth.users.id`)  | Primary key, links to Supabase Auth user ID. |
| `username`   | `text`                     | UNIQUE, NOT NULL          | User's chosen username.                      |
| `full_name`  | `text`                     | NULLABLE                  | User's full name.                            |
| `avatar_url` | `text`                     | NULLABLE                  | URL to user's avatar image.                  |
| `role`       | `text`                     | NOT NULL, DEFAULT 'buyer' | User role: 'buyer', 'admin', 'seller_agent'. |
| `created_at` | `timestamp with time zone` | DEFAULT `now()`           | Timestamp of profile creation.               |

### 2.2 `products` Table

Stores information about products available in the catalog.

| Column Name      | Data Type                  | Constraints                     | Description                      |
| :--------------- | :------------------------- | :------------------------------ | :------------------------------- |
| `id`             | `uuid`                     | PK, DEFAULT `gen_random_uuid()` | Unique product identifier.       |
| `name`           | `text`                     | NOT NULL                        | Product name.                    |
| `description`    | `text`                     | NULLABLE                        | Detailed product description.    |
| `price`          | `numeric`                  | NOT NULL                        | Unit price of the product.       |
| `image_url`      | `text`                     | NULLABLE                        | URL to product image.            |
| `category_id`    | `uuid`                     | FK (`categories.id`)            | Category the product belongs to. |
| `stock_quantity` | `integer`                  | NOT NULL, DEFAULT 0             | Current stock level.             |
| `created_at`     | `timestamp with time zone` | DEFAULT `now()`                 | Timestamp of product creation.   |
| `updated_at`     | `timestamp with time zone` | DEFAULT `now()`                 | Last update timestamp.           |

### 2.3 `categories` Table

Stores product categories.

| Column Name  | Data Type                  | Constraints                     | Description                               |
| :----------- | :------------------------- | :------------------------------ | :---------------------------------------- |
| `id`         | `uuid`                     | PK, DEFAULT `gen_random_uuid()` | Unique category identifier.               |
| `name`       | `text`                     | UNIQUE, NOT NULL                | Category name (e.g., 'Dairy', 'Produce'). |
| `created_at` | `timestamp with time zone` | DEFAULT `now()`                 | Timestamp of category creation.           |

### 2.4 `carts` Table

Represents a user's shopping cart.

| Column Name  | Data Type                  | Constraints                     | Description                 |
| :----------- | :------------------------- | :------------------------------ | :-------------------------- |
| `id`         | `uuid`                     | PK, DEFAULT `gen_random_uuid()` | Unique cart identifier.     |
| `user_id`    | `uuid`                     | FK (`profiles.id`), NOT NULL    | The user who owns the cart. |
| `created_at` | `timestamp with time zone` | DEFAULT `now()`                 | Timestamp of cart creation. |
| `updated_at` | `timestamp with time zone` | DEFAULT `now()`                 | Last update timestamp.      |

### 2.5 `cart_items` Table

Items within a shopping cart.

| Column Name            | Data Type                  | Constraints                     | Description                          |
| :--------------------- | :------------------------- | :------------------------------ | :----------------------------------- |
| `id`                   | `uuid`                     | PK, DEFAULT `gen_random_uuid()` | Unique cart item identifier.         |
| `cart_id`              | `uuid`                     | FK (`carts.id`), NOT NULL       | The cart this item belongs to.       |
| `product_id`           | `uuid`                     | FK (`products.id`), NOT NULL    | The product in the cart.             |
| `quantity`             | `integer`                  | NOT NULL, DEFAULT 1             | Quantity of the product.             |
| `price_at_time_of_add` | `numeric`                  | NOT NULL                        | Price of product when added to cart. |
| `created_at`           | `timestamp with time zone` | DEFAULT `now()`                 | Timestamp of item addition.          |

### 2.6 `orders` Table

Represents a placed order.

| Column Name        | Data Type                  | Constraints                     | Description                                                                 |
| :----------------- | :------------------------- | :------------------------------ | :-------------------------------------------------------------------------- |
| `id`               | `uuid`                     | PK, DEFAULT `gen_random_uuid()` | Unique order identifier.                                                    |
| `user_id`          | `uuid`                     | FK (`profiles.id`), NOT NULL    | The user who placed the order.                                              |
| `total_amount`     | `numeric`                  | NOT NULL                        | Total amount of the order.                                                  |
| `status`           | `text`                     | NOT NULL, DEFAULT 'pending'     | Order status: 'pending', 'processing', 'shipped', 'delivered', 'cancelled'. |
| `shipping_address` | `text`                     | NOT NULL                        | Shipping address for the order.                                             |
| `created_at`       | `timestamp with time zone` | DEFAULT `now()`                 | Timestamp of order creation.                                                |
| `updated_at`       | `timestamp with time zone` | DEFAULT `now()`                 | Last update timestamp.                                                      |

### 2.7 `order_items` Table

Items within an order.

| Column Name              | Data Type                  | Constraints                     | Description                             |
| :----------------------- | :------------------------- | :------------------------------ | :-------------------------------------- |
| `id`                     | `uuid`                     | PK, DEFAULT `gen_random_uuid()` | Unique order item identifier.           |
| `order_id`               | `uuid`                     | FK (`orders.id`), NOT NULL      | The order this item belongs to.         |
| `product_id`             | `uuid`                     | FK (`products.id`), NOT NULL    | The product in the order.               |
| `quantity`               | `integer`                  | NOT NULL                        | Quantity of the product.                |
| `price_at_time_of_order` | `numeric`                  | NOT NULL                        | Price of product when order was placed. |
| `created_at`             | `timestamp with time zone` | DEFAULT `now()`                 | Timestamp of item addition to order.    |

### 2.8 `addresses` Table

Stores user shipping addresses.

| Column Name     | Data Type                  | Constraints                     | Description                                 |
| :-------------- | :------------------------- | :------------------------------ | :------------------------------------------ |
| `id`            | `uuid`                     | PK, DEFAULT `gen_random_uuid()` | Unique address identifier.                  |
| `user_id`       | `uuid`                     | FK (`profiles.id`), NOT NULL    | The user who owns this address.             |
| `address_line1` | `text`                     | NOT NULL                        | Street address line 1.                      |
| `address_line2` | `text`                     | NULLABLE                        | Street address line 2.                      |
| `city`          | `text`                     | NOT NULL                        | City.                                       |
| `state`         | `text`                     | NOT NULL                        | State/Province.                             |
| `postal_code`   | `text`                     | NOT NULL                        | Postal code.                                |
| `country`       | `text`                     | NOT NULL                        | Country.                                    |
| `is_default`    | `boolean`                  | DEFAULT FALSE                   | Whether this is the user's default address. |
| `created_at`    | `timestamp with time zone` | DEFAULT `now()`                 | Timestamp of address creation.              |
| `updated_at`    | `timestamp with time zone` | DEFAULT `now()`                 | Last update timestamp.                      |

## 3. Supabase Authentication and User Management

Supabase's built-in authentication will be leveraged for user registration, login, and session management.

- **Email/Password Authentication**: Users will register and log in using their email and a password.
- **`auth.users` table**: Supabase automatically manages user data in this table.
- **`profiles` table**: The custom `profiles` table will extend `auth.users` to store additional application-specific user data, including roles (`buyer`, `admin`, `seller_agent`).
- **JWTs**: Supabase issues JSON Web Tokens (JWTs) upon successful authentication, which will be used to authorize requests to the database via PostgREST.

## 4. Row Level Security (RLS) Policies

RLS policies are crucial for securing data access in Supabase. They will be defined for each table to ensure users can only access data they are authorized to see or modify.

### 4.1 General Principles

- **`auth.uid()`**: Used to identify the currently authenticated user.
- **`auth.jwt()`**: Used to access claims from the user's JWT, such as `user_role` (if custom claims are added).
- **`public` schema**: All application tables will reside in the `public` schema.

### 4.2 Example RLS Policies

- **`profiles` table**:

  - **SELECT**: `(auth.uid() = id)` (Users can view their own profile) OR `(auth.jwt() ->> 'user_role' = 'admin')` (Admins can view all profiles).
  - **INSERT**: `(auth.uid() = id)` (Users can create their own profile upon registration).
  - **UPDATE**: `(auth.uid() = id)` (Users can update their own profile) OR `(auth.jwt() ->> 'user_role' = 'admin')` (Admins can update any profile).
  - **DELETE**: `(auth.jwt() ->> 'user_role' = 'admin')` (Only admins can delete profiles).

- **`products` table**:

  - **SELECT**: `true` (All users can view products).
  - **INSERT**: `(auth.jwt() ->> 'user_role' = 'admin')` (Only admins can add products).
  - **UPDATE**: `(auth.jwt() ->> 'user_role' = 'admin')` (Only admins can update products).
  - **DELETE**: `(auth.jwt() ->> 'user_role' = 'admin')` (Only admins can delete products).

- **`categories` table**:

  - **SELECT**: `true` (All users can view categories).
  - **INSERT/UPDATE/DELETE**: `(auth.jwt() ->> 'user_role' = 'admin')` (Only admins can manage categories).

- **`carts` table**:

  - **SELECT**: `(auth.uid() = user_id)` (Users can view their own cart).
  - **INSERT**: `(auth.uid() = user_id)` (Users can create their own cart).
  - **UPDATE**: `(auth.uid() = user_id)` (Users can update their own cart).
  - **DELETE**: `(auth.uid() = user_id)` (Users can delete their own cart).

- **`cart_items` table**:

  - **SELECT**: `(EXISTS (SELECT 1 FROM public.carts WHERE id = cart_id AND user_id = auth.uid()))` (Users can view items in their own cart).
  - **INSERT/UPDATE/DELETE**: `(EXISTS (SELECT 1 FROM public.carts WHERE id = cart_id AND user_id = auth.uid()))` (Users can manage items in their own cart).

- **`orders` table**:

  - **SELECT**: `(auth.uid() = user_id)` (Buyers can view their own orders) OR `(auth.jwt() ->> 'user_role' = 'admin')` OR `(auth.jwt() ->> 'user_role' = 'seller_agent')` (Admins/Seller Agents can view all orders).
  - **INSERT**: `(auth.uid() = user_id)` (Buyers can create their own orders) OR `(auth.jwt() ->> 'user_role' = 'seller_agent')` (Seller agents can create orders for buyers).
  - **UPDATE**: `(auth.jwt() ->> 'user_role' = 'admin')` OR `(auth.jwt() ->> 'user_role' = 'seller_agent')` (Only admins/seller agents can update order status).
  - **DELETE**: `(auth.jwt() ->> 'user_role' = 'admin')` (Only admins can delete orders).

- **`order_items` table**:

  - **SELECT**: `(EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND user_id = auth.uid()))` (Users can view items in their own orders) OR `(auth.jwt() ->> 'user_role' = 'admin')` OR `(auth.jwt() ->> 'user_role' = 'seller_agent')` (Admins/Seller Agents can view all order items).
  - **INSERT/UPDATE/DELETE**: `(auth.jwt() ->> 'user_role' = 'admin')` OR `(auth.jwt() ->> 'user_role' = 'seller_agent')` (Only admins/seller agents can manage order items).

- **`addresses` table**:
  - **SELECT**: `(auth.uid() = user_id)` (Users can view their own addresses) OR `(auth.jwt() ->> 'user_role' = 'admin')` (Admins can view all addresses).
  - **INSERT**: `(auth.uid() = user_id)` (Users can add their own addresses).
  - **UPDATE**: `(auth.uid() = user_id)` (Users can update their own addresses).
  - **DELETE**: `(auth.uid() = user_id)` (Users can delete their own addresses).

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
  - **Description**: Retrieves a list of all products. Supports filtering (e.g., by category, price range), searching (via `ilike` or full-text search if configured), and pagination.
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
- **Create Order from Cart**:
  - **Method**: `POST`
  - **Path**: `/rpc/create_order_from_cart` (via a Supabase function)
  - **Supabase Operation**: `supabase.rpc('create_order_from_cart', { cart_id: '...' })`
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
- **Update Order Status (Admin/Seller Agent)**:
  - **Method**: `PATCH`
  - **Path**: `/orders?id=eq.{id}`
  - **Supabase Operation**: `supabase.from('orders').update({status: new_status}).eq('id', id)`
  - **Description**: Updates the status of an order. (Requires Admin/Seller Agent role via RLS).
- **Create Order for Buyer (Seller Agent)**:
  - **Method**: `POST`
  - **Path**: `/rpc/create_order_for_buyer` (via a Supabase function)
  - **Supabase Operation**: `supabase.rpc('create_order_for_buyer', { buyer_id: '...', product_items: [...] })`
  - **Description**: Allows a seller agent to create an order on behalf of a specific buyer.

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
- **Manage Shipping Addresses (CRUD)**:
  - **Method**: `GET`, `POST`, `PATCH`, `DELETE`
  - **Path**: `/addresses` (for list/add), `/addresses?id=eq.{id}` (for update/delete)
  - **Supabase Operation**: `supabase.from('addresses').select('*').eq('user_id', auth.uid())`, `supabase.from('addresses').insert({...})`, etc.
  - **Description**: Allows users to manage their saved shipping addresses.
- **List All Buyers (Admin)**:
  - **Method**: `GET`
  - **Path**: `/profiles?role=eq.buyer`
  - **Supabase Operation**: `supabase.from('profiles').select('*').eq('role', 'buyer')`
  - **Description**: Retrieves a list of all buyer profiles. (Requires Admin role via RLS).
- **Get Buyer Details (Admin)**:
  - **Method**: `GET`
  - **Path**: `/profiles/{id}`
  - **Supabase Operation**: `supabase.from('profiles').select('*').eq('id', id).single()`
  - **Description**: Retrieves details for a specific buyer. (Requires Admin role via RLS).
- **Add/Edit Buyer Account (Admin)**:
  - **Method**: `POST`, `PATCH`
  - **Path**: `/profiles` (for add), `/profiles?id=eq.{id}` (for edit)
  - **Supabase Operation**: `supabase.from('profiles').insert({...})`, `supabase.from('profiles').update({...}).eq('id', id)`
  - **Description**: Allows admins to add new buyer accounts or edit existing ones. (Requires Admin role via RLS).
- **List Inventory Levels (Admin)**:
  - **Method**: `GET`
  - **Path**: `/products?select=id,name,stock_quantity`
  - **Supabase Operation**: `supabase.from('products').select('id,name,stock_quantity')`
  - **Description**: Retrieves current stock levels for all products. (Requires Admin role via RLS).
- **Adjust Inventory Levels (Admin)**:
  - **Method**: `PATCH`
  - **Path**: `/products?id=eq.{id}`
  - **Supabase Operation**: `supabase.from('products').update({stock_quantity: new_quantity}).eq('id', id)`
  - **Description**: Allows admins to adjust the stock quantity of a product. (Requires Admin role via RLS).
