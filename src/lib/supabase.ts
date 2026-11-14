import { createClient } from '@supabase/supabase-js';

const supabaseUrl = __SUPABASE_URL__.trim();
const supabasePublishableKey = __SUPABASE_PUBLISHABLE_KEY__.trim();

export const supabase = supabaseUrl && supabasePublishableKey
  ? createClient(supabaseUrl, supabasePublishableKey)
  : null;

export const isSupabaseConfigured = Boolean(supabase);
