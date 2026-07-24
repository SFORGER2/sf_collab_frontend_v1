/**
 * MobileFounderDashboard.jsx — SFCollab
 */

import React from "react";
import OverviewWebsite from "@/components/pages/dashboards/dashboard/OverviewWebsite";
import DashboardChangeSection from "@/components/pages/dashboards/dashboardChangeSection";
import AnnouncementsSection from "@/components/pages/dashboards/dashboard/AnnouncementsSection";
import Calendar from "@/components/sections/Calendar";
import WorldClock from "@/components/sections/WorldClock";
import { Link } from "react-router-dom";
import { Users, CheckCircle2, TrendingUp, Layers, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

const MobileFounderDashboard = ({
  userRoles,
  activeRole,
  setActiveRole,
  setUserRoles,
  totals,
  user,
  startups
}) => {
  return (
    <div className="space-y-6 px-4 py-6 pb-20">
      <OverviewWebsite />

      <DashboardChangeSection
        sections={userRoles.map((role) => ({
          id: role,
          label: role.charAt(0).toUpperCase() + role.slice(1),
        }))}
        setUserRoles={setUserRoles}
        setActiveRole={setActiveRole}
        userRoles={userRoles}
        activeRole={activeRole}
        onSectionChange={(r) => {
          setActiveRole(r);
          localStorage.setItem("activeRole", r);
        }}
      />

      <AnnouncementsSection userRoles={userRoles} />

      <header className="rounded-2xl bg-gradient-to-br from-indigo-900/40 to-slate-900/40 border border-indigo-500/20 p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-indigo-600">
            <Users className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-white">Founder</h1>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-white/5 p-3 rounded-xl border border-white/10">
            <p className="text-[10px] text-white/50 uppercase font-black tracking-widest">Members</p>
            <p className="text-lg font-bold text-white">{totals.members}</p>
          </div>
          <div className="bg-white/5 p-3 rounded-xl border border-white/10">
            <p className="text-[10px] text-white/50 uppercase font-black tracking-widest">Revenue</p>
            <p className="text-lg font-bold text-white">${totals.revenue}</p>
          </div>
        </div>
      </header>

      <section className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-white/50">My Startups</h3>
        </div>
        
        <div className="flex flex-col gap-4">
          {startups.map((s, index) => (
             <motion.div
                key={index}
                whileTap={{ scale: 0.98 }}
                className="rounded-2xl bg-white/5 border border-white/10 p-5"
              >
                <Link to={`/startup-details/${s.id}`} className="space-y-4 block">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-white text-sm">{s.name}</h4>
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-400 border border-indigo-500/30`}>
                      Active
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                     <div className="text-center">
                        <p className="text-[9px] text-white/40 uppercase font-bold">Tasks</p>
                        <p className="text-xs font-bold text-white">{s.stats.tasks}</p>
                     </div>
                     <div className="text-center">
                        <p className="text-[9px] text-white/40 uppercase font-bold">Pending</p>
                        <p className="text-xs font-bold text-white">{s.stats.pendingJoinRequests}</p>
                     </div>
                     <div className="text-center">
                        <p className="text-[9px] text-white/40 uppercase font-bold">Rate</p>
                        <p className="text-xs font-bold text-emerald-400">90%</p>
                     </div>
                  </div>
                </Link>
             </motion.div>
          ))}
        </div>
      </section>

      <div className="space-y-6">
        <Calendar />
        <WorldClock />
      </div>
    </div>
  );
};

export default MobileFounderDashboard;
