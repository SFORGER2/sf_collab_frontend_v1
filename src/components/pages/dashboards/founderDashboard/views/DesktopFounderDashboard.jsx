import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { dashboardAPI } from "@/utils/APIs/dashboardAPI";
import Calendar from "@/components/sections/Calendar";
import WorldClock from "@/components/sections/WorldClock";
import AnnouncementsSection from "../../dashboard/AnnouncementsSection";
import DashboardChangeSection from "../../dashboardChangeSection";
import { AdSlot, DashboardGrid, DashboardMasthead, ProgressRail } from "@/components/cosmos";
import { commonWidgets } from "@/components/cosmos/dashboard/commonWidgets";
import { FounderStats, FounderQuickActions } from "../Stats";
import { StartupSection } from "../Sections";

export default function DesktopFounderDashboard({
  userRoles,
  activeRole,
  setActiveRole,
  setUserRoles,
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
        console.error("Failed to load founder dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const totals = useMemo(
    () =>
      startups.reduce(
        (acc, s) => {
          acc.members += s.stats.members;
          acc.tasks += s.stats.tasks;
          acc.pending += s.stats.pendingJoinRequests;
          acc.revenue += s.stats.revenue || 0;
          return acc;
        },
        { members: 0, tasks: 0, pending: 0, revenue: 0 }
      ),
    [startups]
  );

  // Rough completeness signal so the board has a sense of forward motion.
  const momentum = useMemo(() => {
    if (!startups.length) return 0;
    const done = startups.reduce((n, s) => n + (s.stats.tasks ? 1 : 0), 0);
    return Math.min(100, Math.round((done / startups.length) * 100));
  }, [startups]);

  const widgets = useMemo(
    () => [
      {
        id: "roles",
        title: "Your profile",
        eyebrow: "Switch role",
        span: "full",
        locked: true,
        node: (
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
        ),
      },
      {
        id: "stats",
        title: "At a glance",
        eyebrow: "Your numbers",
        span: "full",
        node: <FounderStats totals={totals} startups={startups} />,
      },
      {
        id: "actions",
        title: "Jump back in",
        eyebrow: "Quick actions",
        span: "half",
        node: <FounderQuickActions />,
      },
      {
        id: "momentum",
        title: "Momentum",
        eyebrow: "Progress",
        span: "half",
        node: (
          <div className="flex flex-col gap-4">
            <ProgressRail label="Startups with active work" value={momentum} />
            <ProgressRail
              label="Requests awaiting you"
              value={totals.pending ? 100 : 0}
              showValue={false}
            />
            <p className="text-[0.88rem] text-dim">
              {totals.pending
                ? `${totals.pending} join request${totals.pending === 1 ? "" : "s"} need a decision.`
                : "Nothing waiting on you right now."}
            </p>
          </div>
        ),
      },
      {
        id: "startups",
        title: "Your startups",
        eyebrow: "Portfolio",
        span: "full",
        node: <StartupSection startups={startups} />,
      },
      {
        id: "announcements",
        title: "Announcements / Newsletter",
        eyebrow: "From SF",
        span: "full",
        node: <AnnouncementsSection userRoles={userRoles} />,
      },
      { id: "calendar", title: "Calendar", eyebrow: "Schedule", span: "half", node: <Calendar /> },
      { id: "worldclock", title: "World clock", eyebrow: "Your team", span: "half", node: <WorldClock /> },
      ...commonWidgets(),
    ],
    [startups, totals, momentum, userRoles, activeRole, setActiveRole, setUserRoles]
  );

  return (
    <div className="w-full px-4 sm:px-6 py-6 max-w-[1400px] mx-auto">
      <DashboardMasthead
        role="founder"
        name={user?.firstName}
        primaryAction={{ label: "Create a Vision", to: "/ideation" }}
      >
        Turn one idea into an operating startup.
      </DashboardMasthead>

      <AdSlot placement="dashboard-top" format="banner" className="mb-5" />

      <DashboardGrid
        layoutKey="founder"
        role="founder"
        widgets={widgets}
        header={null}
      />

      {loading && (
        <p className="mt-6 font-mono text-[11px] tracking-[0.18em] uppercase text-dim">
          Loading your startups…
        </p>
      )}
    </div>
  );
}
