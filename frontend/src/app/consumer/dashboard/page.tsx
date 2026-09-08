'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { FoodListing, FoodCategory } from '@/types';
import { FoodCard } from '@/components/FoodCard';
import { ReservationModal } from '@/components/ReservationModal';
import { Search, MapPin, SlidersHorizontal, Sparkles, Filter, Leaf } from 'lucide-react';

const CATEGORIES: { label: string; value?: FoodCategory }[] = [
  { label: 'All Items' },
  { label: 'Warm Meals', value: 'MEALS' },
  { label: 'Bakery & Bread', value: 'BAKERY' },
  { label: 'Fresh Produce', value: 'PRODUCE' },
  { label: 'Grocery', value: 'GROCERY' },
  { label: 'Snacks & Bites', value: 'SNACKS' },
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

  // Coordinates: Default to Bangalore central coords
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl mb-8 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5" /> PostGIS & Haversine Proximity Search
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
            Surplus Meals Near You
          </h1>
          <p className="mt-2 text-sm text-emerald-100">
            Fresh, safe surplus prepared by local restaurants and bakeries. Up to 70% off.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-md mb-8">
        
        <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center mb-6">
          
          {/* Keyword Search */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by meal name, bakery, biryani, or restaurant..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </form>

          {/* Distance Slider */}
          <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-2xl border border-gray-200">
            <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                Radius: <strong className="text-emerald-700">{radiusKm} km</strong>
              </span>
              <input
                type="range"
                min="1"
                max="25"
                step="1"
                value={radiusKm}
                onChange={(e) => setRadiusKm(Number(e.target.value))}
                className="w-32 accent-emerald-600 cursor-pointer h-1.5 bg-gray-200 rounded-lg"
              />
            </div>
          </div>

          {/* Veg Only Toggle */}
          <button
            type="button"
            onClick={() => setVegOnly(!vegOnly)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
              vegOnly 
                ? 'bg-green-100 text-green-800 border-green-300 shadow-sm' 
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            <Leaf className="w-4 h-4 text-green-600" /> Veg Only
          </button>

        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {CATEGORIES.map((cat, idx) => {
            const isSelected = selectedCategory === cat.value;
            return (
              <button
                key={idx}
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

      </div>

      {/* Listings Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-80 rounded-2xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : listings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <FoodCard
              key={listing.id}
              listing={listing}
              onReserve={(l) => setSelectedListing(l)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 p-8">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">No surplus meals in this radius</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto mb-4">
            Try expanding the search radius slider or changing category filters to discover more food.
          </p>
          <button
            onClick={() => { setRadiusKm(20); setSelectedCategory(undefined); setVegOnly(false); setSearch(''); }}
            className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl"
          >
            Reset Filters (20km Radius)
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
