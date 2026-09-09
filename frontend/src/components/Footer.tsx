import React from 'react';
import Link from 'next/link';
import { Utensils, Globe, MapPin, ShieldCheck, ArrowUpRight } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-black text-white pt-16 pb-12 border-t border-neutral-900 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-12 border-b border-neutral-800 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center font-black">
                <Utensils className="w-4 h-4 text-black stroke-[2.5]" />
              </div>
              <span className="font-extrabold text-2xl tracking-tighter text-white">
                ResQ<span className="text-[#06C167]">Meal</span>
              </span>
            </div>
            <p className="text-xs text-neutral-400 max-w-sm font-medium">
              Eliminating commercial food surplus. Transforming end-of-day kitchen surplus into community meals.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/consumer/dashboard"
              className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-full text-xs font-bold border border-neutral-800 transition-colors flex items-center gap-1.5"
            >
              Order Surplus Food <ArrowUpRight className="w-3.5 h-3.5 text-[#06C167]" />
            </Link>
            <Link
              href="/provider/create-listing"
              className="px-5 py-2.5 bg-white text-black hover:bg-neutral-200 rounded-full text-xs font-bold transition-colors"
            >
              Merchant Sign Up
            </Link>
          </div>
        </div>

        {/* 4 Column Uber Style Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12 border-b border-neutral-800">
          <div>
            <h4 className="text-white text-xs font-black uppercase tracking-wider mb-4">Consumers</h4>
            <ul className="space-y-2.5 text-xs text-neutral-400 font-medium">
              <li><Link href="/consumer/dashboard" className="hover:text-white transition-colors">Nearby Surplus Marketplace</Link></li>
              <li><Link href="/consumer/reservations" className="hover:text-white transition-colors">Active Orders & Vouchers</Link></li>
              <li><Link href="/consumer/dashboard" className="hover:text-white transition-colors">Vegetarian Surplus</Link></li>
              <li><Link href="/consumer/dashboard" className="hover:text-white transition-colors">Live Bakery Deals</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white text-xs font-black uppercase tracking-wider mb-4">Merchants & Kitchens</h4>
            <ul className="space-y-2.5 text-xs text-neutral-400 font-medium">
              <li><Link href="/provider/dashboard" className="hover:text-white transition-colors">Provider Dashboard</Link></li>
              <li><Link href="/provider/create-listing" className="hover:text-white transition-colors">List Food Surplus</Link></li>
              <li><Link href="/provider/ai-surplus" className="hover:text-white transition-colors">AI Surplus Predictor</Link></li>
              <li><Link href="/provider/dashboard" className="hover:text-white transition-colors">Counter Pickup Verification</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white text-xs font-black uppercase tracking-wider mb-4">NGOs & Relief</h4>
            <ul className="space-y-2.5 text-xs text-neutral-400 font-medium">
              <li><Link href="/ngo/dashboard" className="hover:text-white transition-colors">Claim Free Food Donations</Link></li>
              <li><Link href="/ngo/dashboard" className="hover:text-white transition-colors">Multi-Factor Donation Matching</Link></li>
              <li><Link href="/ngo/dashboard" className="hover:text-white transition-colors">Shelter Collection Schedule</Link></li>
              <li><Link href="/admin/dashboard" className="hover:text-white transition-colors">Platform Administration</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white text-xs font-black uppercase tracking-wider mb-4">Safety & Compliance</h4>
            <p className="text-xs text-neutral-400 leading-relaxed font-normal mb-3">
              All commercial partners must record preparation time, shelf-life expiry, and maintain FSSAI / health authority compliance.
            </p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-[11px] text-[#06C167] font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" /> Commercial Safety Enforced
            </div>
          </div>
        </div>

        {/* Bottom Bar (Uber Style) */}
        <div className="pt-8 flex flex-col sm:flex-row justify-between items-center text-xs text-neutral-500 font-medium gap-4">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-neutral-300">
              <Globe className="w-3.5 h-3.5" /> English (US)
            </span>
            <span className="flex items-center gap-1.5 text-neutral-300">
              <MapPin className="w-3.5 h-3.5 text-[#06C167]" /> Bangalore, India
            </span>
          </div>

          <p>© {new Date().getFullYear()} ResQMeal Inc. Built with production software engineering principles.</p>
        </div>

      </div>
    </footer>
  );
}
