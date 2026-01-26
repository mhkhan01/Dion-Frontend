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
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const typeParam = searchParams.get('type') || 'contractor';
  // Map 'partner' to 'landlord' and 'client' to 'contractor'
  const userType = typeParam === 'partner' ? 'landlord' : typeParam === 'client' ? 'contractor' : typeParam;

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
      
      if (authUser) {
        try {
          // Check contractor table first
          const { data: contractorProfile, error: contractorError } = await supabase
            .from('contractor')
            .select('role, email')
            .eq('id', authUser.id)
            .maybeSingle();
          
          if (contractorError) {
            console.error('Contractor query error details:', {
              message: contractorError.message,
              details: contractorError.details,
              hint: contractorError.hint,
              code: contractorError.code
            });
          }

          // Check landlord table
          const { data: landlordProfile, error: landlordError } = await supabase
            .from('landlord')
            .select('role, email')
            .eq('id', authUser.id)
            .maybeSingle();

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
            
            // Check if contractor is active via backend API
            try {
              const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://jfgm6v6pkw.us-east-1.awsapprunner.com/api';
              const activeCheckResponse = await fetch(`https://jfgm6v6pkw.us-east-1.awsapprunner.com/api/client-login-check`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId: authUser.id }),
              });
              
              if (!activeCheckResponse.ok) {
                // Backend check failed, prevent login
                await supabase.auth.signOut();
                setError('Unable to verify account status. Please try again.');
                return;
              }
              
              const activeCheckData = await activeCheckResponse.json();
              
              if (activeCheckData.success && activeCheckData.isActive === false) {
                // Contractor is inactive, sign them out and show error
                await supabase.auth.signOut();
                setError('Your account is currently inactive, Ask the admin to activate your account');
                return;
              }
              
              if (!activeCheckData.success) {
                // Backend returned error, prevent login
                await supabase.auth.signOut();
                setError('Unable to verify account status. Please try again.');
                return;
              }
            } catch (activeCheckError) {
              console.error('Error checking contractor active status:', activeCheckError);
              // If backend check fails, prevent login (fail-closed for security)
              await supabase.auth.signOut();
              setError('Unable to verify account status. Please try again.');
              return;
            }
            
            // User exists in contractor table and is active, redirect to contractor dashboard
            router.push('/client');
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
            
            // Check if landlord is active via backend API
            try {
              const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://jfgm6v6pkw.us-east-1.awsapprunner.com/api';
              const activeCheckResponse = await fetch(`https://jfgm6v6pkw.us-east-1.awsapprunner.com/api/partner-login-check`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId: authUser.id }),
              });
              
              if (!activeCheckResponse.ok) {
                // Backend check failed, prevent login
                await supabase.auth.signOut();
                setError('Unable to verify account status. Please try again.');
                return;
              }
              
              const activeCheckData = await activeCheckResponse.json();
              
              if (activeCheckData.success && activeCheckData.isActive === false) {
                // Landlord is inactive, sign them out and show error
                await supabase.auth.signOut();
                setError('Your account is currently inactive, Ask the admin to activate your account');
                return;
              }
              
              if (!activeCheckData.success) {
                // Backend returned error, prevent login
                await supabase.auth.signOut();
                setError('Unable to verify account status. Please try again.');
                return;
              }
            } catch (activeCheckError) {
              console.error('Error checking landlord active status:', activeCheckError);
              // If backend check fails, prevent login (fail-closed for security)
              await supabase.auth.signOut();
              setError('Unable to verify account status. Please try again.');
              return;
            }
            
            // User exists in landlord table and is active, redirect to landlord dashboard
            router.push('/partner');
            return;
          }

          // Fallback: If no userType specified, check both tables and redirect appropriately
          if (contractorProfile && !contractorError) {
            router.push('/client');
            return;
          }

          if (landlordProfile && !landlordError) {
            router.push('/partner');
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
        router.push('/');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background Image with Ken Burns effect */}
      <div 
        className="absolute inset-0 animate-ken-burns"
        style={{
          backgroundImage: 'url(/Houses%20-%202.webp)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />
      
      {/* Background Image Opacity Overlay with fade animation */}
      <div className="absolute inset-0 bg-[rgba(11,29,52,0.88)] pointer-events-none animate-overlay-fade"></div>

      {/* Back Button */}
      <Link 
        href="/" 
        onClick={(e) => { e.preventDefault(); window.location.href = '/'; }}
        className="absolute top-4 left-4 z-20 flex items-center justify-center text-white sm:px-4 sm:py-2 sm:gap-2 font-semibold hover:text-booking-teal transition-all duration-200"
        aria-label="Back to home"
        style={{ fontFamily: 'var(--font-avenir-regular)' }}
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-7 w-7" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span className="hidden sm:inline text-xl sm:text-2xl">Go Back</span>
      </Link>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-start min-h-screen px-2 sm:px-4 pb-12 sm:pb-16 -mt-12 sm:-mt-16">
        {/* Logo on Background with entrance animation */}
        <div className="flex justify-center -mb-12 sm:-mb-16 lg:-mb-20">
          <div className="animate-logo-entrance">
            <Image
              src="/white-teal.webp"
              alt="Logo"
              width={300}
              height={300}
              className="w-48 h-48 sm:w-64 sm:h-64 lg:w-80 lg:h-80 object-contain drop-shadow-2xl"
              priority
            />
          </div>
        </div>

        {/* Form Container with entrance animation */}
        <div className="signup-card bg-white/95 backdrop-blur-sm rounded-xl sm:rounded shadow-xl sm:shadow-lg p-6 sm:p-6 lg:p-8 w-full max-w-xs sm:max-w-lg lg:max-w-2xl border border-gray-200/50 sm:border-gray-200 animate-card-entrance-1">
          
          {/* Form Title */}
          <h1 className="text-base sm:text-2xl lg:text-3xl font-bold text-booking-dark mb-4 sm:mb-8 text-center leading-tight">
            Sign In to Your Account
          </h1>

          <form className="space-y-3 sm:space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-3 sm:p-4">
                <div className="text-xs sm:text-sm text-red-800" style={{ fontFamily: 'var(--font-avenir-regular)' }}>{error}</div>
              </div>
            )}

            {successMessage && (
              <div className="rounded-xl bg-green-50 border border-green-200 p-3 sm:p-4">
                <div className="text-xs sm:text-sm text-green-800" style={{ fontFamily: 'var(--font-avenir-regular)' }}>{successMessage}</div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-xs sm:text-lg font-medium text-booking-dark mb-1 sm:mb-2 leading-tight" style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500, letterSpacing: '0.02em' }}>
                Email Address
              </label>
              <input
                {...register('email')}
                type="email"
                autoComplete="email"
                className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-booking-teal rounded focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent ${errors.email ? 'border-red-500' : ''}`}
                placeholder="Enter your email"
                style={{ fontFamily: 'var(--font-avenir-regular)' }}
              />
              {errors.email && (
                <p className="mt-1 text-xs sm:text-sm text-red-600" style={{ fontFamily: 'var(--font-avenir-regular)' }}>{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-xs sm:text-lg font-medium text-booking-dark mb-1 sm:mb-2 leading-tight" style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500, letterSpacing: '0.02em' }}>
                Password
              </label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  className={`w-full px-3 pr-10 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-booking-teal rounded focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent ${errors.password ? 'border-red-500' : ''}`}
                  placeholder="Enter your password"
                  style={{ fontFamily: 'var(--font-avenir-regular)' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs sm:text-sm text-red-600" style={{ fontFamily: 'var(--font-avenir-regular)' }}>{errors.password.message}</p>
              )}
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <Link 
                href="/auth/forgot-password" 
                onClick={(e) => { e.preventDefault(); window.location.href = '/auth/forgot-password'; }}
                className="text-xs sm:text-sm text-booking-teal hover:text-booking-dark font-medium"
              >
                Forgot your password?
              </Link>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="signup-btn w-full bg-booking-teal text-white font-bold py-3 sm:py-4 px-4 sm:px-6 rounded hover:bg-opacity-90 text-sm sm:text-lg"
                style={{ fontFamily: 'var(--font-avenir-regular)' }}
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
                <Link 
                  href={`/auth/signup/${userType === 'contractor' ? 'client' : userType === 'landlord' ? 'partner' : userType}`} 
                  onClick={(e) => { 
                    e.preventDefault(); 
                    const signupPath = `/auth/signup/${userType === 'contractor' ? 'client' : userType === 'landlord' ? 'partner' : userType}`;
                    window.location.href = signupPath;
                  }}
                  className="text-booking-teal hover:text-booking-dark font-medium"
                >
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
