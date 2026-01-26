'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import CustomSelect from './CustomSelect';

const propertySchema = z.object({
  // Basic Details
  propertyName: z.string().min(1, 'Property name is required'),
  houseAddress: z.string().min(5, 'House address must be at least 5 characters'),
  locality: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  county: z.string().min(1, 'County is required'),
  country: z.string().min(1, 'Country is required'),
  postcode: z.string().regex(/^[A-Z]{1,2}[0-9][A-Z0-9]? [0-9][A-Z]{2}$/i, 'Please enter a valid UK postcode'),
  propertyType: z.enum(['House', 'Flat', 'Apartment', 'Townhouse', 'Other'], {
    required_error: 'Please select a property type',
  }),
  bedrooms: z.number().min(1, 'Must have at least 1 bedroom'),
  beds: z.number().min(1, 'Must have at least 1 bed'),
  bedsBreakdown: z.string().optional(),
  bathrooms: z.number().min(1, 'Must have at least 1 bathroom'),
  maxOccupancy: z.number().min(1, 'Must accommodate at least 1 person'),
  parkingType: z.enum(['Driveway', 'Off-Street', 'Secure Bay', 'On-Street']).optional(),
  
  // Photos (minimum 5 required)
  photos: z.any().refine((files) => {
    if (!files || !(files instanceof FileList) || files.length === 0) return false;
    return files.length >= 5;
  }, 'Minimum 5 photos are required'),
  
  // Amenities
  workspaceDesk: z.boolean(),
  highSpeedWifi: z.boolean(),
  smartTv: z.boolean(),
  fullyEquippedKitchen: z.boolean(),
  livingDiningSpace: z.boolean(),
  washingMachine: z.boolean(),
  ironIroningBoard: z.boolean(),
  linenTowelsProvided: z.boolean(),
  consumablesProvided: z.boolean(),
  
  // Safety & Compliance
  smokeAlarm: z.boolean(),
  coAlarm: z.boolean(),
  fireExtinguisherBlanket: z.boolean(),
  epc: z.boolean(),
  gasSafetyCertificate: z.boolean(),
  eicr: z.boolean(),
  
  // Additional Information
  additionalInfo: z.string().optional(),
  
  // New fields
  vatDetails: z.string().optional(),
  comments: z.string().optional(),
  airbnb: z.string().url().optional().or(z.literal('')),
  paymentMethod: z.object({
    bankName: z.string().optional(),
    accountNumber: z.string().optional(),
    sortCode: z.string().optional(),
    accountHolderName: z.string().optional(),
    preferredPaymentMethod: z.enum(['bank_transfer', 'paypal', 'stripe', 'other']).optional()
  }).optional(),
  
});

type PropertyForm = z.infer<typeof propertySchema>;

interface AddPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PropertyForm) => void;
}

