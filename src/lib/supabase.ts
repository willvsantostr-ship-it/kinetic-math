import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/**
 * Supabase client instance.
 * Returns null when environment variables are not configured,
 * allowing the app to gracefully fall back to mock data.
 */
let supabase: SupabaseClient | null = null;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

export { supabase };

/**
 * Returns true if Supabase is properly configured and available.
 */
export const isSupabaseConfigured = (): boolean => {
  return supabase !== null;
};
