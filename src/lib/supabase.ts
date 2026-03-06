import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Safari (especially Private Browsing mode) can block or severely restrict
// localStorage, causing Supabase session persistence to silently fail.
// This wrapper detects unavailable localStorage and falls back to in-memory
// storage so the auth flow still works on every browser.
const createSafeStorage = () => {
  if (typeof window === 'undefined') return undefined;
  try {
    const testKey = '__sb_storage_test__';
    window.localStorage.setItem(testKey, '1');
    window.localStorage.removeItem(testKey);
    // localStorage is available — return undefined so Supabase uses its own
    // built-in LocalStorageAdapter (the proven default). Passing window.localStorage
    // directly bypasses that adapter and can cause subtle session-persistence issues.
    return undefined;
  } catch {
    // localStorage is blocked (Safari Private Browsing, sandboxed iframe, etc.)
    // Provide a simple in-memory fallback so auth still works for the session.
    const mem: Record<string, string> = {};
    return {
      getItem: (key: string) => mem[key] ?? null,
      setItem: (key: string, value: string) => { mem[key] = value; },
      removeItem: (key: string) => { delete mem[key]; },
    };
  }
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: createSafeStorage() as Storage | undefined,
    autoRefreshToken: true,
    persistSession: true,
    // Required for Supabase email-confirmation links to restore the session
    // automatically when the user lands back on the app after clicking the
    // verification email (works on Chrome, Safari, Firefox, Edge).
    detectSessionInUrl: true,
  },
});

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          role: 'contractor' | 'landlord' | 'admin';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          role: 'contractor' | 'landlord' | 'admin';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          role?: 'contractor' | 'landlord' | 'admin';
          created_at?: string;
          updated_at?: string;
        };
      };
      properties: {
        Row: {
          id: string;
          owner_id: string;
          title: string;
          description: string | null;
          address: string;
          lat: number | null;
          lng: number | null;
          price: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          title: string;
          description?: string | null;
          address: string;
          lat?: number | null;
          lng?: number | null;
          price: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          title?: string;
          description?: string | null;
          address?: string;
          lat?: number | null;
          lng?: number | null;
          price?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      bookings: {
        Row: {
          id: string;
          property_id: string;
          contractor_id: string;
          start_date: string;
          end_date: string;
          status: 'pending' | 'confirmed' | 'cancelled' | 'paid';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          contractor_id: string;
          start_date: string;
          end_date: string;
          status?: 'pending' | 'confirmed' | 'cancelled' | 'paid';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          property_id?: string;
          contractor_id?: string;
          start_date?: string;
          end_date?: string;
          status?: 'pending' | 'confirmed' | 'cancelled' | 'paid';
          created_at?: string;
          updated_at?: string;
        };
      };
      invoices: {
        Row: {
          id: string;
          booking_id: string;
          stripe_session_id: string | null;
          stripe_payment_url: string | null;
          amount: number;
          status: 'unpaid' | 'paid';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          booking_id: string;
          stripe_session_id?: string | null;
          stripe_payment_url?: string | null;
          amount: number;
          status?: 'unpaid' | 'paid';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          booking_id?: string;
          stripe_session_id?: string | null;
          stripe_payment_url?: string | null;
          amount?: number;
          status?: 'unpaid' | 'paid';
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};
