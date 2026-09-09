'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { FoodListing, PlatformMetrics } from '@/types';
import { FoodCard } from '@/components/FoodCard';
import { ReservationModal } from '@/components/ReservationModal';
import { 
  ArrowRight, ShieldCheck, Zap, Utensils, 
  Leaf, HeartHandshake, Store, TrendingUp, Lock, MapPin, Search
} from 'lucide-react';

export default function HomePage() {
  const [metrics, setMetrics] = useState<PlatformMetrics | null>(null);
  const [featuredListings, setFeaturedListings] = useState<FoodListing[]>([]);
  const [selectedListing, setSelectedListing] = useState<FoodListing | null>(null);
  const [activeTab, setActiveTab] = useState<'consumer' | 'provider' | 'ngo'>('consumer');

  useEffect(() => {
    api.getPlatformMetrics().then(setMetrics).catch(() => {});
    api.getListings({ size: 3 }).then((d) => setFeaturedListings(d.items || [])).catch(() => {});
  }, []);

  return (
    <div className="flex flex-col min-h-screen font-sans bg-white text-black">
      
      {/* 1. Hero Section (Uber Website Style) */}
      <section className="relative bg-white pt-10 pb-20 border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content Column */}
            <div className="lg:col-span-7">
              
              {/* Uber Role Switcher Tabs */}
              <div className="inline-flex p-1.5 bg-neutral-100 rounded-full mb-8">
                <button
                  onClick={() => setActiveTab('consumer')}
                  className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
                    activeTab === 'consumer' ? 'bg-black text-white shadow-sm' : 'text-neutral-600 hover:text-black'
                  }`}
                >
                  <Utensils className="w-3.5 h-3.5" /> Order Food
                </button>
                <button
                  onClick={() => setActiveTab('provider')}
                  className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
                    activeTab === 'provider' ? 'bg-black text-white shadow-sm' : 'text-neutral-600 hover:text-black'
                  }`}
                >
                  <Store className="w-3.5 h-3.5" /> For Kitchens
                </button>
                <button
                  onClick={() => setActiveTab('ngo')}
                  className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
                    activeTab === 'ngo' ? 'bg-black text-white shadow-sm' : 'text-neutral-600 hover:text-black'
                  }`}
                >
                  <HeartHandshake className="w-3.5 h-3.5 text-[#06C167]" /> For Relief NGOs
                </button>
              </div>

              {/* Dynamic Headline Based on Uber Tab */}
              {activeTab === 'consumer' && (
                <div className="animate-in fade-in duration-200">
                  <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-black leading-[1.08] mb-6">
                    Order surplus food.<br />
                    Save up to <span className="text-[#06C167]">70%</span>.
                  </h1>
                  <p className="text-base sm:text-lg text-neutral-600 max-w-xl font-medium leading-relaxed mb-8">
                    Discover freshly prepared meals, pastries, and produce from top restaurants and bakeries near you before closing time.
                  </p>
                  
                  {/* Uber Style Search Bar */}
                  <div className="flex flex-col sm:flex-row gap-3 max-w-xl mb-6">
                    <div className="flex-1 flex items-center gap-3 px-4 py-3.5 bg-neutral-100 rounded-2xl border border-neutral-200">
                      <MapPin className="w-5 h-5 text-black flex-shrink-0" />
                      <input
                        type="text"
                        placeholder="Enter your neighborhood (e.g. Koramangala)"
                        defaultValue="Bangalore Central"
                        className="w-full bg-transparent text-sm font-semibold text-black placeholder-neutral-400 focus:outline-none"
                      />
                    </div>
                    <Link
                      href="/consumer/dashboard"
                      className="px-7 py-3.5 bg-black hover:bg-neutral-800 text-white font-extrabold rounded-2xl text-sm transition-all flex items-center justify-center gap-2 shadow-md flex-shrink-0"
                    >
                      Find Food <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              )}

              {activeTab === 'provider' && (
                <div className="animate-in fade-in duration-200">
                  <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-black leading-[1.08] mb-6">
                    Eliminate food waste.<br />
                    Recover <span className="text-[#06C167]">lost revenue</span>.
                  </h1>
                  <p className="text-base sm:text-lg text-neutral-600 max-w-xl font-medium leading-relaxed mb-8">
                    List your kitchen&apos;s daily surplus in under 60 seconds with AI dynamic pricing and image metadata extraction.
                  </p>
                  <div className="flex gap-3">
                    <Link
                      href="/provider/create-listing"
                      className="px-7 py-3.5 bg-black hover:bg-neutral-800 text-white font-extrabold rounded-2xl text-sm transition-all flex items-center gap-2 shadow-md"
                    >
                      Add Kitchen Surplus <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                      href="/provider/ai-surplus"
                      className="px-6 py-3.5 bg-neutral-100 hover:bg-neutral-200 text-black font-extrabold rounded-2xl text-sm transition-all flex items-center gap-2"
                    >
                      Try AI Surplus Predictor
                    </Link>
                  </div>
                </div>
              )}

              {activeTab === 'ngo' && (
                <div className="animate-in fade-in duration-200">
                  <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-black leading-[1.08] mb-6">
                    Connect kitchens to<br />
                    <span className="text-[#06C167]">community shelters</span>.
                  </h1>
                  <p className="text-base sm:text-lg text-neutral-600 max-w-xl font-medium leading-relaxed mb-8">
                    Claim 100% free food donations automatically matched to your shelter&apos;s daily meal capacity and dietary needs.
                  </p>
                  <Link
                    href="/ngo/dashboard"
                    className="inline-flex px-7 py-3.5 bg-black hover:bg-neutral-800 text-white font-extrabold rounded-2xl text-sm transition-all items-center gap-2 shadow-md"
                  >
                    Claim Free Donations <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}

              <div className="flex items-center gap-6 mt-8 pt-6 border-t border-neutral-100 text-xs text-neutral-500 font-semibold">
                <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-[#06C167]" /> FSSAI Certified Partners</span>
                <span className="flex items-center gap-1.5"><Lock className="w-4 h-4 text-black" /> Atomic Concurrency Locked</span>
              </div>

            </div>

            {/* Right Visual Card (Uber Eats Lifestyle Composition) */}
            <div className="lg:col-span-5">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-neutral-200 aspect-[4/3] lg:aspect-[1/1] bg-neutral-900">
                <img
                  src="https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=1000"
                  alt="Delicious surplus food"
                  className="w-full h-full object-cover opacity-90 hover:scale-105 transition-transform duration-700"
                />
                
                {/* Floating Uber Style Tag */}
                <div className="absolute top-6 left-6 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-lg border border-neutral-200">
                  <div className="text-[10px] uppercase font-black text-neutral-400 tracking-wider">Live Deal</div>
                  <div className="text-sm font-extrabold text-black">Artisan Bakery Box • ₹90 <span className="line-through text-neutral-400 font-medium">₹220</span></div>
                </div>

                <div className="absolute bottom-6 right-6 bg-black text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#06C167] animate-ping" />
                  <span className="text-xs font-bold">12 portions left nearby</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 2. Uber Metric Ticker */}
      <section className="py-12 bg-neutral-50 border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            
            <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-sm">
              <div className="text-3xl sm:text-4xl font-black text-black tracking-tight">
                {metrics?.total_meals_rescued || 1250}+
              </div>
              <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider mt-1">
                Meals Rescued
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-sm">
              <div className="text-3xl sm:text-4xl font-black text-black tracking-tight">
                {metrics?.total_food_weight_kg || 560} kg
              </div>
              <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider mt-1">
                Food Diverted
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-sm">
              <div className="text-3xl sm:text-4xl font-black text-black tracking-tight">
                ₹{metrics?.total_money_saved_consumers || 185000}
              </div>
              <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider mt-1">
                Consumer Savings
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-sm">
              <div className="text-3xl sm:text-4xl font-black text-[#06C167] tracking-tight">
                {metrics?.pickup_completion_rate_pct || 98.5}%
              </div>
              <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider mt-1">
                Fulfillment Rate
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. Featured Surplus Listings (Uber Eats Grid) */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex justify-between items-end mb-10">
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-[#06C167]">
                Available Right Now
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-black tracking-tight mt-1">
                Surplus Near You
              </h2>
            </div>

            <Link
              href="/consumer/dashboard"
              className="hidden sm:inline-flex items-center gap-1 text-sm font-bold text-black hover:underline"
            >
              See all nearby listings <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredListings.map((listing) => (
              <FoodCard
                key={listing.id}
                listing={listing}
                onReserve={(l) => setSelectedListing(l)}
              />
            ))}
          </div>

          <div className="mt-8 text-center sm:hidden">
            <Link
              href="/consumer/dashboard"
              className="inline-flex px-6 py-3 bg-neutral-100 rounded-full text-xs font-bold text-black"
            >
              View All Listings
            </Link>
          </div>

        </div>
      </section>

      {/* 4. Technical Rigor & Concurrency Architecture Block (Uber Tech Style) */}
      <section className="py-20 bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-3xl mb-16">
            <span className="px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-[11px] font-bold text-[#06C167] uppercase tracking-wider">
              Architecture & Scalability
            </span>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white mt-4 mb-4">
              Engineered with production rigor.
            </h2>
            <p className="text-sm sm:text-base text-neutral-400 leading-relaxed font-medium">
              ResQMeal solves the food-waste crisis with high-concurrency database design, atomic transaction guarantees, and transparent machine learning.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <div className="p-8 rounded-3xl bg-neutral-900/90 border border-neutral-800">
              <div className="w-12 h-12 rounded-2xl bg-white text-black flex items-center justify-center font-black mb-6">
                <Lock className="w-6 h-6 stroke-[2.5]" />
              </div>
              <h3 className="text-xl font-extrabold text-white mb-2">Atomic Inventory Lock</h3>
              <p className="text-xs text-neutral-400 leading-relaxed font-medium">
                Uses conditional atomic SQL execution (<code className="text-[#06C167]">WHERE remaining_quantity &gt;= :qty</code>) with Redis mutexes. Even with 50 simultaneous requests against 10 units, inventory can never become negative.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-neutral-900/90 border border-neutral-800">
              <div className="w-12 h-12 rounded-2xl bg-white text-black flex items-center justify-center font-black mb-6">
                <TrendingUp className="w-6 h-6 text-[#06C167] stroke-[2.5]" />
              </div>
              <h3 className="text-xl font-extrabold text-white mb-2">Scikit-Learn ML</h3>
              <p className="text-xs text-neutral-400 leading-relaxed font-medium">
                Random Forest regression trained on kitchen history, rainy weather footfall drops, and day-of-week variance with transparent MAE, RMSE, and R² scores.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-neutral-900/90 border border-neutral-800">
              <div className="w-12 h-12 rounded-2xl bg-white text-black flex items-center justify-center font-black mb-6">
                <Zap className="w-6 h-6 text-black stroke-[2.5]" />
              </div>
              <h3 className="text-xl font-extrabold text-white mb-2">Dynamic Time-Decay</h3>
              <p className="text-xs text-neutral-400 leading-relaxed font-medium">
                Pricing drops dynamically as pickup deadlines approach, increasing liquidation velocity and maximizing provider revenue recovery.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* Reservation Modal */}
      <ReservationModal
        listing={selectedListing}
        onClose={() => setSelectedListing(null)}
        onSuccess={() => {
          api.getListings({ size: 3 }).then((d) => setFeaturedListings(d.items || []));
        }}
      />

    </div>
  );
}
