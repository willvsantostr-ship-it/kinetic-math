import { useState, useEffect, useCallback } from 'react';
import { authService } from '../services/auth.service';
import type { AuthUser, AuthState } from '../types';

/**
 * Hook for managing authentication state.
 * Falls back to mock user when Supabase is not configured.
 */
export function useAuth(): AuthState & {
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string, displayName: string) => Promise<boolean>;
  signOut: () => Promise<void>;
} {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check current session on mount
    authService.getCurrentUser().then((u) => {
      setUser(u);
      setLoading(false);
    });

    // Listen for auth changes
    const { unsubscribe } = authService.onAuthChange((u) => {
      setUser(u);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = useCallback(async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    const u = await authService.signIn(email, password);
    setUser(u);
    setLoading(false);
    return u !== null;
  }, []);

  const signUp = useCallback(async (email: string, password: string, displayName: string): Promise<boolean> => {
    setLoading(true);
    const u = await authService.signUp(email, password, displayName);
    setUser(u);
    setLoading(false);
    return u !== null;
  }, []);

  const signOut = useCallback(async () => {
    setLoading(true);
    await authService.signOut();
    setUser(null);
    setLoading(false);
  }, []);

  return {
    user,
    loading,
    isAuthenticated: user !== null,
    signIn,
    signUp,
    signOut,
  };
}
