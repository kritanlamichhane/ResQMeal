'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Reservation } from '@/types';
import { useAuth } from '@/lib/auth-context';
import { Clock, MapPin, CheckCircle2, Ban, ArrowRight, ReceiptText } from 'lucide-react';
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
    if (!confirm('Are you sure you want to cancel this order? The items will be returned to store inventory immediately.')) return;
    try {
      await api.cancelReservation(id, 'User requested cancellation');
      loadReservations();
    } catch (err: any) {
      setActionError(err.message || 'Failed to cancel order.');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <span className="px-3 py-1 bg-[#E8F8EE] text-[#05944F] rounded-full text-xs font-bold">Ready for Pickup</span>;
      case 'COMPLETED':
        return <span className="px-3 py-1 bg-neutral-100 text-neutral-800 rounded-full text-xs font-bold">Collected</span>;
      case 'CANCELLED':
        return <span className="px-3 py-1 bg-neutral-100 text-neutral-500 rounded-full text-xs font-bold">Cancelled</span>;
      case 'EXPIRED':
        return <span className="px-3 py-1 bg-rose-50 text-rose-700 rounded-full text-xs font-bold">Expired</span>;
      default:
        return <span className="px-3 py-1 bg-neutral-100 text-neutral-800 rounded-full text-xs font-bold">{status}</span>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans">
      
      <div className="mb-8">
        <h1 className="text-3xl font-black text-black tracking-tight">Your Food Orders</h1>
        <p className="text-xs text-neutral-500 font-medium mt-1">
          Present your pickup code at the counter during the collection window.
        </p>
      </div>

      {actionError && (
        <div className="p-3 mb-6 bg-rose-50 text-rose-800 rounded-2xl text-xs font-bold border border-rose-200">
          {actionError}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((n) => (
            <div key={n} className="h-40 bg-neutral-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : reservations.length > 0 ? (
        <div className="space-y-4">
          {reservations.map((res) => {
            const isConfirmed = res.status === 'CONFIRMED' || res.status === 'READY_FOR_PICKUP';
            return (
              <div
                key={res.id}
                className="bg-white rounded-2xl border border-neutral-200/80 hover:border-black transition-all p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm"
              >
                {/* Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getStatusBadge(res.status)}
                    <span className="text-xs text-neutral-400 font-medium">
                      {new Date(res.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <h2 className="text-xl font-black text-black tracking-tight">
                    {res.listing?.title || 'Surplus Meal Package'}
                  </h2>

                  <p className="text-xs font-semibold text-neutral-500 mt-0.5">
                    {res.listing?.provider?.business_name || 'Kitchen Partner'} • {res.listing?.provider?.address || 'Bangalore'}
                  </p>

                  <div className="flex items-center gap-4 mt-3 text-xs text-neutral-700 font-medium">
                    <span>Quantity: <strong className="text-black">{res.quantity} portions</strong></span>
                    <span>Total: <strong className="text-black">₹{res.total_price}</strong></span>
                    <span className="flex items-center gap-1 text-black font-semibold bg-neutral-100 px-2 py-0.5 rounded-md">
                      <Clock className="w-3.5 h-3.5 text-neutral-500" />
                      Pickup Deadline: {new Date(res.expires_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                {/* Pickup Code Card (Uber Voucher Style) */}
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                  <div className="bg-neutral-50 border border-neutral-200 rounded-2xl px-5 py-3 text-center w-full sm:w-auto">
                    <span className="text-[10px] uppercase font-extrabold text-neutral-400 tracking-widest block">
                      Voucher Code
                    </span>
                    <div className="text-2xl font-mono font-black text-black tracking-wider">
                      {res.pickup_code}
                    </div>
                  </div>

                  {isConfirmed && (
                    <button
                      onClick={() => handleCancel(res.id)}
                      className="px-4 py-2.5 text-xs font-bold text-neutral-500 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors flex items-center gap-1 w-full sm:w-auto justify-center"
                    >
                      <Ban className="w-3.5 h-3.5" /> Cancel Order
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-neutral-50 rounded-3xl border border-neutral-200 p-8">
          <div className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center mx-auto mb-4 border border-neutral-200 shadow-sm">
            <ReceiptText className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-black text-black mb-1">No orders yet</h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto mb-5 font-medium">
            Explore discounted surplus food from restaurants and bakeries near you.
          </p>
          <Link
            href="/consumer/dashboard"
            className="px-6 py-3 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded-full transition-all inline-flex items-center gap-2 shadow-md"
          >
            Find Food Deals <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

    </div>
  );
}
