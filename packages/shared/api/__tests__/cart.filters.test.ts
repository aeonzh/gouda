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

describe('cart items filter API', () => {
  let client: MockSupabaseClient;

  beforeEach(() => {
    client = createMockSupabaseClient();
    (createClient as unknown as jest.Mock).mockReturnValue(client);
    jest.resetModules();
  });

  describe('getCartItems', () => {
    it('filters by cart_id and selects product details', async () => {
      const rawData = [
        {
          cart_id: '123e4567-e89b-12d3-a456-426614174000',
          created_at: '2023-01-01T00:00:00Z',
          id: '123e4567-e89b-12d3-a456-426614174001',
          price_at_time_of_add: 10,
          product: {
            business_id: '123e4567-e89b-12d3-a456-426614174003',
            id: '123e4567-e89b-12d3-a456-426614174002',
            name: 'Product A',
            price: 10,
            status: 'published',
            stock_quantity: 5,
          },
          product_id: '123e4567-e89b-12d3-a456-426614174002',
          quantity: 2,
          updated_at: '2023-01-01T00:00:00Z',
        },
      ];
      const qb = createThenableQuery({ data: rawData, error: null });
      (client.from as jest.Mock).mockImplementation((table: string) => {
        expect(table).toBe('cart_items');
        return qb;
      });

      let getCartItems: any;
      jest.isolateModules(() => {
        jest.doMock('../supabase', () => ({ getSupabase: () => client }));
        ({ getCartItems } = require('../orders'));
      });
      const result = await getCartItems('123e4567-e89b-12d3-a456-426614174000');

      // cart_id filter applied
      expect(qb.eq).toHaveBeenCalledWith('cart_id', '123e4567-e89b-12d3-a456-426614174000');

      // Check that product details are correctly mapped
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('123e4567-e89b-12d3-a456-426614174001');
      expect(result[0].product.id).toBe('123e4567-e89b-12d3-a456-426614174002');
      expect(result[0].product.name).toBe('Product A');
    });

    it('handles array product response and maps to first element', async () => {
      const rawData = [
        {
          cart_id: '123e4567-e89b-12d3-a456-426614174000',
          created_at: '2023-01-01T00:00:00Z',
          id: '123e4567-e89b-12d3-a456-426614174001',
          price_at_time_of_add: 10,
          product: [
            {
              business_id: '123e4567-e89b-12d3-a456-426614174003',
              id: '123e4567-e89b-12d3-a456-426614174002',
              name: 'Product A',
              price: 10,
              status: 'published',
              stock_quantity: 5,
            },
          ],
          product_id: '123e4567-e89b-12d3-a456-426614174002',
          quantity: 2,
          updated_at: '2023-01-01T00:00:00Z',
        },
      ];
      const qb = createThenableQuery({ data: rawData, error: null });
      (client.from as jest.Mock).mockImplementation((table: string) => {
        expect(table).toBe('cart_items');
        return qb;
      });

      let getCartItems: any;
      jest.isolateModules(() => {
        jest.doMock('../supabase', () => ({ getSupabase: () => client }));
        ({ getCartItems } = require('../orders'));
      });
      const result = await getCartItems('123e4567-e89b-12d3-a456-426614174000');

      // Check that array product is mapped to first element
      expect(result).toHaveLength(1);
      expect(result[0].product.id).toBe('123e4567-e89b-12d3-a456-426614174002');
      expect(result[0].product.name).toBe('Product A');
    });

    it('handles null product response and maps to undefined', async () => {
      const rawData = [
        {
          cart_id: '123e4567-e89b-12d3-a456-426614174000',
          created_at: '2023-01-01T00:00:00Z',
          id: '123e4567-e89b-12d3-a456-426614174001',
          price_at_time_of_add: 10,
          product: null,
          product_id: '123e4567-e89b-12d3-a456-426614174002',
          quantity: 2,
          updated_at: '2023-01-01T00:00:00Z',
        },
      ];
      const qb = createThenableQuery({ data: rawData, error: null });
      (client.from as jest.Mock).mockImplementation((table: string) => {
        expect(table).toBe('cart_items');
        return qb;
      });

      let getCartItems: any;
      jest.isolateModules(() => {
        jest.doMock('../supabase', () => ({ getSupabase: () => client }));
        ({ getCartItems } = require('../orders'));
      });
      const result = await getCartItems('123e4567-e89b-12d3-a456-426614174000');

      // Check that null product is mapped to undefined
      expect(result).toHaveLength(1);
      expect(result[0].product).toBeUndefined();
    });

    it('throws error when cart_id is invalid UUID', async () => {
      let getCartItems: any;
      jest.isolateModules(() => {
        jest.doMock('../supabase', () => ({ getSupabase: () => client }));
        ({ getCartItems } = require('../orders'));
      });

      await expect(getCartItems('invalid-uuid')).rejects.toThrow(
        'Invalid cart ID format',
      );
      expect(client.from).not.toHaveBeenCalled();
    });
  });
});
