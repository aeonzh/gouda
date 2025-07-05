import { supabase } from './supabase';

export interface Profile {
  id: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
  role: 'buyer' | 'admin' | 'seller_agent';
  created_at: string;
  updated_at: string;
}

export interface Address {
  id: string;
  user_id: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Fetches a user's profile by their ID.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<Profile | null>} A promise that resolves to the profile object or null if not found/error.
 */
export async function getProfile(userId: string): Promise<Profile | null> {
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
 * @param {string} userId - The ID of the user to update.
 * @param {Partial<Profile>} profileData - The partial profile data to update.
 * @returns {Promise<Profile | null>} A promise that resolves to the updated profile or null on error.
 */
export async function updateProfile(
  userId: string,
  profileData: Partial<Profile>,
): Promise<Profile | null> {
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
 * Fetches all shipping addresses for a user.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<Address[] | null>} A promise that resolves to an array of addresses or null on error.
 */
export async function getAddresses(userId: string): Promise<Address[] | null> {
  const { data, error } = await supabase
    .from('addresses')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching addresses:', error.message);
    throw error;
  }
  return data;
}

/**
 * Adds a new shipping address for a user.
 * @param {Omit<Address, 'id' | 'created_at' | 'updated_at'>} addressData - The address data to insert.
 * @returns {Promise<Address | null>} A promise that resolves to the created address or null on error.
 */
export async function addAddress(
  addressData: Omit<Address, 'id' | 'created_at' | 'updated_at'>,
): Promise<Address | null> {
  const { data, error } = await supabase
    .from('addresses')
    .insert([addressData])
    .select()
    .single();

  if (error) {
    console.error('Error adding address:', error.message);
    throw error;
  }
  return data;
}

/**
 * Updates an existing shipping address.
 * @param {string} addressId - The ID of the address to update.
 * @param {Partial<Omit<Address, 'id' | 'created_at' | 'updated_at'>>} addressData - The partial address data to update.
 * @returns {Promise<Address | null>} A promise that resolves to the updated address or null on error.
 */
export async function updateAddress(
  addressId: string,
  addressData: Partial<Omit<Address, 'id' | 'created_at' | 'updated_at'>>,
): Promise<Address | null> {
  const { data, error } = await supabase
    .from('addresses')
    .update(addressData)
    .eq('id', addressId)
    .select()
    .single();

  if (error) {
    console.error('Error updating address:', error.message);
    throw error;
  }
  return data;
}

/**
 * Deletes a shipping address.
 * @param {string} addressId - The ID of the address to delete.
 * @returns {Promise<void>} A promise that resolves when the address is deleted or rejects on error.
 */
export async function deleteAddress(addressId: string): Promise<void> {
  const { error } = await supabase
    .from('addresses')
    .delete()
    .eq('id', addressId);

  if (error) {
    console.error('Error deleting address:', error.message);
    throw error;
  }
}

/**
 * Fetches a list of all buyer profiles. (Admin only)
 * @returns {Promise<Profile[] | null>} A promise that resolves to an array of buyer profiles or null on error.
 */
export async function getAllBuyers(): Promise<Profile[] | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'buyer');

  if (error) {
    console.error('Error fetching all buyers:', error.message);
    throw error;
  }
  return data;
}

/**
 * Fetches details for a specific buyer by their ID. (Admin only)
 * @param {string} buyerId - The ID of the buyer to fetch.
 * @returns {Promise<Profile | null>} A promise that resolves to the buyer profile object or null if not found/error.
 */
export async function getBuyerById(buyerId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', buyerId)
    .single();

  if (error) {
    console.error('Error fetching buyer by ID:', error.message);
    throw error;
  }
  return data;
}

/**
 * Adds a new buyer account. (Admin only)
 * @param {Omit<Profile, 'id' | 'created_at' | 'updated_at'>} buyerData - The buyer data to insert.
 * @returns {Promise<Profile | null>} A promise that resolves to the created buyer profile or null on error.
 */
export async function createBuyer(
  buyerData: Omit<Profile, 'id' | 'created_at' | 'updated_at'>,
): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .insert([{ ...buyerData, role: 'buyer' }]) // Ensure role is 'buyer'
    .select()
    .single();

  if (error) {
    console.error('Error creating buyer:', error.message);
    throw error;
  }
  return data;
}

/**
 * Updates an existing buyer account. (Admin only)
 * @param {string} buyerId - The ID of the buyer to update.
 * @param {Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>} buyerData - The partial buyer data to update.
 * @returns {Promise<Profile | null>} A promise that resolves to the updated buyer profile or null on error.
 */
export async function updateBuyer(
  buyerId: string,
  buyerData: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>,
): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .update(buyerData)
    .eq('id', buyerId)
    .select()
    .single();

  if (error) {
    console.error('Error updating buyer:', error.message);
    throw error;
  }
  return data;
}
