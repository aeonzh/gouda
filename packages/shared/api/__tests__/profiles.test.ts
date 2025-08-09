import type { MockSupabaseClient } from '../../testing/supabase.mock';
import { createMockSupabaseClient, mockSupabaseModule } from '../../testing/supabase.mock';

function createThenable<T>(result: { data: T; error: any }) {
  const qb: any = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue(result),
    then: (onFulfilled: (v: typeof result) => any) => Promise.resolve(result).then(onFulfilled),
  };
  return qb;
}

describe('profiles API', () => {
  let client: MockSupabaseClient;
  beforeEach(() => {
    client = createMockSupabaseClient();
    mockSupabaseModule(client);
    jest.resetModules();
  });

  it('getBusinessIdForUser returns first membership when multiple exist', async () => {
    const memberships = [{ business_id: 'b1' }, { business_id: 'b2' }];
    (client.from as jest.Mock).mockImplementation((table: string) => {
      expect(table).toBe('members');
      const qb = createThenable({ data: memberships as any, error: null });
      qb.limit.mockReturnThis();
      qb.single.mockResolvedValue({ data: memberships[0], error: null });
      return qb;
    });

    const { getBusinessIdForUser } = await import('../profiles');
    const result = await getBusinessIdForUser('u1');
    expect(result).toBe('b1');
  });
});


