'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { supabase } from '@/lib/supabase';

interface Property {
  id: string;
  title: string;
  description: string | null;
  address: string;
  lat: number | null;
  lng: number | null;
  price: number;
  created_at: string;
}

export default function PropertiesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loadingProperties, setLoadingProperties] = useState(true);

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
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching properties:', error);
        return;
      }

      setProperties(data || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoadingProperties(false);
    }
  };

  if (loading || loadingProperties) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Available Properties</h1>
          <p className="mt-2 text-gray-600">
            Browse and book properties for your projects
          </p>
        </div>

        {/* Properties Grid */}
        {properties.length === 0 ? (
          <div className="card p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No properties available</h3>
            <p className="mt-1 text-sm text-gray-500">Check back later for new property listings.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <div key={property.id} className="card p-6 hover:shadow-apple-lg transition-shadow duration-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{property.title}</h3>
                <p className="text-sm text-gray-600 mb-4">{property.address}</p>
                {property.description && (
                  <p className="text-sm text-gray-500 mb-4 line-clamp-3">{property.description}</p>
                )}
                <div className="flex justify-between items-center mb-4">
                  <span className="text-2xl font-bold text-primary-600">${property.price}</span>
                  <span className="text-sm text-gray-500">per day</span>
                </div>
                <div className="flex space-x-3">
                  <Link 
                    href={`/properties/${property.id}`}
                    className="btn btn-secondary flex-1"
                  >
                    View Details
                  </Link>
                  <Link 
                    href={`/client/properties/${property.id}/book`}
                    className="btn btn-primary flex-1"
                  >
                    Book Now
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
