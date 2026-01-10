'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import ContractorFormModal from '@/components/ContractorFormModal';

interface Booking {
  id: string;
  booking_request_id?: string; // Add booking request ID
  property_id: string;
  start_date: string;
  end_date: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'paid';
  created_at: string;
  property: {
    title: string;
    address: string;
    price: number;
  };
  invoice?: {
    id: string;
    amount: number;
    status: 'unpaid' | 'paid';
    stripe_payment_url: string | null;
  };
  value?: number | string; // Add value field from booked_properties
}

export default function ContractorDashboard() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [contractorName, setContractorName] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activityTab, setActivityTab] = useState<'active' | 'pending'>('active');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [selectedFilters, setSelectedFilters] = useState<Set<string>>(new Set(['search']));
  const [filterValues, setFilterValues] = useState({
    search: '',
    postcode: '',
    startDate: '',
    endDate: ''
  });
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [contactInfo, setContactInfo] = useState({
    company_name: '',
    company_email: '',
    company_address: '',
    phone: '',
    client_type: ''
  });
  const [contractorFullName, setContractorFullName] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [selectedBookingDetails, setSelectedBookingDetails] = useState<any>(null);
  const [isBookingDetailsModalOpen, setIsBookingDetailsModalOpen] = useState(false);
  const [isBookingFormModalOpen, setIsBookingFormModalOpen] = useState(false);
  const [editingBookingRequestId, setEditingBookingRequestId] = useState<string | null>(null);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const fetchContractorData = async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('contractor')
        .select('full_name, company_name, company_email, company_address, phone, client_type, role')
        .eq('id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching contractor data:', error);
        return;
      }
      
      if (data) {
        console.log('Contractor data fetched:', data);
        setContractorFullName(data.full_name || user?.full_name || '');
        // If client_type is null and role is 'contractor', default to 'Client'
        const displayClientType = data.client_type || (data.role === 'contractor' ? 'Client' : '');
        setContactInfo({
          company_name: data.company_name || '',
          company_email: data.company_email || user?.email || '',
          company_address: data.company_address || '',
          phone: data.phone || '',
          client_type: displayClientType
        });
      } else {
        console.log('No contractor data found, using user data');
        // Initialize with empty values if no record exists
        setContractorFullName(user?.full_name || '');
        setContactInfo({
          company_name: '',
          company_email: user?.email || '',
          company_address: '',
          phone: '',
          client_type: 'Client' // Default to 'Client' for new records
        });
      }
    } catch (error) {
      console.error('Error fetching contractor data:', error);
    }
  };

  const handleContactInfoUpdate = async () => {
    if (!user?.id) return;
    
    try {
      // First, check if contractor record exists
      const { data: existingContractor, error: fetchError } = await supabase
        .from('contractor')
        .select('id')
        .eq('id', user.id)
        .single();
      
      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error checking contractor data:', fetchError);
        alert('Error checking contractor information. Please try again.');
        return;
      }
      
      let result;
      if (existingContractor) {
        // Update existing record
        result = await supabase
          .from('contractor')
          .update({
            company_name: contactInfo.company_name,
            company_email: contactInfo.company_email,
            company_address: contactInfo.company_address,
            phone: contactInfo.phone,
            client_type: contactInfo.client_type
          })
          .eq('id', user.id);
      } else {
        // Insert new record
        result = await supabase
          .from('contractor')
          .insert({
            id: user.id,
            email: user.email || '',
            full_name: user.full_name || '',
            role: 'contractor',
            company_name: contactInfo.company_name,
            company_email: contactInfo.company_email,
            company_address: contactInfo.company_address,
            phone: contactInfo.phone,
            client_type: contactInfo.client_type
          });
      }
      
      if (result.error) {
        console.error('Error updating contractor data:', result.error);
      } else {
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 5000);
      }
    } catch (error) {
      console.error('Error updating contractor data:', error);
      alert(`Error updating contact information: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
      return;
    }

    if (user && user.role !== 'contractor') {
      router.push('/');
      return;
    }
  }, [user, loading, router]);

  // Close filter dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isFilterDropdownOpen) {
        const target = event.target as Element;
        if (!target.closest('.filter-dropdown-container')) {
          setIsFilterDropdownOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isFilterDropdownOpen]);

  useEffect(() => {
    if (user) {
      fetchContractorName();
      fetchBookings();
    } else {
      // For preview purposes, set loading to false immediately if no user
      setLoadingBookings(false);
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === 'contact-info' && user?.id) {
      fetchContractorData();
    }
  }, [activeTab, user?.id]);

  // Initialize full name from user data as fallback
  useEffect(() => {
    if (user?.full_name && !contractorFullName) {
      setContractorFullName(user.full_name);
    }
  }, [user?.full_name, contractorFullName]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdownId) {
        setOpenDropdownId(null);
      }
      if (isRoleDropdownOpen) {
        const target = event.target as HTMLElement;
        if (!target.closest('.role-dropdown-container')) {
          setIsRoleDropdownOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdownId, isRoleDropdownOpen]);

  const fetchContractorName = async () => {
    if (!user?.id) return;
    
    try {
      const { data: contractorData, error } = await supabase
        .from('contractor')
        .select('full_name')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching contractor name:', error);
        return;
      }

      if (contractorData?.full_name) {
        setContractorName(contractorData.full_name);
      }
    } catch (error) {
      console.error('Error fetching contractor name:', error);
    }
  };

  const fetchBookingDetails = async (bookingRequestId: string, bookingDateId: string) => {
    try {
      const { data: bookingRequest, error } = await supabase
        .from('booking_requests')
        .select(`
          id,
          full_name,
          email,
          company_name,
          team_size,
          budget_per_person_week,
          project_postcode,
          status,
          booking_dates(
            id,
            start_date,
            end_date,
            status
          )
        `)
        .eq('id', bookingRequestId)
        .single();

      if (error) {
        console.error('Error fetching booking details:', error);
        return;
      }

      // Filter to only show the specific booking_date that was clicked
      if (bookingRequest && bookingRequest.booking_dates) {
        const specificDate = bookingRequest.booking_dates.find(
          (date: any) => date.id === bookingDateId
        );
        
        // Use the booking_date status if available, otherwise fall back to booking_request status
        if (specificDate && specificDate.status) {
          bookingRequest.status = specificDate.status;
        }
        
        bookingRequest.booking_dates = bookingRequest.booking_dates.filter(
          (date: any) => date.id === bookingDateId
        );
      }

      setSelectedBookingDetails(bookingRequest);
      setIsBookingDetailsModalOpen(true);
    } catch (error) {
      console.error('Error fetching booking details:', error);
    }
  };

  const fetchBookings = async () => {
    try {
      setLoadingBookings(true);
      
      // Fetch booking requests for this contractor
      const { data: bookingRequests, error: requestsError } = await supabase
        .from('booking_requests')
        .select(`
          *,
          booking_dates(
            id,
            start_date,
            end_date,
            status,
            created_at
          )
        `)
        .or(`user_id.eq.${user?.id},email.eq.${user?.email}`)
        .order('created_at', { ascending: false });

      if (requestsError) {
        console.error('Error fetching booking requests:', requestsError);
        return;
      }

      // Transform booking requests into bookings format for display
      const transformedBookings: Booking[] = [];
      
      if (bookingRequests) {
        for (const request of bookingRequests) {
          if (request.booking_dates && request.booking_dates.length > 0) {
            for (const bookingDate of request.booking_dates) {
              // Determine the actual status (same logic as displayed status)
              const actualStatus = (bookingDate.status || request.status);
              
              // Fetch value from backend API for confirmed bookings (requires auth)
              let bookingValue: number | string | undefined = undefined;
              if (actualStatus === 'confirmed') {
                try {
                  // Get auth session for authorization
                  const { data: sessionData } = await supabase.auth.getSession();
                  
                  if (sessionData.session) {
                    const response = await fetch(`https://jfgm6v6pkw.us-east-1.awsapprunner.com/api/booking-values/${bookingDate.id}`, {
                      method: 'GET',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${sessionData.session.access_token}`,
                      },
                    });
                    
                    if (response.ok) {
                      const result = await response.json();
                      if (result.success && result.value) {
                        bookingValue = result.value;
                      }
                    } else {
                      console.error('Failed to fetch booking value from backend:', response.status);
                    }
                  }
                } catch (error) {
                  console.error('Error fetching booking value:', error);
                }
              }
              
              transformedBookings.push({
                id: bookingDate.id,
                booking_request_id: request.id, // Add the booking request ID
                property_id: request.assigned_property_id || '',
                start_date: bookingDate.start_date,
                end_date: bookingDate.end_date,
                status: actualStatus as 'pending' | 'confirmed' | 'cancelled' | 'paid',
                created_at: request.created_at,
                property: {
                  title: `${request.company_name || 'N/A'} | Number of people: ${request.team_size || 'N/A'}`,
                  address: request.project_postcode || 'Location TBD',
                  price: request.budget_per_person_week || 0
                },
                value: bookingValue
              });
            }
          }
        }
      }

      setBookings(transformedBookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoadingBookings(false);
    }
  };

  const handleLogout = async () => {
    if (user) {
      await signOut();
    }
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-booking-bg">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-booking-teal"></div>
        </div>
      </div>
    );
  }

  const displayUser = user;

  const activeBookings = bookings.filter(b => b.status === 'confirmed' || b.status === 'paid');
  const pendingBookings = bookings.filter(b => b.status === 'pending');

  const renderMainContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            {/* Header with Search and Create Button */}
            <div className="flex flex-col space-y-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-avenir-bold tracking-wide font-bold text-booking-dark">Analytics</h1>
                <p className="text-sm sm:text-base font-avenir font-medium tracking-wide text-booking-gray">Accommodation booking overview</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <button 
                  onClick={() => {
                    setEditingBookingRequestId(null);
                    setIsBookingFormModalOpen(true);
                  }}
                  className="w-full sm:w-auto text-white px-6 py-3 sm:px-8 sm:py-4 lg:px-10 lg:py-5 rounded-lg transition-all duration-200 font-avenir font-medium tracking-wide font-bold text-base sm:text-lg lg:text-xl shadow-lg hover:shadow-xl transform hover:scale-105 whitespace-nowrap"
                  style={{ background: 'linear-gradient(to right, #00BAB5, rgba(0, 186, 181, 0.54))' }}
                >
                  Create Booking Request
                </button>
              </div>
            </div>

            {/* Analytics Tiles */}
            <div className="grid grid-cols-2 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 max-w-4xl mx-auto">
              {/* Active Requests Analytics */}
              <div className="rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 text-white" style={{ background: 'linear-gradient(to top, #00BAB5, rgba(0, 186, 181, 0.54))' }}>
                <div className="flex items-center justify-between mb-2 sm:mb-3 lg:mb-4">
                  <h3 className="text-sm sm:text-base lg:text-lg font-avenir-bold tracking-wide font-semibold">Active Requests</h3>
                  <div className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 lg:w-4 lg:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="text-xl sm:text-2xl lg:text-3xl font-avenir font-bold tracking-wide mb-1 sm:mb-2">{activeBookings.length}</div>
                <div className="text-xs sm:text-sm font-avenir font-medium tracking-wide opacity-90 mb-2 sm:mb-3 lg:mb-4">Currently active projects</div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 text-xs sm:text-sm font-avenir font-medium tracking-wide">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <span>Confirmed: {activeBookings.filter(b => b.status === 'confirmed').length}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-white bg-opacity-60 rounded-full"></div>
                    <span>Paid: {activeBookings.filter(b => b.status === 'paid').length}</span>
                  </div>
                </div>
              </div>

              {/* Pending Requests Analytics */}
              <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-2 sm:mb-3 lg:mb-4">
                  <h3 className="text-sm sm:text-base lg:text-lg font-avenir-bold tracking-wide font-semibold text-booking-dark">Pending Requests</h3>
                  <div className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 lg:w-4 lg:h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="text-xl sm:text-2xl lg:text-3xl font-avenir font-bold tracking-wide text-booking-dark mb-1 sm:mb-2">{pendingBookings.length}</div>
                <div className="text-xs sm:text-sm font-avenir font-medium tracking-wide text-booking-gray mb-2 sm:mb-3 lg:mb-4">Awaiting approval</div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2 sm:mb-3 lg:mb-4">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{width: `${Math.min((pendingBookings.length / 10) * 100, 100)}%`}}></div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0 text-xs sm:text-sm font-avenir font-medium tracking-wide text-booking-gray">
                  <span>This week: {pendingBookings.length}</span>
                  <span>+{Math.floor(Math.random() * 5)}% from last week</span>
                </div>
              </div>
            </div>

            {/* Activity Lists */}
            <div className="space-y-4">
                <div className="flex flex-col gap-4">
                  <h3 className="text-base sm:text-lg font-avenir-bold tracking-wide font-semibold text-booking-dark">Request Activity</h3>
                  <div className="flex space-x-1">
                    <button 
                      onClick={() => setActivityTab('active')}
                      className={`px-4 py-2 text-xs sm:text-sm font-avenir font-medium tracking-wide rounded-lg transition-all duration-200 ${
                        activityTab === 'active'
                          ? 'text-booking-teal border-b-2 border-booking-teal bg-booking-bg'
                          : 'text-booking-gray hover:text-booking-dark'
                      }`}
                    >
                      Confirmed
                    </button>
                    <button 
                      onClick={() => setActivityTab('pending')}
                      className={`px-4 py-2 text-xs sm:text-sm font-avenir font-medium tracking-wide rounded-lg transition-all duration-200 ${
                        activityTab === 'pending'
                          ? 'text-booking-teal border-b-2 border-booking-teal bg-booking-bg'
                          : 'text-booking-gray hover:text-booking-dark'
                      }`}
                    >
                      Pending
                    </button>
                  </div>
                </div>

              {/* Search Bar and Filters for Request Activity */}
              <div className="flex flex-col gap-4">
                <div className="w-full sm:flex-1 sm:max-w-md">
                  {/* Multi-Select Filter Dropdown */}
                  <div className="flex flex-col gap-2 sm:gap-4">
                    {/* Filter Type Multi-Select Dropdown */}
                    <div className="relative filter-dropdown-container">
                      <button
                        onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                        className="w-full sm:w-28 md:w-32 lg:w-36 px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent bg-white flex items-center justify-between gap-1.5 font-avenir font-medium tracking-wide"
                        style={{ fontSize: '11px' }}
                      >
                        <svg className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                        <span className="flex-1 text-left">
                          {selectedFilters.size === 1 && selectedFilters.has('search') ? 'Search All' :
                           selectedFilters.size === 1 && selectedFilters.has('postcode') ? 'Postcode' :
                           selectedFilters.size === 1 && selectedFilters.has('startDate') ? 'Start Date' :
                           selectedFilters.size === 1 && selectedFilters.has('endDate') ? 'End Date' :
                           `${selectedFilters.size} Filters`}
                        </span>
                        <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      
                      {isFilterDropdownOpen && (
                        <div className="absolute top-full left-0 z-10 w-full sm:w-48 bg-white border border-gray-300 rounded-lg shadow-lg mt-1">
                          <div className="p-2 space-y-1">
                            {[
                              { value: 'search', label: 'Search All' },
                              { value: 'postcode', label: 'Filter by Postcode' },
                              { value: 'startDate', label: 'Filter by Start Date' },
                              { value: 'endDate', label: 'Filter by End Date' }
                            ].map((option) => (
                              <label key={option.value} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                                <input
                                  type="checkbox"
                                  checked={selectedFilters.has(option.value)}
                                  onChange={(e) => {
                                    const newSelectedFilters = new Set(selectedFilters);
                                    if (e.target.checked) {
                                      newSelectedFilters.add(option.value);
                                    } else {
                                      newSelectedFilters.delete(option.value);
                                      // Clear the specific filter value when unchecking
                                      setFilterValues(prev => ({ ...prev, [option.value]: '' }));
                                    }
                                    setSelectedFilters(newSelectedFilters);
                                  }}
                                  className="w-3 h-3 text-booking-teal focus:ring-booking-teal"
                                />
                                <span className="text-xs font-avenir font-medium tracking-wide" style={{ fontSize: '11px' }}>{option.label}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}
              </div>
              
                    {/* Multiple Filter Inputs */}
                    <div className="flex-1 space-y-2">
                      {selectedFilters.has('search') && (
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Search requests..."
                            value={filterValues.search}
                            onChange={(e) => setFilterValues(prev => ({ ...prev, search: e.target.value }))}
                            className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent font-avenir font-medium tracking-wide"
                          />
                          <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                      )}
                      
                      {selectedFilters.has('postcode') && (
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="e.g., SW1A 1AA"
                            value={filterValues.postcode}
                            onChange={(e) => setFilterValues(prev => ({ ...prev, postcode: e.target.value }))}
                            className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent font-avenir font-medium tracking-wide"
                          />
                          <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                      )}
                      
                      {selectedFilters.has('startDate') && (
                        <div className="relative">
                          <input
                            type="date"
                            placeholder="Select start date"
                            value={filterValues.startDate}
                            onChange={(e) => setFilterValues(prev => ({ ...prev, startDate: e.target.value }))}
                            className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent font-avenir font-medium tracking-wide"
                          />
                          <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                      
                      {selectedFilters.has('endDate') && (
                        <div className="relative">
                          <input
                            type="date"
                            placeholder="Select end date"
                            value={filterValues.endDate}
                            onChange={(e) => setFilterValues(prev => ({ ...prev, endDate: e.target.value }))}
                            className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent font-avenir font-medium tracking-wide"
                          />
                          <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Clear Filter Button */}
                  {(Object.values(filterValues).some(value => value) || selectedFilters.size > 1 || !selectedFilters.has('search')) && (
                    <button
                      onClick={() => {
                        setSelectedFilters(new Set(['search']));
                        setFilterValues({
                          search: '',
                          postcode: '',
                          startDate: '',
                          endDate: ''
                        });
                      }}
                      className="mt-2 text-xs font-avenir font-medium tracking-wide text-booking-gray hover:text-booking-dark underline"
                    >
                      Clear Filter
                    </button>
                  )}
                </div>
              </div>
              
              <div>
                {(() => {
                  const filteredBookings = activityTab === 'active' ? activeBookings : pendingBookings;
                    
                    let filteredResults = filteredBookings;
                    
                    // Apply multiple filters simultaneously with separate values
                    
                    // Search filter
                    if (selectedFilters.has('search') && filterValues.search) {
                      filteredResults = filteredResults.filter(booking => 
                        booking.property.title.toLowerCase().includes(filterValues.search.toLowerCase()) ||
                        booking.property.address.toLowerCase().includes(filterValues.search.toLowerCase())
                      );
                    }
                    
                    // Postcode filter
                    if (selectedFilters.has('postcode') && filterValues.postcode) {
                      filteredResults = filteredResults.filter(booking => 
                        booking.property.address.toLowerCase().includes(filterValues.postcode.toLowerCase())
                      );
                    }
                    
                    // Start date filter
                    if (selectedFilters.has('startDate') && filterValues.startDate) {
                      const filterStartDate = new Date(filterValues.startDate);
                      filteredResults = filteredResults.filter(booking => {
                        const bookingStartDate = new Date(booking.start_date);
                        
                        // Normalize dates to compare only the date part (ignore time)
                        const filterDate = new Date(filterStartDate.getFullYear(), filterStartDate.getMonth(), filterStartDate.getDate());
                        const startDate = new Date(bookingStartDate.getFullYear(), bookingStartDate.getMonth(), bookingStartDate.getDate());
                        
                        // Show only bookings that start on the exact filter date
                        return startDate.getTime() === filterDate.getTime();
                      });
                    }
                    
                    // End date filter
                    if (selectedFilters.has('endDate') && filterValues.endDate) {
                      const filterEndDate = new Date(filterValues.endDate);
                      filteredResults = filteredResults.filter(booking => {
                        const bookingEndDate = new Date(booking.end_date);
                        
                        // Normalize dates to compare only the date part (ignore time)
                        const filterDate = new Date(filterEndDate.getFullYear(), filterEndDate.getMonth(), filterEndDate.getDate());
                        const endDate = new Date(bookingEndDate.getFullYear(), bookingEndDate.getMonth(), bookingEndDate.getDate());
                        
                        // Show only bookings that end on the exact filter date
                        return endDate.getTime() === filterDate.getTime();
                      });
                    }
                    
                    const filteredBySearch = filteredResults;

                  if (filteredBySearch.length > 0) {
                    return (
                      <div className="space-y-2">
                        {filteredBySearch.map((booking) => (
                          <div 
                            key={booking.id} 
                            onClick={() => booking.booking_request_id && fetchBookingDetails(booking.booking_request_id, booking.id)}
                            className="flex items-center justify-between py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                          >
                            <div className="flex items-center space-x-4 flex-1 min-w-0">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                                activityTab === 'active' ? 'bg-booking-teal' : 'bg-yellow-500'
                              }`}>
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  {activityTab === 'active' ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  )}
                                </svg>
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-xs sm:text-base font-avenir-bold tracking-wide font-semibold text-booking-dark truncate">
                                  {(() => {
                                    const parts = booking.property.title.split(' | ');
                                    if (parts.length === 2) {
                                      return (
                                        <>
                                          <span className="font-avenir-bold tracking-wide">{parts[0]}</span>
                                          <span className="font-avenir font-medium tracking-wide"> | {parts[1]}</span>
                                        </>
                                      );
                                    }
                                    return <span className="font-avenir font-medium tracking-wide">{booking.property.title}</span>;
                                  })()}
                                </h4>
                                <p className="text-[10px] sm:text-sm font-avenir font-medium tracking-wide text-booking-gray truncate">{booking.property.address}</p>
                                <p className="text-[10px] sm:text-sm font-avenir font-medium tracking-wide text-booking-gray truncate">
                                  {new Date(booking.start_date).toLocaleDateString()} - {new Date(booking.end_date).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-4 flex-shrink-0">
                              <div className="text-right">
                                <div className="text-sm font-avenir font-semibold tracking-wide text-booking-dark">{booking.property.price}</div>
                                <div className="text-xs font-avenir font-medium tracking-wide text-booking-gray">per night</div>
                                {booking.status === 'confirmed' && booking.value && (
                                  <>
                                    <div className="text-sm font-avenir font-semibold tracking-wide text-green-700 mt-1">{booking.value}</div>
                                    <div className="text-xs font-avenir font-medium tracking-wide text-green-600">booking value</div>
                                  </>
                                )}
                              </div>
                              <span className={`px-3 py-1 rounded-full text-xs font-avenir font-medium tracking-wide ${
                                booking.status === 'confirmed' 
                                  ? 'bg-green-100 text-green-800' 
                                  : booking.status === 'paid'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {booking.status === 'confirmed' ? 'Confirmed' : 
                                 booking.status === 'paid' ? 'Paid' : 'Pending'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  } else {
                    return (
                      <div className="text-center py-6">
                        <div className="w-10 h-10 bg-booking-bg rounded-full flex items-center justify-center mx-auto mb-3">
                          <svg className="w-5 h-5 text-booking-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {activityTab === 'active' ? (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            ) : (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            )}
                          </svg>
                        </div>
                        <h3 className="text-base font-avenir-bold tracking-wide font-semibold text-booking-dark mb-1">
                          No {activityTab === 'active' ? 'Active' : 'Pending'} Requests
                        </h3>
                        <p className="text-sm font-avenir font-medium tracking-wide text-booking-gray">
                          {activityTab === 'active' 
                            ? "You don't have any active booking requests at the moment."
                            : "You don't have any pending booking requests at the moment."
                          }
                        </p>
                      </div>
                    );
                  }
                })()}
              </div>
            </div>
          </div>
        );

      case 'booking-requests':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-avenir-bold tracking-wide font-bold text-booking-dark">Booking Requests</h2>
              <p className="font-avenir font-medium tracking-wide text-booking-gray">Manage your booking requests</p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
              {bookings.length > 0 ? (
                <div className="p-6">
                  {bookings.map((booking) => (
                    <div key={booking.id} className="border-b border-gray-100 last:border-b-0 py-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="text-sm lg:text-base font-avenir font-semibold tracking-wide text-booking-dark whitespace-nowrap lg:whitespace-normal overflow-hidden text-ellipsis">
                            {booking.property.title}
                          </h3>
                          <p className="text-xs lg:text-sm font-avenir font-semibold tracking-wide text-booking-teal mb-0.5">{booking.id}</p>
                          <p className="text-xs lg:text-sm font-avenir font-medium tracking-wide text-booking-gray mb-0.5">{booking.property.address}</p>
                          <div className="flex flex-col">
                            <span className="text-xs lg:text-sm font-avenir font-medium tracking-wide text-booking-gray">
                              {new Date(booking.start_date).toLocaleDateString()} - {new Date(booking.end_date).toLocaleDateString()}
                            </span>
                            <span className="text-xs lg:text-sm font-avenir font-semibold tracking-wide text-booking-teal">
                              {booking.property.price || 0} per night
                            </span>
                            {booking.status === 'confirmed' && booking.value && (
                              <span className="text-xs lg:text-sm font-avenir font-semibold tracking-wide text-green-700 mt-1">
                                Booking Value: {booking.value}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs lg:text-sm font-avenir font-medium tracking-wide ${
                            booking.status === 'confirmed' 
                              ? 'bg-green-100 text-green-800' 
                              : booking.status === 'paid'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {booking.status === 'confirmed' ? 'Confirmed' : 
                             booking.status === 'paid' ? 'Paid' : 'Pending'}
                          </span>
                          <button
                            onClick={() => {
                              setEditingBookingRequestId(booking.booking_request_id || null);
                              setIsBookingFormModalOpen(true);
                            }}
                            className="text-booking-teal hover:text-booking-dark text-xs lg:text-sm font-avenir font-medium tracking-wide underline"
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-booking-bg rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-booking-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-avenir-bold tracking-wide font-semibold text-booking-dark mb-2">No Booking Requests</h3>
                  <p className="font-avenir font-medium tracking-wide text-booking-gray">You don't have any booking requests.</p>
                </div>
              )}
            </div>
          </div>
        );


      case 'contact-info':
        return (
          <div className="space-y-4 sm:space-y-6 h-full overflow-hidden">
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-avenir-bold tracking-wide font-bold text-booking-dark">Contact Information</h2>
              <p className="text-sm sm:text-base font-avenir font-medium tracking-wide text-booking-gray">Manage your contact details and preferences</p>
            </div>

            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg border border-gray-100">
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <input 
                    type="text" 
                    value={contractorFullName}
                    placeholder="Full Name"
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base font-avenir font-medium tracking-wide border border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent"
                    readOnly
                  />
                </div>
                <div>
                  <input 
                    type="email" 
                    value={displayUser?.email || ''}
                    placeholder="Company Email"
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base font-avenir font-medium tracking-wide border border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent"
                    readOnly
                  />
                </div>
                <div>
                  <input 
                    type="tel" 
                    value={contactInfo.phone}
                    onChange={(e) => setContactInfo(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Enter phone number"
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base font-avenir font-medium tracking-wide border border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent"
                  />
                </div>
                <div>
                  <input 
                    type="text" 
                    value={contactInfo.company_name}
                    onChange={(e) => setContactInfo(prev => ({ ...prev, company_name: e.target.value }))}
                    placeholder="Enter company name"
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base font-avenir font-medium tracking-wide border border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent"
                  />
                </div>
                <div>
                  <textarea 
                    value={contactInfo.company_address}
                    onChange={(e) => setContactInfo(prev => ({ ...prev, company_address: e.target.value }))}
                    placeholder="Enter company address"
                    rows={3}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base font-avenir font-medium tracking-wide border border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-avenir font-medium tracking-wide text-booking-dark mb-2">Role</label>
                  <div className="relative role-dropdown-container">
                    <button
                      type="button"
                      onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base font-avenir font-medium tracking-wide border border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent bg-white text-left flex items-center justify-between"
                    >
                      <span>{contactInfo.client_type || 'Select Role'}</span>
                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {isRoleDropdownOpen && (
                      <div className="relative z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                        {['Contractor Company', 'Insurance Company', 'Council or Housing Association', 'Other'].map((role) => (
                          <button
                            key={role}
                            type="button"
                            onClick={() => {
                              setContactInfo(prev => ({ ...prev, client_type: role }));
                              setIsRoleDropdownOpen(false);
                            }}
                            className={`w-full px-4 py-3 text-left text-sm sm:text-base font-avenir font-medium tracking-wide hover:bg-gray-50 transition-colors ${
                              contactInfo.client_type === role ? 'bg-booking-bg text-booking-teal' : 'text-booking-dark'
                            }`}
                          >
                            {role}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                {showSuccessMessage && (
                  <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
                    <p className="text-sm sm:text-base font-avenir font-medium tracking-wide">Your information has been updated successfully!</p>
                  </div>
                )}
                <div className="pt-3 sm:pt-4">
                  <button 
                    onClick={handleContactInfoUpdate}
                    className="w-full sm:w-auto bg-booking-teal text-white px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-avenir font-medium tracking-wide rounded-lg sm:rounded-xl hover:bg-opacity-90 transition-all duration-200"
                  >
                    Update Information
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col lg:flex-row overflow-hidden">
      {/* Mobile Header */}
      <div className="lg:hidden bg-booking-dark text-white p-4 flex items-center relative">
        <img 
          src="/white-teal.webp" 
          alt="Booking Hub Logo" 
          className="h-8 w-auto object-contain py-1 mr-3"
          style={{ maxWidth: '100%' }}
        />
        <p className="absolute left-1/2 -translate-x-1/2 text-xl font-avenir tracking-wide font-bold text-white pointer-events-none">
          Client Portal
        </p>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="ml-auto p-2 rounded-lg hover:bg-gray-700 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)}></div>
          <div className="fixed top-0 left-0 h-full w-64 bg-booking-dark text-white transform transition-transform duration-300 ease-in-out">
            <div className="p-4 bg-booking-dark">
              <div className="flex items-center justify-between">
                <div className="flex flex-col items-center space-y-2 py-2">
                  <img 
                    src="/white-teal.webp" 
                    alt="Booking Hub Logo" 
                    className="h-12 w-auto object-contain"
                    style={{ maxWidth: '100%' }}
                  />
                  <p className="text-lg font-avenir tracking-wide font-bold text-white">Client Portal</p>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Mobile Navigation */}
            <nav className="p-4 space-y-2 font-avenir tracking-wide">
              <button
                onClick={() => { setActiveTab('dashboard'); setIsMobileMenuOpen(false); }}
                className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 ${
                  activeTab === 'dashboard'
                    ? 'bg-white text-booking-dark'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
                  </svg>
                  <span className="text-sm font-medium">Dashboard</span>
                  {activeTab === 'dashboard' && <div className="w-1 h-1 bg-booking-teal rounded-full ml-auto"></div>}
                </div>
              </button>

              <button
                onClick={() => { setActiveTab('booking-requests'); setIsMobileMenuOpen(false); }}
                className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 ${
                  activeTab === 'booking-requests'
                    ? 'bg-white text-booking-dark'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <span className="text-sm font-medium">Booking Requests</span>
                  {activeTab === 'booking-requests' && <div className="w-1 h-1 bg-booking-teal rounded-full ml-auto"></div>}
                </div>
              </button>


              <button
                onClick={() => { setActiveTab('contact-info'); setIsMobileMenuOpen(false); }}
                className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 ${
                  activeTab === 'contact-info'
                    ? 'bg-white text-booking-dark'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="text-sm font-medium">Contact Information</span>
                  {activeTab === 'contact-info' && <div className="w-1 h-1 bg-booking-teal rounded-full ml-auto"></div>}
                </div>
              </button>
            </nav>

            {/* Mobile Profile Section */}
            <div className="p-4 mt-auto">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-booking-teal rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {contractorName ? contractorName.charAt(0).toUpperCase() : 'C'}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-avenir font-medium text-white">{contractorName || 'Contractor'}</p>
                  <p className="text-xs font-avenir text-gray-300">Client</p>
                </div>
              </div>
              <button
                onClick={() => { setIsLogoutModalOpen(true); setIsMobileMenuOpen(false); }}
                className="w-full px-4 py-3 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-all duration-200"
              >
                <div className="flex items-center justify-center space-x-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span className="text-sm font-avenir font-medium">Logout</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex w-64 bg-booking-dark text-white flex-col h-screen flex-shrink-0 overflow-y-auto">
        {/* Logo/Header */}
        <div className="p-6 bg-booking-dark">
          <div className="flex flex-col items-center space-y-2 py-2">
            <img 
              src="/white-teal.webp" 
              alt="Booking Hub Logo" 
              className="h-12 w-auto object-contain"
              style={{ maxWidth: '100%' }}
            />
            <p className="text-lg font-avenir tracking-wide font-bold text-white">Client Portal</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 font-avenir tracking-wide">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 ${
              activeTab === 'dashboard'
                ? 'bg-white text-booking-dark'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            <div className="flex items-center space-x-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
              </svg>
              <span className="text-sm lg:text-base font-medium">Dashboard</span>
              {activeTab === 'dashboard' && <div className="w-1 h-1 bg-booking-teal rounded-full ml-auto"></div>}
            </div>
          </button>

          <button
            onClick={() => setActiveTab('booking-requests')}
            className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 ${
              activeTab === 'booking-requests'
                ? 'bg-white text-booking-dark'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            <div className="flex items-center space-x-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span className="text-sm lg:text-base font-medium">Booking Requests</span>
              {activeTab === 'booking-requests' && <div className="w-1 h-1 bg-booking-teal rounded-full ml-auto"></div>}
            </div>
          </button>


          <button
            onClick={() => setActiveTab('contact-info')}
            className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 ${
              activeTab === 'contact-info'
                ? 'bg-white text-booking-dark'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            <div className="flex items-center space-x-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-sm lg:text-base font-medium">Contact Information</span>
              {activeTab === 'contact-info' && <div className="w-1 h-1 bg-booking-teal rounded-full ml-auto"></div>}
            </div>
          </button>
        </nav>

        {/* Profile Section */}
        <div className="p-4">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-booking-teal rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {contractorName ? contractorName.charAt(0).toUpperCase() : 'C'}
              </span>
            </div>
            <div>
              <p className="text-sm lg:text-base font-avenir font-medium text-white">{contractorName || 'Contractor'}</p>
              <p className="text-xs lg:text-sm font-avenir text-gray-300">Client</p>
            </div>
          </div>
          <button
            onClick={() => setIsLogoutModalOpen(true)}
            className="w-full px-4 py-3 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-all duration-200"
          >
            <div className="flex items-center justify-center space-x-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="text-sm lg:text-base font-avenir font-medium">Logout</span>
            </div>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto overflow-x-hidden">
        {renderMainContent()}
      </div>

      {/* Booking Details Modal */}
      {isBookingDetailsModalOpen && selectedBookingDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <div className="flex items-center space-x-3">
                <img 
                  src="/blue-teal.webp" 
                  alt="Logo" 
                  className="h-6 sm:h-10 w-auto object-contain"
                />
                <h2 className="text-xl font-avenir-bold font-bold text-booking-dark">Request Details</h2>
              </div>
              <button
                onClick={() => {
                  setIsBookingDetailsModalOpen(false);
                  setSelectedBookingDetails(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="px-6 py-6 space-y-6">
              {/* Client Information Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-avenir-bold font-semibold text-booking-dark border-b pb-2">Client Information</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-base font-avenir tracking-wide text-booking-gray mb-1">Full Name</label>
                    <p className="text-sm font-avenir-regular text-booking-dark">{selectedBookingDetails.full_name || 'N/A'}</p>
                  </div>
                  
                  <div>
                    <label className="block text-base font-avenir tracking-wide text-booking-gray mb-1">Email</label>
                    <p className="text-sm font-avenir-regular text-booking-dark">{selectedBookingDetails.email || 'N/A'}</p>
                  </div>
                  
                  <div>
                    <label className="block text-base font-avenir tracking-wide text-booking-gray mb-1">Company Name</label>
                    <p className="text-sm font-avenir-regular text-booking-dark">{selectedBookingDetails.company_name || 'N/A'}</p>
                  </div>
                  
                  <div>
                    <label className="block text-base font-avenir tracking-wide text-booking-gray mb-1">Status</label>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-avenir-regular font-medium ${
                      selectedBookingDetails.status === 'confirmed' 
                        ? 'bg-green-100 text-green-800' 
                        : selectedBookingDetails.status === 'paid'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {selectedBookingDetails.status === 'confirmed' ? 'Confirmed' : 
                       selectedBookingDetails.status === 'paid' ? 'Paid' : 'Pending'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Booking Details Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-avenir-bold font-semibold text-booking-dark border-b pb-2">Booking Details</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-base font-avenir tracking-wide text-booking-gray mb-1">Number of People</label>
                    <p className="text-sm font-avenir-regular text-booking-dark">{selectedBookingDetails.team_size || 'N/A'}</p>
                  </div>
                  
                  <div>
                    <label className="block text-base font-avenir tracking-wide text-booking-gray mb-1">Nightly Budget (per person)</label>
                    <p className="text-sm font-avenir-regular text-booking-dark">£{selectedBookingDetails.budget_per_person_week || 'N/A'}</p>
                  </div>
                  
                  <div>
                    <label className="block text-base font-avenir tracking-wide text-booking-gray mb-1">Project Postcode</label>
                    <p className="text-sm font-avenir-regular text-booking-dark">{selectedBookingDetails.project_postcode || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Booking Dates Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-avenir-bold font-semibold text-booking-dark border-b pb-2">Booking Dates</h3>
                
                {selectedBookingDetails.booking_dates && selectedBookingDetails.booking_dates.length > 0 ? (
                  <div className="space-y-3">
                    {selectedBookingDetails.booking_dates.map((date: any, index: number) => (
                      <div key={date.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                          <div className="flex-1">
                            <span className="text-base font-avenir tracking-wide text-booking-gray">Period: </span>
                            <span className="text-sm font-avenir-regular text-booking-dark">
                              {new Date(date.start_date).toLocaleDateString('en-GB', { 
                                day: '2-digit', 
                                month: 'short', 
                                year: 'numeric' 
                              })} - {new Date(date.end_date).toLocaleDateString('en-GB', { 
                                day: '2-digit', 
                                month: 'short', 
                                year: 'numeric' 
                              })}
                            </span>
                          </div>
                          <div>
                            <span className="text-base font-avenir tracking-wide text-booking-gray">Duration: </span>
                            <span className="text-sm font-avenir-regular text-booking-dark">
                              {Math.ceil((new Date(date.end_date).getTime() - new Date(date.start_date).getTime()) / (1000 * 60 * 60 * 24))} nights
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm font-avenir-regular text-booking-gray">No booking dates available</p>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 rounded-b-2xl">
              <button
                onClick={() => {
                  setIsBookingDetailsModalOpen(false);
                  setSelectedBookingDetails(null);
                }}
                className="w-full sm:w-auto px-6 py-3 bg-booking-teal text-white rounded-lg font-avenir-regular font-medium hover:bg-opacity-90 transition-all duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Booking Form Modal */}
      <ContractorFormModal
        isOpen={isBookingFormModalOpen}
        onClose={() => {
          setIsBookingFormModalOpen(false);
          setEditingBookingRequestId(null);
        }}
        editingBookingRequestId={editingBookingRequestId}
        onSuccess={() => {
          fetchBookings();
        }}
      />

      {/* Logout Confirmation Modal */}
      {isLogoutModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ 
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.6) 0%, rgba(30, 41, 59, 0.7) 100%)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)'
          }}
        >
          <div 
            className="relative bg-white rounded-3xl max-w-[520px] w-full overflow-hidden"
            style={{
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)',
              animation: 'modalSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsLogoutModalOpen(false)}
              className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-all duration-200 group"
            >
              <svg className="w-4 h-4 text-gray-500 group-hover:text-gray-700 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Modal Content - Centered Vertical Layout */}
            <div className="px-8 pt-6 pb-6 flex flex-col items-center">
              {/* Icon Container */}
              <div 
                className="relative w-14 h-14 rounded-full flex items-center justify-center mb-4"
                style={{
                  background: 'linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)',
                  boxShadow: '0 8px 24px -4px rgba(239, 68, 68, 0.3)'
                }}
              >
                <div 
                  className="absolute inset-1.5 rounded-full flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, #FCA5A5 0%, #F87171 100%)'
                  }}
                >
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </div>
              </div>

              {/* Text Content */}
              <p className="text-gray-900 font-avenir-bold font-bold text-lg leading-relaxed text-center mb-5">
                Are you sure you want to logout from your account?
              </p>

              {/* Action Buttons - Side by Side */}
              <div className="flex gap-3">
                <button
                  onClick={() => setIsLogoutModalOpen(false)}
                  className="px-6 py-2.5 rounded-xl font-avenir font-semibold text-gray-700 text-sm tracking-wide bg-gray-100 hover:bg-gray-200 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="px-6 py-2.5 rounded-xl font-avenir font-semibold text-white text-sm tracking-wide transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
                  style={{
                    background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                    boxShadow: '0 4px 14px -2px rgba(239, 68, 68, 0.4)'
                  }}
                >
                  Yes, Logout
                </button>
              </div>
            </div>
          </div>

          <style jsx>{`
            @keyframes modalSlideIn {
              from {
                opacity: 0;
                transform: scale(0.95) translateY(10px);
              }
              to {
                opacity: 1;
                transform: scale(1) translateY(0);
              }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}
