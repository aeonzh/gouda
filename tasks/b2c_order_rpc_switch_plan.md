# Plan: Switch to Atomic Order Creation (RPC)

## Design

- RPC: `create_order_from_cart(user_id uuid, business_id uuid, idempotency_key text default null)`
- Behavior (single DB transaction):
  - Validate inputs and authorization (membership/business scope)
  - Insert order
  - Insert order_items from cart_items
  - Clear cart_items
  - Return created order

## SQL Migration (Supabase)

- Create `supabase/migrations/[timestamp]_create_order_from_cart.sql`:
  - SECURITY DEFINER function with strict argument and auth checks
  - Validate `user_id`, `business_id`, and non-empty cart
  - Optional idempotency:
    - Accept `idempotency_key`
    - Unique index on `(user_id, business_id, idempotency_key)` where key not null
    - On duplicate key, return existing order
  - Perform all steps in a transaction; raise on any failure
  - Ensure RLS-compatibility (or explicit checks inside function)

## App Code

- Shared API: keep `createOrderFromCartAtomic(userId, businessId, idempotencyKey?)`
- B2C `apps/b2c/app/cart.tsx`:
  - Replace call to legacy `createOrderFromCart` with `createOrderFromCartAtomic`
  - Generate per-submit idempotency key (e.g., UUID v4)
- Feature flag: `USE_ORDER_RPC=true` to allow quick fallback

## Tests

- Unit (shared):
  - RPC success returns order (already added)
  - RPC error propagates (already added)
  - Idempotency: when same key is re-used, returns same order (add test)
- Screen/Integration (B2C):
  - Success path uses RPC, navigates to confirmation
  - Error path shows message; cart remains (RPC atomicity)
- MSW: add handler for `POST /rest/v1/rpc/create_order_from_cart`

## Deployment Sequence

1. Apply migration to dev/staging; verify manually
2. Merge code behind feature flag; enable in staging; run tests and manual E2E
3. Enable flag in production when applicable; monitor logs/metrics

## Rollback

- Disable feature flag to revert to legacy multi-call flow
- Keep RPC deployed; no immediate DB rollback required

## Documentation

- Update `tasks/b2c_app_review_prompt_plan.md` Prompt 5 status after wiring
- Add context to `docs/memory-bank/context.md` and `JOURNAL.md` (motivation, idempotency, RLS posture)

## Security & Robustness Checklist

- Validate membership/authorization inside RPC; prevent data leaks
- Sanitize inputs; guard empty cart
- Use least privileges for SECURITY DEFINER
- Add/verify indexes for idempotency and performance

## Estimated Timeline

- SQL + unit tests: 1–2 hours
- App wiring + integration tests: ~1 hour
- Staging verification + flag flip: ~30 minutes
