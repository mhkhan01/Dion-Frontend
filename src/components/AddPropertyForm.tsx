'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
//hello
const propertySchema = z.object({
  // Basic Details
  propertyName: z.string().min(1, 'Property name is required'),
  fullAddress: z.string().min(5, 'Full address must be at least 5 characters'),
  postcode: z.string().regex(/^[A-Z]{1,2}[0-9][A-Z0-9]? [0-9][A-Z]{2}$/i, 'Please enter a valid UK postcode'),
  propertyType: z.enum(['House', 'Flat', 'Apartment', 'Townhouse', 'Other'], {
    required_error: 'Please select a property type',
  }),
  bedrooms: z.number().min(1, 'Must have at least 1 bedroom'),
  beds: z.number().min(1, 'Must have at least 1 bed'),
  bedsBreakdown: z.string().optional(),
  bathrooms: z.number().min(0.5, 'Must have at least 0.5 bathrooms'),
  maxOccupancy: z.number().min(1, 'Must accommodate at least 1 person'),
  parkingType: z.enum(['Driveway', 'Off-Street', 'Secure Bay', 'On-Street']).optional(),
  contactNumber: z.string().min(1, 'Contact number is required'),
  
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
  
});

type PropertyForm = z.infer<typeof propertySchema>;

interface AddPropertyFormProps {
  onSubmit: (data: PropertyForm) => void;
  onCancel: () => void;
}

