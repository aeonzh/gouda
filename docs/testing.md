## Testing Guide

### Commands
- Root
  - `pnpm -w test` – run all tests
  - `pnpm -w test:coverage` – run all tests with coverage
  - `pnpm -w test:b2c` – run B2C tests only
  - `pnpm -w test:shared` – run shared tests only

### When to use what
- Unit (shared): use `packages/shared/testing/supabase.mock.ts` to mock `@supabase/supabase-js`.
- Integration/Screen (b2c): use MSW (`apps/b2c/testing/msw/*`) and `renderWithProviders`.
- Live integration (CI optional): Supabase CLI; smoke tests TBD.

### Utilities
- `apps/b2c/testing/renderWithProviders.tsx`: wraps UI with `AuthProvider` and `SafeAreaProvider`.
- `apps/b2c/testing/msw/server.ts`: central server; handlers in `testing/msw/handlers`.
- `packages/shared/testing/supabase.mock.ts`: create and install a mocked Supabase client.

### Notes
- MSW warns on unhandled requests; add/override handlers in tests as needed.
- Native modules are mocked in Jest setup to avoid runtime errors.


