'use client';

import React, { useState } from 'react';
import { api } from '@/lib/api';
import { SurplusPredictionResult } from '@/types';
import { TrendingUp, BrainCircuit, AlertTriangle, CheckCircle, BarChart3, CloudRain } from 'lucide-react';

export default function AISurplusPage() {
  const [category, setCategory] = useState('BAKERY');
  const [dayOfWeek, setDayOfWeek] = useState(5); // Saturday
  const [month, setMonth] = useState(10);
  const [quantityProduced, setQuantityProduced] = useState(80);
  const [originalPrice, setOriginalPrice] = useState(180);
  const [isHoliday, setIsHoliday] = useState(false);
  const [weatherCondition, setWeatherCondition] = useState('Rain');

  const [isLoading, setIsLoading] = useState(false);
  const [prediction, setPrediction] = useState<SurplusPredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await api.predictSurplus({
        category,
        day_of_week: Number(dayOfWeek),
        month: Number(month),
        quantity_produced: Number(quantityProduced),
        original_price: Number(originalPrice),
        is_holiday: isHoliday,
        weather_condition: weatherCondition,
      });
      setPrediction(res);
    } catch (err: any) {
      setError(err.message || 'Failed to generate surplus prediction.');
    } finally {
      setIsLoading(false);
    }
  };

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'LOW':
        return <span className="px-3 py-1 bg-[#E8F8EE] text-[#05944F] rounded-full font-bold text-xs">Low Waste Risk</span>;
      case 'MEDIUM':
        return <span className="px-3 py-1 bg-amber-100 text-amber-900 rounded-full font-bold text-xs">Moderate Risk</span>;
      case 'HIGH':
        return <span className="px-3 py-1 bg-rose-100 text-rose-800 rounded-full font-bold text-xs">High Waste Risk</span>;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans">
      
      <div className="mb-8">
        <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
          Machine Learning • Scikit-Learn Random Forest
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-black tracking-tight mt-0.5">
          Surplus Quantity Predictor
        </h1>
        <p className="text-xs text-neutral-500 font-medium mt-1">
          Predict end-of-day surplus before it happens by factoring kitchen production, rainy weather footfall reduction, and day-of-week demand variance.
        </p>
      </div>

      {error && (
        <div className="p-3 mb-6 bg-rose-50 text-rose-800 rounded-2xl text-xs font-bold border border-rose-200">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Form Inputs (Uber Card Style) */}
        <div className="md:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200 shadow-sm">
          <form onSubmit={handlePredict} className="space-y-4">
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-black mb-1.5">Food Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-3 rounded-xl bg-neutral-100 border border-neutral-200 text-xs font-bold text-black focus:outline-none focus:bg-white focus:border-black"
                >
                  <option value="BAKERY">Bakery & Pastries</option>
                  <option value="MEALS">Cooked Meals / Thalis</option>
                  <option value="PRODUCE">Fresh Produce</option>
                  <option value="SNACKS">Snacks & Sandwiches</option>
                  <option value="GROCERY">Grocery Items</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-black mb-1.5">Weather Condition</label>
                <select
                  value={weatherCondition}
                  onChange={(e) => setWeatherCondition(e.target.value)}
                  className="w-full px-3.5 py-3 rounded-xl bg-neutral-100 border border-neutral-200 text-xs font-bold text-black focus:outline-none focus:bg-white focus:border-black"
                >
                  <option value="Clear">Clear / Sunny</option>
                  <option value="Rain">Rainy (Reduced Walk-ins)</option>
                  <option value="Cloudy">Cloudy / Overcast</option>
                  <option value="Storm">Storm / Heavy Rain</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-black mb-1.5">Day of Week</label>
                <select
                  value={dayOfWeek}
                  onChange={(e) => setDayOfWeek(Number(e.target.value))}
                  className="w-full px-3 py-3 rounded-xl bg-neutral-100 border border-neutral-200 text-xs font-bold text-black focus:outline-none focus:bg-white focus:border-black"
                >
                  <option value={0}>Monday</option>
                  <option value={1}>Tuesday</option>
                  <option value={2}>Wednesday</option>
                  <option value={3}>Thursday</option>
                  <option value={4}>Friday</option>
                  <option value={5}>Saturday</option>
                  <option value={6}>Sunday</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-black mb-1.5">Produced</label>
                <input
                  type="number"
                  min="5"
                  required
                  value={quantityProduced}
                  onChange={(e) => setQuantityProduced(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl bg-neutral-100 border border-neutral-200 text-sm font-semibold text-black focus:outline-none focus:bg-white focus:border-black"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-black mb-1.5">Price (₹)</label>
                <input
                  type="number"
                  min="10"
                  required
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl bg-neutral-100 border border-neutral-200 text-sm font-semibold text-black focus:outline-none focus:bg-white focus:border-black"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="holidayCheck"
                checked={isHoliday}
                onChange={(e) => setIsHoliday(e.target.checked)}
                className="w-4 h-4 accent-black rounded"
              />
              <label htmlFor="holidayCheck" className="text-xs font-bold text-black cursor-pointer">
                Public Holiday / Festival Footfall Shift
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-black hover:bg-neutral-800 text-white rounded-full font-black text-sm shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {isLoading ? 'Running ML Regressor...' : <><BrainCircuit className="w-4 h-4 text-[#06C167]" /> Forecast Surplus</>}
            </button>

          </form>
        </div>

        {/* Results & Transparent Metrics Box */}
        <div className="space-y-6">
          {prediction ? (
            <div className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-sm space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">
                  Model Output
                </span>
                {getRiskBadge(prediction.waste_risk_level)}
              </div>

              <div>
                <div className="text-3xl font-black text-black tracking-tight">
                  {prediction.predicted_surplus_quantity} portions
                </div>
                <div className="text-xs text-neutral-500 font-medium mt-0.5">
                  Expected interval: <strong className="text-black">{prediction.confidence_interval[0]} - {prediction.confidence_interval[1]} portions</strong>
                </div>
              </div>

              <div className="p-4 bg-neutral-50 text-neutral-800 rounded-2xl text-xs leading-relaxed border border-neutral-200 font-medium">
                {prediction.explanation}
              </div>

              {/* Transparent Evaluation Metrics */}
              <div className="pt-3 border-t border-neutral-200">
                <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block mb-2.5">
                  Transparent Evaluation Metrics
                </span>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-200">
                    <div className="text-xs font-black text-black">{prediction.metrics.mae}</div>
                    <div className="text-[9px] text-neutral-400 font-bold uppercase">MAE</div>
                  </div>
                  <div className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-200">
                    <div className="text-xs font-black text-black">{prediction.metrics.rmse}</div>
                    <div className="text-[9px] text-neutral-400 font-bold uppercase">RMSE</div>
                  </div>
                  <div className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-200">
                    <div className="text-xs font-black text-[#05944F]">{prediction.metrics.r2}</div>
                    <div className="text-[9px] text-neutral-400 font-bold uppercase">R² Score</div>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-neutral-50 rounded-3xl p-6 border border-neutral-200 text-center text-neutral-400">
              <BrainCircuit className="w-10 h-10 mx-auto mb-2 text-neutral-400" />
              <h3 className="text-sm font-bold text-black mb-1">Awaiting Prediction</h3>
              <p className="text-xs text-neutral-500 font-medium">
                Configure your daily batch parameters and click Forecast Surplus to predict leftover food.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
