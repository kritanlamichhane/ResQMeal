'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { FoodListing, Reservation } from '@/types';
import { Store, Plus, CheckCircle2, TrendingUp, DollarSign, Leaf, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function ProviderDashboard() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [listings, setListings] = useState<FoodListing[]>([]);
  const [activeReservations, setActiveReservations] = useState<Reservation[]>([]);
  const [pickupCodeInput, setPickupCodeInput] = useState('');
  const [verifyStatus, setVerifyStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const loadData = () => {
    api.getProviderAnalytics().then(setAnalytics).catch(() => {});
    api.getListings({ size: 20 }).then((d) => setListings(d.items || [])).catch(() => {});
    api.getProviderActiveReservations().then(setActiveReservations).catch(() => {});
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleVerifyPickup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickupCodeInput.trim()) return;

    setIsVerifying(true);
    setVerifyStatus(null);
    try {
      const res = await api.confirmPickup(pickupCodeInput.trim());
      setVerifyStatus({
        success: true,
        message: `Pickup confirmed! ${res.quantity} portion(s) handed over. Order marked COMPLETED.`,
      });
      setPickupCodeInput('');
      loadData();
    } catch (err: any) {
      setVerifyStatus({
        success: false,
        message: err.message || 'Invalid or expired pickup code.',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header & Quick Add */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <span className="text-emerald-600 font-extrabold text-xs uppercase tracking-wider">
            Provider Kitchen Portal
          </span>
          <h1 className="text-3xl font-black text-gray-900">
            {analytics?.business_name || 'My Kitchen Operations'}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/provider/ai-surplus"
            className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all"
          >
            <TrendingUp className="w-4 h-4 text-emerald-600" /> AI Surplus Predictor
          </Link>
          <Link
            href="/provider/create-listing"
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" /> Add Surplus Food
          </Link>
        </div>
      </div>

      {/* Analytics KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-500 mb-1">
            <DollarSign className="w-4 h-4 text-emerald-600" /> Revenue Recovered
          </div>
          <div className="text-2xl font-black text-gray-900">
            ₹{analytics?.revenue_recovered || 0}
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-500 mb-1">
            <Store className="w-4 h-4 text-teal-600" /> Portions Sold
          </div>
          <div className="text-2xl font-black text-gray-900">
            {analytics?.total_sold_portions || 0}
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-500 mb-1">
            <Leaf className="w-4 h-4 text-green-600" /> CO₂ Diverted
          </div>
          <div className="text-2xl font-black text-gray-900">
            {analytics?.co2_saved_kg || 0} kg
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-500 mb-1">
            <CheckCircle2 className="w-4 h-4 text-indigo-600" /> Completion Rate
          </div>
          <div className="text-2xl font-black text-gray-900">
            {analytics?.completion_rate_pct || 100}%
          </div>
        </div>
      </div>

      {/* Quick Counter Pickup Verification Card */}
      <div className="bg-emerald-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl mb-10 relative overflow-hidden">
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-800 text-emerald-200 text-xs font-bold mb-3">
            <ShieldCheck className="w-4 h-4" /> Storefront Counter Verification
          </div>
          <h2 className="text-2xl font-black mb-2">Customer Pickup Verification</h2>
          <p className="text-xs text-emerald-200 mb-5 leading-relaxed">
            When a consumer or NGO arrives to collect reserved food, type their digital voucher code (e.g. RSQ-8H3K2) to complete pickup and confirm impact logging.
          </p>

          <form onSubmit={handleVerifyPickup} className="flex gap-3">
            <input
              type="text"
              value={pickupCodeInput}
              onChange={(e) => setPickupCodeInput(e.target.value)}
              placeholder="Enter Pickup Code (e.g. RSQ-DEMO1)"
              className="flex-1 px-4 py-3 rounded-xl bg-emerald-950/80 border border-emerald-700 text-white placeholder-emerald-400 text-sm font-mono uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
            <button
              type="submit"
              disabled={isVerifying || !pickupCodeInput.trim()}
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black text-sm rounded-xl transition-all disabled:opacity-50"
            >
              {isVerifying ? 'Verifying...' : 'Verify Pickup'}
            </button>
          </form>

          {verifyStatus && (
            <div className={`mt-4 p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
              verifyStatus.success ? 'bg-emerald-800 text-emerald-100 border border-emerald-700' : 'bg-rose-900 text-rose-200 border border-rose-700'
            }`}>
              {verifyStatus.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
              {verifyStatus.message}
            </div>
          )}
        </div>
      </div>

      {/* Active Listings Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-md p-6 mb-8">
        <h2 className="text-xl font-black text-gray-900 mb-4">My Food Listings</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-100 text-xs uppercase font-bold text-gray-400">
              <tr>
                <th className="pb-3">Title</th>
                <th className="pb-3">Category</th>
                <th className="pb-3">Remaining</th>
                <th className="pb-3">Surplus Price</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Pickup Window</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {listings.map((l) => (
                <tr key={l.id} className="hover:bg-gray-50/80">
                  <td className="py-3.5 font-bold text-gray-900">{l.title}</td>
                  <td className="py-3.5 text-xs font-semibold text-gray-500">{l.category}</td>
                  <td className="py-3.5 font-bold text-emerald-700">
                    {l.remaining_quantity} / {l.quantity} {l.unit}
                  </td>
                  <td className="py-3.5 font-bold text-gray-900">
                    {l.listing_type === 'DONATION' ? 'FREE' : `₹${l.surplus_price}`}
                  </td>
                  <td className="py-3.5">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                      l.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {l.status}
                    </span>
                  </td>
                  <td className="py-3.5 text-xs text-gray-500">
                    {new Date(l.pickup_start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(l.pickup_end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
