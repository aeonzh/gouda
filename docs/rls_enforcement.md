# Row Level Security (RLS) Enforcement Points

This document outlines the Row Level Security policies implemented in the database and how they are enforced in the application code.

## Database RLS Policies

All major tables have RLS enabled with specific policies for SELECT, INSERT, UPDATE, and DELETE operations based on user roles and business affiliations.

### User Roles

- **admin**: Full access to all data
- **owner**: Full access to data within their business
- **sales_agent**: Read/write access to data within their business
- **customer**: Read access to published data within their business

### Tables with RLS Policies

#### profiles

- **SELECT**: Admins, own profile, business owners/sales agents within business
- **INSERT**: Admins, own profile, business owners/sales agents within business
- **UPDATE**: Admins, own profile, business owners/sales agents within business
- **DELETE**: Admins only

#### organisations

- **SELECT**: Admins, business owners/sales agents within business, customers within business
- **INSERT**: Admins only
- **UPDATE**: Admins, business owners within business
- **DELETE**: Admins only

#### categories

- **SELECT**: Admins, business owners/sales agents within business, customers within business
- **INSERT**: Admins, business owners within business
- **UPDATE**: Admins, business owners within business
- **DELETE**: Admins only

#### products

- **SELECT**: Admins, business owners/sales agents within business, customers for published products within business
- **INSERT**: Admins, business owners/sales agents within business
- **UPDATE**: Admins, business owners/sales agents within business
- **DELETE**: Admins only

#### carts

- **SELECT**: Admins, own carts, business owners/sales agents within business
- **INSERT**: Admins, customers for own carts, business owners/sales agents for customers within business
- **UPDATE**: Admins, customers for own carts, business owners/sales agents within business
- **DELETE**: Admins only

#### cart_items

- **SELECT**: Admins, items in own carts, business owners/sales agents within business
- **INSERT**: Admins, items in own carts, business owners/sales agents within business
- **UPDATE**: Admins, items in own carts, business owners/sales agents within business
- **DELETE**: Admins only

#### orders

- **SELECT**: Admins, business owners/sales agents within business, own orders
- **INSERT**: Admins, business owners/sales agents for customers within business, customers for own orders
- **UPDATE**: Admins, business owners/sales agents within business, customers for own pending orders
- **DELETE**: Admins only

#### order_items

- **SELECT**: Admins, business owners/sales agents within business, items in own orders
- **INSERT**: Admins, business owners/sales agents within business, customers for items in own orders
- **UPDATE**: Admins, business owners/sales agents within business
- **DELETE**: Admins only

#### members

- **SELECT**: Own membership entries, business owners/sales agents within business
- **INSERT**: Admins, business owners/sales agents within business
- **UPDATE**: Admins, business owners within business
- **DELETE**: Admins only

## Application-Level RLS Enforcement

While the database provides RLS policies, the application code also implements additional validation and authorization checks to provide better error handling and user experience.

### Key Application Functions with RLS Enforcement

#### products.ts

- `getProducts()`: Validates business_id and relies on RLS for filtering
- `getProductById()`: Validates product ID format; RLS ensures user can only access authorized products
- `createProduct()`: Validates business_id; RLS ensures only authorized users can create products
- `updateProduct()`: Validates product ID format; RLS ensures only authorized users can update products
- `deleteProduct()`: Validates product ID format; RLS ensures only authorized users can delete products

#### orders.ts

- `getOrCreateCart()`: Validates user and business IDs; RLS ensures user can only access authorized carts
- `getCartItems()`: Validates cart ID format; RLS ensures user can only access authorized cart items
- `addOrUpdateCartItem()`: Validates cart and product IDs; RLS ensures user can only modify authorized cart items
- `createOrderFromCart()`: Validates user and business IDs; RLS ensures user can only create orders for authorized data
- `getCustomerOrderHistory()`: Validates user ID; RLS ensures user can only access their own orders
- `getOrderDetails()`: Validates order ID format; RLS ensures user can only access authorized orders

#### organisations.ts

- `getAuthorizedBusinesses()`: Validates user ID; RLS ensures user can only access businesses they're authorized for
- `resolveBusinessIdForUser()`: Validates user and business IDs; RLS ensures authorization checks

#### profiles.ts

- `getProfile()`: Validates user ID; RLS ensures user can only access authorized profiles
- `updateProfile()`: Validates user ID; RLS ensures user can only update authorized profiles
- `getBusinessIdForUser()`: Validates user ID; RLS ensures proper access controls

## Best Practices for RLS Enforcement

1. **Always validate input parameters** before making database calls
2. **Rely on RLS as the final security layer** but don't skip application-level validation
3. **Handle RLS denials gracefully** with appropriate error messages
4. **Test RLS policies** with different user roles to ensure proper access controls
5. **Document RLS expectations** in API functions for better maintainability

## Common RLS Patterns

### Business Ownership Verification

Most functions validate that a user belongs to a business before allowing operations on that business's data:

```javascript
// Example: Check if user is authorized for business
const authorisedBusinesses = await getAuthorizedBusinesses(userId);
if (!authorisedBusinesses.some((org) => org.id === businessId)) {
  // Handle unauthorized access
}
```

### Role-Based Access Control

Functions often check specific roles for certain operations:

```javascript
// Example: Only owners can create categories
// RLS policy ensures this at the database level
```

### Customer-Specific Access

Customers are restricted to viewing only published content and their own data:

```javascript
// Example: Products query automatically filters by status for customers
// RLS policy ensures customers only see published products
```
