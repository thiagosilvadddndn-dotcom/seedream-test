import { supabaseAdmin } from './supabase-admin';
import { User } from './supabase';

export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('users_profile')
      .select('*')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error fetching user by email:', error);
    return null;
  }
}

export async function createUser(userData: {
  email: string;
  name?: string;
  avatar?: string;
}): Promise<User | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('users_profile')
      .insert({
        ...userData,
        credits: 12,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error creating user:', error);
    return null;
  }
}

export async function updateUserCredits(email: string, credits: number): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .from('users_profile')
      .update({ 
        credits,
        updated_at: new Date().toISOString()
      })
      .eq('email', email);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error updating user credits:', error);
    return false;
  }
}

export async function getUserCredits(email: string): Promise<number> {
  try {
    const { data, error } = await supabaseAdmin
      .from('users_profile')
      .select('credits')
      .eq('email', email)
      .single();

    if (error) {
      throw error;
    }

    return data.credits || 0;
  } catch (error) {
    console.error('Error fetching user credits:', error);
    return 0;
  }
} 