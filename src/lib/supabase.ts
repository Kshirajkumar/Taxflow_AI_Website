import { createClient } from '@supabase/supabase-js';

const supabaseUrl = __SUPABASE_URL__.trim();
const supabaseAnonKey = __SUPABASE_ANON_KEY__.trim();

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const isSupabaseConfigured = Boolean(supabase);
