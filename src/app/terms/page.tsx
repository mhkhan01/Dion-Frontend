'use client';

import { useState, useEffect } from 'react';

export default function TermsPage() {
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
          <h1 style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="text-2xl sm:text-4xl lg:text-5xl font-bold text-white mb-2 sm:mb-4">
            Client Terms & Conditions
          </h1>
          <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="text-sm sm:text-xl text-white opacity-90">
            Last Updated: October 2025
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 sm:px-6 lg:px-8 py-6 sm:py-12">
        <div className="prose prose-lg max-w-none">
          
          {/* Section 1: About Us */}
          <div className="mb-6 sm:mb-12">
            <div className="flex items-center mb-2 sm:mb-6">
              <div style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="w-10 h-10 sm:w-12 sm:h-12 bg-[#00BAB5] rounded-full flex items-center justify-center text-white font-bold text-xl sm:text-xl mr-4">
                1
              </div>
              <h2 style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="text-xl sm:text-2xl font-bold text-[#4B4E53]">About Us</h2>
            </div>
            <div className="text-[#4B4E53] leading-tight sm:leading-relaxed">
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="mb-2 sm:mb-4 text-xs sm:text-base">
                Booking Hub is a trading name of Dion Wright Property Ltd, a company incorporated and registered in England and Wales with Company Number 15312220, whose registered office is at SA12 Business Centre, Seaway Parade, Baglan Energy Park, Port Talbot SA12 7BR (We, Us or Our). We operate the website app.booking-hub.co.uk (the Website). To contact Us, telephone our customer service team on 0330 043 7522 or email Us at info@booking-hub.co.uk.
              </p>
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="text-xs sm:text-base">
                You, the Client (as set out in Your booking), wish to make a booking with an accommodation provider introduced by Us (Property Partner) for the provision of temporary serviced accommodation. In making this booking for You, We are acting as a disclosed agent on behalf of the Property Partner.
              </p>
            </div>
          </div>

          {/* Section 2: Our Role and Your Booking */}
          <div className="mb-6 sm:mb-12">
            <div className="flex items-center mb-2 sm:mb-6">
              <div style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="w-10 h-10 sm:w-12 sm:h-12 bg-[#00BAB5] rounded-full flex items-center justify-center text-white font-bold text-xl sm:text-xl mr-4">
                2
              </div>
              <h2 style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="text-xl sm:text-2xl font-bold text-[#4B4E53]">Our Role and Your Booking</h2>
            </div>
            <div className="text-[#4B4E53] leading-tight sm:leading-relaxed">
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="mb-2 sm:mb-4 text-xs sm:text-base">
                When making a booking with Us, We are responsible for the services we provide under this Agreement, but not the accommodation itself, which is provided by the Property Partner. Your booking is directly between You and the Property Partner and We are not a party to it and we make no warranty or representation in connection with the accommodation in any way whatsoever.
              </p>
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="text-xs sm:text-base">
                Your booking may be subject to additional Property Partner Conditions of Stay. In some instances the services which make up Your booking are provided by independent suppliers where those suppliers, including Property Partners, may provide services in accordance with their own terms and conditions. We make no warranties or representations in respect of the services that these third parties provide.
              </p>
            </div>
          </div>

          {/* Section 3: These Terms */}
          <div className="mb-6 sm:mb-12">
            <div className="flex items-center mb-2 sm:mb-6">
              <div style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="w-10 h-10 sm:w-12 sm:h-12 bg-[#00BAB5] rounded-full flex items-center justify-center text-white font-bold text-xl sm:text-xl mr-4">
                3
              </div>
              <h2 style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="text-xl sm:text-2xl font-bold text-[#4B4E53]">These Terms</h2>
            </div>
            <div className="text-[#4B4E53] leading-tight sm:leading-relaxed">
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="mb-2 sm:mb-4 text-xs sm:text-base">
                These terms and conditions (Terms) apply to all bookings made with a Property Partner using Our Website and made by Our employees by any other means (together, Your booking and these Terms, which shall include our cancellation policy, constitute the entire agreement made between us (Agreement)).
              </p>
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="mb-2 sm:mb-4 text-xs sm:text-base">
                These Terms apply exclusively to business-to-business transactions. All bookings must be made by organisations, companies, or other business entities for business purposes. We do not accept bookings from consumers acting in a personal capacity. We require all bookings to be made from corporate email addresses. You shall use all reasonable endeavours to make sure that you provide us with accurate and complete information when making a booking at all times.
              </p>
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="mb-2 sm:mb-4 text-xs sm:text-base">
                Please read these Terms carefully. By booking with Us, You agree to be bound by the Agreement.
              </p>
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="mb-2 sm:mb-4 text-xs sm:text-base">
                These Terms apply to the exclusion of any other terms that You may seek to impose or incorporate, or which are implied by law, trade custom, practice or course of dealing.
              </p>
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="text-xs sm:text-base">
                The Agreement is the entire agreement between You and Us in relation to its subject matter. You acknowledge that You have not relied on any statement, promise or representation or assurance or warranty that is not set out in the Agreement.
              </p>
            </div>
          </div>

          {/* Section 4: Creating an Account and Making a Booking */}
          <div className="mb-6 sm:mb-12">
            <div className="flex items-center mb-2 sm:mb-6">
              <div style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="w-10 h-10 sm:w-12 sm:h-12 bg-[#00BAB5] rounded-full flex items-center justify-center text-white font-bold text-xl sm:text-xl mr-4">
                4
              </div>
              <h2 style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="text-xl sm:text-2xl font-bold text-[#4B4E53]">Creating an Account and Making a Booking</h2>
            </div>
            <div className="text-[#4B4E53] leading-tight sm:leading-relaxed">
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="mb-2 sm:mb-4 text-xs sm:text-base">
                To make a booking, You will need to create an account with Us, providing accurate and complete information and contact details. You agree to do this. The individual making the booking on Your behalf must be over 18 and authorised to make the booking on the basis of this Agreement on behalf of the Client and all guests under the booking.
              </p>
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="mb-2 sm:mb-4 text-xs sm:text-base">
                We shall undertake appropriate Client and guest identity verification checks from time to time, using a third party provider, at the Commencement Date (as defined in clause 5 below). Such third party provider will require You to enter into additional terms which are available on request.
              </p>
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="text-xs sm:text-base">
                No additional guests (over and above those included in your express booking) shall be allowed except in accordance with the terms of this clause. In circumstances where you require additional guests you must bring the additional details to our immediate attention. If additional guests are allowed and agreed then they shall be subject to new, separate and additional charges. We shall accept any such additional guests and bookings at our sole discretion.
              </p>
            </div>
          </div>

          {/* Section 5: Booking Requests and Confirmation */}
          <div className="mb-6 sm:mb-12">
            <div className="flex items-center mb-2 sm:mb-6">
              <div style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="w-10 h-10 sm:w-12 sm:h-12 bg-[#00BAB5] rounded-full flex items-center justify-center text-white font-bold text-xl sm:text-xl mr-4">
                5
              </div>
              <h2 style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="text-xl sm:text-2xl font-bold text-[#4B4E53]">Booking Requests and Confirmation</h2>
            </div>
            <div className="text-[#4B4E53] leading-tight sm:leading-relaxed">
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="mb-2 sm:mb-4 text-xs sm:text-base">
                After You make an enquiry with Us, You will receive an email from Us acknowledging that We have received it and we shall provide a booking reference, but please note that this does not mean that Your booking has been accepted.
              </p>
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="mb-2 sm:mb-4 text-xs sm:text-base">
                Acceptance of Your booking takes place when We, on the Property Partner's behalf, send an email to You with a link to Our Website where You accept the booking, at which point and on which date (Commencement Date) the Agreement between You and the Property Partner will come into existence and at no other time. This Agreement constitutes the entire agreement between the parties and shall supersede, extinguish and replace all prior agreements, assurances, promises, understandings, whether oral or written relating to your booking.
              </p>
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="mb-2 sm:mb-4 text-xs sm:text-base">
                Once the Property Partner has accepted and you have accepted, We will confirm Your booking by email. The Booking Confirmation shall be sent to You to the email address which You entered/provided at the time of Your enquiry. Please check all spam filtering to ensure that Our Booking Confirmation reaches You. For the avoidance of doubt, whether or not a booking is accepted is entirely at the Property Partner's discretion.
              </p>
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="text-xs sm:text-base">
                Please check Your Booking Confirmation carefully as soon as you receive it. Contact Us immediately if any information on the Booking Confirmation appears to be incorrect or incomplete as it may not be possible to make changes later.
              </p>
            </div>
          </div>

          {/* Section 6: Payment Terms */}
          <div className="mb-6 sm:mb-12">
            <div className="flex items-center mb-2 sm:mb-6">
              <div style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="w-10 h-10 sm:w-12 sm:h-12 bg-[#00BAB5] rounded-full flex items-center justify-center text-white font-bold text-xl sm:text-xl mr-4">
                6
              </div>
              <h2 style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="text-xl sm:text-2xl font-bold text-[#4B4E53]">Payment Terms</h2>
            </div>
            <div className="text-[#4B4E53] leading-tight sm:leading-relaxed">
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="mb-2 sm:mb-4 text-xs sm:text-base">
                When placing a Booking (including any Booking related to additional guests or extended stays), You agree to pay the full cost of the accommodation, inclusive of: non-refundable service fees, applicable taxes, bank charges, transaction or conversion fees, and exchange rate differences. A security deposit may also be required, as outlined in clause 11.
              </p>
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="mb-2 sm:mb-4 text-xs sm:text-base">
                All payments must be made upfront and in full before check-in. We do not offer credit terms or payment plans.
              </p>
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="mb-2 sm:mb-4 text-xs sm:text-base">
                You may pay by:
              </p>
              <ul style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="list-disc pl-6 mb-2 sm:mb-4 text-xs sm:text-base">
                <li>Invoice payment via bank transfer (BACS), or</li>
                <li>Direct payment via secure online payment link</li>
              </ul>
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="mb-2 sm:mb-4 text-xs sm:text-base">
                Payment must be made in accordance with the payment schedule on Your invoice and is due 7 days prior to check-in, or immediately if the Booking is made fewer than 7 days before check-in.
              </p>
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="text-xs sm:text-base">
                All payments are processed securely through our third party payment processor. Funds are held securely and released to the Property Partner 24 hours after check-in, provided there are no reported issues with the accommodation.
              </p>
            </div>
          </div>

          {/* Section 7: VAT */}
          <div className="mb-6 sm:mb-12">
            <div className="flex items-center mb-2 sm:mb-6">
              <div style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="w-10 h-10 sm:w-12 sm:h-12 bg-[#00BAB5] rounded-full flex items-center justify-center text-white font-bold text-xl sm:text-xl mr-4">
                7
              </div>
              <h2 style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="text-xl sm:text-2xl font-bold text-[#4B4E53]">VAT</h2>
            </div>
            <div className="text-[#4B4E53] leading-tight sm:leading-relaxed">
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="text-xs sm:text-base">
                Where the Property Partner and their property or properties booked are VAT registered, You will be entitled to claim VAT on the booking. VAT details will be clearly stated on Your invoice.
              </p>
            </div>
          </div>

          {/* Section 8: Non-Payment Consequences */}
          <div className="mb-6 sm:mb-12">
            <div className="flex items-center mb-2 sm:mb-6">
              <div style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="w-10 h-10 sm:w-12 sm:h-12 bg-[#00BAB5] rounded-full flex items-center justify-center text-white font-bold text-xl sm:text-xl mr-4">
                8
              </div>
              <h2 style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="text-xl sm:text-2xl font-bold text-[#4B4E53]">Non-Payment Consequences</h2>
            </div>
            <div className="text-[#4B4E53] leading-tight sm:leading-relaxed">
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="mb-2 sm:mb-4 text-xs sm:text-base">
                Where payment is not made in full in cleared funds by the dates set out in clause 6 or in Our payment schedule or invoice (as applicable) then Your Property Partner may cancel Your booking(s) without notice. You may not be permitted by the Property Partner to use the booked accommodation and check-in information will not be released to you. You shall also be liable for any cancellation fee, additional guest fees, reduced refund or additional charges like no-show fees in line with the accommodation's cancellation policy as set out in clause 14 of this Agreement.
              </p>
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="text-xs sm:text-base">
                If You fail to make a payment due to Us under this Agreement by the due date, then, without limiting Our remedies under this Agreement, You shall pay interest on the overdue sum from the due date until payment of the overdue sum, whether before or after judgement. Interest under this clause will accrue each day at 4% a year above the Bank of England's base rate from time to time, but at 4% a year for any period when that base rate is below 0%. You shall, in addition, pay to Us any fees, costs or expenses of collection We may reasonably incur in respect of any overdue sums.
              </p>
            </div>
          </div>

          {/* Section 9: Invoicing and Payment Methods */}
          <div className="mb-6 sm:mb-12">
            <div className="flex items-center mb-2 sm:mb-6">
              <div style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="w-10 h-10 sm:w-12 sm:h-12 bg-[#00BAB5] rounded-full flex items-center justify-center text-white font-bold text-xl sm:text-xl mr-4">
                9
              </div>
              <h2 style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="text-xl sm:text-2xl font-bold text-[#4B4E53]">Invoicing and Payment Methods</h2>
            </div>
            <div className="text-[#4B4E53] leading-tight sm:leading-relaxed">
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="mb-2 sm:mb-4 text-xs sm:text-base">
                You will receive an invoice from Us, issued on behalf of the Property Partner, for all payments due. Payments shall be made by bank transfer (BACS) or via secure online payment link as specified on Your invoice.
              </p>
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="text-xs sm:text-base">
                In instances where card payments are made via our online payment link, a 2% handling charge may be applied where it is permissible for Us to do so. We use a third party payment processor, such as Stripe, to process all payments securely.
              </p>
            </div>
          </div>

          {/* Section 10: Client Responsibility for Guests */}
          <div className="mb-6 sm:mb-12">
            <div className="flex items-center mb-2 sm:mb-6">
              <div style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="w-10 h-10 sm:w-12 sm:h-12 bg-[#00BAB5] rounded-full flex items-center justify-center text-white font-bold text-xl sm:text-xl mr-4">
                10
              </div>
              <h2 style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="text-xl sm:text-2xl font-bold text-[#4B4E53]">Client Responsibility for Guests</h2>
            </div>
            <div className="text-[#4B4E53] leading-tight sm:leading-relaxed">
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="text-xs sm:text-base">
                As the person making the booking, You, the Client, are responsible for the actions and behaviour of all guests staying in the accommodation under Your booking.
              </p>
            </div>
          </div>

          {/* Section 11: Security Deposits */}
          <div className="mb-6 sm:mb-12">
            <div className="flex items-center mb-2 sm:mb-6">
              <div style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="w-10 h-10 sm:w-12 sm:h-12 bg-[#00BAB5] rounded-full flex items-center justify-center text-white font-bold text-xl sm:text-xl mr-4">
                11
              </div>
              <h2 style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="text-xl sm:text-2xl font-bold text-[#4B4E53]">Security Deposits</h2>
            </div>
            <div className="text-[#4B4E53] leading-tight sm:leading-relaxed">
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="mb-2 sm:mb-4 text-xs sm:text-base">
                Where We require payment of a company security deposit We will take such deposit from You as provided by this clause. We may also (at our sole option) take out advanced protection (being damage protection insurance covering damage over and above the amount of any security deposit). Advanced protection is subject to You satisfactorily completing our ID verification processes.
              </p>
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="mb-2 sm:mb-4 text-xs sm:text-base">
                If you are making a booking for the first time, we will require a £500.00 security deposit as a minimum, with the option of requesting more at our sole discretion which will be added to your first issued invoice. For existing clients for whom we do not hold at least £500.00 as a security deposit, we will require an additional payment so that the security deposit is at least £500.00, which will be added to the next issued invoice.
              </p>
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="mb-2 sm:mb-4 text-xs sm:text-base">
                In both cases, we will hold the deposit for a period of 7 days from the agreed check out date and time, or longer if there is report of loss or damage to the accommodation in accordance with clause 12.
              </p>
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="mb-2 sm:mb-4 text-xs sm:text-base">
                If You have no further accommodation requirements and wish for the Security Deposit to be returned, You should inform Us 48 hours after your last check out, and providing that there are no damages reported, unpaid Accommodation Fees or deductions from your stay it shall be returned to you within 7 business days.
              </p>
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="text-xs sm:text-base">
                For the avoidance of doubt, You shall be liable to the Property Partner for any and all loss or damage of whatever nature (whether accidental, malicious or otherwise) caused by You or Your guests.
              </p>
            </div>
          </div>

          {/* Section 12: Loss and Damage to Accommodation */}
          <div className="mb-6 sm:mb-12">
            <div className="flex items-center mb-2 sm:mb-6">
              <div style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="w-10 h-10 sm:w-12 sm:h-12 bg-[#00BAB5] rounded-full flex items-center justify-center text-white font-bold text-xl sm:text-xl mr-4">
                12
              </div>
              <h2 style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="text-xl sm:text-2xl font-bold text-[#4B4E53]">Loss and Damage to Accommodation</h2>
            </div>
            <div className="text-[#4B4E53] leading-tight sm:leading-relaxed">
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="mb-2 sm:mb-4 text-xs sm:text-base">
                Our Property Partners are required to report any loss or damage to the accommodation caused by You and/or Your guests within 48 hours of the agreed check out date.
              </p>
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="mb-2 sm:mb-4 text-xs sm:text-base">
                Where any such loss or damage is notified to Us as being caused by You or Your guests, We will verify such loss or damage with the Property Partner. In order to recompense the Property Partner for all such loss or damage incurred and our costs and expenses in dealing with the same, all verified loss and damage, costs and expenses, will be invoiced to You, unless otherwise covered by any advanced protection (where available) over and above the amount of any security deposit.
              </p>
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="text-xs sm:text-base">
                You shall pay such invoice within 7 days of the date of the invoice. Where You fail to do so, without prejudice to Our other rights and remedies against You, We will deduct the amount of such loss or damage, costs and expenses from any security deposit still held on check out (please note that you will be responsible for the deficit of the value of the loss or damage over and above the sum of the security deposit). Note that advanced protection is only available (where taken out) once per booking.
              </p>
            </div>
          </div>

          {/* Section 13: Reporting Loss or Damage */}
          <div className="mb-6 sm:mb-12">
            <div className="flex items-center mb-2 sm:mb-6">
              <div style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="w-10 h-10 sm:w-12 sm:h-12 bg-[#00BAB5] rounded-full flex items-center justify-center text-white font-bold text-xl sm:text-xl mr-4">
                13
              </div>
              <h2 style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="text-xl sm:text-2xl font-bold text-[#4B4E53]">Reporting Loss or Damage</h2>
            </div>
            <div className="text-[#4B4E53] leading-tight sm:leading-relaxed">
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="mb-2 sm:mb-4 text-xs sm:text-base">
                As concerns reported loss and/or damage as per the terms of clause 12 above, you are obliged to notify us in writing of any loss and/or damage caused within 24 hours of that loss and/or damage occurring setting out sufficient and appropriate details for us to be able to assess the loss and/or damage, and evidence that this was there on arrival to avoid future uncertainty on cause or claims against You.
              </p>
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="text-xs sm:text-base">
                If You and/or Your guests are victims of criminal offences including (but not limited to) theft, damage to your property or your vehicle being broken into, You must report this to the Police and obtain a crime reference number.
              </p>
            </div>
          </div>

          {/* Section 14: Cancellation Policy */}
          <div className="mb-6 sm:mb-12">
            <div className="flex items-center mb-2 sm:mb-6">
              <div style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="w-10 h-10 sm:w-12 sm:h-12 bg-[#00BAB5] rounded-full flex items-center justify-center text-white font-bold text-xl sm:text-xl mr-4">
                14
              </div>
              <h2 style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="text-xl sm:text-2xl font-bold text-[#4B4E53]">Cancellation Policy</h2>
            </div>
            <div className="text-[#4B4E53] leading-tight sm:leading-relaxed">
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="mb-2 sm:mb-4 text-xs sm:text-base">
                The cancellation policy You receive and accept as part of the booking shall be in force immediately on Booking Confirmation and operate between You and the Property Partner. If You or any of Your guests cancel a booking or do not use or occupy the accommodation, any cancellation fee and any refund will depend on the Property Partner's cancellation policy.
              </p>
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="mb-2 sm:mb-4 text-xs sm:text-base">
                Refund Terms: Where a refund is applicable under the Property Partner's cancellation policy, You must have paid upfront in full. The refund amount will be determined by the Property Partner's cancellation terms. Funds are held securely by our payment processor and released to the Property Partner 24 hours after check-in when everything is confirmed as satisfactory.
              </p>
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="mb-2 sm:mb-4 text-xs sm:text-base">
                All cancellations will need to be requested by You to us on email/phone and/or then confirmed on our Website (app.booking-hub.co.uk and any other domain name used by Us for the promotion of Our business, including any mobile application or alternative owned listing formats made available by Us). No other cancellation requests shall be accepted by Us.
              </p>
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="mb-2 sm:mb-4 text-xs sm:text-base">
                Once We receive a cancellation request from You, We will email relevant details of the cancellation to You such as any cancellation fees due. The cancellation will only be effective once You confirm acceptance of this email and eSign through our portal.
              </p>
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="mb-2 sm:mb-4 text-xs sm:text-base">
                You shall be liable for any additional payments in the event of any cancellation or no-show in accordance with the Property Partner's cancellation policy. In the event a refund is due to You, we will endeavour to process such refund within 7 days from the date of cancellation, subject to the receipt of funds from the Property Partner. To avoid doubt, the refund liability is of the Property Partner and We act only as a processor in administering this.
              </p>
            </div>
          </div>

          {/* Section 15: Force Majeure */}
          <div className="mb-6 sm:mb-12">
            <div className="flex items-center mb-2 sm:mb-6">
              <div style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="w-10 h-10 sm:w-12 sm:h-12 bg-[#00BAB5] rounded-full flex items-center justify-center text-white font-bold text-xl sm:text-xl mr-4">
                15
              </div>
              <h2 style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="text-xl sm:text-2xl font-bold text-[#4B4E53]">Force Majeure</h2>
            </div>
            <div className="text-[#4B4E53] leading-tight sm:leading-relaxed">
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="text-xs sm:text-base">
                Where any act or event beyond Your or the Property Partner's reasonable control arises (which may include war or threat of war, riot, civil strife, terrorist activity or actual threatened terrorist activity, pandemic or epidemic, government control or other action, industrial dispute, natural or nuclear disaster, adverse weather conditions, fire and all similar events outside) that affects Your booking or the performance of Your or the Property Partner's obligations (as applicable) the Property Partner Conditions of Stay shall take precedence over anything in this Agreement.
              </p>
            </div>
          </div>

          {/* Section 16: Our Liability */}
          <div className="mb-6 sm:mb-12">
            <div className="flex items-center mb-2 sm:mb-6">
              <div style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="w-10 h-10 sm:w-12 sm:h-12 bg-[#00BAB5] rounded-full flex items-center justify-center text-white font-bold text-xl sm:text-xl mr-4">
                16
              </div>
              <h2 style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="text-xl sm:text-2xl font-bold text-[#4B4E53]">Our Liability</h2>
            </div>
            <div className="text-[#4B4E53] leading-tight sm:leading-relaxed">
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="mb-2 sm:mb-4 text-xs sm:text-base">
                We will not be responsible for any injury, illness, death, loss (for example loss of enjoyment), damage, expense, cost or other sum or claim of any description whatsoever which results from the provision, booking of, travel to and from, or stay in the Property Partner's accommodation made in Your booking.
              </p>
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="mb-2 sm:mb-4 text-xs sm:text-base">
                Please note, We cannot accept responsibility for any services which do not form part of Our Agreement with You. Your Property Partner is responsible for the accommodation under Your booking with the Property Partner and for any additional services or facilities which any Property Partner agrees to provide for You. Whilst We endeavour to ensure that all accommodation, services and facilities booked by You shall be as described, We shall not be liable to You where they are not.
              </p>
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="mb-2 sm:mb-4 text-xs sm:text-base">
                Nothing in the Agreement limits Our or the Property Partner's liability for death or personal injury caused by negligence or fraud or fraudulent misrepresentation or breach of the terms implied by section 2 of the Supply of Goods and Services Act 1982 or any other liability which cannot be limited or excluded by law. To the extent permitted by applicable law:
              </p>
              <ul style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="list-disc pl-6 mb-2 sm:mb-4 text-xs sm:text-base">
                <li>We will only be liable to You for any damages, costs, losses, expenses or other sums incurred as a direct result of Our failure to perform Our services under this Agreement;</li>
                <li>We will not be liable to You for indirect loss or damage, loss of profits, loss of chance, loss of sales or business or business opportunity, savings, loss of damage to goodwill or consequential loss;</li>
                <li>We will not be liable for any damages, costs, losses or expenses or other sum(s) of any description (i) which on the basis of the information given to Us by You concerning Your booking prior to Our accepting it, We could not have foreseen You would suffer or incur if We breached our Agreement with You or (ii) which did not result from any breach of Agreement or other fault by Us or, where We are responsible for them, Our suppliers and subcontractors;</li>
                <li>We will not be liable for any business losses or loss of profits, whether direct or indirect;</li>
                <li>Our liability and the liability of any Property Partner, whether for one event or a series of connected events, shall be limited to the cost of Your applicable booking as set out in Your Booking Confirmation.</li>
              </ul>
            </div>
          </div>

          {/* Section 17: Force Majeure (Party Obligations) */}
          <div className="mb-6 sm:mb-12">
            <div className="flex items-center mb-2 sm:mb-6">
              <div style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="w-10 h-10 sm:w-12 sm:h-12 bg-[#00BAB5] rounded-full flex items-center justify-center text-white font-bold text-xl sm:text-xl mr-4">
                17
              </div>
              <h2 style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="text-xl sm:text-2xl font-bold text-[#4B4E53]">Force Majeure (Party Obligations)</h2>
            </div>
            <div className="text-[#4B4E53] leading-tight sm:leading-relaxed">
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="text-xs sm:text-base">
                Neither party shall be in breach of this Agreement nor be liable for any delay in performing or failure to perform any of its obligations under this Agreement if such delay or failure result from events, circumstances or causes beyond its reasonable control. If the force majeure affects the performance of the Agreement then the party that is subject to force majeure shall promptly notify the other party and submit to the other party a sufficient and valid proof of force majeure within a reasonable period after the end of force majeure. Otherwise the corresponding liability shall not be waived.
              </p>
            </div>
          </div>

          {/* Section 18: Assignment */}
          <div className="mb-6 sm:mb-12">
            <div className="flex items-center mb-2 sm:mb-6">
              <div style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="w-10 h-10 sm:w-12 sm:h-12 bg-[#00BAB5] rounded-full flex items-center justify-center text-white font-bold text-xl sm:text-xl mr-4">
                18
              </div>
              <h2 style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="text-xl sm:text-2xl font-bold text-[#4B4E53]">Assignment</h2>
            </div>
            <div className="text-[#4B4E53] leading-tight sm:leading-relaxed">
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="text-xs sm:text-base">
                We may at any time assign or deal in any manner with any or all of our rights under this Agreement. You shall not assign, transfer, charge, subcontract or delegate or deal in any other manner with any of your rights owed to us under this Agreement.
              </p>
            </div>
          </div>

          {/* Section 19: Third Party Content */}
          <div className="mb-6 sm:mb-12">
            <div className="flex items-center mb-2 sm:mb-6">
              <div style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="w-10 h-10 sm:w-12 sm:h-12 bg-[#00BAB5] rounded-full flex items-center justify-center text-white font-bold text-xl sm:text-xl mr-4">
                19
              </div>
              <h2 style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="text-xl sm:text-2xl font-bold text-[#4B4E53]">Third Party Content</h2>
            </div>
            <div className="text-[#4B4E53] leading-tight sm:leading-relaxed">
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="mb-2 sm:mb-4 text-xs sm:text-base">
                We take no responsibility for false or misleading advertising by the Property Partner and other third party content on our Website (app.booking-hub.co.uk, and any other domain name used by Us for the promotion of Our business, including any mobile application or alternative owned listing formats made available by Us). In instances relating to bookings, all information held on the accommodation is visible to You in advance of booking and as such sold with visibility.
              </p>
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="text-xs sm:text-base">
                We will use all reasonable endeavours to ensure that We will not host any unlawful information and We will act expeditiously to remove or disable any such information upon becoming aware of the same. We take no responsibility for false or misleading third party data regarding the geographical location and the distances to and from the accommodation. It is Your responsibility to conduct Your own due diligence in relation to the location of the accommodation and the safety and security of its surrounding area, and the available travel routes and travel links.
              </p>
            </div>
          </div>

          {/* Section 20: Communication with Property Partners */}
          <div className="mb-6 sm:mb-12">
            <div className="flex items-center mb-2 sm:mb-6">
              <div style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="w-10 h-10 sm:w-12 sm:h-12 bg-[#00BAB5] rounded-full flex items-center justify-center text-white font-bold text-xl sm:text-xl mr-4">
                20
              </div>
              <h2 style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="text-xl sm:text-2xl font-bold text-[#4B4E53]">Communication with Property Partners</h2>
            </div>
            <div className="text-[#4B4E53] leading-tight sm:leading-relaxed">
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="text-xs sm:text-base">
                You agree to ensure that at all times all correspondence that concerns the accommodation and your stay is communicated directly to Us at all times (and never to the Property Partner under any circumstances), including reporting any complaints or issues with the accommodation.
              </p>
            </div>
          </div>

          {/* Section 21: Complaints and Issues */}
          <div className="mb-6 sm:mb-12">
            <div className="flex items-center mb-2 sm:mb-6">
              <div style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="w-10 h-10 sm:w-12 sm:h-12 bg-[#00BAB5] rounded-full flex items-center justify-center text-white font-bold text-xl sm:text-xl mr-4">
                21
              </div>
              <h2 style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="text-xl sm:text-2xl font-bold text-[#4B4E53]">Complaints and Issues</h2>
            </div>
            <div className="text-[#4B4E53] leading-tight sm:leading-relaxed">
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="mb-2 sm:mb-4 text-xs sm:text-base">
                If You have a query or complaint regarding a Property Partner or accommodation, please contact Our customer service team at info@booking-hub.co.uk. We will endeavour to respond and mediate the situation, however, We will not be liable or responsible for doing so.
              </p>
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="mb-2 sm:mb-4 text-xs sm:text-base">
                If You vacate the property early due to any issues with the accommodation and without informing Us or allowing us to assess the situation or resolve it, We may not be able to assist you in attaining a full or partial refund from the Property Partner.
              </p>
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="mb-2 sm:mb-4 text-xs sm:text-base">
                Any complaints about the accommodation, including any notifications of loss or damage, must be reported to Us within 24 hours of Your check-in to the accommodation or, if later, within 24 hours of any loss, damage or issue occurring. If Your check in is delayed, You must inform us of Your revised check in date.
              </p>
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="text-xs sm:text-base">
                If You have a query or complaint regarding any terms of this Agreement, please contact our customer service team at info@booking-hub.co.uk. We will endeavour to respond to your query or complaint within a reasonable period.
              </p>
            </div>
          </div>

          {/* Section 22: Call Recording */}
          <div className="mb-6 sm:mb-12">
            <div className="flex items-center mb-2 sm:mb-6">
              <div style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="w-10 h-10 sm:w-12 sm:h-12 bg-[#00BAB5] rounded-full flex items-center justify-center text-white font-bold text-xl sm:text-xl mr-4">
                22
              </div>
              <h2 style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="text-xl sm:text-2xl font-bold text-[#4B4E53]">Call Recording</h2>
            </div>
            <div className="text-[#4B4E53] leading-tight sm:leading-relaxed">
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="text-xs sm:text-base">
                We operate call monitoring and recording as part of Our continuing effort to ensure You receive the highest service standards. We may monitor and record Your call for training purposes.
              </p>
            </div>
          </div>

          {/* Section 23: Right to Refuse Service */}
          <div className="mb-6 sm:mb-12">
            <div className="flex items-center mb-2 sm:mb-6">
              <div style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="w-10 h-10 sm:w-12 sm:h-12 bg-[#00BAB5] rounded-full flex items-center justify-center text-white font-bold text-xl sm:text-xl mr-4">
                23
              </div>
              <h2 style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="text-xl sm:text-2xl font-bold text-[#4B4E53]">Right to Refuse Service</h2>
            </div>
            <div className="text-[#4B4E53] leading-tight sm:leading-relaxed">
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="text-xs sm:text-base">
                We may, where We have good reason, stop you from placing orders with Us at any time.
              </p>
            </div>
          </div>

          {/* Section 24: High-Risk Jurisdictions */}
          <div className="mb-6 sm:mb-12">
            <div className="flex items-center mb-2 sm:mb-6">
              <div style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="w-10 h-10 sm:w-12 sm:h-12 bg-[#00BAB5] rounded-full flex items-center justify-center text-white font-bold text-xl sm:text-xl mr-4">
                24
              </div>
              <h2 style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="text-xl sm:text-2xl font-bold text-[#4B4E53]">High-Risk Jurisdictions</h2>
            </div>
            <div className="text-[#4B4E53] leading-tight sm:leading-relaxed">
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="text-xs sm:text-base">
                If you are placing a booking from any countries listed in the FATF lists on jurisdictions under increased monitoring and high-risk jurisdictions, you may be subject to a call for action, this must be declared prior to confirmation of a booking.
              </p>
            </div>
          </div>

          {/* Section 25: Data Protection */}
          <div className="mb-6 sm:mb-12">
            <div className="flex items-center mb-2 sm:mb-6">
              <div style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="w-10 h-10 sm:w-12 sm:h-12 bg-[#00BAB5] rounded-full flex items-center justify-center text-white font-bold text-xl sm:text-xl mr-4">
                25
              </div>
              <h2 style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="text-xl sm:text-2xl font-bold text-[#4B4E53]">Data Protection</h2>
            </div>
            <div className="text-[#4B4E53] leading-tight sm:leading-relaxed">
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="text-xs sm:text-base">
                As the person making the booking, You are responsible for obtaining the permission of Your guests before providing Us with their personal data. We are required to gather certain personal data about Clients and guests for the purposes of satisfying operational and legal obligations. We will only collect and process Client and Guest personal data as set out in our Privacy Policy, and in compliance with our obligations under the Data Protection Act 2018 and the UK GDPR.
              </p>
            </div>
          </div>

          {/* Section 26: Additional Services */}
          <div className="mb-6 sm:mb-12">
            <div className="flex items-center mb-2 sm:mb-6">
              <div style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="w-10 h-10 sm:w-12 sm:h-12 bg-[#00BAB5] rounded-full flex items-center justify-center text-white font-bold text-xl sm:text-xl mr-4">
                26
              </div>
              <h2 style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="text-xl sm:text-2xl font-bold text-[#4B4E53]">Additional Services</h2>
            </div>
            <div className="text-[#4B4E53] leading-tight sm:leading-relaxed">
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="text-xs sm:text-base">
                From time to time We may offer additional services to You in Our own name, not as a disclosed agent for the Property Partner. Where We do so, We will agree with You any additional terms on which such additional services shall be supplied, including any applicable payment terms.
              </p>
            </div>
          </div>

          {/* Section 27: Non-Circumvention */}
          <div className="mb-6 sm:mb-12">
            <div className="flex items-center mb-2 sm:mb-6">
              <div style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="w-10 h-10 sm:w-12 sm:h-12 bg-[#00BAB5] rounded-full flex items-center justify-center text-white font-bold text-xl sm:text-xl mr-4">
                27
              </div>
              <h2 style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="text-xl sm:text-2xl font-bold text-[#4B4E53]">Non-Circumvention</h2>
            </div>
            <div className="text-[#4B4E53] leading-tight sm:leading-relaxed">
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="mb-2 sm:mb-4 text-xs sm:text-base">
                You shall not circumvent Us, in any way in which We may be directly or indirectly negatively commercially affected. You agree not to contact, initiate contact, or attempt to do business, at any time for any purpose, either directly or indirectly, with any Property Partner, employees, agents or other related parties of any Property Partner introduced by Us for the purpose of circumventing, the result of which shall be to prevent Us from realising a profit, fees, or otherwise, without Our specific written approval.
              </p>
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="mb-2 sm:mb-4 text-xs sm:text-base">
                Where such approval is given, in Our sole discretion, it shall be given in writing on a case-by-case basis. This shall apply 12 full months after the last check-out date within our platform or deregistration, whichever is later.
              </p>
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="text-xs sm:text-base">
                If such circumvention shall occur, You will pay to Us a fee that is equal to the commission or fee We would have realised in such a transaction, plus any costs, losses or expenses We incur on enforcement. To avoid uncertainty or doubt, this applies not only to bookings, but is inclusive of, but not limited to any prospective business opportunity, contact or information directly introduced or disclosed to You by Us.
              </p>
            </div>
          </div>

          {/* Section 28: Abuse of Staff */}
          <div className="mb-6 sm:mb-12">
            <div className="flex items-center mb-2 sm:mb-6">
              <div style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="w-10 h-10 sm:w-12 sm:h-12 bg-[#00BAB5] rounded-full flex items-center justify-center text-white font-bold text-xl sm:text-xl mr-4">
                28
              </div>
              <h2 style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="text-xl sm:text-2xl font-bold text-[#4B4E53]">Abuse of Staff</h2>
            </div>
            <div className="text-[#4B4E53] leading-tight sm:leading-relaxed">
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="text-xs sm:text-base">
                If you abuse or harass our staff, we reserve the right to terminate this Agreement. If we choose to do so, you may lose any security deposit we hold. We also reserve the right to disallow You from using our booking platform in the future.
              </p>
            </div>
          </div>

          {/* Section 29: Governing Law and Jurisdiction */}
          <div className="mb-6 sm:mb-12">
            <div className="flex items-center mb-2 sm:mb-6">
              <div style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="w-10 h-10 sm:w-12 sm:h-12 bg-[#00BAB5] rounded-full flex items-center justify-center text-white font-bold text-xl sm:text-xl mr-4">
                29
              </div>
              <h2 style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }} className="text-xl sm:text-2xl font-bold text-[#4B4E53]">Governing Law and Jurisdiction</h2>
            </div>
            <div className="text-[#4B4E53] leading-tight sm:leading-relaxed">
              <p style={{ fontFamily: 'var(--font-avenir)', fontWeight: 400 }} className="text-xs sm:text-base">
                This Agreement shall be governed by and construed in accordance with the laws of England and Wales and the parties agree to submit to the exclusive jurisdiction of the courts of England and Wales.
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
