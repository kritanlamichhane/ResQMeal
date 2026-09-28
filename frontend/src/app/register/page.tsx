'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { UserRole } from '@/types';
import { Utensils, User, Store, HeartHandshake, ArrowRight, ShieldCheck } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  
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
      // Automatically log in the user immediately upon registration
      await login(email, password);

      // Seamlessly redirect to the appropriate dashboard
      if (role === 'PROVIDER') {
        router.push('/provider/dashboard');
      } else if (role === 'NGO') {
        router.push('/ngo/dashboard');
      } else {
        router.push('/consumer/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-white font-sans">
      <div className="max-w-lg w-full">
        
        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-neutral-200 shadow-xl">
          
          <div className="mb-6">
            <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center mb-4">
              <Utensils className="w-5 h-5 stroke-[2.5]" />
            </div>
            <h1 className="text-3xl font-black text-black tracking-tight">Create your account</h1>
            <p className="text-xs text-neutral-500 font-medium mt-1">Select your account type to get started</p>
          </div>

          {/* Uber Style Role Selector */}
          <div className="grid grid-cols-3 gap-2 p-1.5 bg-neutral-100 rounded-full mb-6">
            <button
              type="button"
              onClick={() => setRole('CONSUMER')}
              className={`py-2 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                role === 'CONSUMER' ? 'bg-black text-white shadow-sm' : 'text-neutral-600 hover:text-black'
              }`}
            >
              <User className="w-3.5 h-3.5" /> Consumer
            </button>
            <button
              type="button"
              onClick={() => setRole('PROVIDER')}
              className={`py-2 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                role === 'PROVIDER' ? 'bg-black text-white shadow-sm' : 'text-neutral-600 hover:text-black'
              }`}
            >
              <Store className="w-3.5 h-3.5" /> Kitchen
            </button>
            <button
              type="button"
              onClick={() => setRole('NGO')}
              className={`py-2 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                role === 'NGO' ? 'bg-black text-white shadow-sm' : 'text-neutral-600 hover:text-black'
              }`}
            >
              <HeartHandshake className="w-3.5 h-3.5 text-[#06C167]" /> Relief NGO
            </button>
          </div>

          {error && (
            <div className="p-3 mb-5 rounded-xl bg-rose-50 text-rose-800 text-xs font-semibold border border-rose-200">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            
            <div>
              <label className="block text-xs font-bold text-black mb-1.5">Full legal name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Aarav Sharma"
                className="w-full px-4 py-3 rounded-xl bg-neutral-100 border border-neutral-200 text-sm font-semibold text-black placeholder-neutral-400 focus:outline-none focus:bg-white focus:border-black transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-black mb-1.5">Email address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-4 py-3 rounded-xl bg-neutral-100 border border-neutral-200 text-sm font-semibold text-black placeholder-neutral-400 focus:outline-none focus:bg-white focus:border-black transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-black mb-1.5">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-4 py-3 rounded-xl bg-neutral-100 border border-neutral-200 text-sm font-semibold text-black placeholder-neutral-400 focus:outline-none focus:bg-white focus:border-black transition-all"
                />
              </div>
            </div>

            {/* Provider Fields */}
            {role === 'PROVIDER' && (
              <div className="pt-2 border-t border-neutral-200 space-y-3">
                <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block">
                  Merchant & Safety Credentials
                </span>
                <div>
                  <label className="block text-xs font-bold text-black mb-1">Business Name</label>
                  <input
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Bella Italia Bakery"
                    className="w-full px-4 py-3 rounded-xl bg-neutral-100 border border-neutral-200 text-sm font-semibold text-black focus:outline-none focus:bg-white focus:border-black"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-black mb-1">Business Type</label>
                    <select
                      value={businessType}
                      onChange={(e) => setBusinessType(e.target.value)}
                      className="w-full px-3 py-3 rounded-xl bg-neutral-100 border border-neutral-200 text-xs font-bold text-black focus:outline-none focus:bg-white focus:border-black"
                    >
                      <option value="Restaurant">Restaurant</option>
                      <option value="Bakery">Bakery & Cafe</option>
                      <option value="Supermarket">Supermarket</option>
                      <option value="Cafeteria">Cafeteria</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-black mb-1">FSSAI License #</label>
                    <input
                      type="text"
                      value={fssaiLicense}
                      onChange={(e) => setFssaiLicense(e.target.value)}
                      placeholder="FSSAI-123456"
                      className="w-full px-4 py-3 rounded-xl bg-neutral-100 border border-neutral-200 text-sm font-semibold text-black focus:outline-none focus:bg-white focus:border-black"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-black mb-1">Kitchen Address</label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Indiranagar, Bangalore"
                    className="w-full px-4 py-3 rounded-xl bg-neutral-100 border border-neutral-200 text-sm font-semibold text-black focus:outline-none focus:bg-white focus:border-black"
                  />
                </div>
              </div>
            )}

            {/* NGO Fields */}
            {role === 'NGO' && (
              <div className="pt-2 border-t border-neutral-200 space-y-3">
                <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block">
                  Organization Verification
                </span>
                <div>
                  <label className="block text-xs font-bold text-black mb-1">Organization Name</label>
                  <input
                    type="text"
                    required
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder="e.g. Robin Hood Army"
                    className="w-full px-4 py-3 rounded-xl bg-neutral-100 border border-neutral-200 text-sm font-semibold text-black focus:outline-none focus:bg-white focus:border-black"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-black mb-1">Reg Number</label>
                    <input
                      type="text"
                      value={registrationNumber}
                      onChange={(e) => setRegistrationNumber(e.target.value)}
                      placeholder="NGO-REG-2025"
                      className="w-full px-4 py-3 rounded-xl bg-neutral-100 border border-neutral-200 text-sm font-semibold text-black focus:outline-none focus:bg-white focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-black mb-1">Daily Meal Capacity</label>
                    <input
                      type="number"
                      value={dailyCapacity}
                      onChange={(e) => setDailyCapacity(Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl bg-neutral-100 border border-neutral-200 text-sm font-semibold text-black focus:outline-none focus:bg-white focus:border-black"
                    />
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-black hover:bg-neutral-800 text-white rounded-full font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-4 shadow-md"
            >
              {isLoading ? 'Creating account...' : <>Create Account <ArrowRight className="w-4 h-4" /></>}
            </button>

          </form>

          <p className="mt-8 text-center text-xs text-neutral-500 font-medium">
            Already have an account?{' '}
            <Link href="/login" className="font-bold text-black hover:underline">
              Sign in
            </Link>
          </p>

        </div>

      </div>
    </div>
  );
}
