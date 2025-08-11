# Task: Implement Store-Specific Product Listing Page in B2C Application

## Goal

Create a dedicated page in the B2C application (`apps/b2c/app/store/[id].tsx`) that displays products for a selected store, allows filtering by categories, and enables navigation to individual product details.

## Current State

- The B2C home page (`apps/b2c/app/(tabs)/index.tsx`) lists authorized vendors.
- `packages/shared/api/products.ts` contains `getProducts` and `getCategories` functions that already support `business_id` and `category_id` filtering.
- A product details page (`apps/b2c/app/products/[id].tsx`) already exists.

## Detailed Plan

### 1. Create `apps/b2c/app/store/[id].tsx` (Store Product Listing Page)

- **Route Parameter**: This page will receive the `storeId` (which corresponds to `business_id`) from the navigation.
- **Data Fetching**:
  - Fetch products for the given `storeId` using `getProducts` from `packages/shared/api/products.ts`.
  - Fetch categories relevant to the `storeId` using `getCategories` from `packages/shared/api/products.ts`.
- **UI Components**:
  - Display the store's name (can be fetched from `organisations` API if needed, or passed via navigation params).
  - Implement a category filter UI (e.g., a dropdown or a list of buttons).
  - Display a list of products (e.g., using `FlatList` or `ScrollView` with product cards).
- **Interaction**:
  - When a category is selected, re-fetch products filtered by that category.
  - When a product card is clicked, navigate to the existing product details page (`apps/b2c/app/products/[id].tsx`), passing the `productId`.

### 2. Update Navigation in `apps/b2c/app/(tabs)/index.tsx`

- Modify the navigation logic on the `VendorCard` click to navigate to the new store product listing page: `/store/[vendorId]`.

### 3. Verification and Testing

- **Manual Testing**:
  - Run the B2C application (`pnpm b2c`).
  - Navigate to the home page.
  - Click on a vendor card.
  - Verify that the Storefront Page loads correctly, displaying products for that store.
  - Test the category filter functionality.
  - Click on a product to ensure navigation to the product details page works as expected.
- **Code Quality Checks**:
  - Run `pnpm run lint` to check for linting issues.
  - Run `pnpm run format` to ensure code formatting adheres to standards.
