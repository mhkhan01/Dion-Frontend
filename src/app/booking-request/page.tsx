'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface Booking {
  id: string;
  startDate: string;
  endDate: string;
}

export default function BookingRequestPage() {
  const router = useRouter();
  const [budgetDropdownOpen, setBudgetDropdownOpen] = useState(false);
  const [selectedBudgetOption, setSelectedBudgetOption] = useState<string>('');
  const [bookings, setBookings] = useState<Booking[]>([
    { id: '1', startDate: '', endDate: '' }
  ]);
  const [showThankYou, setShowThankYou] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    companyName: '',
    email: '',
    phone: ''
  });


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear email error when user changes email
    if (name === 'email' && emailError) {
      setEmailError(null);
    }
  };

  const addBooking = () => {
    console.log('Adding new booking...');
    const newBooking: Booking = {
      id: `new-${Date.now()}`,
      startDate: '',
      endDate: ''
    };
    setBookings(prev => {
      console.log('Current bookings:', prev);
      const updated = [...prev, newBooking];
      console.log('Updated bookings:', updated);
      return updated;
    });
  };

  const removeBooking = (id: string) => {
    if (bookings.length > 1) {
      setBookings(prev => prev.filter(booking => booking.id !== id));
    }
  };

  const updateBooking = (id: string, field: 'startDate' | 'endDate', value: string) => {
    setBookings(prev => prev.map(booking => 
      booking.id === id ? { ...booking, [field]: value } : booking
    ));
  };

  const selectBudgetOption = (label: string) => {
    setSelectedBudgetOption(label);
    setBudgetDropdownOpen(false);
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setEmailError(null); // Reset error
    const formData = new FormData(e.currentTarget);
    const formObject = Object.fromEntries(formData.entries());
    
    // FIRST: Validate email doesn't exist in contractor, landlord or admin tables
    try {
      // Check if email exists in contractor table (same role)
      const { data: existingContractor, error: contractorCheckError } = await supabase
        .from('contractor')
        .select('id, email')
        .eq('email', formObject.email)
        .maybeSingle();

      if (existingContractor && !contractorCheckError) {
        setEmailError("Email already in use");
        setShowThankYou(false);
        return;
      }

      // Check if email exists in landlord table
      const { data: existingLandlord, error: landlordCheckError } = await supabase
        .from('landlord')
        .select('id, email')
        .eq('email', formObject.email)
        .maybeSingle();

      if (existingLandlord && !landlordCheckError) {
        setEmailError("Can't create account, the email is already in use, try using a separate email.");
        setShowThankYou(false);
        return;
      }

      // Check if email exists in admin table
      const { data: existingAdmin, error: adminCheckError } = await supabase
        .from('admin')
        .select('id, email')
        .eq('email', formObject.email)
        .maybeSingle();

      if (existingAdmin && !adminCheckError) {
        setEmailError("Can't create account, the email is already in use, try using a separate email.");
        setShowThankYou(false);
        return;
      }
    } catch (emailCheckError) {
      console.log('Email validation check failed:', emailCheckError);
      // Continue with form submission even if check fails
    }
    
    // Validate password confirmation
    if (formObject.password !== formObject.confirmPassword) {
      alert('Passwords do not match. Please try again.');
      return;
    }
    
    // Prepare booking dates from the bookings state
    const bookingDates = bookings
      .filter(booking => booking.startDate && booking.endDate)
      .map(booking => ({
        startDate: booking.startDate,
        endDate: booking.endDate
      }));

    try {
      // Call backend API endpoint
      const backendUrl = 'https://jfgm6v6pkw.us-east-1.awsapprunner.com';
      const response = await fetch(`https://jfgm6v6pkw.us-east-1.awsapprunner.com/api/booking-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: formObject.name,
          companyName: formObject.companyName,
          email: formObject.email,
          phone: formObject.phone,
          projectPostcode: formObject.projectPostcode,
          password: formObject.password,
          bookings: bookingDates,
          teamSize: formObject.teamSize ? parseInt(formObject.teamSize as string) : null,
          budgetPerPerson: selectedBudgetOption,
          city: formObject.city
        }),
      });

      if (response.ok) {
        const result = await response.json();
        
        // Show success message
        setShowThankYou(true);
        
        // Reset form
        (e.target as HTMLFormElement).reset();
        setBookings([{ id: '1', startDate: '', endDate: '' }]);
        setSelectedBudgetOption('');
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error || 'Failed to submit booking request'}`);
      }
    } catch (error) {
      console.error('Error submitting booking request:', error);
      alert('Failed to submit booking request. Please try again.');
    }
  };

  const handleProceed = () => {
    setShowModal(false);
  };

  const handleSignIn = () => {
    router.push('/auth/login?type=client');
  };

  return (
    <>
      <div className="min-h-screen relative overflow-hidden" style={{
        backgroundImage: 'url(/Swansea%20-%201.webp)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}>
        {/* Background Image Opacity Overlay */}
        <div className="absolute inset-0 bg-[rgba(11,29,52,0.88)] pointer-events-none"></div>

        {/* Back Button */}
        <Link 
          href="/" 
          onClick={(e) => { e.preventDefault(); window.location.href = '/'; }}
          className="absolute top-4 left-4 z-20 flex items-center justify-center bg-booking-teal text-white rounded-full sm:rounded-lg w-12 h-12 sm:w-auto sm:h-auto sm:px-4 sm:py-2 sm:gap-2 font-semibold hover:bg-opacity-90 transition-all duration-200 shadow-lg"
          aria-label="Back to home"
          style={{ fontFamily: 'var(--font-avenir-regular)' }}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="hidden sm:inline text-sm sm:text-base">Back to Home</span>
        </Link>

        {/* Main Content */}
        <div className="relative z-10 flex flex-col items-center justify-start min-h-screen px-2 sm:px-4 pb-12 sm:pb-16 -mt-12 sm:-mt-16">
          {/* Logo on Background */}
          <div className="flex justify-center -mb-12 sm:-mb-16 lg:-mb-20">
            <Image
              src="/white-teal.webp"
              alt="Logo"
              width={300}
              height={300}
              className="w-48 h-48 sm:w-64 sm:h-64 lg:w-80 lg:h-80 object-contain drop-shadow-2xl"
              priority
            />
          </div>

          <div className={`bg-white/95 backdrop-blur-sm rounded-xl sm:rounded shadow-xl sm:shadow-lg p-6 sm:p-6 lg:p-8 w-full max-w-xs sm:max-w-lg lg:max-w-2xl border border-gray-200/50 sm:border-gray-200 transition-all duration-300 ${showModal ? 'blur-sm' : ''}`}>
            {/* Form Title */}
            <h1 className="text-base sm:text-2xl lg:text-3xl font-bold text-booking-dark mb-1 sm:mb-2 text-center leading-tight" style={{ fontFamily: 'var(--font-avenir-bold)' }}>
              Request Accommodation
            </h1>
            <p className="text-xs sm:text-xl text-booking-gray mb-2 sm:mb-6 text-center leading-tight" style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500, letterSpacing: '0.02em' }}>
              Submit your requirements and we'll handle the rest
            </p>

            <form className="space-y-2 sm:space-y-6" onSubmit={handleFormSubmit}>
              {/* Email validation error message */}
              {emailError && (
                <div className="rounded-xl bg-red-50 border border-red-200 p-3 sm:p-4">
                  <div className="text-xs sm:text-sm text-red-800" style={{ fontFamily: 'var(--font-avenir-regular)' }}>{emailError}</div>
                </div>
              )}

              {/* Line 1: Where do you need accommodation? + Postcode */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                <div>
                  <label htmlFor="city" className="block text-xs sm:text-lg font-medium text-booking-dark mb-0.5 sm:mb-2 leading-tight" style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500, letterSpacing: '0.02em' }}>
                    Where do you need accommodation?
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    placeholder="e.g. London"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-base border border-booking-teal rounded focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent"
                    style={{ fontFamily: 'var(--font-avenir-regular)' }}
                  />
                </div>
                <div>
                  <label htmlFor="projectPostcode" className="block text-xs sm:text-lg font-medium text-booking-dark mb-0.5 sm:mb-2 leading-tight" style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500, letterSpacing: '0.02em' }}>
                    Accommodation Postcode
                  </label>
                  <input
                    type="text"
                    id="projectPostcode"
                    name="projectPostcode"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-base border border-booking-teal rounded focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent"
                    style={{ fontFamily: 'var(--font-avenir-regular)' }}
                    placeholder="Enter postcode"
                  />
                </div>
              </div>

              {/* Line 2: Booking dates */}
              <div>
                <div className="mb-0.5 sm:mb-2">
                  <label className="block text-xs sm:text-lg font-medium text-booking-dark mb-0.5 sm:mb-2 leading-tight" style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500, letterSpacing: '0.02em' }}>
                    Booking Dates
                  </label>
                </div>
                {bookings.map((booking, index) => (
                  <div key={booking.id} className="mb-1 sm:mb-2">
                    <div className="flex justify-end items-center mb-0.5 sm:mb-1">
                      {bookings.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeBooking(booking.id)}
                          className="text-red-500 hover:text-red-700 text-xs sm:text-sm"
                          style={{ fontFamily: 'var(--font-avenir-regular)' }}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:gap-4">
                      <div>
                        <label className="block text-xs sm:text-lg font-medium text-booking-dark mb-0.5 sm:mb-2 leading-tight" style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500, letterSpacing: '0.02em' }}>
                          Start Date
                        </label>
                        <input
                          type="date"
                          value={booking.startDate}
                          onChange={(e) => updateBooking(booking.id, 'startDate', e.target.value)}
                          className="w-full px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-base border border-booking-teal rounded focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent"
                          style={{ fontFamily: 'var(--font-avenir-regular)' }}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs sm:text-lg font-medium text-booking-dark mb-0.5 sm:mb-2 leading-tight" style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500, letterSpacing: '0.02em' }}>
                          End Date
                        </label>
                        <input
                          type="date"
                          value={booking.endDate}
                          onChange={(e) => updateBooking(booking.id, 'endDate', e.target.value)}
                          className="w-full px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-base border border-booking-teal rounded focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent"
                          style={{ fontFamily: 'var(--font-avenir-regular)' }}
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      console.log('Button clicked!');
                      addBooking();
                    }}
                    className="w-full sm:w-auto bg-booking-teal text-white px-4 py-2 rounded-md hover:bg-booking-dark transition-colors duration-200 text-xs sm:text-sm font-medium"
                    style={{ fontFamily: 'var(--font-avenir-regular)' }}
                  >
                    + Add Booking
                  </button>
                </div>
              </div>

              {/* Line 3: How many people + Nightly Budget */}
              <div className="grid grid-cols-2 gap-2 sm:gap-4">
                <div>
                  <label htmlFor="teamSize" className="block text-xs sm:text-lg font-medium text-booking-dark mb-0.5 sm:mb-2 leading-tight" style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500, letterSpacing: '0.02em' }}>
                    How many people?
                  </label>
                  <input
                    type="number"
                    id="teamSize"
                    name="teamSize"
                    min="1"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-base border border-booking-teal rounded focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent"
                    placeholder="Number of people"
                    style={{ fontFamily: 'var(--font-avenir-regular)' }}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="budgetPerPerson" className="block text-xs sm:text-lg font-medium text-booking-dark mb-0.5 sm:mb-2 leading-tight" style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500, letterSpacing: '0.02em' }}>
                    Nightly budget
                  </label>
                  <input
                    type="number"
                    id="budgetPerPerson"
                    name="budgetPerPerson"
                    value={selectedBudgetOption}
                    onChange={(e) => setSelectedBudgetOption(e.target.value)}
                    min="0"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-base border border-booking-teal rounded focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent"
                    placeholder="Enter budget"
                    style={{ fontFamily: 'var(--font-avenir-regular)' }}
                  />
                </div>
              </div>

              {/* Line 4: Name + Company Name */}
              <div className="grid grid-cols-2 gap-2 sm:gap-4">
                <div>
                  <label htmlFor="name" className="block text-xs sm:text-lg font-medium text-booking-dark mb-0.5 sm:mb-2 leading-tight" style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500, letterSpacing: '0.02em' }}>
                    Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-base border border-booking-teal rounded focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent"
                    placeholder="Full name"
                    style={{ fontFamily: 'var(--font-avenir-regular)' }}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="companyName" className="block text-xs sm:text-lg font-medium text-booking-dark mb-0.5 sm:mb-2 leading-tight" style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500, letterSpacing: '0.02em' }}>
                    Company Name *
                  </label>
                  <input
                    type="text"
                    id="companyName"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-base border border-booking-teal rounded focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent"
                    placeholder="Company name"
                    style={{ fontFamily: 'var(--font-avenir-regular)' }}
                    required
                  />
                </div>
              </div>

              {/* Line 5: Company Email + Phone */}
              <div className="grid grid-cols-2 gap-2 sm:gap-4">
                <div>
                  <label htmlFor="email" className="block text-xs sm:text-lg font-medium text-booking-dark mb-1 sm:mb-2" style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500, letterSpacing: '0.02em' }}>
                    Company Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-base border border-booking-teal rounded focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent"
                    placeholder="email@company.com"
                    style={{ fontFamily: 'var(--font-avenir-regular)' }}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-xs sm:text-lg font-medium text-booking-dark mb-1 sm:mb-2" style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500, letterSpacing: '0.02em' }}>
                    Phone *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-base border border-booking-teal rounded focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent"
                    placeholder="Phone number"
                    style={{ fontFamily: 'var(--font-avenir-regular)' }}
                    required
                  />
                </div>
              </div>

              {/* Line 6: Password + Confirm Password */}
              <div className="grid grid-cols-2 gap-2 sm:gap-4">
                <div>
                  <label htmlFor="password" className="block text-xs sm:text-lg font-medium text-booking-dark mb-1 sm:mb-2" style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500, letterSpacing: '0.02em' }}>
                    Password *
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-base border border-booking-teal rounded focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent"
                    placeholder="Create a password"
                    style={{ fontFamily: 'var(--font-avenir-regular)' }}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="block text-xs sm:text-lg font-medium text-booking-dark mb-1 sm:mb-2" style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500, letterSpacing: '0.02em' }}>
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-base border border-booking-teal rounded focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent"
                    placeholder="Confirm password"
                    style={{ fontFamily: 'var(--font-avenir-regular)' }}
                    required
                  />
                </div>
              </div>

              {/* Thank You Message */}
              {showThankYou && (
                <div className="pt-2 sm:pt-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <p className="text-green-800 text-xs sm:text-base font-medium" style={{ fontFamily: 'var(--font-avenir-regular)' }}>
                      Thanks — your request has been received. And your client account has been created.
                    </p>
                  </div>
                </div>
              )}

              {/* Terms and Conditions */}
              <div className="pt-1 sm:pt-2">
                <p className="text-xs sm:text-lg text-booking-gray text-center leading-tight" style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500, letterSpacing: '0.02em' }}>
                  By submitting, you agree to our{' '}
                  <a 
                    href="/terms" 
                    onClick={(e) => { e.preventDefault(); window.location.href = '/terms'; }}
                    className="text-booking-teal hover:text-booking-dark underline font-medium"
                  >
                    Client Terms & Conditions
                  </a>
                  .
                </p>
              </div>

              {/* Submit Button */}
              <div className="pt-2 sm:pt-4">
                <button
                  type="submit"
                  className="w-full bg-booking-teal text-white py-[0.6rem] sm:py-4 px-6 rounded-lg font-semibold text-xs sm:text-base hover:bg-booking-dark transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-booking-teal focus:ring-offset-2 flex items-center justify-center"
                  style={{ fontFamily: 'var(--font-avenir-regular)' }}
                >
                  Submit Booking Request
                </button>
              </div>

              {/* Sign In Link */}
              <div className="pt-2 sm:pt-4">
                <p className="text-xs sm:text-lg text-booking-gray text-center leading-tight" style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500, letterSpacing: '0.02em' }}>
                  Already have an account?{' '}
                  <a 
                    href="/auth/login?type=client" 
                    onClick={(e) => { e.preventDefault(); window.location.href = '/auth/login?type=client'; }}
                    className="text-booking-teal hover:text-booking-dark underline font-medium"
                  >
                    Sign in here
                  </a>
                </p>
              </div>
            </form>
          </div>
        </div>

        {/* Modal Overlay */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md sm:max-w-3xl p-6 sm:p-8">
              {/* Header with Logo */}
              <div className="flex items-center justify-center mb-6">
                <Image
                  src="/blue-teal.webp"
                  alt="Booking Hub Logo"
                  width={200}
                  height={50}
                  className="h-8 sm:h-12 w-auto object-contain"
                  style={{ maxWidth: '100%' }}
                />
              </div>

              {/* Modal Content */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {/* Option 1: Already a user */}
                <div className="flex flex-col justify-between">
                  <p 
                    className="text-sm sm:text-base text-[#0B1D37] text-center leading-relaxed mb-3"
                    style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500 }}
                  >
                    Already a user? Sign in to your client account below and submit the booking request from your client portal
                  </p>
                  <button
                    onClick={handleSignIn}
                    className="w-full bg-[#00BAB5] text-white px-6 py-3 rounded-lg font-semibold text-sm sm:text-base hover:bg-[#009a96] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#00BAB5] focus:ring-offset-2"
                    style={{ fontFamily: 'var(--font-avenir-regular)' }}
                  >
                    Sign in
                  </button>
                </div>

                {/* Option 2: New User */}
                <div className="flex flex-col justify-between">
                  <p 
                    className="text-base sm:text-lg text-[#0B1D37] text-center leading-relaxed mb-4"
                    style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500 }}
                  >
                    Requesting a booking as a New User?
                  </p>
                  <button
                    onClick={handleProceed}
                    className="w-full bg-[#E9ECEF] text-[#0B1D37] px-6 py-3 rounded-lg font-semibold text-sm sm:text-base hover:bg-[#dee2e6] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#0B1D37] focus:ring-offset-2 border-2 border-[#0B1D37]"
                    style={{ fontFamily: 'var(--font-avenir-regular)' }}
                  >
                    Proceed
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
