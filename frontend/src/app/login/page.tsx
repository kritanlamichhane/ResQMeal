'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { UserRole } from '@/types';
import { Utensils, Lock, Mail, ArrowRight, ShieldCheck, Store, HeartHandshake, User } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, quickLoginAs } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRoleQuickLogin = async (role: UserRole) => {
    setIsLoading(true);
    setError(null);
    try {
      await quickLoginAs(role);
      navigateAfterLogin(role);
    } catch (err: any) {
      setError(err.message || 'Quick login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await login(email, password);
      router.push('/consumer/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const navigateAfterLogin = (role: UserRole) => {
    if (role === 'CONSUMER') router.push('/consumer/dashboard');
    else if (role === 'PROVIDER') router.push('/provider/dashboard');
    else if (role === 'NGO') router.push('/ngo/dashboard');
    else if (role === 'ADMIN') router.push('/admin/dashboard');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-white font-sans">
      <div className="max-w-md w-full">
        
        {/* Uber Style Card */}
        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-neutral-200 shadow-xl">
          
          <div className="mb-8">
            <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center mb-4">
              <Utensils className="w-5 h-5 stroke-[2.5]" />
            </div>
            <h1 className="text-3xl font-black text-black tracking-tight">
              Sign in to ResQMeal
            </h1>
            <p className="text-xs text-neutral-500 font-medium mt-1">
              Select your role or enter credentials to continue.
            </p>
          </div>

          {/* 1-Click Role Quick Login (Uber Style) */}
          <div className="mb-8 p-4 rounded-2xl bg-neutral-50 border border-neutral-200">
            <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block mb-2.5">
              ⚡ 1-Click Demo Login
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleRoleQuickLogin('CONSUMER')}
                disabled={isLoading}
                className="p-2.5 bg-white rounded-xl text-xs font-bold text-black hover:bg-neutral-100 border border-neutral-200 shadow-sm flex items-center justify-center gap-1.5 transition-all"
              >
                <User className="w-3.5 h-3.5 text-black" /> Consumer
              </button>
              <button
                type="button"
                onClick={() => handleRoleQuickLogin('PROVIDER')}
                disabled={isLoading}
                className="p-2.5 bg-white rounded-xl text-xs font-bold text-black hover:bg-neutral-100 border border-neutral-200 shadow-sm flex items-center justify-center gap-1.5 transition-all"
              >
                <Store className="w-3.5 h-3.5 text-black" /> Merchant
              </button>
              <button
                type="button"
                onClick={() => handleRoleQuickLogin('NGO')}
                disabled={isLoading}
                className="p-2.5 bg-white rounded-xl text-xs font-bold text-black hover:bg-neutral-100 border border-neutral-200 shadow-sm flex items-center justify-center gap-1.5 transition-all"
              >
                <HeartHandshake className="w-3.5 h-3.5 text-[#06C167]" /> Relief NGO
              </button>
              <button
                type="button"
                onClick={() => handleRoleQuickLogin('ADMIN')}
                disabled={isLoading}
                className="p-2.5 bg-white rounded-xl text-xs font-bold text-black hover:bg-neutral-100 border border-neutral-200 shadow-sm flex items-center justify-center gap-1.5 transition-all"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-black" /> Admin
              </button>
            </div>
          </div>

          <div className="relative flex py-2 items-center mb-6">
            <div className="flex-grow border-t border-neutral-200"></div>
            <span className="flex-shrink mx-3 text-[11px] text-neutral-400 font-bold uppercase tracking-wider">Or</span>
            <div className="flex-grow border-t border-neutral-200"></div>
          </div>

          {error && (
            <div className="p-3 mb-5 rounded-xl bg-rose-50 text-rose-800 text-xs font-semibold border border-rose-200">
              {error}
            </div>
          )}

          <form onSubmit={handleFormLogin} className="space-y-4">
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
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl bg-neutral-100 border border-neutral-200 text-sm font-semibold text-black placeholder-neutral-400 focus:outline-none focus:bg-white focus:border-black transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-black hover:bg-neutral-800 text-white rounded-full font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2 shadow-md"
            >
              {isLoading ? 'Signing in...' : <>Continue <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-neutral-500 font-medium">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-bold text-black hover:underline">
              Sign up
            </Link>
          </p>

        </div>

      </div>
    </div>
  );
}
