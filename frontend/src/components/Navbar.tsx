'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { UtensilsCrossed, Bell, User as UserIcon, LogOut, ShieldAlert, HeartHandshake, Store, Compass } from 'lucide-react';

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
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-gray-900">
                ResQ<span className="text-emerald-600">Meal</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
                Surplus Rescue
              </span>
            </div>
          </Link>

          {/* Role-Aware Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link 
              href="/" 
              className={`text-sm font-medium transition-colors ${pathname === '/' ? 'text-emerald-600 font-semibold' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Home
            </Link>

            {(!role || role === 'CONSUMER') && (
              <>
                <Link 
                  href="/consumer/dashboard" 
                  className={`text-sm font-medium flex items-center gap-1 transition-colors ${pathname.startsWith('/consumer/dashboard') ? 'text-emerald-600 font-semibold' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  <Compass className="w-4 h-4" /> Discover Food
                </Link>
                {user && (
                  <Link 
                    href="/consumer/reservations" 
                    className={`text-sm font-medium transition-colors ${pathname.startsWith('/consumer/reservations') ? 'text-emerald-600 font-semibold' : 'text-gray-600 hover:text-gray-900'}`}
                  >
                    My Pickups
                  </Link>
                )}
              </>
            )}

            {role === 'PROVIDER' && (
              <>
                <Link 
                  href="/provider/dashboard" 
                  className={`text-sm font-medium flex items-center gap-1 transition-colors ${pathname === '/provider/dashboard' ? 'text-emerald-600 font-semibold' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  <Store className="w-4 h-4" /> Dashboard
                </Link>
                <Link 
                  href="/provider/create-listing" 
                  className={`text-sm font-medium transition-colors ${pathname === '/provider/create-listing' ? 'text-emerald-600 font-semibold' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  + Add Surplus
                </Link>
                <Link 
                  href="/provider/ai-surplus" 
                  className={`text-sm font-medium transition-colors ${pathname === '/provider/ai-surplus' ? 'text-emerald-600 font-semibold' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  AI Surplus Predictor
                </Link>
              </>
            )}

            {role === 'NGO' && (
              <Link 
                href="/ngo/dashboard" 
                className={`text-sm font-medium flex items-center gap-1 transition-colors ${pathname.startsWith('/ngo') ? 'text-emerald-600 font-semibold' : 'text-gray-600 hover:text-gray-900'}`}
              >
                <HeartHandshake className="w-4 h-4" /> NGO Relief Portal
              </Link>
            )}

            {role === 'ADMIN' && (
              <Link 
                href="/admin/dashboard" 
                className={`text-sm font-medium flex items-center gap-1 transition-colors ${pathname.startsWith('/admin') ? 'text-emerald-600 font-semibold' : 'text-gray-600 hover:text-gray-900'}`}
              >
                <ShieldAlert className="w-4 h-4" /> Platform Admin
              </Link>
            )}
          </div>

          {/* Right Action Menu */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                {/* Role Badge */}
                <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                  {user.role}
                </span>

                {/* Notifications */}
                <div className="relative p-2 rounded-full hover:bg-gray-100 text-gray-600 cursor-pointer">
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </div>

                {/* User Info & Logout */}
                <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
                  <span className="text-sm font-medium text-gray-700 hidden lg:inline-block">
                    {user.full_name}
                  </span>
                  <button
                    onClick={logout}
                    title="Logout"
                    className="p-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="text-sm font-semibold text-gray-700 hover:text-emerald-600 px-3 py-2 rounded-lg transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg shadow-sm transition-all hover:shadow-md"
                >
                  Join Platform
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}
