# Project Status

## apps/b2b/

The `apps/b2b/` directory contains a React Native Expo application.
It uses NativeWind for styling.
The application has the following main screens/features:

- **Authentication**: Login screen (`(auth)/login.tsx`) using `shared/api/supabase` for authentication. Admin login UI and API integration are implemented.
- **Tabs**:
  - **Dashboard**: `(tabs)/index.tsx` (currently a placeholder).
  - **Products**: `(tabs)/products.tsx` for product management (list, edit, delete) using `shared/api/products`. It also has `products/manage.tsx` for adding/editing products. Admin product list, add/edit product, product category management, and product deletion functionalities are implemented.
  - **Orders**: `(tabs)/orders.tsx` for order management (list) using `shared/api/orders`. It also has `orders/[id].tsx` for order details and `orders/create.tsx` for creating orders on behalf of customers. Admin order list, order details, update order status, and create order for customer functionalities are implemented.
  - **Customers**: `(tabs)/customers.tsx` for customer management (list) using `shared/api/profiles`. It also has `customers/[id].tsx` for customer details and `customers/manage.tsx` for adding/editing customers. Admin customer list, customer details, add/edit customer functionalities are implemented.
  - **Inventory**: `(tabs)/inventory.tsx` for inventory management (list, adjust stock) using `shared/api/products`. Inventory list and adjust inventory functionalities are implemented.
- **Navigation**: Uses `expo-router` for navigation.
- **Shared components**: Imports components and APIs from `shared/` package.
- **Authentication Flow**: The `_layout.tsx` at the root of `apps/b2b/app/` handles session management and redirects based on user roles (`admin` or `sales_agent`).

## apps/b2c/

The `apps/b2c/` directory contains a React Native Expo application.
It uses NativeWind for styling.
The application has the following main screens/features:

- **Authentication**: Login, Sign Up, and Forgot Password screens (`(auth)/login.tsx`, `(auth)/signup.tsx`, `(auth)/forgot-password.tsx`) using `packages/shared/api/supabase` for authentication. Login, Sign Up, Forgot Password screens, API integration, and session management are implemented.
- **Tabs**:
  - **Home**: `(tabs)/index.tsx` (currently a placeholder).
  - **Profile**: `(tabs)/profile.tsx` which includes `profile/index.tsx` for viewing profile, `profile/edit.tsx` for editing profile, and `profile/addresses.tsx` for managing addresses. Uses `packages/shared/api/profiles`. My Account/Profile screen, profile data fetching/update, and Saved Addresses screen are implemented.
  - **Products**: `(tabs)/products.tsx` for product browsing, search, and filtering using `packages/shared/api/products`. Product details are shown in `products/[id].tsx`. Product listing/catalog, search/filtering, and product details are implemented.
  - **Orders**: `(tabs)/orders.tsx` for viewing order history. Order details are shown in `orders/[id].tsx`. Uses `packages/shared/api/orders`. Order history list and order details are implemented.
  - **Cart**: `cart.tsx` for managing the shopping cart. Uses `packages/shared/api/products` and `packages/shared/api/supabase`. Shopping cart screen, add/remove/update quantity logic, create order button, and order confirmation screen are implemented.
- **Order Confirmation**: `order-confirmation.tsx` displays order confirmation after an order is placed.
- **Navigation**: Uses `expo-router` for navigation.
- **Shared components**: Imports components and APIs from `packages/shared/`.

## packages/shared/

The `packages/shared/` directory contains shared code, including API clients and UI components, used by both `b2b` and `b2c` applications.

### `api/`

- **`orders.ts`**: Contains functions for managing carts and orders, including `getOrCreateCart`, `addOrUpdateCartItem`, `removeCartItem`, `updateCartItemQuantity`, `getCartItems`, `createOrderFromCart`, `getCustomerOrderHistory`, `getOrderDetails`, `updateOrderStatus`, and `createOrderForCustomer`.
- **`products.ts`**: Contains functions for managing products and categories, including `getProducts`, `getProductById`, `createProduct`, `updateProduct`, `deleteProduct`, `getCategories`, `createCategory`, `updateCategory`, `deleteCategory`, `getInventoryLevels`, and `adjustInventoryLevel`.
- **`profiles.ts`**: Contains functions for managing user profiles and business details, including `getProfile`, `updateProfile`, `getBusinessDetails`, `addBusinessDetails`, `updateBusinessDetails`, `deleteBusinessDetails`, `getAllCustomers`, `getCustomerById`, `createCustomer`, and `updateCustomer`.
- **`supabase.ts`**: Initializes the Supabase client and provides authentication functions like `signUpWithEmail`, `signInWithEmail`, `resetPasswordForEmail`, and `signOut`.

### `components/`

- **`Button.tsx`**: A reusable button component with loading states and variants.
- **`Input.tsx`**: A reusable input component with labels and various keyboard types.
- **`TabBarIcon.tsx`**: A component for displaying Ionicons in tab bars.

### Other

- `index.ts`: Entry point for the shared package.
- `nativewind-env.d.ts`: NativeWind type definitions.
- `package.json`: Package metadata and dependencies.
- `tsconfig.json`: TypeScript configuration for the shared package.
