import React from 'react';
import { TrendingUp, Clock, Download, RefreshCw, CheckCircle, Lock, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';

import { ERPPageHeader } from "../../erp/shared/ERPPageHeader";
import { ERPStatCard } from "../../erp/shared/ERPStatCard";

export default function AdminRevenue() {
  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ERPPageHeader
          icon={<DollarSign size={20} />}
          title="Admin Revenue Overview"
          description="High-level summary of active cycles and pool activity."
          breadcrumbs={[{ label: "ERP" }, { label: "Admin" }, { label: "Revenue" }]}
          actions={
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search transactions..." 
                className="bg-[#111115] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs font-semibold text-white focus:outline-none focus:border-indigo-500 transition-colors w-64"
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          }
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6 mb-8">
          <div className="lg:col-span-8">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 h-full flex flex-col justify-center">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-indigo-200 mb-2">Current Active Cycle</div>
                  <div className="text-3xl sm:text-4xl font-black tracking-tighter text-white">March 2026 Revenue Pool</div>
                  <div className="text-sm font-bold text-indigo-300 mt-2">ID: #RP-2026-03</div>
                </div>
                <div className="text-left sm:text-right">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-indigo-200 mb-1">Period Range</div>
                  <div className="font-bold text-white text-sm">Mar 01 — Mar 31, 2026</div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 bg-[#111115] border border-white/5 rounded-3xl p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-amber-500 mb-4">
                <Clock className="w-5 h-5" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Pending Admin Review</span>
              </div>
              <div className="flex items-end gap-2">
                <div className="text-5xl font-black text-white">4</div>
                <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Days Left</div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <button className="flex-1 bg-[#1a1a20] border border-white/10 hover:border-white/20 transition-colors py-3 rounded-xl flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest">
                <Download className="w-4 h-4" /> Export
              </button>
              <button className="flex-1 bg-indigo-600 hover:bg-indigo-500 transition-colors py-3 rounded-xl flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest">
                <RefreshCw className="w-4 h-4" /> Refresh
              </button>
            </div>
          </div>
        </div>

        <div className="bg-[#111115] border border-white/5 rounded-3xl p-6 mb-8 overflow-x-auto">
          <div className="flex justify-between min-w-[700px] px-4">
            {['Open', 'Calculating', 'Admin Review', 'Locked', 'P. Generated', 'Paid', 'Archived'].map((label, i) => (
              <div key={i} className={`flex flex-col items-center flex-1 ${i === 2 ? 'text-indigo-400' : 'text-zinc-500'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-3 text-xs font-black shadow-inner
                  ${i === 2 ? 'bg-indigo-500 text-white' : 'bg-[#1a1a20] text-zinc-600 border border-white/5'}`}>
                  {i < 2 ? <CheckCircle className="w-5 h-5" /> : i === 2 ? '3' : ''}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">{label}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 px-12">
            <div className="h-1.5 bg-[#1a1a20] rounded-full relative overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: "33%" }} className="absolute left-0 top-0 h-full bg-indigo-500 rounded-full" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <ERPStatCard title="Gross Revenue" value="$18,500.00" subValue="+12% from previous cycle" icon={<TrendingUp size={18} className="text-emerald-500" />} accentColor="#10b981" />
          <ERPStatCard title="Eligible Revenue" value="$15,200.00" subValue="Based on approved submissions" icon={<CheckCircle size={18} className="text-blue-500" />} accentColor="#3b82f6" />
          <ERPStatCard title="40% Team Pool" value="$6,080.00" subValue="Allocated for member distribution" icon={<DollarSign size={18} className="text-indigo-500" />} accentColor="#6366f1" />
          <ERPStatCard title="Total Points" value="27,400 pts" subValue="Distributed across 142 tasks" icon={<TrendingUp size={18} className="text-amber-500" />} accentColor="#f59e0b" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 mb-8">
          <div className="xl:col-span-8 bg-[#111115] border border-white/5 rounded-3xl p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-400" />
                <span className="font-bold text-white text-base">Pool Activity Summary</span>
              </div>
              <div className="bg-[#1a1a20] border border-white/5 text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full text-zinc-400">Mar 1 - Mar 26</div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
              {[
                { label: "Total Tasks", value: "142", color: "text-white", bg: "bg-[#1a1a20]" },
                { label: "Approved", value: "128", color: "text-emerald-400", bg: "bg-emerald-500/10" },
                { label: "Rejected", value: "14", color: "text-rose-400", bg: "bg-rose-500/10" },
                { label: "Members", value: "18", color: "text-blue-400", bg: "bg-blue-500/10" }
              ].map((stat, i) => (
                <div key={i} className={`${stat.bg} rounded-2xl p-6 border border-white/5`}>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">{stat.label}</div>
                  <div className={`text-4xl font-black ${stat.color}`}>{stat.value}</div>
                </div>
              ))}
            </div>

            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-4">Weekly Points Distribution</div>
              <div className="flex items-end gap-6 h-48 border-b border-white/5 pb-2">
                {[4800, 7200, 6800, 8500].map((height, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                    <motion.div initial={{ height: 0 }} animate={{ height: `${(height / 9000) * 100}%` }} className="w-full bg-indigo-500/30 border border-indigo-500/50 rounded-t-xl relative overflow-hidden">
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-500" />
                    </motion.div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mt-2">Wk {i+1}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="xl:col-span-4 space-y-6">
            <div className="bg-[#111115] border border-white/5 rounded-3xl p-8">
              <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-6">Pending Admin Review</div>
              <div className="space-y-6">
                {[
                  "Points Calculation Finalized by System",
                  "Calculation Started by Jane Doe",
                  "Cycle Closed by System",
                  "Pool Created by System"
                ].map((text, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-2 h-2 mt-1.5 rounded-full flex-shrink-0" style={{ background: i === 0 ? "#6366f1" : "#3f3f46" }} />
                    <div>
                      <div className="text-sm font-semibold text-white mb-1">{text}</div>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">MAR 26, 2026 • 09:40 AM</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}