'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { NGOMatchItem } from '@/types';
import { HeartHandshake, MapPin, Clock, CheckCircle2, RefreshCw } from 'lucide-react';

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
      setClaimStatus(`Donation claimed successfully! Storefront pickup voucher code: ${res.pickup_code}`);
      loadDonations();
    } catch (err: any) {
      setClaimStatus(err.message || 'Unable to claim donation.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans">
      
      {/* Top Banner (Uber Relief Mission) */}
      <div className="bg-black text-white rounded-3xl p-8 sm:p-10 mb-8 border border-neutral-800">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-[11px] font-bold text-[#06C167] uppercase tracking-wider mb-3">
            <HeartHandshake className="w-3.5 h-3.5" /> Community Food Relief Mission
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-2">
            Claim Commercial Food Donations
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed font-medium">
            100% free food donations listed by commercial kitchens and bakeries, ranked specifically for your shelter&apos;s meal capacity and proximity.
          </p>
        </div>
      </div>

      {claimStatus && (
        <div className="p-4 mb-6 rounded-2xl bg-[#E8F8EE] text-[#05944F] border border-[#06C167]/30 text-xs font-bold flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#06C167]" />
            {claimStatus}
          </span>
          <button onClick={() => setClaimStatus(null)} className="text-neutral-400 hover:text-black">×</button>
        </div>
      )}

      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-black tracking-tight">
            AI Multi-Factor Matched Donations
          </h2>
          <p className="text-xs text-neutral-500 font-medium mt-0.5">
            Ranked by distance, urgency, food preferences, and daily shelter volume.
          </p>
        </div>
        <button
          onClick={loadDonations}
          className="text-xs font-bold text-black hover:underline flex items-center gap-1"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((n) => (
            <div key={n} className="h-32 bg-neutral-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : matches.length > 0 ? (
        <div className="space-y-4">
          {matches.map((item) => (
            <div
              key={item.listing_id}
              className="bg-white rounded-2xl border border-neutral-200 hover:border-black transition-all p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2.5 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-black text-white">
                    Match: {item.match_score}/100
                  </span>
                  <span className="text-xs font-bold text-[#05944F] bg-[#E8F8EE] px-2.5 py-0.5 rounded-full">
                    100% Free
                  </span>
                </div>

                <h3 className="text-lg font-black text-black tracking-tight">
                  {item.title}
                </h3>
                <p className="text-xs font-medium text-neutral-500 mt-0.5">
                  Donated by {item.provider_name} • Category: {item.category}
                </p>

                <div className="flex items-center gap-4 mt-3 text-xs text-neutral-700 font-medium">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                    <strong>{item.distance_km} km away</strong>
                  </span>
                  <span className="flex items-center gap-1 text-black font-semibold bg-neutral-100 px-2 py-0.5 rounded-md">
                    <Clock className="w-3.5 h-3.5 text-neutral-500" />
                    {item.urgency_hours}h pickup window
                  </span>
                  <span>
                    Available: <strong className="text-black">{item.quantity} portions</strong>
                  </span>
                </div>
              </div>

              <div>
                <button
                  onClick={() => handleClaim(item.listing_id, item.quantity)}
                  className="w-full sm:w-auto px-6 py-3 bg-black hover:bg-neutral-800 text-white rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md"
                >
                  <HeartHandshake className="w-4 h-4 text-[#06C167]" /> Claim All ({item.quantity} Portions)
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-neutral-50 rounded-3xl border border-neutral-200 p-8">
          <HeartHandshake className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
          <h3 className="text-lg font-black text-black mb-1">No active donation listings</h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto font-medium">
            All current surplus batches have been claimed. New donations will appear automatically.
          </p>
        </div>
      )}

    </div>
  );
}
