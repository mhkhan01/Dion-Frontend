'use client';

import { useState, useEffect } from 'react';

export default function PrivacyPolicyPage() {
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
            Privacy Policy
          </h1>
          {/* Desktop view */}
          <div style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="hidden sm:flex justify-center items-center space-x-8 text-sm sm:text-base text-white opacity-90">
            <span>Effective Date: 26 October 2025</span>
            <span>Last Updated: 26 October 2025</span>
          </div>
          {/* Mobile view */}
          <div style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="sm:hidden flex items-center justify-center space-x-8 text-sm text-white opacity-90">
            <div className="flex flex-col items-center leading-tight">
              <span>Effective Date</span>
              <span>26 October 2025</span>
            </div>
            <div className="flex flex-col items-center leading-tight">
              <span>Last Updated</span>
              <span>26 October 2025</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 sm:px-6 lg:px-8 py-6 sm:py-12">
        <div className="prose prose-lg max-w-none">
          
          {/* Section 1: Introduction */}
          <div className="mb-6 sm:mb-12">
            <div className="flex items-center mb-2 sm:mb-6">
              <div style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="w-10 h-10 sm:w-12 sm:h-12 bg-[#00BAB5] rounded-full flex items-center justify-center text-white font-bold text-xl sm:text-xl mr-4">
                1
              </div>
              <h2 style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="text-xl sm:text-2xl font-bold text-[#4B4E53]">Introduction</h2>
            </div>
            <div className="text-[#4B4E53] leading-tight sm:leading-relaxed">
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="mb-2 sm:mb-4 text-xs sm:text-base">
                This Privacy Policy explains how Booking Hub (a trading name of Dion Wright Property Ltd, company number 15312220) collects, uses, and protects your personal information when you use our website at booking-hub.co.uk and our accommodation booking services.
              </p>
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="mb-2 sm:mb-4 text-xs sm:text-base">
                We are committed to protecting your privacy in accordance with UK GDPR and the Data Protection Act 2018.
              </p>
              
              <h3 style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500, fontSize: '0.875rem' }} className="text-sm sm:text-xl font-semibold text-[#4B4E53] mb-2 sm:mb-4 tracking-wide">Data Controller:</h3>
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="mb-2 sm:mb-4 text-xs sm:text-base">
                Dion Wright Property Ltd<br />
                Trading as: Booking Hub<br />
                Company No. 15312220<br />
                ICO Registration: ZB743388<br />
                Registered Office: SA12 Business Centre, Seaway Parade, Baglan Energy Park, Port Talbot SA12 7BR<br />
                Email: info@booking-hub.co.uk<br />
                Tel: 0330 043 7522
              </p>
            </div>
          </div>

          {/* Section 2: Information We Collect */}
          <div className="mb-6 sm:mb-12">
            <div className="flex items-center mb-2 sm:mb-6">
              <div style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="w-10 h-10 sm:w-12 sm:h-12 bg-[#00BAB5] rounded-full flex items-center justify-center text-white font-bold text-xl sm:text-xl mr-4">
                2
              </div>
              <h2 style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="text-xl sm:text-2xl font-bold text-[#4B4E53]">Information We Collect</h2>
            </div>
            <div className="text-[#4B4E53] leading-tight sm:leading-relaxed">
              <h3 style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500 }} className="text-sm sm:text-xl font-semibold text-[#4B4E53] mb-2 sm:mb-4 tracking-wide">2.1 Information You Give Us</h3>
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="mb-2 sm:mb-4 text-xs sm:text-base"><strong style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500, fontSize: '0.875rem' }} className="tracking-wide">Clients (Organisations booking accommodation):</strong></p>
              <ul style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="list-disc pl-6 mb-2 sm:mb-4 text-xs sm:text-base">
                <li>Company details (name, registration number, type)</li>
                <li>Contact information (name, email, phone)</li>
                <li>Booking requirements (location, dates, number of people, budget)</li>
                <li>Payment information (processed securely via Stripe)</li>
                <li>Account login details</li>
              </ul>
              
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="mb-2 sm:mb-4 text-xs sm:text-base"><strong style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500, fontSize: '0.875rem' }} className="tracking-wide">Property Partners (Accommodation providers):</strong></p>
              <ul style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="list-disc pl-6 mb-2 sm:mb-4 text-xs sm:text-base">
                <li>Company and contact details</li>
                <li>Property information (address, photos, features, compliance certificates)</li>
                <li>Bank details (for payments)</li>
                <li>VAT information (if applicable)</li>
                <li>Account login details</li>
              </ul>
              
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="mb-2 sm:mb-4 text-xs sm:text-base"><strong style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500, fontSize: '0.875rem' }} className="tracking-wide">Guests (End users):</strong></p>
              <ul style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="list-disc pl-6 mb-2 sm:mb-4 text-xs sm:text-base">
                <li>Name and contact details</li>
                <li>Check-in/check-out dates</li>
              </ul>
              
              <h3 style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500 }} className="text-sm sm:text-xl font-semibold text-[#4B4E53] mb-2 sm:mb-4 tracking-wide">2.2 Information We Collect Automatically</h3>
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="mb-2 sm:mb-4 text-xs sm:text-base">When you use our website, we automatically collect:</p>
              <ul style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="list-disc pl-6 mb-2 sm:mb-4 text-xs sm:text-base">
                <li>IP address, browser type, device information</li>
                <li>Pages visited and how you use our site</li>
                <li>Location data (approximate, from IP address)</li>
                <li>Cookies and similar technologies (see Section 8)</li>
              </ul>
              
              <h3 style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500 }} className="text-sm sm:text-xl font-semibold text-[#4B4E53] mb-2 sm:mb-4 tracking-wide">2.3 Information from Third Parties</h3>
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="mb-2 sm:mb-4 text-xs sm:text-base">We receive information from:</p>
              <ul style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="list-disc pl-6 mb-2 sm:mb-4 text-xs sm:text-base">
                <li>Payment processors (Stripe)</li>
                <li>Accounting software (Xero)</li>
                <li>CRM system (GoHighLevel)</li>
                <li>Referencing agencies (where applicable)</li>
              </ul>
            </div>
          </div>

          {/* Section 3: How We Use Your Information */}
          <div className="mb-6 sm:mb-12">
            <div className="flex items-center mb-2 sm:mb-6">
              <div style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="w-10 h-10 sm:w-12 sm:h-12 bg-[#00BAB5] rounded-full flex items-center justify-center text-white font-bold text-xl sm:text-xl mr-4">
                3
              </div>
              <h2 style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="text-xl sm:text-2xl font-bold text-[#4B4E53]">How We Use Your Information</h2>
            </div>
            <div className="text-[#4B4E53] leading-tight sm:leading-relaxed">
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="mb-2 sm:mb-4 text-xs sm:text-base">We use your information to:</p>
              
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="mb-2 sm:mb-4 text-xs sm:text-base"><strong style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500, fontSize: '0.875rem' }} className="tracking-wide">Provide Our Services:</strong></p>
              <ul style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="list-disc pl-6 mb-2 sm:mb-4 text-xs sm:text-base">
                <li>Process and manage booking requests</li>
                <li>Match clients with suitable properties</li>
                <li>Handle payments and invoicing</li>
                <li>Manage user accounts</li>
                <li>Send booking confirmations and check-in details</li>
              </ul>
              
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="mb-2 sm:mb-4 text-xs sm:text-base"><strong style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500, fontSize: '0.875rem' }} className="tracking-wide">Business Operations:</strong></p>
              <ul style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="list-disc pl-6 mb-2 sm:mb-4 text-xs sm:text-base">
                <li>Improve our platform and services</li>
                <li>Prevent fraud and ensure security</li>
                <li>Respond to enquiries and provide support</li>
                <li>Conduct market research</li>
                <li>Share information with our group companies and business partners for operational efficiency and integrated services</li>
              </ul>
              
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="mb-2 sm:mb-4 text-xs sm:text-base"><strong style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500, fontSize: '0.875rem' }} className="tracking-wide">Legal Requirements:</strong></p>
              <ul style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="list-disc pl-6 mb-2 sm:mb-4 text-xs sm:text-base">
                <li>Comply with tax, accounting, and regulatory obligations</li>
                <li>Verify compliance with safety standards</li>
                <li>Respond to legal requests</li>
              </ul>
              
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="mb-2 sm:mb-4 text-xs sm:text-base"><strong style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500, fontSize: '0.875rem' }} className="tracking-wide">Marketing:</strong></p>
              <ul style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="list-disc pl-6 mb-2 sm:mb-4 text-xs sm:text-base">
                <li>Send promotional communications (with your consent)</li>
                <li>Contact prospective clients and partners</li>
              </ul>
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="mb-2 sm:mb-4 text-xs sm:text-base">You can opt out of marketing communications at any time.</p>
            </div>
          </div>

          {/* Section 4: Legal Basis for Processing */}
          <div className="mb-6 sm:mb-12">
            <div className="flex items-center mb-2 sm:mb-6">
              <div style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="w-10 h-10 sm:w-12 sm:h-12 bg-[#00BAB5] rounded-full flex items-center justify-center text-white font-bold text-xl sm:text-xl mr-4">
                4
              </div>
              <h2 style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="text-xl sm:text-2xl font-bold text-[#4B4E53]">Legal Basis for Processing</h2>
            </div>
            <div className="text-[#4B4E53] leading-tight sm:leading-relaxed">
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="mb-2 sm:mb-4 text-xs sm:text-base">We process your information based on:</p>
              <ul style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="list-disc pl-6 mb-2 sm:mb-4 text-xs sm:text-base">
                <li><strong style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500, fontSize: '0.875rem' }} className="tracking-wide">Contract:</strong> To provide our booking services</li>
                <li><strong style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500, fontSize: '0.875rem' }} className="tracking-wide">Legitimate Interests:</strong> To operate our business, prevent fraud, and improve services</li>
                <li><strong style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500, fontSize: '0.875rem' }} className="tracking-wide">Legal Obligation:</strong> To comply with tax, accounting, and regulatory requirements</li>
                <li><strong style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500, fontSize: '0.875rem' }} className="tracking-wide">Consent:</strong> For marketing communications and non-essential cookies</li>
              </ul>
            </div>
          </div>

          {/* Section 5: Who We Share Your Information With */}
          <div className="mb-6 sm:mb-12">
            <div className="flex items-center mb-2 sm:mb-6">
              <div style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="w-10 h-10 sm:w-12 sm:h-12 bg-[#00BAB5] rounded-full flex items-center justify-center text-white font-bold text-xl sm:text-xl mr-4">
                5
              </div>
              <h2 style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="text-xl sm:text-2xl font-bold text-[#4B4E53]">Who We Share Your Information With</h2>
            </div>
            <div className="text-[#4B4E53] leading-tight sm:leading-relaxed">
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="mb-2 sm:mb-4 text-xs sm:text-base">We do not sell your personal information. We share it only with:</p>
              
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="mb-2 sm:mb-4 text-xs sm:text-base"><strong style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500, fontSize: '0.875rem' }} className="tracking-wide">Service Providers:</strong></p>
              <ul style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="list-disc pl-6 mb-2 sm:mb-4 text-xs sm:text-base">
                <li>Stripe (payment processing)</li>
                <li>Xero (invoicing and accounting)</li>
                <li>GoHighLevel (communications and CRM)</li>
                <li>Hosting and IT service providers</li>
                <li>Analytics providers (Google Analytics)</li>
              </ul>
              
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="mb-2 sm:mb-4 text-xs sm:text-base"><strong style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500, fontSize: '0.875rem' }} className="tracking-wide">Between Platform Users:</strong></p>
              <ul style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="list-disc pl-6 mb-2 sm:mb-4 text-xs sm:text-base">
                <li>We share booking details between clients and property partners to facilitate bookings</li>
                <li>Property addresses are only revealed after payment confirmation</li>
              </ul>
              
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="mb-2 sm:mb-4 text-xs sm:text-base"><strong style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500, fontSize: '0.875rem' }} className="tracking-wide">Group Companies and Business Partners:</strong></p>
              <ul style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="list-disc pl-6 mb-2 sm:mb-4 text-xs sm:text-base">
                <li>We may share information with other companies in our group and trusted business partners for operational efficiency, shared services, business development, and service enhancement</li>
                <li>All recipients must maintain equivalent security standards and comply with UK GDPR</li>
                <li>You can request details of specific third parties by contacting us</li>
              </ul>
              
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="mb-2 sm:mb-4 text-xs sm:text-base"><strong style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500, fontSize: '0.875rem' }} className="tracking-wide">Legal Authorities:</strong></p>
              <ul style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="list-disc pl-6 mb-2 sm:mb-4 text-xs sm:text-base">
                <li>When required by law or to protect our legal rights</li>
              </ul>
              
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="mb-2 sm:mb-4 text-xs sm:text-base"><strong style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500, fontSize: '0.875rem' }} className="tracking-wide">Business Transfers:</strong></p>
              <ul style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="list-disc pl-6 mb-2 sm:mb-4 text-xs sm:text-base">
                <li>If our business is sold or merged, your information may transfer to the new owner</li>
              </ul>
            </div>
          </div>

          {/* Section 6: Data Security */}
          <div className="mb-6 sm:mb-12">
            <div className="flex items-center mb-2 sm:mb-6">
              <div style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="w-10 h-10 sm:w-12 sm:h-12 bg-[#00BAB5] rounded-full flex items-center justify-center text-white font-bold text-xl sm:text-xl mr-4">
                6
              </div>
              <h2 style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="text-xl sm:text-2xl font-bold text-[#4B4E53]">Data Security</h2>
            </div>
            <div className="text-[#4B4E53] leading-tight sm:leading-relaxed">
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="mb-2 sm:mb-4 text-xs sm:text-base">We protect your information using:</p>
              <ul style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="list-disc pl-6 mb-2 sm:mb-4 text-xs sm:text-base">
                <li>Encryption (SSL/TLS for data transmission)</li>
                <li>Secure password storage (hashed)</li>
                <li>Access controls (only authorised staff)</li>
                <li>PCI DSS compliance for payments (via Stripe)</li>
                <li>Regular security audits</li>
              </ul>
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="mb-2 sm:mb-4 text-xs sm:text-base">No system is completely secure, but we take all reasonable measures to protect your data.</p>
            </div>
          </div>

          {/* Section 7: How Long We Keep Your Information */}
          <div className="mb-6 sm:mb-12">
            <div className="flex items-center mb-2 sm:mb-6">
              <div style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="w-10 h-10 sm:w-12 sm:h-12 bg-[#00BAB5] rounded-full flex items-center justify-center text-white font-bold text-xl sm:text-xl mr-4">
                7
              </div>
              <h2 style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="text-xl sm:text-2xl font-bold text-[#4B4E53]">How Long We Keep Your Information</h2>
            </div>
            <div className="text-[#4B4E53] leading-tight sm:leading-relaxed">
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="mb-2 sm:mb-4 text-xs sm:text-base">We retain information only as long as necessary:</p>
              <ul style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="list-disc pl-6 mb-2 sm:mb-4 text-xs sm:text-base">
                <li><strong style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500, fontSize: '0.875rem' }} className="tracking-wide">Active accounts:</strong> For the duration of your relationship with us</li>
                <li><strong style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500, fontSize: '0.875rem' }} className="tracking-wide">Financial records:</strong> 7 years after the end of the relevant financial year (UK tax law requirement)</li>
                <li><strong style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500, fontSize: '0.875rem' }} className="tracking-wide">Booking records:</strong> 7 years from transaction date</li>
                <li><strong style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500, fontSize: '0.875rem' }} className="tracking-wide">Communications:</strong> 3 years or until disputes are resolved</li>
                <li><strong style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500, fontSize: '0.875rem' }} className="tracking-wide">Marketing data:</strong> 3 years for inactive contacts (unless you consent to ongoing communications)</li>
                <li><strong style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500, fontSize: '0.875rem' }} className="tracking-wide">Analytics data:</strong> 26 months</li>
              </ul>
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="mb-2 sm:mb-4 text-xs sm:text-base">After retention periods expire, we securely delete or anonymise your information.</p>
            </div>
          </div>

          {/* Section 8: Cookies */}
          <div className="mb-6 sm:mb-12">
            <div className="flex items-center mb-2 sm:mb-6">
              <div style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="w-10 h-10 sm:w-12 sm:h-12 bg-[#00BAB5] rounded-full flex items-center justify-center text-white font-bold text-xl sm:text-xl mr-4">
                8
              </div>
              <h2 style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="text-xl sm:text-2xl font-bold text-[#4B4E53]">Cookies</h2>
            </div>
            <div className="text-[#4B4E53] leading-tight sm:leading-relaxed">
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="mb-2 sm:mb-4 text-xs sm:text-base">We use cookies to improve your experience and analyse website usage.</p>
              
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="mb-2 sm:mb-4 text-xs sm:text-base"><strong style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500, fontSize: '0.875rem' }} className="tracking-wide">Cookie Types:</strong></p>
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="mb-2 sm:mb-4 text-xs sm:text-base"><strong style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500, fontSize: '0.875rem' }} className="tracking-wide">Essential Cookies (Always active)</strong></p>
              <ul style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="list-disc pl-6 mb-2 sm:mb-4 text-xs sm:text-base">
                <li>Enable core functionality (login, security, consent preferences)</li>
                <li>No consent required</li>
              </ul>
              
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="mb-2 sm:mb-4 text-xs sm:text-base"><strong style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500, fontSize: '0.875rem' }} className="tracking-wide">Analytics Cookies</strong></p>
              <ul style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="list-disc pl-6 mb-2 sm:mb-4 text-xs sm:text-base">
                <li>Google Analytics: Understand how visitors use our site</li>
                <li>You can opt out via our cookie banner</li>
              </ul>
              
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="mb-2 sm:mb-4 text-xs sm:text-base"><strong style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500, fontSize: '0.875rem' }} className="tracking-wide">Advertising Cookies</strong></p>
              <ul style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="list-disc pl-6 mb-2 sm:mb-4 text-xs sm:text-base">
                <li>Google Ads: Deliver targeted advertising</li>
                <li>Facebook/Meta Pixel: Enable retargeting</li>
                <li>LinkedIn Insight Tag: Professional advertising</li>
                <li>You can opt out via our cookie banner</li>
              </ul>
              
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="mb-2 sm:mb-4 text-xs sm:text-base"><strong style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500, fontSize: '0.875rem' }} className="tracking-wide">Third-Party Cookies</strong></p>
              <ul style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="list-disc pl-6 mb-2 sm:mb-4 text-xs sm:text-base">
                <li>Embedded content (YouTube, Google Maps) may set their own cookies</li>
              </ul>
              
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="mb-2 sm:mb-4 text-xs sm:text-base"><strong style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500, fontSize: '0.875rem' }} className="tracking-wide">Managing Cookies:</strong></p>
              <ul style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="list-disc pl-6 mb-2 sm:mb-4 text-xs sm:text-base">
                <li><strong style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500, fontSize: '0.875rem' }} className="tracking-wide">Cookie Banner:</strong> Accept or reject non-essential cookies when you first visit</li>
                <li><strong style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500, fontSize: '0.875rem' }} className="tracking-wide">Cookie Settings:</strong> Update preferences anytime via the footer link</li>
                <li><strong style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500, fontSize: '0.875rem' }} className="tracking-wide">Browser Settings:</strong> Control cookies in Chrome, Firefox, Safari, or Edge settings</li>
                <li><strong style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500, fontSize: '0.875rem' }} className="tracking-wide">Opt-Out Tools:</strong> Visit youronlinechoices.eu or aboutads.info/choices</li>
              </ul>
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="mb-2 sm:mb-4 text-xs sm:text-base">Disabling essential cookies may prevent you from using some features of our site.</p>
            </div>
          </div>

          {/* Section 9: Your Rights */}
          <div className="mb-6 sm:mb-12">
            <div className="flex items-center mb-2 sm:mb-6">
              <div style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="w-10 h-10 sm:w-12 sm:h-12 bg-[#00BAB5] rounded-full flex items-center justify-center text-white font-bold text-xl sm:text-xl mr-4">
                9
              </div>
              <h2 style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="text-xl sm:text-2xl font-bold text-[#4B4E53]">Your Rights</h2>
            </div>
            <div className="text-[#4B4E53] leading-tight sm:leading-relaxed">
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="mb-2 sm:mb-4 text-xs sm:text-base">Under UK GDPR, you have the right to:</p>
              <ul style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="list-disc pl-6 mb-2 sm:mb-4 text-xs sm:text-base">
                <li><strong style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500, fontSize: '0.875rem' }} className="tracking-wide">Access:</strong> Request a copy of your personal data</li>
                <li><strong style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500, fontSize: '0.875rem' }} className="tracking-wide">Rectification:</strong> Correct inaccurate information</li>
                <li><strong style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500, fontSize: '0.875rem' }} className="tracking-wide">Erasure:</strong> Request deletion (subject to legal obligations)</li>
                <li><strong style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500, fontSize: '0.875rem' }} className="tracking-wide">Restriction:</strong> Limit how we process your data</li>
                <li><strong style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500, fontSize: '0.875rem' }} className="tracking-wide">Portability:</strong> Receive your data in a transferable format</li>
                <li><strong style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500, fontSize: '0.875rem' }} className="tracking-wide">Object:</strong> Object to processing based on legitimate interests or for direct marketing</li>
                <li><strong style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500, fontSize: '0.875rem' }} className="tracking-wide">Withdraw Consent:</strong> Withdraw consent at any time (doesn't affect prior processing)</li>
              </ul>
              
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="mb-2 sm:mb-4 text-xs sm:text-base"><strong style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500, fontSize: '0.875rem' }} className="tracking-wide">To exercise your rights:</strong></p>
              <ul style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="list-disc pl-6 mb-2 sm:mb-4 text-xs sm:text-base">
                <li>Email: info@booking-hub.co.uk</li>
                <li>Phone: 0330 043 7522</li>
                <li>Post: SA12 Business Centre, Seaway Parade, Baglan Energy Park, Port Talbot SA12 7BR</li>
              </ul>
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="mb-2 sm:mb-4 text-xs sm:text-base">We'll respond within one month. We may need to verify your identity first.</p>
              
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="mb-2 sm:mb-4 text-xs sm:text-base"><strong style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500, fontSize: '0.875rem' }} className="tracking-wide">Right to Complain:</strong></p>
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="mb-2 sm:mb-4 text-xs sm:text-base">If you're unhappy with how we handle your data, contact us first. If you're still not satisfied, you can complain to the Information Commissioner's Office (ICO):</p>
              <ul style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="list-disc pl-6 mb-2 sm:mb-4 text-xs sm:text-base">
                <li>Website: www.ico.org.uk</li>
                <li>Phone: 0303 123 1113</li>
                <li>Address: Wycliffe House, Water Lane, Wilmslow, Cheshire SK9 5AF</li>
              </ul>
            </div>
          </div>

          {/* Section 10: International Transfers */}
          <div className="mb-6 sm:mb-12">
            <div className="flex items-center mb-2 sm:mb-6">
              <div style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="w-10 h-10 sm:w-12 sm:h-12 bg-[#00BAB5] rounded-full flex items-center justify-center text-white font-bold text-xl sm:text-xl mr-4">
                10
              </div>
              <h2 style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="text-xl sm:text-2xl font-bold text-[#4B4E53]">International Transfers</h2>
            </div>
            <div className="text-[#4B4E53] leading-tight sm:leading-relaxed">
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="mb-2 sm:mb-4 text-xs sm:text-base">We primarily process data in the UK. Some service providers may process data outside the UK/EEA. When this happens, we ensure appropriate safeguards are in place, including:</p>
              <ul style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="list-disc pl-6 mb-2 sm:mb-4 text-xs sm:text-base">
                <li>Standard Contractual Clauses approved by the ICO</li>
                <li>Transfers to countries with adequate data protection</li>
              </ul>
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="mb-2 sm:mb-4 text-xs sm:text-base">Contact us for more information about international transfers.</p>
            </div>
          </div>

          {/* Section 11: Children's Privacy */}
          <div className="mb-6 sm:mb-12">
            <div className="flex items-center mb-2 sm:mb-6">
              <div style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="w-10 h-10 sm:w-12 sm:h-12 bg-[#00BAB5] rounded-full flex items-center justify-center text-white font-bold text-xl sm:text-xl mr-4">
                11
              </div>
              <h2 style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="text-xl sm:text-2xl font-bold text-[#4B4E53]">Children's Privacy</h2>
            </div>
            <div className="text-[#4B4E53] leading-tight sm:leading-relaxed">
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="mb-2 sm:mb-4 text-xs sm:text-base">Our services are not intended for anyone under 18. We do not knowingly collect information from children. If we discover we have collected a child's information, we will delete it immediately.</p>
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="mb-2 sm:mb-4 text-xs sm:text-base">If you believe we have information about a child, contact us at info@booking-hub.co.uk.</p>
            </div>
          </div>

          {/* Section 12: Third-Party Links */}
          <div className="mb-6 sm:mb-12">
            <div className="flex items-center mb-2 sm:mb-6">
              <div style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="w-10 h-10 sm:w-12 sm:h-12 bg-[#00BAB5] rounded-full flex items-center justify-center text-white font-bold text-xl sm:text-xl mr-4">
                12
              </div>
              <h2 style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="text-xl sm:text-2xl font-bold text-[#4B4E53]">Third-Party Links</h2>
            </div>
            <div className="text-[#4B4E53] leading-tight sm:leading-relaxed">
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="mb-2 sm:mb-4 text-xs sm:text-base">Our website may link to third-party sites. We are not responsible for their privacy practices. Please review their privacy policies before providing any information.</p>
            </div>
          </div>

          {/* Section 13: Changes to This Policy */}
          <div className="mb-6 sm:mb-12">
            <div className="flex items-center mb-2 sm:mb-6">
              <div style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="w-10 h-10 sm:w-12 sm:h-12 bg-[#00BAB5] rounded-full flex items-center justify-center text-white font-bold text-xl sm:text-xl mr-4">
                13
              </div>
              <h2 style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="text-xl sm:text-2xl font-bold text-[#4B4E53]">Changes to This Policy</h2>
            </div>
            <div className="text-[#4B4E53] leading-tight sm:leading-relaxed">
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="mb-2 sm:mb-4 text-xs sm:text-base">We may update this Privacy Policy to reflect changes in our practices or legal requirements. When we make material changes:</p>
              <ul style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="list-disc pl-6 mb-2 sm:mb-4 text-xs sm:text-base">
                <li>We'll update the "Last Updated" date</li>
                <li>We'll notify you via email or website notice</li>
                <li>We'll obtain renewed consent if required by law</li>
              </ul>
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="mb-2 sm:mb-4 text-xs sm:text-base">Check this page regularly to stay informed.</p>
            </div>
          </div>

          {/* Section 14: Complaints */}
          <div className="mb-6 sm:mb-12">
            <div className="flex items-center mb-2 sm:mb-6">
              <div style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="w-10 h-10 sm:w-12 sm:h-12 bg-[#00BAB5] rounded-full flex items-center justify-center text-white font-bold text-xl sm:text-xl mr-4">
                14
              </div>
              <h2 style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="text-xl sm:text-2xl font-bold text-[#4B4E53]">Complaints</h2>
            </div>
            <div className="text-[#4B4E53] leading-tight sm:leading-relaxed">
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="mb-2 sm:mb-4 text-xs sm:text-base">If you have concerns about how we handle your data:</p>
              <ul style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="list-disc pl-6 mb-2 sm:mb-4 text-xs sm:text-base">
                <li>Contact us at info@booking-hub.co.uk</li>
                <li>We'll acknowledge your complaint within 5 working days</li>
                <li>We'll provide a response within 30 days</li>
                <li>If you're not satisfied, you can complain to the ICO (see Section 9)</li>
              </ul>
            </div>
          </div>

          {/* Section 15: Contact Us */}
          <div className="mb-6 sm:mb-12">
            <div className="flex items-center mb-2 sm:mb-6">
              <div style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="w-10 h-10 sm:w-12 sm:h-12 bg-[#00BAB5] rounded-full flex items-center justify-center text-white font-bold text-xl sm:text-xl mr-4">
                15
              </div>
              <h2 style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="text-xl sm:text-2xl font-bold text-[#4B4E53]">Contact Us</h2>
            </div>
            <div className="text-[#4B4E53] leading-tight sm:leading-relaxed">
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="mb-2 sm:mb-4 text-xs sm:text-base">For questions about this Privacy Policy or your personal data:</p>
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="mb-2 sm:mb-4 text-xs sm:text-base">
                <strong style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500, fontSize: '0.875rem' }} className="text-xs sm:text-base tracking-wide">Booking Hub</strong><br />
                SA12 Business Centre<br />
                Seaway Parade, Baglan Energy Park<br />
                Port Talbot SA12 7BR<br />
                Email: info@booking-hub.co.uk<br />
                Phone: 0330 043 7522
              </p>
            </div>
          </div>

          {/* Section 16: Governing Law */}
          <div className="mb-6 sm:mb-12">
            <div className="flex items-center mb-2 sm:mb-6">
              <div style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="w-10 h-10 sm:w-12 sm:h-12 bg-[#00BAB5] rounded-full flex items-center justify-center text-white font-bold text-xl sm:text-xl mr-4">
                16
              </div>
              <h2 style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="text-xl sm:text-2xl font-bold text-[#4B4E53]">Governing Law</h2>
            </div>
            <div className="text-[#4B4E53] leading-tight sm:leading-relaxed">
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="mb-2 sm:mb-4 text-xs sm:text-base">This Privacy Policy is governed by the laws of England and Wales. Any disputes will be subject to the exclusive jurisdiction of the courts of England and Wales.</p>
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
