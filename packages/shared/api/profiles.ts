import { supabase } from './supabase';

// Helper function to validate UUID format
function isValidUUID(uuid: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

// DB entity types (as stored in database)
export interface Profile {
  id: string;
  full_name?: string;
  username: string;
  avatar_url?: string;
  role: 'admin' | 'customer' | 'sales_agent';
  created_at?: string;
  deleted_at?: string | null;
  updated_at?: string;
}

// Insert types (for creating new records)
export type ProfileInsert = Omit<
  Profile,
  'created_at' | 'deleted_at' | 'id' | 'updated_at'
>;

// Update types (for updating existing records)
export type ProfileUpdate = Partial<
  Omit<Profile, 'created_at' | 'deleted_at' | 'id' | 'updated_at'>
>;

/**
 * Fetches a user's profile by their ID.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<Profile | null>} A promise that resolves to the profile object or null if not found/error.
 */
export async function getProfile(userId: string): Promise<Profile | null> {
  // Validate UUID
  if (!isValidUUID(userId)) {
    throw new Error('Invalid user ID format');
  }

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
 * @param {ProfileUpdate} profileData - The profile data to update.
 * @returns {Promise<Profile | null>} A promise that resolves to the updated profile or null on error.
 */
export async function updateProfile(
  userId: string,
  profileData: ProfileUpdate,
): Promise<Profile | null> {
  // Validate UUID
  if (!isValidUUID(userId)) {
    throw new Error('Invalid user ID format');
  }

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
): Promise<string | null> {
  // Validate UUID
  if (!isValidUUID(userId)) {
    throw new Error('Invalid user ID format');
  }

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
