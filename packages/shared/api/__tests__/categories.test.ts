import { createClient } from '@supabase/supabase-js';

import type { MockSupabaseClient } from '../../testing/supabase.mock';

import { createMockSupabaseClient } from '../../testing/supabase.mock';
jest.mock('@supabase/supabase-js', () => ({ createClient: jest.fn() }));

// Helper to create a thenable query builder that works with `await query`
function createThenableQuery<T>(result: { data: T; error: any }) {
  const qb: any = {
    eq: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    then: (onFulfilled: (v: typeof result) => any) =>
      Promise.resolve(result).then(onFulfilled),
  };
  return qb;
}

describe('categories API', () => {
  let client: MockSupabaseClient;

  beforeEach(() => {
    client = createMockSupabaseClient();
    (createClient as unknown as jest.Mock).mockReturnValue(client);
    jest.resetModules();
  });

  describe('getCategories', () => {
    it('returns [] and does not query when business_id is missing', async () => {
      const { getCategories } = require('../products');
      const result = await getCategories({});
      expect(result).toEqual([]);
      expect(client.from).not.toHaveBeenCalled();
    });

    it('filters by business_id when provided and queries categories table', async () => {
      const data = [
        {
          business_id: '123e4567-e89b-12d3-a456-426614174000',
          created_at: '2023-01-01T00:00:00Z',
          deleted_at: null,
          id: '123e4567-e89b-12d3-a456-426614174001',
          name: 'Electronics',
          updated_at: '2023-01-01T00:00:00Z',
        },
        {
          business_id: '123e4567-e89b-12d3-a456-426614174000',
          created_at: '2023-01-01T00:00:00Z',
          deleted_at: null,
          id: '123e4567-e89b-12d3-a456-426614174002',
          name: 'Clothing',
          updated_at: '2023-01-01T00:00:00Z',
        },
      ];
      const qb = createThenableQuery({ data, error: null });
      (client.from as jest.Mock).mockImplementation((table: string) => {
        expect(table).toBe('categories');
        return qb;
      });

      let getCategories: any;
      jest.isolateModules(() => {
        jest.doMock('../supabase', () => ({ getSupabase: () => client }));
        ({ getCategories } = require('../products'));
      });
      const result = await getCategories({
        business_id: '123e4567-e89b-12d3-a456-426614174000',
      });

      // business_id filter applied
      expect(qb.eq).toHaveBeenCalledWith('business_id', 'b1');
      // Check that the "All" sentinel category is added
      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({ business_id: '123e4567-e89b-12d3-a456-426614174000', id: null, name: 'All' });
      expect(result.slice(1)).toEqual(data);
    });

    it('returns [] when business_id is invalid UUID', async () => {
      const { getCategories } = require('../products');
      const result = await getCategories({
        business_id: 'invalid-uuid',
      });
      expect(result).toEqual([]);
      expect(client.from).not.toHaveBeenCalled();
    });
  });
});
