import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle, AlertTriangle, ShieldAlert, CheckCircle2,
  Clock, X, ChevronRight, Filter,
  Flame, TrendingDown, Search, RotateCcw
} from "lucide-react";
import { toast } from "react-toastify";

import { GlassCard }     from "./components/GlassCard";
import { SectionHeader } from "./components/SectionHeader";
import { Modal }         from "./components/Modal";
import { WARNINGS_FULL, WARNING_TREND_DATA } from "./data/erpMockData";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

// ── Helpers ─────────────────────────────────────────────────────────────────

const SEVERITY_CONFIG = {
  high:   { label: "Critical", color: "text-red-400",   bg: "bg-red-500/10",   dot: "bg-red-500",   border: "border-red-500/20"  },
  medium: { label: "Medium",   color: "text-amber-400", bg: "bg-amber-500/10", dot: "bg-amber-500", border: "border-amber-500/20" },
  low:    { label: "Low",      color: "text-zinc-400",  bg: "bg-zinc-500/10",  dot: "bg-zinc-500",  border: "border-zinc-500/20"  },
};

const STATUS_CONFIG = {
  open:      { label: "Open",      color: "text-blue-400",    bg: "bg-blue-500/10"    },
  escalated: { label: "Escalated", color: "text-red-400",     bg: "bg-red-500/10"     },
  resolved:  { label: "Resolved",  color: "text-emerald-400", bg: "bg-emerald-500/10" },
};

const SeverityIcon = ({ severity, size = 16 }) => {
  if (severity === "high")   return <ShieldAlert  size={size} className="text-red-400"   />;
  if (severity === "medium") return <AlertTriangle size={size} className="text-amber-400" />;
  return                            <AlertCircle   size={size} className="text-zinc-400"  />;
};

const formatDate = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
};

// ── KPI Card ─────────────────────────────────────────────────────────────────

const KpiCard = ({ label, value, icon, colorClass }) => (
  <GlassCard className="p-5 text-center hover:border-white/20 transition-all">
    <div className="flex justify-center mb-2">{icon}</div>
    <p className="text-[9px] text-zinc-600 uppercase tracking-widest font-bold mb-1">{label}</p>
    <p className={`text-2xl font-black ${colorClass}`}>{value}</p>
  </GlassCard>
);

// ── Trend Bar Chart ───────────────────────────────────────────────────────────

