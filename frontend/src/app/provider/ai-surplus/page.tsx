'use client';

import React, { useState } from 'react';
import { api } from '@/lib/api';
import { SurplusPredictionResult } from '@/types';
import { TrendingUp, Sparkles, BrainCircuit, AlertTriangle, CheckCircle, BarChart3, CloudRain } from 'lucide-react';

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
        return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full font-bold text-xs">Low Waste Risk</span>;
      case 'MEDIUM':
        return <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full font-bold text-xs">Moderate Waste Risk</span>;
      case 'HIGH':
        return <span className="px-3 py-1 bg-rose-100 text-rose-800 rounded-full font-bold text-xs">High Waste Risk</span>;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      <div className="mb-8">
        <span className="text-emerald-600 font-extrabold text-xs uppercase tracking-wider">
          AI/ML Feature #1 — Scikit-Learn Regression
        </span>
        <h1 className="text-3xl font-black text-gray-900">
          Surplus Quantity Predictor
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Trained on real culinary operational factors (footfall patterns, rainy weather variance, day of week) to forecast evening surplus before it happens.
        </p>
      </div>

      {error && (
        <div className="p-3 mb-6 bg-red-50 text-red-700 rounded-2xl text-xs font-bold border border-red-200">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Form Inputs */}
        <div className="md:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-md">
          <form onSubmit={handlePredict} className="space-y-4">
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Food Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="BAKERY">Bakery & Pastries</option>
                  <option value="MEALS">Cooked Meals / Thalis</option>
                  <option value="PRODUCE">Fresh Produce</option>
                  <option value="SNACKS">Snacks & Sandwiches</option>
                  <option value="GROCERY">Grocery Items</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Weather Condition</label>
                <select
                  value={weatherCondition}
                  onChange={(e) => setWeatherCondition(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Clear">Clear / Sunny</option>
                  <option value="Rain">Rainy (Reduced Walk-in Footfall)</option>
                  <option value="Cloudy">Cloudy / Overcast</option>
                  <option value="Storm">Storm / Thunderstorm</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Day of Week</label>
                <select
                  value={dayOfWeek}
                  onChange={(e) => setDayOfWeek(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                <label className="block text-xs font-bold text-gray-700 mb-1">Produced Today</label>
                <input
                  type="number"
                  min="5"
                  required
                  value={quantityProduced}
                  onChange={(e) => setQuantityProduced(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Price / Portion</label>
                <input
                  type="number"
                  min="10"
                  required
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="holidayCheck"
                checked={isHoliday}
                onChange={(e) => setIsHoliday(e.target.checked)}
                className="w-4 h-4 accent-emerald-600 rounded"
              />
              <label htmlFor="holidayCheck" className="text-xs font-bold text-gray-700 cursor-pointer">
                Public Holiday or Festival Day
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? 'Running ML Regressor...' : <><BrainCircuit className="w-4 h-4" /> Forecast Surplus</>}
            </button>

          </form>
        </div>

        {/* Prediction Results & Model Evaluation Box */}
        <div className="space-y-6">
          {prediction ? (
            <div className="bg-white rounded-3xl p-6 border border-emerald-200 shadow-xl space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  ML Prediction Output
                </span>
                {getRiskBadge(prediction.waste_risk_level)}
              </div>

              <div>
                <div className="text-3xl font-black text-gray-900">
                  {prediction.predicted_surplus_quantity} portions
                </div>
                <div className="text-xs text-gray-500 font-medium mt-0.5">
                  Expected interval: <strong>{prediction.confidence_interval[0]} - {prediction.confidence_interval[1]} portions</strong>
                </div>
              </div>

              <div className="p-3.5 bg-emerald-50 text-emerald-950 rounded-2xl text-xs leading-relaxed border border-emerald-100">
                {prediction.explanation}
              </div>

              {/* Transparent Evaluation Metrics */}
              <div className="pt-3 border-t border-gray-100">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
                  Transparent Evaluation Metrics
                </span>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 bg-gray-50 rounded-xl">
                    <div className="text-xs font-black text-gray-800">{prediction.metrics.mae}</div>
                    <div className="text-[9px] text-gray-400 font-bold uppercase">MAE</div>
                  </div>
                  <div className="p-2 bg-gray-50 rounded-xl">
                    <div className="text-xs font-black text-gray-800">{prediction.metrics.rmse}</div>
                    <div className="text-[9px] text-gray-400 font-bold uppercase">RMSE</div>
                  </div>
                  <div className="p-2 bg-gray-50 rounded-xl">
                    <div className="text-xs font-black text-emerald-700">{prediction.metrics.r2}</div>
                    <div className="text-[9px] text-gray-400 font-bold uppercase">R² Score</div>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-gray-50 rounded-3xl p-6 border border-gray-200 text-center text-gray-400">
              <BrainCircuit className="w-10 h-10 mx-auto mb-2 text-gray-300" />
              <h3 className="text-sm font-bold text-gray-700 mb-1">Awaiting Parameters</h3>
              <p className="text-xs text-gray-500">
                Configure your daily production parameters and click Forecast Surplus to evaluate expected leftovers.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
