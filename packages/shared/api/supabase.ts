import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

let cachedClient: any;

export function getSupabase() {
  if (!cachedClient) {
    const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl;
    const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error(
        'Supabase URL or Anon Key is not defined in app.json extra field.',
      );
    }
    cachedClient = createClient(supabaseUrl, supabaseAnonKey);
  }
  return cachedClient;
}

// Backward-compatible proxy so existing imports of `supabase` continue to work
// without forcing eager initialization at module load.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabase = new Proxy({} as any, {
  get(_target, property) {
    const client = getSupabase();
    // @ts-expect-error dynamic access passthrough
    return client[property as any];
  },
}) as any;

export async function resetPasswordForEmail(email: string) {
  const { data, error } = await getSupabase().auth.resetPasswordForEmail(email, {
    redirectTo: 'http://localhost:8081/reset-password', // This should be a deep link or web URL for the password reset page
  });

  if (error) {
    console.error('Error resetting password:', error.message);
    throw error;
  }
  return data;
}

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await getSupabase().auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('Error signing in:', error.message);
    throw error;
  }
  return data;
}

export async function signOut() {
  const { error } = await getSupabase().auth.signOut();
  if (error) {
    console.error('Error signing out:', error.message);
    throw error;
  }
}

export async function signUpWithEmail(
  email: string,
  password: string,
  fullName: string,
) {
  const { data, error } = await getSupabase().auth.signUp({
    email,
    options: {
      data: {
        full_name: fullName,
      },
    },
    password,
  });

  if (error) {
    console.error('Error signing up:', error.message);
    throw error;
  }

  // If user is successfully created, insert into profiles table
  if (data.user) {
    const { error: profileError } = await getSupabase().from('profiles').insert([
      {
        full_name: fullName,
        id: data.user.id,
        role: 'customer', // Default role for new sign-ups
        username: email, // Using email as username for simplicity, can be changed later
      },
    ]);

    if (profileError) {
      console.error('Error creating user profile:', profileError.message);
      // Consider rolling back user creation if profile creation fails, or handle as a separate issue
      throw profileError;
    }
  }

  return data;
}
