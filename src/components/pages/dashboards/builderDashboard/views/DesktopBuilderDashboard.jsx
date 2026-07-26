import { Briefcase, CheckCircle, Clock, Layers, MoreHorizontal, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";

import DashboardChangeSection from "../../dashboardChangeSection";
import AnnouncementsSection from "../../dashboard/AnnouncementsSection";
import OverviewWebsite from "../../dashboard/OverviewWebsite";
import Calendar from "@/components/sections/Calendar";
import WorldClock from "@/components/sections/WorldClock";
import { dashboardAPI } from "@/utils/APIs/dashboardAPI";
import { AdSlot, DashboardGrid, DashboardMasthead, ProgressRail } from "@/components/cosmos";
import { commonWidgets } from "@/components/cosmos/dashboard/commonWidgets";
import { QuickAction, QuickStat } from "../../founderDashboard/Quicks";

export default function DesktopBuilderDashboard({
  userRoles,
  activeRole,
  setActiveRole,
  setUserRoles,
}) {
  const { user } = useSelector((state) => state.auth);
  const [startups, setStartups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await dashboardAPI.getBuilderDashboard();
        setStartups(res.data.startups || []);
      } catch (err) {
        console.error("Failed to load builder dashboard", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const totals = useMemo(
    () =>
      startups.reduce(
        (acc, s) => {
          acc.totalTasks += s.tasks.total;
          acc.completed += s.tasks.completed;
          acc.pending += s.tasks.pending;
          return acc;
        },
        { totalTasks: 0, completed: 0, pending: 0 }
      ),
    [startups]
  );

  const completionRate =
    totals.totalTasks > 0 ? Math.round((totals.completed / totals.totalTasks) * 100) : 0;

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
        ),
      },
      {
        id: "stats",
        title: "At a glance",
        eyebrow: "Your work",
        span: "full",
        node: (
          <div className="flex flex-wrap gap-3.5">
            <QuickStat label="Completed" value={totals.completed} icon={CheckCircle} to="/builder/my-work" />
            <QuickStat label="In progress" value={totals.pending} icon={Clock} to="/builder/my-work" />
            <QuickStat label="Total tasks" value={totals.totalTasks} icon={Layers} to="/erp/tasks" />
            <QuickStat label="Startups" value={startups.length} icon={Briefcase} to="/builder/my-startups" />
          </div>
        ),
      },
      {
        id: "completion",
        title: "Completion rate",
        eyebrow: "Progress",
        span: "half",
        node: (
          <div className="flex flex-col gap-4">
            <ProgressRail label="Tasks completed" value={completionRate} />
            <p className="text-[0.88rem] text-dim">
              {totals.totalTasks
                ? `${totals.completed} of ${totals.totalTasks} tasks done across ${startups.length} startup${startups.length === 1 ? "" : "s"}.`
                : "No tasks assigned yet — join a startup to start building."}
            </p>
          </div>
        ),
      },
      {
        id: "actions",
        title: "Find work",
        eyebrow: "Quick actions",
        span: "half",
        node: (
          <div className="grid grid-cols-2 gap-3.5">
            <QuickAction label="Browse startups" href="/discover-startups" icon={Briefcase} accent="#4fd8ff" />
            <QuickAction label="Saved startups" href="/saved-startups" icon={Users} accent="#4fd8ff" />
            <QuickAction label="My applications" href="/builder/my-applications" icon={CheckCircle} accent="#3ee6a0" />
            <QuickAction label="Rewards" href="/builder/rewards" icon={Layers} accent="#ffbf5e" />
          </div>
        ),
      },
      {
        id: "work",
        title: "My work",
        eyebrow: "Active startups & tasks",
        span: "full",
        node: (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {startups.map((s, index) => (
              <StartupWorkCard key={s.startup?.id ?? index} data={s} />
            ))}

            {startups.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center min-h-[180px] text-dim">
                <Briefcase className="w-8 h-8 mb-2.5" />
                <p className="text-[0.92rem]">You're not part of any startup yet.</p>
                <Link
                  to="/discover-startups"
                  className="mt-3 font-mono text-[10.5px] tracking-[0.18em] uppercase text-cyan hover:text-star transition-colors"
                >
                  Find one to join →
                </Link>
              </div>
            )}
          </div>
        ),
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
      {
        id: "platform",
        title: "Platform overview",
        eyebrow: "SFCollab",
        span: "full",
        node: <OverviewWebsite />,
      },
      ...commonWidgets(),
    ],
    [startups, totals, completionRate, userRoles, activeRole, setActiveRole, setUserRoles]
  );

  return (
    <div id="dashboard" className="w-full px-4 sm:px-6 py-6 max-w-[1400px] mx-auto">
      <DashboardMasthead
        role="builder"
        name={user?.firstName}
        primaryAction={{ label: "Find work", to: "/discover-startups" }}
      >
        Prove your ability through real work.
      </DashboardMasthead>

      <AdSlot placement="dashboard-top" format="banner" className="mb-5" />

      <DashboardGrid
        layoutKey="builder"
        role="builder"
        widgets={widgets}
        header={null}
      />

      {loading && (
        <p className="mt-6 font-mono text-[11px] tracking-[0.18em] uppercase text-dim">
          Loading your work…
        </p>
      )}
    </div>
  );
}

function StartupWorkCard({ data }) {
  const { startup, role, tasks } = data;
  const completionRate = tasks.total > 0 ? Math.round((tasks.completed / tasks.total) * 100) : 0;

  return (
    <motion.div whileHover={{ y: -3 }} className="cosmos-card cosmos-card-interactive p-5" style={{ "--cosmos-accent": "#4fd8ff" }}>
      <Link to={`/startup-details/${startup.id}`} className="block space-y-4">
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1 min-w-0">
            <h4 className="font-display text-[1rem] text-star truncate">{startup.name}</h4>
            <p className="cosmos-stat-label mt-1">{role}</p>
          </div>
          <MoreHorizontal className="w-4 h-4 text-dim shrink-0" />
        </div>

        <ProgressRail label="Progress" value={completionRate} />

        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/10">
          <Stat label="Completed" value={tasks.completed} />
          <Stat label="Pending" value={tasks.pending} />
        </div>

        {tasks.items.length > 0 ? (
          <div className="space-y-2 pt-3 border-t border-white/10">
            {tasks.items.slice(0, 2).map((task) => (
              <TaskRow key={task.id} task={task} />
            ))}
            {tasks.items.length > 2 && (
              <p className="text-xs text-dim">+{tasks.items.length - 2} more tasks</p>
            )}
          </div>
        ) : (
          <p className="text-xs text-dim pt-3 border-t border-white/10">No assigned tasks</p>
        )}
      </Link>
    </motion.div>
  );
}

function TaskRow({ task }) {
  const isCompleted = task.status === "completed";

  return (
    <div className="flex justify-between gap-3 text-sm text-star/80">
      <span className="truncate">{task.title}</span>
      <span
        className={`text-xs shrink-0 font-medium ${isCompleted ? "text-emerald-400" : "text-gold"}`}
      >
        {isCompleted ? "✓" : "•"} {task.status.replace(/_/g, " ")}
      </span>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <p className="cosmos-stat-label">{label}</p>
      <p className="text-star font-medium text-sm mt-0.5">{value}</p>
    </div>
  );
}
