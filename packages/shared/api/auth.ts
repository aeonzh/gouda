import { supabase } from './supabase';

let cachedClient: any;

export async function resetPasswordForEmail(email: string) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: 'http://localhost:8081/reset-password', // This should be a deep link or web URL for the password reset page
  });

  if (error) {
    console.error('Error resetting password:', error.message);
    throw error;
  }
  return data;
}

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
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
  const { error } = await supabase.auth.signOut();
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
  const { data, error } = await supabase.auth.signUp({
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

  return data;
}
