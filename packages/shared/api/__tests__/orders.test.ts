import { createClient } from '@supabase/supabase-js';

import type { MockSupabaseClient } from '../../testing/supabase.mock';

import { createMockSupabaseClient } from '../../testing/supabase.mock';
jest.mock('@supabase/supabase-js', () => ({ createClient: jest.fn() }));

function createThenable<T>(result: { data: T; error: any }) {
  const qb: any = {
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue(result),
    then: (
      onFulfilled: (v: typeof result) => any,
      onRejected?: (e: any) => any,
    ) => Promise.resolve(result).then(onFulfilled, onRejected),
    update: jest.fn().mockReturnThis(),
  };
  return qb;
}

describe('orders API', () => {
  let client: MockSupabaseClient;

  beforeEach(() => {
    client = createMockSupabaseClient();
    (createClient as unknown as jest.Mock).mockReturnValue(client);
  });

  it('getCartItems maps product:products alias to product and handles array', async () => {
    jest.isolateModules(() => {
      const raw = [
        {
          cart_id: '123e4567-e89b-12d3-a456-426614174000',
          created_at: '',
          id: '123e4567-e89b-12d3-a456-426614174001',
          price_at_time_of_add: 5,
          product: [
            {
              business_id: '123e4567-e89b-12d3-a456-426614174005',
              id: '123e4567-e89b-12d3-a456-426614174003',
              name: 'A',
              price: 5,
              status: 'published',
              stock_quantity: 0,
            },
          ],
          product_id: '123e4567-e89b-12d3-a456-426614174003',
          quantity: 1,
          updated_at: '',
        },
        {
          cart_id: '123e4567-e89b-12d3-a456-426614174000',
          created_at: '',
          id: '123e4567-e89b-12d3-a456-426614174002',
          price_at_time_of_add: 10,
          product: null,
          product_id: '123e4567-e89b-12d3-a456-426614174004',
          quantity: 2,
          updated_at: '',
        },
      ];
      (client.from as jest.Mock).mockImplementation((table: string) => {
        if (table !== 'cart_items')
          throw new Error('Unexpected table ' + table);
        return createThenable({ data: raw as any, error: null });
      });
      jest.doMock('../supabase', () => ({
        getSupabase: () => client,
        supabase: client,
      }));
      const { getCartItems } = require('../orders');
      return getCartItems('123e4567-e89b-12d3-a456-426614174000').then((items: any[]) => {
        expect(items?.[0].product?.id).toBe('123e4567-e89b-12d3-a456-426614174003');
        expect(items?.[1].product).toBeUndefined();
      });
    });
  });

  it('createOrderFromCart uses price_at_time_of_order and clears cart', async () => {
    jest.isolateModules(() => {
      const cart = { business_id: '123e4567-e89b-12d3-a456-426614174006', id: '123e4567-e89b-12d3-a456-426614174000', user_id: '123e4567-e89b-12d3-a456-426614174007' } as any;
      const cartItems = [
        { carts: cart, price_at_time_of_add: 5, product_id: '123e4567-e89b-12d3-a456-426614174003', quantity: 2 },
        {
          carts: cart,
          price_at_time_of_add: 10,
          product_id: '123e4567-e89b-12d3-a456-426614174004',
          quantity: 1,
        },
      ] as any;
      const newOrder = { id: '123e4567-e89b-12d3-a456-426614174008' } as any;

      (client.from as jest.Mock).mockImplementation((table: string) => {
        switch (table) {
          case 'cart_items':
            // Support both initial fetch and delete
            if ((client.from as any)._deleted) {
              return createThenable({ data: null as any, error: null });
            }
            return createThenable({ data: cartItems as any, error: null });
          case 'carts':
            return createThenable({ data: cart as any, error: null });
          case 'order_items':
            return createThenable({ data: null as any, error: null });
          case 'orders':
            return createThenable({ data: newOrder as any, error: null });
          default:
            throw new Error('Unexpected table ' + table);
        }
      });
      jest.doMock('../supabase', () => ({
        getSupabase: () => client,
        supabase: client,
      }));
      const { createOrderFromCart } = require('../orders');
      return createOrderFromCart('123e4567-e89b-12d3-a456-426614174007', '123e4567-e89b-12d3-a456-426614174006').then((result: any) => {
        expect(result).toEqual(newOrder);
      });
    });
  });

  it('createOrderFromCartAtomic calls RPC and returns order', async () => {
    jest.isolateModules(() => {
      const newOrder = { id: '123e4567-e89b-12d3-a456-426614174009' } as any;
      (client.rpc as jest.Mock).mockResolvedValue({
        data: newOrder,
        error: null,
      });
      jest.doMock('../supabase', () => ({
        getSupabase: () => client,
        supabase: client,
      }));
      const { createOrderFromCartAtomic } = require('../orders');
      return createOrderFromCartAtomic('123e4567-e89b-12d3-a456-426614174007', '123e4567-e89b-12d3-a456-426614174006').then((result: any) => {
        expect(client.rpc).toHaveBeenCalledWith('create_order_from_cart', {
          business_id: '123e4567-e89b-12d3-a456-426614174006',
          user_id: '123e4567-e89b-12d3-a456-426614174007',
        });
        expect(result).toEqual(newOrder);
      });
    });
  });

  it('createOrderFromCartAtomic throws on RPC error', async () => {
    jest.isolateModules(async () => {
      (client.rpc as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'boom' },
      });
      jest.doMock('../supabase', () => ({
        getSupabase: () => client,
        supabase: client,
      }));
      const { createOrderFromCartAtomic } = require('../orders');
      await expect(createOrderFromCartAtomic('123e4567-e89b-12d3-a456-426614174007', '123e4567-e89b-12d3-a456-426614174006')).rejects.toBeTruthy();
    });
  });
});
