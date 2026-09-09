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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
      
      {/* Header & Quick Add */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
            Merchant Operations
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-black tracking-tight mt-0.5">
            {analytics?.business_name || 'Kitchen Dashboard'}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/provider/ai-surplus"
            className="px-5 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-black text-xs font-bold rounded-full flex items-center gap-1.5 transition-all"
          >
            <TrendingUp className="w-4 h-4 text-black" /> AI Surplus Predictor
          </Link>
          <Link
            href="/provider/create-listing"
            className="px-5 py-2.5 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded-full shadow-md flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" /> Add Food Surplus
          </Link>
        </div>
      </div>

      {/* Analytics KPI Row (Uber Style) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold text-neutral-400 mb-1 uppercase tracking-wider">
            <DollarSign className="w-3.5 h-3.5 text-black" /> Recovered Revenue
          </div>
          <div className="text-2xl sm:text-3xl font-black text-black tracking-tight">
            ₹{analytics?.revenue_recovered || 0}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold text-neutral-400 mb-1 uppercase tracking-wider">
            <Store className="w-3.5 h-3.5 text-black" /> Portions Sold
          </div>
          <div className="text-2xl sm:text-3xl font-black text-black tracking-tight">
            {analytics?.total_sold_portions || 0}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold text-neutral-400 mb-1 uppercase tracking-wider">
            <Leaf className="w-3.5 h-3.5 text-[#06C167]" /> CO₂ Saved
          </div>
          <div className="text-2xl sm:text-3xl font-black text-black tracking-tight">
            {analytics?.co2_saved_kg || 0} kg
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold text-neutral-400 mb-1 uppercase tracking-wider">
            <CheckCircle2 className="w-3.5 h-3.5 text-black" /> Completion Rate
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#06C167] tracking-tight">
            {analytics?.completion_rate_pct || 100}%
          </div>
        </div>
      </div>

      {/* Storefront Counter Verification Card (Uber Merchant Style) */}
      <div className="bg-black text-white rounded-3xl p-6 sm:p-8 shadow-xl mb-10 border border-neutral-800">
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-900 text-neutral-300 text-xs font-bold mb-3 border border-neutral-800">
            <ShieldCheck className="w-3.5 h-3.5 text-[#06C167]" /> Counter Handover Verification
          </div>
          <h2 className="text-2xl font-black tracking-tight mb-1.5">Verify Customer Pickup</h2>
          <p className="text-xs text-neutral-400 mb-5 leading-relaxed font-medium">
            When a customer arrives at your counter, input their 8-character voucher code to complete order fulfillment.
          </p>

          <form onSubmit={handleVerifyPickup} className="flex gap-3">
            <input
              type="text"
              value={pickupCodeInput}
              onChange={(e) => setPickupCodeInput(e.target.value)}
              placeholder="e.g. RSQ-8H3K2"
              className="flex-1 px-4 py-3.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white placeholder-neutral-500 text-sm font-mono uppercase tracking-wider focus:outline-none focus:border-white"
            />
            <button
              type="submit"
              disabled={isVerifying || !pickupCodeInput.trim()}
              className="px-6 py-3.5 bg-white hover:bg-neutral-200 text-black font-black text-sm rounded-xl transition-all disabled:opacity-50"
            >
              {isVerifying ? 'Verifying...' : 'Verify Order'}
            </button>
          </form>

          {verifyStatus && (
            <div className={`mt-4 p-3.5 rounded-xl text-xs font-bold flex items-center gap-2 ${
              verifyStatus.success ? 'bg-[#06C167]/20 text-[#06C167] border border-[#06C167]/30' : 'bg-rose-950 text-rose-300 border border-rose-800'
            }`}>
              {verifyStatus.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
              {verifyStatus.message}
            </div>
          )}
        </div>
      </div>

      {/* Active Listings Table */}
      <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm p-6 mb-8">
        <h2 className="text-xl font-black text-black tracking-tight mb-4">Active Inventory</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-neutral-200 text-[11px] uppercase font-bold text-neutral-400 tracking-wider">
              <tr>
                <th className="pb-3">Title</th>
                <th className="pb-3">Category</th>
                <th className="pb-3">Remaining</th>
                <th className="pb-3">Price</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Pickup Window</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {listings.map((l) => (
                <tr key={l.id} className="hover:bg-neutral-50/80">
                  <td className="py-3.5 font-bold text-black">{l.title}</td>
                  <td className="py-3.5 text-xs font-semibold text-neutral-500">{l.category}</td>
                  <td className="py-3.5 font-black text-black">
                    {l.remaining_quantity} / {l.quantity} {l.unit}
                  </td>
                  <td className="py-3.5 font-bold text-black">
                    {l.listing_type === 'DONATION' ? 'FREE' : `₹${l.surplus_price}`}
                  </td>
                  <td className="py-3.5">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      l.status === 'ACTIVE' ? 'bg-[#E8F8EE] text-[#05944F]' : 'bg-neutral-100 text-neutral-600'
                    }`}>
                      {l.status}
                    </span>
                  </td>
                  <td className="py-3.5 text-xs text-neutral-500 font-medium">
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
