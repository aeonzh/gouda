import type { MockSupabaseClient } from '../../testing/supabase.mock';
import { createMockSupabaseClient, mockSupabaseModule } from '../../testing/supabase.mock';

function createThenable<T>(result: { data: T; error: any }) {
  const qb: any = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    then: (onFulfilled: (v: typeof result) => any) => Promise.resolve(result).then(onFulfilled),
  };
  return qb;
}

describe('organisations API', () => {
  let client: MockSupabaseClient;
  beforeEach(() => {
    client = createMockSupabaseClient();
    mockSupabaseModule(client);
    jest.resetModules();
  });

  it('getAuthorizedBusinesses filters by user membership and approved status', async () => {
    const memberRows = [{ business_id: 'b1' }, { business_id: 'b2' }];
    const orgRows = [{ id: 'b1', name: 'A', status: 'approved' }, { id: 'b2', name: 'B', status: 'approved' }];

    (client.from as jest.Mock).mockImplementation((table: string) => {
      if (table === 'members') {
        return createThenable({ data: memberRows as any, error: null });
      }
      if (table === 'organisations') {
        return createThenable({ data: orgRows as any, error: null });
      }
      throw new Error('Unexpected table ' + table);
    });

    const { getAuthorizedBusinesses } = await import('../organisations');
    const result = await getAuthorizedBusinesses('u1');
    expect(result).toHaveLength(2);
  });
});


