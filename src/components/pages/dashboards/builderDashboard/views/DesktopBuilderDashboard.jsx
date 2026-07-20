import {
  Briefcase,
  CheckCircle,
  Clock,
  Layers,
  Users,
  ArrowRight,
  ChevronRight,
  Plus,
  MoreHorizontal,
  MapPin,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import DashboardChangeSection from "../../dashboardChangeSection";
import AnnouncementsSection from "../../dashboard/AnnouncementsSection";
import OverviewWebsite from "../../dashboard/OverviewWebsite";
import Calendar from "@/components/sections/Calendar";
import WorldClock from "@/components/sections/WorldClock";
import { dashboardAPI } from "@/utils/APIs/dashboardAPI";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";

export default function BuilderDashboard({
  userRoles,
  activeRole,
  setActiveRole,
  setUserRoles
}) {
  const { user } = useSelector((state) => state.auth);
  const [startups, setStartups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await dashboardAPI.getBuilderDashboard();
        console.log("Builder dashbard:", res);
        setStartups(res.data.startups || []);
      } catch (err) {
        console.error("❌ Failed to load builder dashboard", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);
  const totals = useMemo(() => {
    return startups.reduce(
      (acc, s) => {
        acc.totalTasks += s.tasks.total;
        acc.completed += s.tasks.completed;
        acc.pending += s.tasks.pending;
        return acc;
      },
      { totalTasks: 0, completed: 0, pending: 0 }
    );
  }, [startups]);
  console.log("Builder dashboard startups:", startups);
  const completionRate = totals.totalTasks > 0
    ? Math.round((totals.completed / totals.totalTasks) * 100)
    : 0;


  if (loading) {
    return <div className="p-8 text-white/60">Loading builder dashboard…</div>;
  }

  return (
    <div
      id="dashboard"
      className="space-y-6 px-4 py-6">
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



      <div className="relative w-full mx-auto p-4 overflow-x-hidden space-y-6">

        <BuilderStats totals={totals} completionRate={completionRate} user={user} startups={startups} />
        <Calendar />
        <WorldClock />
      </div>

      <div className="text-sm text-white/50 italic">
        More builder features coming soon 🚀
      </div>
    </div>
  );
}


function Section({ icon: Icon, title, subtitle, action, children }) {
  return (
    <section className="rounded-xl bg-white/[0.03] border border-white/10 p-6 space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex gap-3 items-center">
          <Icon className="w-5 h-5 text-emerald-400" />
          <div>
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <p className="text-xs text-white/50">{subtitle}</p>
          </div>
        </div>
        {action && (
          <Link
            to={action.href}
            className="text-xs text-white/50 hover:text-white flex items-center gap-1"
          >
            {action.label}
            <ChevronRight className="w-3 h-3" />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}
function BuilderStats({ totals, completionRate, user, startups }) {
  return <>
    <header className="rounded-2xl bg-gradient-to-br from-emerald-900/40 to-slate-900/40 border border-emerald-500/20 p-6">
      <div className="flex flex-col lg:flex-row justify-between gap-6 py-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-emerald-600">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">
              Builder Dashboard
            </h1>
          </div>
          <p className="text-sm text-white/60">
            Welcome back, {user?.firstName || "Builder"}
          </p>
        </div>

        <Link
          to="/builder/my-work"
          className="flex gap-3 flex-wrap">
          <QuickStat label="Completed" value={totals.completed} icon={CheckCircle} />
          <QuickStat label="In Progress" value={totals.pending} icon={Clock} />
          <QuickStat label="Completion Rate" value={`${completionRate}%`} icon={Layers} />
        </Link>
      </div>
    </header>

    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 my-4">
      <QuickAction label="Browse Startups" href="/discover-startups" icon={Briefcase} />
      <QuickAction label="Saved Startups" href="/saved-startups" icon={Users} />
      <QuickAction label="My Applications" href="/builder/my-applications" icon={CheckCircle} />
    </div>

    <Section
      icon={Briefcase}
      title="My Work"
      subtitle="Active startups & tasks"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {startups.map((s, index) => (
          <StartupWorkCard key={index} data={s} />
        ))}

        {startups.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center min-h-[180px] text-white/50">
            <Briefcase className="w-8 h-8 mb-2" />
            <p className="text-sm">You are not part of any startup yet.</p>
          </div>
        )}
      </div>
    </Section>
  </>
}
function QuickStat({ label, value, icon: Icon }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10">
      <Icon className="w-4 h-4 text-emerald-400" />
      <div>
        <p className="text-xs text-white/50">{label}</p>
        <p className="text-lg font-semibold text-white">{value}</p>
      </div>
    </div>
  );
}

function QuickAction({ label, href, icon: Icon }) {
  return (
    <Link
      to={href}
      className="rounded-xl bg-white/5 border border-white/10 p-4 hover:border-emerald-500/30 transition"
    >
      <Icon className="w-5 h-5 text-emerald-400 mb-2" />
      <p className="text-sm font-medium text-white">{label}</p>
    </Link>
  );
}

function StartupWorkCard({ data }) {
  const { startup, role, tasks } = data;
  const completionRate = tasks.total > 0
    ? Math.round((tasks.completed / tasks.total) * 100)
    : 0;

  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)" }}
      className="relative rounded-xl bg-gradient-to-br from-emerald-900/20 to-slate-900/20 border border-emerald-500/20 p-5 hover:border-emerald-500/50 transition overflow-hidden group"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-emerald-500/0 group-hover:from-emerald-500/5 group-hover:to-emerald-500/10 transition" />

      <Link to={`/startup-details/${startup.id}`} className="relative z-10 space-y-4 block">
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-white truncate">{startup.name}</h4>
            <p className="text-xs text-white/50 mt-1">{role}</p>
          </div>
          <MoreHorizontal className="w-4 h-4 text-white/40 flex-shrink-0" />
        </div>

        <div className="grid grid-cols-3 gap-3 pt-2 border-t border-white/10">
          <Stat label="Completed" value={tasks.completed} />
          <Stat label="Pending" value={tasks.pending} />
          <Stat label="Progress" value={`${completionRate}%`} />
        </div>

        {tasks.items.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-white/10">
            {tasks.items.slice(0, 2).map((task) => (
              <TaskRow key={task.id} task={task} />
            ))}
            {tasks.items.length > 2 && (
              <p className="text-xs text-white/40">
                +{tasks.items.length - 2} more tasks
              </p>
            )}
          </div>
        )}

        {tasks.items.length === 0 && (
          <p className="text-xs text-white/40 pt-2 border-t border-white/10">
            No assigned tasks
          </p>
        )}
      </Link>
    </motion.div>
  );
}

function TaskRow({ task }) {
  const isCompleted = task.status === "completed" || task.status === "completed";

  return (
    <div className="flex justify-between text-sm text-white/80">
      <span className="truncate">{task.title}</span>
      <span
        className={`text-xs flex-shrink-0 font-medium ${isCompleted
            ? "text-emerald-400"
            : "text-amber-400"
          }`}
      >
        {isCompleted ? "✓" : "•"} {task.status.replace(/_/g, " ")}
      </span>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <p className="text-white/40 text-xs">{label}</p>
      <p className="text-white font-medium text-sm">{value}</p>
    </div>
  );
}
