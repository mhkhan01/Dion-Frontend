'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import Navbar from '@/components/Navbar';

interface DashboardStats {
  totalBookings: number;
  totalProperties: number;
  totalUsers: number;
  pendingBookings: number;
  paidBookings: number;
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
    price: number;
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

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
      return;
    }

    if (user && user.role !== 'admin') {
      router.push('/');
      return;
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const token = (await import('@/lib/supabase')).supabase.auth.getSession();
      const session = await token;
      
      if (!session.data.session) {
        throw new Error('No session found');
      }

      // Fetch dashboard stats
      const statsResponse = await fetch(`https://jfgm6v6pkw.us-east-1.awsapprunner.com/api/admin/dashboard`, {
        headers: {
          'Authorization': `Bearer ${session.data.session.access_token}`,
        },
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.stats);
      }

      // Fetch recent bookings
      const bookingsResponse = await fetch(`https://jfgm6v6pkw.us-east-1.awsapprunner.com/api/admin/bookings?limit=20`, {
        headers: {
          'Authorization': `Bearer ${session.data.session.access_token}`,
        },
      });

      if (bookingsResponse.ok) {
        const bookingsData = await bookingsResponse.json();
        setBookings(bookingsData.bookings);
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleConfirmBooking = async (bookingId: string, status: 'confirmed' | 'cancelled') => {
    try {
      const token = (await import('@/lib/supabase')).supabase.auth.getSession();
      const session = await token;
      
      if (!session.data.session) {
        throw new Error('No session found');
      }

      const response = await fetch(`https://jfgm6v6pkw.us-east-1.awsapprunner.com/api/admin/bookings/${bookingId}/confirm`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.data.session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        // Refresh the bookings list
        fetchDashboardData();
      } else {
        alert('Failed to update booking status');
      }
    } catch (error) {
      console.error('Error confirming booking:', error);
      alert('Failed to update booking status');
    }
  };

  if (loading || loadingData) {
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
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Manage all bookings, properties, and users across the platform
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <div className="card p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">Total Bookings</h3>
                  <p className="text-2xl font-bold text-blue-600">{stats.totalBookings}</p>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">Properties</h3>
                  <p className="text-2xl font-bold text-green-600">{stats.totalProperties}</p>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">Users</h3>
                  <p className="text-2xl font-bold text-purple-600">{stats.totalUsers}</p>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">Pending</h3>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pendingBookings}</p>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">Paid</h3>
                  <p className="text-2xl font-bold text-indigo-600">{stats.paidBookings}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bookings Table */}
        <div className="card">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">All Bookings</h2>
          </div>
          <AdminBookingTable 
            bookings={bookings} 
            onConfirmBooking={handleConfirmBooking}
          />
        </div>
      </div>
    </div>
  );
}

// Admin-specific booking table with action buttons
function AdminBookingTable({ bookings, onConfirmBooking }: { 
  bookings: Booking[], 
  onConfirmBooking: (id: string, status: 'confirmed' | 'cancelled') => void 
}) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="badge badge-warning">Pending</span>;
      case 'confirmed':
        return <span className="badge badge-info">Confirmed</span>;
      case 'cancelled':
        return <span className="badge badge-danger">Cancelled</span>;
      case 'paid':
        return <span className="badge badge-success">Paid</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  if (bookings.length === 0) {
    return (
      <div className="px-6 py-12 text-center">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No bookings</h3>
        <p className="mt-1 text-sm text-gray-500">No bookings have been created yet.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="table">
        <thead className="table-header">
          <tr>
            <th className="table-header-cell">Property</th>
            <th className="table-header-cell">Contractor</th>
            <th className="table-header-cell">Dates</th>
            <th className="table-header-cell">Amount</th>
            <th className="table-header-cell">Status</th>
            <th className="table-header-cell">Actions</th>
            <th className="table-header-cell">Created</th>
          </tr>
        </thead>
        <tbody className="table-body">
          {bookings.map((booking) => {
            const startDate = new Date(booking.start_date);
            const endDate = new Date(booking.end_date);
            const numberOfDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
            const totalAmount = booking.property.price * numberOfDays;

            return (
              <tr key={booking.id} className="hover:bg-gray-50">
                <td className="table-cell">
                  <div>
                    <div className="font-medium text-gray-900">{booking.property.title}</div>
                    <div className="text-sm text-gray-500">{booking.property.address}</div>
                  </div>
                </td>
                <td className="table-cell">
                  <div className="font-medium text-gray-900">{booking.contractor.full_name}</div>
                </td>
                <td className="table-cell">
                  <div className="text-sm">
                    <div>{format(startDate, 'MMM dd, yyyy')}</div>
                    <div className="text-gray-500">to {format(endDate, 'MMM dd, yyyy')}</div>
                    <div className="text-xs text-gray-400">{numberOfDays} days</div>
                  </div>
                </td>
                <td className="table-cell">
                  <div className="font-medium">${totalAmount.toFixed(2)}</div>
                  <div className="text-sm text-gray-500">${booking.property.price}/day</div>
                </td>
                <td className="table-cell">
                  {getStatusBadge(booking.status)}
                </td>
                <td className="table-cell">
                  {booking.status === 'pending' && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onConfirmBooking(booking.id, 'confirmed')}
                        className="btn btn-primary text-xs px-3 py-1"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => onConfirmBooking(booking.id, 'cancelled')}
                        className="btn btn-danger text-xs px-3 py-1"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </td>
                <td className="table-cell">
                  <div className="text-sm text-gray-500">
                    {format(new Date(booking.created_at), 'MMM dd, yyyy')}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
