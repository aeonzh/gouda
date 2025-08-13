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

describe('profiles CRUD API', () => {
  let client: MockSupabaseClient;

  beforeEach(() => {
    client = createMockSupabaseClient();
    (createClient as unknown as jest.Mock).mockReturnValue(client);
  });

  it('getProfile fetches and returns profile', async () => {
    const profile = {
      created_at: '2023-01-01T00:00:00Z',
      deleted_at: null,
      full_name: 'John Doe',
      id: '123e4567-e89b-12d3-a456-426614174000',
      role: 'customer' as const,
      updated_at: '2023-01-01T00:00:00Z',
      username: 'johndoe',
    };
    const qb = createThenable({ data: profile, error: null });
    (client.from as jest.Mock).mockImplementation((table: string) => {
      expect(table).toBe('profiles');
      return qb;
    });
    let getProfile: any;
    jest.isolateModules(() => {
      jest.doMock('../supabase', () => ({ getSupabase: () => client }));
      ({ getProfile } = require('../profiles'));
    });
    const res = await getProfile('123e4567-e89b-12d3-a456-426614174000');
    expect(qb.eq).toHaveBeenCalledWith('id', '123e4567-e89b-12d3-a456-426614174000');
    expect(qb.single).toHaveBeenCalled();
    expect(res).toEqual(profile);
  });

  it('updateProfile updates and returns profile', async () => {
    const profileUpdate = { full_name: 'Jane Doe' };
    const updated = {
      created_at: '2023-01-01T00:00:00Z',
      deleted_at: null,
      full_name: 'Jane Doe',
      id: '123e4567-e89b-12d3-a456-426614174000',
      role: 'customer' as const,
      updated_at: '2023-01-02T00:00:00Z',
      username: 'johndoe',
    };
    const qb = createThenable({ data: updated, error: null });
    (client.from as jest.Mock).mockImplementation((table: string) => {
      expect(table).toBe('profiles');
      return qb;
    });
    let updateProfile: any;
    jest.isolateModules(() => {
      jest.doMock('../supabase', () => ({ getSupabase: () => client }));
      ({ updateProfile } = require('../profiles'));
    });
    const res = await updateProfile('123e4567-e89b-12d3-a456-426614174000', profileUpdate);
    expect(qb.update).toHaveBeenCalledWith(profileUpdate);
    expect(qb.eq).toHaveBeenCalledWith('id', '123e4567-e89b-12d3-a456-426614174000');
    expect(qb.select).toHaveBeenCalled();
    expect(qb.single).toHaveBeenCalled();
    expect(res).toEqual(updated);
  });
});
