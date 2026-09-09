'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { Utensils, Bell, LogOut, MapPin, ChevronDown, Compass, Store, HeartHandshake, ShieldCheck } from 'lucide-react';

export function Navbar() {
  const { user, role, logout } = useAuth();
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      api.getNotifications()
        .then((notifs) => {
          const unread = notifs.filter((n: any) => !n.is_read).length;
          setUnreadCount(unread);
        })
        .catch(() => {});
    }
  }, [user, pathname]);

  return (
    <nav className="sticky top-0 z-50 bg-black text-white border-b border-neutral-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Uber-Style Left Brand & Address Pill */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-xl bg-white text-black flex items-center justify-center font-black text-lg transition-transform group-hover:scale-105">
                <Utensils className="w-5 h-5 text-black stroke-[2.5]" />
              </div>
              <span className="font-extrabold text-2xl tracking-tighter text-white">
                ResQ<span className="text-[#06C167]">Meal</span>
              </span>
            </Link>

            {/* Uber-Style Location Chip */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-semibold cursor-pointer transition-colors border border-neutral-800">
              <MapPin className="w-3.5 h-3.5 text-[#06C167]" />
              <span>Bangalore Central, KA</span>
              <ChevronDown className="w-3 h-3 text-neutral-400" />
            </div>
          </div>

          {/* Navigation Links (Uber Style) */}
          <div className="hidden md:flex items-center gap-1">
            <Link 
              href="/" 
              className={`px-3.5 py-1.5 rounded-full text-sm font-semibold transition-all ${
                pathname === '/' ? 'bg-white text-black' : 'text-neutral-300 hover:text-white hover:bg-neutral-900'
              }`}
            >
              Overview
            </Link>

            {(!role || role === 'CONSUMER') && (
              <>
                <Link 
                  href="/consumer/dashboard" 
                  className={`px-3.5 py-1.5 rounded-full text-sm font-semibold flex items-center gap-1.5 transition-all ${
                    pathname.startsWith('/consumer/dashboard') ? 'bg-white text-black' : 'text-neutral-300 hover:text-white hover:bg-neutral-900'
                  }`}
                >
                  <Compass className="w-4 h-4" /> Browse Meals
                </Link>
                {user && (
                  <Link 
                    href="/consumer/reservations" 
                    className={`px-3.5 py-1.5 rounded-full text-sm font-semibold transition-all ${
                      pathname.startsWith('/consumer/reservations') ? 'bg-white text-black' : 'text-neutral-300 hover:text-white hover:bg-neutral-900'
                    }`}
                  >
                    My Orders
                  </Link>
                )}
              </>
            )}

            {role === 'PROVIDER' && (
              <>
                <Link 
                  href="/provider/dashboard" 
                  className={`px-3.5 py-1.5 rounded-full text-sm font-semibold flex items-center gap-1.5 transition-all ${
                    pathname === '/provider/dashboard' ? 'bg-white text-black' : 'text-neutral-300 hover:text-white hover:bg-neutral-900'
                  }`}
                >
                  <Store className="w-4 h-4" /> Merchant Hub
                </Link>
                <Link 
                  href="/provider/create-listing" 
                  className={`px-3.5 py-1.5 rounded-full text-sm font-semibold transition-all ${
                    pathname === '/provider/create-listing' ? 'bg-white text-black' : 'text-neutral-300 hover:text-white hover:bg-neutral-900'
                  }`}
                >
                  + Add Surplus
                </Link>
                <Link 
                  href="/provider/ai-surplus" 
                  className={`px-3.5 py-1.5 rounded-full text-sm font-semibold transition-all ${
                    pathname === '/provider/ai-surplus' ? 'bg-white text-black' : 'text-neutral-300 hover:text-white hover:bg-neutral-900'
                  }`}
                >
                  AI Predictor
                </Link>
              </>
            )}

            {role === 'NGO' && (
              <Link 
                href="/ngo/dashboard" 
                className={`px-3.5 py-1.5 rounded-full text-sm font-semibold flex items-center gap-1.5 transition-all ${
                  pathname.startsWith('/ngo') ? 'bg-white text-black' : 'text-neutral-300 hover:text-white hover:bg-neutral-900'
                }`}
              >
                <HeartHandshake className="w-4 h-4 text-[#06C167]" /> Relief Portal
              </Link>
            )}

            {role === 'ADMIN' && (
              <Link 
                href="/admin/dashboard" 
                className={`px-3.5 py-1.5 rounded-full text-sm font-semibold flex items-center gap-1.5 transition-all ${
                  pathname.startsWith('/admin') ? 'bg-white text-black' : 'text-neutral-300 hover:text-white hover:bg-neutral-900'
                }`}
              >
                <ShieldCheck className="w-4 h-4" /> Platform Admin
              </Link>
            )}
          </div>

          {/* Right Action Menu (Uber High-Contrast Buttons) */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-neutral-900 text-neutral-300 border border-neutral-800 uppercase tracking-wider">
                  {user.role}
                </span>

                <div className="relative p-2 rounded-full hover:bg-neutral-900 text-neutral-300 hover:text-white cursor-pointer transition-colors">
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#06C167] text-black text-[10px] font-black rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 pl-2 border-l border-neutral-800">
                  <span className="text-xs font-semibold text-neutral-200 hidden sm:inline-block">
                    {user.full_name}
                  </span>
                  <button
                    onClick={logout}
                    title="Logout"
                    className="p-2 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-900 rounded-full transition-colors"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 bg-white text-black hover:bg-neutral-200 text-sm font-bold rounded-full transition-all"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}
