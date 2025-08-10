# B2C Baseline (Routes, API assumptions, logging, issues)

## Routes and Flows

- Auth group: `(auth)/login`, `(auth)/signup`, `(auth)/forgot-password`
- Tabs group: `(tabs)/index` (home/vendors), `(tabs)/orders`, `(tabs)/profile`
- Standalone routes: `storefront/[id]`, `products/[id]`, `cart`, `orders/index`, `orders/[id]`, `order-confirmation`, `profile/_layout`, `profile/index`, `profile/edit`, `profile/addresses`, `profile/addresses/add`, `profile/addresses/edit`
- Guards (in `app/_layout.tsx`): unauth → `(auth)/login`; auth allow-list includes `(tabs)`, `storefront/*`, `products/[id]`, `orders/*`, `profile/*`, `cart`, `order-confirmation`

## Shared API usage and assumptions

- Supabase access: standardized on lazy getter `getSupabase()` via `packages/shared/api/supabase.ts`; proxy `supabase` maintained for backward compatibility
- Tables referenced (examples): `profiles`, `products`, `categories`, `carts`, `cart_items`, `orders`, `order_items`, `organisations`, `members`
- Notable query patterns/assumptions:
  - Storefront products filtered by `status: 'published'`
  - Cart items join aliases product as `product:products!left(...)`; mapping tolerates `null | object | array`
  - Orders history sorted by `created_at` desc; UI maps `price_at_time_of_order` → `price_at_order`
  - Early-return guards for missing `business_id` in product/category fetches

## Logging usage (audit)

- Numerous `console.log` debug statements across: `app/cart.tsx`, `app/products/[id].tsx`, `app/(tabs)/index.tsx`, `app/_layout.tsx`, profile screens; shared APIs (`orders.ts`, `organisations.ts`, `QuantitySelector.tsx`)
- Recommendation: gate with `if (__DEV__) console.log(...)` or wrap in a debug util; avoid logging PII (user IDs) and large payloads in production

## Gaps / follow-ups

- Extract auth guard helpers from `app/_layout.tsx` into pure functions and add unit tests
- Centralize business-id resolution helper used by cart/storefront/product flows
- Address CRUD: `profile/addresses*` screens reference mocked functions; implement shared API and wire screens or gate routes
- Consider RPC for atomic order creation (insert order, items, clear cart) and idempotency key support
- Replace ad-hoc debug logs with a structured logger gated by `__DEV__`

## Supabase access policy

- Use `getSupabase()` everywhere for API calls; avoid eager client creation
- Rely on DB RLS for authorization; remove redundant client-side membership checks
