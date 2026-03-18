import { supabase } from '../lib/supabase';
import type { AuthUser } from '../types';

// --- Mock Data ---

const MOCK_USER: AuthUser = {
  id: 'mock-user-001',
  email: 'arthur@kineticmath.co',
  display_name: 'Arthur Pentágono',
};

// --- Auth Service ---

export const authService = {
  /**
   * Get current session user
   */
  async getCurrentUser(): Promise<AuthUser | null> {
    if (!supabase) return MOCK_USER;

    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;

    return {
      id: user.id,
      email: user.email ?? '',
      display_name: user.user_metadata?.display_name ?? 'Estudante',
    };
  },

  /**
   * Sign in with email and password
   */
  async signIn(email: string, password: string): Promise<AuthUser | null> {
    if (!supabase) return MOCK_USER;

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) return null;

    return {
      id: data.user.id,
      email: data.user.email ?? '',
      display_name: data.user.user_metadata?.display_name ?? 'Estudante',
    };
  },

  /**
   * Sign up with email, password and display name
   */
  async signUp(email: string, password: string, displayName: string): Promise<AuthUser | null> {
    if (!supabase) return MOCK_USER;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
      },
    });
    if (error || !data.user) return null;

    return {
      id: data.user.id,
      email: data.user.email ?? '',
      display_name: displayName,
    };
  },

  /**
   * Sign out
   */
  async signOut(): Promise<void> {
    if (!supabase) return;
    await supabase.auth.signOut();
  },

  /**
   * Listen to auth state changes
   */
  onAuthChange(callback: (user: AuthUser | null) => void) {
    if (!supabase) {
      callback(MOCK_USER);
      return { unsubscribe: () => {} };
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        callback({
          id: session.user.id,
          email: session.user.email ?? '',
          display_name: session.user.user_metadata?.display_name ?? 'Estudante',
        });
      } else {
        callback(null);
      }
    });

    return { unsubscribe: () => subscription.unsubscribe() };
  },
};
