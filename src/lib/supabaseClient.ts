import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export function getSupabase() {
  if (!supabaseUrl || !supabaseAnonKey) return null;
  return supabase;
}

// Storage bucket used for proof-of-payment uploads (create this bucket
// in Supabase → Storage, see supabase/schema.sql section 10).
export const PROOFS_BUCKET = 'proofs';
