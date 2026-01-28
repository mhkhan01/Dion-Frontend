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
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [capturedPhotos, setCapturedPhotos] = useState<File[]>([]);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const isProcessingCameraRef = useRef(false);
  const cameraFilesProcessedRef = useRef(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const formDataBackupKey = 'addPropertyFormBackup';
  const photoFilesBackupKey = 'addPropertyPhotosBackup';

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

  // Restore form data when modal opens (if camera was used previously)
  useEffect(() => {
    if (isOpen) {
      try {
        const savedFormData = sessionStorage.getItem(formDataBackupKey);
        const savedPhotoCount = sessionStorage.getItem(photoFilesBackupKey);
        
        if (savedFormData) {
          const parsedData = JSON.parse(savedFormData);
          // Restore all form fields
          Object.keys(parsedData).forEach((key) => {
            if (key !== 'photos') {
              setValue(key as keyof PropertyForm, parsedData[key]);
            }
          });
          
          // Note: Actual file objects cannot be stored in sessionStorage
          // They will be restored via the camera processing
          if (savedPhotoCount) {
            console.log(`Note: ${savedPhotoCount} photos were taken, will be processed`);
          }
        }
      } catch (error) {
        console.error('Error restoring form data:', error);
      }
    }
  }, [isOpen, setValue]);

  // Save form data to sessionStorage before camera opens
  const saveFormDataToSession = useCallback(() => {
    try {
      const currentFormData = watch();
      const dataToSave = { ...currentFormData };
      // Remove photos from backup as FileList cannot be serialized
      delete (dataToSave as any).photos;
      
      sessionStorage.setItem(formDataBackupKey, JSON.stringify(dataToSave));
      if (selectedFiles) {
        sessionStorage.setItem(photoFilesBackupKey, String(selectedFiles.length));
      }
    } catch (error) {
      console.error('Error saving form data:', error);
    }
  }, [watch, selectedFiles]);

  // Clear backup when form is successfully submitted or closed normally
  const clearFormBackup = useCallback(() => {
    try {
      sessionStorage.removeItem(formDataBackupKey);
      sessionStorage.removeItem(photoFilesBackupKey);
    } catch (error) {
      console.error('Error clearing form backup:', error);
    }
  }, []);

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
      clearFormBackup(); // Clear backup on successful submit
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
    // Clean up camera state
    cleanupPolling();
    isProcessingCameraRef.current = false;
    cameraFilesProcessedRef.current = false;
    setIsCameraActive(false);
    
    // Remove camera input from DOM if it exists
    if (cameraInputRef.current && cameraInputRef.current.parentNode) {
      try {
        cameraInputRef.current.parentNode.removeChild(cameraInputRef.current);
      } catch (e) {
        // Ignore cleanup errors
      }
      cameraInputRef.current = null;
    }
    
    clearFormBackup(); // Clear backup on close
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

  // Cleanup polling interval
  const cleanupPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, []);

  // Process camera files with deduplication protection
  const handleCameraFilesReady = useCallback((files: FileList) => {
    if (cameraFilesProcessedRef.current || !files || files.length === 0) {
      return;
    }
    
    cameraFilesProcessedRef.current = true;
    cleanupPolling();
    processCameraFiles(files);
    isProcessingCameraRef.current = false;
    setIsCameraActive(false);
    
    // Reset the camera input value to allow re-selection
    if (cameraInputRef.current) {
      cameraInputRef.current.value = '';
    }
  }, [processCameraFiles, cleanupPolling]);

  // Start polling for files after camera opens
  const startFilePolling = useCallback(() => {
    cleanupPolling();
    
    let pollCount = 0;
    const maxPolls = 60; // Poll for up to 30 seconds (500ms intervals)
    
    pollingIntervalRef.current = setInterval(() => {
      pollCount++;
      
      if (cameraInputRef.current && cameraInputRef.current.files && cameraInputRef.current.files.length > 0) {
        handleCameraFilesReady(cameraInputRef.current.files);
        return;
      }
      
      // Stop polling after max attempts
      if (pollCount >= maxPolls) {
        cleanupPolling();
        isProcessingCameraRef.current = false;
        setIsCameraActive(false);
        cameraFilesProcessedRef.current = false;
      }
    }, 500);
  }, [handleCameraFilesReady, cleanupPolling]);

  // ==================== IN-BROWSER CAMERA FUNCTIONS (getUserMedia) ====================
  
  // Start the in-browser camera stream
  const startCameraStream = useCallback(async (facing: 'environment' | 'user' = 'environment') => {
    setCameraError(null);
    
    try {
      // Stop any existing stream first
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
      
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: facing,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      mediaStreamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      
      setFacingMode(facing);
    } catch (err: any) {
      console.error('Camera access error:', err);
      if (err.name === 'NotAllowedError') {
        setCameraError('Camera access denied. Please allow camera access in your browser settings.');
      } else if (err.name === 'NotFoundError') {
        setCameraError('No camera found on this device.');
      } else if (err.name === 'NotReadableError') {
        setCameraError('Camera is in use by another application.');
      } else {
        setCameraError('Failed to access camera. Please try again.');
      }
    }
  }, []);
  
  // Stop the camera stream
  const stopCameraStream = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);
  
  // Capture a photo from the video stream
  const capturePhotoFromStream = useCallback(() => {
    if (!videoRef.current || !mediaStreamRef.current) {
      return;
    }
    
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Draw the current video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert to blob and create file
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
        setCapturedPhotos(prev => [...prev, file]);
      }
    }, 'image/jpeg', 0.9);
  }, []);
  
  // Switch between front and back camera
  const switchCamera = useCallback(() => {
    const newFacing = facingMode === 'environment' ? 'user' : 'environment';
    startCameraStream(newFacing);
  }, [facingMode, startCameraStream]);
  
  // Open the in-browser camera modal
  const openCameraModal = useCallback(() => {
    setCapturedPhotos([]);
    setCameraError(null);
    setShowCameraModal(true);
    // Start camera after a brief delay to ensure modal is rendered
    setTimeout(() => {
      startCameraStream('environment');
    }, 100);
  }, [startCameraStream]);
  
  // Close the camera modal and add captured photos to form
  const closeCameraModal = useCallback((savePhotos: boolean = false) => {
    stopCameraStream();
    
    if (savePhotos && capturedPhotos.length > 0) {
      // Add captured photos to the selected files
      setSelectedFiles(prevFiles => {
        const existingFiles = prevFiles ? Array.from(prevFiles) : [];
        const allFiles = [...existingFiles, ...capturedPhotos];
        
        // Create a new FileList from the combined files
        const dataTransfer = new DataTransfer();
        allFiles.forEach(file => dataTransfer.items.add(file));
        const combinedFileList = dataTransfer.files;
        
        // Update form value and trigger validation
        setValue('photos', combinedFileList);
        trigger('photos');
        
        return combinedFileList;
      });
    }
    
    setCapturedPhotos([]);
    setShowCameraModal(false);
    setCameraError(null);
  }, [capturedPhotos, setValue, trigger, stopCameraStream]);
  
  // Remove a captured photo from the preview
  const removeCapturedPhoto = useCallback((index: number) => {
    setCapturedPhotos(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Cleanup camera stream when modal closes or component unmounts
  useEffect(() => {
    if (!showCameraModal) {
      stopCameraStream();
    }
  }, [showCameraModal, stopCameraStream]);

  // ==================== END IN-BROWSER CAMERA FUNCTIONS ====================

  // Handle visibility change (when app returns from background/camera on mobile)
  useEffect(() => {
    const handleVisibilityChange = () => {
      // Save form data when page is about to hide (camera opening)
      if (document.visibilityState === 'hidden' && isProcessingCameraRef.current) {
        saveFormDataToSession();
      }
      
      // Restore and process when page becomes visible again (returning from camera)
      if (document.visibilityState === 'visible' && cameraInputRef.current && isProcessingCameraRef.current) {
        // Use multiple timeouts to check for files at different intervals
        const checkIntervals = [100, 300, 500, 1000, 2000];
        checkIntervals.forEach((delay) => {
          setTimeout(() => {
            if (cameraInputRef.current && cameraInputRef.current.files && cameraInputRef.current.files.length > 0) {
              handleCameraFilesReady(cameraInputRef.current.files);
            }
          }, delay);
        });
      }
    };

    // pageshow event is more reliable on iOS Safari
    const handlePageShow = (event: PageTransitionEvent) => {
      if (isProcessingCameraRef.current && cameraInputRef.current) {
        // Slight delay to ensure files are populated
        setTimeout(() => {
          if (cameraInputRef.current && cameraInputRef.current.files && cameraInputRef.current.files.length > 0) {
            handleCameraFilesReady(cameraInputRef.current.files);
          }
        }, 300);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pageshow', handlePageShow);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pageshow', handlePageShow);
      cleanupPolling();
    };
  }, [handleCameraFilesReady, saveFormDataToSession, cleanupPolling]);

  // Prevent data loss if page reloads during camera operation
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isProcessingCameraRef.current) {
        // Save form data before potential reload
        saveFormDataToSession();
        
        // Show warning if user is in middle of camera operation
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [saveFormDataToSession]);

  // Prevent page navigation during camera operation
  useEffect(() => {
    if (isCameraActive) {
      // Save form state
      saveFormDataToSession();
      
      // Mark that camera is active
      sessionStorage.setItem('cameraOperationActive', 'true');
    } else {
      sessionStorage.removeItem('cameraOperationActive');
    }
  }, [isCameraActive, saveFormDataToSession]);

  // Cleanup camera input when component unmounts
  useEffect(() => {
    return () => {
      cleanupPolling();
      if (cameraInputRef.current && cameraInputRef.current.parentNode) {
        try {
          cameraInputRef.current.parentNode.removeChild(cameraInputRef.current);
        } catch (e) {
          // Ignore cleanup errors
        }
      }
    };
  }, [cleanupPolling]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4"
      onClick={(e) => {
        // Prevent closing modal during camera operation
        if (isProcessingCameraRef.current) {
          e.stopPropagation();
          return;
        }
        // Only close if clicking backdrop, not modal content
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
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
            onClick={() => {
              // Prevent closing during camera operation
              if (isProcessingCameraRef.current) {
                alert('Please wait for the camera operation to complete');
                return;
              }
              handleClose();
            }}
            className="p-1 sm:p-2 hover:bg-gray-100 rounded-full transition-colors"
            disabled={isProcessingCameraRef.current}
          >
            <svg className="w-4 h-4 sm:w-6 sm:h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form Content */}
        <div className="px-6 py-6 pb-8">
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-4">
                <div className="text-sm text-red-800" style={{ fontFamily: 'var(--font-avenir)' }}>{error}</div>
              </div>
            )}

            {/* Property Name + Property Type */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="propertyName" className="block text-sm font-avenir font-medium tracking-wide text-booking-dark mb-2">
                  Property Name *
                </label>
                <input
                  {...register('propertyName')}
                  type="text"
                  className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base font-avenir tracking-wide placeholder:text-xs sm:placeholder:text-sm border border-booking-teal rounded focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent ${errors.propertyName ? 'border-red-500' : ''}`}
                  placeholder="e.g., Modern City Apartment"
                />
                {errors.propertyName && (
                  <p className="mt-1 text-sm text-red-600">{errors.propertyName.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="propertyType" className="block text-sm font-avenir font-medium tracking-wide text-booking-dark mb-2">
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
            </div>

            {/* House Address + Locality */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="houseAddress" className="block text-sm font-avenir font-medium tracking-wide text-booking-dark mb-2">
                  House Address *
                </label>
                <textarea
                  {...register('houseAddress')}
                  rows={1}
                  className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base font-avenir tracking-wide placeholder:text-xs sm:placeholder:text-sm border border-booking-teal rounded focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent ${errors.houseAddress ? 'border-red-500' : ''}`}
                  placeholder="Enter house address"
                />
                {errors.houseAddress && (
                  <p className="mt-1 text-sm text-red-600">{errors.houseAddress.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="locality" className="block text-sm font-avenir font-medium tracking-wide text-booking-dark mb-2">
                  Locality/District
                </label>
                <input
                  {...register('locality')}
                  type="text"
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base font-avenir tracking-wide placeholder:text-xs sm:placeholder:text-sm border border-booking-teal rounded focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent"
                  placeholder="e.g., Westminster"
                />
              </div>
            </div>

            {/* City */}
            <div>
              <label htmlFor="city" className="block text-sm font-avenir font-medium tracking-wide text-booking-dark mb-2">
                City *
              </label>
              <input
                {...register('city')}
                type="text"
                className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base font-avenir tracking-wide placeholder:text-xs sm:placeholder:text-sm border border-booking-teal rounded focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent ${errors.city ? 'border-red-500' : ''}`}
                placeholder="e.g., London"
              />
              {errors.city && (
                <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
              )}
            </div>

            {/* County + Country */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="county" className="block text-sm font-avenir font-medium tracking-wide text-booking-dark mb-2">
                  County *
                </label>
                <input
                  {...register('county')}
                  type="text"
                  className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base font-avenir tracking-wide placeholder:text-xs sm:placeholder:text-sm border border-booking-teal rounded focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent ${errors.county ? 'border-red-500' : ''}`}
                  placeholder="e.g., Greater London"
                />
                {errors.county && (
                  <p className="mt-1 text-sm text-red-600">{errors.county.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="country" className="block text-sm font-avenir font-medium tracking-wide text-booking-dark mb-2">
                  Country *
                </label>
                <input
                  {...register('country')}
                  type="text"
                  className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base font-avenir tracking-wide placeholder:text-xs sm:placeholder:text-sm border border-booking-teal rounded focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent ${errors.country ? 'border-red-500' : ''}`}
                  placeholder="e.g., United Kingdom"
                />
                {errors.country && (
                  <p className="mt-1 text-sm text-red-600">{errors.country.message}</p>
                )}
              </div>
            </div>

            {/* Postcode + Bedrooms */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="postcode" className="block text-sm font-avenir font-medium tracking-wide text-booking-dark mb-2">
                  Postcode *
                </label>
                <input
                  {...register('postcode')}
                  type="text"
                  className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base font-avenir tracking-wide placeholder:text-xs sm:placeholder:text-sm border border-booking-teal rounded focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent ${errors.postcode ? 'border-red-500' : ''}`}
                  placeholder="e.g., SW1A 1AA"
                />
                {errors.postcode && (
                  <p className="mt-1 text-sm text-red-600">{errors.postcode.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="bedrooms" className="block text-sm font-avenir font-medium tracking-wide text-booking-dark mb-2">
                  Number of Bedrooms *
                </label>
                <input
                  {...register('bedrooms', { valueAsNumber: true })}
                  type="number"
                  min="1"
                  className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base font-avenir tracking-wide placeholder:text-xs sm:placeholder:text-sm border border-booking-teal rounded focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent ${errors.bedrooms ? 'border-red-500' : ''}`}
                  placeholder="2"
                />
                {errors.bedrooms && (
                  <p className="mt-1 text-sm text-red-600">{errors.bedrooms.message}</p>
                )}
              </div>
            </div>

            {/* Beds + Bathrooms */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="beds" className="block text-sm font-avenir font-medium tracking-wide text-booking-dark mb-2">
                  Number of Beds *
                </label>
                <input
                  {...register('beds', { valueAsNumber: true })}
                  type="number"
                  min="1"
                  className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base font-avenir tracking-wide placeholder:text-xs sm:placeholder:text-sm border border-booking-teal rounded focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent ${errors.beds ? 'border-red-500' : ''}`}
                  placeholder="2"
                />
                {errors.beds && (
                  <p className="mt-1 text-sm text-red-600">{errors.beds.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="bathrooms" className="block text-sm font-avenir font-medium tracking-wide text-booking-dark mb-2">
                  Number of Bathrooms *
                </label>
                <input
                  {...register('bathrooms', { valueAsNumber: true })}
                  type="number"
                  min="1"
                  step="1"
                  className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base font-avenir tracking-wide placeholder:text-xs sm:placeholder:text-sm border border-booking-teal rounded focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent ${errors.bathrooms ? 'border-red-500' : ''}`}
                  placeholder="1"
                />
                {errors.bathrooms && (
                  <p className="mt-1 text-sm text-red-600">{errors.bathrooms.message}</p>
                )}
              </div>
            </div>

            {/* Max Occupancy + Beds Breakdown / Parking Type */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="maxOccupancy" className="block text-sm font-avenir font-medium tracking-wide text-booking-dark mb-2">
                  Maximum Occupancy *
                </label>
                <input
                  {...register('maxOccupancy', { valueAsNumber: true })}
                  type="number"
                  min="1"
                  className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base font-avenir tracking-wide placeholder:text-xs sm:placeholder:text-sm border border-booking-teal rounded focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent ${errors.maxOccupancy ? 'border-red-500' : ''}`}
                  placeholder="4"
                />
                {errors.maxOccupancy && (
                  <p className="mt-1 text-sm text-red-600">{errors.maxOccupancy.message}</p>
                )}
              </div>
              {/* Mobile: Parking Type, Desktop: Beds Breakdown */}
              <div>
                <label htmlFor="parkingType-mobile" className="block text-sm font-avenir font-medium tracking-wide text-booking-dark mb-2 md:hidden">
                  Parking Type
                </label>
                <label htmlFor="bedsBreakdown-desktop" className="hidden md:block text-sm font-avenir font-medium tracking-wide text-booking-dark mb-2">
                  Beds Breakdown (if multiple types)
                </label>
                <div className="md:hidden">
                  <CustomSelect
                    id="parkingType-mobile"
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
                <div className="hidden md:block">
                  <input
                    {...register('bedsBreakdown')}
                    id="bedsBreakdown-desktop"
                    type="text"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base font-avenir tracking-wide placeholder:text-xs sm:placeholder:text-sm border border-booking-teal rounded focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent"
                    placeholder="e.g., 1 double, 2 singles"
                  />
                </div>
              </div>
            </div>

            {/* Mobile: Beds Breakdown, Desktop: Parking Type */}
            <div className="md:hidden">
              <label htmlFor="bedsBreakdown-mobile" className="block text-sm font-avenir font-medium tracking-wide text-booking-dark mb-2">
                Beds Breakdown (if multiple types)
              </label>
              <input
                {...register('bedsBreakdown')}
                id="bedsBreakdown-mobile"
                type="text"
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base font-avenir tracking-wide placeholder:text-xs sm:placeholder:text-sm border border-booking-teal rounded focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent"
                placeholder="e.g., 1 double, 2 singles"
              />
            </div>
            <div className="hidden md:block">
              <label htmlFor="parkingType-desktop" className="block text-sm font-avenir font-medium tracking-wide text-booking-dark mb-2">
                Parking Type
              </label>
              <CustomSelect
                id="parkingType-desktop"
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

            {/* Photos */}
            <div>
              <label htmlFor="photos" className="block text-sm font-avenir font-medium tracking-wide text-booking-dark mb-2">
                Property Photos (Minimum 5 required) *
              </label>
              <p className="text-xs sm:text-sm text-booking-gray mb-4 font-avenir tracking-wide">
                Minimum 5 photos required (kitchen, living space, bedrooms, bathrooms, or other key areas). 
                Exterior photos optional but encouraged.
              </p>
                
                {/* Hidden file input */}
                <input
                  type="file"
                  accept="image/*"
                  id="photos"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />
                
              <div className="flex gap-3 mb-4">
                <button
                  type="button"
                  onClick={() => {
                    const fileInput = document.getElementById('photos') as HTMLInputElement;
                    fileInput.click();
                  }}
                  className="flex items-center gap-2 px-4 py-3 bg-booking-teal text-white rounded-lg hover:bg-opacity-90 transition-all duration-200 font-medium text-base font-avenir tracking-wide"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Photos
                </button>
                
                <button
                  type="button"
                  onClick={openCameraModal}
                  disabled={showCameraModal}
                  className={`flex items-center gap-2 px-4 py-3 bg-gray-100 text-booking-dark rounded-lg hover:bg-gray-200 transition-all duration-200 font-medium text-base font-avenir tracking-wide ${showCameraModal ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title="Take photos with camera"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Take Photos
                </button>
              </div>
                
              {selectedFiles && selectedFiles.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-booking-dark font-avenir tracking-wide">
                      Selected Photos ({selectedFiles.length})
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFiles(null);
                        setValue('photos', null);
                        trigger('photos');
                      }}
                      className="text-sm text-red-600 hover:text-red-800 transition-colors font-avenir tracking-wide"
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

            {/* Amenities */}
            <div>
              <label className="block text-sm font-avenir font-medium tracking-wide text-booking-dark mb-2">
                Amenities
              </label>
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                  <div 
                    key={key} 
                    className={`flex items-center justify-between p-4 border border-gray-200 rounded-lg ${
                      key === 'fullyEquippedKitchen' ? 'col-span-2 md:col-span-1 order-10 md:order-4' : 
                      key === 'ironIroningBoard' ? 'order-7 md:order-7' : 
                      key === 'linenTowelsProvided' ? 'col-span-2 md:col-span-1 order-11 md:order-8' : 
                      key === 'consumablesProvided' ? 'col-span-2 md:col-span-1 order-12 md:order-9' : ''
                    }`}
                  >
                    <label htmlFor={key} className="text-sm font-medium text-booking-dark font-avenir tracking-wide">
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

            {/* Safety & Compliance */}
            <div>
              <label className="block text-sm font-avenir font-medium tracking-wide text-booking-dark mb-2">
                Safety & Compliance
              </label>
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { key: 'smokeAlarm', label: 'Smoke Alarm' },
                  { key: 'coAlarm', label: 'CO Alarm' },
                  { key: 'fireExtinguisherBlanket', label: 'Fire Extinguisher / Fire Blanket' },
                  { key: 'epc', label: 'EPC' },
                  { key: 'gasSafetyCertificate', label: 'Gas Safety Certificate' },
                  { key: 'eicr', label: 'EICR' },
                ].map(({ key, label }) => (
                  <div 
                    key={key} 
                    className={`flex items-center justify-between p-4 border border-gray-200 rounded-lg ${
                      key === 'fireExtinguisherBlanket' ? 'col-span-2 md:col-span-1' : ''
                    }`}
                  >
                    <label htmlFor={key} className="text-sm font-medium text-booking-dark font-avenir tracking-wide">
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

            {/* Additional Information */}
            <div>
              <label htmlFor="additionalInfo" className="block text-sm font-avenir font-medium tracking-wide text-booking-dark mb-2">
                Additional Information
              </label>
              <textarea
                {...register('additionalInfo')}
                rows={4}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base font-avenir tracking-wide placeholder:text-xs sm:placeholder:text-sm border border-booking-teal rounded focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent"
                placeholder="Add any special features, rules, notes, or other information about the property..."
              />
            </div>

            {/* VAT Details */}
            <div>
              <label htmlFor="vatDetails" className="block text-sm font-avenir font-medium tracking-wide text-booking-dark mb-2">
                VAT Details
              </label>
              <textarea
                {...register('vatDetails')}
                rows={1}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base font-avenir tracking-wide placeholder:text-xs sm:placeholder:text-sm border border-booking-teal rounded focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent min-h-[60px] md:min-h-0"
                placeholder="Enter VAT details for this property (VAT number, rate, registration status, etc.)..."
              />
            </div>

            {/* Comments */}
            <div>
              <label htmlFor="comments" className="block text-sm font-avenir font-medium tracking-wide text-booking-dark mb-2">
                Property Comments
              </label>
              <textarea
                {...register('comments')}
                rows={4}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base font-avenir tracking-wide placeholder:text-xs sm:placeholder:text-sm border border-booking-teal rounded focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent"
                placeholder="Add any comments, notes, or special instructions for this property..."
              />
            </div>

            {/* Airbnb Link */}
            <div>
              <label htmlFor="airbnb" className="block text-sm font-avenir font-medium tracking-wide text-booking-dark mb-2">
                Airbnb Listing Link (Optional)
              </label>
              <input
                {...register('airbnb')}
                type="url"
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base font-avenir tracking-wide placeholder:text-xs sm:placeholder:text-sm border border-booking-teal rounded focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent"
                placeholder="https://www.airbnb.co.uk/rooms/..."
              />
              <p className="mt-1 text-xs text-gray-500 font-avenir tracking-wide">Optional reference to existing Airbnb listing</p>
            </div>

            {/* Payment Information */}
            <div>
              <label htmlFor="paymentMethod.preferredPaymentMethod" className="block text-sm font-avenir font-medium tracking-wide text-booking-dark mb-2">
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

            {/* Bank Details */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="paymentMethod.bankName" className="block text-sm font-avenir font-medium tracking-wide text-booking-dark mb-2">
                  Bank Name
                </label>
                <input
                  {...register('paymentMethod.bankName')}
                  type="text"
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base font-avenir tracking-wide placeholder:text-xs sm:placeholder:text-sm border border-booking-teal rounded focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent"
                  placeholder="e.g., Barclays, HSBC"
                />
              </div>
              <div>
                <label htmlFor="paymentMethod.accountHolderName" className="block text-sm font-avenir font-medium tracking-wide text-booking-dark mb-2">
                  Account Holder Name
                </label>
                <input
                  {...register('paymentMethod.accountHolderName')}
                  type="text"
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base font-avenir tracking-wide placeholder:text-xs sm:placeholder:text-sm border border-booking-teal rounded focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent"
                  placeholder="Full name on account"
                />
              </div>
              <div>
                <label htmlFor="paymentMethod.sortCode" className="block text-sm font-avenir font-medium tracking-wide text-booking-dark mb-2">
                  Sort Code
                </label>
                <input
                  {...register('paymentMethod.sortCode')}
                  type="text"
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base font-avenir tracking-wide placeholder:text-xs sm:placeholder:text-sm border border-booking-teal rounded focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent"
                  placeholder="12-34-56"
                />
              </div>
              <div>
                <label htmlFor="paymentMethod.accountNumber" className="block text-sm font-avenir font-medium tracking-wide text-booking-dark mb-2">
                  Account Number
                </label>
                <input
                  {...register('paymentMethod.accountNumber')}
                  type="text"
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base font-avenir tracking-wide placeholder:text-xs sm:placeholder:text-sm border border-booking-teal rounded focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent"
                  placeholder="12345678"
                />
              </div>
            </div>



            {/* Form Actions */}
            <div className="pt-4 space-y-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-booking-teal text-white px-6 py-3 rounded-lg font-avenir tracking-wide text-base hover:bg-opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
              <button
                type="button"
                onClick={() => {
                  // Prevent closing during camera operation
                  if (isProcessingCameraRef.current) {
                    alert('Please wait for the camera operation to complete');
                    return;
                  }
                  handleClose();
                }}
                disabled={isProcessingCameraRef.current}
                className="w-full bg-gray-100 text-booking-dark font-medium py-3 px-6 rounded-lg hover:bg-gray-200 transition-all duration-200 text-base font-avenir tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* In-Browser Camera Modal */}
      {showCameraModal && (
        <div className="fixed inset-0 bg-black z-[60] flex flex-col">
          {/* Camera Header */}
          <div className="flex items-center justify-between p-4 bg-black/80">
            <h3 className="text-white font-semibold text-lg">Take Photos</h3>
            <div className="flex items-center gap-2">
              {/* Switch Camera Button */}
              <button
                type="button"
                onClick={switchCamera}
                className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                title="Switch Camera"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              {/* Close Button */}
              <button
                type="button"
                onClick={() => closeCameraModal(false)}
                className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Camera View */}
          <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
            {cameraError ? (
              <div className="text-center p-6">
                <div className="text-red-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <p className="text-white text-lg mb-4">{cameraError}</p>
                <button
                  type="button"
                  onClick={() => startCameraStream(facingMode)}
                  className="px-6 py-2 bg-booking-teal text-white rounded-lg hover:bg-opacity-90 transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
              />
            )}
          </div>

          {/* Captured Photos Preview */}
          {capturedPhotos.length > 0 && (
            <div className="bg-black/80 p-3">
              <div className="flex gap-2 overflow-x-auto pb-2">
                {capturedPhotos.map((photo, index) => (
                  <div key={index} className="relative flex-shrink-0">
                    <img
                      src={URL.createObjectURL(photo)}
                      alt={`Captured ${index + 1}`}
                      className="w-16 h-16 object-cover rounded-lg border-2 border-white/50"
                    />
                    <button
                      type="button"
                      onClick={() => removeCapturedPhoto(index)}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
              <p className="text-white/70 text-sm text-center mt-1">
                {capturedPhotos.length} photo{capturedPhotos.length !== 1 ? 's' : ''} captured
              </p>
            </div>
          )}

          {/* Camera Controls */}
          <div className="bg-black/80 p-6 flex items-center justify-center gap-8">
            {/* Cancel Button */}
            <button
              type="button"
              onClick={() => closeCameraModal(false)}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors font-medium"
            >
              Cancel
            </button>
            
            {/* Capture Button */}
            <button
              type="button"
              onClick={capturePhotoFromStream}
              disabled={!!cameraError}
              className="w-20 h-20 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              title="Capture Photo"
            >
              <div className="w-16 h-16 border-4 border-booking-teal rounded-full"></div>
            </button>
            
            {/* Done Button */}
            <button
              type="button"
              onClick={() => closeCameraModal(true)}
              disabled={capturedPhotos.length === 0}
              className={`px-6 py-3 bg-booking-teal text-white rounded-lg transition-colors font-medium ${
                capturedPhotos.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-opacity-90'
              }`}
            >
              Done ({capturedPhotos.length})
            </button>
          </div>
        </div>
      )}
    </div>
  );
}