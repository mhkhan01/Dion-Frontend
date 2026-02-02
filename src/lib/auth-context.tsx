'use client';

import { createContext, useContext, useEffect, useState } from 'react';
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
  const [fetchingProfile, setFetchingProfile] = useState(false);
  const [fetchedUsers, setFetchedUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    let mounted = true;

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (mounted) {
          if (session?.user) {
            // Pass the actual session user to fetchUserProfile
            await fetchUserProfile(session.user);
          } else {
            setUser(null);
          }
          setLoading(false);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
        if (mounted) {
          setUser(null);
          setLoading(false);
        }
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (mounted) {
          if (session?.user) {
            // Check if we've already fetched this user
            if (fetchedUsers.has(session.user.id)) {
              setLoading(false);
              return;
            }
            
            // Additional check: don't fetch if we're already fetching
            if (fetchingProfile) {
              setLoading(false);
              return;
            }
            
            // Check if we already have this user with complete profile
            if (user && user.id === session.user.id && user.role && (user.role === 'contractor' || user.role === 'landlord')) {
              setLoading(false);
              return;
            }
            
            // Only fetch profile if we don't already have this user with complete profile
            if (!user || user.id !== session.user.id || !user.role) {
              // Pass the actual session user to fetchUserProfile
              await fetchUserProfile(session.user);
            }
          } else {
            // Handle sign out - clear user and cache
            setUser(null);
            setFetchedUsers(new Set());
          }
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (user: User) => {
    // Check if we've already fetched this user FIRST
    if (fetchedUsers.has(user.id)) {
      setFetchingProfile(false);
      setLoading(false);
      return;
    }
    
    // Prevent multiple simultaneous fetches
    if (fetchingProfile) {
      return;
    }
    
    // Check if we already have this user loaded to prevent loops
    if (user && user.id && user.email && user.role && user.role !== 'authenticated' && user.role !== 'unauthenticated') {
      // Create proper combined User & Profile object
      const combinedUser = {
        ...user,
        full_name: user.email?.split('@')[0] || 'User',
        role: user.role as 'contractor' | 'landlord' | 'admin'
      };
      setUser(combinedUser);
      setFetchingProfile(false);
      setLoading(false);
      return;
    }
    
    // Additional check: if we already have a user with the same ID and complete profile, don't fetch
    if (user && user.id && user.role && (user.role === 'contractor' || user.role === 'landlord')) {
      setFetchingProfile(false);
      setLoading(false);
      return;
    }
    
    setFetchingProfile(true);
    setFetchedUsers(prev => new Set(prev).add(user.id));
    
    try {
      // Determine role via backend API (bypasses RLS issues)
      let userRole: 'contractor' | 'landlord' | 'admin' = 'contractor';
      const backendUrl = 'https://jfgm6v6pkw.us-east-1.awsapprunner.com/api';

      // Call backend endpoints in parallel to check user role
      const [partnerResponse, clientResponse] = await Promise.all([
        fetch(`${backendUrl}/partner-login-check`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id }),
        }).then(res => res.json()).catch(() => ({ exists: false })),
        fetch(`${backendUrl}/client-login-check`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id }),
        }).then(res => res.json()).catch(() => ({ exists: false }))
      ]);

      // Determine role based on which table the user exists in
      if (partnerResponse.exists) {
        userRole = 'landlord';
      } else if (clientResponse.exists) {
        userRole = 'contractor';
      } else {
        // Fallback: email-based (if backend calls fail)
        if (user.email && user.email.includes('landlord')) {
          userRole = 'landlord';
        }
      }

      const basicUser = {
        ...user,
        full_name: user.email?.split('@')[0] || 'User',
        role: userRole,
        is_active: true,
        email_verified: user.email_confirmed_at ? true : false
      };

      setUser(basicUser);
      setFetchingProfile(false);
      setLoading(false);
      return;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // Fallback: email-based
      const fallbackRole: 'contractor' | 'landlord' | 'admin' =
        user.email && user.email.includes('landlord') ? 'landlord' : 'contractor';
      const fallbackUser = {
        ...user,
        full_name: user.email?.split('@')[0] || 'User',
        role: fallbackRole
      };
      setUser(fallbackUser);
      setFetchingProfile(false);
      setLoading(false);
    } finally {
      setFetchingProfile(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setFetchedUsers(new Set());
  };

  const value = {
    user,
    loading,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
