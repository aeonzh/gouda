// Utility helpers for unit tests to mock @supabase/supabase-js at module level
// Usage in tests (before importing code under test):
//
//   const client = createMockSupabaseClient();
//   mockSupabaseModule(client);
//   const { getProducts } = require('../api/products');
//
// Or manually:
//   jest.mock('@supabase/supabase-js', () => ({ createClient: jest.fn(() => client) }));

type AnyFn = (...args: any[]) => any;

export interface MockSupabaseQueryBuilder<T = any> {
  select: jest.MockedFunction<AnyFn>;
  eq: jest.MockedFunction<AnyFn>;
  limit: jest.MockedFunction<AnyFn>;
  single: jest.MockedFunction<AnyFn>;
  insert: jest.MockedFunction<AnyFn>;
  update: jest.MockedFunction<AnyFn>;
  delete: jest.MockedFunction<AnyFn>;
  order: jest.MockedFunction<AnyFn>;
  rpc: jest.MockedFunction<AnyFn>;
}

export interface MockSupabaseClient {
  from: jest.MockedFunction<(table: string) => MockSupabaseQueryBuilder>;
  rpc: jest.MockedFunction<AnyFn>;
  auth: {
    getUser: jest.MockedFunction<AnyFn>;
    getSession: jest.MockedFunction<AnyFn>;
    signInWithPassword: jest.MockedFunction<AnyFn>;
    signUp: jest.MockedFunction<AnyFn>;
    signOut: jest.MockedFunction<AnyFn>;
  };
}

export function createMockQueryBuilder<T = any>(
  resolved: unknown = { data: [], error: null }
): MockSupabaseQueryBuilder<T> {
  const chainable = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue(resolved),
    insert: jest.fn().mockResolvedValue(resolved),
    update: jest.fn().mockResolvedValue(resolved),
    delete: jest.fn().mockResolvedValue(resolved),
    order: jest.fn().mockReturnThis(),
    rpc: jest.fn().mockResolvedValue(resolved),
  } as unknown as MockSupabaseQueryBuilder<T>;

  // When select is awaited directly, return resolved shape
  (chainable.select as any).mockResolvedValue?.(resolved);
  return chainable;
}

export function createMockSupabaseClient(overrides?: Partial<MockSupabaseClient>): MockSupabaseClient {
  const defaultResolved = { data: [], error: null };
  const qb = createMockQueryBuilder(defaultResolved);
  const client: MockSupabaseClient = {
    from: jest.fn(() => qb),
    rpc: jest.fn().mockResolvedValue(defaultResolved),
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
      getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: null }),
      signInWithPassword: jest.fn().mockResolvedValue({ data: {}, error: null }),
      signUp: jest.fn().mockResolvedValue({ data: {}, error: null }),
      signOut: jest.fn().mockResolvedValue({ error: null }),
    },
  };
  return { ...client, ...overrides } as MockSupabaseClient;
}

export function mockSupabaseModule(client: MockSupabaseClient) {
  // Must be called before importing modules that call createClient
  jest.mock('@supabase/supabase-js', () => ({
    __esModule: true,
    createClient: jest.fn(() => client),
  }));
}


