'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { 
  Utensils, 
  Bell, 
  LogOut, 
  MapPin, 
  ChevronDown, 
  Compass, 
  Store, 
  HeartHandshake, 
  ShieldCheck,
  CheckCheck,
  Clock,
  ShoppingBag,
  Sparkles,
  Info,
  X
} from 'lucide-react';

interface NotificationItem {
  id: number;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export function Navbar() {
  const { user, role, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isLoadingNotifs, setIsLoadingNotifs] = useState(false);

  const notifDropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      setIsLoadingNotifs(true);
      const data = await api.getNotifications();
      const list = Array.isArray(data) ? data : [];
      setNotifications(list);
      setUnreadCount(list.filter((n: NotificationItem) => !n.is_read).length);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setIsLoadingNotifs(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Periodically refresh notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user, pathname]);

  // Close notifications dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    }

    if (isNotifOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isNotifOpen]);

  const toggleNotifications = () => {
    if (!isNotifOpen) {
      fetchNotifications();
    }
    setIsNotifOpen(!isNotifOpen);
  };

  const handleMarkAsRead = async (notifId: number) => {
    try {
      await api.markNotificationRead(notifId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notifId ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const formatRelativeTime = (isoString: string) => {
    try {
      const now = new Date();
      const past = new Date(isoString);
      const diffMs = now.getTime() - past.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return 'Yesterday';
      return `${diffDays}d ago`;
    } catch {
      return '';
    }
  };

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'RESERVATION_CONFIRMED':
        return <ShoppingBag className="w-4 h-4 text-[#06C167]" />;
      case 'RESERVATION_EXPIRED':
      case 'RESERVATION_CANCELLED':
        return <Clock className="w-4 h-4 text-amber-400" />;
      case 'PROVIDER_INVENTORY_UPDATE':
        return <Sparkles className="w-4 h-4 text-blue-400" />;
      default:
        return <Info className="w-4 h-4 text-neutral-300" />;
    }
  };

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

                {/* Notifications Bell Dropdown */}
                <div className="relative" ref={notifDropdownRef}>
                  <button
                    onClick={toggleNotifications}
                    aria-label="Notifications"
                    className={`relative p-2.5 rounded-full transition-all focus:outline-none ${
                      isNotifOpen 
                        ? 'bg-neutral-800 text-white shadow-inner' 
                        : 'hover:bg-neutral-900 text-neutral-300 hover:text-white'
                    }`}
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-[#06C167] text-black text-[10px] font-black rounded-full flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notification Popover Panel */}
                  {isNotifOpen && (
                    <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-[#121212] border border-neutral-800 rounded-2xl shadow-2xl z-50 overflow-hidden text-neutral-200 animate-in fade-in slide-in-from-top-2 duration-150">
                      
                      {/* Header */}
                      <div className="px-4 py-3 bg-[#181818] border-b border-neutral-800 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-white">Notifications</span>
                          {unreadCount > 0 && (
                            <span className="px-2 py-0.5 rounded-full bg-[#06C167]/20 text-[#06C167] text-[10px] font-bold">
                              {unreadCount} unread
                            </span>
                          )}
                        </div>

                        {unreadCount > 0 && (
                          <button
                            onClick={handleMarkAllAsRead}
                            className="text-[11px] font-bold text-neutral-400 hover:text-white flex items-center gap-1 transition-colors"
                          >
                            <CheckCheck className="w-3.5 h-3.5 text-[#06C167]" />
                            Mark all read
                          </button>
                        )}
                      </div>

                      {/* Notification Items List */}
                      <div className="max-h-80 overflow-y-auto divide-y divide-neutral-900">
                        {isLoadingNotifs && notifications.length === 0 ? (
                          <div className="p-8 text-center text-xs text-neutral-500 flex flex-col items-center gap-2">
                            <div className="w-5 h-5 border-2 border-[#06C167] border-t-transparent rounded-full animate-spin" />
                            Loading updates...
                          </div>
                        ) : notifications.length === 0 ? (
                          <div className="p-8 text-center flex flex-col items-center justify-center">
                            <div className="w-12 h-12 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center mb-3 text-neutral-500">
                              <Bell className="w-6 h-6" />
                            </div>
                            <p className="text-sm font-bold text-white">All caught up!</p>
                            <p className="text-xs text-neutral-400 mt-1 max-w-[220px]">
                              You will see order updates, food reservation alerts, and surplus alerts here.
                            </p>
                          </div>
                        ) : (
                          notifications.map((item) => (
                            <div
                              key={item.id}
                              onClick={() => {
                                if (!item.is_read) handleMarkAsRead(item.id);
                                if (role === 'CONSUMER') router.push('/consumer/reservations');
                                else if (role === 'PROVIDER') router.push('/provider/dashboard');
                                setIsNotifOpen(false);
                              }}
                              className={`p-3.5 flex items-start gap-3 hover:bg-neutral-900/90 cursor-pointer transition-colors ${
                                !item.is_read ? 'bg-neutral-900/40 border-l-2 border-l-[#06C167]' : ''
                              }`}
                            >
                              <div className="w-8 h-8 rounded-full bg-neutral-800 border border-neutral-700/60 flex items-center justify-center flex-shrink-0 mt-0.5">
                                {getNotifIcon(item.type)}
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <p className={`text-xs truncate ${!item.is_read ? 'font-bold text-white' : 'font-medium text-neutral-300'}`}>
                                    {item.title}
                                  </p>
                                  <span className="text-[10px] text-neutral-500 whitespace-nowrap">
                                    {formatRelativeTime(item.created_at)}
                                  </span>
                                </div>
                                <p className="text-[11px] text-neutral-400 mt-0.5 line-clamp-2 leading-relaxed">
                                  {item.message}
                                </p>
                              </div>

                              {!item.is_read && (
                                <span className="w-2 h-2 rounded-full bg-[#06C167] flex-shrink-0 mt-2" />
                              )}
                            </div>
                          ))
                        )}
                      </div>

                      {/* Footer */}
                      <div className="px-4 py-2.5 bg-[#161616] border-t border-neutral-800 text-center">
                        <Link
                          href={role === 'CONSUMER' ? '/consumer/reservations' : '/provider/dashboard'}
                          onClick={() => setIsNotifOpen(false)}
                          className="text-[11px] font-bold text-neutral-400 hover:text-white transition-colors"
                        >
                          View order activity & status →
                        </Link>
                      </div>

                    </div>
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
