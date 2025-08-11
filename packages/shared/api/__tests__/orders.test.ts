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
          cart_id: 'c1',
          created_at: '',
          id: 'ci1',
          price_at_time_of_add: 5,
          product: [
            {
              business_id: 'b',
              id: 'p1',
              name: 'A',
              price: 5,
              status: 'published',
              stock_quantity: 0,
            },
          ],
          product_id: 'p1',
          quantity: 1,
          updated_at: '',
        },
        {
          cart_id: 'c1',
          created_at: '',
          id: 'ci2',
          price_at_time_of_add: 10,
          product: null,
          product_id: 'p2',
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
      return getCartItems('c1').then((items: any[]) => {
        expect(items?.[0].product?.id).toBe('p1');
        expect(items?.[1].product).toBeUndefined();
      });
    });
  });

  it('createOrderFromCart uses price_at_time_of_order and clears cart', async () => {
    jest.isolateModules(() => {
      const cart = { business_id: 'b1', id: 'c1', user_id: 'u1' } as any;
      const cartItems = [
        { carts: cart, price_at_time_of_add: 5, product_id: 'p1', quantity: 2 },
        {
          carts: cart,
          price_at_time_of_add: 10,
          product_id: 'p2',
          quantity: 1,
        },
      ] as any;
      const newOrder = { id: 'o1' } as any;

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
      return createOrderFromCart('u1', 'b1').then((result: any) => {
        expect(result).toEqual(newOrder);
      });
    });
  });

  it('createOrderFromCartAtomic calls RPC and returns order', async () => {
    jest.isolateModules(() => {
      const newOrder = { id: 'o2' } as any;
      (client.rpc as jest.Mock).mockResolvedValue({
        data: newOrder,
        error: null,
      });
      jest.doMock('../supabase', () => ({
        getSupabase: () => client,
        supabase: client,
      }));
      const { createOrderFromCartAtomic } = require('../orders');
      return createOrderFromCartAtomic('u1', 'b1').then((result: any) => {
        expect(client.rpc).toHaveBeenCalledWith('create_order_from_cart', {
          business_id: 'b1',
          user_id: 'u1',
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
      await expect(createOrderFromCartAtomic('u1', 'b1')).rejects.toBeTruthy();
    });
  });
});
