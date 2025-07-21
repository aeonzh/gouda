# Agent Guidelines for Gouda Project

This document outlines essential commands and code style guidelines for agents working on the Gouda project.

## Build/Lint/Test Commands

- **Start Development Server**:
  - For `apps/b2b`: `pnpm b2b` (runs on `http://localhost:8081`)
  - For `apps/b2c`: `pnpm b2c` (runs on `http://localhost:8080`)
- **Lint Code**: `pnpm run lint`
- **Format Code**: `pnpm run format`
- **Testing**: No explicit test command found in `package.json`. Testing framework and single test execution commands depend on the chosen testing setup (e.g., Jest).

## Code Style Guidelines

- **Language**: TypeScript for strong typing and improved code quality.
- **Formatting**: Enforced by Prettier. Run `pnpm run format` to auto-format code.
- **Linting**: Enforced by ESLint with `eslint-config-universe`. Run `pnpm run lint` to check for linting issues.
- **Imports**: Follow ESLint import order rules. Prefer absolute imports for project modules.
- **Naming Conventions**:
  - Variables and functions: `camelCase`
  - React Components and Types: `PascalCase`
  - Constants: `UPPER_SNAKE_CASE`
- **Error Handling**: Use standard `try-catch` blocks for synchronous operations and handle Promise rejections for asynchronous code.
- **Styling**: Utilize NativeWind and Tailwind CSS for a utility-first approach.

## AI-Specific Rules

- If present, include rules from:
  - `.cursor/rules/`
  - `.cursorrules`
  - `.github/*-instructions.md`
  - `.roo/rules/`
  - `.kilocode/rules/`

## Other instructions

- When requested to commit a change, generate a commit message that is relevant to the staged files following the conventional commits format. Always show the commit message and let the user review it before commit.
- This is a monorepo, so adding packages to the root will always require `-w`.
- Always look for information from the source of truth and not infere from surrounding context. e.g. When I ask "do we have a `business_details` table?" The answer should come from the database schema and not from the surrounding code, which could be outdated.

## Memories

Always save memories in this file.

Make sure that before each session you check the current status in JOURNAL.md.
Every time we make a decision or a change or I say "Update journal" record that into JOURNAL.md explaining what changes have been made, or what decisions have been made along with the rationale that brought us there. Be concise, but also explain:

- what root cause or reason of the change
- how the change addresses the root cause
- why the change addresses the root cause

Journal entries should be in a chronological order.
The result at the end of each session should be a track record of our progress for future use.

At the same time, keep this file updated with a summary of the end-state we reached. As a quick reference of the current state, this state does not require to have the rationale included with it

## Project Details

### Project Overview

- Multi-vendor e-commerce system.
- Two mobile applications: Customer (B2C) and Administrative (B2B).
- Both built with React Native, Expo, NativeWind.
- Backend: Supabase (PostgreSQL, PostgREST, Auth, Storage).
- Monorepo structure.

### Key Entities and Database Schema (Supabase)

- `profiles`: Extends `auth.users`, stores `username`, `full_name`, `avatar_url`, `role` (`admin`, `user`).
- `products`: `id`, `business_id`, `name`, `description`, `status` (`draft`, `published`, `rejected`), `price`, `image_url`, `category_id`, `stock_quantity`.
- `categories`: `id`, `business_id`, `name`.
- `carts`: `id`, `user_id`, `business_id`.
- `cart_items`: `id`, `cart_id`, `product_id`, `quantity`, `price_at_time_of_add`.
- `orders`: `id`, `user_id`, `business_id`, `total_amount`, `status` (`pending`, `processing`, `completed`, `cancelled`).
- `order_items`: `id`, `order_id`, `product_id`, `quantity`, `price_at_time_of_order`.
- `organisations`: `id`, `name`, `address`, `status` (`pending`, `approved`, `suspended`, `rejected`).
- `members`: `profile_id`, `business_id`, `role_in_business` (`owner`, `sales_agent`, `customer`).

### Authentication

- Supabase built-in Email/Password authentication.
- JWTs for authorization.

### Row Level Security (RLS)

- Crucial for data access control.
- Policies defined for each table based on `auth.uid()`, `auth.jwt()`, and `members` table.
- Global `admin` role has full access.
- `owner` role is the business-specific admin.

### API Interaction

- Supabase auto-generated APIs (PostgREST) for CRUD operations.
- RPC for complex logic via PostgreSQL stored procedures.

### Project Plan

- Detailed plan already exists in `docs/project_plan.md` with phases, tasks, and subtasks. I should follow this plan.

## Current State Summary

This section provides a quick reference of the current end-state of the project, without detailed rationale.

### apps/b2b/

The `apps/b2b/` directory contains a React Native Expo application.
It uses NativeWind for styling.
The application has the following main screens/features:

- **Authentication**: Login screen (`(auth)/login.tsx`) using `shared/api/supabase` for authentication. Admin login UI and API integration are implemented.
- **Tabs**:
  - **Dashboard**: `(tabs)/index.tsx` (currently a placeholder).
  - **Products**: `(tabs)/products.tsx` for product management (list, edit, delete) using `shared/api/products`. It also has `products/manage.tsx` for adding/editing products. Admin product list, add/edit product, product category management, and product deletion functionalities are implemented.
  - **Orders**: `(tabs)/orders.tsx` for order management (list) using `shared/api/orders`. It also has `orders/[id].tsx` for order details and `orders/create.tsx` for creating orders on behalf of customers. Admin order list, order details, update order status, and create order for customer functionalities are implemented.
  - **Inventory**: `(tabs)/inventory.tsx` for inventory management (list, adjust stock) using `shared/api/products`. Inventory list and adjust inventory functionalities are implemented.
