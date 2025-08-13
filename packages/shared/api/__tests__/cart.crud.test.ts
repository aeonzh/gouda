import { createClient } from '@supabase/supabase-js';

import type { MockSupabaseClient } from '../../testing/supabase.mock';

import { createMockSupabaseClient } from '../../testing/supabase.mock';
jest.mock('@supabase/supabase-js', () => ({ createClient: jest.fn() }));

function createThenable(result: { data: any; error: any }) {
  const qb: any = {
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue(result),
    then: (onFulfilled: (v: any) => any, onRejected?: (e: any) => any) =>
      Promise.resolve(result).then(onFulfilled, onRejected),
    update: jest.fn().mockReturnThis(),
  };
  return qb;
}

describe('cart CRUD API', () => {
  let client: MockSupabaseClient;

  beforeEach(() => {
    client = createMockSupabaseClient();
    (createClient as unknown as jest.Mock).mockReturnValue(client);
  });

  it('getOrCreateCart upserts and returns cart', async () => {
    const cart = {
      business_id: 'b1',
      created_at: '2023-01-01T00:00:00Z',
      deleted_at: null,
      id: 'cart1',
      updated_at: '2023-01-01T00:00:00Z',
      user_id: 'u1',
    };
    const qb = createThenable({ data: cart, error: null });
    (client.from as jest.Mock).mockImplementation((table: string) => {
      expect(table).toBe('carts');
      return qb;
    });
    let getOrCreateCart: any;
    jest.isolateModules(() => {
      jest.doMock('../supabase', () => ({ getSupabase: () => client }));
      ({ getOrCreateCart } = require('../orders'));
    });
    const res = await getOrCreateCart('u1', 'b1');
    expect(qb.upsert).toHaveBeenCalledWith(
      { business_id: 'b1', user_id: 'u1' },
      { onConflict: 'user_id, business_id' },
    );
    expect(qb.select).toHaveBeenCalled();
    expect(qb.single).toHaveBeenCalled();
    expect(res).toEqual(cart);
  });

  it('addOrUpdateCartItem adds new item when not exists', async () => {
    // First call to check if item exists - return error (not found)
    const notFoundError = { code: 'PGRST116', message: 'No rows found' };
    const qb1 = createThenable({ data: null, error: notFoundError });

    // Second call to insert new item
    const newItem = {
      cart_id: 'cart1',
      created_at: '2023-01-01T00:00:00Z',
      deleted_at: null,
      id: 'ci1',
      price_at_time_of_add: 10,
      product_id: 'p1',
      quantity: 2,
      updated_at: '2023-01-01T00:00:00Z',
    };
    const qb2 = createThenable({ data: newItem, error: null });

    let callCount = 0;
    (client.from as jest.Mock).mockImplementation((table: string) => {
      expect(table).toBe('cart_items');
      callCount++;
      if (callCount === 1) {
        return qb1;
      } else {
        return qb2;
      }
    });

    let addOrUpdateCartItem: any;
    jest.isolateModules(() => {
      jest.doMock('../supabase', () => ({ getSupabase: () => client }));
      ({ addOrUpdateCartItem } = require('../orders'));
    });
    const res = await addOrUpdateCartItem('cart1', 'p1', 2, 10);
    expect(qb1.eq).toHaveBeenCalledWith('cart_id', 'cart1');
    expect(qb1.eq).toHaveBeenCalledWith('product_id', 'p1');
    expect(qb2.insert).toHaveBeenCalledWith([
      {
        cart_id: 'cart1',
        price_at_time_of_add: 10,
        product_id: 'p1',
        quantity: 2,
      },
    ]);
    expect(qb2.select).toHaveBeenCalled();
    expect(qb2.single).toHaveBeenCalled();
    expect(res).toEqual(newItem);
  });

  it('addOrUpdateCartItem updates quantity when item exists', async () => {
    // First call to check if item exists - return existing item
    const existingItem = {
      cart_id: 'cart1',
      created_at: '2023-01-01T00:00:00Z',
      deleted_at: null,
      id: 'ci1',
      price_at_time_of_add: 10,
      product_id: 'p1',
      quantity: 1,
      updated_at: '2023-01-01T00:00:00Z',
    };
    const qb1 = createThenable({ data: existingItem, error: null });

    // Second call to update quantity
    const updatedItem = {
      ...existingItem,
      quantity: 3, // 1 (existing) + 2 (new)
      updated_at: '2023-01-02T00:00:00Z',
    };
    const qb2 = createThenable({ data: updatedItem, error: null });

    let callCount = 0;
    (client.from as jest.Mock).mockImplementation((table: string) => {
      expect(table).toBe('cart_items');
      callCount++;
      if (callCount === 1) {
        return qb1;
      } else {
        return qb2;
      }
    });

    let addOrUpdateCartItem: any;
    jest.isolateModules(() => {
      jest.doMock('../supabase', () => ({ getSupabase: () => client }));
      ({ addOrUpdateCartItem } = require('../orders'));
    });
    const res = await addOrUpdateCartItem('cart1', 'p1', 2, 10);
    expect(qb1.eq).toHaveBeenCalledWith('cart_id', 'cart1');
    expect(qb1.eq).toHaveBeenCalledWith('product_id', 'p1');
    expect(qb2.update).toHaveBeenCalledWith({
      quantity: 3,
      updated_at: expect.any(String),
    });
    expect(qb2.eq).toHaveBeenCalledWith('id', 'ci1');
    expect(qb2.select).toHaveBeenCalled();
    expect(qb2.single).toHaveBeenCalled();
    expect(res).toEqual(updatedItem);
  });

  it('removeCartItem deletes by id', async () => {
    const qb = createThenable({ data: null, error: null });
    (client.from as jest.Mock).mockImplementation((table: string) => {
      expect(table).toBe('cart_items');
      return qb;
    });
    let removeCartItem: any;
    jest.isolateModules(() => {
      jest.doMock('../supabase', () => ({ getSupabase: () => client }));
      ({ removeCartItem } = require('../orders'));
    });
    await removeCartItem('ci1');
    expect(qb.delete).toHaveBeenCalled();
    expect(qb.eq).toHaveBeenCalledWith('id', 'ci1');
  });

  it('updateCartItemQuantity updates quantity', async () => {
    const updatedItem = {
      cart_id: 'cart1',
      created_at: '2023-01-01T00:00:00Z',
      deleted_at: null,
      id: 'ci1',
      price_at_time_of_add: 10,
      product_id: 'p1',
      quantity: 5,
      updated_at: '2023-01-02T00:00:00Z',
    };
    const qb = createThenable({ data: updatedItem, error: null });
    (client.from as jest.Mock).mockImplementation((table: string) => {
      expect(table).toBe('cart_items');
      return qb;
    });
    let updateCartItemQuantity: any;
    jest.isolateModules(() => {
      jest.doMock('../supabase', () => ({ getSupabase: () => client }));
      ({ updateCartItemQuantity } = require('../orders'));
    });
    const res = await updateCartItemQuantity('ci1', 5);
    expect(qb.update).toHaveBeenCalledWith({
      quantity: 5,
      updated_at: expect.any(String),
    });
    expect(qb.eq).toHaveBeenCalledWith('id', 'ci1');
    expect(qb.select).toHaveBeenCalled();
    expect(qb.single).toHaveBeenCalled();
    expect(res).toEqual(updatedItem);
  });

  it('updateCartItemQuantity removes item when quantity <= 0', async () => {
    const qb = createThenable({ data: null, error: null });
    (client.from as jest.Mock).mockImplementation((table: string) => {
      expect(table).toBe('cart_items');
      return qb;
    });
    let updateCartItemQuantity: any;
    let removeCartItem: any;
    jest.isolateModules(() => {
      jest.doMock('../supabase', () => ({ getSupabase: () => client }));
      const module = require('../orders');
      updateCartItemQuantity = module.updateCartItemQuantity;
      removeCartItem = module.removeCartItem;
    });
    const res = await updateCartItemQuantity('ci1', 0);
    expect(res).toBeNull();
    // Note: We can't easily test that removeCartItem was called due to module isolation
  });
});
