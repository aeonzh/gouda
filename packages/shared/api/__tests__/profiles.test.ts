import { createClient } from '@supabase/supabase-js';

import type { MockSupabaseClient } from '../../testing/supabase.mock';

import { createMockSupabaseClient } from '../../testing/supabase.mock';
jest.mock('@supabase/supabase-js', () => ({ createClient: jest.fn() }));

function createThenable<T>(result: { data: T; error: any }) {
  const qb: any = {
    eq: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue(result),
    then: (onFulfilled: (v: typeof result) => any) =>
      Promise.resolve(result).then(onFulfilled),
  };
  return qb;
}

describe('profiles API', () => {
  let client: MockSupabaseClient;
  beforeEach(() => {
    client = createMockSupabaseClient();
    (createClient as unknown as jest.Mock).mockReturnValue(client);
  });

  it('getBusinessIdForUser returns first membership when multiple exist', async () => {
    const memberships = [{ business_id: '123e4567-e89b-12d3-a456-426614174000' }, { business_id: '123e4567-e89b-12d3-a456-426614174001' }];
    (client.from as jest.Mock).mockImplementation((table: string) => {
      expect(table).toBe('members');
      const qb = createThenable({ data: memberships as any, error: null });
      qb.limit.mockReturnThis();
      qb.single.mockResolvedValue({ data: memberships[0], error: null });
      return qb;
    });

    const { getBusinessIdForUser } = require('../profiles');
    const result = await getBusinessIdForUser('123e4567-e89b-12d3-a456-426614174002');
    expect(result).toBe('123e4567-e89b-12d3-a456-426614174000');
  });
});
