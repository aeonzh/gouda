# Context Document: Gouda E-Commerce Platform

## Current Work Focus

Recent changes: Introduced a lazy Supabase client getter `getSupabase()` in `packages/shared/api/supabase.ts` to avoid eager initialization at module load. Updated `packages/shared/api/products.ts` to use the getter for `getProducts` and `getProductById`. In tests, switched to mocking `getSupabase()` at module-load time using `jest.isolateModules` + `jest.doMock('../supabase', ...)`. Consolidated a chainable and awaitable Supabase query builder in `packages/shared/testing/supabase.mock.ts`. Removed reliance on `@react-native-async-storage/async-storage` in shared tests and added a lightweight `expo-constants` mock in `packages/shared/jest-setup.js`.

Status: All `packages/shared` products API tests pass (status filter, empty business_id short-circuit, getProductById success/error). Orders-related tests remain to be aligned.

Next steps: Address `orders` expectations vs implementation:
- `getCartItems`: test expects `product` to be `undefined` when join is null; implementation returns `null`.
- `createOrderFromCart`: test assumes first table hit is `cart_items`, implementation reads `carts` first.

---

### apps/b2b/

**Overview**: React Native Expo application using NativeWind for styling.

**Key Features**:

- **Authentication**: Login screen (`(auth)/login.tsx`) using `shared/api/supabase` for authentication. Admin login UI and API integration implemented.
- **Tabs**:
  - **Dashboard**: `(tabs)/index.tsx` (currently placeholder)
  - **Products**: `(tabs)/products.tsx` for product management (list, edit, delete) using `shared/api/products`. Includes `products/manage.tsx` for adding/editing products. Admin product list, add/edit product, product category management, and product deletion functionalities implemented.
  - **Orders**: `(tabs)/orders.tsx` for order management (list) using `shared/api/orders`. Includes `orders/[id].tsx` for order details and `orders/create.tsx` for creating orders on behalf of customers. Admin order list, order details, update order status, and create order for customer functionalities implemented.
  - **Inventory**: `(tabs)/inventory.tsx` for inventory management (list, adjust stock) using `shared/api/products`. Inventory list and adjust inventory functionalities implemented.
- **Navigation**: Uses `expo-router` (updated to `5.1.3`). Routing issue fixed by modifying `apps/b2b/app/_layout.tsx` to prevent constant redirection. Header configurations refactored and 'Customers' tab removed.
- **Shared components**: Imports components and APIs from `shared/` package.
- **Authentication Flow**: `_layout.tsx` at root of `apps/b2b/app/` handles session management and redirects based on user roles (`admin` or `sales_agent`).

---

### apps/b2c/

**Overview**: React Native Expo application using NativeWind for styling.

**Key Features**:

- **Authentication**: Login, Sign Up, and Forgot Password screens (`(auth)/login.tsx`, `(auth)/signup.tsx`, `(auth)/forgot-password.tsx`) using `packages/shared/api/supabase`. Login, Sign Up, Forgot Password screens, API integration, and session management implemented. Authentication routing issue fixed by adjusting `SplashScreen.hideAsync()` call in `apps/b2c/app/_layout.tsx` to prevent race conditions.
- **Tabs**:
  - **Home**: `(tabs)/index.tsx` displays list of authorized vendors for logged-in user with search/filter functionality and navigation to vendor product pages. Implemented using `VendorCard` component and fetching data via `getAuthorizedBusinesses` from `packages/shared/api/organisations`. `SafeAreaView` was removed from this component as safe area handling is now centralized at the top-level layout. Adjusted card heights by removing `min-h-32` and `min-h-full` classes.
  - **Orders**: `(tabs)/orders.tsx` for viewing order history. Order details shown in `orders/[id].tsx`. Uses `packages/shared/api/orders`. Order history list and order details implemented.
  - **Cart**: `cart.tsx` for managing shopping cart. Uses `packages/shared/api/products` and `packages/shared/api/supabase`. Shopping cart screen, add/remove/update quantity logic, create order button, and order confirmation screen implemented. A check was added to `apps/b2c/app/products/[id].tsx` to prevent adding unpublished products to the cart. The back button styling was standardized by using the default header.
  - **Profile**: `(tabs)/profile.tsx` includes `profile/index.tsx` for viewing profile, `profile/edit.tsx` for editing profile, and `profile/addresses.tsx` for managing addresses. Uses `packages/shared/api/profiles`. My Account/Profile screen, profile data fetching/update, and Saved Addresses screen implemented.
