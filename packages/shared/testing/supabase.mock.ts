// Utility helpers for unit tests to mock @supabase/supabase-js at module level
// Usage in tests (before importing code under test):
//
//   const client = createMockSupabaseClient();
//   mockSupabaseModule(client);
//   const { getProducts } = require('../api/products');
//
// Or manually:
//   jest.mock('@supabase/supabase-js', () => ({ createClient: jest.fn(() => client) }));

export interface MockSupabaseClient {
  auth: {
    getSession: jest.MockedFunction<AnyFn>;
    getUser: jest.MockedFunction<AnyFn>;
    signInWithPassword: jest.MockedFunction<AnyFn>;
    signOut: jest.MockedFunction<AnyFn>;
    signUp: jest.MockedFunction<AnyFn>;
  };
  from: jest.MockedFunction<(table: string) => MockSupabaseQueryBuilder>;
  rpc: jest.MockedFunction<AnyFn>;
}

export interface MockSupabaseQueryBuilder<T = any> {
  delete: jest.MockedFunction<AnyFn>;
  eq: jest.MockedFunction<AnyFn>;
  insert: jest.MockedFunction<AnyFn>;
  limit: jest.MockedFunction<AnyFn>;
  order: jest.MockedFunction<AnyFn>;
  rpc: jest.MockedFunction<AnyFn>;
  select: jest.MockedFunction<AnyFn>;
  single: jest.MockedFunction<AnyFn>;
  update: jest.MockedFunction<AnyFn>;
}

type AnyFn = (...args: any[]) => any;

export function createMockQueryBuilder<T = any>(
  resolved: unknown = { data: [], error: null },
): MockSupabaseQueryBuilder<T> {
  const builder: any = {
    delete: jest.fn().mockResolvedValue(resolved),
    eq: jest.fn().mockReturnThis(),
    insert: jest.fn().mockResolvedValue(resolved),
    or: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    range: jest.fn().mockReturnThis(),
    rpc: jest.fn().mockResolvedValue(resolved),
    select: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue(resolved),
    then: (onFulfilled: (v: any) => any, onRejected?: (e: any) => any) =>
      Promise.resolve(resolved).then(onFulfilled, onRejected),
    update: jest.fn().mockResolvedValue(resolved),
  };
  return builder as MockSupabaseQueryBuilder<T>;
}

export function createMockSupabaseClient(
  overrides?: Partial<MockSupabaseClient>,
): MockSupabaseClient {
  const defaultResolved = { data: [], error: null };
  const qb = createMockQueryBuilder(defaultResolved);
  const client: MockSupabaseClient = {
    auth: {
      getSession: jest
        .fn()
        .mockResolvedValue({ data: { session: null }, error: null }),
      getUser: jest
        .fn()
        .mockResolvedValue({ data: { user: null }, error: null }),
      signInWithPassword: jest
        .fn()
        .mockResolvedValue({ data: {}, error: null }),
      signOut: jest.fn().mockResolvedValue({ error: null }),
      signUp: jest.fn().mockResolvedValue({ data: {}, error: null }),
    },
    from: jest.fn(() => qb),
    rpc: jest.fn().mockResolvedValue(defaultResolved),
  };
  return { ...client, ...overrides } as MockSupabaseClient;
}

// Note: Avoid defining jest.mock factories that capture external variables here,
// as Jest hoists mocks and disallows accessing out-of-scope variables at transform time.
