'use client';

import Link from 'next/link';

export default function SignupChoicePage() {
  return (
    <div className="min-h-screen bg-[#F6F6F4] flex flex-col items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
      {/* Main Container */}
      <div className="w-full max-w-4xl mx-auto">
        {/* Main Heading */}
        <h1 
          style={{ fontFamily: 'var(--font-avenir-bold), sans-serif' }}
          className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-[#0B1D37] mb-6 sm:mb-8 text-center"
        >
          What is your role?
        </h1>
        {/* Two Boxes Side by Side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {/* Client Box */}
          <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 flex flex-col items-center text-center border border-gray-200">
            {/* Heading */}
            <h2 
              style={{ fontFamily: 'var(--font-avenir), sans-serif', fontWeight: 700, letterSpacing: '0.05em' }}
              className="text-2xl sm:text-3xl md:text-4xl text-[#0B1D37] mb-4 sm:mb-6"
            >
              Client
            </h2>
            
            {/* Description */}
            <ul className="w-full text-base sm:text-lg md:text-xl text-[#4B4E53] mb-6 sm:mb-8 space-y-2 text-left list-disc list-inside">
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
              className="w-full bg-[#00BAB5] text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-lg sm:text-xl md:text-2xl hover:bg-[#00A5A0] transition-colors"
            >
              Sign up
            </Link>
          </div>

          {/* Partner Box */}
          <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 flex flex-col items-center text-center border border-gray-200">
            {/* Heading */}
            <h2 
              style={{ fontFamily: 'var(--font-avenir), sans-serif', fontWeight: 700, letterSpacing: '0.05em' }}
              className="text-2xl sm:text-3xl md:text-4xl text-[#0B1D37] mb-4 sm:mb-6"
            >
              Partner
            </h2>
            
            {/* Description */}
            <ul className="w-full text-base sm:text-lg md:text-xl text-[#4B4E53] mb-6 sm:mb-8 space-y-2 text-left list-disc list-inside">
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
              className="w-full bg-[#00BAB5] text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-lg sm:text-xl md:text-2xl hover:bg-[#00A5A0] transition-colors"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

