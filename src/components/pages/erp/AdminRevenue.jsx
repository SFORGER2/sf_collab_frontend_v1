import React from 'react';
import { 
  TrendingUp, Clock, Download, RefreshCw, 
  CheckCircle, Lock 
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminRevenue() {
  return (
    <div className="min-h-screen bg-[#0a0f1c] p-4 sm:p-6 text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex flex-col">
          <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-br from-white to-blue-400 bg-clip-text text-transparent">
            Admin Revenue
          </div>
          <p className="text-gray-400 font-semibold text-sm sm:text-base">View Revenue</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <input 
              type="text" 
              placeholder="Search members, transactions..." 
              className="bg-[#1a2338] border border-gray-700 rounded-full pl-10 py-3 w-full sm:w-80 text-sm focus:outline-none focus:border-blue-500"
            />
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="w-5 h-5 text-gray-400 absolute left-4 top-3.5" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Current Active Cycle */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-3xl p-6 sm:p-8 text-white">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
              <div>
                <div className="uppercase tracking-widest text-xs sm:text-sm opacity-90">CURRENT ACTIVE CYCLE</div>
                <div className="text-2xl sm:text-4xl font-bold mt-2">March 2026 Revenue Pool</div>
                <div className="text-lg sm:text-xl mt-1 opacity-90">ID: #RP-2026-03</div>
              </div>
              <div className="text-left sm:text-right">
                <div className="text-xs sm:text-sm">PERIOD RANGE</div>
                <div className="font-medium">Mar 01 — Mar 31, 2026</div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 bg-[#1a2338] rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-orange-400">
              <Clock className="w-5 h-5" />
              <span className="font-medium">Pending Admin Review</span>
            </div>
            <div className="mt-6 sm:mt-8">
              <div className="text-5xl font-bold">4</div>
              <div className="text-sm text-gray-400">Days Remaining</div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 mt-8 sm:mt-auto">
            <button className="flex-1 bg-[#1a2338] border border-gray-600 hover:border-gray-400 transition-colors py-3.5 rounded-2xl flex items-center justify-center gap-2 text-sm">
              <Download className="w-5 h-5" /> Export
            </button>
            <button className="flex-1 bg-blue-600 hover:bg-blue-500 transition-colors py-3.5 rounded-2xl flex items-center justify-center gap-2 text-sm">
              <RefreshCw className="w-5 h-5" /> Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-6 bg-[#1a2338] rounded-3xl p-6 overflow-x-auto">
        <div className="flex justify-between text-xs sm:text-sm min-w-[700px] mb-4 px-2">
          {['Open', 'Calculating', 'Admin Review', 'Locked', 'P. Generated', 'Paid', 'Archived'].map((label, i) => (
            <div key={i} className={`flex flex-col items-center flex-1 ${i === 2 ? 'text-blue-400' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 text-xs sm:text-sm
                ${i === 2 ? 'bg-blue-500 text-white' : 'bg-gray-700'}`}>
                {i < 2 ? <CheckCircle className="w-5 h-5" /> : i === 2 ? '3' : ''}
              </div>
              <span className="text-center whitespace-nowrap">{label}</span>
            </div>
          ))}
        </div>
        <div className="h-2 bg-gray-700 rounded-full relative min-w-[700px]">
          <div className="absolute left-0 top-0 h-full w-1/3 bg-blue-500 rounded-full"></div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-8">
        {[
          { label: "GROSS REVENUE", value: "$18,500.00", change: "+12% from previous cycle" },
          { label: "ELIGIBLE REVENUE", value: "$15,200.00", change: "Based on approved submissions" },
          { label: "40% TEAM POOL", value: "$6,080.00", change: "Allocated for member distribution" },
          { label: "TOTAL POINTS", value: "27,400 PTS", change: "Distributed across 142 tasks" }
        ].map((kpi, idx) => (
          <motion.div 
            key={idx}
            whileHover={{ y: -4 }}
            className="bg-[#1a2338] rounded-3xl p-5 sm:p-6"
          >
            <div className="flex justify-between items-start">
              <div className="text-gray-400 text-xs sm:text-sm">{kpi.label}</div>
              <TrendingUp className="text-emerald-400 w-5 h-5 flex-shrink-0" />
            </div>
            <div className="text-2xl sm:text-4xl font-bold mt-4 break-words">{kpi.value}</div>
            <div className="text-xs text-gray-500 mt-2 leading-tight">{kpi.change}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mt-8">
        {/* Pool Activity Summary */}
        <div className="xl:col-span-7 bg-[#1a2338] rounded-3xl p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              <span className="font-semibold text-lg">Pool Activity Summary</span>
            </div>
            <div className="bg-[#0f172a] text-xs px-4 py-1.5 rounded-full whitespace-nowrap">Mar 1 - Mar 26</div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
            {[
              { label: "TOTAL TASKS", value: "142", color: "bg-gray-700" },
              { label: "APPROVED", value: "128", color: "bg-emerald-500/20 text-emerald-400" },
              { label: "REJECTED", value: "14", color: "bg-rose-500/20 text-rose-400" },
              { label: "MEMBERS", value: "18", color: "bg-blue-500/20 text-blue-400" }
            ].map((stat, i) => (
              <div key={i} className={`${stat.color} rounded-2xl p-5`}>
                <div className="text-xs sm:text-sm opacity-75">{stat.label}</div>
                <div className="text-3xl sm:text-4xl font-bold mt-2">{stat.value}</div>
              </div>
            ))}
          </div>

          {/* Weekly Points Distribution */}
          <div>
            <div className="font-medium mb-4">Weekly Points Distribution</div>
            <div className="flex items-end gap-3 sm:gap-4 h-64">
              {[4800, 7200, 6800, 8500].map((height, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${(height / 9000) * 100}%` }}
                    className="w-full bg-blue-500 rounded-t-xl"
                  />
                  <div className="text-[10px] sm:text-xs text-gray-400">Week {i+1}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="xl:col-span-5 space-y-6">
          {/* Recent Activity */}
          <div className="bg-[#1a2338] rounded-3xl p-6">
            <div className="font-semibold mb-4">Pending Admin Review</div>
            <div className="space-y-5 text-sm">
              {[
                "Points Calculation Finalized by System",
                "Calculation Started by Jane Doe",
                "Cycle Closed by System",
                "Pool Created by System"
              ].map((text, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-2 h-2 mt-2 bg-blue-400 rounded-full flex-shrink-0" />
                  <div>
                    <div>{text}</div>
                    <div className="text-xs text-gray-500">MAR 26, 2026 • 09:40 AM</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Contributors */}
          <div className="bg-[#1a2338] rounded-3xl p-6">
            <div className="font-semibold mb-4 flex justify-between items-center">
              Top Contributors
              <span className="text-xs text-blue-400 cursor-pointer hover:underline">View Full Ranking →</span>
            </div>
            
            {[
              { name: "Alex Johnson", points: "6,480", pct: "24%" },
              { name: "Sarah Miller", points: "5,670", pct: "21%" },
              { name: "Michael Chen", points: "4,860", pct: "18%" },
            ].map((c, i) => (
              <div key={i} className="flex items-center justify-between py-4 border-b border-gray-800 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-xs font-bold">
                    {i+1}
                  </div>
                  <div className="text-sm sm:text-base">{c.name}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-sm">{c.points} pts</div>
                  <div className="text-xs text-blue-400">{c.pct}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contribution Distribution */}
      <div className="mt-8 bg-[#1a2338] rounded-3xl p-6 sm:p-8">
        <div className="font-semibold mb-6">Contribution Distribution</div>
        <div className="h-72 sm:h-80 flex items-end gap-6 sm:gap-12">
          {["Sarah Miller", "Elena Rodriguez", "David Smith"].map((name, i) => (
            <div key={i} className="flex-1 flex flex-col justify-end h-full">
              <div className={`bg-blue-500 rounded-t-2xl w-full transition-all ${i === 0 ? 'h-[92%]' : i === 1 ? 'h-[68%]' : 'h-[45%]'}`} />
              <div className="text-center mt-4 text-xs sm:text-sm font-medium">{name}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Admin Actions */}
      <div className="mt-8 bg-gradient-to-r from-blue-900/30 to-cyan-900/30 border border-blue-500/30 rounded-3xl p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <div className="text-lg font-medium">Awaiting Administrative Confirmation</div>
            <div className="text-sm text-gray-400 mt-3 leading-relaxed">
              The computation phase is 100% complete with a total of 27,400 points verified. Please review the contribution distribution and lock the pool to finalize payout generation for all 18 eligible members.
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <button className="bg-gradient-to-r from-blue-500 to-cyan-400 px-8 py-4 rounded-2xl font-medium flex items-center justify-center gap-3 hover:brightness-110 transition w-full sm:w-auto">
                <Lock className="w-5 h-5" />
                Lock Pool &amp; Generate Payouts
              </button>
              <button className="border border-gray-600 hover:bg-white/5 px-8 py-4 rounded-2xl transition w-full sm:w-auto">
                Hold — Needs Further Review
              </button>
            </div>
          </div>
          
          <div className="w-full lg:w-80 bg-[#0f172a] rounded-2xl p-6 text-sm shrink-0">
            <div className="font-medium mb-2">Admin State Note</div>
            <div className="text-gray-400 leading-relaxed">
              "Initial audits for Week 2 points variance were completed. The current pool figures reflect the manual adjustments made to the Client Onboarding task category."
            </div>
            <div className="text-xs text-gray-500 mt-6">SARAH J. — 3 HOURS AGO</div>
          </div>
        </div>
      </div>
    </div>
  );
}