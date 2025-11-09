'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const signupSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 characters'),
  companyName: z.string().min(2, 'Company name must be at least 2 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  role: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupForm = z.infer<typeof signupSchema>;

export default function LandlordSignupPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupForm) => {
    setLoading(true);
    setError(null);

    try {
      // FIRST: Check if email already exists in landlord table (same role)
      try {
        const { data: existingLandlordCheck, error: landlordCheckError } = await supabase
          .from('landlord')
          .select('id, email')
          .eq('email', data.email)
          .maybeSingle();

        if (existingLandlordCheck && !landlordCheckError) {
          setError('Email already in use');
          setLoading(false);
          return;
        }
      } catch (landlordCheckError) {
        console.log('Landlord table check failed:', landlordCheckError);
        // Continue with signup even if check fails
      }

      // Check if email already exists in contractor or admin tables (cross-table validation)
      try {
        const { data: existingContractor, error: contractorCheckError } = await supabase
          .from('contractor')
          .select('id, email')
          .eq('email', data.email)
          .maybeSingle();

        if (existingContractor && !contractorCheckError) {
          setError('This email already exists for a client account. Please use a different email or sign in as a client.');
          setLoading(false);
          return;
        }
      } catch (contractorCheckError) {
        console.log('Contractor table check failed:', contractorCheckError);
        // Continue with signup even if check fails
      }

      // Check if email exists in admin table
      try {
        const { data: existingAdmin, error: adminCheckError } = await supabase
          .from('admin')
          .select('id, email')
          .eq('email', data.email)
          .maybeSingle();

        if (existingAdmin && !adminCheckError) {
          setError('This email is already in use. Try using a different email.');
          setLoading(false);
          return;
        }
      } catch (adminCheckError) {
        console.log('Admin table check failed:', adminCheckError);
        // Continue with signup even if check fails
      }

      // Landlord signup always uses 'landlord' role (prefilled)
      const userRole = 'landlord'; // Always landlord for landlord signup
      let landlordProfile = null;

      try {
        // Check if email exists in landlord_profiles table (landlord)
        const { data: landlordData, error: landlordError } = await supabase
          .from('landlord_profiles')
          .select('id')
          .eq('email', data.email)
          .single();

        if (landlordData && !landlordError) {
          landlordProfile = landlordData;
        }
      } catch (lookupError) {
        console.log('Email lookup failed, continuing with landlord signup:', lookupError);
        // Continue with landlord signup
      }

      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/landlord`,
          data: {
            role: 'landlord'
          }
        }
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      if (authData.user) {
        console.log('Auth user created successfully:', authData.user.id);

        // Create landlord profile in landlord table
        const { data: landlordData, error: landlordError } = await supabase
          .from('landlord')
          .insert({
            id: authData.user.id,
            email: data.email,
            full_name: data.fullName,
            phone: data.phone,
            company_name: data.companyName,
            role: 'landlord',
            is_active: true,
            email_verified: false
          })
          .select()
          .single();

        if (landlordError) {
          console.error('Error creating landlord profile:', landlordError);
          setError(`Failed to create landlord profile: ${landlordError.message}`);
          return;
        }

        console.log('Landlord profile created successfully:', landlordData);


            // Show success message and redirect
            console.log('Landlord signup completed successfully, redirecting...');
            setSuccess(true);
            setLoading(false);
            
            // Wait a moment for everything to complete, then redirect to login
            setTimeout(() => {
              router.push('/auth/login?message=Account created successfully. Please check your email and sign in.');
            }, 2000);
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
        className="absolute top-4 left-4 z-20 flex items-center justify-center bg-booking-teal text-white rounded-full sm:rounded-lg w-12 h-12 sm:w-auto sm:h-auto sm:px-4 sm:py-2 sm:gap-2 font-semibold hover:bg-opacity-90 transition-all duration-200 shadow-lg"
        aria-label="Back to home"
        style={{ fontFamily: 'var(--font-avenir-regular)' }}
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-5 w-5" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span className="hidden sm:inline text-sm sm:text-base">Back to Home</span>
      </Link>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-start min-h-screen px-2 sm:px-4 pb-12 sm:pb-16 -mt-12 sm:-mt-16">
        {/* Logo on Background */}
        <div className="flex justify-center -mb-12 sm:-mb-16 lg:-mb-20">
          <Image
            src="/white-teal.webp"
            alt="Logo"
            width={300}
            height={300}
            className="w-48 h-48 sm:w-64 sm:h-64 lg:w-80 lg:h-80 object-contain drop-shadow-2xl"
            priority
            style={{
              animation: 'flip 5s ease-in-out infinite'
            }}
          />
          <style jsx>{`
            @keyframes flip {
              0%, 60% {
                transform: rotateY(0deg);
              }
              100% {
                transform: rotateY(360deg);
              }
            }
          `}</style>
        </div>

        {/* Form Container */}
        <div className="bg-white/95 backdrop-blur-sm rounded-xl sm:rounded shadow-xl sm:shadow-lg p-6 sm:p-6 lg:p-8 w-full max-w-xs sm:max-w-lg lg:max-w-2xl border border-gray-200/50 sm:border-gray-200">
          
          {/* Form Title */}
          <h1 className="text-base sm:text-2xl lg:text-3xl font-bold text-booking-dark mb-4 sm:mb-8 text-center leading-tight">
            Create Your Partner Account
          </h1>

          <form className="space-y-3 sm:space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-3 sm:p-4">
                <div className="text-xs sm:text-sm text-red-800">{error}</div>
              </div>
            )}

            {success && (
              <div className="rounded-xl bg-green-50 border border-green-200 p-3 sm:p-4">
                <div className="text-xs sm:text-sm text-green-800">
                  We've sent you an email, please confirm your account creation by clicking the link in the email.
                </div>
              </div>
            )}

            {/* Hidden role field */}
            <input type="hidden" value="landlord" {...register('role')} />

            <div>
              <label htmlFor="fullName" className="block text-xs sm:text-sm font-medium text-booking-dark mb-1 sm:mb-2">
                Full Name
              </label>
              <input
                {...register('fullName')}
                type="text"
                autoComplete="name"
                className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-booking-teal rounded focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent ${errors.fullName ? 'border-red-500' : ''}`}
                placeholder="Enter your full name"
              />
              {errors.fullName && (
                <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.fullName.message}</p>
              )}
            </div>

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
              <label htmlFor="phone" className="block text-xs sm:text-sm font-medium text-booking-dark mb-1 sm:mb-2">
                Phone Number
              </label>
              <input
                {...register('phone')}
                type="tel"
                autoComplete="tel"
                className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-booking-teal rounded focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent ${errors.phone ? 'border-red-500' : ''}`}
                placeholder="Enter your phone number"
              />
              {errors.phone && (
                <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.phone.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="companyName" className="block text-xs sm:text-sm font-medium text-booking-dark mb-1 sm:mb-2">
                Company Name
              </label>
              <input
                {...register('companyName')}
                type="text"
                autoComplete="organization"
                className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-booking-teal rounded focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent ${errors.companyName ? 'border-red-500' : ''}`}
                placeholder="Enter your company name"
              />
              {errors.companyName && (
                <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.companyName.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-booking-dark mb-1 sm:mb-2">
                Password
              </label>
              <input
                {...register('password')}
                type="password"
                autoComplete="new-password"
                className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-booking-teal rounded focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent ${errors.password ? 'border-red-500' : ''}`}
                placeholder="Create a password"
              />
              {errors.password && (
                <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-xs sm:text-sm font-medium text-booking-dark mb-1 sm:mb-2">
                Confirm Password
              </label>
              <input
                {...register('confirmPassword')}
                type="password"
                autoComplete="new-password"
                className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-booking-teal rounded focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent ${errors.confirmPassword ? 'border-red-500' : ''}`}
                placeholder="Confirm your password"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>

            <div className="text-center mb-4">
              <p className="text-xs sm:text-sm text-booking-gray">
                By signing up, you agree to our{' '}
                <Link href="/partner-terms" className="text-booking-teal hover:text-booking-dark font-medium underline">
                  Partner Terms & Conditions
                </Link>
                .
              </p>
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
                    Creating account...
                  </div>
                ) : (
                  'Sign up as a partner'
                )}
              </button>
            </div>

            <div className="text-center">
              <p className="text-xs sm:text-sm text-booking-gray">
                Already have an account?{' '}
                <Link href="/auth/login?type=landlord" className="text-booking-teal hover:text-booking-dark font-medium">
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
