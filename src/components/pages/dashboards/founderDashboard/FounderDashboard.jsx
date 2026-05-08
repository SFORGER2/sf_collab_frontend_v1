import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import DashboardChangeSection from "../dashboardChangeSection";
import OverviewWebsite from "../dashboard/OverviewWebsite";
import AnnouncementsSection from "../dashboard/AnnouncementsSection";
import { dashboardAPI } from "@/utils/APIs/dashboardAPI";
import Calendar from "@/components/sections/Calendar";
import WorldClock from "@/components/sections/WorldClock";
import { FounderStats } from "./Stats";
import { StartupSection } from "./Sections";

export default function FounderDashboard({
  userRoles,
  activeRole,
  setActiveRole,
  setUserRoles
}) {
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [startups, setStartups] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await dashboardAPI.getFounderDashboard();
        setStartups(response.data.startups || []);
      } catch (err) {
        console.error("❌ Failed to load founder dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const totals = useMemo(() => {
    return startups.reduce(
      (acc, s) => {
        acc.members += s.stats.members;
        acc.tasks += s.stats.tasks;
        acc.pending += s.stats.pendingJoinRequests;
        acc.revenue += s.stats.revenue || 0;
        return acc;
      },
      { members: 0, tasks: 0, pending: 0, revenue: 0 }
    );
  }, [startups]);

  const sections = useMemo(() => [
    { id: "stats", component: <FounderStats totals={totals} user={user} startups={startups} /> },
    { id: "startups", component: <StartupSection startups={startups} /> },
    { id: "calendar", component: <Calendar /> },
    { id: "worldclock", component: <WorldClock /> },
  ], [startups, totals, user]);

  if (loading) {
    return <div className="p-8 text-white/60">Loading founder dashboard…</div>;
  }

  return (
    <div
      
      className="space-y-6 px-4 py-6">
      <OverviewWebsite />
      <DashboardChangeSection
        sections={userRoles.map((r) => ({
          id: r,
          label: r.charAt(0).toUpperCase() + r.slice(1),
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
      <div
        className=".dashboard" />
      {sections.map((section) => (
        <div key={section.id}>
          {section.component}
        </div>
      ))}

      <div className="text-sm text-white/50 italic">
        More features coming soon to enhance your founder experience!
      </div>
    </div>
  );
}
