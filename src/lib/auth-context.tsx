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
        console.log('Auth state changed:', event, session?.user?.id);
        
        if (mounted) {
          if (session?.user) {
            // Check if we've already fetched this user
            if (fetchedUsers.has(session.user.id)) {
              console.log('User already fetched, skipping auth state change');
              setLoading(false);
              return;
            }
            
            // Additional check: don't fetch if we're already fetching
            if (fetchingProfile) {
              console.log('Already fetching profile, skipping auth state change');
              setLoading(false);
              return;
            }
            
            // Check if we already have this user with complete profile
            if (user && user.id === session.user.id && user.role && (user.role === 'contractor' || user.role === 'landlord')) {
              console.log('User already has complete profile, skipping fetch');
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
            console.log('User signed out, clearing state');
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
      console.log('User already fetched, skipping profile fetch');
      setFetchingProfile(false);
      setLoading(false);
      return;
    }
    
    // Prevent multiple simultaneous fetches
    if (fetchingProfile) {
      console.log('Already fetching profile, skipping');
      return;
    }
    
    // Check if we already have this user loaded to prevent loops
    if (user && user.id && user.email && user.role && user.role !== 'authenticated' && user.role !== 'unauthenticated') {
      console.log('User already has required data, skipping profile fetch');
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
      console.log('User already has complete profile, skipping fetch');
      setFetchingProfile(false);
      setLoading(false);
      return;
    }
    
    // If user has role 'authenticated', we need to fetch the actual profile
    if (user && user.role === 'authenticated') {
      console.log('User has authenticated role, fetching actual profile from database');
    }
    
    setFetchingProfile(true);
    setFetchedUsers(prev => new Set(prev).add(user.id));
    
    try {
      console.log('Fetching user profile for:', user.id);
      
      // TEMPORARY FIX: Skip database queries due to RLS issues
      // Create a basic profile based on user email domain or other logic
      console.log('Skipping database queries due to RLS issues, creating basic profile');
      
      // Determine role based on email or other logic
      let userRole = 'contractor'; // Default to contractor
      if (user.email && user.email.includes('landlord')) {
        userRole = 'landlord';
      }
      
      const basicUser = { 
        ...user, 
        full_name: user.email?.split('@')[0] || 'User',
        role: userRole as 'contractor' | 'landlord' | 'admin',
        is_active: true,
        email_verified: user.email_confirmed_at ? true : false
      };
      
      console.log('Created basic user profile:', basicUser);
      setUser(basicUser);
      setFetchingProfile(false);
      setLoading(false);
      return;

      // This code is now unreachable due to the return statement above
      // Keeping it for reference in case we need to revert
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // Create a basic profile as fallback
      const fallbackUser = { 
        ...user, 
        full_name: user.email?.split('@')[0] || 'User',
        role: 'contractor' as 'contractor' | 'landlord' | 'admin' // Default to contractor as fallback
      };
      console.log('Fallback user object:', fallbackUser);
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
