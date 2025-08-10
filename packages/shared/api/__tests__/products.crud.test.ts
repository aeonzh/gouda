import type { MockSupabaseClient } from '../../testing/supabase.mock';
import { createMockSupabaseClient } from '../../testing/supabase.mock';
import { createClient } from '@supabase/supabase-js';
jest.mock('@supabase/supabase-js', () => ({ createClient: jest.fn() }));

function createThenable(result: { data: any; error: any }) {
  const qb: any = {
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue(result),
    then: (onFulfilled: (v: any) => any, onRejected?: (e: any) => any) =>
      Promise.resolve(result).then(onFulfilled, onRejected),
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
    const product = { id: 'p1', business_id: 'b1', name: 'X', price: 1, stock_quantity: 0, status: 'published' as const };
    const qb = createThenable({ data: product, error: null });
    (client.from as jest.Mock).mockImplementation((table: string) => {
      expect(table).toBe('products');
      return qb;
    });
    let createProduct: any;
    jest.isolateModules(() => {
      jest.doMock('../supabase', () => ({ getSupabase: () => client }));
      ({ createProduct } = require('../products'));
    });
    const res = await createProduct(product);
    expect(qb.insert).toHaveBeenCalledWith([product]);
    expect(qb.select).toHaveBeenCalled();
    expect(qb.single).toHaveBeenCalled();
    expect(res).toEqual(product);
  });

  it('updateProduct updates and returns product', async () => {
    const updated = { id: 'p1', name: 'Y' };
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
    const res = await updateProduct('p1', { name: 'Y' });
    expect(qb.update).toHaveBeenCalledWith({ name: 'Y' });
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
    await deleteProduct('p1');
    expect(qb.delete).toHaveBeenCalled();
    expect(qb.eq).toHaveBeenCalledWith('id', 'p1');
  });
});


