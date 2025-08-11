import { supabase } from './supabase';

export interface Organisation {
  id: string;
  name: string;
  address_line1: string;
  address_line2: null | string;
  city: string;
  country: string;
  postal_code: string;
  state: string;
  description?: string;
  image_url?: string;
  status: 'approved' | 'pending' | 'rejected' | 'suspended';
}

/**
 * Fetches all organisations a user is a member of with a 'customer' role.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<Organisation[] | null>} A promise that resolves to an array of organisations or null on error.
 */
export async function getAuthorizedBusinesses(
  userId: string,
): Promise<null | Organisation[]> {
  const { data: memberData, error: memberError } = await supabase
    .from('members')
    .select('business_id')
    .eq('profile_id', userId)
    .eq('role_in_business', 'customer');

  if (memberError) {
    console.error('Error fetching member businesses:', memberError.message);
    throw memberError;
  }

  if (!memberData || memberData.length === 0) {
    return [];
  }

  const businessIds = memberData.map((member) => member.business_id);

  const { data: organisationData, error: organisationError } = await supabase
    .from('organisations')
    .select(
      'id, name, address_line1, address_line2, city, state, postal_code, country, status, image_url, description',
    ) // Added description
    .in('id', businessIds)
    .eq('status', 'approved'); // Only show approved organisations

  if (organisationError) {
    console.error(
      'Error fetching authorised organisations:',
      organisationError.message,
    );
    throw organisationError;
  }

  return organisationData;
}

/**
 * Resolve an active business id for a user, preferring a provided id if the
 * user is a member of that business; otherwise fall back to the first
 * membership. Returns null if the user has no memberships.
 */
export async function resolveBusinessIdForUser(
  userId: string,
  preferredBusinessId?: null | string,
): Promise<null | string> {
  const { data: memberships, error } = await supabase
    .from('members')
    .select('business_id')
    .eq('profile_id', userId);

  if (error) {
    console.error('Error resolving business id for user:', error.message);
    throw error;
  }

  if (!memberships || memberships.length === 0) return null;

  const authorised = memberships.map((m) => m.business_id);
  if (preferredBusinessId && authorised.includes(preferredBusinessId)) {
    return preferredBusinessId;
  }
  return authorised[0] ?? null;
}

/**
 * Fetches the business ID for a given customer profile ID.
 * @param {string} profileId - The ID of the customer profile.
 * @returns {Promise<string | null>} A promise that resolves to the business ID or null if not found/error.
 */
export async function getCustomerBusinessId(
  profileId: string,
): Promise<null | string> {
  console.log('getCustomerBusinessId called with profileId:', profileId);

  // First, let's check if the user has any role in any business
  const { data: allMemberships, error: allError } = await supabase
    .from('members')
    .select('*')
    .eq('profile_id', profileId);

  console.log('All memberships for profile:', allMemberships);

  // Now check specifically for customer/sales_agent roles
  const { data, error } = await supabase
    .from('members')
    .select('business_id')
    .eq('profile_id', profileId)
    .in('role_in_business', ['customer', 'sales_agent'])
    .single();

  if (error) {
    console.error('Error in getCustomerBusinessId:', error.message);
    console.error('Error details:', error);
    if (error.code === 'PGRST116') {
      // No rows found
      console.log(
        'No customer/sales_agent membership found for profile:',
        profileId,
      );
      return null;
    }
    throw error;
  }

  console.log('getCustomerBusinessId result data:', data);
  return data ? data.business_id : null;
}
