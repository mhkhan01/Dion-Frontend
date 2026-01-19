'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function SignupChoicePage() {
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

      {/* Floating Particles */}
      <div className="particles-container">
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
      </div>

      {/* Back to Home Button */}
      <Link
        href="/"
        aria-label="Back to home"
        style={{ fontFamily: 'var(--font-avenir-regular)' }}
        className="back-btn absolute top-4 left-4 z-20 flex items-center justify-center bg-booking-teal text-white rounded-full sm:rounded-lg w-12 h-12 sm:w-auto sm:h-auto sm:px-4 sm:py-2 sm:gap-2 font-semibold hover:bg-opacity-90 transition-all duration-300 shadow-lg animate-back-btn-entrance"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span className="hidden sm:inline text-sm sm:text-base">Back to Home</span>
      </Link>
      
      {/* Main Container */}
      <div className="relative z-10 w-full max-w-4xl mx-auto -mt-4 sm:-mt-6">
        {/* Logo on Background with entrance animation */}
        <div className="flex justify-center -mb-10 sm:-mb-14 lg:-mb-16">
          <div className="animate-logo-entrance animate-logo-float">
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
              href="/auth/signup/client"
              style={{ fontFamily: 'var(--font-avenir-regular), sans-serif' }}
              className="signup-btn w-full bg-[#00BAB5] text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-base sm:text-lg md:text-xl hover:bg-[#00A5A0] animate-btn-entrance-1"
            >
              Sign up
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
              style={{ fontFamily: 'var(--font-avenir-regular), sans-serif' }}
              className="signup-btn w-full bg-[#00BAB5] text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-base sm:text-lg md:text-xl hover:bg-[#00A5A0] animate-btn-entrance-2"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
