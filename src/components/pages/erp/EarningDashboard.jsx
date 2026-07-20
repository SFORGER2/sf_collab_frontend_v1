import React from "react";
import { TrendingUp, Award, Clock, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

export default function EarningsDashboard() {
  return (
    <div className="min-h-screen bg-[#0a0f1c] p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <div>
            <div className="text-4xl font-bold bg-gradient-to-br from-white to-blue-400 bg-clip-text text-transparent">
              SFCollab ERP
            </div>
            <div className="text-2xl text-gray-400">Earnings Dashboard</div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              title: "TOTAL EARNINGS",
              value: "$1,240.00",
              change: "+12% from last month",
              icon: TrendingUp,
            },
            {
              title: "TOTAL POINTS EARNED",
              value: "3,840 pts",
              change: "Across 42 approved tasks",
            },
            {
              title: "CONTRIBUTION %",
              value: "14.2%",
              change: "of team pool ($8,730 total)",
            },
            {
              title: "PENDING EARNING",
              value: "$320.00",
              change: "4 tasks awaiting review",
            },
          ].map((card, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.02 }}
              className="bg-[#1a2338] rounded-3xl p-7"
            >
              <div className="flex justify-between">
                <div>
                  <div className="uppercase text-xs tracking-widest text-gray-400">
                    {card.title}
                  </div>
                  <div className="text-4xl font-bold mt-3">{card.value}</div>
                </div>
                {card.icon && <card.icon className="w-8 h-8 text-blue-400" />}
              </div>
              <div className="text-emerald-400 text-sm mt-6">{card.change}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-12 gap-6 mt-8">
          {/* Earnings Over Time */}
          <div className="col-span-12 lg:col-span-8 bg-[#1a2338] rounded-3xl p-8">
            <div className="flex items-center justify-between mb-6">
              <div>Earnings Over Time</div>
              <div className="text-xs text-gray-400">
                Monthly performance over the last 6 months
              </div>
            </div>
            <div className="flex items-end gap-6 h-80">
              {[190, 205, 230, 260, 210, 195].map((h, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 60 }}
                  animate={{ height: h }}
                  className="flex-1 bg-blue-500 rounded-t-2xl"
                />
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-3">
              {["Jan", "Feb", "Mar", "Apr", "May", "Jun"].map((m) => (
                <div key={m}>{m}</div>
              ))}
            </div>
          </div>

          {/* Earnings Breakdown */}
          <div className="col-span-12 lg:col-span-4 bg-[#1a2338] rounded-3xl p-8 flex flex-col">
            <div className="font-medium">Earnings Breakdown</div>
            <div className="mt-auto flex justify-center">
              <div className="relative w-56 h-56">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-12">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#1e2937"
                    strokeWidth="22"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#22d3ee"
                    strokeWidth="22"
                    strokeDasharray="70 160"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#67e8f9"
                    strokeWidth="22"
                    strokeDasharray="90 160"
                    strokeDashoffset="-70"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Tasks */}
        <div className="mt-8 bg-[#1a2338] rounded-3xl overflow-hidden">
            <div className="p-8 border-b border-gray-800 flex items-center justify-between">
              <div className="font-semibold">Recent Approved Tasks</div>
              <div className="text-blue-400 text-sm cursor-pointer">
                View Full Team Ranking ↓
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-sm">
                {" "}
                {/* Increased min-width */}
                <thead>
                  <tr className="border-b border-gray-800 text-left text-xs text-gray-400">
                    <th className="pl-8 py-6 whitespace-nowrap">TASK NAME</th>
                    <th className="px-6 py-6 whitespace-nowrap text-center">
                      POINTS EARNED
                    </th>
                    <th className="px-6 py-6 whitespace-nowrap text-center">
                      MULTIPLIER
                    </th>
                    <th className="px-6 py-6 whitespace-nowrap text-center">
                      FINAL POINTS
                    </th>
                    <th className="pr-8 py-6 whitespace-nowrap text-center">
                      STATUS
                    </th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-gray-800">
                  {[
                    [
                      "Client Onboarding — Data Entry",
                      "120",
                      "x1.2",
                      "144",
                      "Approved",
                    ],
                    [
                      "Monthly Report Compilation",
                      "200",
                      "x1.0",
                      "200",
                      "Approved",
                    ],
                    ["Bug Triage", "50", "x0.8", "40", "Rejected"],
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-white/5 transition-colors">
                      <td className="pl-8 py-6 font-medium max-w-[260px] break-words">
                        {row[0]}
                      </td>
                      <td className="px-6 py-6 text-center whitespace-nowrap">
                        {row[1]}
                      </td>
                      <td className="px-6 py-6 text-pink-400 text-center whitespace-nowrap">
                        {row[2]}
                      </td>
                      <td className="px-6 py-6 font-mono text-center whitespace-nowrap">
                        {row[3]}
                      </td>
                      <td className="pr-8 py-6 text-center whitespace-nowrap">
                        <span
                          className={`inline-block px-5 py-1.5 rounded-full text-xs font-medium ${
                            row[4] === "Approved"
                              ? "bg-emerald-500/20 text-emerald-400"
                              : "bg-rose-500/20 text-rose-400"
                          }`}
                        >
                          {row[4]}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
  );
}