- **Order Confirmation**: `order-confirmation.tsx` displays order confirmation after order is placed.
- **Navigation**: Uses `expo-router` (updated to `5.1.3`). Root `_layout.tsx` file created to handle session management and redirects. 'Profile' tab reordered to be last tab.
- **Shared components**: Imports components and APIs from `packages/shared/`.

---

### packages/shared/

**Overview**: Contains shared code, including API clients and UI components, used by both `b2b` and `b2c` applications.

#### `api/`

- **`customers.ts`**: Functions for managing customer profiles, including `createCustomer`, `getAllCustomers`, `getCustomerById`, and `updateCustomer`.
- **`orders.ts`**: Functions for managing carts and orders, including `addOrUpdateCartItem`, `removeCartItem`, `updateCartItemQuantity`, `getCartItems`, `createOrderFromCart`, `getCustomerOrderHistory`, `getOrderDetails`, `updateOrderStatus`, and `createOrderForCustomer`.
- **`organisations.ts`**: Functions for managing organisations, including `getAuthorizedBusinesses` and `getCustomerBusinessId`.
- **`products.ts`**: Functions for managing products and categories, including `getProducts`, `getProductById`, `createProduct`, `updateProduct`, `deleteProduct`, `getCategories`, `createCategory`, `updateCategory`, `deleteCategory`, `getInventoryLevels`, and `adjustInventoryLevel`.
- **`profiles.ts`**: Functions for managing user profiles, including `getProfile` and `updateProfile`.
- **`supabase.ts`**: Initializes Supabase client and provides authentication functions like `signUpWithEmail`, `signInWithEmail`, `resetPasswordForEmail`, and `signOut`. `AuthContext`, `AuthProvider`, and `useAuth` hook definitions moved to `packages/shared/components/AuthProvider.tsx` to resolve JSX parsing errors in `.ts` files.

#### `components/`

- **`AuthProvider.tsx`**: Contains `AuthContext`, `AuthProvider` component, and `useAuth` hook for centralized authentication state management.
- **`Button.tsx`**: Reusable button component with loading states and variants.
- **`Input.tsx`**: Reusable input component with labels and various keyboard types.

---

### Other

- **`index.ts`**: Entry point for shared package. Exports all components from `components` directory, including `AuthProvider`.
- **`nativewind-env.d.ts`**: NativeWind type definitions.
- **`package.json`**: Package metadata and dependencies.
- **`tsconfig.json`**: TypeScript configuration for shared package.

---

### Supabase RLS Policies

All RLS policies for `public.profiles`, `public.products`, `public.categories`, `public.carts`, `public.cart_items`, `public.orders`, `public.order_items`, `public.organisations`, and `public.members` tables consolidated into single migration file (`supabase/migrations/20250713000002_add_rls_policies.sql`) to improve performance and remove redundant policies.

---

### Recent Changes

- **B2C App Safe Area Handling**: Implemented `SafeAreaProvider` and `SafeAreaView` in `apps/b2c/app/_layout.tsx` to ensure consistent safe area padding across all screens. `SafeAreaView` is configured to apply padding only to the top edge to avoid excessive bottom padding. Removed `SafeAreaView` from `apps/b2c/app/(tabs)/index.tsx` as it is now handled at the top level. Resolved a `TypeError` by ensuring `SafeAreaProvider` was correctly implemented and `React` was explicitly imported.
