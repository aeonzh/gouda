import { supabase } from './supabase';

export interface Profile {
  id: string;
  full_name?: string;
  username: string;
  avatar_url?: string;
  role: 'admin' | 'customer' | 'sales_agent';
  created_at: string;
  updated_at: string;
}

/**
 * Fetches a user's profile by their ID.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<Profile | null>} A promise that resolves to the profile object or null if not found/error.
 */
export async function getProfile(userId: string): Promise<null | Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching profile:', error.message);
    throw error;
  }
  return data;
}

/**
 * Updates a user's profile.
 * @param {string} userId - The ID of the user.
 * @param {Partial<Profile>} profileData - The partial profile data to update.
 * @returns {Promise<Profile | null>} A promise that resolves to the updated profile or null on error.
 */
export async function updateProfile(
  userId: string,
  profileData: Partial<Profile>,
): Promise<null | Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .update(profileData)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating profile:', error.message);
    throw error;
  }
  return data;
}

/**
 * Fetches the business ID for a given user ID.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<string | null>} A promise that resolves to the business ID or null if not found/error.
 */
export async function getBusinessIdForUser(
  userId: string,
): Promise<null | string> {
  const { data, error } = await supabase
    .from('members')
    .select('business_id')
    .eq('profile_id', userId)
    .limit(1)
    .single();

  if (error) {
    console.error('Error fetching business ID for user:', error.message);
    throw error;
  }

  return data ? data.business_id : null;
}
