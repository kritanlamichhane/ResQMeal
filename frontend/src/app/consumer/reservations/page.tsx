'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Reservation } from '@/types';
import { useAuth } from '@/lib/auth-context';
import { Clock, MapPin, CheckCircle2, AlertCircle, QrCode, Ban, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function ConsumerReservationsPage() {
  const { user } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionError, setActionError] = useState<string | null>(null);

  const loadReservations = () => {
    setIsLoading(true);
    api.getMyReservations()
      .then((data) => setReservations(data || []))
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadReservations();
  }, []);

  const handleCancel = async (id: number) => {
    if (!confirm('Are you sure you want to cancel this reservation? The inventory will be released immediately.')) return;
    try {
      await api.cancelReservation(id, 'User requested cancellation');
      loadReservations();
    } catch (err: any) {
      setActionError(err.message || 'Failed to cancel reservation.');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold">Confirmed / Ready for Pickup</span>;
      case 'COMPLETED':
        return <span className="px-2.5 py-1 bg-blue-100 text-blue-800 rounded-lg text-xs font-bold">Collected & Rescued</span>;
      case 'CANCELLED':
        return <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold">Cancelled</span>;
      case 'EXPIRED':
        return <span className="px-2.5 py-1 bg-rose-100 text-rose-800 rounded-lg text-xs font-bold">Expired</span>;
      default:
        return <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold">{status}</span>;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900">My Food Pickups</h1>
        <p className="text-xs text-gray-500 mt-1">
          Present your digital pickup code at the counter during the pickup window.
        </p>
      </div>

      {actionError && (
        <div className="p-3 mb-6 bg-red-50 text-red-700 rounded-2xl text-xs font-bold border border-red-200">
          {actionError}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((n) => (
            <div key={n} className="h-40 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : reservations.length > 0 ? (
        <div className="space-y-6">
          {reservations.map((res) => {
            const isConfirmed = res.status === 'CONFIRMED' || res.status === 'READY_FOR_PICKUP';
            return (
              <div
                key={res.id}
                className="bg-white rounded-3xl border border-gray-100 shadow-md p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:border-emerald-200 transition-all"
              >
                {/* Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getStatusBadge(res.status)}
                    <span className="text-xs text-gray-400">
                      Reserved on {new Date(res.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <h2 className="text-xl font-black text-gray-900">
                    {res.listing?.title || 'Surplus Meal Package'}
                  </h2>

                  <p className="text-xs font-semibold text-gray-500 mt-0.5">
                    {res.listing?.provider?.business_name || 'Restaurant Partner'} • {res.listing?.provider?.address || 'Bangalore'}
                  </p>

                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-600 font-medium">
                    <span>Quantity: <strong>{res.quantity} portions</strong></span>
                    <span>Total Paid: <strong>₹{res.total_price}</strong></span>
                    <span className="flex items-center gap-1 text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-md font-bold">
                      <Clock className="w-3.5 h-3.5" />
                      Pickup Deadline: {new Date(res.expires_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                {/* Pickup Code Voucher Card */}
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                  <div className="bg-emerald-50/70 border-2 border-dashed border-emerald-300 rounded-2xl px-5 py-3 text-center w-full sm:w-auto">
                    <span className="text-[10px] uppercase font-extrabold text-emerald-800 tracking-wider block">
                      Pickup Voucher
                    </span>
                    <div className="text-xl font-mono font-black text-emerald-700 tracking-wider">
                      {res.pickup_code}
                    </div>
                  </div>

                  {isConfirmed && (
                    <button
                      onClick={() => handleCancel(res.id)}
                      className="px-3.5 py-2.5 text-xs font-bold text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors flex items-center gap-1 w-full sm:w-auto justify-center"
                    >
                      <Ban className="w-3.5 h-3.5" /> Cancel
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 p-8">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">No reservations yet</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto mb-5">
            Discover fresh surplus meals near you and save money while preventing food waste.
          </p>
          <Link
            href="/consumer/dashboard"
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md inline-flex items-center gap-1.5"
          >
            Find Nearby Food <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

    </div>
  );
}
