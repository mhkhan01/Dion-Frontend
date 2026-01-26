'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [userType, setUserType] = useState<'client' | 'partner' | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if user has a valid session (they should be logged in via the reset link)
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth/login?message=Invalid or expired reset link');
      } else {
        // Determine user type by checking which table they exist in
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Check contractor table first
          const { data: contractorProfile } = await supabase
            .from('contractor')
            .select('id')
            .eq('id', user.id)
            .maybeSingle();
          
          if (contractorProfile) {
            setUserType('client');
          } else {
            // Check landlord table
            const { data: landlordProfile } = await supabase
              .from('landlord')
              .select('id')
              .eq('id', user.id)
              .maybeSingle();
            
            if (landlordProfile) {
              setUserType('partner');
            }
          }
        }
      }
    };
    checkSession();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Validate password length
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        setError(error.message);
      } else {
        setMessage('Password updated successfully! Redirecting to login...');
        // Redirect to login after 2 seconds with the correct user type
        setTimeout(() => {
          const loginType = userType === 'client' ? 'client' : userType === 'partner' ? 'partner' : '';
          const loginUrl = loginType 
            ? `/auth/login?type=${loginType}&message=Password updated successfully`
            : '/auth/login?message=Password updated successfully';
          router.push(loginUrl);
        }, 2000);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{
      backgroundImage: 'url(/360_F_281897358_3rj9ZBSZHo5s0L1ug7uuIHadSxh9Cc75.webp)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }}>
      {/* Background Image Opacity Overlay */}
      <div className="absolute inset-0 bg-white/30 pointer-events-none"></div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen py-4 px-2 sm:py-8 sm:px-4 pb-12 sm:pb-16">
        {/* Logo */}
        <div className="mb-4 sm:mb-8 w-full max-w-xs sm:max-w-2xl py-2">
          <Image
            src="/blue-teal.webp"
            alt="Booking Hub Logo"
            width={800}
            height={200}
            className="w-full h-auto object-contain"
            style={{ maxWidth: '100%' }}
            priority
          />
        </div>

        {/* Form Container */}
        <div className="bg-white/95 backdrop-blur-sm rounded-xl sm:rounded shadow-xl sm:shadow-lg p-4 sm:p-6 lg:p-8 w-full max-w-sm sm:max-w-lg lg:max-w-2xl border border-gray-200/50 sm:border-gray-200">
          {/* Form Title */}
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-booking-dark mb-6 sm:mb-8 text-center leading-tight">
            Set New Password
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-4">
                <div className="text-sm text-red-800">{error}</div>
              </div>
            )}

            {message && (
              <div className="rounded-xl bg-green-50 border border-green-200 p-4">
                <div className="text-sm text-green-800">{message}</div>
              </div>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-booking-dark mb-2">
                New Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your new password"
                required
                minLength={6}
                className="w-full px-4 py-3 border border-booking-teal rounded focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-booking-dark mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your new password"
                required
                minLength={6}
                className="w-full px-4 py-3 border border-booking-teal rounded focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-booking-teal text-white font-bold py-4 px-6 rounded hover:bg-opacity-90 transition-all duration-200 text-lg"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Updating Password...
                  </div>
                ) : (
                  'Update Password'
                )}
              </button>
            </div>

            <div className="text-center">
              <p className="text-sm text-booking-gray">
                Remember your password?{' '}
                <Link 
                  href={userType ? `/auth/login?type=${userType}` : '/auth/login'} 
                  onClick={(e) => { 
                    e.preventDefault(); 
                    const loginUrl = userType ? `/auth/login?type=${userType}` : '/auth/login';
                    window.location.href = loginUrl;
                  }}
                  className="text-booking-teal hover:text-booking-dark font-medium"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
