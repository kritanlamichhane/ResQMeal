'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { FoodCategory, ListingType } from '@/types';
import { Sparkles, ArrowRight, Zap, CheckCircle, ShieldCheck } from 'lucide-react';

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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans">
      
      <div className="mb-8">
        <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
          Merchant Inventory Manager
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-black tracking-tight mt-0.5">
          List Surplus Food
        </h1>
        <p className="text-xs text-neutral-500 font-medium mt-1">
          Turn surplus batches into sales and prevent edible meals from reaching landfills.
        </p>
      </div>

      {error && (
        <div className="p-3 mb-6 bg-rose-50 text-rose-800 rounded-2xl text-xs font-bold border border-rose-200">
          {error}
        </div>
      )}

      {/* AI Assistant #3: Food Image Assistant (Uber Style) */}
      <div className="bg-neutral-50 border border-neutral-200 rounded-3xl p-6 sm:p-7 mb-8">
        <div className="flex items-center gap-2 mb-1.5">
          <Sparkles className="w-5 h-5 text-black" />
          <h2 className="text-base font-black text-black">
            AI Food Image & Metadata Assistant
          </h2>
        </div>
        <p className="text-xs text-neutral-600 mb-4 font-medium">
          Enter item keywords (e.g. &ldquo;chocolate croissants&rdquo;, &ldquo;paneer biryani&rdquo;) to automatically classify category, diet labels, and portion suggestions.
        </p>

        <div className="flex gap-2">
          <input
            type="text"
            value={imageHint}
            onChange={(e) => setImageHint(e.target.value)}
            placeholder="e.g. 8 freshly baked croissants from morning batch"
            className="flex-1 px-4 py-3 rounded-xl border border-neutral-200 text-sm bg-white font-medium focus:outline-none focus:border-black"
          />
          <button
            type="button"
            onClick={handleExtractImage}
            disabled={isExtractingImage || !imageHint.trim()}
            className="px-5 py-3 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1.5 flex-shrink-0"
          >
            {isExtractingImage ? 'Analyzing...' : <>Analyze Food</>}
          </button>
        </div>

        {extractedData && (
          <div className="mt-4 p-4 bg-white rounded-2xl border border-neutral-200 animate-in fade-in">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black text-black uppercase tracking-wide">
                Detected Attributes ({Math.round(extractedData.confidence_score * 100)}% Confidence)
              </span>
              <span className="text-[10px] bg-neutral-100 text-neutral-800 px-2 py-0.5 rounded-md font-bold">
                Review Required
              </span>
            </div>
            <p className="text-xs text-neutral-700 mb-3">
              Name: <strong>{extractedData.detected_name}</strong> • Category: <strong>{extractedData.category}</strong> • Diet: <strong>{extractedData.is_vegetarian ? 'Pure Veg' : 'Non-Veg'}</strong>
            </p>
            <button
              type="button"
              onClick={applyExtractedData}
              className="px-4 py-2 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-sm"
            >
              <CheckCircle className="w-3.5 h-3.5 text-[#06C167]" /> Apply to Form
            </button>
          </div>
        )}
      </div>

      {/* Main Listing Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200 shadow-sm space-y-6">
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-black mb-1.5">Listing Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Artisan Butter Croissants & Danish Box"
              className="w-full px-4 py-3 rounded-xl bg-neutral-100 border border-neutral-200 text-sm font-semibold text-black focus:outline-none focus:bg-white focus:border-black"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-black mb-1.5">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as FoodCategory)}
              className="w-full px-4 py-3 rounded-xl bg-neutral-100 border border-neutral-200 text-xs font-bold text-black focus:outline-none focus:bg-white focus:border-black"
            >
              <option value="MEALS">Meals / Cooked Platters</option>
              <option value="BAKERY">Bakery & Pastries</option>
              <option value="PRODUCE">Fresh Produce / Fruits</option>
              <option value="GROCERY">Groceries & Packaged</option>
              <option value="SNACKS">Snacks & Sandwiches</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-black mb-1.5">Listing Type</label>
            <select
              value={listingType}
              onChange={(e) => setListingType(e.target.value as ListingType)}
              className="w-full px-4 py-3 rounded-xl bg-neutral-100 border border-neutral-200 text-xs font-bold text-black focus:outline-none focus:bg-white focus:border-black"
            >
              <option value="SALE">Discounted Sale (Consumers & Public)</option>
              <option value="DONATION">Free Donation (NGOs & Shelters Only)</option>
            </select>
          </div>
        </div>

        {/* Quantity and Pricing with Uber Style Smart Pricing button */}
        <div className="p-5 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-bold text-black mb-1">Quantity</label>
              <input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-white border border-neutral-200 text-sm font-semibold text-black focus:outline-none focus:border-black"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-black mb-1">Unit</label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="portions"
                className="w-full px-3 py-2 rounded-xl bg-white border border-neutral-200 text-sm font-semibold text-black focus:outline-none focus:border-black"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-black mb-1">Regular Price (₹)</label>
              <input
                type="number"
                min="0"
                required
                value={originalPrice}
                onChange={(e) => setOriginalPrice(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-white border border-neutral-200 text-sm font-semibold text-black focus:outline-none focus:border-black"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-black mb-1">Surplus Price (₹)</label>
              <input
                type="number"
                min="0"
                disabled={listingType === 'DONATION'}
                value={listingType === 'DONATION' ? 0 : surplusPrice}
                onChange={(e) => setSurplusPrice(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-white border border-neutral-200 text-sm font-semibold text-black focus:outline-none focus:border-black disabled:bg-neutral-100"
              />
            </div>
          </div>

          {/* AI Feature #2: Smart Pricing button */}
          {listingType === 'SALE' && (
            <div className="pt-3 border-t border-neutral-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <span className="text-xs text-neutral-500 font-medium">
                Compute algorithmic time-decay pricing based on remaining hours and stock pressure.
              </span>
              <button
                type="button"
                onClick={handleSmartPricing}
                disabled={isCalculatingPricing}
                className="px-4 py-2 bg-black hover:bg-neutral-800 text-white rounded-full text-xs font-bold transition-all flex items-center gap-1.5 flex-shrink-0"
              >
                <Zap className="w-3.5 h-3.5 text-[#06C167]" />
                {isCalculatingPricing ? 'Computing...' : 'AI Dynamic Pricing'}
              </button>
            </div>
          )}

          {pricingRationale && (
            <div className="p-3 bg-white text-black rounded-xl text-xs border border-neutral-200 font-medium">
              {pricingRationale}
            </div>
          )}
        </div>

        {/* Food Safety & Pickup Timestamps */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-black" />
            <span className="text-xs font-black text-black uppercase tracking-wider">
              Pickup Window & Expiry Timestamps
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-black mb-1">Pickup Starts</label>
              <input
                type="datetime-local"
                required
                value={pickupStart}
                onChange={(e) => setPickupStart(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-neutral-100 border border-neutral-200 text-xs font-semibold text-black focus:outline-none focus:bg-white focus:border-black"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-black mb-1">Pickup Deadline</label>
              <input
                type="datetime-local"
                required
                value={pickupEnd}
                onChange={(e) => setPickupEnd(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-neutral-100 border border-neutral-200 text-xs font-semibold text-black focus:outline-none focus:bg-white focus:border-black"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-black mb-1">Best Before / Expiry</label>
              <input
                type="datetime-local"
                required
                value={expiryTime}
                onChange={(e) => setExpiryTime(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-neutral-100 border border-neutral-200 text-xs font-semibold text-black focus:outline-none focus:bg-white focus:border-black"
              />
            </div>
          </div>
        </div>

        {/* Description & Image */}
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-black mb-1">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Freshly prepared in our commercial kitchen today. Stored in temperature-controlled display."
              className="w-full px-4 py-3 rounded-xl bg-neutral-100 border border-neutral-200 text-sm font-medium text-black focus:outline-none focus:bg-white focus:border-black"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-black mb-1">Image URL</label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-neutral-100 border border-neutral-200 text-sm font-medium text-black focus:outline-none focus:bg-white focus:border-black"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-4 bg-black hover:bg-neutral-800 text-white rounded-full font-black text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isLoading ? 'Publishing...' : <>Publish Food Listing <ArrowRight className="w-4 h-4" /></>}
        </button>

      </form>

    </div>
  );
}
