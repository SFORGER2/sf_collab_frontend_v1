import React from "react";
import {
  Briefcase,
  AlertTriangle,
  Target,
  TrendingUp,
  DollarSign,
  CalendarCheck,
  Activity,
  CheckCircle2,
  ListTodo,
} from "lucide-react";

export const MemberDashboard = () => {
  // Mock data for the Contribution Trend chart
  const weeklyTrend = [45, 60, 30, 85, 70, 95, 80];

  // Mock data for My Tasks
  const myTasks = [
    {
      id: 1,
      title: "Design API architecture",
      status: "In Progress",
      color: "text-cyan-400",
    },
    {
      id: 2,
      title: "Fix auth token bug",
      status: "High Priority",
      color: "text-orange-400",
    },
    {
      id: 3,
      title: "Write Q3 release notes",
      status: "Pending review",
      color: "text-purple-400",
    },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto bg-[#0a0b10] p-6 md:p-8 font-sans text-slate-300 min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8 border-b border-slate-800 pb-6">
        <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
          <Briefcase className="w-6 h-6 text-purple-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">
            Member Dashboard
          </h1>
          <p className="text-sm text-slate-500">
            Your personal performance, tasks, and payouts.
          </p>
        </div>
      </div>

      {/* TOP ROW: Core Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        {/* 1. Execution Score */}
        <StatCard
          title="Execution Score"
          value="94%"
          icon={<Target className="text-cyan-400" />}
          valueColor="text-cyan-400"
        />

        {/* 2. Approved Points */}
        <StatCard
          title="Approved Points"
          value="1,250"
          icon={<CheckCircle2 className="text-purple-400" />}
          valueColor="text-purple-400"
        />

        {/* 3. Payout Estimate */}
        <StatCard
          title="Payout Estimate"
          value="$3,450"
          icon={<DollarSign className="text-emerald-400" />}
          valueColor="text-emerald-400"
        />

        {/* 4. Attendance Consistency */}
        <StatCard
          title="Attendance"
          value="98%"
          icon={<CalendarCheck className="text-blue-400" />}
        />

        {/* 5. My Warnings */}
        <StatCard
          title="Active Warnings"
          value="0"
          icon={<AlertTriangle className="text-emerald-400" />}
          valueColor="text-slate-200"
        />
      </div>

      {/* BOTTOM ROW: Trends & Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 6. Contribution Trend (Bar Chart) */}
        <div className="lg:col-span-2 bg-[#0d0f17] border border-slate-800 rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-200 mb-6 flex items-center gap-2">
            <Activity className="w-4 h-4 text-orange-400" /> Contribution Trend
            (Last 7 Days)
          </h3>

          <div className="h-48 flex items-end justify-between gap-2 pt-4">
            {weeklyTrend.map((value, index) => (
              <div
                key={index}
                className="w-full flex flex-col items-center gap-2 group"
              >
                <div
                  className="w-full bg-orange-500/20 hover:bg-orange-500/40 border border-orange-500/30 rounded-t-sm transition-all relative"
                  style={{ height: `${value}%` }}
                >
                  {/* Tooltip on hover */}
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    {value} pts
                  </span>
                </div>
                <span className="text-[10px] text-slate-500">
                  Day {index + 1}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 7. My Tasks */}
        <div className="lg:col-span-1 bg-[#0d0f17] border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <ListTodo className="w-4 h-4 text-cyan-400" /> My Tasks
            </h3>
            <span className="text-xs font-bold bg-slate-800 px-2 py-1 rounded text-slate-400">
              3 Active
            </span>
          </div>

          <div className="space-y-3 flex-1">
            {myTasks.map((task) => (
              <div
                key={task.id}
                className="p-3 bg-[#11131a] border border-slate-800/80 rounded-xl hover:border-slate-700 transition-colors"
              >
                <p className="text-sm font-medium text-slate-200 mb-1">
                  {task.title}
                </p>
                <p className={`text-xs font-semibold ${task.color}`}>
                  {task.status}
                </p>
              </div>
            ))}
          </div>

          <button className="w-full mt-4 py-2.5 bg-slate-800/50 hover:bg-slate-800 text-slate-300 text-xs font-bold rounded-lg border border-slate-700 transition-colors">
            View All Tasks
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Reusable Small Helper Component for the Top Cards ---
const StatCard = ({ title, value, icon, valueColor = "text-slate-200" }) => (
  <div className="p-4 rounded-xl bg-[#0d0f17] border border-slate-800 flex flex-col justify-center gap-3 hover:border-slate-700 transition-colors shadow-sm">
    <div className="flex items-center justify-between">
      <div className="p-2 bg-[#11131a] rounded-lg border border-slate-800">
        {React.cloneElement(icon, {
          className: `w-4 h-4 ${icon.props.className}`,
        })}
      </div>
      <TrendingUp className="w-3 h-3 text-slate-600" />
    </div>
    <div>
      <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">
        {title}
      </p>
      <p className={`text-2xl font-bold ${valueColor}`}>{value}</p>
    </div>
  </div>
);
