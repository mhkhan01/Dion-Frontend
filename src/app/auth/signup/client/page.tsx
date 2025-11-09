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
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  role: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupForm = z.infer<typeof signupSchema>;

export default function ContractorSignupPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
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
    setIsSigningUp(true);

    try {
      // FIRST: Check if email already exists in contractor table (same role)
      try {
        const { data: existingContractor, error: contractorCheckError } = await supabase
          .from('contractor')
          .select('id, email')
          .eq('email', data.email)
          .maybeSingle();

        if (existingContractor && !contractorCheckError) {
          setError('Email already in use');
          setLoading(false);
          setIsSigningUp(false);
          return;
        }
      } catch (contractorCheckError) {
        console.log('Contractor table check failed:', contractorCheckError);
        // Continue with signup even if check fails
      }

      // Check if email already exists in landlord or admin tables (cross-table validation)
      try {
        const { data: existingLandlord, error: landlordCheckError } = await supabase
          .from('landlord')
          .select('id, email')
          .eq('email', data.email)
          .maybeSingle();

        if (existingLandlord && !landlordCheckError) {
          setError('This email already exists for a partner account. Please use a different email or sign in as a partner.');
          setLoading(false);
          setIsSigningUp(false);
          return;
        }
      } catch (landlordCheckError) {
        console.log('Landlord table check failed:', landlordCheckError);
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
          setIsSigningUp(false);
          return;
        }
      } catch (adminCheckError) {
        console.log('Admin table check failed:', adminCheckError);
        // Continue with signup even if check fails
      }

      // Determine user role based on email lookup
      let userRole = 'contractor'; // Default role
      let bookingRequest = null;
      let landlordProfile = null;

      try {
        // Check if email exists in booking_requests table (contractor)
        const { data: bookingData, error: bookingError } = await supabase
          .from('booking_requests')
          .select('id')
          .eq('email', data.email)
          .single();

        if (bookingData && !bookingError) {
          userRole = 'contractor';
          bookingRequest = bookingData;
        } else {
          // Check if email exists in landlord_profiles table (landlord)
          const { data: landlordData, error: landlordError } = await supabase
            .from('landlord_profiles')
            .select('id')
            .eq('email', data.email)
            .single();

          if (landlordData && !landlordError) {
            userRole = 'landlord';
            landlordProfile = landlordData;
          }
          // If email doesn't exist in either table, default to 'contractor'
        }
      } catch (lookupError) {
        console.log('Email lookup failed, using default contractor role:', lookupError);
        // Continue with default contractor role
      }

      // Sign up with Supabase Auth
      console.log('Starting Supabase Auth signup...');
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/contractor`,
          data: {
            role: 'contractor'
          }
        }
      });

      console.log('Supabase Auth signup result:', { authData, authError });

      if (authError) {
        console.error('Auth signup error:', authError);
        console.error('Auth error details:', {
          message: authError.message,
          status: authError.status,
          name: authError.name
        });
        
        // Handle specific error types
        if (authError.message.includes('User already registered')) {
          setError('This email is already registered. Please try logging in instead.');
        } else if (authError.message.includes('Invalid email')) {
          setError('Please enter a valid email address.');
        } else if (authError.message.includes('Password should be at least')) {
          setError('Password must be at least 6 characters long.');
        } else {
          setError(`Signup failed: ${authError.message}`);
        }
        return;
      }

      if (authData.user) {
        // Test database connection first
        console.log('Testing database connection...');
        const { data: testData, error: testError } = await supabase
          .from('contractor')
          .select('count')
          .limit(1);
        
        console.log('Database test result:', { testData, testError });
        
        if (testError) {
          console.error('Database connection test failed:', testError);
          setError(`Database connection failed: ${testError.message}`);
          return;
        }

        // Check if user already exists in contractor table
        const { data: existingUser, error: checkError } = await supabase
          .from('contractor')
          .select('id')
          .eq('id', authData.user.id)
          .single();

        if (existingUser) {
          console.log('User already exists in contractor database, updating profile');
          // Update existing user profile
          const { error: updateError } = await supabase
            .from('contractor')
            .update({
              email: data.email,
              full_name: data.fullName,
              phone: data.phone,
              role: userRole, // Use determined role
              is_active: true,
              email_verified: false
            })
            .eq('id', authData.user.id);

          if (updateError) {
            console.error('Profile update error:', updateError);
            setError(`Failed to update user profile: ${updateError.message}`);
            return;
          }
        } else {
          // Create new user profile in contractor table
          console.log('Creating new contractor profile with data:', {
            id: authData.user.id,
            email: data.email,
            full_name: data.fullName,
            role: userRole,
            is_active: true,
            email_verified: false
          });

          const { data: insertData, error: profileError } = await supabase
            .from('contractor')
            .insert({
              id: authData.user.id,
              email: data.email,
              full_name: data.fullName,
              phone: data.phone,
              role: userRole, // Use determined role
              is_active: true,
              email_verified: false
            })
            .select(); // Add select to get the inserted data

          console.log('Contractor profile insert result:', { insertData, profileError });

          if (profileError) {
            console.error('Profile creation error:', profileError);
            console.error('Error details:', {
              message: profileError.message,
              details: profileError.details,
              hint: profileError.hint,
              code: profileError.code
            });
            
            // If it's a duplicate key error, try to update instead
            if (profileError.code === '23505') {
              console.log('Duplicate key error, attempting to update instead');
              const { data: updateData, error: updateError } = await supabase
                .from('contractor')
                .update({
                  email: data.email,
                  full_name: data.fullName,
                  phone: data.phone,
                  role: userRole,
                  is_active: true,
                  email_verified: false
                })
                .eq('id', authData.user.id)
                .select();

              console.log('Contractor profile update result:', { updateData, updateError });

              if (updateError) {
                console.error('Update after duplicate key error failed:', updateError);
                setError(`Failed to create user profile: ${updateError.message}`);
                return;
              }
            } else {
              setError(`Failed to create user profile: ${profileError.message}`);
              return;
            }
          } else {
            console.log('Contractor profile created successfully:', insertData);
          }
        }

        console.log('Contractor profile created successfully in Supabase');

        // Update the corresponding profile table with user_id (with error handling)
        try {
          if (userRole === 'contractor' && bookingRequest) {
            // Update booking_requests with user_id
            const { error: updateError } = await supabase
              .from('booking_requests')
              .update({ user_id: authData.user.id })
              .eq('email', data.email);

            if (updateError) {
              console.error('Failed to update booking_requests:', updateError);
            } else {
              console.log('Booking requests updated with user_id');
            }
          } else if (userRole === 'landlord' && landlordProfile) {
            // Update landlord_profiles with user_id
            const { error: updateError } = await supabase
              .from('landlord_profiles')
              .update({ user_id: authData.user.id })
              .eq('email', data.email);

            if (updateError) {
              console.error('Failed to update landlord_profiles:', updateError);
            } else {
              console.log('Landlord profiles updated with user_id');
            }
          }
        } catch (updateError) {
          console.error('Error updating profile tables:', updateError);
          // Don't block the signup process
        }


            // Show success message and redirect
            console.log('Signup completed successfully, redirecting...');
            setSuccess(true);
            setLoading(false);
            setIsSigningUp(false);
            
            // Wait a moment for everything to complete
            setTimeout(() => {
              if (userRole === 'contractor') {
                router.push('/contractor');
              } else if (userRole === 'landlord') {
                router.push('/landlord');
              } else {
                router.push('/auth/login?message=Account created successfully. Please sign in.');
              }
            }, 2000);
      }
    } catch (err) {
      setError('An unexpected error occurred');
      setIsSigningUp(false);
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
            Create Your Client Account
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
            <input type="hidden" value="contractor" {...register('role')} />

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
                  'Sign up as a client'
                )}
              </button>
            </div>

            <div className="text-center">
              <p className="text-xs sm:text-sm text-booking-gray">
                Already have an account?{' '}
                <Link href="/auth/login?type=contractor" className="text-booking-teal hover:text-booking-dark font-medium">
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
