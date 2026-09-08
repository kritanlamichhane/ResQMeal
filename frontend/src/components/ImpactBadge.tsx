import React from 'react';
import { Leaf, DollarSign, Utensils, HeartHandshake } from 'lucide-react';

interface ImpactBadgeProps {
  mealsRescued: number;
  co2PreventedKg: number;
  moneySaved: number;
}

export function ImpactBadge({ mealsRescued, co2PreventedKg, moneySaved }: ImpactBadgeProps) {
  return (
    <div className="grid grid-cols-3 gap-4 bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-emerald-100 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
          <Utensils className="w-5 h-5" />
        </div>
        <div>
          <div className="text-lg font-black text-gray-900">{mealsRescued}</div>
          <div className="text-xs text-gray-500 font-medium">Meals Rescued</div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center flex-shrink-0">
          <Leaf className="w-5 h-5" />
        </div>
        <div>
          <div className="text-lg font-black text-gray-900">{co2PreventedKg} kg</div>
          <div className="text-xs text-gray-500 font-medium">CO₂ Prevented</div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
          <DollarSign className="w-5 h-5" />
        </div>
        <div>
          <div className="text-lg font-black text-gray-900">₹{moneySaved}</div>
          <div className="text-xs text-gray-500 font-medium">Money Saved</div>
        </div>
      </div>
    </div>
  );
}
