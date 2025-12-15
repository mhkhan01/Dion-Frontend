'use client';

import { useState } from 'react';

export default function RoleSelectionPage() {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const handleRoleSelect = (role: 'client' | 'partner') => {
    setSelectedRole(role);
    
    // Navigate to appropriate signup page
    if (role === 'client') {
      window.location.href = '/auth/signup/client';
    } else if (role === 'partner') {
      window.location.href = '/auth/signup/partner';
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
      <div className="absolute inset-0 bg-[rgba(11,29,52,0.88)] pointer-events-none z-0"></div>

      {/* Main content container with safe areas */}
      <div className="relative z-10 flex flex-col justify-center items-center min-h-screen px-6 py-8 safe-area-inset-x safe-area-inset-y">
        {/* Logo/Brand section */}
        <div className="mb-12 flex justify-center py-2">
          <img 
            src="/blue-teal.webp" 
            alt="Booking Hub Logo" 
            className="h-16 w-auto sm:h-20 md:h-24 object-contain"
            style={{ maxWidth: '100%' }}
          />
        </div>

        {/* Content section */}
        <div className="w-full max-w-md mx-auto text-center">
          {/* Heading */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#0B1D37] mb-4 sm:mb-6 leading-tight">
            Let's get started!
          </h1>

          {/* Subheading */}
          <p className="text-lg sm:text-xl md:text-2xl text-[#4B4E53] mb-8 sm:mb-12 leading-relaxed">
            Tell us who you are
          </p>

          {/* Role selection boxes - Side by side */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full">
            {/* Client Box */}
            <div 
              className="flex-1 rounded-2xl p-6 sm:p-8 text-white shadow-lg"
              style={{ backgroundColor: 'rgba(11, 29, 55, 0.88)' }}
            >
              {/* Client Icon - Centered at top */}
              <div className="flex justify-center mb-6">
                <svg 
                  className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
                  />
                </svg>
              </div>

              {/* Client Description - Bullet points */}
              <ul className="text-left mb-6 space-y-2 text-sm sm:text-base md:text-lg">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Seeking temporary accommodation for teams and projects</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Submit booking requests with requirements</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Manage accommodation needs</span>
                </li>
              </ul>

              {/* Sign up button */}
              <button
                onClick={() => handleRoleSelect('client')}
                className="w-full py-3 sm:py-4 px-4 sm:px-6 rounded-xl text-base sm:text-lg font-semibold bg-white text-[#0B1D37] hover:bg-opacity-90 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg"
              >
                Sign up as client
              </button>
            </div>

            {/* Partner Box */}
            <div 
              className="flex-1 rounded-2xl p-6 sm:p-8 text-white shadow-lg"
              style={{ backgroundColor: 'rgba(11, 29, 55, 0.88)' }}
            >
              {/* Partner Icon - Centered at top */}
              <div className="flex justify-center mb-6">
                <svg 
                  className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-2 0H3m2 0h5M9 7h1m-1 4h1m2-4h1m-1 4h1m-6 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" 
                  />
                </svg>
              </div>

              {/* Partner Description - Bullet points */}
              <ul className="text-left mb-6 space-y-2 text-sm sm:text-base md:text-lg">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Property owners and managers</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>List properties</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Manage availability</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Get paid bookings for your properties</span>
                </li>
              </ul>

              {/* Sign up button */}
              <button
                onClick={() => handleRoleSelect('partner')}
                className="w-full py-3 sm:py-4 px-4 sm:px-6 rounded-xl text-base sm:text-lg font-semibold bg-white text-[#0B1D37] hover:bg-opacity-90 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg"
              >
                Sign up as partner
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom safe area */}
      <div className="safe-area-inset-bottom" />

      {/* Custom CSS for iOS safe areas */}
      <style jsx>{`
        .safe-area-inset-top {
          padding-top: env(safe-area-inset-top);
        }
        
        .safe-area-inset-bottom {
          padding-bottom: env(safe-area-inset-bottom);
        }
        
        .safe-area-inset-x {
          padding-left: env(safe-area-inset-left);
          padding-right: env(safe-area-inset-right);
        }
        
        .safe-area-inset-y {
          padding-top: env(safe-area-inset-top);
          padding-bottom: env(safe-area-inset-bottom);
        }

        /* iOS-specific optimizations */
        @supports (-webkit-touch-callout: none) {
          .min-h-screen {
            min-height: -webkit-fill-available;
          }
          
          /* Prevent zoom on input focus for iOS */
          input, textarea, select {
            font-size: 16px;
          }
        }

        /* Enhanced button interactions for iOS */
        button {
          -webkit-tap-highlight-color: transparent;
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          user-select: none;
        }

        /* Smooth transitions for iOS */
        * {
          -webkit-transition: all 0.3s ease;
          transition: all 0.3s ease;
        }
      `}</style>
    </div>
  );
}