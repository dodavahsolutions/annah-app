'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  /** Best display name: full name → first name → email prefix → "Guest". */
  displayName: string;
  /** First name for greetings: first_name → first token of full name → email prefix → "". */
  firstName: string;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  displayName: 'Guest',
  firstName: '',
  signOut: async () => {},
});

// Derive friendly names from Supabase user metadata, with sensible fallbacks.
function deriveNames(user: User | null): { displayName: string; firstName: string } {
  const meta = (user?.user_metadata ?? {}) as Record<string, unknown>;
  const fullName = typeof meta.full_name === 'string' ? meta.full_name.trim() : '';
  const metaFirst = typeof meta.first_name === 'string' ? meta.first_name.trim() : '';
  const emailPrefix = user?.email?.split('@')[0] ?? '';
  return {
    displayName: fullName || metaFirst || emailPrefix || 'Guest',
    firstName: metaFirst || fullName.split(/\s+/)[0] || emailPrefix || '',
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  // When Supabase isn't configured we're guest-only from the start, so loading
  // begins false — avoids a synchronous setState in the effect for that path.
  const [loading, setLoading] = useState(isSupabaseConfigured());

  useEffect(() => {
    const supabase = createClient();

    // No Supabase configured → guest-only. Mirrors the middleware env guard so
    // the browser never throws at hydration.
    if (!supabase) return;

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    const supabase = createClient();
    if (!supabase) return;
    await supabase.auth.signOut();
  };

  const { displayName, firstName } = deriveNames(user);

  return (
    <AuthContext.Provider value={{ user, loading, displayName, firstName, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
