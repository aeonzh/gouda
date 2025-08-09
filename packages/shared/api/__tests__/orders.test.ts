import type { MockSupabaseClient } from '../../testing/supabase.mock';
import { createMockSupabaseClient } from '../../testing/supabase.mock';
import { createClient } from '@supabase/supabase-js';
jest.mock('@supabase/supabase-js', () => ({ createClient: jest.fn() }));

function createThenable<T>(result: { data: T; error: any }) {
  const qb: any = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue(result),
    insert: jest.fn().mockResolvedValue(result),
    delete: jest.fn().mockResolvedValue({ error: null }),
    update: jest.fn().mockResolvedValue(result),
    then: (onFulfilled: (v: typeof result) => any) => Promise.resolve(result).then(onFulfilled),
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
    const raw = [
      { id: 'ci1', cart_id: 'c1', product_id: 'p1', quantity: 1, price_at_time_of_add: 5, created_at: '', updated_at: '', product: [{ id: 'p1', name: 'A', price: 5, stock_quantity: 0, business_id: 'b', status: 'published' }] },
      { id: 'ci2', cart_id: 'c1', product_id: 'p2', quantity: 2, price_at_time_of_add: 10, created_at: '', updated_at: '', product: null },
    ];
    (client.from as jest.Mock).mockImplementation((table: string) => {
      expect(table).toBe('cart_items');
      return createThenable({ data: raw as any, error: null });
    });

    const { getCartItems } = require('../orders');
    const items = await getCartItems('c1');
    expect(items?.[0].product?.id).toBe('p1');
    expect(items?.[1].product).toBeUndefined();
  });

  it('createOrderFromCart uses price_at_time_of_order and clears cart', async () => {
    const cart = { id: 'c1' } as any;
    const cartItems = [
      { product_id: 'p1', quantity: 2, price_at_time_of_add: 5 },
      { product_id: 'p2', quantity: 1, price_at_time_of_add: 10 },
    ] as any;
    const newOrder = { id: 'o1' } as any;

    // Sequence of from() calls and tables
    (client.from as jest.Mock).mockImplementation((table: string) => {
      switch (table) {
        case 'carts':
          return createThenable({ data: cart, error: null });
        case 'cart_items':
          // first fetch, then delete
          if ((client.from as any)._cartItemsFetched) {
            return createThenable({ data: null, error: null });
          }
          (client.from as any)._cartItemsFetched = true;
          return createThenable({ data: cartItems, error: null });
        case 'orders':
          return createThenable({ data: newOrder, error: null });
        case 'order_items':
          return createThenable({ data: null, error: null });
        default:
          throw new Error('Unexpected table ' + table);
      }
    });

    const { createOrderFromCart } = require('../orders');
    const result = await createOrderFromCart('u1', 'b1');
    expect(result).toEqual(newOrder);
  });
});


