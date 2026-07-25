/**
 * MobileInvestorDashboard.jsx — SFCollab
 */

import React from "react";
import OverviewWebsite from "@/components/pages/dashboards/dashboard/OverviewWebsite";
import DashboardChangeSection from "@/components/pages/dashboards/dashboardChangeSection";
import AnnouncementsSection from "@/components/pages/dashboards/dashboard/AnnouncementsSection";
import Calendar from "@/components/sections/Calendar";
import WorldClock from "@/components/sections/WorldClock";
import { PieChart, TrendingUp, Star } from "lucide-react";

const MobileInvestorDashboard = ({
  userRoles,
  activeRole,
  setActiveRole,
  setUserRoles
}) => {
  return (
    <div className="space-y-6 px-4 py-6 pb-20">
      <OverviewWebsite />

      <DashboardChangeSection
        sections={userRoles.map((role) => ({
          id: role,
          label: role.charAt(0).toUpperCase() + role.slice(1),
        }))}
        onSectionChange={(sectionId) => {
          setActiveRole(sectionId);
          localStorage.setItem("activeRole", sectionId);
        }}
        setActiveRole={setActiveRole}
        setUserRoles={setUserRoles}
        userRoles={userRoles}
        activeRole={activeRole}
      />

      <AnnouncementsSection userRoles={userRoles} />

      <header className="rounded-2xl bg-gradient-to-br from-blue-900/40 to-slate-900/40 border border-blue-500/20 p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-blue-600">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-white">Investor</h1>
        </div>
        <p className="text-xs text-white/60 leading-relaxed">
          Monitor your portfolio, discover startups, and track growth.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3">
         <div className="bg-white/5 border border-white/10 p-5 rounded-2xl flex flex-col items-center gap-2 text-center">
            <PieChart className="text-blue-400" size={20} />
            <span className="text-[10px] font-black uppercase tracking-widest text-white">Portfolio</span>
         </div>
         <div className="bg-white/5 border border-white/10 p-5 rounded-2xl flex flex-col items-center gap-2 text-center">
            <Star className="text-blue-400" size={20} />
            <span className="text-[10px] font-black uppercase tracking-widest text-white">Watchlist</span>
         </div>
      </div>

      <div className="space-y-6">
        <Calendar />
        <WorldClock />
      </div>

      <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
         <p className="text-xs text-white/50 italic text-center">More investor tools coming soon! 📈</p>
      </div>
    </div>
  );
};

export default MobileInvestorDashboard;
