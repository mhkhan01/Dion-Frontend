'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import SingleDatePicker from '@/components/SingleDatePicker';

interface Booking {
  id: string;
  startDate: string;
  endDate: string;
}

interface ContractorFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingBookingRequestId?: string | null;
  onSuccess?: () => void;
}

export default function ContractorFormModal({ 
  isOpen, 
  onClose, 
  editingBookingRequestId = null,
  onSuccess 
}: ContractorFormModalProps) {
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    fullName: '',
    companyName: '',
    email: '',
    phone: '',
    projectPostcode: '',
    teamSize: '',
    city: '',
  });

  const [bookings, setBookings] = useState<Booking[]>([
    { id: '1', startDate: '', endDate: '' }
  ]);

  const [selectedBudgetOption, setSelectedBudgetOption] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [openCalendarFor, setOpenCalendarFor] = useState<{ bookingId: string; field: 'start' | 'end' } | null>(null);
  const submitButtonClickedRef = useRef<boolean>(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Prevent form submission on Enter key press in input fields
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

  const addBooking = () => {
    const newBooking: Booking = {
      id: `new-${Date.now()}`,
      startDate: '',
      endDate: ''
    };
    setBookings(prev => [...prev, newBooking]);
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

  // Helper function to format date string (YYYY-MM-DD) for display
  const formatDateForDisplay = (dateString: string): string => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleDateSelect = (bookingId: string, field: 'startDate' | 'endDate', date: string) => {
    updateBooking(bookingId, field, date);
    setOpenCalendarFor(null);
  };

  const selectBudgetOption = (label: string) => {
    setSelectedBudgetOption(label);
    setIsDropdownOpen(false);
  };

  // Reset submit button flag when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      submitButtonClickedRef.current = false;
    }
  }, [isOpen]);

  // Fetch contractor data when modal opens
  useEffect(() => {
    const fetchContractorData = async () => {
      if (!user?.id || !isOpen) return;
      
      try {
        const { data: contractorData, error } = await supabase
          .from('contractor')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching contractor data:', error);
          return;
        }

        if (contractorData) {
          setFormData(prev => ({
            ...prev,
            fullName: contractorData.full_name || prev.fullName,
            companyName: contractorData.company_name || prev.companyName,
            email: contractorData.company_email || user.email || prev.email,
            phone: contractorData.phone || prev.phone,
          }));
        }
      } catch (error) {
        console.error('Error fetching contractor data:', error);
      }
    };

    fetchContractorData();
  }, [user, isOpen]);

  // Fetch existing booking request data if editing
  useEffect(() => {
    const fetchExistingBookingData = async () => {
      if (!editingBookingRequestId || !isOpen) return;
      
      try {
        const { data: bookingRequestData, error: requestError } = await supabase
          .from('booking_requests')
          .select('*')
          .eq('id', editingBookingRequestId)
          .single();

        if (requestError) {
          console.error('Error fetching booking request for edit:', requestError);
          return;
        }

        if (bookingRequestData) {
          setFormData({
            fullName: bookingRequestData.full_name || '',
            companyName: bookingRequestData.company_name || '',
            email: bookingRequestData.email || '',
            phone: bookingRequestData.phone || '',
            projectPostcode: bookingRequestData.project_postcode || '',
            teamSize: bookingRequestData.team_size?.toString() || '',
            city: bookingRequestData.city || '',
          });
          setSelectedBudgetOption(bookingRequestData.budget_per_person_week || '');

          // Fetch booking dates
          const { data: bookingDatesData, error: datesError } = await supabase
            .from('booking_dates')
            .select('*')
            .eq('booking_request_id', editingBookingRequestId)
            .order('start_date', { ascending: true });

          if (!datesError && bookingDatesData && bookingDatesData.length > 0) {
            setBookings(bookingDatesData.map(date => ({
              id: date.id,
              startDate: date.start_date,
              endDate: date.end_date
            })));
          }
        }
      } catch (error) {
        console.error('Error fetching booking data:', error);
      }
    };

    fetchExistingBookingData();
  }, [editingBookingRequestId, isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Only allow submission if the submit button was explicitly clicked
    if (!submitButtonClickedRef.current) {
      return;
    }
    
    // Reset the flag
    submitButtonClickedRef.current = false;
    
    setIsSubmitting(true);
    
    try {
      let bookingRequest;
      
      if (editingBookingRequestId) {
        // Edit mode - update existing booking request
        const { error: updateError } = await supabase
          .from('booking_requests')
          .update({
            full_name: formData.fullName,
            company_name: formData.companyName,
            email: formData.email,
            phone: formData.phone,
            project_postcode: formData.projectPostcode,
            team_size: formData.teamSize ? parseInt(formData.teamSize) : null,
            budget_per_person_week: selectedBudgetOption,
            city: formData.city
          })
          .eq('id', editingBookingRequestId);

        if (updateError) {
          console.error('Error updating booking request:', updateError);
          alert('Failed to update booking request. Please try again.');
          setIsSubmitting(false);
          return;
        }

        // Delete existing booking dates
        const { error: deleteError } = await supabase
          .from('booking_dates')
          .delete()
          .eq('booking_request_id', editingBookingRequestId);

        if (deleteError) {
          console.error('Error deleting existing booking dates:', deleteError);
          alert('Failed to update booking dates. Please try again.');
          setIsSubmitting(false);
          return;
        }

        bookingRequest = { id: editingBookingRequestId };
      } else {
        // Create new booking request
        const { data: newBookingRequest, error: bookingRequestError } = await supabase
          .from('booking_requests')
          .insert({
            full_name: formData.fullName,
            company_name: formData.companyName,
            email: formData.email,
            phone: formData.phone,
            project_postcode: formData.projectPostcode,
            team_size: formData.teamSize ? parseInt(formData.teamSize) : null,
            budget_per_person_week: selectedBudgetOption,
            status: 'pending',
            user_id: user?.id || null,
            city: formData.city
          })
          .select()
          .single();

        if (bookingRequestError) {
          console.error('Error saving to Supabase:', bookingRequestError);
          alert('Failed to save booking request. Please try again.');
          setIsSubmitting(false);
          return;
        }
        bookingRequest = newBookingRequest;
      }

      // Save booking dates
      if (bookingRequest && bookings.length > 0) {
        const bookingsToSave = bookings.filter(booking => 
          booking.startDate && booking.endDate && 
          booking.startDate.trim() !== '' && booking.endDate.trim() !== ''
        );
        
        if (bookingsToSave.length > 0) {
          const bookingDatesData = bookingsToSave.map(booking => ({
            booking_request_id: bookingRequest.id,
            start_date: booking.startDate.trim(),
            end_date: booking.endDate.trim()
          }));
          
          // Validate dates
          for (const booking of bookingDatesData) {
            if (new Date(booking.start_date) >= new Date(booking.end_date)) {
              alert('Invalid date range: Start date must be before end date.');
              setIsSubmitting(false);
              return;
            }
          }

          const { error: bookingDatesError } = await supabase
            .from('booking_dates')
            .insert(bookingDatesData);

          if (bookingDatesError) {
            console.error('Error saving booking dates:', bookingDatesError);
            alert('Failed to save booking dates. Please try again.');
            setIsSubmitting(false);
            return;
          }
        }
      }

      // Show success message
      setShowThankYou(true);
      
      // Reset form after a delay
      setTimeout(() => {
        setShowThankYou(false);
        setFormData({
          fullName: '',
          companyName: '',
          email: '',
          phone: '',
          projectPostcode: '',
          teamSize: '',
          city: '',
        });
        setBookings([{ id: '1', startDate: '', endDate: '' }]);
        setSelectedBudgetOption('');
        setIsSubmitting(false);
        
        if (onSuccess) {
          onSuccess();
        }
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('An error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  if (showThankYou) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-2xl font-avenir-bold font-bold text-booking-dark mb-2">Success!</h3>
          <p className="text-booking-gray font-avenir tracking-wide">
            Your booking request has been {editingBookingRequestId ? 'updated' : 'submitted'} successfully.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center space-x-3">
            <img 
              src="/blue-teal.webp" 
              alt="Logo" 
              className="h-6 sm:h-10 w-auto object-contain"
            />
            <h2 className="text-xl font-avenir-bold text-booking-dark sm:text-3xl sm:absolute sm:left-1/2 sm:-translate-x-1/2">
              {editingBookingRequestId ? 'Edit Request' : 'Create Request'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            type="button"
          >
            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form Content */}
        <div className="px-6 py-6 pb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Line 1: Where do you need accommodation? + Postcode */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="city" className="block text-sm font-avenir font-medium tracking-wide text-booking-dark mb-2">
                  Where do you need accommodation?
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="e.g. London"
                  className="w-full px-4 py-2 sm:py-3 text-sm sm:text-base font-avenir tracking-wide placeholder:text-xs sm:placeholder:text-sm border border-booking-teal rounded-lg focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="projectPostcode" className="block text-sm font-avenir font-medium tracking-wide text-booking-dark mb-2">
                  Accommodation Postcode
                </label>
                <input
                  type="text"
                  id="projectPostcode"
                  name="projectPostcode"
                  value={formData.projectPostcode}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  className="w-full px-4 py-2 sm:py-3 text-sm sm:text-base font-avenir tracking-wide placeholder:text-xs sm:placeholder:text-sm border border-booking-teal rounded-lg focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent"
                  placeholder="Enter postcode"
                />
              </div>
            </div>

            {/* Line 2: Booking dates */}
            <div>
              <label className="block text-sm font-avenir font-medium tracking-wide text-booking-dark mb-2">
                Booking Dates
              </label>
              {bookings.map((booking, index) => (
                <div key={booking.id} className="mb-3">
                  {bookings.length > 1 && (
                    <div className="flex justify-end items-center mb-2">
                      <button
                        type="button"
                        onClick={() => removeBooking(booking.id)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <label className="block text-sm font-avenir font-medium tracking-wide text-booking-dark mb-2">
                        Start Date
                      </label>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenCalendarFor({ bookingId: booking.id, field: 'start' });
                        }}
                        className={`w-full px-4 py-2 sm:py-3 text-sm sm:text-base font-avenir tracking-wide border rounded-lg focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent text-left flex items-center justify-between ${booking.startDate ? 'text-[#0B1D37]' : 'text-[#4B4E53]'} border-booking-teal`}
                      >
                        <span>
                          {booking.startDate
                            ? formatDateForDisplay(booking.startDate)
                            : 'Select start date'}
                        </span>
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#008080]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </button>
                      {/* Start Date Picker */}
                      {openCalendarFor && openCalendarFor.bookingId === booking.id && openCalendarFor.field === 'start' && (
                        <SingleDatePicker
                          isOpen={true}
                          onClose={() => setOpenCalendarFor(null)}
                          onSelect={(date) => handleDateSelect(booking.id, 'startDate', date)}
                          initialDate={booking.startDate}
                        />
                      )}
                    </div>
                    <div className="relative">
                      <label className="block text-sm font-avenir font-medium tracking-wide text-booking-dark mb-2">
                        End Date
                      </label>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenCalendarFor({ bookingId: booking.id, field: 'end' });
                        }}
                        className={`w-full px-4 py-2 sm:py-3 text-sm sm:text-base font-avenir tracking-wide border rounded-lg focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent text-left flex items-center justify-between ${booking.endDate ? 'text-[#0B1D37]' : 'text-[#4B4E53]'} border-booking-teal`}
                      >
                        <span>
                          {booking.endDate
                            ? formatDateForDisplay(booking.endDate)
                            : 'Select end date'}
                        </span>
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#008080]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </button>
                      {/* End Date Picker */}
                      {openCalendarFor && openCalendarFor.bookingId === booking.id && openCalendarFor.field === 'end' && (
                        <SingleDatePicker
                          isOpen={true}
                          onClose={() => setOpenCalendarFor(null)}
                          onSelect={(date) => handleDateSelect(booking.id, 'endDate', date)}
                          initialDate={booking.endDate}
                          minDate={booking.startDate || undefined}
                          alignRight={true}
                        />
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div className="mt-3">
                <button
                  type="button"
                  onClick={addBooking}
                  className="w-full sm:w-auto bg-booking-teal text-white px-4 py-2 rounded-lg hover:bg-booking-dark transition-colors duration-200 text-sm font-avenir tracking-wide"
                >
                  + Add Booking
                </button>
              </div>
            </div>

            {/* Line 3: How many people + Nightly Budget */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="teamSize" className="block text-sm font-avenir font-medium tracking-wide text-booking-dark mb-2">
                  How many people?
                </label>
                <input
                  type="number"
                  id="teamSize"
                  name="teamSize"
                  value={formData.teamSize}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  min="1"
                  className="w-full px-4 py-2 sm:py-3 text-sm sm:text-base font-avenir tracking-wide placeholder:text-xs sm:placeholder:text-sm border border-booking-teal rounded-lg focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent"
                  placeholder="Number of people"
                  required
                />
              </div>
              <div>
                <label htmlFor="budgetPerPerson" className="block text-sm font-avenir font-medium tracking-wide text-booking-dark mb-2">
                  Nightly budget
                </label>
                <input
                  type="number"
                  id="budgetPerPerson"
                  name="budgetPerPerson"
                  value={selectedBudgetOption}
                  onChange={(e) => setSelectedBudgetOption(e.target.value)}
                  onKeyDown={handleKeyDown}
                  min="0"
                  className="w-full px-4 py-2 sm:py-3 text-sm sm:text-base font-avenir tracking-wide placeholder:text-xs sm:placeholder:text-sm border border-booking-teal rounded-lg focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent"
                  placeholder="Enter budget"
                />
              </div>
            </div>

            {/* Line 4: Name + Company Name */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="fullName" className="block text-sm font-avenir font-medium tracking-wide text-booking-dark mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  className="w-full px-4 py-2 sm:py-3 text-sm sm:text-base font-avenir tracking-wide placeholder:text-xs sm:placeholder:text-sm border border-booking-teal rounded-lg focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent"
                  placeholder="Your full name"
                  required
                />
              </div>
              <div>
                <label htmlFor="companyName" className="block text-sm font-avenir font-medium tracking-wide text-booking-dark mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  id="companyName"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  className="w-full px-4 py-2 sm:py-3 text-sm sm:text-base font-avenir tracking-wide placeholder:text-xs sm:placeholder:text-sm border border-booking-teal rounded-lg focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent"
                  placeholder="Company name"
                  required
                />
              </div>
            </div>

            {/* Line 5: Company Email + Phone */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="email" className="block text-sm font-avenir font-medium tracking-wide text-booking-dark mb-2">
                  Company Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  className="w-full px-4 py-2 sm:py-3 text-sm sm:text-base font-avenir tracking-wide placeholder:text-xs sm:placeholder:text-sm border border-booking-teal rounded-lg focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent"
                  placeholder="your.email@company.com"
                  required
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-avenir font-medium tracking-wide text-booking-dark mb-2">
                  Phone *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  className="w-full px-4 py-2 sm:py-3 text-sm sm:text-base font-avenir tracking-wide placeholder:text-xs sm:placeholder:text-sm border border-booking-teal rounded-lg focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent"
                  placeholder="Your phone number"
                  required
                />
              </div>
            </div>

            {/* Terms and Submit Button */}
            <div className="pt-4 space-y-4">
              <p className="text-xs sm:text-sm text-center text-booking-gray font-avenir tracking-wide">
                By submitting, you agree to our{' '}
                <a href="/terms" target="_blank" className="text-booking-teal hover:underline">
                  Client Terms & Conditions
                </a>
                .
              </p>
              <button
                type="submit"
                disabled={isSubmitting}
                onClick={() => {
                  submitButtonClickedRef.current = true;
                }}
                className="w-full bg-booking-teal text-white px-6 py-3 rounded-lg font-avenir tracking-wide text-base hover:bg-opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : editingBookingRequestId ? 'Update Request' : 'Submit Request'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

