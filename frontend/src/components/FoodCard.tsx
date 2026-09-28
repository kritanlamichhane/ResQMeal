'use client';

import React from 'react';
import { FoodListing } from '@/types';
import { Clock, MapPin, Star, ArrowUpRight } from 'lucide-react';

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
    <div className="group bg-white rounded-2xl border border-neutral-200/80 hover:border-black transition-all duration-200 flex flex-col overflow-hidden hover:shadow-xl cursor-pointer">
      
      {/* Uber Eats Style Image with Overlays */}
      <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-neutral-100">
        <img
          src={listing.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600'}
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex gap-1.5 items-center">
          {isDonation ? (
            <span className="px-2.5 py-1 bg-black text-white text-[11px] font-bold rounded-md uppercase tracking-wider">
              Free Rescue
            </span>
          ) : (
            <span className="px-2.5 py-1 bg-[#06C167] text-black text-xs font-black rounded-md shadow-sm tracking-tight">
              {discountPct}% OFF
            </span>
          )}

          {listing.is_vegetarian ? (
            <span className="px-2 py-0.5 bg-white/95 text-emerald-800 text-[10px] font-black rounded-md border border-emerald-200/80 flex items-center gap-1 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              Pure Veg
            </span>
          ) : (
            <span className="px-2 py-0.5 bg-white/95 text-rose-800 text-[10px] font-black rounded-md border border-rose-200/80 flex items-center gap-1 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
              Non-Veg
            </span>
          )}
        </div>

        {/* Remaining Units Chip */}
        <div className="absolute bottom-3 right-3">
          <span className={`px-2.5 py-1 text-xs font-bold rounded-full backdrop-blur-md ${
            listing.remaining_quantity <= 3 
              ? 'bg-rose-600 text-white' 
              : 'bg-black/80 text-white'
          }`}>
            {listing.remaining_quantity} {listing.unit} left
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Header Row: Category & Rating */}
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-bold text-neutral-500 tracking-wider uppercase text-[11px]">
              {listing.category}
            </span>
            <div className="flex items-center gap-1 font-bold text-neutral-900 bg-neutral-100 px-2 py-0.5 rounded-full text-[11px]">
              <Star className="w-3 h-3 fill-current text-black" />
              <span>4.8</span>
            </div>
          </div>

          <h3 className="font-extrabold text-neutral-900 text-lg tracking-tight group-hover:text-black line-clamp-1">
            {listing.title}
          </h3>

          <p className="text-xs text-neutral-500 font-medium mt-0.5 line-clamp-1">
            {listing.provider?.business_name || 'Verified Kitchen'} • {listing.provider?.address || 'Bangalore'}
          </p>

          {listing.description && (
            <p className="text-xs text-neutral-600 mt-2 line-clamp-2 leading-relaxed font-normal">
              {listing.description}
            </p>
          )}
        </div>

        {/* Footer Row: Pickup time & Price/Action */}
        <div className="mt-4 pt-3 border-t border-neutral-100">
          
          <div className="flex items-center justify-between text-xs text-neutral-600 mb-3">
            <div className="flex items-center gap-1 text-neutral-700 font-medium bg-neutral-50 px-2 py-1 rounded-md">
              <Clock className="w-3.5 h-3.5 text-neutral-500" />
              <span>{formatPickupTime(listing.pickup_start_time)} – {formatPickupTime(listing.pickup_end_time)}</span>
            </div>

            {listing.distance_km !== undefined && (
              <span className="flex items-center gap-1 font-semibold text-neutral-500 text-[11px]">
                <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                {listing.distance_km} km
              </span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div>
              {isDonation ? (
                <div className="text-lg font-black text-[#05944F]">FREE</div>
              ) : (
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl font-black text-black tracking-tight">
                    ₹{listing.surplus_price}
                  </span>
                  <span className="text-xs text-neutral-400 line-through font-medium">
                    ₹{listing.original_price}
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={() => onReserve(listing)}
              disabled={listing.remaining_quantity === 0}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-150 ${
                listing.remaining_quantity === 0
                  ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                  : 'bg-black text-white hover:bg-neutral-800 active:scale-95 shadow-sm'
              }`}
            >
              {listing.remaining_quantity === 0 ? 'Sold Out' : 'Reserve'}
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
