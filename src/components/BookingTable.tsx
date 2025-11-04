'use client';

import { format } from 'date-fns';

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
  contractor?: {
    full_name: string;
  };
  invoice?: {
    id: string;
    amount: number;
    status: 'unpaid' | 'paid';
    stripe_payment_url: string | null;
  };
}

interface BookingTableProps {
  bookings: Booking[];
  onPayment?: (bookingId: string) => void;
  userRole: 'contractor' | 'landlord' | 'admin';
}

export default function BookingTable({ bookings, onPayment, userRole }: BookingTableProps) {
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

  const getPaymentButton = (booking: Booking) => {
    if (booking.status !== 'confirmed') {
      return null;
    }

    if (booking.invoice?.status === 'paid') {
      return <span className="badge badge-success">Payment Complete</span>;
    }

    if (booking.invoice?.stripe_payment_url && onPayment) {
      return (
        <button
          onClick={() => window.open(booking.invoice!.stripe_payment_url!, '_blank')}
          className="btn btn-primary text-xs px-3 py-1"
        >
          Pay Now
        </button>
      );
    }

    if (onPayment) {
      return (
        <button
          onClick={() => onPayment(booking.id)}
          className="btn btn-primary text-xs px-3 py-1"
        >
          Create Payment
        </button>
      );
    }

    return null;
  };

  if (bookings.length === 0) {
    return (
      <div className="px-6 py-12 text-center">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No bookings</h3>
        <p className="mt-1 text-sm text-gray-500">
          {userRole === 'contractor' 
            ? "You haven't made any bookings yet."
            : "No bookings found for your properties."
          }
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="table">
        <thead className="table-header">
          <tr>
            <th className="table-header-cell">Property</th>
            <th className="table-header-cell">Dates</th>
            <th className="table-header-cell">Amount</th>
            <th className="table-header-cell">Status</th>
            {userRole === 'landlord' && (
              <th className="table-header-cell">Contractor</th>
            )}
            <th className="table-header-cell">Payment</th>
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
                {userRole === 'landlord' && booking.contractor && (
                  <td className="table-cell">
                    <div className="font-medium text-gray-900">{booking.contractor.full_name}</div>
                  </td>
                )}
                <td className="table-cell">
                  {getPaymentButton(booking)}
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
