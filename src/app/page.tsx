'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function SignupChoicePage() {
  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-start px-4 sm:px-6 pt-8 sm:pt-12 pb-8 sm:pb-12" style={{
      backgroundImage: 'url(/Houses%20-%202.webp)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }}>
      {/* Background Image Opacity Overlay */}
      <div className="absolute inset-0 bg-[rgba(11,29,55,0.88)] pointer-events-none"></div>

      

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-4xl mx-auto -mt-4 sm:-mt-6">
        {/* Logo on Background */}
        <div className="flex justify-center -mb-10 sm:-mb-14 lg:-mb-16">
          <Image
            src="/white-teal.webp"
            alt="Logo"
            width={300}
            height={300}
            className="w-40 h-40 sm:w-52 sm:h-52 lg:w-64 lg:h-64 object-contain drop-shadow-2xl"
            priority
          />
        </div>
        
        {/* Main Heading */}
        <h1 
          style={{ fontFamily: 'var(--font-avenir-bold), sans-serif' }}
          className="text-xl sm:text-2xl md:text-3xl lg:text-4xl text-[#F6F6F4] mb-3 sm:mb-4 text-center"
        >
          What is your role?
        </h1>
        {/* Two Boxes Side by Side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Client Box */}
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 flex flex-col items-center text-center border border-gray-200">
            {/* Heading */}
            <h2 
              style={{ fontFamily: 'var(--font-avenir), sans-serif', fontWeight: 700, letterSpacing: '0.05em' }}
              className="text-xl sm:text-2xl md:text-3xl text-[#0B1D37] mb-3 sm:mb-4"
            >
              Client
            </h2>
            
            {/* Description */}
            <ul className="w-full text-sm sm:text-base md:text-lg text-[#4B4E53] mb-4 sm:mb-6 space-y-1 text-left list-disc list-inside">
              <li style={{ fontFamily: 'var(--font-avenir-regular), sans-serif' }}>
                Request a booking
              </li>
              <li style={{ fontFamily: 'var(--font-avenir-regular), sans-serif' }}>
                Book properties for multiple dates
              </li>
            </ul>
            
            {/* Sign up button */}
            <Link
              href="/auth/signup/client"
              onClick={(e) => { e.preventDefault(); window.location.href = '/auth/signup/client'; }}
              style={{ fontFamily: 'var(--font-avenir-regular), sans-serif' }}
              className="w-full bg-[#00BAB5] text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-base sm:text-lg md:text-xl hover:bg-[#00A5A0] transition-colors"
            >
              Sign up
            </Link>
          </div>

          {/* Partner Box */}
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 flex flex-col items-center text-center border border-gray-200">
            {/* Heading */}
            <h2 
              style={{ fontFamily: 'var(--font-avenir), sans-serif', fontWeight: 700, letterSpacing: '0.05em' }}
              className="text-xl sm:text-2xl md:text-3xl text-[#0B1D37] mb-3 sm:mb-4"
            >
              Partner
            </h2>
            
            {/* Description */}
            <ul className="w-full text-sm sm:text-base md:text-lg text-[#4B4E53] mb-4 sm:mb-6 space-y-1 text-left list-disc list-inside">
              <li style={{ fontFamily: 'var(--font-avenir-regular), sans-serif' }}>
                List your properties
              </li>
              <li style={{ fontFamily: 'var(--font-avenir-regular), sans-serif' }}>
                View bookings for your properties.
              </li>
            </ul>
            
            {/* Sign up button */}
            <Link
              href="/auth/signup/partner"
              onClick={(e) => { e.preventDefault(); window.location.href = '/auth/signup/partner'; }}
              style={{ fontFamily: 'var(--font-avenir-regular), sans-serif' }}
              className="w-full bg-[#00BAB5] text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-base sm:text-lg md:text-xl hover:bg-[#00A5A0] transition-colors"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

