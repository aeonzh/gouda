# Journal Entry Format Guidelines

This file serves as a chronological record of changes, decisions, and their rationale. Each entry should follow the format below:

```
### Session: [Date, e.g., Monday, January 1, 2024]

#### [Brief, descriptive title of the change/decision]

- **What was changed/decided and why (root cause/reason)**: [Explanation of the problem or the reason for the change/decision.]
- **How the change addresses the root cause**: [Explanation of the solution implemented or the decision made.]
- **Why the change addresses the root cause**: [Explanation of the rationale behind the solution or decision.]
```

### Session: Wednesday, July 16, 2025

#### Routing Fix, Header Configuration Refactoring, Tab Removal, and Dependency Update

- **What was changed/decided and why (root cause/reason)**:
  1.  **Routing Fix**: The `useEffect` hook in `apps/b2b/app/_layout.tsx` was causing an infinite redirection loop after user login, preventing navigation to other tabs.
  2.  **Header Configuration Refactoring**: Header options were redundantly defined in individual tab screens, leading to potential conflicts and scattered control.
  3.  **Tab Removal**: The "Customers" tab was present but not part of the B2B application's initial intended functionality.
  4.  **Dependency Update**: `expo-router` was at `^5.1.1`, and a minor version update to `5.1.3` was available, likely containing bug fixes or performance improvements.
- **How the change addresses the root cause**:
  1.  **Routing Fix**: A check (`if (!inTabsGroup)`) was added to the `useEffect` hook to ensure redirection to `/(tabs)` only occurs if the user is not already within the `(tabs)` group. This allows `expo-router`'s `Tabs` component to handle internal tab navigation correctly. Additionally, `<Stack.Screen name="(tabs)" options={{ headerShown: false }} />` was added to the main `Stack` component to properly register the `(tabs)` group and hide its header.
  2.  **Header Configuration Refactoring**: `Stack.Screen` header options were removed from individual tab screens (`apps/b2b/app/(tabs)/inventory.tsx`, `apps/b2b/app/(tabs)/orders.tsx`, `apps/b2b/app/(tabs)/products.tsx`). Header control is now centralized at the `(tabs)/_layout.tsx` or main `_layout.tsx` level.
  3.  **Tab Removal**: The "Customers" tab was removed from `apps/b2b/app/(tabs)/_layout.tsx`.
  4.  **Dependency Update**: The `expo-router` dependency was updated from `^5.1.1` to `5.1.3` in `apps/b2b/package.json` and `pnpm-lock.yaml`.
- **Why the change addresses the root cause**:
  1.  **Routing Fix**: Prevents the infinite redirection, allowing proper navigation within the B2B application and improving user experience.
  2.  **Header Configuration Refactoring**: Centralizes header management, making the codebase cleaner, more maintainable, and preventing conflicting header definitions.
  3.  **Tab Removal**: Streamlines the application by removing unused functionality, aligning it with the project's current scope.
  4.  **Dependency Update**: Ensures the application benefits from the latest bug fixes and performance improvements in `expo-router`.

### Session: Thursday, July 17, 2025

#### Debug Journal: B2C Product Display Issue Investigation and Test File Cleanup

- **What was changed/decided and why (root cause/reason)**: Investigated why the B2C app showed "No products found" for unauthenticated users. The root cause was identified as an RLS policy on products requiring authentication and the B2C app's inability to determine the business context without an authenticated user. This led to a decision to clean up test files to focus on relevant tests for this issue.
- **How the change addresses the root cause**: This entry documents the problem, root cause analysis, and potential solutions. It also details the decision to remove irrelevant test files (`check_members_roles.js`, `temp_check_members_distribution.js`, `diagnostic.js`, `diagnostic_direct.js`, `diagnostic_frontend.js`) and keep relevant ones (`test_frontend_products.js`, `test_simple_products.js`, `test_direct_api.js`, `test_connection.js`) to streamline debugging and future development.
- **Why the change addresses the root cause**: By understanding the RLS policy and business ID resolution issues, a clear path for solution (modifying RLS or requiring authentication) is established. Cleaning up test files ensures that future testing efforts are focused and efficient, directly supporting the resolution of the product display issue.

