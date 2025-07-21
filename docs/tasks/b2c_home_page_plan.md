# B2C Home Page Plan - Closed Discovery Multi-Vendor Model

## Objective

To design and implement the B2C home page (`apps/b2c/app/(tabs)/index.tsx`) to support a closed-discovery multi-vendor model. This means customers will only see and access vendors they have been explicitly authorized to interact with.

## Key Features

### 1. Header

- **Search Bar**: Allows users to filter the list of _their authorized vendors_ by name or category.

### 2. Authorized Vendor List (Main Content)

- The primary display area of the home page.
- **Content**: A scrollable list of `VendorCard` components.
- **Data Source**: This list will be populated by an API call that retrieves only the vendors associated with the currently authenticated user's profile.
- **`VendorCard` Structure (per item)**:
  - **Vendor Name**: Clearly displayed.
  - **Vendor Logo/Image**: A placeholder for now, to be replaced with actual images later.
  - **Brief Description/Category**: A short text describing the vendor (e.g., "Your Office Supplier," "Preferred Caterer," "Organic Grocer"). This can be fetched from the vendor's profile data.
  - **Tappable Area**: The entire `VendorCard` will be tappable, navigating the user to that specific vendor's product catalog page.

### 3. No Public Discovery Elements

- The design explicitly avoids any features that would allow users to discover new, unauthorized vendors. This includes:
  - No "Browse All Vendors" button/link.
  - No general promotional banners for unknown vendors.
  - No public vendor search.

## Technical Considerations

### Data Fetching

- A new or existing API function will be required to fetch the list of authorized businesses for the logged-in user. This function will likely reside in `packages/shared/api/profiles.ts` or a new dedicated API file (e.g., `packages/shared/api/businesses.ts`).
- The API call will need to leverage Supabase's RLS policies to ensure only authorized vendors are returned based on the `members` table and the user's `profile_id`.

### Navigation

- Tapping a `VendorCard` will navigate to a dynamic route, likely `products/[vendorId].tsx` or `vendors/[vendorId]/products.tsx`, which will then display products specific to that vendor.

## MVP Scope

- Focus on displaying the authorized vendor list with basic information.
- Implement the search/filter functionality for the authorized vendor list.
- Ensure navigation to a vendor's product page is functional (even if the product page itself is a placeholder initially).

## Future Enhancements (Beyond MVP)

- Implement actual vendor logos/images.
- Add more detailed vendor information on the card (e.g., ratings, delivery info).
- Implement sorting options for the vendor list.
- Personalized vendor recommendations based on past orders (within authorized vendors).
