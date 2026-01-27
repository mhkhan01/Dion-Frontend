'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import AddPropertyModal from '@/components/AddPropertyModal';
import PropertyDetailsModal from '@/components/PropertyDetailsModal';

interface Property {
  id: string;
  property_name: string;
  house_address: string;
  locality?: string;
  city: string;
  county?: string;
  country: string;
  postcode: string;
  property_type: string;
  bedrooms: number;
  beds: number;
  beds_breakdown?: string;
  bathrooms: number;
  max_occupancy: number;
  parking_type?: string;
  photos?: string[];
  
  // Amenities
  workspace_desk: boolean;
  high_speed_wifi: boolean;
  smart_tv: boolean;
  fully_equipped_kitchen: boolean;
  living_dining_space: boolean;
  washing_machine: boolean;
  iron_ironing_board: boolean;
  linen_towels_provided: boolean;
  consumables_provided: boolean;
  
  // Safety & Compliance
  smoke_alarm: boolean;
  co_alarm: boolean;
  fire_extinguisher_blanket: boolean;
  epc: boolean;
  gas_safety_certificate: boolean;
  eicr: boolean;
  
  // Additional Information
  additional_info?: string;
  
  // Pricing
  weekly_rate: number;
  monthly_rate: number;
  bills_included: boolean;
  
  // Status and metadata
  is_available: boolean;
  activity?: string;
  created_at: string;
  updated_at: string;
}

interface Booking {
  id: string;
  property_id: string;
  start_date: string;
  end_date: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'paid';
  created_at: string;
  property: {
    title: string;
    address: string;
    price_per_day: number;
  };
  contractor: {
    full_name: string;
  };
  invoice?: {
    id: string;
    amount: number;
    status: 'unpaid' | 'paid';
    stripe_payment_url: string | null;
  };
}

interface BookedProperty {
  id: string;
  property_id: string;
  contractor_id: string;
  booking_request_id: string;
  booking_id?: string;
  start_date: string;
  end_date: string;
  team_size?: number;
  project_postcode?: string;
  city?: string;
  company_name?: string;
  property_name?: string;
  property_type?: string;
  status: 'active' | 'completed' | 'cancelled';
  created_at: string;
  value?: number | string;
  properties?: {
    id: string;
    property_name?: string;
    house_address?: string;
    locality?: string;
    city?: string;
    county?: string;
    postcode?: string;
    country?: string;
  };
  booking_requests?: {
    city?: string;
  };
}