- **Navigation**: Uses `expo-router` (updated to `5.1.3`) for navigation. The routing issue where clicking a tab redirected back to the main tab has been fixed by modifying `apps/b2b/app/_layout.tsx` to prevent constant redirection. Header configurations for tab screens have been refactored and the 'Customers' tab has been removed.
- **Shared components**: Imports components and APIs from `shared/` package.
- **Authentication Flow**: The `_layout.tsx` at the root of `apps/b2b/app/` handles session management and redirects based on user roles (`admin` or `sales_agent`).

### apps/b2c/

The `apps/b2c/` directory contains a React Native Expo application.
It uses NativeWind for styling.
The application has the following main screens/features:

- **Authentication**: Login, Sign Up, and Forgot Password screens (`(auth)/login.tsx`, `(auth)/signup.tsx`, `(auth)/forgot-password.tsx`) using `packages/shared/api/supabase` for authentication. Login, Sign Up, Forgot Password screens, API integration, and session management are implemented. The authentication routing issue, where unauthenticated users were not consistently redirected to `/login`, has been fixed by adjusting the `SplashScreen.hideAsync()` call in `apps/b2c/app/_layout.tsx` to prevent race conditions.
- **Tabs**:
  - **Home**: `(tabs)/index.tsx` now displays a list of authorized vendors for the logged-in user, with search/filter functionality and navigation to vendor product pages. This was implemented using a `VendorCard` component and fetching data via `getAuthorizedBusinesses` from `packages/shared/api/organisations`.
  - **Products**: `(tabs)/products.tsx` for product browsing, search, and filtering using `packages/shared/api/products`. Product details are shown in `products/[id].tsx`. Product listing/catalog, search/filtering, and product details are implemented.
  - **Orders**: `(tabs)/orders.tsx` for viewing order history. Order details are shown in `orders/[id].tsx`. Uses `packages/shared/api/orders`. Order history list and order details are implemented.
  - **Cart**: `cart.tsx` for managing the shopping cart. Uses `packages/shared/api/products` and `packages/shared/api/supabase`. Shopping cart screen, add/remove/update quantity logic, create order button, and order confirmation screen are implemented.
  - **Profile**: `(tabs)/profile.tsx` which includes `profile/index.tsx` for viewing profile, `profile/edit.tsx` for editing profile, and `profile/addresses.tsx` for managing addresses. Uses `packages/shared/api/profiles`. My Account/Profile screen, profile data fetching/update, and Saved Addresses screen are implemented.
- **Order Confirmation**: `order-confirmation.tsx` displays order confirmation after an order is placed.
- **Navigation**: Uses `expo-router` (updated to `5.1.3`) for navigation. The root `_layout.tsx` file has been created to handle session management and redirects. The 'Profile' tab has been reordered to be the last tab.
- **Shared components**: Imports components and APIs from `packages/shared/`.

### packages/shared/

The `packages/shared/` directory contains shared code, including API clients and UI components, used by both `b2b` and `b2c` applications.

#### `api/`

- **`customers.ts`**: Contains functions for managing customer profiles, including `createCustomer`, `getAllCustomers`, `getCustomerById`, and `updateCustomer`.
- **`orders.ts`**: Contains functions for managing carts and orders, including `getOrCreateCart`, `addOrUpdateCartItem`, `removeCartItem`, `updateCartItemQuantity`, `getCartItems`, `createOrderFromCart`, `getCustomerOrderHistory`, `getOrderDetails`, `updateOrderStatus`, and `createOrderForCustomer`.
- **`organisations.ts`**: Contains functions for managing organisations, including `getAuthorizedBusinesses` and `getCustomerBusinessId`.
- **`products.ts`**: Contains functions for managing products and categories, including `getProducts`, `getProductById`, `createProduct`, `updateProduct`, `deleteProduct`, `getCategories`, `createCategory`, `updateCategory`, `deleteCategory`, `getInventoryLevels`, and `adjustInventoryLevel`.
- **`profiles.ts`**: Contains functions for managing user profiles, including `getProfile` and `updateProfile`.
- **`supabase.ts`**: Initializes the Supabase client and provides authentication functions like `signUpWithEmail`, `signInWithEmail`, `resetPasswordForEmail`, and `signOut`. The `AuthContext`, `AuthProvider`, and `useAuth` hook definitions have been moved to `packages/shared/components/AuthProvider.tsx` to resolve JSX parsing errors in `.ts` files.

#### `components/`

- **`AuthProvider.tsx`**: New file containing `AuthContext`, `AuthProvider` component, and `useAuth` hook for centralized authentication state management.
- **`Button.tsx`**: A reusable button component with loading states and variants.
- **`Input.tsx`**: A reusable input component with labels and various keyboard types.

### Other

- `index.ts`: Entry point for the shared package. Now exports `AuthProvider`.
- `nativewind-env.d.ts`: NativeWind type definitions.
- `package.json`: Package metadata and dependencies.
- `tsconfig.json`: TypeScript configuration for the shared package.

### Supabase RLS Policies

- All RLS policies for `public.profiles`, `public.products`, `public.categories`, `public.carts`, `public.cart_items`, `public.orders`, `public.order_items`, `public.organisations`, and `public.members` tables have been consolidated into a single migration file (`supabase/migrations/20250713000002_add_rls_policies.sql`) to improve performance and remove redundant policies.
