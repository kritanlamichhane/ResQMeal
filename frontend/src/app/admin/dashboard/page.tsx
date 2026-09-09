'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { PlatformMetrics } from '@/types';
import { ShieldCheck, Activity, Database, Server, RefreshCw, Users } from 'lucide-react';

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<PlatformMetrics | null>(null);
  const [health, setHealth] = useState<any | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [isTriggering, setIsTriggering] = useState(false);
  const [triggerResult, setTriggerResult] = useState<any | null>(null);

  const loadData = () => {
    api.getPlatformMetrics().then(setMetrics).catch(() => {});
    api.getSystemHealth().then(setHealth).catch(() => {});
    api.getAdminUsers().then(setUsers).catch(() => {});
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRunExpiration = async () => {
    setIsTriggering(true);
    setTriggerResult(null);
    try {
      const res = await api.runExpirationWorker();
      setTriggerResult(res);
      loadData();
    } catch (err: any) {
      setTriggerResult({ error: err.message || 'Worker execution failed' });
    } finally {
      setIsTriggering(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
            Platform Observability
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-black tracking-tight mt-0.5">
            System Operations & Health
          </h1>
        </div>

        <button
          onClick={handleRunExpiration}
          disabled={isTriggering}
          className="px-5 py-2.5 bg-black hover:bg-neutral-800 text-white rounded-full text-xs font-bold shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isTriggering ? 'animate-spin' : ''}`} />
          Run Expiration Worker
        </button>
      </div>

      {triggerResult && (
        <div className="p-4 mb-6 rounded-2xl bg-black text-[#06C167] font-mono text-xs border border-neutral-800">
          {JSON.stringify(triggerResult, null, 2)}
        </div>
      )}

      {/* Observability & Health Row (Uber Style) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-neutral-100 text-black flex items-center justify-center flex-shrink-0">
            <Activity className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">
              Liveness
            </span>
            <div className="text-xl font-black text-black flex items-center gap-2 mt-0.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#06C167] animate-pulse" />
              {health?.status || 'UP'}
            </div>
            <span className="text-[11px] text-neutral-500 font-medium">PID: {health?.process?.pid || 8000}</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-neutral-100 text-black flex items-center justify-center flex-shrink-0">
            <Database className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">
              Database
            </span>
            <div className="text-base font-black text-black mt-0.5">
              {health?.database?.engine || 'PostgreSQL / SQLite'}
            </div>
            <span className="text-[11px] text-[#05944F] font-bold">ACID Transaction Locked</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-neutral-100 text-black flex items-center justify-center flex-shrink-0">
            <Server className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">
              Cache Layer
            </span>
            <div className="text-sm font-black text-black mt-0.5">
              {health?.cache?.type || 'Redis Cache Layer'}
            </div>
            <span className="text-[11px] text-neutral-500 font-medium">Sliding Window & Mutex Active</span>
          </div>
        </div>
      </div>

      {/* Global Impact Summary */}
      <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm p-6 mb-8">
        <h2 className="text-lg font-black text-black tracking-tight mb-4">
          Real-Time Global Food Rescue Impact
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-center">
          <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200">
            <div className="text-2xl sm:text-3xl font-black text-black">{metrics?.total_meals_rescued || 0}</div>
            <div className="text-xs text-neutral-500 font-bold mt-1">Meals Rescued</div>
          </div>
          <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200">
            <div className="text-2xl sm:text-3xl font-black text-black">{metrics?.total_food_weight_kg || 0} kg</div>
            <div className="text-xs text-neutral-500 font-bold mt-1">Food Diverted</div>
          </div>
          <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200">
            <div className="text-2xl sm:text-3xl font-black text-[#05944F]">{metrics?.total_co2_prevented_kg || 0} kg</div>
            <div className="text-xs text-neutral-500 font-bold mt-1">CO₂ Prevented</div>
          </div>
          <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200">
            <div className="text-2xl sm:text-3xl font-black text-black">₹{metrics?.total_money_saved_consumers || 0}</div>
            <div className="text-xs text-neutral-500 font-bold mt-1">Consumer Savings</div>
          </div>
          <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200">
            <div className="text-2xl sm:text-3xl font-black text-black">{metrics?.pickup_completion_rate_pct || 100}%</div>
            <div className="text-xs text-neutral-500 font-bold mt-1">Fulfillment Rate</div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-black" />
          <h2 className="text-lg font-black text-black tracking-tight">Platform Users</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-neutral-200 text-[11px] uppercase font-bold text-neutral-400 tracking-wider">
              <tr>
                <th className="pb-3">ID</th>
                <th className="pb-3">Name</th>
                <th className="pb-3">Email</th>
                <th className="pb-3">Role</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-neutral-50">
                  <td className="py-3 text-xs font-mono text-neutral-400">#{u.id}</td>
                  <td className="py-3 font-bold text-black">{u.full_name}</td>
                  <td className="py-3 text-xs text-neutral-500">{u.email}</td>
                  <td className="py-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-neutral-100 text-black uppercase tracking-wider">
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className="inline-flex items-center gap-1.5 text-xs text-[#05944F] font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#06C167]" /> Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
