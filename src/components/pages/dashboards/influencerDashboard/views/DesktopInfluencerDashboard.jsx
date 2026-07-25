import {
  Megaphone,
  BarChart3,
  Link2,
  DollarSign,
  Users,
  Trophy,
  Layers,
  TrendingUp,
  Zap,
  TrendingDown,
} from "lucide-react";
import { Link } from "react-router-dom";
import DashboardChangeSection from "../../dashboardChangeSection";
import KnowledgeResources from "@/components/pages/dashboards/influencerDashboard/components/KnowledgeResources";
import DashboardTopNav from "@/components/common/DashboardTopNav";
import { useDashboardNavHide } from "@/components/common/DashboardTopNav";
import OverviewWebsite from "../../dashboard/OverviewWebsite";
import AnnouncementsSection from "../../dashboard/AnnouncementsSection";
import Calendar from "@/components/sections/Calendar";
import WorldClock from "@/components/sections/WorldClock";

export default function InfluencerDashboard({
  userRoles,
  activeRole,
  setActiveRole,
  setUserRoles
}) {
  // Sticky navigation visibility
  const isNavHidden = useDashboardNavHide();

  // Navigation links
  const dashboardLinks = [
    { label: 'Overview', href: '/dashboard', icon: Zap },
    { label: 'My Campaigns', href: '/influencer/campaigns', icon: Megaphone },
    { label: 'Performance', href: '/influencer/performance', icon: TrendingUp },
  ];

  return (
    <>

      <div
        
        className="relative space-y-6 sm:space-y-8 lg:space-y-10 px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
        {/* Background texture */}
        <div className="absolute inset-0 pointer-events-none
  bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.08)_1px,transparent_1px)]
  bg-[length:20px_20px]" />
        <OverviewWebsite />
        {/* Role selector */}
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
        <div className="relative z-10 space-y-6 sm:space-y-8 lg:space-y-10">

          {/* ================= HEADER ================= */}
          <div
            id="dashboard"
            className="flex flex-col gap-3 sm:gap-4">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-white flex items-center gap-2">
              <Layers className="w-5 sm:w-6 h-5 sm:h-6 text-pink-400 flex-shrink-0" />
              <span>Influencer Dashboard</span>
            </h2>

            <p className="text-xs sm:text-sm text-white/60 max-w-3xl leading-relaxed">
              Run campaigns, track performance, manage payouts, and grow your
              influence inside the SF ecosystem.
            </p>

          </div>



        </div>
        <div className="relative w-full mx-auto p-4 overflow-x-hidden">

          <Calendar />
          <WorldClock />
        </div>
        <div className="text-sm text-white/50 italic">
          More features coming soon to enhance your builder experience!
        </div>
      </div>
    </>
  );
}

/* ================= SUBCOMPONENTS ================= */

function Section({ icon: Icon, title, subtitle, children }) {
  return (
    <section className="rounded-lg sm:rounded-2xl bg-white/5 border border-white/10 p-4 sm:p-6 space-y-3 sm:space-y-4">
      <div className="flex items-start sm:items-center gap-2 sm:gap-3">
        <Icon className="w-4 sm:w-5 h-4 sm:h-5 text-pink-400 flex-shrink-0 mt-0.5 sm:mt-0" />
        <div className="min-w-0 flex-1">
          <h3 className="text-base sm:text-lg font-semibold text-white">{title}</h3>
          <p className="text-xs text-white/60">{subtitle}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function KPI({ label, value }) {
  return (
    <div className="rounded-lg sm:rounded-xl bg-white/5 border border-white/10 px-3 sm:px-4 py-2 sm:py-3 min-h-[56px] flex flex-col justify-center">
      <p className="text-xs text-white/60">{label}</p>
      <p className="text-base sm:text-lg font-semibold text-white mt-1">{value}</p>
    </div>
  );
}

function CampaignCard({ name, status, roi }) {
  return (
    <div className="rounded-lg sm:rounded-xl bg-white/5 border border-white/10 p-3 sm:p-4 min-h-[80px] flex flex-col justify-between">
      <div>
        <p className="font-semibold text-sm sm:text-base text-white break-words">{name}</p>
        <p className="text-xs text-white/60 mt-1 sm:mt-2">
          Status: {status}
        </p>
      </div>
      <p className="text-xs text-pink-300 mt-2 sm:mt-3">
        ROI: {roi}
      </p>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-lg sm:rounded-xl bg-white/5 border border-white/10 p-3 sm:p-4 min-h-[80px] flex flex-col justify-center">
      <p className="text-xs text-white/60">{label}</p>
      <p className="text-base sm:text-lg font-semibold text-white mt-1">{value}</p>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between items-center gap-2 pb-2 last:pb-0">
      <span className="text-white truncate">{label}</span>
      <span className="text-white/70 flex-shrink-0">{value}</span>
    </div>
  );
}
