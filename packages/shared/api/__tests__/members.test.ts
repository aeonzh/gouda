import { createClient } from '@supabase/supabase-js';

import type { MockSupabaseClient } from '../../testing/supabase.mock';

import { createMockSupabaseClient } from '../../testing/supabase.mock';
jest.mock('@supabase/supabase-js', () => ({ createClient: jest.fn() }));

// thenable builder factory
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

describe('members API', () => {
  let client: MockSupabaseClient;

  beforeEach(() => {
    client = createMockSupabaseClient();
    (createClient as unknown as jest.Mock).mockReturnValue(client);
  });

  it('addMember inserts and returns row', async () => {
    const member = {
      business_id: 'b1',
      profile_id: 'u1',
      role_in_business: 'sales_agent' as const,
    };
    const qb = createThenable({ data: member, error: null });
    (client.from as jest.Mock).mockImplementation((table: string) => {
      expect(table).toBe('members');
      return qb;
    });
    let addMember: any;
    jest.isolateModules(() => {
      jest.doMock('../supabase', () => ({ getSupabase: () => client }));
      ({ addMember } = require('../members'));
    });
    const res = await addMember(member);
    expect(qb.insert).toHaveBeenCalledWith([member]);
    expect(qb.select).toHaveBeenCalled();
    expect(qb.single).toHaveBeenCalled();
    expect(res).toEqual(member);
  });

  it('updateMemberRole updates role and returns row', async () => {
    const updated = {
      business_id: 'b1',
      profile_id: 'u1',
      role_in_business: 'owner' as const,
    };
    const qb = createThenable({ data: updated, error: null });
    (client.from as jest.Mock).mockImplementation((table: string) => {
      expect(table).toBe('members');
      return qb;
    });
    let updateMemberRole: any;
    jest.isolateModules(() => {
      jest.doMock('../supabase', () => ({ getSupabase: () => client }));
      ({ updateMemberRole } = require('../members'));
    });
    const res = await updateMemberRole('u1', 'b1', 'owner');
    expect(qb.update).toHaveBeenCalledWith({ role_in_business: 'owner' });
    expect(qb.eq).toHaveBeenCalledWith('profile_id', 'u1');
    expect(qb.eq).toHaveBeenCalledWith('business_id', 'b1');
    expect(qb.select).toHaveBeenCalled();
    expect(qb.single).toHaveBeenCalled();
    expect(res).toEqual(updated);
  });

  it('deleteMember deletes by composite key', async () => {
    const qb = createThenable({ data: null, error: null });
    (client.from as jest.Mock).mockImplementation((table: string) => {
      expect(table).toBe('members');
      return qb;
    });
    let deleteMember: any;
    jest.isolateModules(() => {
      jest.doMock('../supabase', () => ({ getSupabase: () => client }));
      ({ deleteMember } = require('../members'));
    });
    await deleteMember('u1', 'b1');
    expect(qb.delete).toHaveBeenCalled();
    expect(qb.eq).toHaveBeenCalledWith('profile_id', 'u1');
    expect(qb.eq).toHaveBeenCalledWith('business_id', 'b1');
  });
});
