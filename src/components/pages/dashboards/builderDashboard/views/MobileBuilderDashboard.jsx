/**
 * MobileBuilderDashboard.jsx — SFCollab
 */

import React from "react";
import OverviewWebsite from "../../dashboard/OverviewWebsite";
import DashboardChangeSection from "../../dashboardChangeSection";
import AnnouncementsSection from "../../dashboard/AnnouncementsSection";
import Calendar from "@/components/sections/Calendar";
import WorldClock from "@/components/sections/WorldClock";
import { Link } from "react-router-dom";
import { CheckCircle, Clock, Layers, Briefcase, Users, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

const MobileBuilderDashboard = ({
  userRoles,
  activeRole,
  setActiveRole,
  setUserRoles,
  totals,
  completionRate,
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

      <header className="rounded-2xl bg-gradient-to-br from-emerald-900/40 to-slate-900/40 border border-emerald-500/20 p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-emerald-600">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-white">Builder</h1>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-white/5 p-3 rounded-xl border border-white/10">
            <p className="text-[10px] text-white/50 uppercase font-black tracking-widest">Done</p>
            <p className="text-lg font-bold text-white">{totals.completed}</p>
          </div>
          <div className="bg-white/5 p-3 rounded-xl border border-white/10">
            <p className="text-[10px] text-white/50 uppercase font-black tracking-widest">Progress</p>
            <p className="text-lg font-bold text-white">{completionRate}%</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-3">
        <QuickAction label="Browse" href="/discover-startups" icon={Briefcase} />
        <QuickAction label="Saved" href="/saved-startups" icon={Users} />
      </div>

      <section className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-white/50">My Active Work</h3>
          <Link to="/builder/my-work" className="text-[10px] font-black uppercase tracking-widest text-emerald-400">View All</Link>
        </div>
        
        <div className="flex flex-col gap-4">
          {startups.map((s, index) => (
            <StartupWorkCard key={index} data={s} />
          ))}
          {startups.length === 0 && (
            <div className="bg-white/5 border border-dashed border-white/10 rounded-2xl p-8 text-center">
              <p className="text-xs text-white/40 font-bold uppercase tracking-widest">No active startups</p>
            </div>
          )}
        </div>
      </section>

      <div className="space-y-6">
        <Calendar />
        <WorldClock />
      </div>
    </div>
  );
};

function QuickAction({ label, href, icon: Icon }) {
  return (
    <Link
      to={href}
      className="rounded-2xl bg-white/5 border border-white/10 p-5 flex flex-col items-center justify-center gap-2"
    >
      <Icon className="w-6 h-6 text-emerald-400" />
      <p className="text-[10px] font-black uppercase tracking-widest text-white">{label}</p>
    </Link>
  );
}

function StartupWorkCard({ data }) {
  const { startup, role, tasks } = data;
  const completionRate = tasks.total > 0 ? Math.round((tasks.completed / tasks.total) * 100) : 0;

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      className="rounded-2xl bg-white/5 border border-white/10 p-5"
    >
      <Link to={`/startup-details/${startup.id}`} className="space-y-4 block">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-bold text-white text-sm">{startup.name}</h4>
            <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-0.5">{role}</p>
          </div>
          <div className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
             <span className="text-[10px] font-black text-emerald-400">{completionRate}%</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
           <div className="flex items-center gap-2">
              <CheckCircle size={12} className="text-emerald-500" />
              <span className="text-[10px] font-bold text-white/60">{tasks.completed} Done</span>
           </div>
           <div className="flex items-center gap-2">
              <Clock size={12} className="text-amber-500" />
              <span className="text-[10px] font-bold text-white/60">{tasks.pending} Pending</span>
           </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default MobileBuilderDashboard;
