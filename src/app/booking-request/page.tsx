'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';

interface Booking {
  id: string;
  startDate: string;
  endDate: string;
}

export default function BookingRequestPage() {
  const [budgetDropdownOpen, setBudgetDropdownOpen] = useState(false);
  const [selectedBudgetOption, setSelectedBudgetOption] = useState<string>('');
  const [bookings, setBookings] = useState<Booking[]>([
    { id: '1', startDate: '', endDate: '' }
  ]);
  const [showThankYou, setShowThankYou] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
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
      const response = await fetch('/api/booking-requests', {
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
        const createdBookingDates = result.bookingDates || [];
        
        // Send data to GHL endpoint for each booking date
        try {
          for (let i = 0; i < bookingDates.length; i++) {
            const booking = bookingDates[i];
            const createdBookingDate = createdBookingDates[i];
            const ghlPayload = {
              fullName: formObject.name,
              companyName: formObject.companyName,
              email: formObject.email,
              phone: formObject.phone,
              projectPostcode: formObject.projectPostcode,
              city: formObject.city,
              [`booking_${i + 1}`]: `${booking.startDate} to ${booking.endDate}`,
              teamSize: formObject.teamSize ? parseInt(formObject.teamSize as string) : null,
              budgetPerPerson: selectedBudgetOption,
              role: 'contractor',
              bookingId: createdBookingDate?.id || `booking_${i + 1}`,
              bookingStartDate: booking.startDate,
              bookingEndDate: booking.endDate
            };

            await fetch('https://services.leadconnectorhq.com/hooks/JxGt5Zz3odpUbS4vgmeC/webhook-trigger/5caf28bd-9145-4b99-b08c-be10afbbec5c', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(ghlPayload),
            });
          }
        } catch (ghlError) {
          console.error('Error sending to GHL:', ghlError);
          // Don't show error to user as this is secondary functionality
        }

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
          className="absolute top-4 left-4 z-20 flex items-center gap-3 text-[#F6F6F4] transition-colors duration-200 group hover:text-[#00BAB5]"
          aria-label="Back to home"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-8 w-8 sm:h-10 sm:w-10" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="text-xl sm:text-2xl font-bold text-[#F6F6F4]">Back</span>
        </Link>

        {/* Main Content */}
        <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
          <div className="bg-white/95 backdrop-blur-sm rounded-xl sm:rounded shadow-xl sm:shadow-lg p-6 sm:p-6 lg:p-8 w-full max-w-xs sm:max-w-lg lg:max-w-2xl border border-gray-200/50 sm:border-gray-200 mt-4 mb-4 sm:mt-0 sm:mb-0">
            {/* Form Title */}
            <h1 className="text-base sm:text-2xl lg:text-3xl font-bold text-booking-dark mb-2 sm:mb-8 text-center leading-tight">
              Request Your Corporate Stay
            </h1>
            <p className="text-[8px] sm:text-sm text-booking-gray mb-2 sm:mb-6 text-center leading-tight">
              Submit your requirements and we'll handle the rest
            </p>

            <form className="space-y-2 sm:space-y-6" onSubmit={handleFormSubmit}>
              {/* Email validation error message */}
              {emailError && (
                <div className="rounded-xl bg-red-50 border border-red-200 p-3 sm:p-4">
                  <div className="text-xs sm:text-sm text-red-800">{emailError}</div>
                </div>
              )}

              {/* Line 1: Where do you need accommodation? + Postcode */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                <div>
                  <label htmlFor="city" className="block text-[8px] sm:text-sm font-medium text-booking-dark mb-0.5 sm:mb-2 leading-tight">
                    Where do you need accommodation?
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    placeholder="e.g. London"
                    className="w-full px-3 sm:px-4 py-1 sm:py-3 text-[8px] sm:text-base border border-booking-teal rounded focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="projectPostcode" className="block text-[8px] sm:text-sm font-medium text-booking-dark mb-0.5 sm:mb-2 leading-tight">
                    Accommodation Postcode
                  </label>
                  <input
                    type="text"
                    id="projectPostcode"
                    name="projectPostcode"
                    className="w-full px-3 sm:px-4 py-1 sm:py-3 text-[8px] sm:text-base border border-booking-teal rounded focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent"
                    placeholder="Enter postcode"
                  />
                </div>
              </div>

              {/* Line 2: Booking dates */}
              <div>
                <div className="mb-0.5 sm:mb-2">
                  <label className="block text-[8px] sm:text-sm font-medium text-booking-dark mb-0.5 sm:mb-2 leading-tight">
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
                          className="text-red-500 hover:text-red-700 text-[8px] sm:text-sm"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:gap-4">
                      <div>
                        <label className="block text-[8px] sm:text-sm font-medium text-booking-dark mb-0.5 sm:mb-2 leading-tight">
                          Start Date
                        </label>
                        <input
                          type="date"
                          value={booking.startDate}
                          onChange={(e) => updateBooking(booking.id, 'startDate', e.target.value)}
                          className="w-full px-3 sm:px-4 py-1 sm:py-3 text-[8px] sm:text-base border border-booking-teal rounded focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[8px] sm:text-sm font-medium text-booking-dark mb-0.5 sm:mb-2 leading-tight">
                          End Date
                        </label>
                        <input
                          type="date"
                          value={booking.endDate}
                          onChange={(e) => updateBooking(booking.id, 'endDate', e.target.value)}
                          className="w-full px-3 sm:px-4 py-1 sm:py-3 text-[8px] sm:text-base border border-booking-teal rounded focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent"
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <div className="mt-1 sm:mt-2 grid grid-cols-2 sm:grid-cols-1 gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      console.log('Button clicked!');
                      addBooking();
                    }}
                    className="bg-booking-teal text-white px-4 py-[0.6rem] sm:py-2 rounded-md hover:bg-booking-dark transition-colors duration-200 text-[8px] sm:text-sm font-medium flex items-center justify-center"
                  >
                    + Add Booking
                  </button>
                </div>
              </div>

              {/* Line 3: How many people + Nightly Budget */}
              <div className="grid grid-cols-2 gap-2 sm:gap-4">
                <div>
                  <label htmlFor="teamSize" className="block text-[8px] sm:text-sm font-medium text-booking-dark mb-0.5 sm:mb-2 leading-tight">
                    How many people?
                  </label>
                  <input
                    type="number"
                    id="teamSize"
                    name="teamSize"
                    min="1"
                    className="w-full px-3 sm:px-4 py-1 sm:py-3 text-[8px] sm:text-base border border-booking-teal rounded focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent"
                    placeholder="Number of people"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[8px] sm:text-sm font-medium text-booking-dark mb-0.5 sm:mb-2 leading-tight">
                    Nightly budget
                  </label>
                  <div className="relative">
                    {/* Dropdown trigger */}
                    <button
                      type="button"
                      onClick={() => setBudgetDropdownOpen(!budgetDropdownOpen)}
                      className="w-full px-3 sm:px-4 py-[0.75rem] sm:py-3 border border-booking-teal rounded bg-white text-left focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent text-[8px] sm:text-base flex items-center min-h-0"
                    >
                      <span className={selectedBudgetOption ? "text-booking-dark" : "text-gray-500"}>
                        {selectedBudgetOption || "Select budget option..."}
                      </span>
                    </button>
                    
                    {/* Dropdown arrow */}
                    <div className="absolute right-3 top-[50%] sm:top-3 -translate-y-1/2 sm:translate-y-0 pointer-events-none">
                      <svg className="w-3 h-3 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>

                    {/* Dropdown content */}
                    {budgetDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 z-50 mt-1 shadow-lg" style={{backgroundColor: '#F6F6F4', borderRadius: '12px'}}>
                        <div className="p-2 sm:p-3">
                          <div 
                            onClick={() => selectBudgetOption('£ 200')}
                            className={`flex items-center justify-between py-1 sm:py-2 px-2 rounded cursor-pointer hover:bg-gray-50 transition-colors ${
                              selectedBudgetOption === '£ 200' ? 'bg-booking-teal/10' : ''
                            }`}
                          >
                            <div className="flex items-center">
                              <span className="text-booking-gray mr-2">=</span>
                              <span className={`text-[8px] sm:text-sm ${
                                selectedBudgetOption === '£ 200' 
                                  ? 'text-booking-dark font-medium' 
                                  : 'text-booking-gray'
                              }`}>
                                £ 200
                              </span>
                            </div>
                            {selectedBudgetOption === '£ 200' && (
                              <span className="text-booking-teal text-[8px] sm:text-sm">✓</span>
                            )}
                          </div>
                          <div 
                            onClick={() => selectBudgetOption('£ 200 - £ 300')}
                            className={`flex items-center justify-between py-1 sm:py-2 px-2 rounded cursor-pointer hover:bg-gray-50 transition-colors ${
                              selectedBudgetOption === '£ 200 - £ 300' ? 'bg-booking-teal/10' : ''
                            }`}
                          >
                            <div className="flex items-center">
                              <span className="text-booking-gray mr-2">=</span>
                              <span className={`text-[8px] sm:text-sm ${
                                selectedBudgetOption === '£ 200 - £ 300' 
                                  ? 'text-booking-dark font-medium' 
                                  : 'text-booking-gray'
                              }`}>
                                £ 200 - £ 300
                              </span>
                            </div>
                            {selectedBudgetOption === '£ 200 - £ 300' && (
                              <span className="text-booking-teal text-[8px] sm:text-sm">✓</span>
                            )}
                          </div>
                          <div 
                            onClick={() => selectBudgetOption('£ 300 - £ 400')}
                            className={`flex items-center justify-between py-1 sm:py-2 px-2 rounded cursor-pointer hover:bg-gray-50 transition-colors ${
                              selectedBudgetOption === '£ 300 - £ 400' ? 'bg-booking-teal/10' : ''
                            }`}
                          >
                            <div className="flex items-center">
                              <span className="text-booking-gray mr-2">=</span>
                              <span className={`text-[8px] sm:text-sm ${
                                selectedBudgetOption === '£ 300 - £ 400' 
                                  ? 'text-booking-dark font-medium' 
                                  : 'text-booking-gray'
                              }`}>
                                £ 300 - £ 400
                              </span>
                            </div>
                            {selectedBudgetOption === '£ 300 - £ 400' && (
                              <span className="text-booking-teal text-[8px] sm:text-sm">✓</span>
                            )}
                          </div>
                          <div 
                            onClick={() => selectBudgetOption('£ 400+')}
                            className={`flex items-center justify-between py-1 sm:py-2 px-2 rounded cursor-pointer hover:bg-gray-50 transition-colors ${
                              selectedBudgetOption === '£ 400+' ? 'bg-booking-teal/10' : ''
                            }`}
                          >
                            <div className="flex items-center">
                              <span className="text-booking-gray mr-2">=</span>
                              <span className={`text-[8px] sm:text-sm ${
                                selectedBudgetOption === '£ 400+' 
                                  ? 'text-booking-dark font-medium' 
                                  : 'text-booking-gray'
                              }`}>
                                £ 400+
                              </span>
                            </div>
                            {selectedBudgetOption === '£ 400+' && (
                              <span className="text-booking-teal text-[8px] sm:text-sm">✓</span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Line 4: Name + Company Name */}
              <div className="grid grid-cols-2 gap-2 sm:gap-4">
                <div>
                  <label htmlFor="name" className="block text-[8px] sm:text-sm font-medium text-booking-dark mb-0.5 sm:mb-2 leading-tight">
                    Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 sm:px-4 py-1 sm:py-3 text-[8px] sm:text-base border border-booking-teal rounded focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent"
                    placeholder="Your full name"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="companyName" className="block text-[8px] sm:text-sm font-medium text-booking-dark mb-0.5 sm:mb-2 leading-tight">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    id="companyName"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    className="w-full px-3 sm:px-4 py-1 sm:py-3 text-[8px] sm:text-base border border-booking-teal rounded focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent"
                    placeholder="Your company name"
                    required
                  />
                </div>
              </div>

              {/* Line 5: Company Email + Phone */}
              <div className="grid grid-cols-2 gap-2 sm:gap-4">
                <div>
                  <label htmlFor="email" className="block text-[8px] sm:text-sm font-medium text-booking-dark mb-1 sm:mb-2">
                    Company Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 sm:px-4 py-1 sm:py-3 text-[8px] sm:text-base border border-booking-teal rounded focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent"
                    placeholder="your.email@company.com"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-[8px] sm:text-sm font-medium text-booking-dark mb-1 sm:mb-2">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 sm:px-4 py-1 sm:py-3 text-[8px] sm:text-base border border-booking-teal rounded focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent"
                    placeholder="Your phone number"
                    required
                  />
                </div>
              </div>

              {/* Line 6: Password + Confirm Password */}
              <div className="grid grid-cols-2 gap-2 sm:gap-4">
                <div>
                  <label htmlFor="password" className="block text-[8px] sm:text-sm font-medium text-booking-dark mb-1 sm:mb-2">
                    Password *
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    className="w-full px-3 sm:px-4 py-1 sm:py-3 text-[8px] sm:text-base border border-booking-teal rounded focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent"
                    placeholder="Create a password"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="block text-[8px] sm:text-sm font-medium text-booking-dark mb-1 sm:mb-2">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    className="w-full px-3 sm:px-4 py-1 sm:py-3 text-[8px] sm:text-base border border-booking-teal rounded focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent"
                    placeholder="Confirm your password"
                    required
                  />
                </div>
              </div>

              {/* Thank You Message */}
              {showThankYou && (
                <div className="pt-2 sm:pt-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <p className="text-green-800 text-[8px] sm:text-base font-medium">
                      Thanks — your request has been received.
                    </p>
                  </div>
                </div>
              )}

              {/* Terms and Conditions */}
              <div className="pt-1 sm:pt-2">
                <p className="text-[8px] sm:text-sm text-booking-gray text-center leading-tight">
                  By submitting, you agree to our{' '}
                  <a 
                    href="/terms" 
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
                  className="w-full bg-booking-teal text-white py-[0.6rem] sm:py-4 px-6 rounded-lg font-semibold text-[8px] sm:text-base hover:bg-booking-dark transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-booking-teal focus:ring-offset-2 flex items-center justify-center"
                >
                  Submit Booking Request
                </button>
              </div>

              {/* Sign In Link */}
              <div className="pt-2 sm:pt-4">
                <p className="text-[8px] sm:text-sm text-booking-gray text-center leading-tight">
                  Already have an account?{' '}
                  <a 
                    href="/auth/login" 
                    className="text-booking-teal hover:text-booking-dark underline font-medium"
                  >
                    Sign in here
                  </a>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
