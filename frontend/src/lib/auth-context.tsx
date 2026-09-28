'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/types';
import { api } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<User>;
  logout: () => void;
  quickLoginAs: (role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('resqmeal_token');
    if (savedToken) {
      setToken(savedToken);
      api.getMe()
        .then((userData) => setUser(userData))
        .catch(() => {
          localStorage.removeItem('resqmeal_token');
          setToken(null);
          setUser(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, pass: string): Promise<User> => {
    const res = await api.login({ email, password: pass });
    localStorage.setItem('resqmeal_token', res.access_token);
    setToken(res.access_token);
    const profile = await api.getMe();
    setUser(profile);
    return profile;
  };

  const logout = () => {
    localStorage.removeItem('resqmeal_token');
    setToken(null);
    setUser(null);
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  };

  const quickLoginAs = async (targetRole: UserRole) => {
    const demoAccounts: Record<UserRole, { email: string; pass: string }> = {
      CONSUMER: { email: 'consumer@resqmeal.com', pass: 'Consumer@1234' },
      PROVIDER: { email: 'provider@bakery.com', pass: 'Provider@1234' },
      NGO: { email: 'ngo@feedhope.org', pass: 'Ngo@1234' },
      ADMIN: { email: 'admin@resqmeal.com', pass: 'Admin@1234' },
    };

    const creds = demoAccounts[targetRole];
    if (creds) {
      await login(creds.email, creds.pass);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        token,
        isLoading,
        login,
        logout,
        quickLoginAs,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
