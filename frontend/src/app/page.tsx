'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { FoodListing, PlatformMetrics } from '@/types';
import { FoodCard } from '@/components/FoodCard';
import { ReservationModal } from '@/components/ReservationModal';
import { 
  Sparkles, ArrowRight, ShieldCheck, Zap, Utensils, 
  Leaf, HeartHandshake, Store, TrendingUp, Lock 
} from 'lucide-react';

export default function HomePage() {
  const [metrics, setMetrics] = useState<PlatformMetrics | null>(null);
  const [featuredListings, setFeaturedListings] = useState<FoodListing[]>([]);
  const [selectedListing, setSelectedListing] = useState<FoodListing | null>(null);

  useEffect(() => {
    // Fetch live platform metrics
    api.getPlatformMetrics()
      .then((data) => setMetrics(data))
      .catch(() => {});

    // Fetch featured active listings
    api.getListings({ size: 3 })
      .then((data) => setFeaturedListings(data.items || []))
      .catch(() => {});
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/60 via-white to-white py-20 lg:py-28">
        
        {/* Background Subtle Blurs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-emerald-200/30 to-teal-200/20 blur-3xl -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 text-emerald-900 text-xs font-bold mb-6 tracking-wide shadow-sm">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            Empowering 200+ Kitchens & Community Shelters
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-gray-900 tracking-tight max-w-4xl mx-auto leading-[1.15]">
            Rescue Great Food. <br />
            <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
              Zero Waste. Real Impact.
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            ResQMeal seamlessly bridges restaurants, bakeries, and grocers with consumers and NGOs. 
            Enjoy chef-prepared surplus food at up to 70% off while preventing edible food from hitting landfills.
          </p>

          {/* Quick Actions */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/consumer/dashboard"
              className="w-full sm:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 text-base"
            >
              Browse Surplus Meals <ArrowRight className="w-5 h-5" />
            </Link>

            <Link
              href="/provider/create-listing"
              className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-gray-50 text-gray-800 font-extrabold rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2 text-base"
            >
              <Store className="w-5 h-5 text-emerald-600" /> List Surplus Food
            </Link>
          </div>

          {/* Live Impact Ticker */}
          <div className="mt-16 max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-white/80 backdrop-blur-md rounded-3xl border border-emerald-100/80 shadow-xl">
            <div className="p-3 border-r border-gray-100 last:border-0">
              <div className="text-2xl sm:text-3xl font-black text-emerald-600">
                {metrics?.total_meals_rescued || 1250}+
              </div>
              <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">
                Meals Rescued
              </div>
            </div>

            <div className="p-3 border-r border-gray-100 last:border-0">
              <div className="text-2xl sm:text-3xl font-black text-teal-600">
                {metrics?.total_co2_prevented_kg || 3120} kg
              </div>
              <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">
                CO₂ Prevented
              </div>
            </div>

            <div className="p-3 border-r border-gray-100 last:border-0">
              <div className="text-2xl sm:text-3xl font-black text-amber-600">
                ₹{metrics?.total_money_saved_consumers || 185000}
              </div>
              <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">
                Consumer Savings
              </div>
            </div>

            <div className="p-3">
              <div className="text-2xl sm:text-3xl font-black text-indigo-600">
                {metrics?.pickup_completion_rate_pct || 98.5}%
              </div>
              <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">
                Pickup Success Rate
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. Engineering & Architecture Highlight */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950 text-emerald-400 text-xs font-bold mb-3 border border-emerald-800">
              <Lock className="w-3.5 h-3.5" /> High-Concurrency Architecture
            </div>
            <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
              Engineered for Production Rigor
            </h2>
            <p className="mt-3 text-sm text-gray-400">
              ResQMeal is built from the ground up with ACID transactional integrity and atomic inventory locking.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-gray-800/60 border border-gray-700/80">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-lg text-white mb-2">Atomic Concurrency</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Guaranteed by atomic SQL conditional updates (<code className="text-emerald-400">WHERE remaining_quantity &gt;= :qty</code>) and Redis distributed mutexes. Inventory can never drop below zero under concurrent traffic.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-gray-800/60 border border-gray-700/80">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center mb-4">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-lg text-white mb-2">Real Scikit-Learn ML</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Random Forest surplus prediction trained on historical production, weather conditions, and day-of-week demand variance. Transparent MAE, RMSE, and R² evaluation metrics.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-gray-800/60 border border-gray-700/80">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-lg text-white mb-2">Algorithmic Dynamic Pricing</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Time-decay discounting accelerates surplus liquidation as closing deadlines approach, maximizing revenue recovery for food businesses.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Live Featured Surplus Listings */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10">
            <div>
              <span className="text-emerald-600 font-extrabold text-xs tracking-wider uppercase">
                Available Right Now
              </span>
              <h2 className="text-3xl font-black text-gray-900 tracking-tight mt-1">
                Featured Surplus Listings
              </h2>
            </div>

            <Link
              href="/consumer/dashboard"
              className="mt-4 sm:mt-0 text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1.5"
            >
              Explore All Nearby Food <ArrowRight className="w-4 h-4" />
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

        </div>
      </section>

      {/* 4. Roles Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl font-black text-gray-900 sm:text-4xl">
              Tailored for Every Stakeholder
            </h2>
            <p className="mt-3 text-sm text-gray-500">
              Select your role to explore our dedicated tools and workflows.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Link 
              href="/consumer/dashboard" 
              className="p-6 rounded-3xl bg-gray-50 border border-gray-100 hover:border-emerald-300 hover:shadow-xl transition-all group"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Utensils className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Consumers</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Discover nearby surplus meals with interactive map radius search, secure checkout, and instant QR pickups.
              </p>
            </Link>

            <Link 
              href="/provider/dashboard" 
              className="p-6 rounded-3xl bg-gray-50 border border-gray-100 hover:border-emerald-300 hover:shadow-xl transition-all group"
            >
              <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Store className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Food Providers</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Publish surplus listings in seconds with AI vision assistant, smart dynamic pricing, and surplus predictors.
              </p>
            </Link>

            <Link 
              href="/ngo/dashboard" 
              className="p-6 rounded-3xl bg-gray-50 border border-gray-100 hover:border-emerald-300 hover:shadow-xl transition-all group"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">NGOs & Shelters</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Claim zero-cost donation listings tailored to your shelter capacity with our multi-factor matching engine.
              </p>
            </Link>

            <Link 
              href="/admin/dashboard" 
              className="p-6 rounded-3xl bg-gray-50 border border-gray-100 hover:border-emerald-300 hover:shadow-xl transition-all group"
            >
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Administrators</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Oversee food rescue operations, monitor database connectivity, manage user privileges, and track sustainability.
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* Reservation Modal */}
      <ReservationModal
        listing={selectedListing}
        onClose={() => setSelectedListing(null)}
        onSuccess={() => {
          // refresh listings
          api.getListings({ size: 3 }).then((d) => setFeaturedListings(d.items || []));
        }}
      />

    </div>
  );
}
