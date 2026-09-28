'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { FoodListing, FoodCategory } from '@/types';
import { FoodCard } from '@/components/FoodCard';
import { ReservationModal } from '@/components/ReservationModal';
import { 
  BANGALORE_NEIGHBORHOODS, 
  NeighborhoodLocation, 
  resolveNeighborhood 
} from '@/lib/neighborhoods';
import { Search, MapPin, SlidersHorizontal, Leaf, X, ChevronDown, Check } from 'lucide-react';

const CATEGORIES: { label: string; value?: FoodCategory }[] = [
  { label: 'All Items' },
  { label: 'Warm Meals', value: 'MEALS' },
  { label: 'Bakery & Bread', value: 'BAKERY' },
  { label: 'Fresh Produce', value: 'PRODUCE' },
  { label: 'Groceries', value: 'GROCERY' },
  { label: 'Snacks & Quick Bites', value: 'SNACKS' },
];

function ConsumerDashboardContent() {
  const searchParams = useSearchParams();

  // Read URL query parameters
  const queryLocation = searchParams.get('location') || 'Bangalore Central';
  const queryLat = searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : 12.9716;
  const queryLng = searchParams.get('lng') ? parseFloat(searchParams.get('lng')!) : 77.5946;
  const querySearch = searchParams.get('search') || '';

  const [listings, setListings] = useState<FoodListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedListing, setSelectedListing] = useState<FoodListing | null>(null);

  // Active Discovery Location State
  const [locationName, setLocationName] = useState(queryLocation);
  const [userLat, setUserLat] = useState(queryLat);
  const [userLng, setUserLng] = useState(queryLng);
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);

  // Filters
  const [search, setSearch] = useState(querySearch);
  const [selectedCategory, setSelectedCategory] = useState<FoodCategory | undefined>(undefined);
  const [radiusKm, setRadiusKm] = useState(10);
  const [vegOnly, setVegOnly] = useState(false);

  // Keep state synchronized if URL search parameters change
  useEffect(() => {
    if (searchParams.get('location')) {
      setLocationName(searchParams.get('location')!);
    }
    if (searchParams.get('lat') && searchParams.get('lng')) {
      setUserLat(parseFloat(searchParams.get('lat')!));
      setUserLng(parseFloat(searchParams.get('lng')!));
    }
  }, [searchParams]);

  const loadListings = (lat = userLat, lng = userLng) => {
    setIsLoading(true);
    api.getNearbyListings(lat, lng, radiusKm, selectedCategory)
      .then((data) => {
        let filtered = data || [];
        if (vegOnly) {
          filtered = filtered.filter((item: FoodListing) => item.is_vegetarian);
        }
        if (search.trim()) {
          const q = search.toLowerCase();
          filtered = filtered.filter((item: FoodListing) => 
            item.title.toLowerCase().includes(q) || 
            item.provider?.business_name.toLowerCase().includes(q) ||
            item.provider?.address?.toLowerCase().includes(q)
          );
        }
        setListings(filtered);
      })
      .catch((err) => console.error('Failed to load nearby listings:', err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadListings(userLat, userLng);
  }, [userLat, userLng, radiusKm, selectedCategory, vegOnly]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadListings(userLat, userLng);
  };

  const handleNeighborhoodChange = (place: NeighborhoodLocation) => {
    setLocationName(place.name);
    setUserLat(place.lat);
    setUserLng(place.lng);
    setIsLocationDropdownOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
      
      {/* Top Uber Eats Style Search & Filter Bar */}
      <div className="mb-8">
        
        {/* Row 1: Search + Neighborhood Picker + Filters */}
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

          <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
            
            {/* Interactive Neighborhood Location Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsLocationDropdownOpen(!isLocationDropdownOpen)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-black text-white hover:bg-neutral-800 text-xs font-bold transition-all shadow-sm flex-shrink-0"
              >
                <MapPin className="w-3.5 h-3.5 text-[#06C167]" />
                <span className="max-w-[130px] truncate">{locationName}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isLocationDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isLocationDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl border border-neutral-200 shadow-2xl z-40 overflow-hidden divide-y divide-neutral-100">
                  <div className="px-4 py-2 bg-neutral-50 text-[10px] font-black uppercase tracking-wider text-neutral-400">
                    Switch Neighborhood
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {BANGALORE_NEIGHBORHOODS.map((place) => {
                      const isSelected = locationName.toLowerCase() === place.name.toLowerCase();
                      return (
                        <button
                          key={place.id}
                          type="button"
                          onClick={() => handleNeighborhoodChange(place)}
                          className={`w-full px-4 py-2.5 flex items-center justify-between text-left hover:bg-neutral-50 transition-colors ${
                            isSelected ? 'bg-neutral-100' : ''
                          }`}
                        >
                          <div>
                            <div className="text-xs font-bold text-black">{place.name}</div>
                            <div className="text-[10px] text-neutral-500 font-medium">{place.landmark}</div>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#06C167] stroke-[3]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Radius Filter Pill */}
            <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-neutral-100 border border-neutral-200 text-xs font-bold text-black flex-shrink-0">
              <span className="text-neutral-500">Radius:</span>
              <strong className="text-black">{radiusKm} km</strong>
              <input
                type="range"
                min="1"
                max="25"
                step="1"
                value={radiusKm}
                onChange={(e) => setRadiusKm(Number(e.target.value))}
                className="w-20 accent-black cursor-pointer h-1.5 bg-neutral-300 rounded-lg ml-1"
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
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-black tracking-tight">
            Surplus Deals in {locationName}
          </h2>
          <p className="text-xs text-neutral-500 font-medium mt-0.5">
            Showing fresh meals within {radiusKm} km of {locationName}
          </p>
        </div>
        <span className="text-xs font-semibold text-neutral-500 bg-neutral-100 px-3 py-1 rounded-full">
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
          <h3 className="text-lg font-black text-black mb-1">No surplus meals found in {locationName}</h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto mb-5 font-medium">
            Try expanding your search radius slider (up to 25 km) or switching neighborhoods.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <button
              onClick={() => { setRadiusKm(25); setSelectedCategory(undefined); setVegOnly(false); setSearch(''); }}
              className="px-6 py-2.5 bg-black text-white hover:bg-neutral-800 text-xs font-bold rounded-full transition-all"
            >
              Expand to 25 km Radius
            </button>
            <button
              onClick={() => {
                const central = BANGALORE_NEIGHBORHOODS[0];
                handleNeighborhoodChange(central);
              }}
              className="px-6 py-2.5 bg-neutral-200 hover:bg-neutral-300 text-black text-xs font-bold rounded-full transition-all"
            >
              Reset to Bangalore Central
            </button>
          </div>
        </div>
      )}

      {/* Reservation Modal */}
      <ReservationModal
        listing={selectedListing}
        onClose={() => setSelectedListing(null)}
        onSuccess={() => {
          loadListings(userLat, userLng);
        }}
      />

    </div>
  );
}

export default function ConsumerDashboard() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="h-10 bg-neutral-100 rounded-full animate-pulse mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-80 rounded-2xl bg-neutral-100 animate-pulse" />
          ))}
        </div>
      </div>
    }>
      <ConsumerDashboardContent />
    </Suspense>
  );
}