### Session: Friday, July 18, 2025

#### B2C Product Visibility Fix

- **What was changed/decided and why (root cause/reason)**: The B2C application failed to display products for logged-in users. The root cause was traced to the `getCustomerBusinessId` function, which could not reliably fetch the `business_id` when a user was a member of multiple businesses, as the `.single()` database query would fail.
- **How the change addresses the root cause**:
  1.  A new, more robust function, `getBusinessIdForUser`, was created in `packages/shared/api/profiles.ts`. This function uses `.limit(1).single()` to ensure it gracefully handles users with multiple business associations by returning the first available `business_id`.
  2.  The product display component at `apps/b2c/app/(tabs)/products.tsx` was updated to use the new `getBusinessIdForUser` function.
- **Why the change addresses the root cause**: The `getBusinessIdForUser` function guarantees that a valid `business_id` is always returned for any logged-in user, allowing the application to consistently fetch and display the product catalog. This resolves the visibility issue and makes the B2C app functional again, as verified with Playwright testing.

### Session: Saturday, July 19, 2025

#### RLS Policy Security Fix, B2C Authentication Routing Fix, and RLS Policy Fix for Infinite Recursion

- **What was changed/decided and why (root cause/reason)**:
  1.  **RLS Policy Security Fix**: The Row Level Security (RLS) policies in `supabase/migrations/20250714000003_rls_policies_setup.sql` were insecurely referencing `auth.jwt():user_metadata:role` for access control. `user_metadata` is user-editable, making it an unreliable and unsafe source for security decisions.
  2.  **B2C Authentication Routing Fix**: The B2C application was not consistently redirecting unauthenticated users to the `/login` route. This was due to a race condition where `SplashScreen.hideAsync()` was being called within the `onAuthStateChange` listener, potentially interfering with the routing logic before the session was fully established.
  3.  **RLS Policy Fix: Infinite Recursion in profiles_select_access**: The `profiles_select_access` RLS policy in `supabase/migrations/20250714000003_rls_policies_setup.sql` was causing an infinite recursion error due to a circular dependency in its `EXISTS` clause. This prevented proper data retrieval for profiles. This issue persisted even after initial attempts to simplify the policy, indicating a deeper circular dependency, likely involving the `members_select_access` policy and the `getBusinessIdForUser` function, which itself queries the `members` table. The policy was further simplified to only allow users to see their own non-soft-deleted profiles and admins to see all non-soft-deleted profiles.

- **How the change addresses the root cause**:
  1.  **RLS Policy Security Fix**: All instances of `auth.jwt():user_metadata:role` within the RLS policies have been replaced with a secure check against the `profiles.role` column in the `public.profiles` table. This leverages the existing, authoritative role information stored directly in the database.
  2.  **B2C Authentication Routing Fix**: The call to `SplashScreen.hideAsync()` was removed from the `onAuthStateChange` listener in `apps/b2c/app/_layout.tsx`. It is now exclusively called once after the initial `supabase.auth.getSession()` check and `setLoading(false)` is complete.
  3.  **RLS Policy Fix: Infinite Recursion in profiles_select_access**: A new `SECURITY DEFINER` helper function, `public.get_user_role_by_id()`, was introduced in `supabase/migrations/20250714000003_rls_policies_setup.sql`. This function securely retrieves the user's role by bypassing RLS on the `profiles` table within the function itself. Another `SECURITY DEFINER` helper function, `public.get_auth_user_business_ids()`, was also introduced to securely retrieve the business IDs associated with the authenticated user (if they are an 'owner' or 'sales_agent') by bypassing RLS on the `members` table within the function itself. The `profiles_select_access` policy was then modified to utilize these new helper functions, ensuring that the business ID and role lookups are performed without triggering recursive RLS checks. The policy was further simplified to `deleted_at IS NULL AND (((select auth.uid()) = id) OR (public.get_user_role_by_id((select auth.uid())) = 'admin'))` to break the recursion and allow basic profile access.