export default function PartnerDashboard() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [partnerName, setPartnerName] = useState<string>('');
  const [isAddPropertyModalOpen, setIsAddPropertyModalOpen] = useState(false);
  const [isPropertyDetailsModalOpen, setIsPropertyDetailsModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [propertyViewTab, setPropertyViewTab] = useState<'listed' | 'delisted'>('listed');
  const [activityTab, setActivityTab] = useState<'listed' | 'delisted'>('listed');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<Set<string>>(new Set(['search']));
  const [filterValues, setFilterValues] = useState({
    search: '',
    postcode: '',
    property_type: '',
    parking_type: ''
  });
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isDeletePropertyModalOpen, setIsDeletePropertyModalOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<string | null>(null);
  const [contactInfo, setContactInfo] = useState({
    company_name: '',
    company_email: '',
    company_address: '',
    phone: ''
  });
  const [partnerFullName, setPartnerFullName] = useState('');
  const [hasLoadedContactInfo, setHasLoadedContactInfo] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  
  // Confirmed bookings state
  const [showConfirmedBookings, setShowConfirmedBookings] = useState(false);
  const [bookedProperties, setBookedProperties] = useState<BookedProperty[]>([]);
  const [loadingConfirmedBookings, setLoadingConfirmedBookings] = useState(false);

  useEffect(() => {
    // All restrictions removed - allow anyone to access partner dashboard without authentication
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchData();
    } else {
      // For preview purposes, set loading to false immediately if no user
      setLoadingData(false);
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === 'contact-info' && user && !hasLoadedContactInfo) {
      fetchPartnerData();
      setHasLoadedContactInfo(true);
    }
    // Reset the flag when leaving the contact-info tab
    if (activeTab !== 'contact-info') {
      setHasLoadedContactInfo(false);
    }
  }, [activeTab, user, hasLoadedContactInfo]);

  // Initialize full name from user data as fallback
  useEffect(() => {
    if (user?.full_name && !partnerFullName) {
      setPartnerFullName(user.full_name);
    }
  }, [user?.full_name, partnerFullName]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdownId) {
        const target = event.target as Element;
        if (!target.closest('.relative')) {
          setOpenDropdownId(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdownId]);

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

  const fetchData = async () => {
    try {
      setLoadingData(true);
      
      // First get the partner profile to get the landlord_id and full_name
      const { data: landlordProfile, error: profileError } = await supabase
        .from('landlord')
        .select('id, full_name')
        .eq('id', user?.id)
        .single();

      if (profileError) {
        console.error('Error fetching partner profile:', profileError);
        setLoadingData(false);
        return;
      }

      // Set the partner name
      if (landlordProfile?.full_name) {
        setPartnerName(landlordProfile.full_name);
      }

      // Fetch properties using landlord_id from landlord_profiles
      const { data: propertiesData, error: propertiesError } = await supabase
        .from('properties')
        .select('*')
        .eq('landlord_id', landlordProfile.id)
        .order('created_at', { ascending: false });

      if (propertiesError) {
        console.error('Error fetching properties:', propertiesError);
      } else {
        setProperties(propertiesData || []);
      }

      // For now, set empty bookings array since we don't have the bookings table set up yet
      setBookings([]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleLogout = async () => {
    if (user) {
      await signOut();
    }
    router.push('/');
  };

  const handleDeleteProperty = async (propertyId: string) => {
    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', propertyId);

      if (error) {
        console.error('Error deleting property:', error);
      } else {
        setProperties(properties.filter(p => p.id !== propertyId));
      }
    } catch (error) {
      console.error('Error deleting property:', error);
    }
  };

  const handleTogglePropertyStatus = async (propertyId: string, currentActivity: string) => {
    try {
      // Toggle between 'active' and 'inactive'
      const newActivity = currentActivity === 'active' ? 'inactive' : 'active';
      
      const { error } = await supabase
        .from('properties')
        .update({ activity: newActivity })
        .eq('id', propertyId);

      if (error) {
        console.error('Error updating property status:', error);
      } else {
        // Update local state
        setProperties(properties.map(p => 
          p.id === propertyId ? { ...p, activity: newActivity } : p
        ));
      }
    } catch (error) {
      console.error('Error updating property status:', error);
    }
  };

  const fetchPartnerData = async () => {
    if (!user?.id) return;
    
    try {
      const { data: landlordData, error } = await supabase
        .from('landlord')
        .select('full_name, company_name, company_email, company_address, phone')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching partner data:', error);
      } else if (landlordData) {
        setPartnerFullName(landlordData.full_name || user?.full_name || '');
        setContactInfo({
          company_name: landlordData.company_name || '',
          company_email: landlordData.company_email || '',
          company_address: landlordData.company_address || '',
          phone: landlordData.phone || ''
        });
      } else {
        setPartnerFullName(user?.full_name || '');
        setContactInfo({
          company_name: '',
          company_email: '',
          company_address: '',
          phone: ''
        });
      }
    } catch (error) {
      console.error('Error fetching partner data:', error);
    }
  };

  const handleContactInfoUpdate = async () => {
    if (!user?.id) return;
    
    // Clear previous messages
    setUpdateSuccess(false);
    setUpdateError(null);
    
    try {
      // First, check if partner record exists
      const { data: existingLandlord, error: fetchError } = await supabase
        .from('landlord')
        .select('id')
        .eq('id', user.id)
        .single();
      
      let result;
      if (existingLandlord) {
        // Update existing record
        result = await supabase
          .from('landlord')
          .update({
            company_name: contactInfo.company_name,
            company_email: contactInfo.company_email,
            company_address: contactInfo.company_address,
            phone: contactInfo.phone
          })
          .eq('id', user.id);
      } else {
        // Insert new record
        result = await supabase
          .from('landlord')
          .insert({
            id: user.id,
            email: user.email || '',
            full_name: partnerFullName || user.full_name || '',
            role: 'landlord',
            company_name: contactInfo.company_name,
            company_email: contactInfo.company_email,
            company_address: contactInfo.company_address,
            phone: contactInfo.phone
          });
      }
      
      if (result.error) {
        console.error('Error updating partner data:', result.error);
        setUpdateError(`Failed to update information: ${result.error.message}`);
      } else {
        setUpdateSuccess(true);
        // Clear success message after 3 seconds
        setTimeout(() => setUpdateSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Error updating partner data:', error);
      setUpdateError('An unexpected error occurred while updating your information.');
    }
  };

  const handlePropertyClick = (property: Property) => {
    setSelectedProperty(property);
    setIsPropertyDetailsModalOpen(true);
  };

  const fetchConfirmedBookings = async () => {
    if (!user?.id) return;
    
    try {
      setLoadingConfirmedBookings(true);
      
      // First get the landlord_id from the landlord table
      const { data: landlordProfile, error: profileError } = await supabase
        .from('landlord')
        .select('id')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching landlord profile:', profileError);
        setBookedProperties([]);
        return;
      }

      // Fetch booked properties for this landlord with status 'active' or 'completed'
      const { data: bookedPropertiesData, error: bookedPropertiesError } = await supabase
        .from('booked_properties')
        .select(`
          *,
          value,
          properties (
            id,
            property_name,
            house_address,
            locality,
            city,
            county,
            postcode,
            country
          ),
          booking_requests (
            city
          )
        `)
        .eq('landlord_id', landlordProfile.id)
        .in('status', ['active', 'completed'])
        .order('created_at', { ascending: false });

      if (bookedPropertiesError) {
        console.error('Error fetching confirmed bookings:', bookedPropertiesError);
        setBookedProperties([]);
      } else {
        setBookedProperties(bookedPropertiesData || []);
      }
    } catch (error) {
      console.error('Error fetching confirmed bookings:', error);
      setBookedProperties([]);
    } finally {
      setLoadingConfirmedBookings(false);
    }
  };

  const handleShowConfirmedBookings = async () => {
    await fetchConfirmedBookings();
    setShowConfirmedBookings(true);
  };

  const handleBackToDashboard = () => {
    setShowConfirmedBookings(false);
  };

  const handleAddProperty = async (propertyData: any) => {
    try {
      // Upload photos to Supabase Storage
      let photoUrls: string[] = [];
      
      if (propertyData.photos && propertyData.photos.length > 0) {
        for (let i = 0; i < propertyData.photos.length; i++) {
          const file = propertyData.photos[i];
          const fileName = `${user?.id}/${Date.now()}-${i}.${file.name.split('.').pop()}`;
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('property-photos')
            .upload(fileName, file);
          
          if (uploadError) {
            console.error('Error uploading photo:', uploadError);
          } else {
            // Get the public URL
            const { data: { publicUrl } } = supabase.storage
              .from('property-photos')
              .getPublicUrl(fileName);
            
            photoUrls.push(publicUrl);
          }
        }
      }
      
      const { data, error } = await supabase
        .from('properties')
        .insert({
          // Basic Details
          landlord_id: user?.id,
          property_name: propertyData.propertyName,
          house_address: propertyData.houseAddress,
          locality: propertyData.locality || null,
          city: propertyData.city,
          county: propertyData.county,
          country: propertyData.country,
          postcode: propertyData.postcode,
          property_type: propertyData.propertyType,
          bedrooms: propertyData.bedrooms,
          beds: propertyData.beds,
          beds_breakdown: propertyData.bedsBreakdown || null,
          bathrooms: propertyData.bathrooms,
          max_occupancy: propertyData.maxOccupancy,
          parking_type: propertyData.parkingType || null,
          
          // Photos
          photos: photoUrls,
          
          // Amenities
          workspace_desk: propertyData.workspaceDesk,
          high_speed_wifi: propertyData.highSpeedWifi,
          smart_tv: propertyData.smartTv,
          fully_equipped_kitchen: propertyData.fullyEquippedKitchen,
          living_dining_space: propertyData.livingDiningSpace,
          washing_machine: propertyData.washingMachine,
          iron_ironing_board: propertyData.ironIroningBoard,
          linen_towels_provided: propertyData.linenTowelsProvided,
          consumables_provided: propertyData.consumablesProvided,
          
          // Safety & Compliance
          smoke_alarm: propertyData.smokeAlarm,
          co_alarm: propertyData.coAlarm,
          fire_extinguisher_blanket: propertyData.fireExtinguisherBlanket,
          epc: propertyData.epc,
          gas_safety_certificate: propertyData.gasSafetyCertificate,
          eicr: propertyData.eicr,
          
          // Additional Information
          additional_info: propertyData.additionalInfo || null,
          
          // VAT Details, Comments, Airbnb
          vat_details: propertyData.vatDetails || null,
          comments: propertyData.comments || null,
          airbnb: propertyData.airbnb || null,
          
          // Payment Method
          payment_method: propertyData.paymentMethod?.preferredPaymentMethod || null,
          bank_name: propertyData.paymentMethod?.bankName || null,
          account_holder_name: propertyData.paymentMethod?.accountHolderName || null,
          sort_code: propertyData.paymentMethod?.sortCode || null,
          account_number: propertyData.paymentMethod?.accountNumber || null,
          
          // Pricing (set default values)
          weekly_rate: null,
          monthly_rate: null,
          bills_included: false,
          
          // Status
          is_available: true,
          activity: 'active',
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding property:', error);
        throw error;
      }

      // Add the new property to the state
      setProperties([data, ...properties]);
      
      // Switch to dashboard to show the new property
      setActiveTab('dashboard');
    } catch (error) {
      console.error('Error adding property:', error);
      throw error;
    }
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

  // Helper function to build full address from components
  const buildFullAddress = (property: Property) => {
    const addressParts = [
      property.house_address,
      property.locality,
      property.city,
      property.county,
      property.country
    ].filter(part => part && part.trim() !== ''); // Filter out null, undefined, or empty strings
    
    return addressParts.join(', ');
  };

  // Filter properties based on selected filters
  const filterProperties = (propertiesList: Property[]) => {
    return propertiesList.filter(property => {
      // Apply search filter
      if (selectedFilters.has('search') && filterValues.search) {
        const searchTerm = filterValues.search.toLowerCase();
        const matchesSearch = 
          property.property_name.toLowerCase().includes(searchTerm) ||
          property.house_address.toLowerCase().includes(searchTerm) ||
          property.postcode.toLowerCase().includes(searchTerm) ||
          property.property_type.toLowerCase().includes(searchTerm);
        
        if (!matchesSearch) return false;
      }

      // Apply postcode filter
      if (selectedFilters.has('postcode') && filterValues.postcode) {
        const postcodeTerm = filterValues.postcode.toLowerCase();
        const matchesPostcode = 
          property.postcode.toLowerCase().includes(postcodeTerm) ||
          property.house_address.toLowerCase().includes(postcodeTerm);
        
        if (!matchesPostcode) return false;
      }

      // Apply property type filter
      if (selectedFilters.has('property_type') && filterValues.property_type) {
        if (property.property_type !== filterValues.property_type) {
          return false;
        }
      }

      // Apply parking type filter
      if (selectedFilters.has('parking_type') && filterValues.parking_type) {
        if (property.parking_type !== filterValues.parking_type) {
          return false;
        }
      }

      return true;
    });
  };

  const listedProperties = filterProperties(properties.filter(p => p.activity === 'active'));
  const delistedProperties = filterProperties(properties.filter(p => p.activity === 'inactive'));
  const pendingBookings = bookings.filter(b => b.status === 'pending');
  const confirmedBookingsFromBookings = bookings.filter(b => b.status === 'confirmed');

  const renderMainContent = () => {
    // Show confirmed bookings view if active
    if (showConfirmedBookings) {
      return (
        <div className="space-y-6">
          {/* Back to Dashboard Link */}
          <div className="flex items-center">
            <button
              onClick={handleBackToDashboard}
              className="flex items-center text-booking-teal hover:text-booking-dark transition-colors duration-200"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-sm font-medium">Back to Dashboard</span>
            </button>
          </div>

          {/* Header */}
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-booking-dark mb-2">Confirmed Bookings</h1>
            <p className="text-sm sm:text-base text-booking-gray">View all confirmed bookings for your properties</p>
          </div>

          {/* Loading State */}
          {loadingConfirmedBookings ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-booking-teal"></div>
            </div>
          ) : bookedProperties.length > 0 ? (
            <div className="space-y-4">
              {/* Booking Cards */}
              {bookedProperties.map((bookedProperty) => (
                <div 
                  key={bookedProperty.id}
                  className="bg-white border border-booking-teal sm:border-2 rounded-lg sm:rounded-xl p-1 sm:p-2 shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  <div className="grid grid-cols-3 gap-1 sm:gap-4">
                    {/* Property ID Section */}
                    <div className="p-1 sm:p-4">
                      <div className="m-1 sm:m-0">
                        <div className="text-[6px] sm:text-xs font-medium text-booking-gray uppercase mb-0.5 sm:mb-2">Property ID</div>
                        <div className="text-[9px] sm:text-2xl font-bold text-booking-dark mb-0.5 sm:mb-1">
                          {bookedProperty.property_id || 'N/A'}
                        </div>
                        <div className="text-[6px] sm:text-sm text-booking-gray">
                          {bookedProperty.properties?.property_name || bookedProperty.property_name || 'Property Name N/A'}
                        </div>
                        <div className="mt-0.5 sm:mt-2 text-[5px] sm:text-xs text-booking-gray">
                          {[
                            bookedProperty.properties?.house_address,
                            bookedProperty.properties?.locality,
                            bookedProperty.properties?.city,
                            bookedProperty.properties?.county,
                            bookedProperty.properties?.postcode,
                            bookedProperty.properties?.country
                          ].filter(Boolean).join(', ')}
                        </div>
                      </div>
                    </div>

                    {/* Booking Dates Section */}
                    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg sm:rounded-xl p-1 sm:p-4">
                      <div className="m-1 sm:m-0">
                        <div className="text-[6px] sm:text-xs font-medium text-blue-700 uppercase mb-0.5 sm:mb-2">Booking Period</div>
                        <div className="space-y-0.5 sm:space-y-2">
                          <div className="flex items-center space-x-0.5 sm:space-x-2">
                            <div className="bg-green-500 text-white text-[5px] sm:text-xs font-bold w-8 sm:w-auto px-0.5 sm:px-2 py-0.5 sm:py-1 rounded flex items-center justify-center">START</div>
                            <div className="text-[6px] sm:text-lg font-bold text-gray-900">
                              {bookedProperty.start_date ? new Date(bookedProperty.start_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                            </div>
                          </div>
                          <div className="flex items-center space-x-0.5 sm:space-x-2">
                            <div className="bg-red-500 text-white text-[5px] sm:text-xs font-bold w-8 sm:w-auto px-0.5 sm:px-2 py-0.5 sm:py-1 rounded flex items-center justify-center">END</div>
                            <div className="text-[6px] sm:text-lg font-bold text-gray-900">
                              {bookedProperty.end_date ? new Date(bookedProperty.end_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                            </div>
                          </div>
                          {bookedProperty.start_date && bookedProperty.end_date && (
                            <div className="mt-0.5 sm:mt-3 text-center">
                              <div className="text-[5px] sm:text-xs font-medium text-gray-600 uppercase mb-0.5 sm:mb-1">Number of Nights</div>
                              <div className="text-[6px] sm:text-lg font-bold text-gray-900">
                                {Math.round((new Date(bookedProperty.end_date).getTime() - new Date(bookedProperty.start_date).getTime()) / (1000 * 60 * 60 * 24))}
                              </div>
                            </div>
                          )}
                          {bookedProperty.value !== undefined && bookedProperty.value !== null && (
                            <div className="mt-0.5 sm:mt-3 text-center">
                              <div className="text-[5px] sm:text-xs font-medium text-gray-600 uppercase mb-0.5 sm:mb-1">Booking value</div>
                              <div className="text-[6px] sm:text-lg font-bold text-gray-900">
                                {typeof bookedProperty.value === 'number' 
                                  ? `£${bookedProperty.value.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                  : `£${String(bookedProperty.value)}`}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Booking ID Section */}
                    <div className="p-1 sm:p-4">
                      <div className="m-1 sm:m-0">
                        <div className="text-[6px] sm:text-xs font-medium text-purple-700 uppercase mb-0.5 sm:mb-2">Booking ID</div>
                        <div className="text-[9px] sm:text-2xl font-bold text-booking-dark mb-0.5 sm:mb-2">
                          {bookedProperty.booking_id || bookedProperty.id || 'N/A'}
                        </div>
                        {bookedProperty.project_postcode && (
                          <div className="text-[6px] sm:text-sm text-booking-gray">
                            Postcode: {bookedProperty.project_postcode}
                          </div>
                        )}
                        {bookedProperty.booking_requests?.city && (
                          <div className="text-[6px] sm:text-sm text-booking-gray">
                            City: {bookedProperty.booking_requests.city}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl lg:rounded-2xl p-8 lg:p-12 text-center shadow-lg border border-gray-100">
              <div className="w-12 h-12 lg:w-16 lg:h-16 bg-booking-bg rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 lg:w-8 lg:h-8 text-booking-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-base lg:text-lg font-semibold text-booking-dark mb-2 font-sans">
                No Confirmed Bookings
              </h3>
              <p className="text-sm lg:text-base text-booking-gray font-sans">
                You don't have any confirmed bookings at the moment.
              </p>
            </div>
          )}
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            {/* Header with Search and Create Button */}
            <div className="flex flex-col space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-xl sm:text-2xl font-avenir-bold font-bold text-booking-dark" style={{ fontFamily: 'var(--font-avenir-bold)' }}>Analytics</h1>
                <p className="text-sm sm:text-base font-avenir font-medium tracking-wide text-booking-gray">Property listing overview</p>
              </div>
              <div className="p-1">
                <button
                  onClick={handleShowConfirmedBookings}
                  className="px-3 py-2 sm:px-6 sm:py-3 text-xs sm:text-base font-avenir font-medium tracking-wide text-white rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  style={{ 
                    background: 'linear-gradient(135deg, #00BAB5 0%, #0B1D37 100%)',
                    borderRadius: '0.5rem'
                  }}
                >
                  Confirmed Bookings
                </button>
              </div>
            </div>
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <button 
                  onClick={() => setActiveTab('add-property')}
                  className="w-full sm:w-auto text-white px-6 py-3 sm:px-8 sm:py-4 lg:px-10 lg:py-5 rounded-lg transition-all duration-200 font-avenir font-medium tracking-wide font-bold text-base sm:text-lg lg:text-xl shadow-lg hover:shadow-xl transform hover:scale-105 whitespace-nowrap"
                  style={{ background: 'linear-gradient(to right, #00BAB5, rgba(0, 186, 181, 0.54))' }}
                >
                  Add New Property
                </button>
              </div>
            </div>

            {/* Analytics Tiles */}
            <div className="grid grid-cols-2 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 max-w-4xl mx-auto">
              {/* Listed Properties Analytics */}
              <div className="rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 text-white" style={{ background: 'linear-gradient(to top, #00BAB5, rgba(0, 186, 181, 0.54))' }}>
                <div className="flex items-center justify-between mb-2 sm:mb-3 lg:mb-4">
                  <h3 className="text-sm sm:text-base lg:text-lg font-avenir-bold font-semibold">Listed Properties</h3>
                  <div className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 lg:w-4 lg:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2">{listedProperties.length}</div>
                <div className="text-xs sm:text-sm font-avenir font-medium tracking-wide opacity-90 mb-2 sm:mb-3 lg:mb-4">Currently available for booking</div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 text-xs sm:text-sm font-avenir font-medium tracking-wide">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <span>Active: {listedProperties.length}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-white bg-opacity-60 rounded-full"></div>
                    <span>Ready: {listedProperties.length}</span>
                  </div>
                </div>
              </div>

              {/* Delisted Properties Analytics */}
              <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-2 sm:mb-3 lg:mb-4">
                  <h3 className="text-sm sm:text-base lg:text-lg font-avenir-bold font-semibold text-booking-dark">Delisted Properties</h3>
                  <div className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 lg:w-4 lg:h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-booking-dark mb-1 sm:mb-2">{delistedProperties.length}</div>
                <div className="text-xs sm:text-sm font-avenir font-medium tracking-wide text-booking-gray mb-2 sm:mb-3 lg:mb-4">Currently unavailable</div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2 sm:mb-3 lg:mb-4">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{width: `${Math.min((delistedProperties.length / 10) * 100, 100)}%`}}></div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0 text-xs sm:text-sm font-avenir font-medium tracking-wide text-booking-gray">
                  <span>This week: {delistedProperties.length}</span>
                  <span>+{Math.floor(Math.random() * 5)}% from last week</span>
                </div>
              </div>
            </div>

            {/* Activity Lists */}
            <div className="space-y-4">
                <div className="flex flex-col gap-4">
                  <h3 className="text-base sm:text-lg font-avenir-bold font-semibold text-booking-dark">Property Activity</h3>
                  <div className="flex space-x-1">
              <button
                      onClick={() => setActivityTab('listed')}
                      className={`px-3 py-1 text-xs sm:text-sm font-avenir font-medium tracking-wide rounded-lg transition-all duration-200 ${
                        activityTab === 'listed'
                          ? 'text-booking-teal border-b-2 border-booking-teal bg-booking-bg'
                          : 'text-booking-gray hover:text-booking-dark'
                      }`}
                    >
                      Listed
              </button>
              <button
                      onClick={() => setActivityTab('delisted')}
                      className={`px-3 py-1 text-xs sm:text-sm font-avenir font-medium tracking-wide rounded-lg transition-all duration-200 ${
                        activityTab === 'delisted'
                          ? 'text-booking-teal border-b-2 border-booking-teal bg-booking-bg'
                          : 'text-booking-gray hover:text-booking-dark'
                      }`}
                    >
                      Delisted
              </button>
                  </div>
            </div>

              {/* Search Bar and Filters for Property Activity */}
              <div className="flex flex-col gap-4">
                <div className="w-full sm:flex-1 sm:max-w-md">
                  {/* Multi-Select Filter Dropdown */}
                  <div className="flex flex-col gap-2 sm:gap-4">
                    {/* Filter Type Multi-Select Dropdown */}
                    <div className="relative filter-dropdown-container">
                      <button
                        onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                        className="w-full sm:w-28 md:w-32 lg:w-36 px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent bg-white flex items-center justify-between gap-1.5 font-avenir"
                        style={{ fontSize: '11px' }}
                      >
                        <svg className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                        <span className="flex-1 text-left">
                          {selectedFilters.size === 1 && selectedFilters.has('search') ? 'Search All' :
                           selectedFilters.size === 1 && selectedFilters.has('postcode') ? 'Postcode' :
                           selectedFilters.size === 1 && selectedFilters.has('property_type') ? 'Property Type' :
                           selectedFilters.size === 1 && selectedFilters.has('parking_type') ? 'Parking Type' :
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
                              { value: 'property_type', label: 'Filter by Property Type' },
                              { value: 'parking_type', label: 'Filter by Parking Type' }
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
                                <span className="text-xs font-avenir" style={{ fontSize: '11px' }}>{option.label}</span>
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
                            placeholder="Search properties..."
                            value={filterValues.search}
                            onChange={(e) => setFilterValues(prev => ({ ...prev, search: e.target.value }))}
                            className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent font-avenir"
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
                            className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent font-avenir"
                          />
                          <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                      )}
                      
                      {selectedFilters.has('property_type') && (
                        <div className="relative">
                          <select
                            value={filterValues.property_type}
                            onChange={(e) => setFilterValues(prev => ({ ...prev, property_type: e.target.value }))}
                            className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent font-avenir"
                          >
                            <option value="">Select Property Type</option>
                            <option value="Apartment">Apartment</option>
                            <option value="House">House</option>
                            <option value="Studio">Studio</option>
                            <option value="Townhouse">Townhouse</option>
                            <option value="Condo">Condo</option>
                            <option value="Villa">Villa</option>
                          </select>
                          <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      )}
                      
                      {selectedFilters.has('parking_type') && (
                        <div className="relative">
                          <select
                            value={filterValues.parking_type}
                            onChange={(e) => setFilterValues(prev => ({ ...prev, parking_type: e.target.value }))}
                            className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent font-avenir"
                          >
                            <option value="">Select parking type</option>
                            <option value="Driveway">Driveway</option>
                            <option value="Off-Street">Off-Street</option>
                            <option value="Secure Bay">Secure Bay</option>
                            <option value="On-Street">On-Street</option>
                          </select>
                          <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

                {/* Properties List */}
                <div className="space-y-4">
                  {(activityTab === 'listed' ? listedProperties : delistedProperties).length > 0 ? (
                    (activityTab === 'listed' ? listedProperties : delistedProperties).map((property) => (
                      <div key={property.id} className="flex items-center justify-between py-2 sm:py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                          {/* Property Photo */}
                          {property.photos && property.photos.length > 0 ? (
                            <img 
                              src={property.photos[0]} 
                              alt={property.property_name || 'Property photo'}
                              className="w-12 h-12 sm:w-14 sm:h-14 object-cover rounded-lg flex-shrink-0"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-avenir font-medium rounded flex-shrink-0">
                                {property.id}
                              </span>
                              <h4 className="text-sm sm:text-base font-avenir font-bold text-booking-dark truncate">{property.property_name || `${property.property_type} Property`}</h4>
                            </div>
                            <p className="text-xs sm:text-sm font-avenir-regular text-booking-gray truncate">{buildFullAddress(property)}</p>
                            <p className="text-xs sm:text-sm font-avenir-regular text-booking-gray truncate">
                              {property.property_type}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
                          <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-avenir font-medium ${
                            property.activity === 'active'
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`} style={{fontSize: '14px', letterSpacing: '0.5px'}}>
                            {property.activity === 'active' ? 'Active' : 'Inactive'}
                            </span>
                          <div className="relative">
                            <button 
                              onClick={() => setOpenDropdownId(openDropdownId === property.id ? null : property.id)}
                              className="text-booking-gray hover:text-booking-dark p-1"
                            >
                              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                              </svg>
                            </button>
                            {openDropdownId === property.id && (
                              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                                <div className="py-1">
                          <button 
                                    onClick={() => {
                                      handleTogglePropertyStatus(property.id, property.activity || 'inactive');
                                      setOpenDropdownId(null);
                                    }}
                                    className="block w-full text-left px-4 py-2 text-xs sm:text-base font-avenir text-booking-dark hover:bg-gray-100" style={{fontSize: '14px'}}
                                  >
                                    {property.activity === 'active' ? 'Delist' : 'List'}
                          </button>
                          <button 
                                    onClick={() => {
                                      setPropertyToDelete(property.id);
                                      setIsDeletePropertyModalOpen(true);
                                      setOpenDropdownId(null);
                                    }}
                                    className="block w-full text-left px-4 py-2 text-xs sm:text-base font-avenir text-red-600 hover:bg-gray-100" style={{fontSize: '14px'}}
                          >
                            Delete
                          </button>
                        </div>
                              </div>
                            )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                    <div className="bg-white rounded-xl lg:rounded-2xl p-8 lg:p-12 text-center shadow-lg border border-gray-100">
                  <div className="w-12 h-12 lg:w-16 lg:h-16 bg-booking-bg rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 lg:w-8 lg:h-8 text-booking-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h3 className="text-base lg:text-lg font-avenir font-semibold text-booking-dark mb-2">
                        No {activityTab === 'listed' ? 'Listed' : 'Delisted'} Properties
                  </h3>
                  <p className="text-sm lg:text-base font-avenir font-medium tracking-wide text-booking-gray">
                        You don't have any {activityTab === 'listed' ? 'listed' : 'delisted'} properties at the moment.
                  </p>
                </div>
              )}
                </div>
            </div>
          </div>
        );

      case 'add-property':
        return (
          <div className="space-y-4 lg:space-y-6">
            <div>
              <h2 className="font-avenir-bold text-booking-dark mb-1 sm:mb-2 text-xl sm:text-2xl" style={{ fontFamily: 'var(--font-avenir-bold)' }}>Add New Property</h2>
              <p className="text-booking-gray text-sm lg:text-[20px]" style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500 }}>Create a new property listing</p>
            </div>

            <div className="bg-white rounded-xl lg:rounded-2xl p-6 lg:p-8 shadow-lg border border-gray-100">
              <div className="text-center">
                <div className="w-12 h-12 lg:w-16 lg:h-16 bg-booking-bg rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 lg:w-8 lg:h-8 text-booking-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h3 className="font-avenir-bold text-booking-dark mb-1 sm:mb-2 text-[18px] sm:text-[22px]" style={{ fontFamily: 'var(--font-avenir-bold)' }}>Create Property Listing</h3>
                <p className="text-booking-gray mb-6 text-sm sm:text-base" style={{ fontFamily: 'var(--font-avenir)', fontWeight: 500 }}>Add a new property to start receiving bookings.</p>
                <button 
                  onClick={() => setIsAddPropertyModalOpen(true)}
                  className="w-full sm:w-auto text-white px-6 py-3 sm:px-8 sm:py-4 lg:px-10 lg:py-5 rounded-lg transition-all duration-200 font-avenir font-medium tracking-wide font-bold text-base sm:text-lg lg:text-xl shadow-lg hover:shadow-xl transform hover:scale-105 whitespace-nowrap"
                  style={{ background: 'linear-gradient(to right, #00BAB5, rgba(0, 186, 181, 0.54))' }}
                  >
                  Add New Property
                </button>
              </div>
            </div>
          </div>
        );

      case 'my-properties':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-avenir-bold font-bold text-booking-dark">All My Properties</h2>
              <p className="text-sm sm:text-base font-avenir font-medium tracking-wide text-booking-gray">Manage all your property listings</p>
            </div>

            {properties.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
                {properties.map((property) => (
                  <div 
                    key={property.id} 
                    className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300 cursor-pointer"
                    onClick={() => handlePropertyClick(property)}
                  >
                    {/* Property Image */}
                    <div className="relative h-24 sm:h-48 w-11/12 sm:w-full p-1 sm:p-3 mx-auto sm:mx-0 mt-2 sm:mt-0">
                      {property.photos && property.photos.length > 0 ? (
                        <img 
                          src={property.photos[0]} 
                          alt={property.property_name || 'Property photo'}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                            if (nextElement) {
                              nextElement.style.display = 'flex';
                            }
                          }}
                        />
                      ) : null}
                      <div className={`absolute inset-1 sm:inset-3 bg-gray-100 flex items-center justify-center ${property.photos && property.photos.length > 0 ? 'hidden' : 'flex'}`}>
                        <svg className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      
                      {/* Status Badge */}
                      <div className="absolute top-1 right-1 sm:top-6 sm:right-6">
                        <span className={`px-2 py-1 rounded-full text-[10px] lg:text-lg font-avenir font-medium ${
                          property.activity === 'active'
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`} style={{fontSize: '14px', letterSpacing: '0.5px'}}>
                          {property.activity === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>

                    {/* Property Details */}
                    <div className="p-3 sm:p-4">
                      <div className="flex items-center gap-2 mb-2 sm:mb-2">
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] sm:text-xs font-avenir font-medium rounded flex-shrink-0">
                          {property.id}
                        </span>
                        <h3 className="text-sm sm:text-xl lg:text-lg font-avenir-bold font-bold text-booking-dark line-clamp-1">
                          {property.property_name}
                        </h3>
                      </div>
                      
                      <p className="text-xs sm:text-base lg:text-sm font-avenir-regular text-booking-gray mb-2 sm:mb-3 line-clamp-2">
                        {buildFullAddress(property)}
                      </p>

                      <div className="flex items-center justify-between mb-2 sm:mb-3">
                        <span className="text-xs sm:text-base lg:text-sm font-avenir-regular text-booking-gray capitalize">
                          {property.property_type}
                        </span>
                      </div>

                      {/* Property Details - Beds, Bedrooms, Bathrooms */}
                      <div className="flex items-center justify-between space-x-1 sm:space-x-4 mb-2">
                        <div className="text-center flex-1">
                          <div className="text-sm sm:text-lg lg:text-xl font-avenir-bold font-bold text-booking-dark">{property.beds || 0}</div>
                          <div className="text-[10px] sm:text-sm lg:text-xs font-avenir-regular text-booking-gray">Beds</div>
                        </div>
                        <div className="text-center flex-1">
                          <div className="text-sm sm:text-lg lg:text-xl font-avenir-bold font-bold text-booking-dark">{property.bedrooms || 0}</div>
                          <div className="text-[10px] sm:text-sm lg:text-xs font-avenir-regular text-booking-gray">Bedrooms</div>
                        </div>
                        <div className="text-center flex-1">
                          <div className="text-sm sm:text-lg lg:text-xl font-avenir-bold font-bold text-booking-dark">{property.bathrooms || 0}</div>
                          <div className="text-[10px] sm:text-sm lg:text-xs font-avenir-regular text-booking-gray">Bathrooms</div>
                        </div>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-booking-bg rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-booking-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-booking-dark mb-2">No Properties</h3>
                  <p className="text-booking-gray">You haven't added any properties yet.</p>
                </div>
              </div>
            )}
          </div>
        );

      case 'contact-info':
        return (
          <div className="space-y-4 sm:space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-avenir-bold font-bold text-booking-dark">Contact Information</h2>
              <p className="text-sm sm:text-base font-avenir font-medium tracking-wide text-booking-gray">Manage your contact details and preferences</p>
            </div>

            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg border border-gray-100">
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <input 
                    type="text" 
                    value={partnerFullName} 
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base font-avenir-regular border border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent"
                    readOnly
                  />
                </div>
                <div>
                  <input 
                    type="email" 
                    value={displayUser?.email || ''} 
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base font-avenir-regular border border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent"
                    readOnly
                  />
                </div>
                <div>
                  <input 
                    type="tel" 
                    value={contactInfo.phone}
                    onChange={(e) => setContactInfo(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Enter phone number"
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base font-avenir-regular border border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent"
                  />
                </div>
                <div>
                  <input 
                    type="text" 
                    value={contactInfo.company_name}
                    onChange={(e) => setContactInfo(prev => ({ ...prev, company_name: e.target.value }))}
                    placeholder="Enter company name"
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base font-avenir-regular border border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent"
                  />
                </div>
                <div>
                  <input 
                    type="email" 
                    value={contactInfo.company_email}
                    onChange={(e) => setContactInfo(prev => ({ ...prev, company_email: e.target.value }))}
                    placeholder="Enter company email"
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base font-avenir-regular border border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent"
                  />
                </div>
                <div>
                  <textarea 
                    value={contactInfo.company_address}
                    onChange={(e) => setContactInfo(prev => ({ ...prev, company_address: e.target.value }))}
                    placeholder="Enter company address"
                    rows={3}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base font-avenir-regular border border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-booking-dark mb-2">Role</label>
                  <input 
                    type="text" 
                    value="Partner" 
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base font-avenir-regular border border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent"
                    readOnly
                  />
                </div>
                <div className="pt-3 sm:pt-4">
                  <button 
                    onClick={handleContactInfoUpdate}
                    className="w-full sm:w-auto bg-booking-teal text-white px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-avenir-regular rounded-lg sm:rounded-xl hover:bg-opacity-90 transition-all duration-200 font-medium"
                  >
                    Update Information
                  </button>
                </div>

                {/* Success Message - Bottom */}
                {updateSuccess && (
                  <div className="mt-4 rounded-xl bg-green-50 border border-green-200 p-3 sm:p-4">
                    <div className="text-xs sm:text-sm font-avenir-regular text-green-800">
                      Information updated successfully
                    </div>
                  </div>
                )}

                {/* Error Message - Bottom */}
                {updateError && (
                  <div className="mt-4 rounded-xl bg-red-50 border border-red-200 p-3 sm:p-4">
                    <div className="text-xs sm:text-sm font-avenir-regular text-red-800">{updateError}</div>
                  </div>
                )}
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
      <div className="lg:hidden bg-booking-dark text-white p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img 
            src="/white-teal.webp" 
            alt="Booking Hub Logo" 
            className="h-8 w-auto object-contain py-1"
            style={{ maxWidth: '100%' }}
          />
          <div>
            <p className="text-xl font-avenir tracking-wide font-bold text-white">Partner Portal</p>
          </div>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
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
                  <p className="text-lg font-avenir tracking-wide font-bold text-white">Partner Portal</p>
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
                  <span className="text-sm font-avenir font-medium tracking-wide">Dashboard</span>
                  {activeTab === 'dashboard' && <div className="w-1 h-1 bg-booking-teal rounded-full ml-auto"></div>}
                </div>
              </button>

              <button
                onClick={() => { setActiveTab('my-properties'); setIsMobileMenuOpen(false); }}
                className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 ${
                  activeTab === 'my-properties'
                    ? 'bg-white text-booking-dark'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span className="text-sm font-avenir font-medium tracking-wide">My Properties</span>
                  {activeTab === 'my-properties' && <div className="w-1 h-1 bg-booking-teal rounded-full ml-auto"></div>}
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
                  <span className="text-sm font-avenir font-medium tracking-wide">Contact Information</span>
                  {activeTab === 'contact-info' && <div className="w-1 h-1 bg-booking-teal rounded-full ml-auto"></div>}
                </div>
              </button>
            </nav>

            {/* Mobile Profile Section */}
            <div className="p-4 mt-auto">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-booking-teal rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {partnerName ? partnerName.charAt(0).toUpperCase() : 'P'}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-avenir font-medium tracking-wide text-white">{partnerName || 'Partner'}</p>
                  <p className="text-xs font-avenir tracking-wide text-gray-300">Partner</p>
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
                  <span className="text-sm font-avenir font-medium tracking-wide">Logout</span>
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
            <p className="text-lg font-avenir tracking-wide font-bold text-white">Partner Portal</p>
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
            onClick={() => setActiveTab('my-properties')}
            className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 ${
              activeTab === 'my-properties'
                ? 'bg-white text-booking-dark'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            <div className="flex items-center space-x-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span className="text-sm lg:text-base font-medium">My Properties</span>
              {activeTab === 'my-properties' && <div className="w-1 h-1 bg-booking-teal rounded-full ml-auto"></div>}
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
                {partnerName ? partnerName.charAt(0).toUpperCase() : 'P'}
              </span>
            </div>
            <div>
              <p className="text-sm lg:text-base font-avenir font-medium tracking-wide text-white">{partnerName || 'Partner'}</p>
              <p className="text-xs lg:text-sm font-avenir tracking-wide text-gray-300">Partner</p>
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
              <span className="text-sm lg:text-base font-avenir font-medium tracking-wide">Logout</span>
            </div>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 lg:p-8 overflow-y-auto overflow-x-hidden">
        {renderMainContent()}
      </div>

      {/* Add Property Modal */}
      <AddPropertyModal
        isOpen={isAddPropertyModalOpen}
        onClose={() => setIsAddPropertyModalOpen(false)}
        onSubmit={handleAddProperty}
      />

      {/* Property Details Modal */}
      <PropertyDetailsModal
        isOpen={isPropertyDetailsModalOpen}
        onClose={() => {
          setIsPropertyDetailsModalOpen(false);
          setSelectedProperty(null);
        }}
        property={selectedProperty}
        onPropertyUpdate={fetchData}
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

      {/* Delete Property Confirmation Modal */}
      {isDeletePropertyModalOpen && (
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
              onClick={() => {
                setIsDeletePropertyModalOpen(false);
                setPropertyToDelete(null);
              }}
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
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
              </div>

              {/* Text Content */}
              <p className="text-gray-900 font-avenir-bold font-bold text-lg leading-relaxed text-center mb-5">
                Are you sure you want to delete this property?
              </p>

              {/* Action Buttons - Side by Side */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setIsDeletePropertyModalOpen(false);
                    setPropertyToDelete(null);
                  }}
                  className="px-6 py-2.5 rounded-xl font-avenir font-semibold text-gray-700 text-sm tracking-wide bg-gray-100 hover:bg-gray-200 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (propertyToDelete) {
                      handleDeleteProperty(propertyToDelete);
                      setIsDeletePropertyModalOpen(false);
                      setPropertyToDelete(null);
                    }
                  }}
                  className="px-6 py-2.5 rounded-xl font-avenir font-semibold text-white text-sm tracking-wide transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
                  style={{
                    background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                    boxShadow: '0 4px 14px -2px rgba(239, 68, 68, 0.4)'
                  }}
                >
                  Yes, Delete
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
