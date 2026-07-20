import {
  PieChart,
  TrendingUp,
  AlertTriangle,
  FileText,
  BarChart3,
  Layers,
  Star,
} from "lucide-react";
import { Link } from "react-router-dom";
import DashboardChangeSection from "../dashboardChangeSection";
import OverviewWebsite from "../dashboard/OverviewWebsite";
import AnnouncementsSection from "../dashboard/AnnouncementsSection";
import Calendar from "@/components/sections/Calendar";
import WorldClock from "@/components/sections/WorldClock";

export default function InvestorDashboard({
  userRoles, activeRole, setActiveRole, setUserRoles
}) {
  return (
    <div className="dashboard relative my-6 space-y-10">
      {/* Background texture */}
      <div className="absolute inset-0 pointer-events-none
  bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.08)_1px,transparent_1px)]
  bg-[length:20px_20px]" />
      <OverviewWebsite />
      <DashboardChangeSection
        sections={userRoles.map(role => ({
          id: role,
          label: role.charAt(0).toUpperCase() + role.slice(1)
          }))}
        onSectionChange={(sectionId) => {
          setActiveRole(sectionId);
          localStorage.setItem('activeRole', sectionId);
        }}
        setUserRoles={setUserRoles}
        setActiveRole={setActiveRole}
        userRoles={userRoles}
        activeRole={activeRole}
      />
      <AnnouncementsSection userRoles={userRoles} />
      <div className="relative z-10 space-y-8">
      </div>
      <div className="relative w-full mx-auto p-4 overflow-x-hidden">

        <Calendar />
        <WorldClock />
      </div>
      <div className="text-sm text-white/50 italic">
        More features coming soon to enhance your builder experience!
      </div>
    </div>
  );
}

/* ================= SUBCOMPONENTS ================= */

function Section({ icon: Icon, title, subtitle, children }) {
  return (
    <section className="overflow-hidden rounded-2xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30 backdrop-blur-sm p-5 sm:p-6 lg:p-8 space-y-4">
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5 text-blue-300" />
        <div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <p className="text-xs text-white/60">{subtitle}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function KPI({ label, value }) {
  return (
    <div className="rounded-xl bg-blue-500/20 border border-blue-400/30 px-4 py-3 text-center">
      <p className="text-xs text-white/60">{label}</p>
      <p className="text-lg font-semibold text-white">{value}</p>
    </div>
  );
}

function PortfolioCard({ name, allocation, stage }) {
  return (
    <div className="rounded-xl bg-blue-500/10 border border-blue-400/30 p-4">
      <p className="font-semibold text-white">{name}</p>
      <p className="text-sm text-white/60">{stage}</p>
      <p className="text-blue-300 font-medium mt-2">{allocation}</p>
    </div>
  );
}

function ProgressRow({ label, value }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm text-white">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="h-2 rounded-full bg-white/10">
        <div
          className="h-2 rounded-full bg-green-400"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function StatCard({ label, value, hint }) {
  return (
    <div className="rounded-xl bg-blue-500/10 border border-blue-400/30 p-4">
      <p className="text-xs text-white/60">{label}</p>
      <p className="text-lg font-semibold text-white">{value}</p>
      {hint && <p className="text-xs text-white/40">{hint}</p>}
    </div>
  );
}

function DealCard({ name, tag }) {
  return (
    <div className="rounded-xl bg-red-500/10 border border-red-400/30 p-4 flex justify-between items-center">
      <span className="text-white">{name}</span>
      <span className="text-xs px-2 py-1 rounded-full bg-red-500/30 border border-red-400/40 text-white">
        {tag}
      </span>
    </div>
  );
}

function DocChip({ label, disabled }) {
  return (
    <span
      className={`px-3 py-1.5 rounded-full border text-xs ${disabled
          ? "bg-white/5 border-white/10 text-white/40"
          : "bg-purple-500/20 border-purple-400/40 text-white"
        }`}
    >
      {label}
    </span>
  );
}
