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
    <div className="min-h-screen bg-[#F6F6F4] flex flex-col">
      {/* Safe area handling for iOS devices */}
      <div className="safe-area-inset-top" />
      
      {/* Main content container with safe areas */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-8 safe-area-inset-x safe-area-inset-y">
        {/* Logo/Brand section */}
        <div className="mb-12 flex justify-center">
          <img 
            src="/Asset 3@4x.png" 
            alt="Booking Hub Logo" 
            className="h-16 w-auto sm:h-20 md:h-24"
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

          {/* Role selection buttons - Side by side */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full">
            {/* Client Button */}
            <button
              onClick={() => handleRoleSelect('client')}
              className={`flex-1 py-4 sm:py-5 px-4 sm:px-6 rounded-2xl text-base sm:text-lg md:text-xl font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                selectedRole === 'client'
                  ? 'bg-[#00BAB5] text-white shadow-lg shadow-[#00BAB5]/30'
                  : 'bg-white text-[#0B1D37] border-2 border-[#0B1D37] hover:bg-[#0B1D37] hover:text-white shadow-lg hover:shadow-xl'
              }`}
            >
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-3">
                {/* Client Icon */}
                <svg 
                  className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" 
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
                <span className="text-sm sm:text-base md:text-lg">Client</span>
              </div>
            </button>

            {/* Partner Button */}
            <button
              onClick={() => handleRoleSelect('partner')}
              className={`flex-1 py-4 sm:py-5 px-4 sm:px-6 rounded-2xl text-base sm:text-lg md:text-xl font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                selectedRole === 'partner'
                  ? 'bg-[#00BAB5] text-white shadow-lg shadow-[#00BAB5]/30'
                  : 'bg-white text-[#0B1D37] border-2 border-[#0B1D37] hover:bg-[#0B1D37] hover:text-white shadow-lg hover:shadow-xl'
              }`}
            >
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-3">
                {/* Partner Icon */}
                <svg 
                  className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" 
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
                <span className="text-sm sm:text-base md:text-lg">Partner</span>
              </div>
            </button>
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