export default function AddPropertyForm({ onSubmit, onCancel }: AddPropertyFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);

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
    } catch (err) {
      setError('Failed to add property. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    reset();
    setError(null);
    setSelectedFiles(null);
    onCancel();
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

  return (
    <div className="bg-white rounded-2xl shadow-lg w-full max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div>
          <h2 className="text-2xl font-bold text-booking-dark">Add New Property</h2>
          <p className="text-booking-gray mt-1">Fill in the details below to list your property</p>
        </div>
        <button
          onClick={handleCancel}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Form Content */}
      <div className="p-6">
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-4">
              <div className="text-sm text-red-800">{error}</div>
            </div>
          )}

          {/* Basic Details Section */}
          <div>
            <h3 className="text-xl font-bold text-booking-dark mb-6">Basic Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Property Name */}
              <div>
                <label htmlFor="propertyName" className="block text-sm font-medium text-booking-dark mb-2">
                  Property Name *
                </label>
                <input
                  {...register('propertyName')}
                  type="text"
                  className={`w-full px-4 py-3 border border-booking-teal rounded focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent text-base ${errors.propertyName ? 'border-red-500' : ''}`}
                  placeholder="e.g., Modern City Apartment"
                />
                {errors.propertyName && (
                  <p className="mt-1 text-sm text-red-600">{errors.propertyName.message}</p>
                )}
              </div>

              {/* Property Type */}
              <div>
                <label htmlFor="propertyType" className="block text-sm font-medium text-booking-dark mb-2">
                  Property Type *
                </label>
                <select
                  {...register('propertyType')}
                  className={`w-full px-4 py-3 border border-booking-teal rounded focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent text-base ${errors.propertyType ? 'border-red-500' : ''}`}
                >
                  <option value="">Select property type</option>
                  <option value="House">House</option>
                  <option value="Flat">Flat</option>
                  <option value="Apartment">Apartment</option>
                  <option value="Townhouse">Townhouse</option>
                  <option value="Other">Other</option>
                </select>
                {errors.propertyType && (
                  <p className="mt-1 text-sm text-red-600">{errors.propertyType.message}</p>
                )}
              </div>

              {/* Full Address */}
              <div className="md:col-span-2">
                <label htmlFor="fullAddress" className="block text-sm font-medium text-booking-dark mb-2">
                  Full Address *
                </label>
                <textarea
                  {...register('fullAddress')}
                  rows={3}
                  className={`w-full px-4 py-3 border border-booking-teal rounded focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent text-base ${errors.fullAddress ? 'border-red-500' : ''}`}
                  placeholder="Enter full property address"
                />
                {errors.fullAddress && (
                  <p className="mt-1 text-sm text-red-600">{errors.fullAddress.message}</p>
                )}
              </div>

              {/* Postcode */}
              <div>
                <label htmlFor="postcode" className="block text-sm font-medium text-booking-dark mb-2">
                  Postcode *
                </label>
                <input
                  {...register('postcode')}
                  type="text"
                  className={`w-full px-4 py-3 border border-booking-teal rounded focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent text-base ${errors.postcode ? 'border-red-500' : ''}`}
                  placeholder="e.g., SW1A 1AA"
                />
                {errors.postcode && (
                  <p className="mt-1 text-sm text-red-600">{errors.postcode.message}</p>
                )}
              </div>

              {/* Bedrooms */}
              <div>
                <label htmlFor="bedrooms" className="block text-sm font-medium text-booking-dark mb-2">
                  Number of Bedrooms *
                </label>
                <input
                  {...register('bedrooms', { valueAsNumber: true })}
                  type="number"
                  min="1"
                  className={`w-full px-4 py-3 border border-booking-teal rounded focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent text-base ${errors.bedrooms ? 'border-red-500' : ''}`}
                  placeholder="2"
                />
                {errors.bedrooms && (
                  <p className="mt-1 text-sm text-red-600">{errors.bedrooms.message}</p>
                )}
              </div>

              {/* Beds */}
              <div>
                <label htmlFor="beds" className="block text-sm font-medium text-booking-dark mb-2">
                  Number of Beds *
                </label>
                <input
                  {...register('beds', { valueAsNumber: true })}
                  type="number"
                  min="1"
                  className={`w-full px-4 py-3 border border-booking-teal rounded focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent text-base ${errors.beds ? 'border-red-500' : ''}`}
                  placeholder="2"
                />
                {errors.beds && (
                  <p className="mt-1 text-sm text-red-600">{errors.beds.message}</p>
                )}
              </div>

              {/* Beds Breakdown */}
              <div>
                <label htmlFor="bedsBreakdown" className="block text-sm font-medium text-booking-dark mb-2">
                  Beds Breakdown (if multiple types)
                </label>
                <input
                  {...register('bedsBreakdown')}
                  type="text"
                  className="w-full px-4 py-3 border border-booking-teal rounded focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent text-base"
                  placeholder="e.g., 1 double, 2 singles"
                />
              </div>

              {/* Bathrooms */}
              <div>
                <label htmlFor="bathrooms" className="block text-sm font-medium text-booking-dark mb-2">
                  Number of Bathrooms *
                </label>
                <input
                  {...register('bathrooms', { valueAsNumber: true })}
                  type="number"
                  min="0.5"
                  step="0.5"
                  className={`w-full px-4 py-3 border border-booking-teal rounded focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent text-base ${errors.bathrooms ? 'border-red-500' : ''}`}
                  placeholder="1.5"
                />
                {errors.bathrooms && (
                  <p className="mt-1 text-sm text-red-600">{errors.bathrooms.message}</p>
                )}
              </div>

              {/* Max Occupancy */}
              <div>
                <label htmlFor="maxOccupancy" className="block text-sm font-medium text-booking-dark mb-2">
                  Maximum Occupancy *
                </label>
                <input
                  {...register('maxOccupancy', { valueAsNumber: true })}
                  type="number"
                  min="1"
                  className={`w-full px-4 py-3 border border-booking-teal rounded focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent text-base ${errors.maxOccupancy ? 'border-red-500' : ''}`}
                  placeholder="4"
                />
                {errors.maxOccupancy && (
                  <p className="mt-1 text-sm text-red-600">{errors.maxOccupancy.message}</p>
                )}
              </div>

              {/* Parking Type */}
              <div>
                <label htmlFor="parkingType" className="block text-sm font-medium text-booking-dark mb-2">
                  Parking Type
                </label>
                <select
                  {...register('parkingType')}
                  className="w-full px-4 py-3 border border-booking-teal rounded focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent text-base"
                >
                  <option value="">Select parking type</option>
                  <option value="Driveway">Driveway</option>
                  <option value="Off-Street">Off-Street</option>
                  <option value="Secure Bay">Secure Bay</option>
                  <option value="On-Street">On-Street</option>
                </select>
              </div>

              {/* Contact Number */}
              <div>
                <label htmlFor="contactNumber" className="block text-sm font-medium text-booking-dark mb-2">
                  Contact Number *
                </label>
                <input
                  {...register('contactNumber')}
                  type="tel"
                  className={`w-full px-4 py-3 border border-booking-teal rounded focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent text-base ${errors.contactNumber ? 'border-red-500' : ''}`}
                  placeholder="e.g., +44 7700 900123"
                />
                {errors.contactNumber && (
                  <p className="mt-1 text-sm text-red-600">{errors.contactNumber.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Photos Section */}
          <div>
            <h3 className="text-xl font-bold text-booking-dark mb-6">Photos</h3>
            <p className="text-sm text-booking-gray mb-4">
              Minimum 5 photos required (kitchen, living space, bedrooms, bathrooms, or other key areas). 
              Exterior photos optional but encouraged.
            </p>
            
            <div>
              <label htmlFor="photos" className="block text-sm font-medium text-booking-dark mb-2">
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
              <div className="flex gap-3 mb-4">
                <button
                  type="button"
                  onClick={() => {
                    const fileInput = document.getElementById('photos') as HTMLInputElement;
                    fileInput.click();
                  }}
                  className="flex items-center gap-2 px-4 py-3 bg-booking-teal text-white rounded-lg hover:bg-opacity-90 transition-all duration-200 font-medium text-base"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Photos
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    const cameraInput = document.createElement('input');
                    cameraInput.type = 'file';
                    cameraInput.accept = 'image/*';
                    cameraInput.capture = 'environment';
                    cameraInput.style.display = 'none';
                    cameraInput.multiple = true;
                    
                    cameraInput.onchange = (e) => {
                      const newFiles = (e.target as HTMLInputElement).files;
                      if (newFiles) {
                        // Combine existing files with new camera files
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
                        
                        // Update the hidden input
                        const photoInput = document.getElementById('photos') as HTMLInputElement;
                        if (photoInput) {
                          photoInput.files = combinedFileList;
                        }
                      }
                      document.body.removeChild(cameraInput);
                    };
                    
                    document.body.appendChild(cameraInput);
                    cameraInput.click();
                  }}
                  className="flex items-center gap-2 px-4 py-3 bg-gray-100 text-booking-dark rounded-lg hover:bg-gray-200 transition-all duration-200 font-medium text-base"
                  title="Take photos with camera"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    <p className="text-sm font-medium text-booking-dark">
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
            <h3 className="text-xl font-bold text-booking-dark mb-6">Amenities</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                <div key={key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <label htmlFor={key} className="text-sm font-medium text-booking-dark">
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
            <h3 className="text-xl font-bold text-booking-dark mb-6">Safety & Compliance</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { key: 'smokeAlarm', label: 'Smoke Alarm' },
                { key: 'coAlarm', label: 'CO Alarm' },
                { key: 'fireExtinguisherBlanket', label: 'Fire Extinguisher / Fire Blanket' },
                { key: 'epc', label: 'EPC' },
                { key: 'gasSafetyCertificate', label: 'Gas Safety Certificate' },
                { key: 'eicr', label: 'EICR' },
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <label htmlFor={key} className="text-sm font-medium text-booking-dark">
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
            <h3 className="text-xl font-bold text-booking-dark mb-6">Additional Information</h3>
            
            <div>
              <label htmlFor="additionalInfo" className="block text-sm font-medium text-booking-dark mb-2">
                Additional Information
              </label>
              <textarea
                {...register('additionalInfo')}
                rows={4}
                className="w-full px-4 py-3 border border-booking-teal rounded focus:outline-none focus:ring-2 focus:ring-booking-teal focus:border-transparent text-base"
                placeholder="Add any special features, rules, notes, or other information about the property..."
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 bg-gray-100 text-booking-dark font-medium py-3 px-6 rounded hover:bg-gray-200 transition-all duration-200 text-base"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-booking-teal text-white font-bold py-3 px-6 rounded hover:bg-opacity-90 transition-all duration-200 text-base"
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
  );
}