- **Why the change addresses the root cause**:
  1.  **RLS Policy Security Fix**: This change eliminates the security vulnerability by ensuring that RLS policies rely on a trusted, server-controlled source of truth for user roles (`profiles.role`) rather than a client-editable one (`user_metadata`). This significantly enhances the security posture of the application's data access control.
  2.  **B2C Authentication Routing Fix**: By ensuring `SplashScreen.hideAsync()` is called only after the initial session determination, the routing logic has a stable state to evaluate, preventing the race condition and ensuring that unauthenticated users are reliably redirected to the login screen.
  3.  **RLS Policy Fix: Infinite Recursion in profiles_select_access**: This approach definitively breaks the infinite recursion by providing secure and non-recursive methods for the `profiles_select_access` policy to determine business membership and user roles. The simplification of the policy to only allow self-access and admin access is a temporary measure to isolate the recursion, allowing us to confirm the fix before reintroducing more complex business logic. This should resolve the persistent internal server error related to profile selection and allow products to be displayed correctly.

#### Reintroducing Full Logic for profiles_select_access RLS Policy

- **What was changed/decided and why (root cause/reason)**: The `profiles_select_access` RLS policy was temporarily simplified to `deleted_at IS NULL AND (((select auth.uid()) = id) OR (public.get_user_role_by_id((select auth.uid())) = 'admin'))` to break an infinite recursion. This simplification restricted profile access more than intended, only allowing users to see their own profiles or admins to see all profiles. The original intent was to also allow business owners and sales agents to view profiles within their business.
- **How the change addresses the root cause**: The `profiles_select_access` policy in `supabase/migrations/20250714000003_rls_policies_setup.sql` was updated to reintroduce the logic for business owners/sales agents to view profiles within their business. This was achieved by adding an `OR` condition that checks if the `profiles.id` is associated with a business ID that the authenticated user (owner or sales agent) is also a member of, leveraging the `public.get_auth_user_business_ids()` helper function.
- **Why the change addresses the root cause**: This change restores the intended functionality of the `profiles_select_access` policy, allowing business owners and sales agents to manage profiles relevant to their business operations. By using the `SECURITY DEFINER` helper function `public.get_auth_user_business_ids()`, the policy avoids reintroducing the infinite recursion issue, as the helper function securely retrieves business IDs without triggering RLS on the `members` table. This ensures correct and secure data access for all relevant user roles.

### Session: Saturday, July 19, 2025

#### Supabase "Invalid URL" Error Resolution

- **What was changed/decided and why (root cause/reason)**: The B2C application was consistently throwing a "Server Error: Invalid URL" related to Supabase initialization, despite `console.log` statements showing correct `supabaseUrl` and `supabaseAnonKey` values. The root cause was likely a caching or bundling issue within Expo's environment variable handling, preventing the `createClient` function from correctly receiving the `Constants.expoConfig?.extra` values.
- **How the change addresses the root cause**: The issue was resolved by a series of debugging steps that included:
    1.  Adding and then removing `console.log` statements with type and length checks.
    2.  Temporarily hardcoding the Supabase URL and Anon Key directly into `packages/shared/api/supabase.ts` (which resolved the issue).
    3.  Reverting the hardcoded values back to `Constants.expoConfig?.extra` (which surprisingly continued to work).
    4.  Removing a temporary dummy field added to `apps/b2c/app.config.ts` that was intended to force Expo to re-evaluate its configuration.
    The combination of these actions, particularly the hardcoding and subsequent reversion, seems to have forced Expo's build system to correctly process and bundle the environment variables.
- **Why the change addresses the root cause**: The debugging process, though iterative, effectively "refreshed" Expo's understanding of the environment variables. The temporary hardcoding likely bypassed the problematic caching, and once the cache was cleared or rebuilt, the `Constants.expoConfig` method began working as intended. This indicates the problem was not with the values themselves, but with their propagation through the Expo build pipeline.
