'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

function LoginContent() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const userType = searchParams.get('type') || 'contractor'; // Default to contractor

  useEffect(() => {
    const message = searchParams.get('message');
    if (message) {
      setSuccessMessage(message);
    }
  }, [searchParams]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        // Handle email not confirmed error
        if (error.message.includes('email not confirmed') || error.message.includes('Email not confirmed')) {
          setError('Your email is not confirmed. Please contact support or try signing up again.');
        } else if (error.message.includes('Invalid login credentials')) {
          setError('Invalid email or password. Please check your credentials.');
        } else {
          setError(error.message);
        }
        return;
      }

      // Wait a moment for auth state to update
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get user profile to determine role and redirect appropriately
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      console.log('Auth user after login:', authUser);
      
      if (authUser) {
        try {
          // Check contractor table first
          const { data: contractorProfile, error: contractorError } = await supabase
            .from('contractor')
            .select('role, email')
            .eq('id', authUser.id)
            .maybeSingle();

          console.log('Contractor check result:', { contractorProfile, contractorError });

          // Check landlord table
          const { data: landlordProfile, error: landlordError } = await supabase
            .from('landlord')
            .select('role, email')
            .eq('id', authUser.id)
            .maybeSingle();

          console.log('Landlord check result:', { landlordProfile, landlordError });

          // Determine expected user type based on URL parameter
          const expectedUserType = userType; // 'contractor' or 'landlord'

          // If user is trying to login as contractor
          if (expectedUserType === 'contractor') {
            if (!contractorProfile) {
              // User doesn't exist in contractor table
              await supabase.auth.signOut(); // Sign them out
              setError('This email does not have a client account. Please sign up as a client or try logging in as a partner.');
              return;
            }
            // User exists in contractor table, redirect to contractor dashboard
            console.log('Redirecting to contractor dashboard');
            router.push('/contractor');
            return;
          }

          // If user is trying to login as landlord
          if (expectedUserType === 'landlord') {
            if (!landlordProfile) {
              // User doesn't exist in landlord table
              await supabase.auth.signOut(); // Sign them out
              setError('This email does not have a partner account. Please sign up as a partner or try logging in as a client.');
              return;
            }
            // User exists in landlord table, redirect to landlord dashboard
            console.log('Redirecting to landlord dashboard');
            router.push('/landlord');
            return;
          }

          // Fallback: If no userType specified, check both tables and redirect appropriately
          if (contractorProfile && !contractorError) {
            console.log('Redirecting to contractor dashboard');
            router.push('/contractor');
            return;
          }

          if (landlordProfile && !landlordError) {
            console.log('Redirecting to landlord dashboard');
            router.push('/landlord');
            return;
          }

          // If no profile found in either table, sign them out and show error
          await supabase.auth.signOut();
          setError('No account profile found. Please contact support or create a new account.');
        } catch (error) {
          console.error('Error checking user profile:', error);
          // Sign out on error
          await supabase.auth.signOut();
          setError('An error occurred while checking your account. Please try again.');
        }
      } else {
        console.log('No auth user found, redirecting to home');
        router.push('/');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{
      backgroundImage: 'url(/Houses%20-%202.webp)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }}>
      {/* Background Image Opacity Overlay */}
      <div className="absolute inset-0 bg-[rgba(11,29,52,0.88)] pointer-events-none"></div>

      {/* Back Button */}
      <Link 
        href="/" 
        className="absolute top-4 left-4 z-20 flex items-center gap-3 text-[#F6F6F4] transition-colors duration-200 group hover:text-[#00BAB5]"
        aria-label="Back to home"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-8 w-8 sm:h-10 sm:w-10" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span className="text-xl sm:text-2xl font-bold text-[#F6F6F4]">Back</span>
      </Link>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen py-4 px-2 sm:py-8 sm:px-4 pb-12 sm:pb-16">
        {/* Form Container */}
        <div className="bg-white/95 backdrop-blur-sm rounded-xl sm:rounded shadow-xl sm:shadow-lg p-6 sm:p-6 lg:p-8 w-full max-w-xs sm:max-w-lg lg:max-w-2xl border border-gray-200/50 sm:border-gray-200 mt-4 mb-4 sm:mt-0 sm:mb-0">
          
          {/* Form Title */}
          <h1 className="text-base sm:text-2xl lg:text-3xl font-bold text-booking-dark mb-4 sm:mb-8 text-center leading-tight">
            Sign In to Your Account
          </h1>

          <form className="space-y-3 sm:space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-3 sm:p-4">
                <div className="text-xs sm:text-sm text-red-800">{error}</div>
              </div>
            )}

            {successMessage && (
              <div className="rounded-xl bg-green-50 border border-green-200 p-3 sm:p-4">
                <div className="text-xs sm:text-sm text-green-800">{successMessage}</div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-booking-dark mb-1 sm:mb-2">
                Email Address
              </label>
              <input
                {...register('email')}
                type="email"
                autoComplete="email"
                className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-booking-teal rounded focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent ${errors.email ? 'border-red-500' : ''}`}
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-booking-dark mb-1 sm:mb-2">
                Password
              </label>
              <input
                {...register('password')}
                type="password"
                autoComplete="current-password"
                className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-booking-teal rounded focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent ${errors.password ? 'border-red-500' : ''}`}
                placeholder="Enter your password"
              />
              {errors.password && (
                <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <Link 
                href="/auth/forgot-password" 
                className="text-xs sm:text-sm text-booking-teal hover:text-booking-dark font-medium"
              >
                Forgot your password?
              </Link>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-booking-teal text-white font-bold py-3 sm:py-4 px-4 sm:px-6 rounded hover:bg-opacity-90 transition-all duration-200 text-sm sm:text-lg"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  'Sign In'
                )}
              </button>
            </div>

            <div className="text-center">
              <p className="text-xs sm:text-sm text-booking-gray">
                Don't have an account?{' '}
                <Link href={`/auth/signup/${userType}`} className="text-booking-teal hover:text-booking-dark font-medium">
                  Create one here
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-booking-teal"></div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
