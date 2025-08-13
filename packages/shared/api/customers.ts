import { Profile } from './profiles';
import { getSupabase } from './supabase';

/**
 * Adds a new customer account. (Admin only)
 * @param {Omit<Profile, 'id' | 'created_at' | 'updated_at'>} customerData - The customer data to insert.
 * @returns {Promise<Profile | null>} A promise that resolves to the created customer profile or null on error.
 */
export async function createCustomer(
  customerData: Omit<Profile, 'created_at' | 'id' | 'updated_at'>,
): Promise<null | Profile> {
  const { data, error } = await getSupabase()
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
 * Fetches a list of all customer profiles. (Admin only)
 * @returns {Promise<Profile[] | null>} A promise that resolves to an array of customer profiles or null on error.
 */
export async function getAllCustomers(): Promise<null | Profile[]> {
  const { data, error } = await getSupabase()
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
): Promise<null | Profile> {
  const { data, error } = await getSupabase()
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
 * Updates an existing customer account. (Admin only)
 * @param {string} customerId - The ID of the customer to update.
 * @param {Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>} customerData - The partial customer data to update.
 * @returns {Promise<Profile | null>} A promise that resolves to the updated customer profile or null on error.
 */
export async function updateCustomer(
  customerId: string,
  customerData: Partial<Omit<Profile, 'created_at' | 'id' | 'updated_at'>>,
): Promise<null | Profile> {
  const { data, error } = await getSupabase()
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
