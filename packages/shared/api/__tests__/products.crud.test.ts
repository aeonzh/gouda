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

describe('products CRUD API', () => {
  let client: MockSupabaseClient;

  beforeEach(() => {
    client = createMockSupabaseClient();
    (createClient as unknown as jest.Mock).mockReturnValue(client);
  });

  it('createProduct inserts and returns product', async () => {
    const productInsert = {
      business_id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'X',
      price: 1,
      status: 'published' as const,
      stock_quantity: 0,
    };
    const productResult = {
      ...productInsert,
      category_id: '123e4567-e89b-12d3-a456-426614174001',
      created_at: '2023-01-01T00:00:00Z',
      deleted_at: null,
      id: '123e4567-e89b-12d3-a456-426614174002',
      updated_at: '2023-01-01T00:00:00Z',
    };
    const qb = createThenable({ data: productResult, error: null });
    (client.from as jest.Mock).mockImplementation((table: string) => {
      expect(table).toBe('products');
      return qb;
    });
    let createProduct: any;
    jest.isolateModules(() => {
      jest.doMock('../supabase', () => ({ getSupabase: () => client }));
      ({ createProduct } = require('../products'));
    });
    const res = await createProduct(productInsert);
    expect(qb.insert).toHaveBeenCalledWith([productInsert]);
    expect(qb.select).toHaveBeenCalled();
    expect(qb.single).toHaveBeenCalled();
    expect(res).toEqual(productResult);
  });

  it('updateProduct updates and returns product', async () => {
    const productUpdate = { name: 'Y' };
    const updated = {
      business_id: '123e4567-e89b-12d3-a456-426614174000',
      category_id: '123e4567-e89b-12d3-a456-426614174001',
      created_at: '2023-01-01T00:00:00Z',
      deleted_at: null,
      id: '123e4567-e89b-12d3-a456-426614174002',
      name: 'Y',
      price: 10,
      status: 'published' as const,
      stock_quantity: 5,
      updated_at: '2023-01-02T00:00:00Z',
    };
    const qb = createThenable({ data: updated, error: null });
    (client.from as jest.Mock).mockImplementation((table: string) => {
      expect(table).toBe('products');
      return qb;
    });
    let updateProduct: any;
    jest.isolateModules(() => {
      jest.doMock('../supabase', () => ({ getSupabase: () => client }));
      ({ updateProduct } = require('../products'));
    });
    const res = await updateProduct('123e4567-e89b-12d3-a456-426614174002', productUpdate);
    expect(qb.update).toHaveBeenCalledWith(productUpdate);
    expect(qb.eq).toHaveBeenCalledWith('id', 'p1');
    expect(qb.select).toHaveBeenCalled();
    expect(qb.single).toHaveBeenCalled();
    expect(res).toEqual(updated);
  });

  it('deleteProduct deletes by id', async () => {
    const qb = createThenable({ data: null, error: null });
    (client.from as jest.Mock).mockImplementation((table: string) => {
      expect(table).toBe('products');
      return qb;
    });
    let deleteProduct: any;
    jest.isolateModules(() => {
      jest.doMock('../supabase', () => ({ getSupabase: () => client }));
      ({ deleteProduct } = require('../products'));
    });
    await deleteProduct('123e4567-e89b-12d3-a456-426614174002');
    expect(qb.delete).toHaveBeenCalled();
    expect(qb.eq).toHaveBeenCalledWith('id', '123e4567-e89b-12d3-a456-426614174002');
  });
});
