Prioritized Issues (B2C)

High
- Auth guard helpers missing in `app/_layout.tsx`. Extract pure helpers and unit test; reduces brittle segment checks.
- Address CRUD not wired to shared API. Implement in `packages/shared/api/profiles.ts` and integrate `profile/addresses*` screens.
- Order creation should be atomic (RPC). Move multi-step client flow to DB RPC; map `price_at_time_of_order`; return created rows.

Medium
- Centralize business-id resolution helper reused by storefront/PDP/cart/orders.
- Standardize Supabase access on `getSupabase()` in API modules.
- Gate debug logs with `__DEV__`; avoid PII/large payloads; add small `debug()` util.

Low
- Storefront/orders list perf: debounce search, memoize renderers, consider `getItemLayout`/FlashList; add skeleton loaders.
- Memory leak guards: ensure auth unsubscribe; add abort/isMounted guards in async effects.
- Product details resilience: validate `productId`, disable for unpublished/unauthorized, enforce stock bounds.

