import { createClient } from '@supabase/supabase-js';

import type { MockSupabaseClient } from '../../testing/supabase.mock';

import { createMockSupabaseClient } from '../../testing/supabase.mock';
jest.mock('@supabase/supabase-js', () => ({ createClient: jest.fn() }));

// Helper to create a thenable query builder that works with `await query`
function createThenableQuery<T>(result: { data: T; error: any }) {
  const qb: any = {
    eq: jest.fn().mockReturnThis(),
    or: jest.fn().mockReturnThis(),
    range: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    then: (onFulfilled: (v: typeof result) => any) =>
      Promise.resolve(result).then(onFulfilled),
  };
  return qb;
}

describe('products filter API', () => {
  let client: MockSupabaseClient;

  beforeEach(() => {
    client = createMockSupabaseClient();
    (createClient as unknown as jest.Mock).mockReturnValue(client);
    jest.resetModules();
  });

  describe('getProducts', () => {
    it('filters by category_id when provided', async () => {
      const data = [
        {
          business_id: 'b1',
          category_id: 'c1',
          id: 'p1',
          name: 'Product A',
          price: 10,
          status: 'published' as const,
          stock_quantity: 5,
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
        category_id: 'c1',
        limit: 10,
        page: 1,
      });

      // business_id filter applied
      expect(qb.eq).toHaveBeenCalledWith('business_id', 'b1');
      // category_id filter applied
      expect(qb.eq).toHaveBeenCalledWith('category_id', 'c1');
      // pagination applied
      expect(qb.range).toHaveBeenCalledWith(0, 9);
      expect(result).toEqual(data);
    });

    it('filters by search_query when provided', async () => {
      const data = [
        {
          business_id: 'b1',
          description: 'Latest smartphone',
          id: 'p1',
          name: 'iPhone',
          price: 999,
          status: 'published' as const,
          stock_quantity: 10,
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
        search_query: 'phone',
      });

      // business_id filter applied
      expect(qb.eq).toHaveBeenCalledWith('business_id', 'b1');
      // search filter applied
      expect(qb.or).toHaveBeenCalledWith(
        'name.ilike.%phone%,description.ilike.%phone%',
      );
      // pagination applied
      expect(qb.range).toHaveBeenCalledWith(0, 9);
      expect(result).toEqual(data);
    });

    it('applies multiple filters together', async () => {
      const data = [
        {
          business_id: 'b1',
          category_id: 'c1',
          description: 'Protective case for iPhone',
          id: 'p1',
          name: 'iPhone Case',
          price: 29,
          status: 'published' as const,
          stock_quantity: 100,
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
        category_id: 'c1',
        limit: 10,
        page: 1,
        search_query: 'case',
        status: 'published',
      });

      // All filters applied
      expect(qb.eq).toHaveBeenCalledWith('business_id', 'b1');
      expect(qb.eq).toHaveBeenCalledWith('category_id', 'c1');
      expect(qb.eq).toHaveBeenCalledWith('status', 'published');
      expect(qb.or).toHaveBeenCalledWith(
        'name.ilike.%case%,description.ilike.%case%',
      );
      // pagination applied
      expect(qb.range).toHaveBeenCalledWith(0, 9);
      expect(result).toEqual(data);
    });

    it('uses default pagination values', async () => {
      const data = [];
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
      });

      // Default pagination: page=1, limit=10 -> range(0, 9)
      expect(qb.range).toHaveBeenCalledWith(0, 9);
      expect(result).toEqual(data);
    });

    it('uses custom pagination values', async () => {
      const data = [];
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
        limit: 20,
        page: 3,
      });

      // Custom pagination: page=3, limit=20 -> range(40, 59)
      expect(qb.range).toHaveBeenCalledWith(40, 59);
      expect(result).toEqual(data);
    });

    it('returns [] when business_id is invalid UUID', async () => {
      const { getProducts } = require('../products');
      const result = await getProducts({
        business_id: 'invalid-uuid',
      });
      expect(result).toEqual([]);
      expect(client.from).not.toHaveBeenCalled();
    });
  });
});
