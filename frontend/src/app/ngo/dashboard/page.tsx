'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { NGOMatchItem } from '@/types';
import { HeartHandshake, Sparkles, MapPin, Clock, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

export default function NGODashboard() {
  const [matches, setMatches] = useState<NGOMatchItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [claimStatus, setClaimStatus] = useState<string | null>(null);

  const loadDonations = () => {
    setIsLoading(true);
    api.matchDonations()
      .then((data) => setMatches(data || []))
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadDonations();
  }, []);

  const handleClaim = async (listingId: number, qty: number) => {
    try {
      const res = await api.reserveFood(listingId, qty);
      setClaimStatus(`Donation claimed successfully! Pickup code: ${res.pickup_code}`);
      loadDonations();
    } catch (err: any) {
      setClaimStatus(err.message || 'Unable to claim donation.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-emerald-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl mb-8">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold mb-3">
            <HeartHandshake className="w-3.5 h-3.5" /> NGO Food Rescue Mission
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
            Available Community Donations
          </h1>
          <p className="mt-2 text-sm text-amber-100">
            Surplus food donated by certified commercial kitchens and restaurants at zero cost for immediate community hunger relief.
          </p>
        </div>
      </div>

      {claimStatus && (
        <div className="p-4 mb-6 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {claimStatus}
          </span>
          <button onClick={() => setClaimStatus(null)} className="text-gray-400 hover:text-gray-600">×</button>
        </div>
      )}

      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black text-gray-900">
            AI Multi-Factor Matched Donations
          </h2>
          <p className="text-xs text-gray-500">
            Ranked by proximity, urgency, dietary preferences, and your shelter&apos;s daily meal capacity.
          </p>
        </div>
        <button
          onClick={loadDonations}
          className="text-xs font-bold text-emerald-600 hover:text-emerald-700"
        >
          Refresh Listings
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((n) => (
            <div key={n} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : matches.length > 0 ? (
        <div className="space-y-4">
          {matches.map((item) => (
            <div
              key={item.listing_id}
              className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase bg-amber-100 text-amber-900">
                    Match Score: {item.match_score}/100
                  </span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                    100% Free Donation
                  </span>
                </div>

                <h3 className="text-lg font-black text-gray-900">
                  {item.title}
                </h3>
                <p className="text-xs font-semibold text-gray-500 mt-0.5">
                  Donated by {item.provider_name} • Category: {item.category}
                </p>

                <div className="flex items-center gap-4 mt-3 text-xs text-gray-600 font-medium">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    <strong>{item.distance_km} km away</strong>
                  </span>
                  <span className="flex items-center gap-1 text-amber-700">
                    <Clock className="w-3.5 h-3.5" />
                    <strong>{item.urgency_hours}h pickup window</strong>
                  </span>
                  <span>
                    Available: <strong>{item.quantity} portions</strong>
                  </span>
                </div>
              </div>

              <div>
                <button
                  onClick={() => handleClaim(item.listing_id, item.quantity)}
                  className="w-full sm:w-auto px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-black shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5"
                >
                  <HeartHandshake className="w-4 h-4" /> Claim All ({item.quantity} Portions)
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 p-8">
          <HeartHandshake className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-900 mb-1">No active donation listings</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            All current donations have been distributed. New donation listings from partner kitchens will appear here instantly.
          </p>
        </div>
      )}

    </div>
  );
}
