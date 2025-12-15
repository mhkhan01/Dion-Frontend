'use client';

import { useState, useEffect } from 'react';

export default function TermsAndConditionsPage() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobileMenuOpen) {
        const target = event.target as Element;
        if (!target.closest('.mobile-menu-container')) {
          setIsMobileMenuOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#F6F6F4] px-4 sm:px-6 py-4 sm:py-6 lg:py-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <a href="/" className="py-1">
              <img src="/blue-teal.webp" alt="Booking Hub Logo" className="h-10 sm:h-12 md:h-14 lg:h-16 w-auto object-contain" style={{ maxWidth: '100%' }} />
            </a>
          </div>

          {/* Desktop Navigation - Hidden on mobile, visible on tablet and up */}
          <nav className="hidden md:flex items-center space-x-4 lg:space-x-6 ml-auto mr-4 lg:mr-6">
            <a href="/contact" style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500 }} className="text-[#0B1D37] hover:text-[#00BAB5] transition-colors text-base lg:text-lg">Contact Us</a>
            <a 
              href="/booking-request" 
              style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500 }}
              className="bg-[#00BAB5] text-white hover:bg-[#009a96] transition-colors px-4 py-2 rounded-md text-base lg:text-lg border-2 border-[#0B1D37]"
            >
              Request a Booking
            </a>
            <a 
              href="/auth/signup/partner" 
              style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500 }}
              className="bg-[#E9ECEF] text-[#0B1D37] hover:bg-[#dee2e6] transition-colors px-4 py-2 rounded-md text-base lg:text-lg border-2 border-[#0B1D37]"
            >
              List Your Property
            </a>
          </nav>

          {/* Desktop User Menu - Hidden on mobile, visible on tablet and up */}
          <div className="hidden md:block relative">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-10 h-10 lg:w-12 lg:h-12 bg-gray-300 rounded-full flex items-center justify-center hover:bg-gray-400 transition-colors"
            >
              <svg className="w-5 h-5 lg:w-6 lg:h-6 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </button>
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-32 lg:w-36 shadow-lg z-50 rounded-lg bg-white border border-gray-200">
                <div className="py-1">
                  <a href="/auth/signup/client" style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500 }} className="block px-3 py-2 text-sm text-[#00BAB5] hover:bg-gray-100 text-center">Client login</a>
                  <a href="/auth/signup/partner" style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500 }} className="block px-3 py-2 text-sm text-[#00BAB5] hover:bg-gray-100 text-center">Partner login</a>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Button - Visible only on mobile */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center hover:bg-gray-400 transition-colors"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Sidebar Menu - Visible only on mobile */}
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setIsMobileMenuOpen(false)}
            ></div>
            
            {/* Sidebar */}
            <div className="md:hidden fixed top-0 left-0 h-full w-64 bg-white shadow-xl z-50 mobile-menu-container">
              <div className="flex flex-col h-full">
                {/* Sidebar Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <a href="/" className="py-1">
                    <img src="/blue-teal.webp" alt="Booking Hub Logo" className="h-8 w-auto object-contain" style={{ maxWidth: '100%' }} />
                  </a>
                  <button 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                  >
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Sidebar Navigation */}
                <div className="flex-1 px-6 py-8">
                  <nav className="space-y-4">
                    <a 
                      href="/contact" 
                      style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500 }}
                      className="block text-[#0B1D37] hover:text-[#00BAB5] transition-colors text-base py-2"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Contact Us
                    </a>
                    <a 
                      href="/booking-request" 
                      style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500 }}
                      className="block bg-[#00BAB5] text-white hover:bg-[#009a96] transition-colors px-4 py-2 rounded-md text-base text-center border-2 border-[#0B1D37]"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Request a Booking
                    </a>
                    <a 
                      href="/auth/signup/partner" 
                      style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500 }}
                      className="block bg-[#E9ECEF] text-[#0B1D37] hover:bg-[#dee2e6] transition-colors px-4 py-2 rounded-md text-base text-center border-2 border-[#0B1D37]"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      List Your Property
                    </a>
                  </nav>
                </div>

                {/* Sidebar Footer with User Menu */}
                <div className="p-6 border-t border-gray-200">
                  <div className="relative">
                    <div className="flex items-center">
                      <button 
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center hover:bg-gray-400 transition-colors"
                      >
                        <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                    
                    {isDropdownOpen && (
                      <div className="absolute left-12 -top-8 w-36 shadow-lg z-50 rounded-lg bg-white border border-gray-200">
                        <div className="py-1">
                          <a 
                            href="/auth/signup/client" 
                            style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500 }}
                            className="block px-3 py-2 text-sm text-[#00BAB5] hover:bg-gray-100 text-center"
                            onClick={() => {
                              setIsDropdownOpen(false);
                              setIsMobileMenuOpen(false);
                            }}
                          >
                            Client login
                          </a>
                          <a 
                            href="/auth/signup/partner" 
                            style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500 }}
                            className="block px-3 py-2 text-sm text-[#00BAB5] hover:bg-gray-100 text-center"
                            onClick={() => {
                              setIsDropdownOpen(false);
                              setIsMobileMenuOpen(false);
                            }}
                          >
                            Partner login
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </header>

      {/* Banner */}
      <div className="bg-[#0B1D37] py-6 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-2 sm:mb-4">
            Terms and Conditions
          </h1>
          <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="text-sm sm:text-xl text-white opacity-90">
            Last Updated: 26 October 2025
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 sm:px-6 lg:px-8 py-6 sm:py-12">
        <div className="prose prose-lg max-w-none">
          
          {/* Section 1: About These Terms */}
          <div className="mb-6 sm:mb-12">
            <div className="flex items-center mb-2 sm:mb-6">
              <div style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="w-10 h-10 sm:w-12 sm:h-12 bg-[#00BAB5] rounded-full flex items-center justify-center text-white font-bold text-xl sm:text-xl mr-4">
                1
              </div>
              <h2 style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="text-xl sm:text-2xl font-bold text-[#4B4E53]">About These Terms</h2>
            </div>
            <div className="text-[#4B4E53] leading-tight sm:leading-relaxed">
              <h3 style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500 }} className="text-sm sm:text-xl font-semibold text-[#4B4E53] mb-2 sm:mb-4 tracking-wide">1.1 Who We Are</h3>
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="mb-2 sm:mb-4 text-xs sm:text-base">
                These terms apply to the website booking-hub.co.uk (the "Website"), operated by Dion Wright Property Ltd trading as Booking Hub.
              </p>
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="mb-2 sm:mb-4 text-xs sm:text-base">
                <strong style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500, fontSize: '0.875rem' }} className="tracking-wide">Company Details:</strong><br />
                Company Name: Dion Wright Property Ltd<br />
                Registered in England & Wales: No. 15312220<br />
                Registered Office: SA12 Business Centre, Seaway Parade, Baglan Energy Park, Port Talbot SA12 7BR<br />
                Contact: info@booking-hub.co.uk | 0330 043 7522
              </p>
              
              <h3 style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500 }} className="text-sm sm:text-xl font-semibold text-[#4B4E53] mb-2 sm:mb-4 tracking-wide">1.2 Agreement to Terms</h3>
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="mb-2 sm:mb-4 text-xs sm:text-base">
                By accessing or using this Website, you agree to these Website Terms and Conditions. If you do not agree, you must stop using the Website immediately.
              </p>
              
              <h3 style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500 }} className="text-sm sm:text-xl font-semibold text-[#4B4E53] mb-2 sm:mb-4 tracking-wide">1.3 Other Terms That Apply</h3>
              <ul style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="list-disc pl-6 mb-2 sm:mb-4 text-xs sm:text-base">
                <li><strong style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500, fontSize: '0.875rem' }} className="tracking-wide">Privacy Policy:</strong> explains how we handle your personal data</li>
                <li><strong style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500, fontSize: '0.875rem' }} className="tracking-wide">Cookie Notice:</strong> explains our use of cookies</li>
                <li><strong style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500, fontSize: '0.875rem' }} className="tracking-wide">Client Terms and Conditions:</strong> apply when you register as a client or make a booking request</li>
                <li><strong style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500, fontSize: '0.875rem' }} className="tracking-wide">Partner Terms and Conditions:</strong> apply when you register as a property partner or list properties</li>
              </ul>
            </div>
          </div>

          {/* Section 2: Using Our Website */}
          <div className="mb-6 sm:mb-12">
            <div className="flex items-center mb-2 sm:mb-6">
              <div style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="w-10 h-10 sm:w-12 sm:h-12 bg-[#00BAB5] rounded-full flex items-center justify-center text-white font-bold text-xl sm:text-xl mr-4">
                2
              </div>
              <h2 style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="text-xl sm:text-2xl font-bold text-[#4B4E53]">Using Our Website</h2>
            </div>
            <div className="text-[#4B4E53] leading-tight sm:leading-relaxed">
              <h3 style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500 }} className="text-sm sm:text-xl font-semibold text-[#4B4E53] mb-2 sm:mb-4 tracking-wide">2.1 What You Can Use It For</h3>
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="mb-2 sm:mb-4 text-xs sm:text-base">The Website provides information about our accommodation booking services and allows you to:</p>
              <ul style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="list-disc pl-6 mb-2 sm:mb-4 text-xs sm:text-base">
                <li>Learn about our services</li>
                <li>Submit booking requests (subject to Client Terms)</li>
                <li>Register as a property partner (subject to Partner Terms)</li>
                <li>Contact us with enquiries</li>
              </ul>
              
              <h3 style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500 }} className="text-sm sm:text-xl font-semibold text-[#4B4E53] mb-2 sm:mb-4 tracking-wide">2.2 What This Website Is Not</h3>
              <ul style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="list-disc pl-6 mb-2 sm:mb-4 text-xs sm:text-base">
                <li>We are not a property owner or accommodation provider—we connect clients with property partners</li>
                <li>We do not guarantee availability of accommodation until a booking is confirmed</li>
                <li>Information on the Website is for general guidance only and does not constitute professional advice</li>
              </ul>
              
              <h3 style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500 }} className="text-sm sm:text-xl font-semibold text-[#4B4E53] mb-2 sm:mb-4 tracking-wide">2.3 Changes to the Website</h3>
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="text-xs sm:text-base">
                We may update, change, or suspend the Website at any time without notice. We are not liable if the Website is unavailable for any reason.
              </p>
            </div>
          </div>

          {/* Section 3: Acceptable Use */}
          <div className="mb-6 sm:mb-12">
            <div className="flex items-center mb-2 sm:mb-6">
              <div style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="w-10 h-10 sm:w-12 sm:h-12 bg-[#00BAB5] rounded-full flex items-center justify-center text-white font-bold text-xl sm:text-xl mr-4">
                3
              </div>
              <h2 style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="text-xl sm:text-2xl font-bold text-[#4B4E53]">Acceptable Use</h2>
            </div>
            <div className="text-[#4B4E53] leading-tight sm:leading-relaxed">
              <h3 style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500 }} className="text-sm sm:text-xl font-semibold text-[#4B4E53] mb-2 sm:mb-4 tracking-wide">3.1 You Must Not:</h3>
              <ul style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="list-disc pl-6 mb-2 sm:mb-4 text-xs sm:text-base">
                <li>Use the Website for any unlawful purpose</li>
                <li>Attempt to gain unauthorised access to the Website, servers, or databases</li>
                <li>Transmit viruses, malware, or any harmful code</li>
                <li>Scrape, copy, or reproduce content without permission</li>
                <li>Impersonate another person or misrepresent your affiliation with any person or organisation</li>
                <li>Use the Website to harass, abuse, or harm others</li>
                <li>Submit false or fraudulent booking requests or property listings</li>
                <li>Interfere with other users' access to the Website</li>
              </ul>
              
              <h3 style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500 }} className="text-sm sm:text-xl font-semibold text-[#4B4E53] mb-2 sm:mb-4 tracking-wide">3.2 Consequences of Misuse</h3>
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="mb-2 sm:mb-4 text-xs sm:text-base">We reserve the right to:</p>
              <ul style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="list-disc pl-6 mb-2 sm:mb-4 text-xs sm:text-base">
                <li>Suspend or terminate your access to the Website</li>
                <li>Remove any content you have submitted</li>
                <li>Report illegal activity to relevant authorities</li>
                <li>Take legal action if necessary</li>
              </ul>
            </div>
          </div>

          {/* Section 4: Intellectual Property */}
          <div className="mb-6 sm:mb-12">
            <div className="flex items-center mb-2 sm:mb-6">
              <div style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="w-10 h-10 sm:w-12 sm:h-12 bg-[#00BAB5] rounded-full flex items-center justify-center text-white font-bold text-xl sm:text-xl mr-4">
                4
              </div>
              <h2 style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="text-xl sm:text-2xl font-bold text-[#4B4E53]">Intellectual Property</h2>
            </div>
            <div className="text-[#4B4E53] leading-tight sm:leading-relaxed">
              <h3 style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500 }} className="text-sm sm:text-xl font-semibold text-[#4B4E53] mb-2 sm:mb-4 tracking-wide">4.1 Our Content</h3>
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="mb-2 sm:mb-4 text-xs sm:text-base">
                All content on this Website—including text, images, logos, design, graphics, and software—is owned by or licensed to Booking Hub and protected by copyright, trademark, and other intellectual property laws.
              </p>
              
              <h3 style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500 }} className="text-sm sm:text-xl font-semibold text-[#4B4E53] mb-2 sm:mb-4 tracking-wide">4.2 What You Can Do</h3>
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="mb-2 sm:mb-4 text-xs sm:text-base">You may view and print content for personal, non-commercial use only.</p>
              
              <h3 style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500 }} className="text-sm sm:text-xl font-semibold text-[#4B4E53] mb-2 sm:mb-4 tracking-wide">4.3 What You Cannot Do</h3>
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="mb-2 sm:mb-4 text-xs sm:text-base">You must not:</p>
              <ul style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="list-disc pl-6 mb-2 sm:mb-4 text-xs sm:text-base">
                <li>Reproduce, distribute, or modify any content without written permission</li>
                <li>Use our branding, logo, or name without authorisation</li>
                <li>Remove copyright or trademark notices</li>
              </ul>
            </div>
          </div>

          {/* Section 5: Third-Party Links */}
          <div className="mb-6 sm:mb-12">
            <div className="flex items-center mb-2 sm:mb-6">
              <div style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="w-10 h-10 sm:w-12 sm:h-12 bg-[#00BAB5] rounded-full flex items-center justify-center text-white font-bold text-xl sm:text-xl mr-4">
                5
              </div>
              <h2 style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="text-xl sm:text-2xl font-bold text-[#4B4E53]">Third-Party Links</h2>
            </div>
            <div className="text-[#4B4E53] leading-tight sm:leading-relaxed">
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="mb-2 sm:mb-4 text-xs sm:text-base">The Website may contain links to third-party websites. We are not responsible for:</p>
              <ul style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="list-disc pl-6 mb-2 sm:mb-4 text-xs sm:text-base">
                <li>The content or availability of external sites</li>
                <li>Any loss or damage caused by your use of third-party sites</li>
              </ul>
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="text-xs sm:text-base">
                Clicking external links is at your own risk. We recommend reviewing the terms and privacy policies of any third-party sites you visit.
              </p>
            </div>
          </div>

          {/* Section 6: Limitation of Liability */}
          <div className="mb-6 sm:mb-12">
            <div className="flex items-center mb-2 sm:mb-6">
              <div style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="w-10 h-10 sm:w-12 sm:h-12 bg-[#00BAB5] rounded-full flex items-center justify-center text-white font-bold text-xl sm:text-xl mr-4">
                6
              </div>
              <h2 style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="text-xl sm:text-2xl font-bold text-[#4B4E53]">Limitation of Liability</h2>
            </div>
            <div className="text-[#4B4E53] leading-tight sm:leading-relaxed">
              <h3 style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500 }} className="text-sm sm:text-xl font-semibold text-[#4B4E53] mb-2 sm:mb-4 tracking-wide">6.1 Website Provided "As Is"</h3>
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="mb-2 sm:mb-4 text-xs sm:text-base">We provide the Website on an "as is" basis. We do not guarantee that:</p>
              <ul style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="list-disc pl-6 mb-2 sm:mb-4 text-xs sm:text-base">
                <li>The Website will be uninterrupted, secure, or error-free</li>
                <li>Information on the Website is accurate, complete, or up to date</li>
              </ul>
              
              <h3 style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500 }} className="text-sm sm:text-xl font-semibold text-[#4B4E53] mb-2 sm:mb-4 tracking-wide">6.2 What We Are Not Liable For</h3>
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="mb-2 sm:mb-4 text-xs sm:text-base">To the fullest extent permitted by law, we are not liable for:</p>
              <ul style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="list-disc pl-6 mb-2 sm:mb-4 text-xs sm:text-base">
                <li>Any loss or damage arising from your use of the Website</li>
                <li>Indirect, consequential, or incidental losses (including lost profits, data loss, or business interruption)</li>
                <li>Any issues arising from third-party services or links</li>
              </ul>
              
              <h3 style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500 }} className="text-sm sm:text-xl font-semibold text-[#4B4E53] mb-2 sm:mb-4 tracking-wide">6.3 Nothing in These Terms:</h3>
              <ul style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="list-disc pl-6 mb-2 sm:mb-4 text-xs sm:text-base">
                <li>Excludes or limits our liability for death or personal injury caused by our negligence</li>
                <li>Excludes or limits liability that cannot be excluded under UK law</li>
              </ul>
            </div>
          </div>

          {/* Section 7: Indemnity */}
          <div className="mb-6 sm:mb-12">
            <div className="flex items-center mb-2 sm:mb-6">
              <div style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="w-10 h-10 sm:w-12 sm:h-12 bg-[#00BAB5] rounded-full flex items-center justify-center text-white font-bold text-xl sm:text-xl mr-4">
                7
              </div>
              <h2 style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="text-xl sm:text-2xl font-bold text-[#4B4E53]">Indemnity</h2>
            </div>
            <div className="text-[#4B4E53] leading-tight sm:leading-relaxed">
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="text-xs sm:text-base">
                You agree to indemnify and hold harmless Booking Hub, its directors, employees, and affiliates from any claims, losses, liabilities, or expenses (including legal fees) arising from:
              </p>
              <ul style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="list-disc pl-6 mb-2 sm:mb-4 text-xs sm:text-base">
                <li>Your breach of these Terms</li>
                <li>Your misuse of the Website</li>
                <li>Your violation of any law or third-party rights</li>
              </ul>
            </div>
          </div>

          {/* Section 8: Data Protection and Privacy */}
          <div className="mb-6 sm:mb-12">
            <div className="flex items-center mb-2 sm:mb-6">
              <div style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="w-10 h-10 sm:w-12 sm:h-12 bg-[#00BAB5] rounded-full flex items-center justify-center text-white font-bold text-xl sm:text-xl mr-4">
                8
              </div>
              <h2 style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="text-xl sm:text-2xl font-bold text-[#4B4E53]">Data Protection and Privacy</h2>
            </div>
            <div className="text-[#4B4E53] leading-tight sm:leading-relaxed">
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="mb-2 sm:mb-4 text-xs sm:text-base">We process personal data in accordance with:</p>
              <ul style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="list-disc pl-6 mb-2 sm:mb-4 text-xs sm:text-base">
                <li>UK General Data Protection Regulation (UK GDPR)</li>
                <li>Data Protection Act 2018</li>
                <li>Our Privacy Policy (available on the Website)</li>
              </ul>
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="text-xs sm:text-base">
                For details on how we collect, use, and protect your data, please read our Privacy Policy.
              </p>
            </div>
          </div>

          {/* Section 9: Changes to These Terms */}
          <div className="mb-6 sm:mb-12">
            <div className="flex items-center mb-2 sm:mb-6">
              <div style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="w-10 h-10 sm:w-12 sm:h-12 bg-[#00BAB5] rounded-full flex items-center justify-center text-white font-bold text-xl sm:text-xl mr-4">
                9
              </div>
              <h2 style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="text-xl sm:text-2xl font-bold text-[#4B4E53]">Changes to These Terms</h2>
            </div>
            <div className="text-[#4B4E53] leading-tight sm:leading-relaxed">
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="mb-2 sm:mb-4 text-xs sm:text-base">
                We may update these Terms from time to time. Changes will be posted on this page with a new "Last Updated" date. Continued use of the Website after changes are posted constitutes acceptance of the updated Terms.
              </p>
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="text-xs sm:text-base">
                We recommend checking this page periodically for updates.
              </p>
            </div>
          </div>

          {/* Section 10: Governing Law and Jurisdiction */}
          <div className="mb-6 sm:mb-12">
            <div className="flex items-center mb-2 sm:mb-6">
              <div style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="w-10 h-10 sm:w-12 sm:h-12 bg-[#00BAB5] rounded-full flex items-center justify-center text-white font-bold text-xl sm:text-xl mr-4">
                10
              </div>
              <h2 style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="text-xl sm:text-2xl font-bold text-[#4B4E53]">Governing Law and Jurisdiction</h2>
            </div>
            <div className="text-[#4B4E53] leading-tight sm:leading-relaxed">
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="text-xs sm:text-base">
                These Terms are governed by the laws of England and Wales. Any disputes arising from these Terms or your use of the Website will be subject to the exclusive jurisdiction of the courts of England and Wales.
              </p>
            </div>
          </div>

          {/* Section 11: Right to Refuse Service */}
          <div className="mb-6 sm:mb-12">
            <div className="flex items-center mb-2 sm:mb-6">
              <div style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="w-10 h-10 sm:w-12 sm:h-12 bg-[#00BAB5] rounded-full flex items-center justify-center text-white font-bold text-xl sm:text-xl mr-4">
                11
              </div>
              <h2 style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="text-xl sm:text-2xl font-bold text-[#4B4E53]">Right to Refuse Service</h2>
            </div>
            <div className="text-[#4B4E53] leading-tight sm:leading-relaxed">
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="text-xs sm:text-base">
                We may, where we have good reason, restrict or terminate your access to the Website at any time.
              </p>
            </div>
          </div>

          {/* Section 12: Contact Us */}
          <div className="mb-6 sm:mb-12">
            <div className="flex items-center mb-2 sm:mb-6">
              <div style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="w-10 h-10 sm:w-12 sm:h-12 bg-[#00BAB5] rounded-full flex items-center justify-center text-white font-bold text-xl sm:text-xl mr-4">
                12
              </div>
              <h2 style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="text-xl sm:text-2xl font-bold text-[#4B4E53]">Contact Us</h2>
            </div>
            <div className="text-[#4B4E53] leading-tight sm:leading-relaxed">
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="mb-2 sm:mb-4 text-xs sm:text-base">If you have questions about these Terms or need to report misuse of the Website, contact us:</p>
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="mb-2 sm:mb-4 text-xs sm:text-base">
                <strong style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500, fontSize: '0.875rem' }} className="tracking-wide">Booking Hub</strong><br />
                (A trading name of Dion Wright Property Ltd)<br />
                Email: info@booking-hub.co.uk<br />
                Phone: 0330 043 7522<br />
                Address: SA12 Business Centre, Seaway Parade, Baglan Energy Park, Port Talbot SA12 7BR
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 sm:mt-16 pt-4 sm:pt-8 border-t border-gray-200 text-center">
            <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="text-[#4B4E53] text-xs sm:text-sm">
              © 2025 Booking Hub. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
