'use client';

import { useState } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';

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
  
  
  // Status and metadata
  is_available: boolean;
  activity?: string;
  created_at: string;
  updated_at: string;
}

interface PropertyDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: Property | null;
  onPropertyUpdate?: () => void;
}

export default function PropertyDetailsModal({ isOpen, onClose, property, onPropertyUpdate }: PropertyDetailsModalProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedProperty, setEditedProperty] = useState<Property | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen || !property) return null;

  // Helper function to build full address from components
  const buildFullAddress = (prop: Property) => {
    const addressParts = [
      prop.house_address,
      prop.locality,
      prop.city,
      prop.county,
      prop.country
    ].filter(part => part && part.trim() !== ''); // Filter out null, undefined, or empty strings
    
    return addressParts.join(', ');
  };

  // Initialize edited property when entering edit mode
  const handleEditClick = () => {
    setEditedProperty({ 
      ...property,
      // Ensure required address fields have default values
      city: property.city || '',
      country: property.country || '',
      locality: property.locality || '',
      county: property.county || ''
    });
    setIsEditMode(true);
  };

  // Handle input changes
  const handleInputChange = (field: keyof Property, value: any) => {
    if (editedProperty) {
      setEditedProperty({
        ...editedProperty,
        [field]: value
      });
    }
  };

  // Save changes to database
  const handleSave = async () => {
    if (!editedProperty) return;

    setIsSaving(true);
    try {
      // Log the data we're about to send
      console.log('Attempting to update property with data:', {
        id: editedProperty.id,
        city: editedProperty.city,
        country: editedProperty.country,
        locality: editedProperty.locality,
        county: editedProperty.county
      });

      const { data, error } = await supabase
        .from('properties')
        .update({
          property_name: editedProperty.property_name,
          house_address: editedProperty.house_address,
          locality: editedProperty.locality || null,
          city: editedProperty.city || '',
          county: editedProperty.county || null,
          country: editedProperty.country || '',
          postcode: editedProperty.postcode,
          property_type: editedProperty.property_type,
          bedrooms: editedProperty.bedrooms,
          beds: editedProperty.beds,
          beds_breakdown: editedProperty.beds_breakdown,
          bathrooms: editedProperty.bathrooms,
          max_occupancy: editedProperty.max_occupancy,
          parking_type: editedProperty.parking_type,
          workspace_desk: editedProperty.workspace_desk,
          high_speed_wifi: editedProperty.high_speed_wifi,
          smart_tv: editedProperty.smart_tv,
          fully_equipped_kitchen: editedProperty.fully_equipped_kitchen,
          living_dining_space: editedProperty.living_dining_space,
          washing_machine: editedProperty.washing_machine,
          iron_ironing_board: editedProperty.iron_ironing_board,
          linen_towels_provided: editedProperty.linen_towels_provided,
          consumables_provided: editedProperty.consumables_provided,
          smoke_alarm: editedProperty.smoke_alarm,
          co_alarm: editedProperty.co_alarm,
          fire_extinguisher_blanket: editedProperty.fire_extinguisher_blanket,
          epc: editedProperty.epc,
          gas_safety_certificate: editedProperty.gas_safety_certificate,
          eicr: editedProperty.eicr,
          additional_info: editedProperty.additional_info,
          is_available: editedProperty.is_available,
          updated_at: new Date().toISOString()
        })
        .eq('id', editedProperty.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating property:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        alert(`Failed to update property: ${error.message || 'Please try again.'}`);
        return;
      }

      // Show success message
      setSaveSuccess(true);
      
      // Update the editedProperty with the saved data so it displays immediately
      if (data) {
        setEditedProperty(data);
      }
      
      setIsEditMode(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
      
      if (onPropertyUpdate) {
        onPropertyUpdate();
      }
    } catch (error) {
      console.error('Error updating property:', error);
      alert('Failed to update property. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Cancel editing
  const handleCancel = () => {
    setIsEditMode(false);
    setEditedProperty(null);
    setSaveSuccess(false);
  };

  // Use edited property if it exists (after save), otherwise use original property
  const displayProperty = editedProperty || property;

  const amenities = [
    { key: 'workspace_desk', label: 'Workspace / Desk' },
    { key: 'high_speed_wifi', label: 'High-Speed Wi-Fi' },
    { key: 'smart_tv', label: 'Smart TV(s)' },
    { key: 'fully_equipped_kitchen', label: 'Fully Equipped Kitchen' },
    { key: 'living_dining_space', label: 'Living/Dining Space' },
    { key: 'washing_machine', label: 'Washing Machine' },
    { key: 'iron_ironing_board', label: 'Iron & Ironing Board' },
    { key: 'linen_towels_provided', label: 'Linen & Towels Provided' },
    { key: 'consumables_provided', label: 'Consumables Provided' },
  ];

  const safetyCompliance = [
    { key: 'smoke_alarm', label: 'Smoke Alarm' },
    { key: 'co_alarm', label: 'CO Alarm' },
    { key: 'fire_extinguisher_blanket', label: 'Fire Extinguisher / Fire Blanket' },
    { key: 'epc', label: 'EPC' },
    { key: 'gas_safety_certificate', label: 'Gas Safety Certificate' },
    { key: 'eicr', label: 'EICR' },
  ];

  const handleClose = () => {
    setCurrentPhotoIndex(0);
    setIsEditMode(false);
    setEditedProperty(null);
    setSaveSuccess(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-y-auto sm:max-w-6xl max-w-xs max-h-[70vh] sm:max-h-[95vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="py-1">
              <Image
                src="/blue-teal.webp"
                alt="Booking Hub Logo"
                width={120}
                height={30}
                className="h-6 sm:h-12 w-auto object-contain"
                style={{ maxWidth: '100%' }}
              />
            </div>
            <div>
              <h2 className="text-xs sm:text-xl font-avenir-bold font-bold text-booking-dark">{displayProperty.property_name}</h2>
              <p className="text-[10px] sm:text-sm font-avenir-regular text-booking-gray">{displayProperty.property_type}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {!isEditMode && (
              <button
                onClick={handleEditClick}
                className="px-3 sm:px-4 py-1 sm:py-2 bg-booking-teal text-white text-xs sm:text-sm font-avenir-regular font-medium rounded-lg hover:bg-opacity-90 transition-all duration-200 flex items-center space-x-1 sm:space-x-2"
              >
                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>Edit</span>
              </button>
            )}
            <button
              onClick={handleClose}
              className="p-1 sm:p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg className="w-4 h-4 sm:w-6 sm:h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-3 sm:space-y-8">
          {/* Property Photos */}
          {property.photos && property.photos.length > 0 && (
            <div>
              <h3 className="text-sm sm:text-lg font-avenir-bold font-semibold text-booking-dark mb-2 sm:mb-4">Property Photos</h3>
              <div className="relative max-w-[200px] sm:max-w-md mx-auto">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={property.photos[currentPhotoIndex]}
                    alt={`Property photo ${currentPhotoIndex + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
                
                {/* Navigation Arrows */}
                {property.photos.length > 1 && (
                  <>
                    {/* Previous Arrow */}
                    <button
                      onClick={() => setCurrentPhotoIndex(prev => 
                        prev === 0 ? property.photos!.length - 1 : prev - 1
                      )}
                      className="absolute left-1 sm:left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 sm:w-10 sm:h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-all duration-200"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    
                    {/* Next Arrow */}
                    <button
                      onClick={() => setCurrentPhotoIndex(prev => 
                        prev === property.photos!.length - 1 ? 0 : prev + 1
                      )}
                      className="absolute right-1 sm:right-4 top-1/2 transform -translate-y-1/2 w-6 h-6 sm:w-10 sm:h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-all duration-200"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                )}
                
                {/* Photo Counter */}
                {property.photos.length > 1 && (
                  <div className="absolute bottom-1 sm:bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-1 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-sm">
                    {currentPhotoIndex + 1} / {property.photos.length}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Basic Details */}
          <div>
            <h3 className="text-sm sm:text-lg font-avenir-bold font-semibold text-booking-dark mb-2 sm:mb-4">Basic Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6">
              <div>
                <label className="block text-xs sm:text-xs sm:text-sm font-avenir-bold font-medium text-booking-gray mb-1">Property Name</label>
                {isEditMode ? (
                  <input
                    type="text"
                    value={displayProperty.property_name}
                    onChange={(e) => handleInputChange('property_name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-base font-avenir-regular focus:outline-none focus:ring-2 focus:ring-booking-teal"
                  />
                ) : (
                  <p className="text-xs sm:text-base font-avenir-regular text-booking-dark font-medium">{displayProperty.property_name}</p>
                )}
              </div>
              <div>
                <label className="block text-xs sm:text-xs sm:text-sm font-avenir-bold font-medium text-booking-gray mb-1">Property Type</label>
                {isEditMode ? (
                  <select
                    value={displayProperty.property_type}
                    onChange={(e) => handleInputChange('property_type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-base font-avenir-regular focus:outline-none focus:ring-2 focus:ring-booking-teal"
                  >
                    <option value="House">House</option>
                    <option value="Flat">Flat</option>
                    <option value="Apartment">Apartment</option>
                    <option value="Townhouse">Townhouse</option>
                    <option value="Other">Other</option>
                  </select>
                ) : (
                  <p className="text-xs sm:text-base font-avenir-regular text-booking-dark font-medium">{displayProperty.property_type}</p>
                )}
              </div>
              {/* Full Address - View Mode shows combined, Edit Mode shows individual fields */}
              {isEditMode ? (
                <>
                  {/* House Address */}
                  <div className="md:col-span-2">
                    <label className="block text-xs sm:text-xs sm:text-sm font-avenir-bold font-medium text-booking-gray mb-1">House Address</label>
                    <textarea
                      value={displayProperty.house_address}
                      onChange={(e) => handleInputChange('house_address', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-base font-avenir-regular focus:outline-none focus:ring-2 focus:ring-booking-teal"
                      placeholder="Enter house address"
                    />
                  </div>

                  {/* Locality/District */}
                  <div>
                    <label className="block text-xs sm:text-xs sm:text-sm font-avenir-bold font-medium text-booking-gray mb-1">Locality/District</label>
                    <input
                      type="text"
                      value={displayProperty.locality || ''}
                      onChange={(e) => handleInputChange('locality', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-base font-avenir-regular focus:outline-none focus:ring-2 focus:ring-booking-teal"
                      placeholder="e.g., Westminster"
                    />
                  </div>

                  {/* City */}
                  <div>
                    <label className="block text-xs sm:text-xs sm:text-sm font-avenir-bold font-medium text-booking-gray mb-1">City</label>
                    <input
                      type="text"
                      value={displayProperty.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-base font-avenir-regular focus:outline-none focus:ring-2 focus:ring-booking-teal"
                      placeholder="e.g., London"
                    />
                  </div>

                  {/* County */}
                  <div>
                    <label className="block text-xs sm:text-xs sm:text-sm font-avenir-bold font-medium text-booking-gray mb-1">County</label>
                    <input
                      type="text"
                      value={displayProperty.county || ''}
                      onChange={(e) => handleInputChange('county', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-base font-avenir-regular focus:outline-none focus:ring-2 focus:ring-booking-teal"
                      placeholder="e.g., Greater London"
                    />
                  </div>

                  {/* Country */}
                  <div>
                    <label className="block text-xs sm:text-xs sm:text-sm font-avenir-bold font-medium text-booking-gray mb-1">Country</label>
                    <input
                      type="text"
                      value={displayProperty.country}
                      onChange={(e) => handleInputChange('country', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-base font-avenir-regular focus:outline-none focus:ring-2 focus:ring-booking-teal"
                      placeholder="e.g., United Kingdom"
                    />
                  </div>

                  {/* Postcode */}
                  <div>
                    <label className="block text-xs sm:text-xs sm:text-sm font-avenir-bold font-medium text-booking-gray mb-1">Postcode</label>
                    <input
                      type="text"
                      value={displayProperty.postcode}
                      onChange={(e) => handleInputChange('postcode', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-base font-avenir-regular focus:outline-none focus:ring-2 focus:ring-booking-teal"
                      placeholder="e.g., SW1A 1AA"
                    />
                  </div>
                </>
              ) : (
                <>
                  {/* Full Address - View Mode */}
                  <div className="md:col-span-2">
                    <label className="block text-xs sm:text-xs sm:text-sm font-avenir-bold font-medium text-booking-gray mb-1">Full Address</label>
                    <p className="text-xs sm:text-base font-avenir-regular text-booking-dark font-medium">{buildFullAddress(displayProperty)}</p>
                  </div>
                  
                  {/* Postcode - View Mode */}
                  <div>
                    <label className="block text-xs sm:text-xs sm:text-sm font-avenir-bold font-medium text-booking-gray mb-1">Postcode</label>
                    <p className="text-xs sm:text-base font-avenir-regular text-booking-dark font-medium">{displayProperty.postcode}</p>
                  </div>
                </>
              )}
              <div>
                <label className="block text-xs sm:text-xs sm:text-sm font-avenir-bold font-medium text-booking-gray mb-1">Parking Type</label>
                {isEditMode ? (
                  <input
                    type="text"
                    value={displayProperty.parking_type || ''}
                    onChange={(e) => handleInputChange('parking_type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-base font-avenir-regular focus:outline-none focus:ring-2 focus:ring-booking-teal"
                    placeholder="e.g., Street parking, Garage"
                  />
                ) : (
                  <p className="text-xs sm:text-base font-avenir-regular text-booking-dark font-medium">{displayProperty.parking_type || 'Not specified'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Property Specifications */}
          <div>
            <h3 className="text-sm sm:text-lg font-avenir-bold font-semibold text-booking-dark mb-2 sm:mb-4">Property Specifications</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
              <div className="text-center p-2 sm:p-4 bg-gray-50 rounded-lg">
                {isEditMode ? (
                  <input
                    type="number"
                    value={displayProperty.bedrooms}
                    onChange={(e) => handleInputChange('bedrooms', parseInt(e.target.value) || 0)}
                    className="w-full text-center text-lg sm:text-2xl font-avenir-regular font-bold text-booking-teal bg-transparent border-b-2 border-booking-teal focus:outline-none"
                    min="0"
                  />
                ) : (
                  <div className="text-lg sm:text-2xl font-avenir-regular font-bold text-booking-teal">{displayProperty.bedrooms}</div>
                )}
                <div className="text-xs sm:text-sm font-avenir-regular text-booking-gray">Bedrooms</div>
              </div>
              <div className="text-center p-2 sm:p-4 bg-gray-50 rounded-lg">
                {isEditMode ? (
                  <input
                    type="number"
                    value={displayProperty.beds}
                    onChange={(e) => handleInputChange('beds', parseInt(e.target.value) || 0)}
                    className="w-full text-center text-lg sm:text-2xl font-avenir-regular font-bold text-booking-teal bg-transparent border-b-2 border-booking-teal focus:outline-none"
                    min="0"
                  />
                ) : (
                  <div className="text-lg sm:text-2xl font-avenir-regular font-bold text-booking-teal">{displayProperty.beds}</div>
                )}
                <div className="text-xs sm:text-sm font-avenir-regular text-booking-gray">Beds</div>
              </div>
              <div className="text-center p-2 sm:p-4 bg-gray-50 rounded-lg">
                {isEditMode ? (
                  <input
                    type="number"
                    value={displayProperty.bathrooms}
                    onChange={(e) => handleInputChange('bathrooms', parseInt(e.target.value) || 0)}
                    className="w-full text-center text-lg sm:text-2xl font-avenir-regular font-bold text-booking-teal bg-transparent border-b-2 border-booking-teal focus:outline-none"
                    min="0"
                  />
                ) : (
                  <div className="text-lg sm:text-2xl font-avenir-regular font-bold text-booking-teal">{displayProperty.bathrooms}</div>
                )}
                <div className="text-xs sm:text-sm font-avenir-regular text-booking-gray">Bathrooms</div>
              </div>
              <div className="text-center p-2 sm:p-4 bg-gray-50 rounded-lg">
                {isEditMode ? (
                  <input
                    type="number"
                    value={displayProperty.max_occupancy}
                    onChange={(e) => handleInputChange('max_occupancy', parseInt(e.target.value) || 0)}
                    className="w-full text-center text-lg sm:text-2xl font-avenir-regular font-bold text-booking-teal bg-transparent border-b-2 border-booking-teal focus:outline-none"
                    min="0"
                  />
                ) : (
                  <div className="text-lg sm:text-2xl font-avenir-regular font-bold text-booking-teal">{displayProperty.max_occupancy}</div>
                )}
                <div className="text-xs sm:text-sm font-avenir-regular text-booking-gray">Max Occupancy</div>
              </div>
            </div>
            {(displayProperty.beds_breakdown || isEditMode) && (
              <div className="mt-2 sm:mt-4">
                <label className="block text-xs sm:text-xs sm:text-sm font-avenir-bold font-medium text-booking-gray mb-1">Beds Breakdown</label>
                {isEditMode ? (
                  <input
                    type="text"
                    value={displayProperty.beds_breakdown || ''}
                    onChange={(e) => handleInputChange('beds_breakdown', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-base font-avenir-regular focus:outline-none focus:ring-2 focus:ring-booking-teal"
                    placeholder="e.g., 2 Queen beds, 1 Single bed"
                  />
                ) : (
                  <p className="text-xs sm:text-base font-avenir-regular text-booking-dark font-medium">{displayProperty.beds_breakdown}</p>
                )}
              </div>
            )}
          </div>

          {/* Amenities */}
          <div>
            <h3 className="text-sm sm:text-lg font-avenir-bold font-semibold text-booking-dark mb-2 sm:mb-4">Amenities</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
              {amenities.map(({ key, label }) => (
                <div key={key} className={`flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 bg-gray-50 rounded-lg ${isEditMode ? 'cursor-pointer hover:bg-gray-100' : ''}`}
                  onClick={() => isEditMode && handleInputChange(key as keyof Property, !displayProperty[key as keyof Property])}
                >
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                    displayProperty[key as keyof Property] ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {displayProperty[key as keyof Property] ? (
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <span className={`text-xs sm:text-sm font-avenir-regular font-medium ${
                    displayProperty[key as keyof Property] ? 'text-booking-dark' : 'text-booking-gray'
                  }`}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Safety & Compliance */}
          <div>
            <h3 className="text-sm sm:text-lg font-avenir-bold font-semibold text-booking-dark mb-2 sm:mb-4">Safety & Compliance</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
              {safetyCompliance.map(({ key, label }) => (
                <div key={key} className={`flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 bg-gray-50 rounded-lg ${isEditMode ? 'cursor-pointer hover:bg-gray-100' : ''}`}
                  onClick={() => isEditMode && handleInputChange(key as keyof Property, !displayProperty[key as keyof Property])}
                >
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                    displayProperty[key as keyof Property] ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {displayProperty[key as keyof Property] ? (
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <span className={`text-xs sm:text-sm font-avenir-regular font-medium ${
                    displayProperty[key as keyof Property] ? 'text-booking-dark' : 'text-booking-gray'
                  }`}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>


          {/* Additional Information */}
          {(displayProperty.additional_info || isEditMode) && (
            <div>
              <h3 className="text-sm sm:text-lg font-avenir-bold font-semibold text-booking-dark mb-2 sm:mb-4">Additional Information</h3>
              <div className="p-3 sm:p-4 bg-gray-50 rounded-lg">
                {isEditMode ? (
                  <textarea
                    value={displayProperty.additional_info || ''}
                    onChange={(e) => handleInputChange('additional_info', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-base font-avenir-regular focus:outline-none focus:ring-2 focus:ring-booking-teal min-h-[100px]"
                    placeholder="Enter any additional information about the property..."
                  />
                ) : (
                  <p className="text-xs sm:text-base font-avenir-regular text-booking-dark">{displayProperty.additional_info}</p>
                )}
              </div>
            </div>
          )}

          {/* Status and Metadata */}
          <div>
            <h3 className="text-sm sm:text-lg font-avenir-bold font-semibold text-booking-dark mb-2 sm:mb-4">Status & Metadata</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-6">
              <div>
                <label className="block text-xs sm:text-sm font-avenir-bold font-medium text-booking-gray mb-1">Status</label>
                {isEditMode ? (
                  <select
                    value={displayProperty.is_available ? 'available' : 'unavailable'}
                    onChange={(e) => handleInputChange('is_available', e.target.value === 'available')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-base font-avenir-regular focus:outline-none focus:ring-2 focus:ring-booking-teal"
                  >
                    <option value="available">Available</option>
                    <option value="unavailable">Unavailable</option>
                  </select>
                ) : (
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs sm:text-sm font-avenir-regular font-medium ${
                    displayProperty.is_available 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {displayProperty.is_available ? 'Available' : 'Unavailable'}
                  </span>
                )}
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-avenir-bold font-medium text-booking-gray mb-1">Created</label>
                <p className="text-xs sm:text-base font-avenir-regular text-booking-dark font-medium">
                  {new Date(displayProperty.created_at).toLocaleDateString()}
                </p>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-avenir-bold font-medium text-booking-gray mb-1">Last Updated</label>
                <p className="text-xs sm:text-base font-avenir-regular text-booking-dark font-medium">
                  {new Date(displayProperty.updated_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200">
          {/* Success Message */}
          {saveSuccess && (
            <div className="px-6 pt-4">
              <div className="rounded-xl bg-green-50 border border-green-200 p-3 sm:p-4">
                <div className="text-xs sm:text-sm text-green-800">
                  Property details updated successfully
                </div>
              </div>
            </div>
          )}
          
          <div className="flex justify-end space-x-3 p-6">
            {isEditMode ? (
              <>
                <button
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="px-6 py-3 bg-gray-200 text-gray-700 font-avenir-regular font-medium rounded-lg hover:bg-gray-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-6 py-3 bg-booking-teal text-white font-avenir-regular font-medium rounded-lg hover:bg-opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isSaving ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </>
            ) : (
              <button
                onClick={handleClose}
                className="px-6 py-3 bg-booking-teal text-white font-avenir-regular font-medium rounded-lg hover:bg-opacity-90 transition-all duration-200"
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
