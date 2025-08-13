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

describe('orders CRUD API', () => {
  let client: MockSupabaseClient;

  beforeEach(() => {
    client = createMockSupabaseClient();
    (createClient as unknown as jest.Mock).mockReturnValue(client);
  });

  it('getOrderDetails fetches order with items and maps price field', async () => {
    const orderData = {
      business_id: '123e4567-e89b-12d3-a456-426614174000',
      created_at: '2023-01-01T00:00:00Z',
      deleted_at: null,
      id: '123e4567-e89b-12d3-a456-426614174001',
      order_items: [
        {
          created_at: '2023-01-01T00:00:00Z',
          deleted_at: null,
          id: '123e4567-e89b-12d3-a456-426614174002',
          order_id: '123e4567-e89b-12d3-a456-426614174001',
          price_at_time_of_order: 10,
          product_id: '123e4567-e89b-12d3-a456-426614174003',
          quantity: 2,
          updated_at: '2023-01-01T00:00:00Z',
        },
        {
          created_at: '2023-01-01T00:00:00Z',
          deleted_at: null,
          id: '123e4567-e89b-12d3-a456-426614174004',
          order_id: '123e4567-e89b-12d3-a456-426614174001',
          price_at_time_of_order: 5,
          product_id: '123e4567-e89b-12d3-a456-426614174005',
          quantity: 1,
          updated_at: '2023-01-01T00:00:00Z',
        },
      ],
      status: 'pending' as const,
      total_amount: 25,
      updated_at: '2023-01-01T00:00:00Z',
      user_id: '123e4567-e89b-12d3-a456-426614174006',
    };
    const qb = createThenable({ data: orderData, error: null });
    (client.from as jest.Mock).mockImplementation((table: string) => {
      expect(table).toBe('orders');
      return qb;
    });
    let getOrderDetails: any;
    jest.isolateModules(() => {
      jest.doMock('../supabase', () => ({ getSupabase: () => client }));
      ({ getOrderDetails } = require('../orders'));
    });
    const res = await getOrderDetails('123e4567-e89b-12d3-a456-426614174001');
    expect(qb.eq).toHaveBeenCalledWith('id', '123e4567-e89b-12d3-a456-426614174001');
    expect(qb.single).toHaveBeenCalled();

    // Check that price_at_time_of_order is mapped to price_at_order
    expect(res.order_items[0].price_at_order).toBe(10);
    expect(res.order_items[1].price_at_order).toBe(5);
    expect(res.order_items[0].price_at_time_of_order).toBe(10);
    expect(res.order_items[1].price_at_time_of_order).toBe(5);
  });

  it('updateOrderStatus updates order status', async () => {
    const updatedOrder = {
      business_id: '123e4567-e89b-12d3-a456-426614174000',
      created_at: '2023-01-01T00:00:00Z',
      deleted_at: null,
      id: '123e4567-e89b-12d3-a456-426614174001',
      status: 'processing' as const,
      total_amount: 25,
      updated_at: '2023-01-02T00:00:00Z',
      user_id: '123e4567-e89b-12d3-a456-426614174006',
    };
    const qb = createThenable({ data: updatedOrder, error: null });
    (client.from as jest.Mock).mockImplementation((table: string) => {
      expect(table).toBe('orders');
      return qb;
    });
    let updateOrderStatus: any;
    jest.isolateModules(() => {
      jest.doMock('../supabase', () => ({ getSupabase: () => client }));
      ({ updateOrderStatus } = require('../orders'));
    });
    const res = await updateOrderStatus('123e4567-e89b-12d3-a456-426614174001', 'processing');
    expect(qb.update).toHaveBeenCalledWith({
      status: 'processing',
      updated_at: expect.any(String),
    });
    expect(qb.eq).toHaveBeenCalledWith('id', '123e4567-e89b-12d3-a456-426614174001');
    expect(qb.select).toHaveBeenCalled();
    expect(qb.single).toHaveBeenCalled();
    expect(res).toEqual(updatedOrder);
  });

  it('createOrderForCustomer creates order and items', async () => {
    const newOrder = {
      created_at: '2023-01-01T00:00:00Z',
      deleted_at: null,
      id: '123e4567-e89b-12d3-a456-426614174001',
      sales_agent_id: '123e4567-e89b-12d3-a456-426614174007',
      status: 'pending' as const,
      total_amount: 25,
      updated_at: '2023-01-01T00:00:00Z',
      user_id: '123e4567-e89b-12d3-a456-426614174006',
    };

    // Mock for order creation
    const orderQb = createThenable({ data: newOrder, error: null });

    // Mock for order items creation
    const itemsQb = createThenable({ data: null, error: null });

    let callCount = 0;
    (client.from as jest.Mock).mockImplementation((table: string) => {
      callCount++;
      if (callCount === 1) {
        expect(table).toBe('orders');
        return orderQb;
      } else {
        expect(table).toBe('order_items');
        return itemsQb;
      }
    });

    let createOrderForCustomer: any;
    jest.isolateModules(() => {
      jest.doMock('../supabase', () => ({ getSupabase: () => client }));
      ({ createOrderForCustomer } = require('../orders'));
    });

    const items = [
      { priceAtOrder: 10, productId: '123e4567-e89b-12d3-a456-426614174003', quantity: 2 },
      { priceAtOrder: 5, productId: '123e4567-e89b-12d3-a456-426614174005', quantity: 1 },
    ];

    const res = await createOrderForCustomer('123e4567-e89b-12d3-a456-426614174006', '123e4567-e89b-12d3-a456-426614174007', items);

    // Check order creation
    expect(orderQb.insert).toHaveBeenCalledWith([
      {
        sales_agent_id: 'sa1',
        status: 'pending',
        total_amount: 25,
        user_id: 'u1',
      },
    ]);
    expect(orderQb.select).toHaveBeenCalled();
    expect(orderQb.single).toHaveBeenCalled();

    // Check order items creation
    expect(itemsQb.insert).toHaveBeenCalledWith([
      {
        order_id: '123e4567-e89b-12d3-a456-426614174001',
        price_at_time_of_order: 10,
        product_id: '123e4567-e89b-12d3-a456-426614174003',
        quantity: 2,
      },
      {
        order_id: '123e4567-e89b-12d3-a456-426614174001',
        price_at_time_of_order: 5,
        product_id: '123e4567-e89b-12d3-a456-426614174005',
        quantity: 1,
      },
    ]);

    expect(res).toEqual(newOrder);
  });

  it('throws error when createOrderForCustomer has no items', async () => {
    let createOrderForCustomer: any;
    jest.isolateModules(() => {
      jest.doMock('../supabase', () => ({ getSupabase: () => client }));
      ({ createOrderForCustomer } = require('../orders'));
    });

    await expect(createOrderForCustomer('123e4567-e89b-12d3-a456-426614174006', '123e4567-e89b-12d3-a456-426614174007', [])).rejects.toThrow(
      'Order must contain at least one item.',
    );
    await expect(createOrderForCustomer('123e4567-e89b-12d3-a456-426614174006', '123e4567-e89b-12d3-a456-426614174007', null)).rejects.toThrow(
      'Order must contain at least one item.',
    );
  });
});
