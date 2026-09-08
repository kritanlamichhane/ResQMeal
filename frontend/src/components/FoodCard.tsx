'use client';

import React from 'react';
import { FoodListing } from '@/types';
import { Clock, MapPin, Sparkles, ShieldCheck } from 'lucide-react';

interface FoodCardProps {
  listing: FoodListing;
  onReserve: (listing: FoodListing) => void;
}

export function FoodCard({ listing, onReserve }: FoodCardProps) {
  const isDonation = listing.listing_type === 'DONATION' || listing.surplus_price === 0;
  const discountPct = isDonation 
    ? 100 
    : Math.round(((listing.original_price - listing.surplus_price) / listing.original_price) * 100);

  const formatPickupTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Today';
    }
  };

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden">
      
      {/* Thumbnail & Badges */}
      <div className="relative h-48 w-full overflow-hidden bg-gray-100">
        <img
          src={listing.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600'}
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Discount Badge */}
        <div className="absolute top-3 left-3 flex gap-2">
          {isDonation ? (
            <span className="px-2.5 py-1 bg-amber-500 text-white text-xs font-black rounded-lg shadow-md tracking-wide uppercase">
              Free Donation
            </span>
          ) : (
            <span className="px-2.5 py-1 bg-emerald-600 text-white text-xs font-black rounded-lg shadow-md tracking-wide">
              {discountPct}% OFF
            </span>
          )}

          {listing.is_vegetarian && (
            <span className="px-2 py-1 bg-white/90 backdrop-blur-sm text-green-700 text-[11px] font-bold rounded-lg border border-green-200">
              🌱 Veg
            </span>
          )}
        </div>

        {/* Remaining Inventory Badge */}
        <div className="absolute bottom-3 right-3">
          <span className={`px-2.5 py-1 text-xs font-bold rounded-lg backdrop-blur-md ${
            listing.remaining_quantity <= 3 
              ? 'bg-rose-500/90 text-white animate-pulse' 
              : 'bg-black/60 text-white'
          }`}>
            {listing.remaining_quantity} {listing.unit} left
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span className="font-semibold uppercase tracking-wider text-emerald-600">
              {listing.category}
            </span>
            {listing.distance_km !== undefined && (
              <span className="flex items-center gap-1 font-medium text-gray-600 bg-gray-50 px-2 py-0.5 rounded-md">
                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                {listing.distance_km} km away
              </span>
            )}
          </div>

          <h3 className="font-bold text-gray-900 text-lg group-hover:text-emerald-600 transition-colors line-clamp-1">
            {listing.title}
          </h3>

          <p className="text-xs text-gray-500 mt-1 line-clamp-1">
            {listing.provider?.business_name || 'Partner Kitchen'} • {listing.provider?.address || 'Bangalore'}
          </p>

          {listing.description && (
            <p className="text-xs text-gray-600 mt-2 line-clamp-2 leading-relaxed">
              {listing.description}
            </p>
          )}
        </div>

        {/* Bottom Actions & Time Window */}
        <div className="mt-4 pt-3 border-t border-gray-100">
          
          <div className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 px-2.5 py-1.5 rounded-lg mb-3">
            <Clock className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="font-medium">
              Pickup: {formatPickupTime(listing.pickup_start_time)} - {formatPickupTime(listing.pickup_end_time)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              {isDonation ? (
                <div className="text-lg font-black text-amber-600">FREE</div>
              ) : (
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl font-extrabold text-gray-900">
                    ₹{listing.surplus_price}
                  </span>
                  <span className="text-xs text-gray-400 line-through font-medium">
                    ₹{listing.original_price}
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={() => onReserve(listing)}
              disabled={listing.remaining_quantity === 0}
              className={`px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-all duration-200 ${
                listing.remaining_quantity === 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white hover:shadow-md'
              }`}
            >
              {listing.remaining_quantity === 0 ? 'Sold Out' : 'Reserve Meal'}
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
