import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider } from '../lib/auth-context';

// Mock Supabase
vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(() => Promise.resolve({ data: { session: null }, error: null })),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
      signOut: vi.fn(() => Promise.resolve({ error: null })),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      })),
    })),
  },
}));

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

describe('Auth Context', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should provide auth context to children', () => {
    const TestComponent = () => {
      const { user, loading } = useAuth();
      return (
        <div>
          <div data-testid="loading">{loading ? 'loading' : 'not loading'}</div>
          <div data-testid="user">{user ? user.full_name : 'no user'}</div>
        </div>
      );
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('loading')).toHaveTextContent('loading');
    expect(screen.getByTestId('user')).toHaveTextContent('no user');
  });

  it('should handle user sign out', async () => {
    const TestComponent = () => {
      const { signOut } = useAuth();
      return (
        <button onClick={signOut} data-testid="sign-out">
          Sign Out
        </button>
      );
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const signOutButton = screen.getByTestId('sign-out');
    signOutButton.click();

    await waitFor(() => {
      expect(require('../lib/supabase').supabase.auth.signOut).toHaveBeenCalled();
    });
  });
});

// Helper function to use auth context in tests
function useAuth() {
  const { useContext } = require('react');
  const { AuthContext } = require('../lib/auth-context');
  return useContext(AuthContext);
}
