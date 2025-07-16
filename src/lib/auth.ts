import { writable } from 'svelte/store';
import type { User, Session } from '@supabase/supabase-js';
import { getSupabase } from './supabaseClient';
import { browser } from '$app/environment';

// Auth stores
export const user = writable<User | null>(null);
export const session = writable<Session | null>(null);
export const loading = writable(true); // Start with loading=true

const supabase = getSupabase();

// Initialize auth state
export async function initAuth(initialSession?: Session | null) {
  if (!browser) {
    // On server, just set the initial session without loading
    if (initialSession !== undefined) {
      session.set(initialSession);
      user.set(initialSession?.user ?? null);
    }
    return;
  }
  
  // On client, get the session immediately (this should be fast if stored locally)
  const { data: { session: clientSession } } = await supabase.auth.getSession();
  session.set(clientSession);
  user.set(clientSession?.user ?? null);
  
  // Set loading to false as soon as we have the session
  loading.set(false);
  
  // Listen for auth changes (only in browser)
  // Listen for auth changes (only in browser)
  supabase.auth.onAuthStateChange((_event, newSession) => {
    session.set(newSession);
    user.set(newSession?.user ?? null);
  });
}

// Sign in with email
export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) {
    throw error;
  }
  
  return data;
}

// Sign up with email
export async function signUpWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  
  if (error) {
    throw error;
  }
  
  return data;
}

// Sign out
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    throw error;
  }
}

// Sign in with Google (OAuth)
export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`
    }
  });
  
  if (error) {
    throw error;
  }
  
  return data;
}
