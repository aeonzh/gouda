import { createClient } from '@supabase/supabase-js';

import type { MockSupabaseClient } from '../../testing/supabase.mock';

import { createMockSupabaseClient } from '../../testing/supabase.mock';
jest.mock('@supabase/supabase-js', () => ({ createClient: jest.fn() }));

// Helper to create a thenable query builder that works with `await query`
function createThenableQuery<T>(result: { data: T; error: any }) {
  const qb: any = {
    eq: jest.fn().mockReturnThis(),
    or: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    range: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue(result),
    then: (onFulfilled: (v: typeof result) => any) =>
      Promise.resolve(result).then(onFulfilled),
  };
  return qb;
}

describe('products API', () => {
  let client: MockSupabaseClient;

  beforeEach(() => {
    client = createMockSupabaseClient();
    (createClient as unknown as jest.Mock).mockReturnValue(client);
    jest.resetModules();
  });

  describe('getProducts', () => {
    it('returns [] and does not query when business_id is missing', async () => {
      const { getProducts } = require('../products');
      const result = await getProducts({});
      expect(result).toEqual([]);
      expect(client.from).not.toHaveBeenCalled();
    });

    it('filters by status when provided and queries products table', async () => {
      const data = [
        {
          business_id: 'b1',
          id: 'p1',
          name: 'X',
          price: 1,
          status: 'published' as const,
          stock_quantity: 0,
        },
      ];
      const qb = createThenableQuery({ data, error: null });
      (client.from as jest.Mock).mockImplementation((table: string) => {
        expect(table).toBe('products');
        return qb;
      });

      let getProducts: any;
      jest.isolateModules(() => {
        jest.doMock('../supabase', () => ({ getSupabase: () => client }));
        ({ getProducts } = require('../products'));
      });
      const result = await getProducts({
        business_id: 'b1',
        limit: 10,
        page: 1,
        status: 'published',
      });

      // business_id filter applied
      expect(qb.eq).toHaveBeenCalledWith('business_id', 'b1');
      // status filter applied
      expect(qb.eq).toHaveBeenCalledWith('status', 'published');
      // pagination applied
      expect(qb.range).toHaveBeenCalledWith(0, 9);
      expect(result).toEqual(data);
    });
  });

  describe('getProductById', () => {
    it('returns the product on success', async () => {
      const product = {
        business_id: 'b1',
        id: 'p2',
        name: 'P2',
        price: 2,
        status: 'published' as const,
        stock_quantity: 5,
      };
      const qb = createThenableQuery({ data: product, error: null });
      (client.from as jest.Mock).mockReset();
      (client.from as jest.Mock).mockImplementation((table: string) => {
        expect(table).toBe('products');
        return qb;
      });

      let getProductById: any;
      jest.isolateModules(() => {
        jest.doMock('../supabase', () => ({ getSupabase: () => client }));
        ({ getProductById } = require('../products'));
      });
      const result = await getProductById('p2');
      expect(qb.eq).toHaveBeenCalledWith('id', 'p2');
      expect(qb.single).toHaveBeenCalled();
      expect(result).toEqual(product);
    });

    it('throws on error', async () => {
      const boom = { message: 'boom' };
      const qb = createThenableQuery({ data: null, error: boom });
      (client.from as jest.Mock).mockReset();
      (client.from as jest.Mock).mockImplementation((table: string) => {
        expect(table).toBe('products');
        return qb;
      });

      let getProductById: any;
      jest.isolateModules(() => {
        jest.doMock('../supabase', () => ({ getSupabase: () => client }));
        ({ getProductById } = require('../products'));
      });
      await expect(getProductById('p3')).rejects.toEqual(boom);
    });
  });
});
