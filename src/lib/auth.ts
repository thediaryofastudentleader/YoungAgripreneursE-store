// auth.ts
import { supabase } from './supabaseClient';
import type { User } from '@/types';

export async function signUp(username: string, email: string, phone: string, address: string, password: string) {
  if (!supabase) throw new Error('Store is not connected to the database yet.');
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { 
      data: { 
        username, 
        phone, 
        address 
      } 
    },
  });

  if (error) {
    console.error('Signup error details:', error);
    throw error;
  }
  
  // The signUp function returns { user, session } directly
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

// ✅ FIXED: Wait for trigger to create profile
export async function fetchProfile(userId: string): Promise<User | null> {
  if (!supabase) return null;
  
  // Wait for trigger to create profile (max 5 seconds)
  let attempts = 0;
  while (attempts < 10) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
      
    if (error) {
      console.error('Profile fetch error:', error);
      return null;
    }
    
    if (data) return data as User;
    
    // Wait 500ms before retrying
    await new Promise(resolve => setTimeout(resolve, 500));
    attempts++;
  }
  
  return null;
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
    .upsert({ 
      id: userId, 
      ...patch,
      username: patch.username || patch.email?.split('@')[0] || 'user',
      email: patch.email || ''
    })
    .select()
    .single();
  if (error) throw error;
  return data as User;
}
