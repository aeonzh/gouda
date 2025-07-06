import { supabase } from './supabase';

export interface Profile {
  id: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
  role: 'customer' | 'admin' | 'sales_agent';
  created_at: string;
  updated_at: string;
}

export interface BusinessDetails {
  id: string;
  profile_id: string;
  business_name: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
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
 * Fetches business details for a profile.
 * @param {string} profileId - The ID of the profile.
 * @returns {Promise<BusinessDetails | null>} A promise that resolves to the business details object or null if not found/error.
 */
export async function getBusinessDetails(
  profileId: string,
): Promise<BusinessDetails | null> {
  const { data, error } = await supabase
    .from('business_details')
    .select('*')
    .eq('profile_id', profileId)
    .single();

  if (error) {
    console.error('Error fetching business details:', error.message);
    throw error;
  }
  return data;
}

/**
 * Adds new business details for a profile.
 * @param {Omit<BusinessDetails, 'id' | 'created_at' | 'updated_at'>} businessDetailsData - The business details data to insert.
 * @returns {Promise<BusinessDetails | null>} A promise that resolves to the created business details or null on error.
 */
export async function addBusinessDetails(
  businessDetailsData: Omit<
    BusinessDetails,
    'id' | 'created_at' | 'updated_at'
  >,
): Promise<BusinessDetails | null> {
  const { data, error } = await supabase
    .from('business_details')
    .insert([businessDetailsData])
    .select()
    .single();

  if (error) {
    console.error('Error adding business details:', error.message);
    throw error;
  }
  return data;
}

/**
 * Updates existing business details.
 * @param {string} businessDetailsId - The ID of the business details to update.
 * @param {Partial<Omit<BusinessDetails, 'id' | 'created_at' | 'updated_at'>>} businessDetailsData - The partial business details data to update.
 * @returns {Promise<BusinessDetails | null>} A promise that resolves to the updated business details or null on error.
 */
export async function updateBusinessDetails(
  businessDetailsId: string,
  businessDetailsData: Partial<
    Omit<BusinessDetails, 'id' | 'created_at' | 'updated_at'>
  >,
): Promise<BusinessDetails | null> {
  const { data, error } = await supabase
    .from('business_details')
    .update(businessDetailsData)
    .eq('id', businessDetailsId)
    .select()
    .single();

  if (error) {
    console.error('Error updating business details:', error.message);
    throw error;
  }
  return data;
}

/**
 * Deletes business details.
 * @param {string} businessDetailsId - The ID of the business details to delete.
 * @returns {Promise<void>} A promise that resolves when the business details are deleted or rejects on error.
 */
export async function deleteBusinessDetails(
  businessDetailsId: string,
): Promise<void> {
  const { error } = await supabase
    .from('business_details')
    .delete()
    .eq('id', businessDetailsId);

  if (error) {
    console.error('Error deleting business details:', error.message);
    throw error;
  }
}

/**
 * Fetches a list of all customer profiles. (Admin only)
 * @returns {Promise<Profile[] | null>} A promise that resolves to an array of customer profiles or null on error.
 */
export async function getAllCustomers(): Promise<Profile[] | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'customer');

  if (error) {
    console.error('Error fetching all customers:', error.message);
    throw error;
  }
  return data;
}

/**
 * Fetches details for a specific customer by their ID. (Admin only)
 * @param {string} customerId - The ID of the customer to fetch.
 * @returns {Promise<Profile | null>} A promise that resolves to the customer profile object or null if not found/error.
 */
export async function getcustomerById(
  customerId: string,
): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', customerId)
    .single();

  if (error) {
    console.error('Error fetching customer by ID:', error.message);
    throw error;
  }
  return data;
}

/**
 * Adds a new customer account. (Admin only)
 * @param {Omit<Profile, 'id' | 'created_at' | 'updated_at'>} customerData - The customer data to insert.
 * @returns {Promise<Profile | null>} A promise that resolves to the created customer profile or null on error.
 */
export async function createCustomer(
  customerData: Omit<Profile, 'id' | 'created_at' | 'updated_at'>,
): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .insert([{ ...customerData, role: 'customer' }]) // Ensure role is 'customer'
    .select()
    .single();

  if (error) {
    console.error('Error creating customer:', error.message);
    throw error;
  }
  return data;
}

/**
 * Updates an existing customer account. (Admin only)
 * @param {string} customerId - The ID of the customer to update.
 * @param {Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>} customerData - The partial customer data to update.
 * @returns {Promise<Profile | null>} A promise that resolves to the updated customer profile or null on error.
 */
export async function updateCustomer(
  customerId: string,
  customerData: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>,
): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .update(customerData)
    .eq('id', customerId)
    .select()
    .single();

  if (error) {
    console.error('Error updating customer:', error.message);
    throw error;
  }
  return data;
}
