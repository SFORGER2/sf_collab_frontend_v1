import React from "react";
import { TrendingUp, Award, Clock, DollarSign } from "lucide-react";
import { motion } from "framer-motion";
import { ERPPageHeader } from "../../erp/shared/ERPPageHeader";
import { ERPStatCard } from "../../erp/shared/ERPStatCard";
import { ERPStatusBadge } from "../../erp/shared/ERPStatusBadge";

export default function EarningsDashboard() {
  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ERPPageHeader
          icon={<DollarSign size={20} />}
          title="Earnings Dashboard"
          description="View your payout history, points converted, and revenue share."
          breadcrumbs={[{ label: "ERP" }, { label: "My Earnings" }]}
        />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6 mb-8">
          <ERPStatCard title="Total Earnings" value="$1,240.00" subValue="+12% from last month" icon={<TrendingUp size={18} className="text-emerald-500" />} accentColor="#10b981" />
          <ERPStatCard title="Total Points Earned" value="3,840 pts" subValue="Across 42 approved tasks" icon={<Award size={18} className="text-indigo-500" />} accentColor="#6366f1" />
          <ERPStatCard title="Contribution %" value="14.2%" subValue="of team pool ($8,730 total)" icon={<DollarSign size={18} className="text-amber-500" />} accentColor="#f59e0b" />
          <ERPStatCard title="Pending Earning" value="$320.00" subValue="4 tasks awaiting review" icon={<Clock size={18} className="text-cyan-500" />} accentColor="#06b6d4" />
        </div>

        <div className="grid grid-cols-12 gap-6 mb-8">
          <div className="col-span-12 lg:col-span-8 bg-[#111115] border border-white/5 rounded-2xl p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-base font-bold text-white">Earnings Over Time</h3>
              <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Last 6 months</div>
            </div>
            <div className="flex items-end gap-6 h-64 border-b border-white/5 pb-2">
              {[190, 205, 230, 260, 210, 195].map((h, i) => (
                <motion.div key={i} initial={{ height: 0 }} animate={{ height: h }} transition={{ duration: 0.5, delay: i * 0.1 }} className="flex-1 bg-indigo-500/20 border border-indigo-500/30 rounded-t-xl relative overflow-hidden">
                  <div className="absolute bottom-0 left-0 right-0 bg-indigo-500" style={{ height: '3px' }} />
                </motion.div>
              ))}
            </div>
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-zinc-500 mt-4">
              {["Jan", "Feb", "Mar", "Apr", "May", "Jun"].map((m) => <div key={m}>{m}</div>)}
            </div>
          </div>

          <div className="col-span-12 lg:col-span-4 bg-[#111115] border border-white/5 rounded-2xl p-8 flex flex-col">
            <h3 className="text-base font-bold text-white mb-8">Earnings Breakdown</h3>
            <div className="mt-auto flex justify-center pb-4">
              <div className="relative w-48 h-48">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-12 drop-shadow-lg">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="16" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#6366f1" strokeWidth="16" strokeDasharray="70 160" className="transition-all duration-1000" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#3b82f6" strokeWidth="16" strokeDasharray="90 160" strokeDashoffset="-70" className="transition-all duration-1000" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#111115] border border-white/5 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Recent Approved Tasks</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-[10px] font-bold uppercase tracking-widest text-zinc-500 bg-black/20">
                <tr>
                  <th className="px-6 py-4">Task Name</th>
                  <th className="px-6 py-4 text-center">Points Earned</th>
                  <th className="px-6 py-4 text-center">Multiplier</th>
                  <th className="px-6 py-4 text-center">Final Points</th>
                  <th className="px-6 py-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[
                  ["Client Onboarding — Data Entry", "120", "x1.2", "144", "approved"],
                  ["Monthly Report Compilation", "200", "x1.0", "200", "approved"],
                  ["Bug Triage", "50", "x0.8", "40", "rejected"],
                ].map((row, i) => (
                  <motion.tr whileHover={{ backgroundColor: "rgba(255,255,255,0.02)" }} key={i} className="transition-colors">
                    <td className="px-6 py-5 font-semibold text-white">{row[0]}</td>
                    <td className="px-6 py-5 text-center font-bold text-zinc-300">{row[1]}</td>
                    <td className="px-6 py-5 text-center font-bold text-indigo-400">{row[2]}</td>
                    <td className="px-6 py-5 text-center font-black text-white">{row[3]}</td>
                    <td className="px-6 py-5 text-center">
                      <div className="flex justify-center"><ERPStatusBadge status={row[4]} /></div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
