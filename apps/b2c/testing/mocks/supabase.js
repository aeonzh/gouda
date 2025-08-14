// This is a simplified mock for supabase
module.exports = {
  getSupabase: () => ({
    auth: {
      getSession: jest.fn(() =>
        Promise.resolve({ data: { session: { user: { id: 'test-user' } } } }),
      ),
      getUser: jest.fn(() =>
        Promise.resolve({ data: { user: { id: 'test-user' } } }),
      ),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      })),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null, error: null })),
        })),
        in: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      })),
    })),
    rpc: jest.fn(() => Promise.resolve({ data: null, error: null })),
  }),
  supabase: {
    auth: {
      getSession: jest.fn(() =>
        Promise.resolve({ data: { session: { user: { id: 'test-user' } } } }),
      ),
      getUser: jest.fn(() =>
        Promise.resolve({ data: { user: { id: 'test-user' } } }),
      ),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      })),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null, error: null })),
        })),
        in: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      })),
    })),
    rpc: jest.fn(() => Promise.resolve({ data: null, error: null })),
  },
};
