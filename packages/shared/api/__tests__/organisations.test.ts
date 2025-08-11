import { createClient } from '@supabase/supabase-js';

import type { MockSupabaseClient } from '../../testing/supabase.mock';

import { createMockSupabaseClient } from '../../testing/supabase.mock';
jest.mock('@supabase/supabase-js', () => ({ createClient: jest.fn() }));

function createThenable<T>(result: { data: T; error: any }) {
  const qb: any = {
    eq: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    then: (onFulfilled: (v: typeof result) => any) =>
      Promise.resolve(result).then(onFulfilled),
  };
  return qb;
}

describe('organisations API', () => {
  let client: MockSupabaseClient;
  beforeEach(() => {
    client = createMockSupabaseClient();
    (createClient as unknown as jest.Mock).mockReturnValue(client);
  });

  it('getAuthorizedBusinesses filters by user membership and approved status', async () => {
    const memberRows = [{ business_id: 'b1' }, { business_id: 'b2' }];
    const orgRows = [
      { id: 'b1', name: 'A', status: 'approved' },
      { id: 'b2', name: 'B', status: 'approved' },
    ];

    (client.from as jest.Mock).mockImplementation((table: string) => {
      if (table === 'members') {
        return createThenable({ data: memberRows as any, error: null });
      }
      if (table === 'organisations') {
        return createThenable({ data: orgRows as any, error: null });
      }
      throw new Error('Unexpected table ' + table);
    });

    const { getAuthorizedBusinesses } = require('../organisations');
    const result = await getAuthorizedBusinesses('u1');
    expect(result).toHaveLength(2);
  });

  it('resolveBusinessIdForUser prefers preferred id if user is a member', async () => {
    (client.from as jest.Mock).mockImplementation((table: string) => {
      if (table === 'members') {
        return createThenable({
          data: [{ business_id: 'b1' }, { business_id: 'b2' }] as any,
          error: null,
        });
      }
      throw new Error('Unexpected table ' + table);
    });

    jest.isolateModules(async () => {
      jest.doMock('../supabase', () => ({
        getSupabase: () => client,
        supabase: client,
      }));
      const { resolveBusinessIdForUser } = require('../organisations');
      const result = await resolveBusinessIdForUser('u1', 'b2');
      expect(result).toBe('b2');
    });
  });

  it('resolveBusinessIdForUser falls back to first membership when preferred not a member', async () => {
    (client.from as jest.Mock).mockImplementation((table: string) => {
      if (table === 'members') {
        return createThenable({
          data: [{ business_id: 'b1' }, { business_id: 'b2' }] as any,
          error: null,
        });
      }
      throw new Error('Unexpected table ' + table);
    });

    jest.isolateModules(async () => {
      jest.doMock('../supabase', () => ({
        getSupabase: () => client,
        supabase: client,
      }));
      const { resolveBusinessIdForUser } = require('../organisations');
      const result = await resolveBusinessIdForUser('u1', 'bX');
      expect(result).toBe('b1');
    });
  });

  it('resolveBusinessIdForUser returns null with no memberships', async () => {
    (client.from as jest.Mock).mockImplementation((table: string) => {
      if (table === 'members') {
        return createThenable({ data: [] as any, error: null });
      }
      throw new Error('Unexpected table ' + table);
    });

    jest.isolateModules(async () => {
      jest.doMock('../supabase', () => ({
        getSupabase: () => client,
        supabase: client,
      }));
      const { resolveBusinessIdForUser } = require('../organisations');
      const result = await resolveBusinessIdForUser('u1', 'b2');
      expect(result).toBeNull();
    });
  });
});
