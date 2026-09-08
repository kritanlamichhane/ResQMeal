'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { UserRole } from '@/types';
import { UtensilsCrossed, User, Store, HeartHandshake, ArrowRight, ShieldCheck } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  
  const [role, setRole] = useState<UserRole>('CONSUMER');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  
  // Provider Specific
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('Restaurant');
  const [fssaiLicense, setFssaiLicense] = useState('');
  const [address, setAddress] = useState('');

  // NGO Specific
  const [orgName, setOrgName] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [dailyCapacity, setDailyCapacity] = useState(150);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const payload: any = {
      email,
      password,
      full_name: fullName,
      phone,
      role,
    };

    if (role === 'PROVIDER') {
      payload.business_name = businessName;
      payload.business_type = businessType;
      payload.fssai_license = fssaiLicense;
      payload.address = address;
    } else if (role === 'NGO') {
      payload.org_name = orgName;
      payload.registration_number = registrationNumber;
      payload.daily_meal_capacity = Number(dailyCapacity);
      payload.address = address;
    }

    try {
      await api.register(payload);
      router.push('/login');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-gray-50/50">
      <div className="max-w-lg w-full">
        
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
          
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto mb-3 shadow-md">
              <UtensilsCrossed className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black text-gray-900">Create ResQMeal Account</h1>
            <p className="text-xs text-gray-500 mt-1">Join the food surplus reduction movement</p>
          </div>

          {/* Role Tabs */}
          <div className="grid grid-cols-3 gap-2 p-1.5 bg-gray-100 rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => setRole('CONSUMER')}
              className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                role === 'CONSUMER' ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <User className="w-3.5 h-3.5" /> Consumer
            </button>
            <button
              type="button"
              onClick={() => setRole('PROVIDER')}
              className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                role === 'PROVIDER' ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Store className="w-3.5 h-3.5" /> Food Provider
            </button>
            <button
              type="button"
              onClick={() => setRole('NGO')}
              className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                role === 'NGO' ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <HeartHandshake className="w-3.5 h-3.5" /> NGO Shelter
            </button>
          </div>

          {error && (
            <div className="p-3 mb-4 rounded-xl bg-red-50 text-red-700 text-xs font-medium border border-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-3.5">
            
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Aarav Sharma"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 chars"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Provider Conditional Fields */}
            {role === 'PROVIDER' && (
              <div className="pt-2 border-t border-gray-100 space-y-3">
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                  Business Details & Food Safety
                </span>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Business Name</label>
                  <input
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Bella Italia Bakery"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Business Type</label>
                    <select
                      value={businessType}
                      onChange={(e) => setBusinessType(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="Restaurant">Restaurant</option>
                      <option value="Bakery">Bakery & Cafe</option>
                      <option value="Supermarket">Supermarket</option>
                      <option value="Cafeteria">Cafeteria</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">FSSAI / Food License</label>
                    <input
                      type="text"
                      value={fssaiLicense}
                      onChange={(e) => setFssaiLicense(e.target.value)}
                      placeholder="FSSAI-123456"
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Store Address</label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Indiranagar, Bangalore"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            )}

            {/* NGO Conditional Fields */}
            {role === 'NGO' && (
              <div className="pt-2 border-t border-gray-100 space-y-3">
                <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">
                  NGO Organization Profile
                </span>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Organization Name</label>
                  <input
                    type="text"
                    required
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder="e.g. Robin Hood Army Bangalore"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Reg Number</label>
                    <input
                      type="text"
                      value={registrationNumber}
                      onChange={(e) => setRegistrationNumber(e.target.value)}
                      placeholder="NGO-REG-2025"
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Daily Meal Capacity</label>
                    <input
                      type="number"
                      value={dailyCapacity}
                      onChange={(e) => setDailyCapacity(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Shelter / Depot Address</label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Koramangala, Bangalore"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 mt-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? 'Creating account...' : <>Complete Registration <ArrowRight className="w-4 h-4" /></>}
            </button>

          </form>

          <p className="mt-5 text-center text-xs text-gray-500">
            Already have an account?{' '}
            <Link href="/login" className="font-bold text-emerald-600 hover:underline">
              Sign In
            </Link>
          </p>

        </div>

      </div>
    </div>
  );
}
