import { supabase } from './supabaseClient';
import type { User } from '@/types';

export async function signUp(username: string, email: string, phone: string, address: string, password: string) {
  if (!supabase) throw new Error('Store is not connected to the database yet.');
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { username, phone, address } },
  });
  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  if (!supabase) throw new Error('Store is not connected to the database yet.');
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  if (!supabase) return;
  await supabase.auth.signOut();
}

export async function fetchProfile(userId: string): Promise<User | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
  if (error || !data) return null;
  return data as User;
}

export async function updateProfileRow(userId: string, patch: Partial<User>): Promise<User> {
  if (!supabase) throw new Error('Store is not connected to the database yet.');
  const { data, error } = await supabase
    .from('profiles')
    .update(patch)
    .eq('id', userId)
    .select()
    .single();
  if (error) throw error;
  return data as User;
}

export async function insertProfileFallback(userId: string, patch: Partial<User>): Promise<User> {
  if (!supabase) throw new Error('Store is not connected to the database yet.');
  const { data, error } = await supabase
    .from('profiles')
    .upsert({ id: userId, ...patch })
    .select()
    .single();
  if (error) throw error;
  return data as User;
}
