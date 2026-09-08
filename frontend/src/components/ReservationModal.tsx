'use client';

import React, { useState } from 'react';
import { FoodListing } from '@/types';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { X, CheckCircle2, AlertTriangle, ShieldCheck, QrCode } from 'lucide-react';

interface ReservationModalProps {
  listing: FoodListing | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function ReservationModal({ listing, onClose, onSuccess }: ReservationModalProps) {
  const { user } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<any | null>(null);

  if (!listing) return null;

  const unitPrice = listing.surplus_price;
  const totalPrice = Math.round(unitPrice * quantity * 100) / 100;
  const maxQty = listing.remaining_quantity;

  const handleReserve = async () => {
    if (!user) {
      setError('Please sign in or use demo login to reserve meals.');
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      const res = await api.reserveFood(listing.id, quantity);
      setSuccessData(res);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Unable to reserve food. The item might have just been booked.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative border border-gray-100 overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {!successData ? (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800">
                {listing.category}
              </span>
              <span className="text-xs text-gray-500">
                Max {maxQty} portions available
              </span>
            </div>

            <h2 className="text-xl font-extrabold text-gray-900 mb-1">
              {listing.title}
            </h2>
            <p className="text-xs text-gray-500 mb-4">
              From {listing.provider?.business_name || 'Partner Kitchen'}
            </p>

            {/* Price & Quantity Controls */}
            <div className="bg-gray-50 rounded-2xl p-4 mb-4 border border-gray-100">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-medium text-gray-600">Select Portions</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center font-bold text-gray-700 disabled:opacity-40 hover:bg-gray-50"
                  >
                    -
                  </button>
                  <span className="w-6 text-center font-black text-gray-900">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(maxQty, quantity + 1))}
                    disabled={quantity >= maxQty}
                    className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center font-bold text-gray-700 disabled:opacity-40 hover:bg-gray-50"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-gray-200 text-sm">
                <span className="text-gray-600 font-medium">Total Amount</span>
                <span className="text-xl font-black text-emerald-700">
                  {listing.surplus_price === 0 ? 'FREE' : `₹${totalPrice}`}
                </span>
              </div>
            </div>

            {/* Food Safety & Pickup Notice */}
            <div className="bg-emerald-50/70 rounded-xl p-3 mb-4 border border-emerald-100 flex items-start gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-emerald-900 leading-relaxed">
                Pickup within the scheduled window. You will receive an instant verification code to show the provider.
              </p>
            </div>

            {error && (
              <div className="bg-rose-50 text-rose-700 p-3 rounded-xl text-xs mb-4 flex items-center gap-2 border border-rose-200">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={handleReserve}
              disabled={isLoading || maxQty === 0}
              className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>Lock & Confirm Reservation</>
              )}
            </button>
          </div>
        ) : (
          /* Confirmation Screen with Voucher */
          <div className="text-center py-2">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-extrabold text-gray-900 mb-1">
              Reservation Locked! 🎉
            </h3>
            <p className="text-xs text-gray-600 mb-4">
              Your surplus food has been atomically reserved.
            </p>

            <div className="bg-gray-50 border-2 border-dashed border-emerald-400 rounded-2xl p-5 mb-5">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                Digital Pickup Voucher Code
              </span>
              <div className="text-2xl font-mono font-black text-emerald-700 tracking-wider">
                {successData.pickup_code}
              </div>
              <p className="text-[11px] text-gray-400 mt-1">
                Show this code at the store counter upon arrival.
              </p>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-bold text-sm transition-colors"
            >
              View in My Pickups
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
