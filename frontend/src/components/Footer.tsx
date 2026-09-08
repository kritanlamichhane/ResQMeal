import React from 'react';
import { UtensilsCrossed, Heart, ShieldCheck, Leaf } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-12 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                <UtensilsCrossed className="w-4 h-4" />
              </div>
              <span className="font-bold text-xl text-white">ResQMeal</span>
            </div>
            <p className="text-sm text-gray-400 max-w-md leading-relaxed">
              Empowering local restaurants, bakeries, and grocers to rescue safe surplus food,
              curb environmental emissions, and serve community needs at accessible rates.
            </p>
            <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1"><ShieldCheck className="w-4 h-4 text-emerald-500" /> FSSAI Compliant</span>
              <span className="flex items-center gap-1"><Leaf className="w-4 h-4 text-teal-400" /> Carbon Offset Tracked</span>
            </div>
          </div>

          <div>
            <h4 className="text-white text-sm font-semibold mb-3">Roles & Portals</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/consumer/dashboard" className="hover:text-emerald-400 transition-colors">Consumer Marketplace</a></li>
              <li><a href="/provider/dashboard" className="hover:text-emerald-400 transition-colors">Food Providers Portal</a></li>
              <li><a href="/ngo/dashboard" className="hover:text-emerald-400 transition-colors">NGO Donation Claim</a></li>
              <li><a href="/admin/dashboard" className="hover:text-emerald-400 transition-colors">Platform Admin Console</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white text-sm font-semibold mb-3">Food Safety Policy</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              All surplus food listings require preparation, best-before timestamps, and hygiene verification. Providers are solely responsible for ensuring adherence to safe commercial food handling laws.
            </p>
          </div>

        </div>

        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-500">
          <p>© {new Date().getFullYear()} ResQMeal Platform. Built for real-world food surplus reduction.</p>
          <p className="flex items-center gap-1 mt-2 sm:mt-0">
            Engineered with <Heart className="w-3.5 h-3.5 text-red-500" /> for Zero Food Waste
          </p>
        </div>
      </div>
    </footer>
  );
}
