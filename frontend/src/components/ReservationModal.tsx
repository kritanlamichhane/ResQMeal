'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { FoodListing } from '@/types';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { X, CheckCircle2, AlertTriangle, ShieldCheck, Clock, ArrowRight, User } from 'lucide-react';

interface ReservationModalProps {
  listing: FoodListing | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function ReservationModal({ listing, onClose, onSuccess }: ReservationModalProps) {
  const { user, quickLoginAs } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<any | null>(null);

  if (!listing) return null;

  const unitPrice = listing.surplus_price;
  const totalPrice = Math.round(unitPrice * quantity * 100) / 100;
  const maxQty = listing.remaining_quantity;

  const handleReserve = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (!user) {
        // Automatically activate demo consumer session so guest can reserve immediately
        await quickLoginAs('CONSUMER');
      }

      const res = await api.reserveFood(listing.id, quantity);
      setSuccessData(res);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Unable to reserve food. Inventory may have just been claimed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative border border-neutral-200 overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-neutral-400 hover:text-black rounded-full hover:bg-neutral-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {!successData ? (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-neutral-100 text-neutral-800">
                {listing.category}
              </span>
              <span className="text-xs text-neutral-500 font-medium">
                {maxQty} portions in stock
              </span>
            </div>

            <h2 className="text-2xl font-black text-black tracking-tight mb-1">
              {listing.title}
            </h2>
            <p className="text-xs text-neutral-500 font-medium mb-5">
              Sold by {listing.provider?.business_name || 'Verified Merchant'}
            </p>

            {/* Price & Quantity Controls (Uber Style) */}
            <div className="bg-neutral-50 rounded-2xl p-4 mb-4 border border-neutral-200">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-bold text-neutral-800">Select Portions</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="w-8 h-8 rounded-full bg-white border border-neutral-300 flex items-center justify-center font-bold text-black disabled:opacity-30 hover:bg-neutral-100 transition-colors"
                  >
                    -
                  </button>
                  <span className="w-6 text-center font-black text-black text-base">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(maxQty, quantity + 1))}
                    disabled={quantity >= maxQty}
                    className="w-8 h-8 rounded-full bg-white border border-neutral-300 flex items-center justify-center font-bold text-black disabled:opacity-30 hover:bg-neutral-100 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-neutral-200">
                <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Subtotal</span>
                <span className="text-2xl font-black text-black tracking-tight">
                  {listing.surplus_price === 0 ? 'FREE' : `₹${totalPrice}`}
                </span>
              </div>
            </div>

            {/* Food Safety Compliance Tag */}
            <div className="bg-neutral-100 rounded-xl p-3 mb-5 flex items-start gap-2.5 text-xs text-neutral-700">
              <ShieldCheck className="w-4 h-4 text-[#06C167] flex-shrink-0 mt-0.5" />
              <span>Prepared fresh today in a certified commercial kitchen. FSSAI food safety compliant.</span>
            </div>

            {error && (
              <div className="bg-rose-50 text-rose-800 p-3 rounded-xl text-xs mb-4 flex items-center gap-2 border border-rose-200 font-medium">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            {!user && (
              <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-3.5 mb-4 text-xs">
                <div className="flex items-center justify-between font-bold text-neutral-800 mb-1">
                  <span className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-neutral-500" /> Reserving as Guest
                  </span>
                  <div className="flex items-center gap-2">
                    <Link href="/login" className="text-black underline font-extrabold hover:text-neutral-700">
                      Sign In
                    </Link>
                    <span className="text-neutral-300">•</span>
                    <Link href="/register" className="text-black underline font-extrabold hover:text-neutral-700">
                      Sign Up
                    </Link>
                  </div>
                </div>
                <p className="text-[11px] text-neutral-500 font-medium">
                  Confirming will activate a session and reserve your instant pickup voucher.
                </p>
              </div>
            )}

            {/* Uber Primary Action Pill */}
            <button
              onClick={handleReserve}
              disabled={isLoading || maxQty === 0}
              className="w-full py-4 px-6 bg-black hover:bg-neutral-800 text-white rounded-full font-extrabold text-sm transition-all duration-150 disabled:opacity-40 flex items-center justify-center gap-2 active:scale-98 shadow-md"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>Confirm Reservation • {listing.surplus_price === 0 ? 'FREE' : `₹${totalPrice}`}</>
              )}
            </button>
          </div>
        ) : (
          /* Confirmation Screen */
          <div className="text-center py-4">
            <div className="w-14 h-14 bg-[#E8F8EE] text-[#06C167] rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h3 className="text-2xl font-black text-black tracking-tight mb-1">
              Pickup Confirmed
            </h3>
            <p className="text-xs text-neutral-500 font-medium mb-6">
              Your surplus order is securely held via atomic locking.
            </p>

            <div className="bg-neutral-50 border-2 border-dashed border-neutral-300 rounded-2xl p-5 mb-6">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block mb-1">
                Storefront Pickup Code
              </span>
              <div className="text-3xl font-mono font-black text-black tracking-widest">
                {successData.pickup_code}
              </div>
              <p className="text-[11px] text-neutral-500 mt-1 font-medium">
                Show this voucher code at the counter during your pickup window.
              </p>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3.5 bg-black hover:bg-neutral-800 text-white rounded-full font-bold text-sm transition-all"
            >
              View in My Orders
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
