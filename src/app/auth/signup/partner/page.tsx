'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';

const signupSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 characters'),
  companyName: z.string().min(2, 'Company name must be at least 2 characters'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
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
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
  });

  // Watch password for real-time criteria validation
  const passwordValue = watch('password', '');

  const onSubmit = async (data: SignupForm) => {
    setLoading(true);
    setError(null);
    setIsSigningUp(true);
    setSuccess(false);
    
    // Normalize email to lowercase for case-insensitive comparison
    const normalizedEmail = data.email.toLowerCase().trim();
    
    // Validate email doesn't exist in contractor or landlord tables (case-insensitive)
    try {
      // Check contractor table
      const { data: contractors, error: contractorCheckError } = await supabase
        .from('contractor')
        .select('id, email');

      if (contractorCheckError) {
        console.error('Error checking contractor table:', contractorCheckError);
      } else if (contractors && Array.isArray(contractors)) {
        const existingContractor = contractors.find(
          (c) => {
            if (!c || !c.email) return false;
            const dbEmail = String(c.email).toLowerCase().trim();
            return dbEmail === normalizedEmail;
          }
        );
        if (existingContractor) {
          setError("This email is already in use, Try a different email.");
          setLoading(false);
          setIsSigningUp(false);
          return;
        }
      }

      // Check landlord table
      const { data: landlords, error: landlordCheckError } = await supabase
        .from('landlord')
        .select('id, email');

      if (landlordCheckError) {
        console.error('Error checking landlord table:', landlordCheckError);
      } else if (landlords && Array.isArray(landlords)) {
        const existingLandlord = landlords.find(
          (l) => {
            if (!l || !l.email) return false;
            const dbEmail = String(l.email).toLowerCase().trim();
            return dbEmail === normalizedEmail;
          }
        );
        if (existingLandlord) {
          setError("This email is already in use, Try a different email.");
          setLoading(false);
          setIsSigningUp(false);
          return;
        }
      }
    } catch (emailCheckError) {
      console.error('Email validation check failed:', emailCheckError);
      setError("This email is already in use, Try a different email.");
      setLoading(false);
      setIsSigningUp(false);
      return;
    }

    try {
      // Call backend API for partner signup
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
      const response = await fetch(`https://jfgm6v6pkw.us-east-1.awsapprunner.com/api/partner-signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: data.fullName,
          email: normalizedEmail,
          phone: data.phone,
          companyName: data.companyName,
          password: data.password,
          confirmPassword: data.confirmPassword
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Backend signup error:', result);
        const errorMessage = result.error || 'Signup failed. Please try again.';
        // Check if error is related to duplicate email
        if (errorMessage.includes('This email is already in use') ||
            errorMessage.includes('duplicate') ||
            errorMessage.includes('email') ||
            errorMessage.includes('unique constraint') ||
            errorMessage.includes('already exists')) {
          setError("This email is already in use, Try a different email.");
        } else {
          setError(errorMessage);
        }
        setLoading(false);
        setIsSigningUp(false);
        return;
      }

      // Show success message - user stays on page until they confirm email
      setSuccess(true);
      setLoading(false);
      setIsSigningUp(false);
    } catch (err) {
      console.error('Signup error:', err);
      setError('An unexpected error occurred. Please try again.');
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
        onClick={(e) => { e.preventDefault(); window.location.href = '/'; }}
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
          />
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
                  Account created successfully! Please check your email to confirm your account.
                </div>
              </div>
            )}

            {/* Hidden role field */}
            <input type="hidden" value="landlord" {...register('role')} />

            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-xs sm:text-sm font-medium text-booking-dark mb-1 sm:mb-2">
                Full Name *
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

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-booking-dark mb-1 sm:mb-2">
                Email Address *
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

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-xs sm:text-sm font-medium text-booking-dark mb-1 sm:mb-2">
                Phone Number *
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

            {/* Company Name */}
            <div>
              <label htmlFor="companyName" className="block text-xs sm:text-sm font-medium text-booking-dark mb-1 sm:mb-2">
                Company Name *
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

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-booking-dark mb-1 sm:mb-2">
                Password *
              </label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  className={`w-full px-3 pr-10 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-booking-teal rounded focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent ${errors.password ? 'border-red-500' : ''}`}
                  placeholder="Create a password"
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
              
              {/* Password Criteria Checklist */}
              <div className="mt-2 p-2.5 sm:p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-[10px] sm:text-xs text-gray-600 mb-1.5 sm:mb-2 font-medium">Password must contain:</p>
                <div className="grid grid-cols-2 gap-x-2 gap-y-1 sm:gap-y-1.5">
                  {/* 8+ characters */}
                  <div className="flex items-center gap-1.5">
                    <span className={`flex-shrink-0 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full flex items-center justify-center transition-colors duration-200 ${passwordValue.length >= 8 ? 'bg-green-500' : 'bg-gray-300'}`}>
                      {passwordValue.length >= 8 ? (
                        <svg className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-white rounded-full"></span>
                      )}
                    </span>
                    <span className={`text-[10px] sm:text-xs transition-colors duration-200 ${passwordValue.length >= 8 ? 'text-green-700 font-medium' : 'text-gray-500'}`}>
                      8+ characters
                    </span>
                  </div>
                  
                  {/* Uppercase letter */}
                  <div className="flex items-center gap-1.5">
                    <span className={`flex-shrink-0 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full flex items-center justify-center transition-colors duration-200 ${/[A-Z]/.test(passwordValue) ? 'bg-green-500' : 'bg-gray-300'}`}>
                      {/[A-Z]/.test(passwordValue) ? (
                        <svg className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-white rounded-full"></span>
                      )}
                    </span>
                    <span className={`text-[10px] sm:text-xs transition-colors duration-200 ${/[A-Z]/.test(passwordValue) ? 'text-green-700 font-medium' : 'text-gray-500'}`}>
                      Uppercase letter
                    </span>
                  </div>
                  
                  {/* Lowercase letter */}
                  <div className="flex items-center gap-1.5">
                    <span className={`flex-shrink-0 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full flex items-center justify-center transition-colors duration-200 ${/[a-z]/.test(passwordValue) ? 'bg-green-500' : 'bg-gray-300'}`}>
                      {/[a-z]/.test(passwordValue) ? (
                        <svg className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-white rounded-full"></span>
                      )}
                    </span>
                    <span className={`text-[10px] sm:text-xs transition-colors duration-200 ${/[a-z]/.test(passwordValue) ? 'text-green-700 font-medium' : 'text-gray-500'}`}>
                      Lowercase letter
                    </span>
                  </div>
                  
                  {/* Number */}
                  <div className="flex items-center gap-1.5">
                    <span className={`flex-shrink-0 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full flex items-center justify-center transition-colors duration-200 ${/[0-9]/.test(passwordValue) ? 'bg-green-500' : 'bg-gray-300'}`}>
                      {/[0-9]/.test(passwordValue) ? (
                        <svg className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-white rounded-full"></span>
                      )}
                    </span>
                    <span className={`text-[10px] sm:text-xs transition-colors duration-200 ${/[0-9]/.test(passwordValue) ? 'text-green-700 font-medium' : 'text-gray-500'}`}>
                      Number
                    </span>
                  </div>
                  
                  {/* Special character */}
                  <div className="flex items-center gap-1.5 col-span-2">
                    <span className={`flex-shrink-0 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full flex items-center justify-center transition-colors duration-200 ${/[^A-Za-z0-9]/.test(passwordValue) ? 'bg-green-500' : 'bg-gray-300'}`}>
                      {/[^A-Za-z0-9]/.test(passwordValue) ? (
                        <svg className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-white rounded-full"></span>
                      )}
                    </span>
                    <span className={`text-[10px] sm:text-xs transition-colors duration-200 ${/[^A-Za-z0-9]/.test(passwordValue) ? 'text-green-700 font-medium' : 'text-gray-500'}`}>
                      Special character (!@#$%^&*)
                    </span>
                  </div>
                </div>
              </div>
              
              {errors.password && (
                <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-xs sm:text-sm font-medium text-booking-dark mb-1 sm:mb-2">
                Confirm Password *
              </label>
              <div className="relative">
                <input
                  {...register('confirmPassword')}
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  className={`w-full px-3 pr-10 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-booking-teal rounded focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent ${errors.confirmPassword ? 'border-red-500' : ''}`}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? (
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
              {errors.confirmPassword && (
                <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-booking-teal text-white font-bold py-3 sm:py-4 px-4 sm:px-6 rounded hover:bg-opacity-90 transition-all duration-200 text-sm sm:text-lg disabled:opacity-50 disabled:cursor-not-allowed"
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

            {/* Login Link */}
            <div className="text-center">
              <p className="text-xs sm:text-sm text-booking-gray">
                Already have an account?{' '}
                <Link 
                  href="/auth/login?type=partner" 
                  onClick={(e) => { e.preventDefault(); window.location.href = '/auth/login?type=partner'; }}
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
