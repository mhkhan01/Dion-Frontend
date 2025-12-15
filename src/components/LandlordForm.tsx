'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function LandlordForm() {
  const [formData, setFormData] = useState({
    fullName: '',
    companyName: '',
    email: '',
    phone: '',
    numberOfProperties: '',
    mainLocations: '',
  });

  const [propertyTypes, setPropertyTypes] = useState({
    houses: false,
    flats: false,
    servicedApartments: false,
    others: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setPropertyTypes(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Convert property types to array format
      const selectedPropertyTypes = Object.entries(propertyTypes)
        .filter(([key, value]) => value)
        .map(([key]) => {
          // Convert form keys to database format
          switch (key) {
            case 'houses': return 'House';
            case 'flats': return 'Flat';
            case 'servicedApartments': return 'Serviced Apartment';
            case 'others': return 'Other';
            default: return key;
          }
        });

      // Save to Supabase landlord_profiles table
      const { data: landlordProfile, error: landlordError } = await supabase
        .from('landlord_profiles')
        .insert({
          full_name: formData.fullName,
          company_name: formData.companyName,
          email: formData.email,
          phone: formData.phone,
          number_of_properties: formData.numberOfProperties ? parseInt(formData.numberOfProperties) : null,
          main_locations: formData.mainLocations,
          property_types: selectedPropertyTypes, // Add property types to main table
          user_id: null // Will be filled when user signs up
        })
        .select()
        .single();

      if (landlordError) {
        console.error('Error saving to Supabase:', landlordError);
        alert('Failed to save landlord profile. Please try again.');
        return;
      }

      // Property types are already saved in the main landlord_profiles table

      console.log('Landlord profile saved successfully');

      // Send data to GHL endpoint
      console.log('Starting GHL call for landlord form...');
      try {
        const ghlData = {
          full_name: formData.fullName,
          company_name: formData.companyName,
          email: formData.email,
          phone: formData.phone,
          number_of_properties: formData.numberOfProperties ? parseInt(formData.numberOfProperties) : null,
          main_locations: formData.mainLocations,
          property_types: selectedPropertyTypes,
          source: 'booking_hub_landlord_form',
          timestamp: new Date().toISOString()
        };

        console.log('Sending landlord data to GHL:', ghlData);
        console.log('Making fetch request to: /api/ghl/landlord-form');

        const ghlResponse = await fetch('/api/ghl/landlord-form', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(ghlData),
        });

        console.log('Fetch request completed. Response received.');

        console.log('GHL Response status:', ghlResponse.status);
        console.log('GHL Response ok:', ghlResponse.ok);

        if (ghlResponse.ok) {
          const ghlResult = await ghlResponse.json();
          console.log('Landlord form data sent to GHL successfully:', ghlResult);
          alert('Form submitted successfully! Data sent to GHL.');
        } else {
          const errorText = await ghlResponse.text();
          console.error('Failed to send landlord form data to GHL:', ghlResponse.status, errorText);
          alert('Form submitted successfully! (GHL integration failed - check console for details)');
        }
      } catch (ghlError) {
        console.error('Error sending landlord form data to GHL:', ghlError);
        alert('Form submitted successfully! (GHL integration failed - check console for details)');
        // Don't block the form submission if GHL fails
      }
      
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('An error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{
      backgroundImage: 'url(/Swansea%20-%201.webp)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }}>
      {/* Background Image Opacity Overlay */}
      <div className="absolute inset-0 bg-[rgba(11,29,52,0.88)] pointer-events-none"></div>


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
        <div className="bg-white/95 backdrop-blur-sm rounded-xl sm:rounded shadow-xl sm:shadow-lg p-4 sm:p-6 lg:p-8 w-full max-w-sm sm:max-w-lg lg:max-w-2xl border border-gray-200/50 sm:border-gray-200">
          {/* Introductory Text */}
          <p className="text-xs sm:text-sm font-extrabold text-orange-300 mb-3 sm:mb-4 text-center pt-2 sm:pt-4 leading-relaxed">
            Join 50+ partners already securing long-term bookings through our platform
          </p>
          
          {/* Form Title */}
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-booking-dark mb-6 sm:mb-8 text-center leading-tight">
            List Your Properties Today!
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-booking-dark mb-2">
                Full Name
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="Full Name"
                className="w-full px-4 py-3 border border-booking-teal rounded focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent"
              />
            </div>

            {/* Company/Business Name */}
            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-booking-dark mb-2">
                Company/Business Name
              </label>
              <input
                type="text"
                id="companyName"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                placeholder="Company/Business Name"
                className="w-full px-4 py-3 border border-booking-teal rounded focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-booking-dark mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Email"
                required
                className="w-full px-4 py-3 border border-booking-teal rounded focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent"
              />
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-booking-dark mb-2">
                Phone <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Phone"
                required
                className="w-full px-4 py-3 border border-booking-teal rounded focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent"
              />
            </div>

            {/* Number of Properties */}
            <div>
              <label htmlFor="numberOfProperties" className="block text-sm font-medium text-booking-dark mb-2">
                Number of Properties
              </label>
              <input
                type="number"
                id="numberOfProperties"
                name="numberOfProperties"
                value={formData.numberOfProperties}
                onChange={handleInputChange}
                placeholder="e.g. 5"
                className="w-full px-4 py-3 border border-booking-teal rounded focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent"
              />
            </div>

            {/* Property Types */}
            <div>
              <label className="block text-sm font-medium text-booking-dark mb-2">
                Property Types
              </label>
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="houses"
                    name="houses"
                    checked={propertyTypes.houses}
                    onChange={handleCheckboxChange}
                    className="w-4 h-4 text-booking-teal bg-gray-100 border-gray-300 rounded focus:ring-booking-teal focus:ring-2"
                  />
                  <label htmlFor="houses" className="ml-2 text-sm font-medium text-booking-dark">
                    Houses
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="flats"
                    name="flats"
                    checked={propertyTypes.flats}
                    onChange={handleCheckboxChange}
                    className="w-4 h-4 text-booking-teal bg-gray-100 border-gray-300 rounded focus:ring-booking-teal focus:ring-2"
                  />
                  <label htmlFor="flats" className="ml-2 text-sm font-medium text-booking-dark">
                    Flats
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="servicedApartments"
                    name="servicedApartments"
                    checked={propertyTypes.servicedApartments}
                    onChange={handleCheckboxChange}
                    className="w-4 h-4 text-booking-teal bg-gray-100 border-gray-300 rounded focus:ring-booking-teal focus:ring-2"
                  />
                  <label htmlFor="servicedApartments" className="ml-2 text-sm font-medium text-booking-dark">
                    Serviced Apartments
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="others"
                    name="others"
                    checked={propertyTypes.others}
                    onChange={handleCheckboxChange}
                    className="w-4 h-4 text-booking-teal bg-gray-100 border-gray-300 rounded focus:ring-booking-teal focus:ring-2"
                  />
                  <label htmlFor="others" className="ml-2 text-sm font-medium text-booking-dark">
                    Other
                  </label>
                </div>
              </div>
            </div>

            {/* Main Locations */}
            <div>
              <label htmlFor="mainLocations" className="block text-sm font-medium text-booking-dark mb-2">
                Main Locations
              </label>
              <input
                type="text"
                id="mainLocations"
                name="mainLocations"
                value={formData.mainLocations}
                onChange={handleInputChange}
                placeholder="List the main areas where your properties are located"
                className="w-full px-4 py-3 border border-booking-teal rounded focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-booking-teal text-white font-bold py-4 px-6 rounded hover:bg-opacity-90 transition-all duration-200 text-lg mb-6"
            >
              Start Getting Bookings
            </button>

            {/* Footer Links */}
            <div className="text-center">
              <p className="text-sm text-booking-gray">
                Privacy Policy | Terms of Service
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
