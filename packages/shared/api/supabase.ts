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
