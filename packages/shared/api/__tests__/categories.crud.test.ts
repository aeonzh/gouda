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

describe('categories CRUD API', () => {
  let client: MockSupabaseClient;

  beforeEach(() => {
    client = createMockSupabaseClient();
    (createClient as unknown as jest.Mock).mockReturnValue(client);
  });

  it('createCategory inserts and returns category', async () => {
    const categoryInsert = {
      business_id: 'b1',
      name: 'Electronics',
    };
    const categoryResult = {
      ...categoryInsert,
      created_at: '2023-01-01T00:00:00Z',
      deleted_at: null,
      id: 'c1',
      updated_at: '2023-01-01T00:00:00Z',
    };
    const qb = createThenable({ data: categoryResult, error: null });
    (client.from as jest.Mock).mockImplementation((table: string) => {
      expect(table).toBe('categories');
      return qb;
    });
    let createCategory: any;
    jest.isolateModules(() => {
      jest.doMock('../supabase', () => ({ getSupabase: () => client }));
      ({ createCategory } = require('../products'));
    });
    const res = await createCategory(categoryInsert);
    expect(qb.insert).toHaveBeenCalledWith([categoryInsert]);
    expect(qb.select).toHaveBeenCalled();
    expect(qb.single).toHaveBeenCalled();
    expect(res).toEqual(categoryResult);
  });

  it('updateCategory updates and returns category', async () => {
    const categoryUpdate = { name: 'Updated Electronics' };
    const updated = {
      business_id: 'b1',
      created_at: '2023-01-01T00:00:00Z',
      deleted_at: null,
      id: 'c1',
      name: 'Updated Electronics',
      updated_at: '2023-01-02T00:00:00Z',
    };
    const qb = createThenable({ data: updated, error: null });
    (client.from as jest.Mock).mockImplementation((table: string) => {
      expect(table).toBe('categories');
      return qb;
    });
    let updateCategory: any;
    jest.isolateModules(() => {
      jest.doMock('../supabase', () => ({ getSupabase: () => client }));
      ({ updateCategory } = require('../products'));
    });
    const res = await updateCategory('c1', categoryUpdate);
    expect(qb.update).toHaveBeenCalledWith(categoryUpdate);
    expect(qb.eq).toHaveBeenCalledWith('id', 'c1');
    expect(qb.select).toHaveBeenCalled();
    expect(qb.single).toHaveBeenCalled();
    expect(res).toEqual(updated);
  });

  it('deleteCategory deletes by id', async () => {
    const qb = createThenable({ data: null, error: null });
    (client.from as jest.Mock).mockImplementation((table: string) => {
      expect(table).toBe('categories');
      return qb;
    });
    let deleteCategory: any;
    jest.isolateModules(() => {
      jest.doMock('../supabase', () => ({ getSupabase: () => client }));
      ({ deleteCategory } = require('../products'));
    });
    await deleteCategory('c1');
    expect(qb.delete).toHaveBeenCalled();
    expect(qb.eq).toHaveBeenCalledWith('id', 'c1');
  });
});
