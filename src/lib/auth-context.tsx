'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from './supabase';

interface Profile {
  id: string;
  full_name: string;
  role: 'contractor' | 'landlord' | 'admin';
}

interface AuthContextType {
  user: (User & Profile) | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<(User & Profile) | null>(null);
  const [loading, setLoading] = useState(true);

  // Using refs instead of state for these guards so that the onAuthStateChange
  // callback (set up once with an empty dependency array) always sees the
  // current values — not stale values from the initial render closure.
  const fetchedUsersRef = useRef<Set<string>>(new Set());
  const fetchingProfileRef = useRef(false);
  const isMountedRef = useRef(true);

  const fetchUserProfile = async (supabaseUser: User) => {
    if (fetchedUsersRef.current.has(supabaseUser.id) || fetchingProfileRef.current) {
      return;
    }

    fetchingProfileRef.current = true;
    fetchedUsersRef.current.add(supabaseUser.id);

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://jfgm6v6pkw.us-east-1.awsapprunner.com/api';

      const [partnerResponse, clientResponse] = await Promise.all([
        fetch(`${backendUrl}/partner-login-check`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: supabaseUser.id }),
        })
          .then(res => (res.ok ? res.json() : { exists: false }))
          .catch(() => ({ exists: false })),

        fetch(`${backendUrl}/client-login-check`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: supabaseUser.id }),
        })
          .then(res => (res.ok ? res.json() : { exists: false }))
          .catch(() => ({ exists: false })),
      ]);

      let userRole: 'contractor' | 'landlord' | 'admin' = 'contractor';
      if (partnerResponse.exists) {
        userRole = 'landlord';
      } else if (clientResponse.exists) {
        userRole = 'contractor';
      }

      if (isMountedRef.current) {
        setUser({
          ...supabaseUser,
          full_name:
            supabaseUser.user_metadata?.full_name ||
            supabaseUser.email?.split('@')[0] ||
            'User',
          role: userRole,
        });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      const fallbackRole: 'contractor' | 'landlord' | 'admin' =
        supabaseUser.email?.includes('landlord') ? 'landlord' : 'contractor';

      if (isMountedRef.current) {
        setUser({
          ...supabaseUser,
          full_name:
            supabaseUser.user_metadata?.full_name ||
            supabaseUser.email?.split('@')[0] ||
            'User',
          role: fallbackRole,
        });
      }
    } finally {
      fetchingProfileRef.current = false;
    }
  };

  useEffect(() => {
    isMountedRef.current = true;

    // Use onAuthStateChange exclusively — it fires an INITIAL_SESSION event
    // immediately on mount with the current stored session, so a separate
    // getInitialSession() call is not needed.
    //
    // IMPORTANT: setLoading(false) is called only AFTER await fetchUserProfile()
    // completes. Running both getInitialSession and onAuthStateChange in parallel
    // creates a race where getInitialSession can call setLoading(false) with
    // user=null before the profile fetch triggered by INITIAL_SESSION finishes,
    // causing dashboard pages to incorrectly redirect to login on every refresh.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMountedRef.current) return;

      if (session?.user) {
        // fetchedUsersRef is always current (ref, not state) — no stale closure
        if (!fetchedUsersRef.current.has(session.user.id)) {
          await fetchUserProfile(session.user);
        }
      } else {
        setUser(null);
        fetchedUsersRef.current.clear();
        fetchingProfileRef.current = false;
      }

      // Only set loading=false after the profile fetch above has fully resolved.
      // This prevents any consumer from seeing loading=false with user=null
      // during the async profile fetch window.
      if (isMountedRef.current) {
        setLoading(false);
      }
    });

    return () => {
      isMountedRef.current = false;
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    fetchedUsersRef.current.clear();
    fetchingProfileRef.current = false;
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
