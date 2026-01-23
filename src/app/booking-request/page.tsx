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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordValue, setPasswordValue] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsError, setTermsError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    companyName: '',
    email: '',
    phone: ''
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});


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
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
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
    setTermsError(null); // Reset terms error
    setShowThankYou(false); // Reset thank you message
    setFieldErrors({}); // Reset field errors
    
    const formDataObj = new FormData(e.currentTarget);
    const formObject = Object.fromEntries(formDataObj.entries());
    
    // Validate all required fields
    const errors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Please fill this field';
    }
    if (!formData.companyName.trim()) {
      errors.companyName = 'Please fill this field';
    }
    if (!formData.email.trim()) {
      errors.email = 'Please fill this field';
    }
    if (!formData.phone.trim()) {
      errors.phone = 'Please fill this field';
    }
    if (!passwordValue.trim()) {
      errors.password = 'Please fill this field';
    }
    if (!formObject.confirmPassword || !(formObject.confirmPassword as string).trim()) {
      errors.confirmPassword = 'Please fill this field';
    }
    if (!formObject.city || !(formObject.city as string).trim()) {
      errors.city = 'Please fill this field';
    }
    if (!formObject.projectPostcode || !(formObject.projectPostcode as string).trim()) {
      errors.projectPostcode = 'Please fill this field';
    }
    if (!formObject.teamSize || !(formObject.teamSize as string).trim()) {
      errors.teamSize = 'Please fill this field';
    }
    
    // Validate booking dates
    const hasValidBooking = bookings.some(booking => booking.startDate && booking.endDate);
    if (!hasValidBooking) {
      bookings.forEach((booking, index) => {
        if (!booking.startDate) {
          errors[`startDate-${booking.id}`] = 'Please fill this field';
        }
        if (!booking.endDate) {
          errors[`endDate-${booking.id}`] = 'Please fill this field';
        }
      });
    }
    
    // Validate terms acceptance
    if (!termsAccepted) {
      setTermsError('You must agree to the client terms and conditions');
    }
    
    // If there are any errors, set them and return
    if (Object.keys(errors).length > 0 || !termsAccepted) {
      setFieldErrors(errors);
      setIsSubmitting(false);
      return;
    }
    
    setIsSubmitting(true); // Start loading
    
    // Normalize email to lowercase for case-insensitive comparison
    const enteredEmail = formData.email || '';
    const normalizedEmail = enteredEmail.toLowerCase().trim();
    
    if (!normalizedEmail) {
      setEmailError("Please enter a valid email address.");
      setIsSubmitting(false);
      return;
    }
    
    // FIRST: Validate email doesn't exist in contractor or landlord tables (case-insensitive)
    let emailExists = false;
    
    try {
      // Check if email exists in contractor table (case-insensitive)
      const { data: contractors, error: contractorCheckError } = await supabase
        .from('contractor')
        .select('id, email');

      if (contractorCheckError) {
        console.error('Error checking contractor table:', contractorCheckError);
        // If we can't check, block submission to be safe
        setEmailError("This email is already in use, Try a different email.");
        setIsSubmitting(false);
        return;
      }

      if (contractors && Array.isArray(contractors)) {
        const existingContractor = contractors.find(
          (c) => {
            if (!c || !c.email) return false;
            const dbEmail = String(c.email).toLowerCase().trim();
            return dbEmail === normalizedEmail;
          }
        );
        if (existingContractor) {
          emailExists = true;
        }
      }

      // Check if email exists in landlord table (case-insensitive)
      const { data: landlords, error: landlordCheckError } = await supabase
        .from('landlord')
        .select('id, email');

      if (landlordCheckError) {
        console.error('Error checking landlord table:', landlordCheckError);
        // If we can't check, block submission to be safe
        setEmailError("This email is already in use, Try a different email.");
        setIsSubmitting(false);
        return;
      }

      if (landlords && Array.isArray(landlords)) {
        const existingLandlord = landlords.find(
          (l) => {
            if (!l || !l.email) return false;
            const dbEmail = String(l.email).toLowerCase().trim();
            return dbEmail === normalizedEmail;
          }
        );
        if (existingLandlord) {
          emailExists = true;
        }
      }

      // If email exists in either table, block submission
      if (emailExists) {
        setEmailError("This email is already in use, Try a different email.");
        setIsSubmitting(false);
        return;
      }
    } catch (emailCheckError) {
      console.error('Email validation check failed:', emailCheckError);
      setEmailError("This email is already in use, Try a different email.");
      setIsSubmitting(false);
      return;
    }
    
    // Validate password strength
    const password = passwordValue;
    const passwordErrors: string[] = [];
    if (password.length < 8) passwordErrors.push('at least 8 characters');
    if (!/[A-Z]/.test(password)) passwordErrors.push('an uppercase letter');
    if (!/[a-z]/.test(password)) passwordErrors.push('a lowercase letter');
    if (!/[0-9]/.test(password)) passwordErrors.push('a number');
    if (!/[^A-Za-z0-9]/.test(password)) passwordErrors.push('a special character');
    
    if (passwordErrors.length > 0) {
      alert(`Password must contain ${passwordErrors.join(', ')}.`);
      setIsSubmitting(false);
      return;
    }
    
    // Validate password confirmation
    if (passwordValue !== formObject.confirmPassword) {
      alert('Passwords do not match. Please try again.');
      setIsSubmitting(false);
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
          fullName: formData.name,
          companyName: formData.companyName,
          email: normalizedEmail,
          phone: formData.phone,
          projectPostcode: formObject.projectPostcode,
          password: passwordValue,
          bookings: bookingDates,
          teamSize: formObject.teamSize ? parseInt(formObject.teamSize as string) : null,
          budgetPerPerson: selectedBudgetOption,
          city: formObject.city,
          termsAccepted: termsAccepted
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
        setPasswordValue('');
        setTermsAccepted(false);
        setTermsError(null);
        setIsSubmitting(false);
      } else {
        let errorData;
        try {
          errorData = await response.json();
        } catch (parseError) {
          console.error('Error parsing response:', parseError);
          setEmailError("This email is already in use, Try a different email.");
          setIsSubmitting(false);
          return;
        }
        
        const errorMessage = errorData.error || 'Failed to submit booking request';
        
        // Check if error is related to duplicate email (from backend validation or database constraint)
        if (errorMessage.includes('This email is already in use') || 
            errorMessage.includes('duplicate') || 
            errorMessage.includes('email') || 
            errorMessage.includes('unique constraint') ||
            errorMessage.includes('already exists')) {
          setEmailError("This email is already in use, Try a different email.");
        } else {
          setEmailError(errorMessage);
        }
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Error submitting booking request:', error);
      setEmailError("This email is already in use, Try a different email.");
      setIsSubmitting(false);
    }
  };

  const handleProceed = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setShowModal(false);
  };

  const handleSignIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push('/auth/login?type=client');
  };

  return (
    <>
      <div className="min-h-screen relative overflow-hidden">
        {/* Animated Background Image with Ken Burns effect */}
        <div 
          className="absolute inset-0 animate-ken-burns"
          style={{
            backgroundImage: 'url(/Swansea%20-%201.webp)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        />
        
        {/* Background Image Opacity Overlay with fade animation */}
        <div className="absolute inset-0 bg-[rgba(11,29,52,0.88)] pointer-events-none animate-overlay-fade"></div>

        {/* Back Button */}
        <Link 
          href="/" 
          onClick={(e) => { e.preventDefault(); window.location.href = '/'; }}
          className="absolute top-4 left-4 z-20 flex items-center justify-center text-white sm:px-4 sm:py-2 sm:gap-2 font-semibold hover:text-booking-teal transition-all duration-200"
          aria-label="Back to home"
          style={{ fontFamily: 'var(--font-avenir-regular)' }}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-7 w-7" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="hidden sm:inline text-xl sm:text-2xl">Go Back</span>
        </Link>

        {/* Main Content */}
        <div className="relative z-10 flex flex-col items-center justify-start min-h-screen px-2 sm:px-4 pb-12 sm:pb-16 -mt-12 sm:-mt-16">
          {/* Logo on Background with entrance animation */}
          <div className="flex justify-center -mb-12 sm:-mb-16 lg:-mb-20">
            <div className="animate-logo-entrance">
              <Image
                src="/white-teal.webp"
                alt="Logo"
                width={300}
                height={300}
                className="w-48 h-48 sm:w-64 sm:h-64 lg:w-80 lg:h-80 object-contain drop-shadow-2xl"
                priority
              />
            </div>
          </div>

          {/* Form Container with entrance animation */}
          <div className={`signup-card bg-white/95 backdrop-blur-sm rounded-xl sm:rounded shadow-xl sm:shadow-lg p-6 sm:p-6 lg:p-8 w-full max-w-xs sm:max-w-lg lg:max-w-2xl border border-gray-200/50 sm:border-gray-200 animate-card-entrance-1 transition-all duration-300 ${showModal ? 'blur-sm' : ''}`}>
            {/* Form Title */}
            <h1 className="text-base sm:text-2xl lg:text-3xl font-bold text-booking-dark mb-1 sm:mb-2 text-center leading-tight" style={{ fontFamily: 'var(--font-avenir-bold)' }}>
              Request Accommodation
            </h1>
            <p className="text-xs sm:text-xl text-booking-gray mb-2 sm:mb-6 text-center leading-tight" style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500, letterSpacing: '0.02em' }}>
              Submit your requirements and we'll handle the rest
            </p>

            <form className="space-y-2 sm:space-y-6" onSubmit={handleFormSubmit} noValidate>
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
                    className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-base border rounded focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent ${fieldErrors.city ? 'border-red-500' : 'border-booking-teal'}`}
                    style={{ fontFamily: 'var(--font-avenir-regular)' }}
                    onChange={(e) => {
                      if (fieldErrors.city) {
                        setFieldErrors(prev => {
                          const newErrors = { ...prev };
                          delete newErrors.city;
                          return newErrors;
                        });
                      }
                    }}
                  />
                  {fieldErrors.city && (
                    <p className="mt-1 text-xs sm:text-sm text-red-600" style={{ fontFamily: 'var(--font-avenir-regular)' }}>{fieldErrors.city}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="projectPostcode" className="block text-xs sm:text-lg font-medium text-booking-dark mb-0.5 sm:mb-2 leading-tight" style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500, letterSpacing: '0.02em' }}>
                    Accommodation Postcode
                  </label>
                  <input
                    type="text"
                    id="projectPostcode"
                    name="projectPostcode"
                    className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-base border rounded focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent ${fieldErrors.projectPostcode ? 'border-red-500' : 'border-booking-teal'}`}
                    style={{ fontFamily: 'var(--font-avenir-regular)' }}
                    placeholder="Enter postcode"
                    onChange={(e) => {
                      if (fieldErrors.projectPostcode) {
                        setFieldErrors(prev => {
                          const newErrors = { ...prev };
                          delete newErrors.projectPostcode;
                          return newErrors;
                        });
                      }
                    }}
                  />
                  {fieldErrors.projectPostcode && (
                    <p className="mt-1 text-xs sm:text-sm text-red-600" style={{ fontFamily: 'var(--font-avenir-regular)' }}>{fieldErrors.projectPostcode}</p>
                  )}
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
                          onChange={(e) => {
                            updateBooking(booking.id, 'startDate', e.target.value);
                            if (fieldErrors[`startDate-${booking.id}`]) {
                              setFieldErrors(prev => {
                                const newErrors = { ...prev };
                                delete newErrors[`startDate-${booking.id}`];
                                return newErrors;
                              });
                            }
                          }}
                          className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-base border rounded focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent ${fieldErrors[`startDate-${booking.id}`] ? 'border-red-500' : 'border-booking-teal'}`}
                          style={{ fontFamily: 'var(--font-avenir-regular)' }}
                        />
                        {fieldErrors[`startDate-${booking.id}`] && (
                          <p className="mt-1 text-xs sm:text-sm text-red-600" style={{ fontFamily: 'var(--font-avenir-regular)' }}>{fieldErrors[`startDate-${booking.id}`]}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs sm:text-lg font-medium text-booking-dark mb-0.5 sm:mb-2 leading-tight" style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500, letterSpacing: '0.02em' }}>
                          End Date
                        </label>
                        <input
                          type="date"
                          value={booking.endDate}
                          onChange={(e) => {
                            updateBooking(booking.id, 'endDate', e.target.value);
                            if (fieldErrors[`endDate-${booking.id}`]) {
                              setFieldErrors(prev => {
                                const newErrors = { ...prev };
                                delete newErrors[`endDate-${booking.id}`];
                                return newErrors;
                              });
                            }
                          }}
                          className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-base border rounded focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent ${fieldErrors[`endDate-${booking.id}`] ? 'border-red-500' : 'border-booking-teal'}`}
                          style={{ fontFamily: 'var(--font-avenir-regular)' }}
                        />
                        {fieldErrors[`endDate-${booking.id}`] && (
                          <p className="mt-1 text-xs sm:text-sm text-red-600" style={{ fontFamily: 'var(--font-avenir-regular)' }}>{fieldErrors[`endDate-${booking.id}`]}</p>
                        )}
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
                    className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-base border rounded focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent ${fieldErrors.teamSize ? 'border-red-500' : 'border-booking-teal'}`}
                    placeholder="Number of people"
                    style={{ fontFamily: 'var(--font-avenir-regular)' }}
                    onChange={(e) => {
                      if (fieldErrors.teamSize) {
                        setFieldErrors(prev => {
                          const newErrors = { ...prev };
                          delete newErrors.teamSize;
                          return newErrors;
                        });
                      }
                    }}
                  />
                  {fieldErrors.teamSize && (
                    <p className="mt-1 text-xs sm:text-sm text-red-600" style={{ fontFamily: 'var(--font-avenir-regular)' }}>{fieldErrors.teamSize}</p>
                  )}
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
                    className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-base border rounded focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent ${fieldErrors.name ? 'border-red-500' : 'border-booking-teal'}`}
                    placeholder="Full name"
                    style={{ fontFamily: 'var(--font-avenir-regular)' }}
                  />
                  {fieldErrors.name && (
                    <p className="mt-1 text-xs sm:text-sm text-red-600" style={{ fontFamily: 'var(--font-avenir-regular)' }}>{fieldErrors.name}</p>
                  )}
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
                    className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-base border rounded focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent ${fieldErrors.companyName ? 'border-red-500' : 'border-booking-teal'}`}
                    placeholder="Company name"
                    style={{ fontFamily: 'var(--font-avenir-regular)' }}
                  />
                  {fieldErrors.companyName && (
                    <p className="mt-1 text-xs sm:text-sm text-red-600" style={{ fontFamily: 'var(--font-avenir-regular)' }}>{fieldErrors.companyName}</p>
                  )}
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
                    className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-base border rounded focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent ${fieldErrors.email ? 'border-red-500' : 'border-booking-teal'}`}
                    placeholder="email@company.com"
                    style={{ fontFamily: 'var(--font-avenir-regular)' }}
                  />
                  {fieldErrors.email && (
                    <p className="mt-1 text-xs sm:text-sm text-red-600" style={{ fontFamily: 'var(--font-avenir-regular)' }}>{fieldErrors.email}</p>
                  )}
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
                    className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-base border rounded focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent ${fieldErrors.phone ? 'border-red-500' : 'border-booking-teal'}`}
                    placeholder="Phone number"
                    style={{ fontFamily: 'var(--font-avenir-regular)' }}
                  />
                  {fieldErrors.phone && (
                    <p className="mt-1 text-xs sm:text-sm text-red-600" style={{ fontFamily: 'var(--font-avenir-regular)' }}>{fieldErrors.phone}</p>
                  )}
                </div>
              </div>

              {/* Line 6: Password + Confirm Password */}
              <div className="grid grid-cols-2 gap-2 sm:gap-4">
                <div>
                  <label htmlFor="password" className="block text-xs sm:text-lg font-medium text-booking-dark mb-1 sm:mb-2" style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500, letterSpacing: '0.02em' }}>
                    Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      value={passwordValue}
                      onChange={(e) => {
                        setPasswordValue(e.target.value);
                        if (fieldErrors.password) {
                          setFieldErrors(prev => {
                            const newErrors = { ...prev };
                            delete newErrors.password;
                            return newErrors;
                          });
                        }
                      }}
                      className={`w-full px-3 pr-10 sm:px-4 py-2 sm:py-3 text-xs sm:text-base border rounded focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent ${fieldErrors.password ? 'border-red-500' : 'border-booking-teal'}`}
                      placeholder="Create a password"
                      style={{ fontFamily: 'var(--font-avenir-regular)' }}
                    />
                    {fieldErrors.password && (
                      <p className="mt-1 text-xs sm:text-sm text-red-600" style={{ fontFamily: 'var(--font-avenir-regular)' }}>{fieldErrors.password}</p>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="block text-xs sm:text-lg font-medium text-booking-dark mb-1 sm:mb-2" style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500, letterSpacing: '0.02em' }}>
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      name="confirmPassword"
                      onChange={(e) => {
                        if (fieldErrors.confirmPassword) {
                          setFieldErrors(prev => {
                            const newErrors = { ...prev };
                            delete newErrors.confirmPassword;
                            return newErrors;
                          });
                        }
                      }}
                      className={`w-full px-3 pr-10 sm:px-4 py-2 sm:py-3 text-xs sm:text-base border rounded focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent ${fieldErrors.confirmPassword ? 'border-red-500' : 'border-booking-teal'}`}
                      placeholder="Confirm password"
                      style={{ fontFamily: 'var(--font-avenir-regular)' }}
                    />
                    {fieldErrors.confirmPassword && (
                      <p className="mt-1 text-xs sm:text-sm text-red-600" style={{ fontFamily: 'var(--font-avenir-regular)' }}>{fieldErrors.confirmPassword}</p>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Password Criteria Checklist */}
              <div className="mt-2 p-2.5 sm:p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-[10px] sm:text-xs text-gray-600 mb-1.5 sm:mb-2 font-medium" style={{ fontFamily: 'var(--font-avenir-regular)' }}>Password must contain:</p>
                <div className="grid grid-cols-2 gap-x-2 gap-y-1 sm:gap-y-1.5">
                  {/* 8+ characters */}
                  <div className="flex items-center gap-1.5">
                    <span className={`flex-shrink-0 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full flex items-center justify-center transition-colors duration-200 ${passwordValue.length >= 8 ? 'bg-green-500' : 'bg-gray-300'}`}>
                      {passwordValue.length >= 8 ? (
                        <svg className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-white rounded-full"></span>
                      )}
                    </span>
                    <span className={`text-[10px] sm:text-xs transition-colors duration-200 ${passwordValue.length >= 8 ? 'text-green-700 font-medium' : 'text-gray-500'}`} style={{ fontFamily: 'var(--font-avenir-regular)' }}>
                      8+ characters
                    </span>
                  </div>
                  
                  {/* Uppercase letter */}
                  <div className="flex items-center gap-1.5">
                    <span className={`flex-shrink-0 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full flex items-center justify-center transition-colors duration-200 ${/[A-Z]/.test(passwordValue) ? 'bg-green-500' : 'bg-gray-300'}`}>
                      {/[A-Z]/.test(passwordValue) ? (
                        <svg className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-white rounded-full"></span>
                      )}
                    </span>
                    <span className={`text-[10px] sm:text-xs transition-colors duration-200 ${/[A-Z]/.test(passwordValue) ? 'text-green-700 font-medium' : 'text-gray-500'}`} style={{ fontFamily: 'var(--font-avenir-regular)' }}>
                      Uppercase letter
                    </span>
                  </div>
                  
                  {/* Lowercase letter */}
                  <div className="flex items-center gap-1.5">
                    <span className={`flex-shrink-0 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full flex items-center justify-center transition-colors duration-200 ${/[a-z]/.test(passwordValue) ? 'bg-green-500' : 'bg-gray-300'}`}>
                      {/[a-z]/.test(passwordValue) ? (
                        <svg className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-white rounded-full"></span>
                      )}
                    </span>
                    <span className={`text-[10px] sm:text-xs transition-colors duration-200 ${/[a-z]/.test(passwordValue) ? 'text-green-700 font-medium' : 'text-gray-500'}`} style={{ fontFamily: 'var(--font-avenir-regular)' }}>
                      Lowercase letter
                    </span>
                  </div>
                  
                  {/* Number */}
                  <div className="flex items-center gap-1.5">
                    <span className={`flex-shrink-0 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full flex items-center justify-center transition-colors duration-200 ${/[0-9]/.test(passwordValue) ? 'bg-green-500' : 'bg-gray-300'}`}>
                      {/[0-9]/.test(passwordValue) ? (
                        <svg className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-white rounded-full"></span>
                      )}
                    </span>
                    <span className={`text-[10px] sm:text-xs transition-colors duration-200 ${/[0-9]/.test(passwordValue) ? 'text-green-700 font-medium' : 'text-gray-500'}`} style={{ fontFamily: 'var(--font-avenir-regular)' }}>
                      Number
                    </span>
                  </div>
                  
                  {/* Special character */}
                  <div className="flex items-center gap-1.5 col-span-2">
                    <span className={`flex-shrink-0 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full flex items-center justify-center transition-colors duration-200 ${/[^A-Za-z0-9]/.test(passwordValue) ? 'bg-green-500' : 'bg-gray-300'}`}>
                      {/[^A-Za-z0-9]/.test(passwordValue) ? (
                        <svg className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-white rounded-full"></span>
                      )}
                    </span>
                    <span className={`text-[10px] sm:text-xs transition-colors duration-200 ${/[^A-Za-z0-9]/.test(passwordValue) ? 'text-green-700 font-medium' : 'text-gray-500'}`} style={{ fontFamily: 'var(--font-avenir-regular)' }}>
                      Special character (!@#$%^&*)
                    </span>
                  </div>
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

              {/* Terms and Conditions Checkbox */}
              <div className="flex items-center gap-2.5 sm:gap-3 pt-1 sm:pt-2">
              <input
                type="checkbox"
                id="termsAccepted"
                name="termsAccepted"
                checked={termsAccepted}
                onChange={(e) => {
                  setTermsAccepted(e.target.checked);
                  if (e.target.checked && termsError) {
                    setTermsError(null);
                  }
                }}
                className={`w-4 h-4 sm:w-5 sm:h-5 rounded border-2 cursor-pointer transition-colors duration-200 focus:ring-2 focus:ring-booking-teal focus:ring-offset-2 focus:outline-none ${
                  termsError
                    ? 'border-red-500 text-red-600 focus:ring-red-500'
                    : 'border-gray-300 text-booking-teal focus:border-booking-teal'
                }`}
              />
                <label
                  htmlFor="termsAccepted"
                  className={`flex-1 text-xs sm:text-sm leading-relaxed cursor-pointer select-none ${
                    termsError 
                      ? 'text-red-700' 
                      : 'text-gray-700'
                  }`}
                  style={{ fontFamily: 'var(--font-avenir-regular)' }}
                >
                  I agree to{' '}
                  <Link
                    href="/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`font-medium underline hover:no-underline transition-colors duration-200 ${
                      termsError
                        ? 'text-red-600 hover:text-red-700'
                        : 'text-booking-teal hover:text-booking-dark'
                    }`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    client terms and conditions
                  </Link>
                </label>
              </div>
              {termsError && (
                <p className="mt-1 text-xs sm:text-sm text-red-600 flex items-start gap-1.5" style={{ fontFamily: 'var(--font-avenir-regular)' }}>
                  <svg
                    className="w-4 h-4 flex-shrink-0 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>{termsError}</span>
                </p>
              )}

              {/* Email validation error message - above submit button */}
              {emailError && (
                <div className="pt-2 sm:pt-4">
                  <div className="rounded-xl bg-red-50 border border-red-200 p-3 sm:p-4">
                    <div className="text-xs sm:text-sm text-red-800 text-center" style={{ fontFamily: 'var(--font-avenir-regular)' }}>{emailError}</div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-2 sm:pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-booking-teal text-white py-[0.6rem] sm:py-4 px-6 rounded-lg font-semibold text-xs sm:text-base hover:bg-booking-dark transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-booking-teal focus:ring-offset-2 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                  style={{ fontFamily: 'var(--font-avenir-regular)' }}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    'Submit Booking Request'
                  )}
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
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 animate-overlay-fade"
            onClick={handleProceed}
          >
            <div 
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md sm:max-w-3xl p-6 sm:p-8 relative animate-card-entrance-1"
              style={{ animationDelay: '0.1s' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={handleProceed}
                type="button"
                className="absolute top-4 right-4 p-1 sm:p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
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
                    className="text-base sm:text-lg text-[#0B1D37] text-center leading-relaxed mb-3"
                    style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500 }}
                  >
                    Already a user? Sign in to your account to <br />request a booking
                  </p>
                  <button
                    onClick={handleSignIn}
                    type="button"
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
                    type="button"
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
