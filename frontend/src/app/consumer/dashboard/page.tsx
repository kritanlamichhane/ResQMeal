'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { FoodListing, FoodCategory } from '@/types';
import { FoodCard } from '@/components/FoodCard';
import { ReservationModal } from '@/components/ReservationModal';
import { Search, MapPin, SlidersHorizontal, Leaf, X } from 'lucide-react';

const CATEGORIES: { label: string; value?: FoodCategory }[] = [
  { label: 'All Items' },
  { label: 'Warm Meals', value: 'MEALS' },
  { label: 'Bakery & Bread', value: 'BAKERY' },
  { label: 'Fresh Produce', value: 'PRODUCE' },
  { label: 'Groceries', value: 'GROCERY' },
  { label: 'Snacks & Quick Bites', value: 'SNACKS' },
];

export default function ConsumerDashboard() {
  const [listings, setListings] = useState<FoodListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedListing, setSelectedListing] = useState<FoodListing | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FoodCategory | undefined>(undefined);
  const [radiusKm, setRadiusKm] = useState(10);
  const [vegOnly, setVegOnly] = useState(false);

  const userLat = 12.9716;
  const userLng = 77.5946;

  const loadListings = () => {
    setIsLoading(true);
    api.getNearbyListings(userLat, userLng, radiusKm, selectedCategory)
      .then((data) => {
        let filtered = data || [];
        if (vegOnly) {
          filtered = filtered.filter((item: FoodListing) => item.is_vegetarian);
        }
        if (search.trim()) {
          const q = search.toLowerCase();
          filtered = filtered.filter((item: FoodListing) => 
            item.title.toLowerCase().includes(q) || 
            item.provider?.business_name.toLowerCase().includes(q)
          );
        }
        setListings(filtered);
      })
      .catch((err) => console.error('Failed to load nearby listings:', err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadListings();
  }, [radiusKm, selectedCategory, vegOnly]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadListings();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
      
      {/* Top Uber Eats Style Search & Filter Bar */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          
          {/* Main Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search className="w-5 h-5 text-black absolute left-4 top-3.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search surplus meals, bakery, or restaurants..."
              className="w-full pl-12 pr-4 py-3 rounded-full bg-neutral-100 hover:bg-neutral-200/80 focus:bg-white text-sm font-semibold text-black placeholder-neutral-500 border border-transparent focus:border-black focus:outline-none transition-all"
            />
          </form>

          <div className="flex items-center gap-3 overflow-x-auto pb-1">
            
            {/* Radius Filter Pill */}
            <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-neutral-100 border border-neutral-200 text-xs font-bold text-black flex-shrink-0">
              <MapPin className="w-4 h-4 text-black" />
              <span>Radius: <strong className="text-black">{radiusKm} km</strong></span>
              <input
                type="range"
                min="1"
                max="25"
                step="1"
                value={radiusKm}
                onChange={(e) => setRadiusKm(Number(e.target.value))}
                className="w-24 accent-black cursor-pointer h-1.5 bg-neutral-300 rounded-lg ml-1"
              />
            </div>

            {/* Pure Veg Pill */}
            <button
              type="button"
              onClick={() => setVegOnly(!vegOnly)}
              className={`px-4 py-2.5 rounded-full text-xs font-bold border transition-all flex items-center gap-1.5 flex-shrink-0 ${
                vegOnly 
                  ? 'bg-black text-white border-black shadow-sm' 
                  : 'bg-neutral-100 text-neutral-800 border-neutral-200 hover:bg-neutral-200'
              }`}
            >
              <Leaf className={`w-3.5 h-3.5 ${vegOnly ? 'text-[#06C167]' : 'text-green-700'}`} />
              Pure Veg
            </button>

          </div>

        </div>

        {/* Uber Eats Category Pills */}
        <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-2 no-scrollbar">
          {CATEGORIES.map((cat, idx) => {
            const isSelected = selectedCategory === cat.value;
            return (
              <button
                key={idx}
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-black text-white shadow-sm'
                    : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Results Summary */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl sm:text-2xl font-black text-black tracking-tight">
          Nearby Deals in Bangalore
        </h2>
        <span className="text-xs font-semibold text-neutral-500">
          {listings.length} items found
        </span>
      </div>

      {/* Listings Grid (Uber Eats Cards) */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-80 rounded-2xl bg-neutral-100 animate-pulse" />
          ))}
        </div>
      ) : listings.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <FoodCard
              key={listing.id}
              listing={listing}
              onReserve={(l) => setSelectedListing(l)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-neutral-50 rounded-3xl border border-neutral-200 p-8">
          <div className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center mx-auto mb-4 border border-neutral-200 shadow-sm">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-black text-black mb-1">No surplus meals found</h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto mb-5 font-medium">
            Try expanding your search radius slider or changing category filters.
          </p>
          <button
            onClick={() => { setRadiusKm(25); setSelectedCategory(undefined); setVegOnly(false); setSearch(''); }}
            className="px-6 py-2.5 bg-black text-white hover:bg-neutral-800 text-xs font-bold rounded-full transition-all"
          >
            Reset Filters (25 km Radius)
          </button>
        </div>
      )}

      {/* Reservation Modal */}
      <ReservationModal
        listing={selectedListing}
        onClose={() => setSelectedListing(null)}
        onSuccess={() => {
          loadListings();
        }}
      />

    </div>
  );
}
