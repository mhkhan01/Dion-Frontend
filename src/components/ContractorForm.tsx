'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';

interface Booking {
  id: string;
  startDate: string;
  endDate: string;
}

interface BudgetOption {
  id: string;
  label: string;
}

export default function ContractorForm() {
  const searchParams = useSearchParams();
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

  const [contractorData, setContractorData] = useState({
    full_name: '',
    company_name: '',
    company_email: '',
    company_phone: '',
    company_address: '',
    project_postcode: '',
    city: '',
    team_size: ''
  });

  const [bookings, setBookings] = useState<Booking[]>([
    { id: '1', startDate: '', endDate: '' }
  ]);

  const [budgetOptions, setBudgetOptions] = useState<BudgetOption[]>([
    { id: '1', label: '< £200' },
    { id: '2', label: '£200-£300' },
    { id: '3', label: '£300-£400' },
    { id: '4', label: '£400+' }
  ]);

  const [selectedBudgetOption, setSelectedBudgetOption] = useState<string>('');

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [existingBookingRequest, setExistingBookingRequest] = useState<any>(null);
  const [existingBookingDates, setExistingBookingDates] = useState<any[]>([]);
  const [isLoadingExistingData, setIsLoadingExistingData] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingBookingId, setEditingBookingId] = useState<string | null>(null);
  const [showThankYou, setShowThankYou] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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



  const removeBudgetOption = (id: string) => {
    if (budgetOptions.length > 1) {
      setBudgetOptions(prev => prev.filter(option => option.id !== id));
    }
  };

  const selectBudgetOption = (label: string) => {
    setSelectedBudgetOption(label);
    setIsDropdownOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Note: GHL data will be sent individually for each new booking date below
    // This contractorData variable is not used for GHL anymore, but kept for reference

    try {
      let bookingRequest;
      
      if (isEditMode && editingBookingId) {
        // Edit mode - update existing booking request
        console.log('Updating existing booking request:', editingBookingId);
        
        const { error: updateError } = await supabase
          .from('booking_requests')
          .update({
            full_name: formData.fullName || contractorData.full_name,
            company_name: formData.companyName || contractorData.company_name,
            email: formData.email || contractorData.company_email || user?.email,
            phone: formData.phone || contractorData.company_phone,
            project_postcode: formData.projectPostcode || contractorData.project_postcode,
            team_size: formData.teamSize ? parseInt(formData.teamSize) : null,
            budget_per_person_week: selectedBudgetOption,
            user_id: user?.id || existingBookingRequest?.user_id,
            city: formData.city || contractorData.city
          })
          .eq('id', editingBookingId);

        if (updateError) {
          console.error('Error updating booking request:', updateError);
          alert('Failed to update booking request. Please try again.');
          setIsSubmitting(false);
          return;
        }

        bookingRequest = { ...existingBookingRequest, id: editingBookingId };
        console.log('Successfully updated booking request');
      } else if (existingBookingRequest) {
        // Prefill mode - use existing booking request
        bookingRequest = existingBookingRequest;
        console.log('Using existing booking request:', bookingRequest.id);
        console.log('Existing booking request data:', existingBookingRequest);
        
        // Update the booking request with user_id if it's not set
        if (user?.id && !bookingRequest.user_id) {
          console.log('Updating booking request with user_id:', user.id);
          const { error: updateError } = await supabase
            .from('booking_requests')
            .update({ user_id: user.id })
            .eq('id', bookingRequest.id);
          
          if (updateError) {
            console.error('Error updating booking request with user_id:', updateError);
          } else {
            console.log('Successfully updated booking request with user_id');
            // Update the local bookingRequest object
            bookingRequest.user_id = user.id;
          }
        }
      } else {
        // Create new booking request
        const { data: newBookingRequest, error: bookingRequestError } = await supabase
          .from('booking_requests')
          .insert({
            full_name: formData.fullName || contractorData.full_name,
            company_name: formData.companyName || contractorData.company_name,
            email: formData.email || contractorData.company_email || user?.email,
            phone: formData.phone || contractorData.company_phone,
            project_postcode: formData.projectPostcode || contractorData.project_postcode,
            team_size: formData.teamSize ? parseInt(formData.teamSize) : null,
            budget_per_person_week: selectedBudgetOption,
            status: 'pending',
            user_id: user?.id || null,
            city: formData.city || contractorData.city
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

      // Save booking dates to booking_dates table and get the database IDs
      let savedBookingDates: Array<{id: string, start_date: string, end_date: string}> = [];
      console.log('Booking request for saving dates:', bookingRequest);
      console.log('Bookings array length:', bookings.length);
      if (bookingRequest && bookings.length > 0) {
        if (isEditMode) {
          // Edit mode - update existing dates and add new ones
          console.log('Edit mode: Processing booking dates');
          
          // First, delete all existing booking dates for this request
          const { error: deleteError } = await supabase
            .from('booking_dates')
            .delete()
            .eq('booking_request_id', editingBookingId);

          if (deleteError) {
            console.error('Error deleting existing booking dates:', deleteError);
            alert('Failed to update booking dates. Please try again.');
            setIsSubmitting(false);
            return;
          }

          // Then save all current booking dates as new ones
          const bookingsToSave = bookings.filter(booking => {
            const hasValidDates = booking.startDate && booking.endDate && booking.startDate.trim() !== '' && booking.endDate.trim() !== '';
            console.log(`Edit mode - Booking ${booking.id}: hasValidDates=${hasValidDates}, startDate="${booking.startDate}", endDate="${booking.endDate}"`);
            return hasValidDates;
          });
          
          console.log('Edit mode - Bookings to save:', bookingsToSave);
          
          if (bookingsToSave.length > 0) {
            const bookingDatesData = bookingsToSave.map(booking => ({
              booking_request_id: editingBookingId,
              start_date: booking.startDate.trim(),
              end_date: booking.endDate.trim()
            }));
            
            // Validate dates before sending
            for (const booking of bookingDatesData) {
              if (new Date(booking.start_date) >= new Date(booking.end_date)) {
                console.error('Invalid date range: start_date must be before end_date');
                alert('Invalid date range: Start date must be before end date.');
                setIsSubmitting(false);
                return;
              }
            }

            console.log('Saving updated booking dates to database:', bookingDatesData);
            
            try {
              const { data: savedDates, error: bookingDatesError } = await supabase
                .from('booking_dates')
                .insert(bookingDatesData)
                .select('id, start_date, end_date');

              if (bookingDatesError) {
                console.error('Error saving updated booking dates:', bookingDatesError);
                alert('Booking request updated but dates failed. Please contact support.');
                setIsSubmitting(false);
                return;
              }

              console.log('Successfully saved updated booking dates:', savedDates);
              savedBookingDates = savedDates || [];
            } catch (insertError) {
              console.error('Exception during booking dates insert:', insertError);
              alert('An error occurred while saving booking dates. Please try again.');
              setIsSubmitting(false);
              return;
            }
          }
          //comment to see issues
        } else {
          // Normal mode - save all valid booking dates
          // For new requests, save all bookings with valid dates
          // For existing requests, only save new bookings (those with 'new-' prefix)
          const bookingsToSave = existingBookingRequest 
            ? bookings.filter(booking => {
                const hasValidDates = booking.startDate && booking.endDate && booking.startDate.trim() !== '' && booking.endDate.trim() !== '';
                const isNewBooking = booking.id.startsWith('new-');
                console.log(`Existing request - Booking ${booking.id}: hasValidDates=${hasValidDates}, isNewBooking=${isNewBooking}, startDate="${booking.startDate}", endDate="${booking.endDate}"`);
                return hasValidDates && isNewBooking;
              })
            : bookings.filter(booking => {
                const hasValidDates = booking.startDate && booking.endDate && booking.startDate.trim() !== '' && booking.endDate.trim() !== '';
                console.log(`New request - Booking ${booking.id}: hasValidDates=${hasValidDates}, startDate="${booking.startDate}", endDate="${booking.endDate}"`);
                return hasValidDates;
              });
        
        console.log('All bookings:', bookings);
        console.log('Bookings to save:', bookingsToSave);
        console.log('Is existing request:', !!existingBookingRequest);
        console.log('Booking details:', bookings.map(b => ({
          id: b.id,
          startDate: b.startDate,
          endDate: b.endDate,
          startsWithNew: b.id.startsWith('new-'),
          hasDates: b.startDate && b.endDate && b.startDate.trim() !== '' && b.endDate.trim() !== ''
        })));
        
        const bookingDatesData = bookingsToSave.map(booking => ({
          booking_request_id: bookingRequest.id,
          start_date: booking.startDate.trim(),
          end_date: booking.endDate.trim()
        }));
        
        // Validate dates before sending
        for (const booking of bookingDatesData) {
          if (new Date(booking.start_date) >= new Date(booking.end_date)) {
            console.error('Invalid date range: start_date must be before end date.');
            alert('Invalid date range: Start date must be before end date.');
            setIsSubmitting(false);
            return;
          }
        }

        if (bookingDatesData.length > 0) {
          console.log('Saving booking dates to database:', bookingDatesData);
          console.log('Booking dates data details:', bookingDatesData.map(bd => ({
            booking_request_id: bd.booking_request_id,
            start_date: bd.start_date,
            end_date: bd.end_date,
            start_date_type: typeof bd.start_date,
            end_date_type: typeof bd.end_date
          })));
          
          try {
            const { data: savedDates, error: bookingDatesError } = await supabase
              .from('booking_dates')
              .insert(bookingDatesData)
              .select('id, start_date, end_date');

            if (bookingDatesError) {
              console.error('Error saving booking dates:', bookingDatesError);
              console.error('Error details:', {
                message: bookingDatesError.message,
                details: bookingDatesError.details,
                hint: bookingDatesError.hint,
                code: bookingDatesError.code
              });
              alert('Booking request saved but dates failed. Please contact support.');
              setIsSubmitting(false);
              return;
            }

            console.log('Successfully saved booking dates:', savedDates);
            console.log('Saved booking dates structure:', savedDates?.map(bd => ({
              id: bd.id,
              start_date: bd.start_date,
              end_date: bd.end_date,
              id_type: typeof bd.id,
              id_string: String(bd.id),
              id_json: JSON.stringify(bd.id),
              full_object: bd
            })));
            
            // Verify that we have valid IDs
            savedDates?.forEach((bd, index) => {
              console.log(`Verifying booking date ${index + 1} ID:`, {
                id: bd.id,
                id_type: typeof bd.id,
                is_uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(bd.id),
                id_length: bd.id ? bd.id.length : 0
              });
            });
            
            if (savedDates && savedDates.length > 0) {
              savedBookingDates = savedDates;
            } else {
              console.error('No saved dates returned from Supabase');
              alert('Booking dates were not saved properly. Please try again.');
              setIsSubmitting(false);
              return;
            }
          } catch (insertError) {
            console.error('Exception during booking dates insert:', insertError);
            alert('An error occurred while saving booking dates. Please try again.');
            setIsSubmitting(false);
            return;
          }
        } else {
          console.log('No new booking dates to save');
        }
        }
      } else {
        console.log('Cannot save booking dates - bookingRequest:', bookingRequest, 'bookings.length:', bookings.length);
      }

      // Send data to GHL endpoint for each saved booking date
      let ghlSuccessCount = 0;
      let ghlErrorCount = 0;

      for (let i = 0; i < savedBookingDates.length; i++) {
        const savedBooking = savedBookingDates[i];
        
        console.log(`Processing saved booking ${i + 1}:`, {
          id: savedBooking.id,
          start_date: savedBooking.start_date,
          end_date: savedBooking.end_date,
          id_type: typeof savedBooking.id,
          id_undefined: savedBooking.id === undefined,
          id_null: savedBooking.id === null,
          id_string: String(savedBooking.id),
          id_length: savedBooking.id ? savedBooking.id.length : 'N/A',
          raw_object: savedBooking
        });
        
        // Skip if booking date ID is not valid
        if (!savedBooking.id) {
          console.error(`Booking date ${i + 1} has no valid ID:`, savedBooking);
          ghlErrorCount++;
          continue;
        }
        
        // Extract the exact ID that was saved in Supabase
        const exactBookingDateId = savedBooking.id;
        
        console.log(`Using exact booking date ID for GHL:`, {
          original_id: exactBookingDateId,
          id_type: typeof exactBookingDateId,
          id_value: exactBookingDateId,
          id_stringified: JSON.stringify(exactBookingDateId)
        });
        
        // Prepare contractor data for this specific booking date
        const contractorDataForBooking = {
          full_name: formData.fullName || contractorData.full_name,
          company_name: formData.companyName || contractorData.company_name,
          email: formData.email || contractorData.company_email || user?.email,
          phone: formData.phone || contractorData.company_phone,
          project_postcode: formData.projectPostcode || contractorData.project_postcode,
          team_size: formData.teamSize,
          budget_per_person_week: selectedBudgetOption,
          city: formData.city || contractorData.city,
          // Send only one booking date for this request
          booking_start_date: savedBooking.start_date,
          booking_end_date: savedBooking.end_date,
          booking_date_id: exactBookingDateId // Use the exact same ID from Supabase
        };

        try {
          console.log(`Sending GHL data for booking ${i + 1}:`, contractorDataForBooking);
          console.log(`GHL booking_date_id verification:`, {
            id_in_object: contractorDataForBooking.booking_date_id,
            id_from_supabase: exactBookingDateId,
            ids_match: contractorDataForBooking.booking_date_id === exactBookingDateId,
            id_type_in_object: typeof contractorDataForBooking.booking_date_id,
            id_type_from_supabase: typeof exactBookingDateId
          });
          
          const response = await fetch('https://services.leadconnectorhq.com/hooks/JxGt5Zz3odpUbS4vgmeC/webhook-trigger/40188edf-a93f-44aa-a6bf-9b564ef16dd4', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(contractorDataForBooking),
          });

          if (response.ok) {
            console.log(`GHL data sent successfully for booking ${i + 1}`);
            ghlSuccessCount++;
          } else {
            console.error(`Failed to send GHL data for booking ${i + 1}:`, response.status, response.statusText);
            ghlErrorCount++;
          }
        } catch (error) {
          console.error(`Error sending GHL data for booking ${i + 1}:`, error);
          ghlErrorCount++;
        }
      }

      // Provide feedback based on GHL results
      if (ghlSuccessCount > 0 && ghlErrorCount === 0) {
        console.log('All GHL requests sent successfully');
        console.log('Booking request saved to Supabase successfully');
        setShowThankYou(true);
      } else if (ghlSuccessCount > 0 && ghlErrorCount > 0) {
        console.log(`GHL: ${ghlSuccessCount} successful, ${ghlErrorCount} failed`);
        setShowThankYou(true);
      } else {
        console.error('All GHL requests failed');
        setShowThankYou(true);
      }
      setIsSubmitting(false);
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('An error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  // Fetch contractor data and auto-populate form when user is logged in
  useEffect(() => {
    const fetchContractorData = async () => {
      if (user?.id) {
        try {
          // Fetch from contractor table
          const { data: contractorData, error: contractorError } = await supabase
            .from('contractor')
            .select('full_name, company_name, company_email, company_address, phone, email')
            .eq('id', user.id)
            .single();
          
          // Fetch from booking_requests table for project_postcode, city, and team_size
          const { data: bookingRequestData, error: bookingRequestError } = await supabase
            .from('booking_requests')
            .select('project_postcode, city, team_size')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();
          
          if (contractorError && contractorError.code !== 'PGRST116') {
            console.error('Error fetching contractor data:', contractorError);
          }
          
          if (bookingRequestError && bookingRequestError.code !== 'PGRST116') {
            console.error('Error fetching booking request data:', bookingRequestError);
          }
          
          // Combine data from both tables
          const combinedData = {
            full_name: contractorData?.full_name || '',
            company_name: contractorData?.company_name || '',
            company_email: contractorData?.company_email || contractorData?.email || '',
            company_phone: contractorData?.phone || '',
            company_address: contractorData?.company_address || '',
            project_postcode: bookingRequestData?.project_postcode || '',
            city: bookingRequestData?.city || '',
            team_size: bookingRequestData?.team_size || ''
          };
          
          setContractorData({
            full_name: combinedData.full_name,
            company_name: combinedData.company_name,
            company_email: combinedData.company_email,
            company_phone: combinedData.company_phone,
            company_address: combinedData.company_address,
            project_postcode: combinedData.project_postcode,
            city: combinedData.city,
            team_size: combinedData.team_size
          });
          
          // Auto-populate form fields only if they're empty and not in edit/prefill mode
          const editId = searchParams.get('edit');
          const prefillMode = searchParams.get('prefill') === 'true';
          
          if (!editId && !prefillMode) {
            setFormData(prev => ({
              ...prev,
              fullName: combinedData.full_name || prev.fullName,
              companyName: combinedData.company_name || prev.companyName,
              email: combinedData.company_email || user.email || prev.email,
              phone: combinedData.company_phone || prev.phone,
              // projectPostcode and city are intentionally NOT auto-populated in new booking request forms
              // teamSize is intentionally NOT auto-populated in new booking request forms
            }));
          }
        } catch (error) {
          console.error('Error fetching contractor data:', error);
        }
      }
    };

    fetchContractorData();
  }, [user, searchParams]);

  // Fetch existing booking data for prefill or edit
  useEffect(() => {
    const fetchExistingBookingData = async () => {
      const editId = searchParams.get('edit');
      const prefillMode = searchParams.get('prefill') === 'true';
      
      if (editId || prefillMode) {
        setIsLoadingExistingData(true);
        try {
          let bookingRequest;
          
          if (editId) {
            // Edit mode - fetch specific booking request by ID
            setIsEditMode(true);
            setEditingBookingId(editId);
            
            const { data: bookingRequestData, error: requestError } = await supabase
              .from('booking_requests')
              .select('*')
              .eq('id', editId)
              .single();

            if (requestError) {
              console.error('Error fetching booking request for edit:', requestError);
              alert('Error loading booking request for editing. Please try again.');
              setIsLoadingExistingData(false);
              return;
            }
            
            bookingRequest = bookingRequestData;
          } else if (prefillMode && user?.email) {
            // Prefill mode - fetch by user email
            const { data: bookingRequestData, error: requestError } = await supabase
              .from('booking_requests')
              .select('*')
              .eq('email', user.email)
              .single();

            if (requestError) {
              console.log('No existing booking request found for prefill');
              setIsLoadingExistingData(false);
              return;
            }
            
            bookingRequest = bookingRequestData;
          } else {
            // No user email, just show empty form
            console.log('No user email found, showing empty form');
            setIsLoadingExistingData(false);
            return;
          }

          if (bookingRequest) {
            console.log('Found existing booking request:', bookingRequest);
            setExistingBookingRequest(bookingRequest);
            
            // Fetch phone from contractor table
            let contractorPhone = '';
            if (bookingRequest.user_id) {
              const { data: contractorData, error: contractorError } = await supabase
                .from('contractor')
                .select('phone')
                .eq('id', bookingRequest.user_id)
                .single();
              
              if (!contractorError && contractorData) {
                contractorPhone = contractorData.phone || '';
              }
            }
            
            // Fetch existing booking dates for this request
            const { data: bookingDates, error: datesError } = await supabase
              .from('booking_dates')
              .select('*')
              .eq('booking_request_id', bookingRequest.id);

            if (bookingDates && !datesError) {
              setExistingBookingDates(bookingDates);
              
              // Pre-fill form data
              setFormData({
                fullName: bookingRequest.full_name || '',
                companyName: bookingRequest.company_name || '',
                email: bookingRequest.email || '',
                phone: contractorPhone,
                projectPostcode: bookingRequest.project_postcode || '',
                teamSize: bookingRequest.team_size || '',
                city: bookingRequest.city || '',
              });

              // Pre-fill budget selection
              if (bookingRequest.budget_per_person_week) {
                setSelectedBudgetOption(bookingRequest.budget_per_person_week);
                console.log('Prefilled budget option:', bookingRequest.budget_per_person_week);
              }

              // Pre-fill existing booking dates
              const existingBookings = bookingDates.map((date, index) => ({
                id: `existing-${index + 1}`,
                startDate: date.start_date,
                endDate: date.end_date
              }));
              
              if (editId) {
                // In edit mode, show only existing dates
                setBookings(existingBookings);
              } else {
                // In prefill mode, add one empty booking for new dates
                setBookings([...existingBookings, { id: 'new-1', startDate: '', endDate: '' }]);
              }
            }
          }
        } catch (error) {
          console.error('Error fetching existing booking data:', error);
        } finally {
          setIsLoadingExistingData(false);
        }
      }
    };

    fetchExistingBookingData();
  }, [searchParams, user?.email]);

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

  // Show loading state while fetching existing data
  if (isLoadingExistingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-booking-bg via-booking-bg to-booking-teal/5 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-booking-teal mx-auto mb-4"></div>
          <p className="text-booking-gray">Loading your existing booking data...</p>
        </div>
      </div>
    );
  }

  return (
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
        href="/client" 
        className="absolute top-4 left-4 z-20 flex items-center gap-3 text-[#F6F6F4] transition-colors duration-200 group hover:text-[#00BAB5]"
        aria-label="Back to dashboard"
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

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen py-4 px-2 sm:py-8 sm:px-4 pb-12 sm:pb-16">
        {/* Logo */}
        <div className="mb-4 sm:mb-8 w-full max-w-xs sm:max-w-2xl py-2">
          <Image
            src="/blue-teal.webp"
            alt="Booking Hub Logo"
            width={800}
            height={200}
            className="w-full h-auto object-contain"
            style={{ maxWidth: '100%' }}
            priority
          />
        </div>

        {/* Form Container */}
        <div className="bg-white/95 backdrop-blur-sm rounded-xl sm:rounded shadow-xl sm:shadow-lg p-6 sm:p-6 lg:p-8 w-full max-w-xs sm:max-w-lg lg:max-w-2xl border border-gray-200/50 sm:border-gray-200">
          {/* Form Title */}
          <h1 className="text-base sm:text-2xl lg:text-3xl font-bold text-booking-dark mb-1 sm:mb-2 text-center leading-tight">
            Request Accommodation
          </h1>
          <p className="text-xs sm:text-sm text-booking-gray mb-4 sm:mb-6 text-center">
            Submit your requirements and we'll handle the rest
          </p>


          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-6">
            {/* Line 1: Where do you need accommodation? + Postcode */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
              <div>
                <label htmlFor="city" className="block text-xs sm:text-sm font-medium text-booking-dark mb-1 sm:mb-2">
                  Where do you need accommodation?
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="e.g. London"
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-booking-teal rounded focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="projectPostcode" className="block text-xs sm:text-sm font-medium text-booking-dark mb-1 sm:mb-2">
                  Accommodation Postcode
                </label>
                <input
                  type="text"
                  id="projectPostcode"
                  name="projectPostcode"
                  value={formData.projectPostcode}
                  onChange={handleInputChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-booking-teal rounded focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent"
                  placeholder="Enter postcode"
                />
              </div>
            </div>

            {/* Line 2: Booking dates */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-booking-dark mb-1 sm:mb-2">
                Booking Dates
              </label>
              {bookings.map((booking, index) => (
                <div key={booking.id} className="mb-3">
                  {bookings.length > 1 && (
                    <div className="flex justify-end items-center mb-2">
                      <button
                        type="button"
                        onClick={() => removeBooking(booking.id)}
                        className="text-red-500 hover:text-red-700 text-xs sm:text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-2 sm:gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-booking-dark mb-1 sm:mb-2">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={booking.startDate}
                        onChange={(e) => updateBooking(booking.id, 'startDate', e.target.value)}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-booking-teal rounded focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-booking-dark mb-1 sm:mb-2">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={booking.endDate}
                        onChange={(e) => updateBooking(booking.id, 'endDate', e.target.value)}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-booking-teal rounded focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent"
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}
              <div className="mt-3">
                <button
                  type="button"
                  onClick={addBooking}
                  className="w-full sm:w-auto bg-booking-teal text-white px-4 py-2 rounded-md hover:bg-booking-dark transition-colors duration-200 text-xs sm:text-sm font-medium"
                >
                  + Add Booking
                </button>
              </div>
            </div>

            {/* Line 3: How many people + Nightly Budget */}
            <div className="grid grid-cols-2 gap-2 sm:gap-4">
              <div>
                <label htmlFor="teamSize" className="block text-xs sm:text-sm font-medium text-booking-dark mb-1 sm:mb-2">
                  How many people?
                </label>
                <input
                  type="number"
                  id="teamSize"
                  name="teamSize"
                  value={formData.teamSize}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-booking-teal rounded focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent"
                  placeholder="Number of people"
                  required
                />
              </div>
              <div>
                <label htmlFor="budgetPerPerson" className="block text-xs sm:text-sm font-medium text-booking-dark mb-1 sm:mb-2">
                  Nightly budget
                </label>
                <input
                  type="number"
                  id="budgetPerPerson"
                  name="budgetPerPerson"
                  value={selectedBudgetOption}
                  onChange={(e) => setSelectedBudgetOption(e.target.value)}
                  min="0"
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-booking-teal rounded focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent"
                  placeholder="Enter budget amount"
                />
              </div>
            </div>

            {/* Line 4: Name + Company Name */}
            <div className="grid grid-cols-2 gap-2 sm:gap-4">
              <div>
                <label htmlFor="fullName" className="block text-xs sm:text-sm font-medium text-booking-dark mb-1 sm:mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-booking-teal rounded focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent"
                  placeholder="Your full name"
                  required
                />
              </div>
              <div>
                <label htmlFor="companyName" className="block text-xs sm:text-sm font-medium text-booking-dark mb-1 sm:mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  id="companyName"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-booking-teal rounded focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent"
                  placeholder="Your company name"
                  required
                />
              </div>
            </div>

            {/* Line 5: Company Email + Phone */}
            <div className="grid grid-cols-2 gap-2 sm:gap-4">
              <div>
                <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-booking-dark mb-1 sm:mb-2">
                  Company Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-booking-teal rounded focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent"
                  placeholder="your.email@company.com"
                  required
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-xs sm:text-sm font-medium text-booking-dark mb-1 sm:mb-2">
                  Phone *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-booking-teal rounded focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent"
                  placeholder="Your phone number"
                  required
                />
              </div>
            </div>

            {/* Thank You Message */}
            {showThankYou && (
              <div className="pt-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                  <p className="text-green-800 text-sm sm:text-base font-medium">
                    {isEditMode 
                      ? 'Thanks — your amendments request has been received.'
                      : 'Thanks — your request has been received.'
                    }
                  </p>
                </div>
              </div>
            )}

            {/* Terms and Conditions */}
            <div className="pt-2">
              <p className="text-xs sm:text-sm text-booking-gray text-center">
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
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-booking-teal text-white py-3 sm:py-4 px-6 rounded-lg font-semibold text-sm sm:text-base hover:bg-booking-dark transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-booking-teal focus:ring-offset-2 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
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
                  isEditMode ? 'UPDATE BOOKING REQUEST' : 
                  existingBookingRequest ? 'ADD NEW BOOKING DATES' : 'SUBMIT BOOKING REQUEST'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
