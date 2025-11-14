'use client';

import { useState } from 'react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Call backend API instead of directly using Supabase
      const backendUrl =  'https://jfgm6v6pkw.us-east-1.awsapprunner.com';
      
      const payload = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        message: formData.message
      };
      
      // Log payload for debugging
      console.log('Submitting contact form with data:', payload);
      
      const response = await fetch(`https://jfgm6v6pkw.us-east-1.awsapprunner.com/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        // Log detailed validation errors for debugging
        console.error('API Error Response:', result);
        if (result.details) {
          console.error('Validation errors:', result.details);
          // Show detailed validation errors
          result.details.forEach((err: any) => {
            console.error(`Field "${err.path?.join('.')}" error: ${err.message}`);
          });
        }
        throw new Error(result.error || 'Failed to submit contact form');
      }

      // Reset form and show success message
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        message: ''
      });
      setSubmitStatus('success');
      
      // Hide success message after 5 seconds
      setTimeout(() => {
        setSubmitStatus('idle');
      }, 5000);

    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus('error');
      
      // Hide error message after 5 seconds
      setTimeout(() => {
        setSubmitStatus('idle');
      }, 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0B1D37' }}>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#F6F6F4] px-4 sm:px-6 lg:px-12 py-4 sm:py-6 lg:py-8">
        <div className="w-full lg:max-w-none mx-auto flex items-center justify-center">
          <div className="w-full max-w-7xl flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <a href="/" onClick={(e) => { e.preventDefault(); window.location.href = '/'; }} className="py-1">
              <img src="/blue-teal.webp" alt="Booking Hub Logo" className="h-10 sm:h-12 md:h-14 lg:h-16 w-auto object-contain" style={{ maxWidth: '100%' }} />
            </a>
          </div>

          {/* Desktop Navigation - Hidden on mobile, visible on tablet and up */}
          <nav className="hidden md:flex items-center space-x-4 lg:space-x-6 ml-auto mr-4 lg:mr-6">
            <a href="/contact" onClick={(e) => { e.preventDefault(); window.location.href = '/contact'; }} style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500 }} className="text-[#0B1D37] hover:text-[#00BAB5] transition-colors text-base lg:text-lg">Contact Us</a>
            <a 
              href="/booking-request" 
              onClick={(e) => { e.preventDefault(); window.location.href = '/booking-request'; }}
              style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500 }}
              className="bg-[#00BAB5] text-white hover:bg-[#009a96] transition-colors px-4 py-2 rounded-md text-base lg:text-lg border-2 border-[#0B1D37]"
            >
              Request a Booking
            </a>
            <a 
              href="/auth/signup/partner" 
              onClick={(e) => { e.preventDefault(); window.location.href = '/auth/signup/partner'; }}
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
                  <a href="/auth/signup/client" onClick={(e) => { e.preventDefault(); window.location.href = '/auth/signup/client'; }} style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500 }} className="block px-3 py-2 text-sm text-[#00BAB5] hover:bg-gray-100 text-center">Client login</a>
                  <a href="/auth/signup/partner" onClick={(e) => { e.preventDefault(); window.location.href = '/auth/signup/partner'; }} style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500 }} className="block px-3 py-2 text-sm text-[#00BAB5] hover:bg-gray-100 text-center">Partner login</a>
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
                  <a href="/" onClick={(e) => { e.preventDefault(); window.location.href = '/'; }} className="py-1">
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
                      onClick={(e) => { e.preventDefault(); setIsMobileMenuOpen(false); window.location.href = '/contact'; }}
                      style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500 }}
                      className="block text-[#0B1D37] hover:text-[#00BAB5] transition-colors text-base py-2"
                    >
                      Contact Us
                    </a>
                    <a 
                      href="/booking-request" 
                      onClick={(e) => { e.preventDefault(); setIsMobileMenuOpen(false); window.location.href = '/booking-request'; }}
                      style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500 }}
                      className="block bg-[#00BAB5] text-white hover:bg-[#009a96] transition-colors px-4 py-2 rounded-md text-base text-center border-2 border-[#0B1D37]"
                    >
                      Request a Booking
                    </a>
                    <a 
                      href="/auth/signup/partner" 
                      onClick={(e) => { e.preventDefault(); setIsMobileMenuOpen(false); window.location.href = '/auth/signup/partner'; }}
                      style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500 }}
                      className="block bg-[#E9ECEF] text-[#0B1D37] hover:bg-[#dee2e6] transition-colors px-4 py-2 rounded-md text-base text-center border-2 border-[#0B1D37]"
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
                            onClick={(e) => {
                              e.preventDefault();
                              setIsDropdownOpen(false);
                              setIsMobileMenuOpen(false);
                              window.location.href = '/auth/signup/client';
                            }}
                            style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500 }}
                            className="block px-3 py-2 text-sm text-[#00BAB5] hover:bg-gray-100 text-center"
                          >
                            Client login
                          </a>
                          <a 
                            href="/auth/signup/partner" 
                            onClick={(e) => {
                              e.preventDefault();
                              setIsDropdownOpen(false);
                              setIsMobileMenuOpen(false);
                              window.location.href = '/auth/signup/partner';
                            }}
                            style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500 }}
                            className="block px-3 py-2 text-sm text-[#00BAB5] hover:bg-gray-100 text-center"
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

      {/* Main Content */}
      <div className="py-12 sm:py-16 md:py-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Title Section */}
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6" style={{ fontFamily: 'var(--font-avenir)', fontWeight: 700 }}>
              Contact Us
            </h1>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 md:gap-16">
            {/* Left Column - Contact Information */}
            <div className="space-y-8 sm:space-y-12">
              {/* Email */}
              <div className="flex items-center space-x-4 sm:space-x-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-full flex items-center justify-center border border-black">
                    <svg className="w-6 h-6 sm:w-8 sm:h-8 text-black flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                    </svg>
                  </div>
                </div>
                <div>
                  <p className="text-white text-lg sm:text-xl" style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500 }}>info@booking-hub.co.uk</p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-center space-x-4 sm:space-x-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-full flex items-center justify-center border border-black">
                    <svg className="w-6 h-6 sm:w-8 sm:h-8 text-black flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                    </svg>
                  </div>
                </div>
                <div>
                  <p className="text-white text-lg sm:text-xl" style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500 }}>0330 043 7522</p>
                </div>
              </div>

              {/* Address */}
              <div className="flex items-center space-x-4 sm:space-x-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-full flex items-center justify-center border border-black">
                    <svg className="w-6 h-6 sm:w-8 sm:h-8 text-black flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                    </svg>
                  </div>
                </div>
                <div>
                  <p className="text-white text-lg sm:text-xl" style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500 }}>
                    SA12 Business Centre, Seaway Parade,<br />
                    Baglan Energy Park, Port Talbot<br />
                    SA12 7BR
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column - Contact Form */}
            <div className="bg-white rounded-lg p-6 sm:p-8 md:p-10 shadow-xl" style={{ backgroundColor: 'rgba(246, 246, 244, 0.06)' }}>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-8" style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500 }}>Send Message</h2>
              
              {/* Success/Error Messages */}
              {submitStatus === 'success' && (
                <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                  <p className="text-sm">Thank you! Your message has been sent successfully.</p>
                </div>
              )}
              
              {submitStatus === 'error' && (
                <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                  <p className="text-sm">Sorry, there was an error sending your message. Please try again.</p>
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Full Name */}
                <div>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Full Name"
                    className="w-full px-4 py-3 border-b-2 border-gray-300 focus:border-[#00BAB5] focus:outline-none text-white placeholder-gray-300 bg-transparent"
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Email"
                    className="w-full px-4 py-3 border-b-2 border-gray-300 focus:border-[#00BAB5] focus:outline-none text-white placeholder-gray-300 bg-transparent"
                    required
                  />
                </div>

                {/* Phone */}
                <div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Phone"
                    className="w-full px-4 py-3 border-b-2 border-gray-300 focus:border-[#00BAB5] focus:outline-none text-white placeholder-gray-300 bg-transparent"
                    required
                  />
                </div>

                {/* Address */}
                <div>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Address"
                    className="w-full px-4 py-3 border-b-2 border-gray-300 focus:border-[#00BAB5] focus:outline-none text-white placeholder-gray-300 bg-transparent"
                    required
                  />
                </div>

                {/* Message */}
                <div>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Type your Message... (Should be atleast 10 characters)"
                    rows={4}
                    className="w-full px-4 py-3 border-b-2 border-gray-300 focus:border-[#00BAB5] focus:outline-none text-white placeholder-gray-300 bg-transparent resize-none"
                    required
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-3 sm:py-4 px-6 sm:px-8 rounded-lg text-lg font-semibold transition-colors ${
                      isSubmitting 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-[#00BAB5] hover:bg-[#00A5A0]'
                    } text-white`}
                  >
                    {isSubmitting ? 'Sending...' : 'Send'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
