'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { FoodCategory, ListingType } from '@/types';
import { Sparkles, ArrowRight, Zap, Image as ImageIcon, CheckCircle, ShieldCheck, AlertCircle } from 'lucide-react';

export default function CreateListingPage() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<FoodCategory>('MEALS');
  const [quantity, setQuantity] = useState(10);
  const [unit, setUnit] = useState('portions');
  const [originalPrice, setOriginalPrice] = useState(250);
  const [surplusPrice, setSurplusPrice] = useState(100);
  const [listingType, setListingType] = useState<ListingType>('SALE');
  const [isVegetarian, setIsVegetarian] = useState(true);
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600');

  // Timestamps
  const now = new Date();
  const defaultStart = new Date(now.getTime() + 15 * 60000).toISOString().slice(0, 16);
  const defaultEnd = new Date(now.getTime() + 180 * 60000).toISOString().slice(0, 16);
  const defaultExpiry = new Date(now.getTime() + 360 * 60000).toISOString().slice(0, 16);

  const [pickupStart, setPickupStart] = useState(defaultStart);
  const [pickupEnd, setPickupEnd] = useState(defaultEnd);
  const [expiryTime, setExpiryTime] = useState(defaultExpiry);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // AI Pricing state
  const [isCalculatingPricing, setIsCalculatingPricing] = useState(false);
  const [pricingRationale, setPricingRationale] = useState<string | null>(null);

  // AI Image Extraction state
  const [imageHint, setImageHint] = useState('');
  const [isExtractingImage, setIsExtractingImage] = useState(false);
  const [extractedData, setExtractedData] = useState<any | null>(null);

  const handleSmartPricing = async () => {
    setIsCalculatingPricing(true);
    try {
      const endD = new Date(pickupEnd).getTime();
      const nowD = new Date().getTime();
      const minsRemaining = Math.max(15, Math.round((endD - nowD) / 60000));

      const res = await api.getSmartPricing({
        original_price: Number(originalPrice),
        quantity: Number(quantity),
        pickup_minutes_remaining: minsRemaining,
        category: category,
      });

      setSurplusPrice(res.recommended_price);
      setPricingRationale(`AI Recommended: ₹${res.recommended_price} (${res.discount_percentage}% off) - ${res.rationale}`);
    } catch (err: any) {
      setError('Could not calculate pricing recommendation.');
    } finally {
      setIsCalculatingPricing(false);
    }
  };

  const handleExtractImage = async () => {
    if (!imageHint.trim()) return;
    setIsExtractingImage(true);
    try {
      const res = await api.extractFoodImage({ hint_text: imageHint });
      setExtractedData(res);
    } catch (err: any) {
      setError('Image attribute extraction failed.');
    } finally {
      setIsExtractingImage(false);
    }
  };

  const applyExtractedData = () => {
    if (!extractedData) return;
    setTitle(extractedData.detected_name);
    setCategory(extractedData.category as FoodCategory);
    setIsVegetarian(extractedData.is_vegetarian);
    setDescription(extractedData.suggested_description);
    setQuantity(extractedData.estimated_quantity);
    setExtractedData(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await api.createListing({
        title,
        description,
        category,
        quantity: Number(quantity),
        unit,
        original_price: Number(originalPrice),
        surplus_price: listingType === 'DONATION' ? 0.0 : Number(surplusPrice),
        listing_type: listingType,
        is_vegetarian: isVegetarian,
        image_url: imageUrl,
        preparation_time: new Date().toISOString(),
        expiry_time: new Date(expiryTime).toISOString(),
        pickup_start_time: new Date(pickupStart).toISOString(),
        pickup_end_time: new Date(pickupEnd).toISOString(),
        latitude: 12.9716,
        longitude: 77.5946,
      });

      router.push('/provider/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to create food listing.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      <div className="mb-6">
        <span className="text-emerald-600 font-extrabold text-xs uppercase tracking-wider">
          Surplus Reduction Portal
        </span>
        <h1 className="text-3xl font-black text-gray-900">List Surplus Food</h1>
        <p className="text-xs text-gray-500 mt-1">
          Turn surplus meals into community meals and prevent carbon emissions.
        </p>
      </div>

      {error && (
        <div className="p-3 mb-6 bg-red-50 text-red-700 rounded-2xl text-xs font-bold border border-red-200">
          {error}
        </div>
      )}

      {/* AI Assistant #3: Food Image Assistant */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-3xl p-6 mb-8 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-emerald-600" />
          <h2 className="text-base font-extrabold text-gray-900">
            AI Food Image & Metadata Assistant
          </h2>
        </div>
        <p className="text-xs text-gray-600 mb-4 max-w-xl">
          Enter image cues or food keywords (e.g. &ldquo;croissants&rdquo;, &ldquo;paneer biryani&rdquo;) to automatically detect category, diet labels, and portion hints.
        </p>

        <div className="flex gap-2">
          <input
            type="text"
            value={imageHint}
            onChange={(e) => setImageHint(e.target.value)}
            placeholder="e.g. 8 freshly baked chocolate croissants from morning batch"
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            type="button"
            onClick={handleExtractImage}
            disabled={isExtractingImage || !imageHint.trim()}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all disabled:opacity-50 flex items-center gap-1.5"
          >
            {isExtractingImage ? 'Extracting...' : <>Analyze Food</>}
          </button>
        </div>

        {/* AI Confirmation Dialog (Mandatory human-in-the-loop) */}
        {extractedData && (
          <div className="mt-4 p-4 bg-white rounded-2xl border border-emerald-200 shadow-sm animate-in fade-in">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black text-emerald-800 uppercase tracking-wide">
                AI Detected Attributes (Confidence: {Math.round(extractedData.confidence_score * 100)}%)
              </span>
              <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md font-bold">
                Provider Review Required
              </span>
            </div>
            <p className="text-xs text-gray-700 mb-3">
              Suggested: <strong>{extractedData.detected_name}</strong> • Category: <strong>{extractedData.category}</strong> • Diet: <strong>{extractedData.is_vegetarian ? 'Veg' : 'Non-Veg'}</strong>
            </p>
            <button
              type="button"
              onClick={applyExtractedData}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-1 shadow-sm"
            >
              <CheckCircle className="w-3.5 h-3.5" /> Confirm & Auto-Fill Form
            </button>
          </div>
        )}
      </div>

      {/* Main Listing Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xl space-y-6">
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-gray-700 mb-1">Listing Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Artisan Butter Croissants & Danish Box"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as FoodCategory)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="MEALS">Meals / Cooked Platters</option>
              <option value="BAKERY">Bakery & Pastries</option>
              <option value="PRODUCE">Fresh Produce / Fruits</option>
              <option value="GROCERY">Groceries & Packaged</option>
              <option value="SNACKS">Snacks & Sandwiches</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Listing Type</label>
            <select
              value={listingType}
              onChange={(e) => setListingType(e.target.value as ListingType)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="SALE">Discounted Sale (Consumers & Public)</option>
              <option value="DONATION">Free Donation (NGOs & Shelters Only)</option>
            </select>
          </div>
        </div>

        {/* Quantity and Pricing with AI Smart Pricing button */}
        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Quantity</label>
              <input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Unit</label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="portions / boxes"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Original Price (₹)</label>
              <input
                type="number"
                min="0"
                required
                value={originalPrice}
                onChange={(e) => setOriginalPrice(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Surplus Price (₹)</label>
              <input
                type="number"
                min="0"
                disabled={listingType === 'DONATION'}
                value={listingType === 'DONATION' ? 0 : surplusPrice}
                onChange={(e) => setSurplusPrice(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-100"
              />
            </div>
          </div>

          {/* AI Feature #2: Smart Pricing button */}
          {listingType === 'SALE' && (
            <div className="pt-2 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <span className="text-xs text-gray-500">
                Unsure what to charge? Let our algorithm calculate dynamic time-decay pricing.
              </span>
              <button
                type="button"
                onClick={handleSmartPricing}
                disabled={isCalculatingPricing}
                className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 flex-shrink-0"
              >
                <Zap className="w-3.5 h-3.5" />
                {isCalculatingPricing ? 'Computing...' : 'AI Smart Pricing'}
              </button>
            </div>
          )}

          {pricingRationale && (
            <div className="p-3 bg-amber-50 text-amber-900 rounded-xl text-xs border border-amber-200 font-medium">
              {pricingRationale}
            </div>
          )}
        </div>

        {/* Timestamps & Food Safety Requirements */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-extrabold text-gray-900 uppercase tracking-wider">
              Food Safety & Pickup Windows
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Pickup Start</label>
              <input
                type="datetime-local"
                required
                value={pickupStart}
                onChange={(e) => setPickupStart(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Pickup Deadline</label>
              <input
                type="datetime-local"
                required
                value={pickupEnd}
                onChange={(e) => setPickupEnd(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Best Before / Expiry</label>
              <input
                type="datetime-local"
                required
                value={expiryTime}
                onChange={(e) => setExpiryTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Description & Image */}
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Freshly prepared in our commercial kitchen today. Stored in temperature-controlled display."
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Image URL</label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isLoading ? 'Publishing Surplus Food...' : <>Publish Food Listing <ArrowRight className="w-4 h-4" /></>}
        </button>

      </form>

    </div>
  );
}
