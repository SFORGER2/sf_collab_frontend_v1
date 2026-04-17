"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Clock,
  AlertTriangle,
  FileText,
  Users,
  ArrowRight,
  Zap,
  Bell,
  CheckCircle,
} from "lucide-react";
import BackgroundImage from "../../../assets/imgs/background-image.jpg";
export default function ERPDashboard() {
  const [role, setRole] = useState("builder");

  useEffect(() => {
    // Checks the Local storage for the roles, then sets as default builder as an activeRole3
    const storedRole = localStorage.getItem("activeRole");
    if (storedRole) {
      setRole(storedRole);
    } else {
      localStorage.setItem("activeRole", "builder");
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white py-8 px-4 md:px-8 overflow-auto font-sans">
      <div className=" mx-auto">
        <div className="mb-10">
          <h1 className="text-4xl font-semibold tracking-tight bg-gradient-to-br from-white to-gray-500 bg-clip-text text-transparent">
            ERP Dashboard
          </h1>
          <p className="text-zinc-400 mt-1">
            {role === "founder"
              ? "Strategic overview of your organization"
              : "Your daily builder workspace"}
          </p>
        </div>

        <div
          className={`grid grid-cols-1 md:grid-cols-2 ${
            role === "builder" ? "lg:grid-cols-3" : "lg:grid-cols-4"
          } gap-6 mb-8`}
        >
          {/* Attendance Today Card*/}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative bg-[#121215] border border-zinc-800/80 backdrop-blur-xl rounded-3xl p-7 hover:border-gray-600 transition-all group overflow-hidden"
            style={{
              backgroundImage: `url('${BackgroundImage}')`,
              backgroundSize: "cover",
              backgroundPosition: "bottom right",
              backgroundRepeat: "no-repeat",
            }}
          >
            <div className="absolute inset-0 bg-black/75" />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-200 rounded-2xl">
                    <Clock className="w-6 h-6 text-gray-800" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-zinc-300">
                      Attendance
                    </p>
                    <p className="text-sm font-medium text-white">Today</p>
                  </div>
                </div>
              </div>

              <div className="text-6xl font-semibold tracking-tighter mb-1 bg-gradient-to-br from-white to-gray-900 bg-clip-text text-transparent">
                46<span className="text-3xl text-zinc-500">/50</span>
              </div>
              <p className="text-zinc-300">4 on leave • 46 present</p>
            </div>
          </motion.div>

          {/* Overdue Tasks Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative bg-[#121215] border border-zinc-800/80 backdrop-blur-xl rounded-3xl p-7 hover:border-gray-600 transition-all group overflow-hidden"
            style={{
              backgroundImage: `url('${BackgroundImage}')`,
              backgroundSize: "cover",
              backgroundPosition: "bottom right",
              backgroundRepeat: "no-repeat",
            }}
          >
            <div className="absolute inset-0 bg-black/80" />

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gray-200 rounded-2xl">
                  <AlertTriangle className="w-6 h-6 text-gray-900" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-zinc-300">
                    Tasks
                  </p>
                  <p className="text-sm font-medium text-white">Overdue</p>
                </div>
              </div>

              <div className="text-6xl font-semibold tracking-tighter bg-gradient-to-br from-white to-gray-900 bg-clip-text text-transparent mb-1">
                3
              </div>
              <p className="text-zinc-300">Require immediate attention</p>
            </div>
          </motion.div>

          {/* Pending Updates */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative bg-[#121215] border border-zinc-800/80 backdrop-blur-xl rounded-3xl p-7 hover:border-gray-600 transition-all group overflow-hidden"
            style={{
              backgroundImage: `url('${BackgroundImage}')`,
              backgroundSize: "cover",
              backgroundPosition: "bottom right",
              backgroundRepeat: "no-repeat",
            }}
          >
            <div className="absolute inset-0 bg-black/75" />

            <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-200 rounded-2xl">
                    <FileText className="w-6 h-6 text-gray-900" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-zinc-300">
                      Updates
                    </p>
                    <p className="text-sm font-medium text-white">Pending</p>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-5 py-2 text-white text-black text-sm font-semibold rounded-2xl flex items-center gap-2 transition-colors bg-gradient-to-r from-gray-400 to-gray-900 hover:cursor-pointer"
                >
                  Submit
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>

              <div className="text-6xl font-semibold tracking-tighter bg-gradient-to-br from-white to-gray-900 bg-clip-text text-transparent mb-1">
                8
              </div>
              <p className="text-gray-300">Daily updates due this week</p>
            </div>
          </motion.div>

          {/* Active Users ( If the authenticated user is not a founder do not show card)  */}
          {role === "founder" && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="relative bg-[#121215] border border-zinc-800/80 backdrop-blur-xl rounded-3xl p-7 hover:border-gray-600 transition-all group overflow-hidden"
              style={{
                backgroundImage: `url('${BackgroundImage}')`,
                backgroundSize: "cover",
                backgroundPosition: "bottom right",
                backgroundRepeat: "no-repeat",
              }}
            >
              <div className="absolute inset-0 bg-black/75" />

              <div className="relative z-10">
                <div className="flex justify-between items-start mb-8">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-200 rounded-2xl">
                      <Users className="w-6 h-6 text-gray-900" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest text-zinc-300">
                        Live
                      </p>
                      <p className="text-sm font-medium">Active Users</p>
                    </div>
                  </div>

                  <div className="flex -space-x-3">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="w-9 h-9 bg-gradient-to-br from-zinc-700 to-zinc-600 border-2 border-[#121215] rounded-2xl flex items-center justify-center text-xs"
                      >
                        {i}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-6xl font-semibold tracking-tighter bg-gradient-to-br from-white to-gray-900 bg-clip-text text-transparent mb-1">
                  12
                </div>
                <p className="text-zinc-300">currently working</p>
              </div>
            </motion.div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Tasks Overview */}
          <div className="lg:col-span-7 bg-[#121215] border border-zinc-800/80 backdrop-blur-xl rounded-3xl p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent">
                Tasks Overview
              </h2>
              <button className="text-sm text-blue-500 hover:text-blue-300 flex items-center gap-1 transition-colors hover:cursor-pointer">
                View Tasks <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-zinc-900/70 border border-zinc-700 rounded-3xl p-6 flex items-center justify-between hover:border-violet-500/30 transition-colors">
                <div>
                  <p className="font-medium">Finalize investor pitch deck v2</p>
                  <p className="text-xs text-zinc-500 mt-1">
                    Assigned to Sarah • Due in 2 days
                  </p>
                </div>
                <div className="px-5 py-1 text-xs font-semibold bg-yellow-400 text-black rounded-3xl">
                  IN PROGRESS
                </div>
              </div>

              <div className="bg-zinc-900/70 border border-zinc-700 rounded-3xl p-6 flex items-center justify-between hover:border-violet-500/30 transition-colors">
                <div>
                  <p className="font-medium">Deploy new CI/CD pipeline</p>
                  <p className="text-xs text-zinc-500 mt-1">
                    Assigned to Alex • Due tomorrow
                  </p>
                </div>
                <div className="px-5 py-1 text-xs font-semibold bg-red-400 text-black rounded-3xl">
                  BLOCKED
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6">
            {/* Alerts */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-[#121215] border border-zinc-800/80 backdrop-blur-xl rounded-3xl p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <Bell className="w-6 h-6 text-red-400" />
                <h2 className="text-2xl font-semibold">Alerts</h2>
              </div>

              <div className="space-y-6 text-sm">
                <div className="flex gap-4">
                  <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p>3 builders have not submitted daily updates</p>
                    <p className="text-xs text-zinc-500 mt-1">
                      Sarah, Mike, Priya • 4h ago
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p>Project budget for Q2 exceeded by 8%</p>
                    <p className="text-xs text-zinc-500 mt-1">
                      Finance flag • just now
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Daily Update Reminder  */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-br from-violet-950 via-purple-950 to-black rounded-3xl p-8 overflow-hidden min-h-[280px] flex flex-col justify-between border border-violet-500/20 relative"
            >
              <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:24px_24px]" />
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex justify-between items-start">
                  <h2 className="text-3xl font-semibold tracking-tight text-white">
                    Daily Update Reminder
                  </h2>
                  <div className="text-xs bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-3xl border border-white/10 text-white">
                    14:32
                  </div>
                </div>

                <p className="mt-6 text-lg text-zinc-200 max-w-[290px] leading-relaxed mb-6">
                  Consistent logging accelerates delivery. What did your team
                  build today?
                </p>

                <div className="mt-auto">
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    className="w-full bg-white text-purple-950 font-semibold py-4 rounded-3xl flex items-center justify-center gap-2 shadow-2xl hover:bg-white/95 transition-colors"
                  >
                    Log Today’s Progress
                    <Zap className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
