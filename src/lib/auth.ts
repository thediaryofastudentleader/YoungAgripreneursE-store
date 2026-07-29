import { supabase } from './supabaseClient';
import type { User } from '@/types';

// In your registration component/page
async function handleRegister(formData: FormData) {
  try {
    const { user, session } = await signUp(
      formData.username,
      formData.email,
      formData.phone,
      formData.address,
      formData.password
    );

    if (!user) {
      throw new Error('Registration failed');
    }

    // ✅ Check if email confirmation is required
    if (!session) {
      // No session = email confirmation required
      // Redirect to a "check your email" page or show a message
      router.push('/verify-email?email=' + encodeURIComponent(formData.email));
      return;
    }

    // ✅ Only fetch profile if we have a valid session
    const profile = await fetchProfile(user.id);
    
    if (profile) {
      router.push('/dashboard');
    } else {
      // Profile might not exist yet, try fallback
      const newProfile = await insertProfileFallback(user.id, {
        username: formData.username,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
      });
      router.push('/dashboard');
    }

  } catch (error) {
    console.error('Registration error:', error);
    // Show error to user
  }
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

// Updated fetchProfile - don't use .single() which causes 406
export async function fetchProfile(userId: string): Promise<User | null> {
  if (!supabase) return null;
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle(); // ✅ Use maybeSingle() instead of single()
  
  // Log for debugging
  if (error) {
    console.warn('fetchProfile error:', error.message, error.code);
  }
  
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
