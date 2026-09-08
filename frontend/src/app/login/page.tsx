'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { UserRole } from '@/types';
import { UtensilsCrossed, Lock, Mail, ArrowRight, ShieldCheck, Store, HeartHandshake, User } from 'lucide-react';

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
      // Fetch me or redirect
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
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-gray-50/50">
      <div className="max-w-md w-full">
        
        {/* Card */}
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
          
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto mb-3 shadow-md">
              <UtensilsCrossed className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black text-gray-900">Welcome Back</h1>
            <p className="text-xs text-gray-500 mt-1">Sign in to your ResQMeal account</p>
          </div>

          {/* Quick 1-Click Role Login for CV / Portfolio Reviewers */}
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50/80 border border-emerald-100">
            <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider block mb-2">
              ⚡ 1-Click Portfolio Demo Access
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleRoleQuickLogin('CONSUMER')}
                disabled={isLoading}
                className="p-2 bg-white rounded-xl text-xs font-bold text-gray-700 hover:text-emerald-700 hover:border-emerald-300 border border-gray-200 shadow-sm flex items-center justify-center gap-1.5 transition-all"
              >
                <User className="w-3.5 h-3.5 text-emerald-600" /> Consumer
              </button>
              <button
                type="button"
                onClick={() => handleRoleQuickLogin('PROVIDER')}
                disabled={isLoading}
                className="p-2 bg-white rounded-xl text-xs font-bold text-gray-700 hover:text-emerald-700 hover:border-emerald-300 border border-gray-200 shadow-sm flex items-center justify-center gap-1.5 transition-all"
              >
                <Store className="w-3.5 h-3.5 text-teal-600" /> Provider
              </button>
              <button
                type="button"
                onClick={() => handleRoleQuickLogin('NGO')}
                disabled={isLoading}
                className="p-2 bg-white rounded-xl text-xs font-bold text-gray-700 hover:text-emerald-700 hover:border-emerald-300 border border-gray-200 shadow-sm flex items-center justify-center gap-1.5 transition-all"
              >
                <HeartHandshake className="w-3.5 h-3.5 text-amber-600" /> NGO Relief
              </button>
              <button
                type="button"
                onClick={() => handleRoleQuickLogin('ADMIN')}
                disabled={isLoading}
                className="p-2 bg-white rounded-xl text-xs font-bold text-gray-700 hover:text-emerald-700 hover:border-emerald-300 border border-gray-200 shadow-sm flex items-center justify-center gap-1.5 transition-all"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" /> Admin
              </button>
            </div>
          </div>

          <div className="relative flex py-2 items-center mb-4">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink mx-3 text-[11px] text-gray-400 font-medium uppercase">Or Standard Login</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          {error && (
            <div className="p-3 mb-4 rounded-xl bg-red-50 text-red-700 text-xs font-medium border border-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleFormLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? 'Signing in...' : <>Sign In <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-gray-500">
            Don't have an account?{' '}
            <Link href="/register" className="font-bold text-emerald-600 hover:underline">
              Create one now
            </Link>
          </p>

        </div>

      </div>
    </div>
  );
}
