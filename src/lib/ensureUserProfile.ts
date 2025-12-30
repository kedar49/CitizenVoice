import { supabase } from '@/lib/supabase/client';

/**
 * Ensures a user profile exists in the public.users table
 * Call this before any operation that requires the user profile
 */
export async function ensureUserProfile(userId: string, email: string) {
  try {
    // Check if profile exists
    const { data: existingProfile, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();

    // If profile exists, we're good
    if (existingProfile) {
      return { success: true, profile: existingProfile };
    }

    // Profile doesn't exist, create it
    const { data: newProfile, error: insertError } = await supabase
      .from('users')
      .insert({
        id: userId,
        email: email,
        role: 'citizen'
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating user profile:', insertError);
      return { success: false, error: insertError };
    }

    return { success: true, profile: newProfile };
  } catch (error) {
    console.error('Error ensuring user profile:', error);
    return { success: false, error };
  }
}