export default function AddPropertyModal({ isOpen, onClose, onSubmit }: AddPropertyModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const isProcessingCameraRef = useRef(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
    trigger,
  } = useForm<PropertyForm>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      workspaceDesk: false,
      highSpeedWifi: false,
      smartTv: false,
      fullyEquippedKitchen: false,
      livingDiningSpace: false,
      washingMachine: false,
      ironIroningBoard: false,
      linenTowelsProvided: false,
      consumablesProvided: false,
      smokeAlarm: false,
      coAlarm: false,
      fireExtinguisherBlanket: false,
      epc: false,
      gasSafetyCertificate: false,
      eicr: false,
    },
  });

  const handleFormSubmit = async (data: PropertyForm) => {
    setLoading(true);
    setError(null);

    try {
      // Add the selected files to the form data
      const formDataWithFiles = {
        ...data,
        photos: selectedFiles
      };
      
      await onSubmit(formDataWithFiles);
      reset();
      setSelectedFiles(null);
      onClose();
    } catch (err) {
      setError('Failed to add property. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    setError(null);
    setSelectedFiles(null);
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = e.target.files;
    if (newFiles) {
      // Combine existing files with new files
      const existingFiles = selectedFiles ? Array.from(selectedFiles) : [];
      const newFilesArray = Array.from(newFiles);
      const allFiles = [...existingFiles, ...newFilesArray];
      
      // Create a new FileList from the combined files
      const dataTransfer = new DataTransfer();
      allFiles.forEach(file => dataTransfer.items.add(file));
      const combinedFileList = dataTransfer.files;
      
      setSelectedFiles(combinedFileList);
      setValue('photos', combinedFileList);
      trigger('photos');
      
      // Clear the input so the same files can be selected again if needed
      e.target.value = '';
    }
  };

  // Function to process camera files - memoized to avoid recreation
  const processCameraFiles = useCallback((newFiles: FileList) => {
    if (newFiles && newFiles.length > 0) {
      setSelectedFiles(prevFiles => {
        // Combine existing files with new camera files
        const existingFiles = prevFiles ? Array.from(prevFiles) : [];
        const newFilesArray = Array.from(newFiles);
        const allFiles = [...existingFiles, ...newFilesArray];
        
        // Create a new FileList from the combined files
        const dataTransfer = new DataTransfer();
        allFiles.forEach(file => dataTransfer.items.add(file));
        const combinedFileList = dataTransfer.files;
        
        // Update form value and trigger validation
        setValue('photos', combinedFileList);
        trigger('photos');
        
        // Update the hidden input to keep it in sync
        const photoInput = document.getElementById('photos') as HTMLInputElement;
        if (photoInput) {
          // Create a new DataTransfer to set files on the hidden input
          const hiddenInputDataTransfer = new DataTransfer();
          allFiles.forEach(file => hiddenInputDataTransfer.items.add(file));
          photoInput.files = hiddenInputDataTransfer.files;
        }
        
        return combinedFileList;
      });
    }
  }, [setValue, trigger]);

  // Handle visibility change (when app returns from background/camera on mobile)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && cameraInputRef.current && isProcessingCameraRef.current) {
        // Check if files were selected while we were away
        setTimeout(() => {
          const cameraInput = cameraInputRef.current;
          if (cameraInput && cameraInput.files && cameraInput.files.length > 0) {
            processCameraFiles(cameraInput.files);
            isProcessingCameraRef.current = false;
            // Reset the camera input
            if (cameraInput.parentNode) {
              cameraInput.parentNode.removeChild(cameraInput);
            }
            cameraInputRef.current = null;
          } else if (cameraInput && isProcessingCameraRef.current) {
            // No files selected, cleanup
            isProcessingCameraRef.current = false;
            if (cameraInput.parentNode) {
              cameraInput.parentNode.removeChild(cameraInput);
            }
            cameraInputRef.current = null;
          }
        }, 300);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [processCameraFiles]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-y-auto sm:max-w-6xl max-w-xs max-h-[85vh] sm:max-h-[95vh]">
        {/* Header with Logo and Close Button */}
        <div className="flex items-center justify-between p-3 sm:p-6 border-b border-gray-200">
          <div className="py-1">
            <Image
              src="/blue-teal.webp"
              alt="Booking Hub Logo"
              width={200}
              height={50}
              className="h-6 sm:h-24 w-auto object-contain"
              style={{ maxWidth: '100%' }}
            />
          </div>
          <button
            onClick={handleClose}
            className="p-1 sm:p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-4 h-4 sm:w-6 sm:h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form Content */}
        <div className="p-4 sm:p-6">
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-3 sm:space-y-8">
            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-4">
                <div className="text-sm text-red-800">{error}</div>
              </div>
            )}

            {/* Basic Details Section */}
            <div>
              <h3 className="text-sm sm:text-xl font-bold text-booking-dark mb-2 sm:mb-6">Basic Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6">
                {/* Property Name */}
                <div>
                  <label htmlFor="propertyName" className="block text-xs sm:text-xs sm:text-sm font-medium text-booking-dark mb-1 sm:mb-2">
                    Property Name *
                  </label>
                  <input
                    {...register('propertyName')}
                    type="text"
                    className={`w-full px-2 sm:px-4 py-2 sm:py-3 border border-booking-teal rounded focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent text-xs sm:text-base ${errors.propertyName ? 'border-red-500' : ''}`}
                    placeholder="e.g., Modern City Apartment"
                  />
                  {errors.propertyName && (
                    <p className="mt-1 text-sm text-red-600">{errors.propertyName.message}</p>
                  )}
                </div>

                {/* Property Type */}
                <div>
                  <label htmlFor="propertyType" className="block text-xs sm:text-xs sm:text-sm font-medium text-booking-dark mb-1 sm:mb-2">
                    Property Type *
                  </label>
                  <CustomSelect
                    id="propertyType"
                    name="propertyType"
                    value={watch('propertyType') || ''}
                    onChange={(value) => {
                      setValue('propertyType', value as 'House' | 'Flat' | 'Apartment' | 'Townhouse' | 'Other');
                      trigger('propertyType');
                    }}
                    placeholder="Select property type"
                    options={[
                      { value: 'House', label: 'House' },
                      { value: 'Flat', label: 'Flat' },
                      { value: 'Apartment', label: 'Apartment' },
                      { value: 'Townhouse', label: 'Townhouse' },
                      { value: 'Other', label: 'Other' },
                    ]}
                    error={!!errors.propertyType}
                    className={errors.propertyType ? 'border-red-500' : ''}
                  />
                  {errors.propertyType && (
                    <p className="mt-1 text-sm text-red-600">{errors.propertyType.message}</p>
                  )}
                </div>

                {/* House Address */}
                <div className="md:col-span-2">
                  <label htmlFor="houseAddress" className="block text-xs sm:text-xs sm:text-sm font-medium text-booking-dark mb-1 sm:mb-2">
                    House Address *
                  </label>
                  <textarea
                    {...register('houseAddress')}
                    rows={3}
                    className={`w-full px-2 sm:px-4 py-2 sm:py-3 border border-booking-teal rounded focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent text-xs sm:text-base ${errors.houseAddress ? 'border-red-500' : ''}`}
                    placeholder="Enter house address"
                  />
                  {errors.houseAddress && (
                    <p className="mt-1 text-sm text-red-600">{errors.houseAddress.message}</p>
                  )}
                </div>

                {/* Locality/District */}
                <div>
                  <label htmlFor="locality" className="block text-xs sm:text-xs sm:text-sm font-medium text-booking-dark mb-1 sm:mb-2">
                    Locality/District
                  </label>
                  <input
                    {...register('locality')}
                    type="text"
                    className="w-full px-2 sm:px-4 py-2 sm:py-3 border border-booking-teal rounded focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent text-xs sm:text-base"
                    placeholder="e.g., Westminster"
                  />
                </div>

                {/* City */}
                <div>
                  <label htmlFor="city" className="block text-xs sm:text-xs sm:text-sm font-medium text-booking-dark mb-1 sm:mb-2">
                    City *
                  </label>
                  <input
                    {...register('city')}
                    type="text"
                    className={`w-full px-2 sm:px-4 py-2 sm:py-3 border border-booking-teal rounded focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent text-xs sm:text-base ${errors.city ? 'border-red-500' : ''}`}
                    placeholder="e.g., London"
                  />
                  {errors.city && (
                    <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
                  )}
                </div>

                {/* County */}
                <div>
                  <label htmlFor="county" className="block text-xs sm:text-xs sm:text-sm font-medium text-booking-dark mb-1 sm:mb-2">
                    County *
                  </label>
                  <input
                    {...register('county')}
                    type="text"
                    className={`w-full px-2 sm:px-4 py-2 sm:py-3 border border-booking-teal rounded focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent text-xs sm:text-base ${errors.county ? 'border-red-500' : ''}`}
                    placeholder="e.g., Greater London"
                  />
                  {errors.county && (
                    <p className="mt-1 text-sm text-red-600">{errors.county.message}</p>
                  )}
                </div>

                {/* Country */}
                <div>
                  <label htmlFor="country" className="block text-xs sm:text-xs sm:text-sm font-medium text-booking-dark mb-1 sm:mb-2">
                    Country *
                  </label>
                  <input
                    {...register('country')}
                    type="text"
                    className={`w-full px-2 sm:px-4 py-2 sm:py-3 border border-booking-teal rounded focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent text-xs sm:text-base ${errors.country ? 'border-red-500' : ''}`}
                    placeholder="e.g., United Kingdom"
                  />
                  {errors.country && (
                    <p className="mt-1 text-sm text-red-600">{errors.country.message}</p>
                  )}
                </div>

                {/* Postcode */}
                <div>
                  <label htmlFor="postcode" className="block text-xs sm:text-xs sm:text-sm font-medium text-booking-dark mb-1 sm:mb-2">
                    Postcode *
                  </label>
                  <input
                    {...register('postcode')}
                    type="text"
                    className={`w-full px-2 sm:px-4 py-2 sm:py-3 border border-booking-teal rounded focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent text-xs sm:text-base ${errors.postcode ? 'border-red-500' : ''}`}
                    placeholder="e.g., SW1A 1AA"
                  />
                  {errors.postcode && (
                    <p className="mt-1 text-sm text-red-600">{errors.postcode.message}</p>
                  )}
                </div>

                {/* Bedrooms */}
                <div>
                  <label htmlFor="bedrooms" className="block text-xs sm:text-xs sm:text-sm font-medium text-booking-dark mb-1 sm:mb-2">
                    Number of Bedrooms *
                  </label>
                  <input
                    {...register('bedrooms', { valueAsNumber: true })}
                    type="number"
                    min="1"
                    className={`w-full px-2 sm:px-4 py-2 sm:py-3 border border-booking-teal rounded focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent text-xs sm:text-base ${errors.bedrooms ? 'border-red-500' : ''}`}
                    placeholder="2"
                  />
                  {errors.bedrooms && (
                    <p className="mt-1 text-sm text-red-600">{errors.bedrooms.message}</p>
                  )}
                </div>

                {/* Beds */}
                <div>
                  <label htmlFor="beds" className="block text-xs sm:text-xs sm:text-sm font-medium text-booking-dark mb-1 sm:mb-2">
                    Number of Beds *
                  </label>
                  <input
                    {...register('beds', { valueAsNumber: true })}
                    type="number"
                    min="1"
                    className={`w-full px-2 sm:px-4 py-2 sm:py-3 border border-booking-teal rounded focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent text-xs sm:text-base ${errors.beds ? 'border-red-500' : ''}`}
                    placeholder="2"
                  />
                  {errors.beds && (
                    <p className="mt-1 text-sm text-red-600">{errors.beds.message}</p>
                  )}
                </div>

                {/* Beds Breakdown */}
                <div>
                  <label htmlFor="bedsBreakdown" className="block text-xs sm:text-xs sm:text-sm font-medium text-booking-dark mb-1 sm:mb-2">
                    Beds Breakdown (if multiple types)
                  </label>
                  <input
                    {...register('bedsBreakdown')}
                    type="text"
                    className="w-full px-2 sm:px-4 py-2 sm:py-3 border border-booking-teal rounded focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent text-xs sm:text-base"
                    placeholder="e.g., 1 double, 2 singles"
                  />
                </div>

                {/* Bathrooms */}
                <div>
                  <label htmlFor="bathrooms" className="block text-xs sm:text-xs sm:text-sm font-medium text-booking-dark mb-1 sm:mb-2">
                    Number of Bathrooms *
                  </label>
                  <input
                    {...register('bathrooms', { valueAsNumber: true })}
                    type="number"
                    min="1"
                    step="1"
                    className={`w-full px-2 sm:px-4 py-2 sm:py-3 border border-booking-teal rounded focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent text-xs sm:text-base ${errors.bathrooms ? 'border-red-500' : ''}`}
                    placeholder="1"
                  />
                  {errors.bathrooms && (
                    <p className="mt-1 text-sm text-red-600">{errors.bathrooms.message}</p>
                  )}
                </div>

                {/* Max Occupancy */}
                <div>
                  <label htmlFor="maxOccupancy" className="block text-xs sm:text-xs sm:text-sm font-medium text-booking-dark mb-1 sm:mb-2">
                    Maximum Occupancy *
                  </label>
                  <input
                    {...register('maxOccupancy', { valueAsNumber: true })}
                    type="number"
                    min="1"
                    className={`w-full px-2 sm:px-4 py-2 sm:py-3 border border-booking-teal rounded focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent text-xs sm:text-base ${errors.maxOccupancy ? 'border-red-500' : ''}`}
                    placeholder="4"
                  />
                  {errors.maxOccupancy && (
                    <p className="mt-1 text-sm text-red-600">{errors.maxOccupancy.message}</p>
                  )}
                </div>

                {/* Parking Type */}
                <div>
                  <label htmlFor="parkingType" className="block text-xs sm:text-xs sm:text-sm font-medium text-booking-dark mb-1 sm:mb-2">
                    Parking Type
                  </label>
                  <CustomSelect
                    id="parkingType"
                    name="parkingType"
                    value={watch('parkingType') || ''}
                    onChange={(value) => {
                      setValue('parkingType', value as 'Driveway' | 'Off-Street' | 'Secure Bay' | 'On-Street' | undefined);
                      trigger('parkingType');
                    }}
                    placeholder="Select parking type"
                    options={[
                      { value: 'Driveway', label: 'Driveway' },
                      { value: 'Off-Street', label: 'Off-Street' },
                      { value: 'Secure Bay', label: 'Secure Bay' },
                      { value: 'On-Street', label: 'On-Street' },
                    ]}
                  />
                </div>
              </div>
            </div>

            {/* Photos Section */}
            <div>
              <h3 className="text-sm sm:text-xl font-bold text-booking-dark mb-2 sm:mb-6">Photos</h3>
              <p className="text-xs sm:text-sm text-booking-gray mb-2 sm:mb-4">
                Minimum 5 photos required (kitchen, living space, bedrooms, bathrooms, or other key areas). 
                Exterior photos optional but encouraged.
              </p>
              
              <div>
                <label htmlFor="photos" className="block text-xs sm:text-xs sm:text-sm font-medium text-booking-dark mb-1 sm:mb-2">
                  Property Photos (Minimum 5 required) *
                </label>
                
                {/* Hidden file input */}
                <input
                  type="file"
                  accept="image/*"
                  id="photos"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />
                
                {/* Add Photos Button */}
                <div className="flex gap-2 sm:gap-3 mb-2 sm:mb-4">
                  <button
                    type="button"
                    onClick={() => {
                      const fileInput = document.getElementById('photos') as HTMLInputElement;
                      fileInput.click();
                    }}
                    className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 bg-booking-teal text-white rounded-lg hover:bg-opacity-90 transition-all duration-200 font-medium text-xs sm:text-base"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Photos
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => {
                      // Clean up any existing camera input
                      if (cameraInputRef.current && cameraInputRef.current.parentNode) {
                        try {
                          cameraInputRef.current.parentNode.removeChild(cameraInputRef.current);
                        } catch (e) {
                          // Ignore cleanup errors
                        }
                      }
                      
                      // Create new camera input
                      const cameraInput = document.createElement('input');
                      cameraInput.type = 'file';
                      cameraInput.accept = 'image/*';
                      cameraInput.capture = 'environment';
                      cameraInput.style.display = 'none';
                      cameraInput.multiple = true;
                      
                      // Store reference
                      cameraInputRef.current = cameraInput;
                      isProcessingCameraRef.current = true;
                      
                      // Handle file change event
                      const handleFileChange = (e: Event) => {
                        const target = e.target as HTMLInputElement;
                        const newFiles = target.files;
                        
                        if (newFiles && newFiles.length > 0 && isProcessingCameraRef.current) {
                          processCameraFiles(newFiles);
                          isProcessingCameraRef.current = false;
                          
                          // Clean up after processing
                          setTimeout(() => {
                            try {
                              if (cameraInput.parentNode) {
                                cameraInput.parentNode.removeChild(cameraInput);
                              }
                              if (cameraInputRef.current === cameraInput) {
                                cameraInputRef.current = null;
                              }
                            } catch (error) {
                              // Ignore cleanup errors
                            }
                          }, 100);
                        }
                      };
                      
                      // Handle window focus (for mobile when returning from camera)
                      const handleWindowFocus = () => {
                        setTimeout(() => {
                          if (isProcessingCameraRef.current && cameraInput.files && cameraInput.files.length > 0) {
                            processCameraFiles(cameraInput.files);
                            isProcessingCameraRef.current = false;
                            
                            // Clean up
                            setTimeout(() => {
                              try {
                                if (cameraInput.parentNode) {
                                  cameraInput.parentNode.removeChild(cameraInput);
                                }
                                if (cameraInputRef.current === cameraInput) {
                                  cameraInputRef.current = null;
                                }
                                window.removeEventListener('focus', handleWindowFocus);
                              } catch (error) {
                                // Ignore cleanup errors
                              }
                            }, 100);
                          } else if (isProcessingCameraRef.current) {
                            // No files after returning, cleanup
                            isProcessingCameraRef.current = false;
                            setTimeout(() => {
                              try {
                                if (cameraInput.parentNode) {
                                  cameraInput.parentNode.removeChild(cameraInput);
                                }
                                if (cameraInputRef.current === cameraInput) {
                                  cameraInputRef.current = null;
                                }
                                window.removeEventListener('focus', handleWindowFocus);
                              } catch (error) {
                                // Ignore cleanup errors
                              }
                            }, 100);
                          }
                        }, 200);
                      };
                      
                      // Add event listeners
                      cameraInput.addEventListener('change', handleFileChange);
                      window.addEventListener('focus', handleWindowFocus);
                      
                      // Add to DOM and trigger click
                      document.body.appendChild(cameraInput);
                      cameraInput.click();
                      
                      // Fallback: check for files after a delay (in case change event doesn't fire)
                      setTimeout(() => {
                        if (isProcessingCameraRef.current && cameraInput.files && cameraInput.files.length > 0) {
                          processCameraFiles(cameraInput.files);
                          isProcessingCameraRef.current = false;
                          
                          // Clean up
                          try {
                            if (cameraInput.parentNode) {
                              cameraInput.parentNode.removeChild(cameraInput);
                            }
                            if (cameraInputRef.current === cameraInput) {
                              cameraInputRef.current = null;
                            }
                            window.removeEventListener('focus', handleWindowFocus);
                          } catch (error) {
                            // Ignore cleanup errors
                          }
                        } else if (isProcessingCameraRef.current) {
                          // No files, cleanup
                          isProcessingCameraRef.current = false;
                          try {
                            if (cameraInput.parentNode) {
                              cameraInput.parentNode.removeChild(cameraInput);
                            }
                            if (cameraInputRef.current === cameraInput) {
                              cameraInputRef.current = null;
                            }
                            window.removeEventListener('focus', handleWindowFocus);
                          } catch (error) {
                            // Ignore cleanup errors
                          }
                        }
                      }, 3000);
                    }}
                    className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 bg-gray-100 text-booking-dark rounded-lg hover:bg-gray-200 transition-all duration-200 font-medium text-xs sm:text-base"
                    title="Take photos with camera"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Take Photos
                  </button>
                </div>
                
                {/* Selected Files Display */}
                {selectedFiles && selectedFiles.length > 0 && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs sm:text-sm font-medium text-booking-dark">
                        Selected Photos ({selectedFiles.length})
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFiles(null);
                          setValue('photos', null);
                          trigger('photos');
                        }}
                        className="text-sm text-red-600 hover:text-red-800 transition-colors"
                      >
                        Clear All
                      </button>
                    </div>
                    
                    {/* Photo Preview Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {Array.from(selectedFiles).map((file, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const newFiles = Array.from(selectedFiles);
                              newFiles.splice(index, 1);
                              const newFileList = new DataTransfer();
                              newFiles.forEach(file => newFileList.items.add(file));
                              const updatedFiles = newFileList.files;
                              setSelectedFiles(updatedFiles);
                              setValue('photos', updatedFiles);
                              trigger('photos');
                            }}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {errors.photos && (
                  <p className="mt-2 text-sm text-red-600">{String(errors.photos.message || 'Invalid photos')}</p>
                )}
              </div>
            </div>

            {/* Amenities Section */}
            <div>
              <h3 className="text-sm sm:text-xl font-bold text-booking-dark mb-2 sm:mb-6">Amenities</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
                {[
                  { key: 'workspaceDesk', label: 'Workspace / Desk' },
                  { key: 'highSpeedWifi', label: 'High-Speed Wi-Fi' },
                  { key: 'smartTv', label: 'Smart TV(s)' },
                  { key: 'fullyEquippedKitchen', label: 'Fully Equipped Kitchen' },
                  { key: 'livingDiningSpace', label: 'Living/Dining Space' },
                  { key: 'washingMachine', label: 'Washing Machine' },
                  { key: 'ironIroningBoard', label: 'Iron & Ironing Board' },
                  { key: 'linenTowelsProvided', label: 'Linen & Towels Provided' },
                  { key: 'consumablesProvided', label: 'Consumables Provided' },
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center justify-between p-2 sm:p-4 border border-gray-200 rounded-lg">
                    <label htmlFor={key} className="text-xs sm:text-sm font-medium text-booking-dark">
                      {label}
                    </label>
                    <input
                      {...register(key as keyof PropertyForm)}
                      type="checkbox"
                      className="w-5 h-5 text-booking-teal border-gray-300 rounded focus:ring-booking-teal"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Safety & Compliance Section */}
            <div>
              <h3 className="text-sm sm:text-xl font-bold text-booking-dark mb-2 sm:mb-6">Safety & Compliance</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { key: 'smokeAlarm', label: 'Smoke Alarm' },
                  { key: 'coAlarm', label: 'CO Alarm' },
                  { key: 'fireExtinguisherBlanket', label: 'Fire Extinguisher / Fire Blanket' },
                  { key: 'epc', label: 'EPC' },
                  { key: 'gasSafetyCertificate', label: 'Gas Safety Certificate' },
                  { key: 'eicr', label: 'EICR' },
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center justify-between p-2 sm:p-4 border border-gray-200 rounded-lg">
                    <label htmlFor={key} className="text-xs sm:text-sm font-medium text-booking-dark">
                      {label}
                    </label>
                    <input
                      {...register(key as keyof PropertyForm)}
                      type="checkbox"
                      className="w-5 h-5 text-booking-teal border-gray-300 rounded focus:ring-booking-teal"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Information Section */}
            <div>
              <h3 className="text-sm sm:text-xl font-bold text-booking-dark mb-2 sm:mb-6">Additional Information</h3>
              
              <div>
                <label htmlFor="additionalInfo" className="block text-xs sm:text-sm font-medium text-booking-dark mb-1 sm:mb-2">
                  Additional Information
                </label>
                <textarea
                  {...register('additionalInfo')}
                  rows={4}
                  className="w-full px-2 sm:px-4 py-2 sm:py-3 border border-booking-teal rounded focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent text-xs sm:text-base"
                  placeholder="Add any special features, rules, notes, or other information about the property..."
                />
              </div>
            </div>

            {/* VAT Details Section */}
            <div>
              <h3 className="text-sm sm:text-xl font-bold text-booking-dark mb-2 sm:mb-6">VAT Details</h3>
              
              <div>
                <label htmlFor="vatDetails" className="block text-xs sm:text-sm font-medium text-booking-dark mb-1 sm:mb-2">
                  VAT Details
                </label>
                <textarea
                  {...register('vatDetails')}
                  rows={3}
                  className="w-full px-2 sm:px-4 py-2 sm:py-3 border border-booking-teal rounded focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent text-xs sm:text-base"
                  placeholder="Enter VAT details for this property (VAT number, rate, registration status, etc.)..."
                />
              </div>
            </div>

            {/* Comments Section */}
            <div>
              <h3 className="text-sm sm:text-xl font-bold text-booking-dark mb-2 sm:mb-6">Comments / Notes</h3>
              
              <div>
                <label htmlFor="comments" className="block text-xs sm:text-sm font-medium text-booking-dark mb-1 sm:mb-2">
                  Property Comments
                </label>
                <textarea
                  {...register('comments')}
                  rows={4}
                  className="w-full px-2 sm:px-4 py-2 sm:py-3 border border-booking-teal rounded focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent text-xs sm:text-base"
                  placeholder="Add any comments, notes, or special instructions for this property..."
                />
              </div>
            </div>

            {/* Airbnb Link Section */}
            <div>
              <h3 className="text-sm sm:text-xl font-bold text-booking-dark mb-2 sm:mb-6">Airbnb Reference</h3>
              
              <div>
                <label htmlFor="airbnb" className="block text-xs sm:text-sm font-medium text-booking-dark mb-1 sm:mb-2">
                  Airbnb Listing Link (Optional)
                </label>
                <input
                  {...register('airbnb')}
                  type="url"
                  className="w-full px-2 sm:px-4 py-2 sm:py-3 border border-booking-teal rounded focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent text-xs sm:text-base"
                  placeholder="https://www.airbnb.co.uk/rooms/..."
                />
                <p className="mt-1 text-xs text-gray-500">Optional reference to existing Airbnb listing</p>
              </div>
            </div>

            {/* Payment Information Section */}
            <div>
              <h3 className="text-sm sm:text-xl font-bold text-booking-dark mb-2 sm:mb-6">Payout Information</h3>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="paymentMethod.preferredPaymentMethod" className="block text-xs sm:text-sm font-medium text-booking-dark mb-1 sm:mb-2">
                    Preferred Payment Method
                  </label>
                  <CustomSelect
                    id="paymentMethod.preferredPaymentMethod"
                    name="paymentMethod.preferredPaymentMethod"
                    value={watch('paymentMethod.preferredPaymentMethod') || ''}
                    onChange={(value) => {
                      setValue('paymentMethod.preferredPaymentMethod', value as 'bank_transfer' | 'paypal' | 'stripe' | 'other' | undefined);
                      trigger('paymentMethod.preferredPaymentMethod');
                    }}
                    placeholder="Select payment method"
                    options={[
                      { value: 'bank_transfer', label: 'Bank Transfer' },
                      { value: 'paypal', label: 'PayPal' },
                      { value: 'stripe', label: 'Stripe' },
                      { value: 'other', label: 'Other' },
                    ]}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6">
                  <div>
                    <label htmlFor="paymentMethod.bankName" className="block text-xs sm:text-sm font-medium text-booking-dark mb-1 sm:mb-2">
                      Bank Name
                    </label>
                    <input
                      {...register('paymentMethod.bankName')}
                      type="text"
                      className="w-full px-2 sm:px-4 py-2 sm:py-3 border border-booking-teal rounded focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent text-xs sm:text-base"
                      placeholder="e.g., Barclays, HSBC"
                    />
                  </div>

                  <div>
                    <label htmlFor="paymentMethod.accountHolderName" className="block text-xs sm:text-sm font-medium text-booking-dark mb-1 sm:mb-2">
                      Account Holder Name
                    </label>
                    <input
                      {...register('paymentMethod.accountHolderName')}
                      type="text"
                      className="w-full px-2 sm:px-4 py-2 sm:py-3 border border-booking-teal rounded focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent text-xs sm:text-base"
                      placeholder="Full name on account"
                    />
                  </div>

                  <div>
                    <label htmlFor="paymentMethod.sortCode" className="block text-xs sm:text-sm font-medium text-booking-dark mb-1 sm:mb-2">
                      Sort Code
                    </label>
                    <input
                      {...register('paymentMethod.sortCode')}
                      type="text"
                      className="w-full px-2 sm:px-4 py-2 sm:py-3 border border-booking-teal rounded focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent text-xs sm:text-base"
                      placeholder="12-34-56"
                    />
                  </div>

                  <div>
                    <label htmlFor="paymentMethod.accountNumber" className="block text-xs sm:text-sm font-medium text-booking-dark mb-1 sm:mb-2">
                      Account Number
                    </label>
                    <input
                      {...register('paymentMethod.accountNumber')}
                      type="text"
                      className="w-full px-2 sm:px-4 py-2 sm:py-3 border border-booking-teal rounded focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent text-xs sm:text-base"
                      placeholder="12345678"
                    />
                  </div>
                </div>

              </div>
            </div>



            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 pt-3 sm:pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 bg-gray-100 text-booking-dark font-medium py-2 sm:py-3 px-3 sm:px-6 rounded hover:bg-gray-200 transition-all duration-200 text-xs sm:text-base"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-booking-teal text-white font-bold py-2 sm:py-3 px-3 sm:px-6 rounded hover:bg-opacity-90 transition-all duration-200 text-xs sm:text-base"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Adding Property...
                  </div>
                ) : (
                  'Add Property'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}