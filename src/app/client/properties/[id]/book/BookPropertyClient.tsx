'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';

const bookingSchema = z.object({
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
}).refine((data) => new Date(data.end_date) > new Date(data.start_date), {
  message: "End date must be after start date",
  path: ["end_date"],
});

type BookingForm = z.infer<typeof bookingSchema>;

interface Property {
  id: string;
  title: string;
  description: string | null;
  address: string;
  lat: number | null;
  lng: number | null;
  price: number;
}

export default function BookPropertyClient() {
  const { user, loading } = useAuth();
  const params = useParams();
  const router = useRouter();
  const [property, setProperty] = useState<Property | null>(null);
  const [loadingProperty, setLoadingProperty] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<BookingForm>({
    resolver: zodResolver(bookingSchema),
  });

  const startDate = watch('start_date');
  const endDate = watch('end_date');

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

  useEffect(() => {
    if (params.id) {
      fetchProperty();
    }
  }, [params.id]);

  const fetchProperty = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', params.id as string)
        .single();

      if (error) {
        console.error('Error fetching property:', error);
        router.push('/client/properties');
        return;
      }

      setProperty(data);
    } catch (error) {
      console.error('Error fetching property:', error);
      router.push('/client/properties');
    } finally {
      setLoadingProperty(false);
    }
  };

  const onSubmit = async (data: BookingForm) => {
    if (!property || !user) return;

    setSubmitting(true);

    try {
      const token = await supabase.auth.getSession();
      
      if (!token.data.session) {
        throw new Error('No session found');
      }

      const response = await fetch(`https://jfgm6v6pkw.us-east-1.awsapprunner.com/api/bookings/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token.data.session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          property_id: property.id,
          start_date: data.start_date,
          end_date: data.end_date,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        router.push(`/client?booking=${result.booking.id}`);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create booking');
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  const calculateTotal = () => {
    if (!property || !startDate || !endDate) return 0;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    return days * property.price;
  };

  if (loading || loadingProperty) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  if (!user || !property) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-4 sm:mb-8">
          <button
            onClick={() => router.back()}
            className="btn btn-ghost mb-2 sm:mb-4 text-sm sm:text-base"
          >
            ← Back to Properties
          </button>
          <h1 className="text-xl sm:text-3xl font-bold text-gray-900">Book Property</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
          {/* Property Details */}
          <div className="card p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">{property.title}</h2>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 text-sm sm:text-base">Address</h3>
                <p className="text-gray-600 text-sm sm:text-base">{property.address}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 text-sm sm:text-base">Price</h3>
                <p className="text-xl sm:text-2xl font-bold text-primary-600">${property.price} per day</p>
              </div>
              {property.description && (
                <div>
                  <h3 className="font-medium text-gray-900 text-sm sm:text-base">Description</h3>
                  <p className="text-gray-600 text-sm sm:text-base">{property.description}</p>
                </div>
              )}
              {property.lat && property.lng && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">Location</h3>
                  <div className="w-full h-32 sm:h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                    <iframe
                      src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${property.lat},${property.lng}`}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Booking Form */}
          <div className="card p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Booking Details</h2>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
              <div>
                <label htmlFor="start_date" className="label text-sm sm:text-base">
                  Start Date
                </label>
                <input
                  {...register('start_date')}
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  className={`input text-sm sm:text-base ${errors.start_date ? 'input-error' : ''}`}
                />
                {errors.start_date && (
                  <p className="error-text text-xs sm:text-sm">{errors.start_date.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="end_date" className="label text-sm sm:text-base">
                  End Date
                </label>
                <input
                  {...register('end_date')}
                  type="date"
                  min={startDate || new Date().toISOString().split('T')[0]}
                  className={`input text-sm sm:text-base ${errors.end_date ? 'input-error' : ''}`}
                />
                {errors.end_date && (
                  <p className="error-text text-xs sm:text-sm">{errors.end_date.message}</p>
                )}
              </div>

              {/* Booking Summary */}
              {startDate && endDate && (
                <div className="bg-gray-50 rounded-xl p-3 sm:p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Booking Summary</h3>
                  <div className="space-y-2 text-xs sm:text-sm">
                    <div className="flex justify-between">
                      <span>Daily Rate:</span>
                      <span>${property.price}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Number of Days:</span>
                      <span>{Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-semibold">
                      <span>Total:</span>
                      <span className="text-primary-600">${calculateTotal().toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Terms and Conditions */}
              <div className="pt-2">
                <p className="text-xs sm:text-sm text-gray-600 text-center">
                  By submitting, you agree to our{' '}
                  <a 
                    href="/terms" 
                    className="text-primary-600 hover:text-primary-700 underline font-medium"
                  >
                    Client Terms & Conditions
                  </a>
                  .
                </p>
              </div>

              <button
                type="submit"
                disabled={submitting || !startDate || !endDate}
                className="btn btn-primary w-full text-sm sm:text-base py-2 sm:py-3"
              >
                {submitting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white mr-2"></div>
                    Creating Booking...
                  </div>
                ) : (
                  'Create Booking Request'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}