const TrendChart = ({ data }) => {
  const maxTotal = Math.max(...data.map(d => d.high + d.medium + d.low), 1);
  return (
    <div className="flex items-end justify-between gap-2 h-24 mt-4">
      {data.map((d) => {
        const total = d.high + d.medium + d.low;
        const pct   = (total / maxTotal) * 100;
        return (
          <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full flex flex-col justify-end rounded-sm overflow-hidden" style={{ height: "80px" }}>
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${(d.high   / maxTotal) * 80}px` }}
                className="w-full bg-red-500/70"
              />
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${(d.medium / maxTotal) * 80}px` }}
                className="w-full bg-amber-500/70"
              />
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${(d.low    / maxTotal) * 80}px` }}
                className="w-full bg-zinc-600/70"
              />
            </div>
            <span className="text-[8px] text-zinc-600 font-bold">{d.day}</span>
          </div>
        );
      })}
    </div>
  );
};

// ── Warning Row ───────────────────────────────────────────────────────────────

const WarningRow = React.forwardRef(({ warn, onClick }, ref) => {
  const sv = SEVERITY_CONFIG[warn.severity];
  const st = STATUS_CONFIG[warn.status];
  return (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      onClick={() => onClick(warn)}
      className={`flex items-center gap-4 p-4 rounded-2xl border ${sv.border} bg-white/[0.015] hover:bg-white/[0.04] cursor-pointer transition-all group`}
    >
      {/* Severity icon */}
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${sv.bg}`}>
        <SeverityIcon severity={warn.severity} size={18} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-bold text-white truncate">{warn.title}</p>
        <p className="text-[10px] text-zinc-500 mt-0.5">
          {warn.target} &nbsp;·&nbsp; {warn.category} &nbsp;·&nbsp; {warn.days}d overdue
        </p>
      </div>

      {/* Severity badge */}
      <span className={`hidden sm:inline text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${sv.bg} ${sv.color}`}>
        {sv.label}
      </span>

      {/* Status badge */}
      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${st.bg} ${st.color}`}>
        {st.label}
      </span>

      <ChevronRight size={14} className="text-zinc-700 group-hover:text-zinc-400 transition-colors flex-shrink-0" />
    </motion.div>
  );
});

// ── Main Component ────────────────────────────────────────────────────────────

const WarningDashboard = () => {
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);

  const [warnings, setWarnings]         = useState(WARNINGS_FULL);
  const [severityFilter, setSeverity]   = useState("all");
  const [statusFilter,   setStatus]     = useState("all");
  const [searchQuery,    setSearch]      = useState("");
  const [viewMode,       setViewMode]   = useState("team"); // "team" or "mine"
  const [selected,       setSelected]   = useState(null);
  const [recentActions,  setRecentActions] = useState([
    { id: 1, user: "Sarah Chen", action: "resolved", target: "API Limit Reached", time: "2h ago" },
    { id: 2, user: "Alex Rivera", action: "escalated", target: "Inactivity Detected", time: "5h ago" },
  ]);

  // ── Derived counts ──
  const counts = useMemo(() => ({
    total:     warnings.length,
    high:      warnings.filter(w => w.severity === "high").length,
    open:      warnings.filter(w => w.status === "open").length,
    escalated: warnings.filter(w => w.status === "escalated").length,
    resolved:  warnings.filter(w => w.status === "resolved").length,
  }), [warnings]);

  // ── Filtered list ──
  const filtered = useMemo(() => {
    return warnings.filter(w => {
      const matchView   = viewMode === "team" || w.assignee === user?.name || w.assignee === "You";
      const matchSev    = severityFilter === "all" || w.severity === severityFilter;
      const matchStatus = statusFilter   === "all" || w.status   === statusFilter;
      const matchSearch = w.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          w.target.toLowerCase().includes(searchQuery.toLowerCase());
      return matchView && matchSev && matchStatus && matchSearch;
    });
  }, [warnings, severityFilter, statusFilter, searchQuery, viewMode, user]);

  // ── Actions ──
  const handleResolve = (id) => {
    const targetWarn = warnings.find(w => w.id === id);
    setWarnings(prev => prev.map(w =>
      w.id === id
        ? { ...w, status: "resolved", resolvedBy: "You", resolvedAt: new Date().toISOString() }
        : w
    ));
    setRecentActions(prev => [{
      id: Date.now(),
      user: "You",
      action: "resolved",
      target: targetWarn?.title || "Warning",
      time: "Just now"
    }, ...prev]);
    setSelected(null);
    toast.success("Warning marked as resolved.", { position: "bottom-center", theme: "dark", icon: "✅" });
  };

  const handleDismiss = (id) => {
    setWarnings(prev => prev.filter(w => w.id !== id));
    setSelected(null);
    toast.info("Warning dismissed.", { position: "bottom-center", theme: "dark" });
  };

  const resetFilters = () => {
    setSeverity("all");
    setStatus("all");
    setSearch("");
  };

  const hasActiveFilters = severityFilter !== "all" || statusFilter !== "all" || searchQuery !== "";

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 p-6 lg:p-8 font-sans selection:bg-red-500/20 overflow-x-hidden">

      {/* ── HEADER ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
              <ShieldAlert size={16} className="text-red-400" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">Warning Dashboard</h1>
          </div>
          <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-widest ml-11">
            Monitor, manage & resolve workspace alerts
          </p>
        </div>

        {/* Reset filters */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-zinc-900/50 p-1 rounded-xl border border-white/5">
            {["team", "mine"].map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${
                  viewMode === mode ? 'bg-white text-black shadow-lg' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {mode === "mine" ? "My Warnings" : "Team View"}
              </button>
            ))}
          </div>

          {hasActiveFilters && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={resetFilters}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 text-zinc-400 hover:text-white hover:border-white/20 text-[11px] font-bold uppercase tracking-widest transition-all"
            >
              <RotateCcw size={12} /> Reset
            </motion.button>
          )}
        </div>
      </div>

      {/* ── KPI CARDS ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <KpiCard label="Total Warnings" value={counts.total}     icon={<AlertCircle   size={18} className="text-zinc-400" />}   colorClass="text-white"         />
        <KpiCard label="Critical"       value={counts.high}      icon={<Flame         size={18} className="text-red-400"   />}   colorClass="text-red-400"       />
        <KpiCard label="Open"           value={counts.open}      icon={<Clock         size={18} className="text-blue-400"  />}   colorClass="text-blue-400"      />
        <KpiCard label="Escalated"      value={counts.escalated} icon={<TrendingDown  size={18} className="text-amber-400" />}   colorClass="text-amber-400"     />
        <KpiCard label="Resolved"       value={counts.resolved}  icon={<CheckCircle2  size={18} className="text-emerald-400" />} colorClass="text-emerald-400"   />
      </div>

      {/* ── MAIN GRID ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left: Filters + List */}
        <div className="lg:col-span-8 flex flex-col gap-4 h-full">

          {/* Search + Filters */}
          <GlassCard className="p-4">
            {/* Search bar */}
            <div className="relative mb-4">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
              <input
                type="text"
                placeholder="Search warnings..."
                value={searchQuery}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-zinc-950 border border-white/5 rounded-xl pl-9 pr-4 py-2.5 text-[12px] text-white placeholder-zinc-600 focus:border-red-500/40 outline-none transition-colors"
              />
            </div>

            {/* Severity filters */}
            <div className="flex items-center gap-2 mb-3">
              <Filter size={12} className="text-zinc-600 flex-shrink-0" />
              <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest mr-2">Severity</span>
              {["all", "high", "medium", "low"].map(s => (
                <button
                  key={s}
                  onClick={() => setSeverity(s)}
                  className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                    severityFilter === s
                      ? s === "high"   ? "bg-red-500/20 text-red-400 border border-red-500/30"
                      : s === "medium" ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      : s === "low"    ? "bg-zinc-600/20 text-zinc-400 border border-zinc-500/30"
                      :                  "bg-white/10 text-white border border-white/10"
                      : "text-zinc-600 hover:text-zinc-300"
                  }`}
                >
                  {s === "all" ? "All" : s === "high" ? "Critical" : s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>

            {/* Status filters */}
            <div className="flex items-center gap-2">
              <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest mr-2 ml-4">Status</span>
              {["all", "open", "escalated", "resolved"].map(s => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                    statusFilter === s
                      ? s === "open"      ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                      : s === "escalated" ? "bg-red-500/20 text-red-400 border border-red-500/30"
                      : s === "resolved"  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      :                    "bg-white/10 text-white border border-white/10"
                      : "text-zinc-600 hover:text-zinc-300"
                  }`}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </GlassCard>

          {/* Warning List */}
          <GlassCard className="p-6 flex-1 flex flex-col min-h-0 overflow-hidden">
            <SectionHeader
              title="Warning Timeline"
              subtitle={`${filtered.length} of ${warnings.length} warnings`}
            />
            <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar pb-2">
              <AnimatePresence mode="popLayout">
                {filtered.length === 0 ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-20 text-center"
                  >
                    <div className="w-12 h-12 rounded-full bg-emerald-500/5 flex items-center justify-center mb-4 border border-emerald-500/10">
                      <CheckCircle2 size={24} className="text-emerald-500/40" />
                    </div>
                    <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">No Warnings Detected</p>
                    <p className="text-[10px] text-zinc-600 mt-1 max-w-[200px]">Workspace is operating within optimal parameters.</p>
                  </motion.div>
                ) : (
                  filtered.map(warn => (
                    <WarningRow key={warn.id} warn={warn} onClick={setSelected} />
                  ))
                )}
              </AnimatePresence>
            </div>
          </GlassCard>
        </div>

        {/* Right: Trend chart + Legend */}
        <div className="lg:col-span-4 flex flex-col gap-6 h-full">

          {/* Trend Chart */}
          <GlassCard className="p-6">
            <SectionHeader title="7-Day Trend" subtitle="Warnings raised per day" />
            <TrendChart data={WARNING_TREND_DATA} />
            {/* Legend */}
            <div className="flex gap-4 mt-4 justify-center">
              {[
                { label: "Critical", color: "bg-red-500"    },
                { label: "Medium",   color: "bg-amber-500"  },
                { label: "Low",      color: "bg-zinc-600"   },
              ].map(l => (
                <div key={l.label} className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${l.color}`} />
                  <span className="text-[9px] text-zinc-500 font-bold uppercase">{l.label}</span>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Category Breakdown */}
          <GlassCard className="p-6">
            <SectionHeader title="By Category" />
            <div className="space-y-3">
              {["Milestone", "Attendance", "Finance", "Proof", "Quality", "System", "Task"].map(cat => {
                const total  = warnings.filter(w => w.category === cat).length;
                const open   = warnings.filter(w => w.category === cat && w.status !== "resolved").length;
                if (total === 0) return null;
                return (
                  <div key={cat}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] text-zinc-400 font-bold">{cat}</span>
                      <span className="text-[10px] text-zinc-600">{open} open / {total} total</span>
                    </div>
                    <div className="h-1 bg-zinc-900 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(open / total) * 100}%` }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="h-full rounded-full bg-red-500/60"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </GlassCard>

          {/* Recent Resolutions Feed */}
          <GlassCard className="p-6 flex-1">
            <SectionHeader title="Recent Activity" />
            <div className="space-y-4">
              {recentActions.map(action => (
                <div key={action.id} className="flex gap-3 items-start">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[8px] font-black ${action.action === 'resolved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                    {action.action[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-[10px] text-zinc-300 leading-tight">
                      <span className="font-bold text-white">{action.user}</span> {action.action} <span className="text-indigo-400 font-bold">{action.target}</span>
                    </p>
                    <p className="text-[8px] text-zinc-600 mt-1 uppercase tracking-widest font-bold">{action.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>

      {/* ── DETAIL MODAL ────────────────────────────────────────────────────── */}
      <Modal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title="Warning Detail"
      >
        {selected && (() => {
          const sv = SEVERITY_CONFIG[selected.severity];
          const st = STATUS_CONFIG[selected.status];
          return (
            <div className="space-y-5">
              {/* Title + Badges */}
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${sv.bg}`}>
                  <SeverityIcon severity={selected.severity} size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white leading-tight">{selected.title}</h4>
                  <div className="flex gap-2 mt-1.5">
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${sv.bg} ${sv.color}`}>{sv.label}</span>
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${st.bg} ${st.color}`}>{st.label}</span>
                    <span className="text-[9px] font-black px-2 py-0.5 rounded-full uppercase bg-zinc-800 text-zinc-400">{selected.category}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-zinc-400 leading-relaxed bg-zinc-950/50 p-4 rounded-xl border border-white/5">
                {selected.description}
              </p>

              {/* Meta info */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Target",    value: selected.target },
                  { label: "Assignee",  value: selected.assignee, isUser: true },
                  { label: "Days Overdue", value: `${selected.days}d` },
                  { label: "Raised At", value: formatDate(selected.raisedAt) },
                  ...(selected.resolvedBy ? [
                    { label: "Resolved By", value: selected.resolvedBy, isUser: true },
                    { label: "Resolved At", value: formatDate(selected.resolvedAt) },
                  ] : []),
                ].map(({ label, value, isUser }) => (
                  <div key={label} className="bg-zinc-950/50 p-3 rounded-xl border border-white/5 relative group/item">
                    <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest mb-1">{label}</p>
                    <p className="text-[11px] text-white font-bold">{value}</p>
                    {isUser && value !== "—" && (
                      <button 
                        onClick={() => navigate(`/users/${value.toLowerCase().replace(' ', '-')}`)}
                        className="absolute top-3 right-3 text-[8px] font-black text-indigo-400 uppercase opacity-0 group-hover/item:opacity-100 transition-opacity"
                      >
                        Profile
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Actions */}
              {selected.status !== "resolved" ? (
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => handleResolve(selected.id)}
                    className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-black uppercase tracking-widest transition-all"
                  >
                    <CheckCircle2 size={14} /> Resolve
                  </button>
                  <button
                    onClick={() => handleDismiss(selected.id)}
                    className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] font-black uppercase tracking-widest transition-all"
                  >
                    <X size={14} /> Dismiss
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-black uppercase tracking-widest">
                  <CheckCircle2 size={14} /> Already Resolved
                </div>
              )}
            </div>
          );
        })()}
      </Modal>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; } 
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.1); }
      `}</style>
    </div>
  );
};

export default WarningDashboard;
