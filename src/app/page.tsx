'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';

export default function SignupChoicePage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is an admin and redirect to admin login page
    const checkAdminAndRedirect = async () => {
      try {
        // Check URL hash for Supabase auth tokens (email confirmation links)
        const hash = window.location.hash;
        const hasAuthToken = hash.includes('access_token') || hash.includes('type=recovery') || hash.includes('type=signup');
        
        // Get session (might be established after email confirmation)
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // Check if user has admin role in metadata
          const userRole = session.user.user_metadata?.role;
          
          if (userRole === 'admin') {
            // Determine admin frontend URL
            const adminFrontendUrl = process.env.NEXT_PUBLIC_ADMIN_FRONTEND_URL || 
              (typeof window !== 'undefined' && window.location.hostname === 'localhost' 
                ? 'http://localhost:3002' 
                : 'https://admin.booking-hub.co.uk');
            
            // Redirect to admin frontend login page
            window.location.href = `${adminFrontendUrl}/auth/login?message=Email confirmed successfully. Please sign in.`;
            return;
          }
        } else if (hasAuthToken) {
          // If we have an auth token in the URL but no session yet, wait a bit and check again
          // This handles the case where Supabase is still processing the confirmation
          setTimeout(async () => {
            const { data: { session: retrySession } } = await supabase.auth.getSession();
            if (retrySession?.user?.user_metadata?.role === 'admin') {
              const adminFrontendUrl = process.env.NEXT_PUBLIC_ADMIN_FRONTEND_URL || 
                (typeof window !== 'undefined' && window.location.hostname === 'localhost' 
                  ? 'http://localhost:3002' 
                  : 'https://admin.booking-hub.co.uk');
              window.location.href = `${adminFrontendUrl}/auth/login?message=Email confirmed successfully. Please sign in.`;
            }
          }, 1000);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        // Continue with normal page rendering if check fails
      }
    };

    checkAdminAndRedirect();
  }, [router]);

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-start px-4 sm:px-6 pt-8 sm:pt-12 pb-8 sm:pb-12">
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
      <div className="absolute inset-0 bg-[rgba(11,29,55,0.88)] pointer-events-none animate-overlay-fade"></div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-4xl mx-auto -mt-4 sm:-mt-6">
        {/* Logo on Background with entrance animation */}
        <div className="flex justify-center -mb-10 sm:-mb-14 lg:-mb-16">
          <div className="animate-logo-entrance">
            <Image
              src="/white-teal.webp"
              alt="Logo"
              width={300}
              height={300}
              className="w-40 h-40 sm:w-52 sm:h-52 lg:w-64 lg:h-64 object-contain drop-shadow-2xl"
              priority
            />
          </div>
        </div>
        
        {/* Main Heading with entrance animation */}
        <h1 
          style={{ fontFamily: 'var(--font-avenir-bold), sans-serif' }}
          className="text-xl sm:text-2xl md:text-3xl lg:text-4xl text-[#F6F6F4] mb-3 sm:mb-4 text-center animate-heading-entrance"
        >
          What is your role?
        </h1>
        
        {/* Two Boxes Side by Side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Client Box with entrance animation */}
          <div className="signup-card bg-white rounded-xl shadow-lg p-4 sm:p-6 flex flex-col items-center text-center border border-gray-200 animate-card-entrance-1">
            {/* Heading */}
            <h2 
              style={{ fontFamily: 'var(--font-avenir), sans-serif', fontWeight: 700, letterSpacing: '0.05em' }}
              className="text-xl sm:text-2xl md:text-3xl text-[#0B1D37] mb-3 sm:mb-4"
            >
              Client
            </h2>
            
            {/* Description */}
            <p 
              style={{ fontFamily: 'var(--font-avenir-regular), sans-serif' }}
              className="w-full text-sm sm:text-base md:text-lg text-[#4B4E53] mb-4 sm:mb-6 text-center"
            >
              I'm a client booking accomodation
            </p>
            
            {/* Sign up button with enhanced hover */}
            <Link
              href="/booking-request"
              onClick={(e) => { e.preventDefault(); window.location.href = '/booking-request'; }}
              style={{ fontFamily: 'var(--font-avenir-regular), sans-serif' }}
              className="signup-btn w-full bg-[#00BAB5] text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-base sm:text-lg md:text-xl hover:bg-[#00A5A0] animate-btn-entrance-1"
            >
              Book Accomodation <span style={{ fontSize: '1.3em' }}>→</span>
            </Link>
          </div>

          {/* Partner Box with entrance animation (slightly delayed) */}
          <div className="signup-card bg-white rounded-xl shadow-lg p-4 sm:p-6 flex flex-col items-center text-center border border-gray-200 animate-card-entrance-2">
            {/* Heading */}
            <h2 
              style={{ fontFamily: 'var(--font-avenir), sans-serif', fontWeight: 700, letterSpacing: '0.05em' }}
              className="text-xl sm:text-2xl md:text-3xl text-[#0B1D37] mb-3 sm:mb-4"
            >
              Partner
            </h2>
            
            {/* Description */}
            <p 
              style={{ fontFamily: 'var(--font-avenir-regular), sans-serif' }}
              className="w-full text-sm sm:text-base md:text-lg text-[#4B4E53] mb-4 sm:mb-6 text-center"
            >
              I'm a partner listing properties.
            </p>
            
            {/* Sign up button with enhanced hover */}
            <Link
              href="/auth/signup/partner"
              onClick={(e) => { e.preventDefault(); window.location.href = '/auth/signup/partner'; }}
              style={{ fontFamily: 'var(--font-avenir-regular), sans-serif' }}
              className="signup-btn w-full bg-[#00BAB5] text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-base sm:text-lg md:text-xl hover:bg-[#00A5A0] animate-btn-entrance-2"
            >
              List Properties <span style={{ fontSize: '1.3em' }}>→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

