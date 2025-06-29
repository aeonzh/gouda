import { createClient } from "@supabase/supabase-js";
import Constants from "expo-constants";

const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl;
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Supabase URL or Anon Key is not defined in app.json extra field."
  );
  // Fallback for development or error handling
  // In a production app, you might want to throw an error or prevent app load
}

export const supabase = createClient(
  supabaseUrl || "YOUR_SUPABASE_URL",
  supabaseAnonKey || "YOUR_SUPABASE_ANON_KEY"
);

export async function signUpWithEmail(
  email: string,
  password: string,
  fullName: string
) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) {
    console.error("Error signing up:", error.message);
    throw error;
  }

  // If user is successfully created, insert into profiles table
  if (data.user) {
    const { error: profileError } = await supabase.from("profiles").insert([
      {
        id: data.user.id,
        full_name: fullName,
        username: email, // Using email as username for simplicity, can be changed later
        role: "buyer", // Default role for new sign-ups
      },
    ]);

    if (profileError) {
      console.error("Error creating user profile:", profileError.message);
      // Consider rolling back user creation if profile creation fails, or handle as a separate issue
      throw profileError;
    }
  }

  return data;
}

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("Error signing in:", error.message);
    throw error;
  }
  return data;
}

export async function resetPasswordForEmail(email: string) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: "http://localhost:8081/reset-password", // This should be a deep link or web URL for the password reset page
  });

  if (error) {
    console.error("Error resetting password:", error.message);
    throw error;
  }
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("Error signing out:", error.message);
    throw error;
  }
}
