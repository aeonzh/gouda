import { supabase } from './supabase';

export interface Member {
  business_id: string;
  profile_id: string;
  role_in_business: 'customer' | 'owner' | 'sales_agent';
}

export async function addMember(member: Member): Promise<Member | null> {
  const { data, error } = await supabase
    .from('members')
    .insert([member])
    .select()
    .single();
  if (error) {
    console.error('Error adding member:', error.message);
    throw error;
  }
  return data as Member;
}

export async function deleteMember(
  profile_id: string,
  business_id: string,
): Promise<void> {
  const { error } = await supabase
    .from('members')
    .delete()
    .eq('profile_id', profile_id)
    .eq('business_id', business_id);
  if (error) {
    console.error('Error deleting member:', error.message);
    throw error;
  }
}

export async function getMember(
  profile_id: string,
  business_id: string,
): Promise<Member | null> {
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .eq('profile_id', profile_id)
    .eq('business_id', business_id)
    .single();
  if (error) {
    console.error('Error fetching member:', error.message);
    throw error;
  }
  return data as Member;
}

export async function listMembers(
  business_id: string,
): Promise<Member[] | null> {
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .eq('business_id', business_id);
  if (error) {
    console.error('Error listing members:', error.message);
    throw error;
  }
  return (data as Member[]) ?? [];
}

export async function updateMemberRole(
  profile_id: string,
  business_id: string,
  role_in_business: Member['role_in_business'],
): Promise<Member | null> {
  const { data, error } = await supabase
    .from('members')
    .update({ role_in_business })
    .eq('profile_id', profile_id)
    .eq('business_id', business_id)
    .select()
    .single();
  if (error) {
    console.error('Error updating member role:', error.message);
    throw error;
  }
  return data as Member;
}
