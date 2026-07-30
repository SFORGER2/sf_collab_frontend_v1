import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Calendar as CalendarIcon,
  RefreshCw,
} from "lucide-react";

// ── Helpers ────────────────────────────────────────────────────────────────
const fmt = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const fmtDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const STATUS_CONFIG = {
  present: {
    label: "Present",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    icon: CheckCircle2,
  },
  late: {
    label: "Late",
    color: "text-amber-400",
    bg: "bg-amber-400/10",
    border: "border-amber-400/20",
    icon: AlertCircle,
  },
  absent: {
    label: "Absent",
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    icon: XCircle,
  },
  not_clocked_in: {
    label: "Not Clocked In",
    color: "text-zinc-500",
    bg: "bg-zinc-500/10",
    border: "border-zinc-500/20",
    icon: Clock,
  },
};

// ── Banner ──────────────────────────────────────────────────────────────────
const Banner = ({ type, children }) => {
  const styles = {
    success: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    error: "bg-red-500/10 border-red-500/20 text-red-400",
    info: "bg-blue-500/10 border-blue-500/20 text-blue-400",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`p-4 rounded-xl border text-sm mb-4 ${styles[type] || styles.info}`}
    >
      {children}
    </motion.div>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────
const MobileAttendance = ({
  today,
  history,
  clockIn,
  clockOut,
  actionLoading,
  notice,
  error,
}) => {
  const att = today?.attendance || {};
  const config = STATUS_CONFIG[att.status] || STATUS_CONFIG.not_clocked_in;
  const Icon = config.icon;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-4 pb-24">
      <div className="max-w-md mx-auto">
        <header className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent">
            Attendance
          </h1>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">
            {new Date().toDateString()}
          </p>
        </header>

        <AnimatePresence mode="wait">
          {notice && <Banner type="success" key="notice">{notice}</Banner>}
          {error && <Banner type="error" key="error">{error}</Banner>}
          {today?.is_holiday && (
            <Banner type="info" key="holiday">
              🎉 Today is a holiday: <strong>{today.holiday?.name}</strong>
            </Banner>
          )}
        </AnimatePresence>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-[#121215] border border-zinc-800/80 rounded-2xl p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">
              Status
            </p>
            <div className={`flex items-center gap-2 ${config.color}`}>
              <Icon size={18} />
              <span className="text-lg font-bold">{config.label}</span>
            </div>
          </div>
          <div className="bg-[#121215] border border-zinc-800/80 rounded-2xl p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">
              Worked
            </p>
            <p className="text-lg font-bold text-indigo-400">
              {att.duration_hours ? `${att.duration_hours}h` : "0.0h"}
            </p>
          </div>
        </div>

        {/* Action Area */}
        <div className="bg-[#121215] border border-zinc-800/80 rounded-2xl p-5 mb-6">
          <div className="flex gap-3">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={clockIn}
              disabled={!today?.can_clock_in || actionLoading}
              className={`flex-1 flex flex-col items-center justify-center gap-2 py-6 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all ${
                !today?.can_clock_in || actionLoading
                  ? "bg-zinc-800 text-zinc-600 opacity-50"
                  : "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20"
              }`}
            >
              <Clock size={24} />
              Clock In
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={clockOut}
              disabled={!today?.can_clock_out || actionLoading}
              className={`flex-1 flex flex-col items-center justify-center gap-2 py-6 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all ${
                !today?.can_clock_out || actionLoading
                  ? "bg-zinc-800 text-zinc-600 opacity-50"
                  : "bg-red-500 text-white shadow-lg shadow-red-500/20"
              }`}
            >
              <RefreshCw size={24} className={actionLoading ? "animate-spin" : ""} />
              Clock Out
            </motion.button>
          </div>
          {att.clock_in_time && (
            <p className="text-[10px] text-zinc-500 text-center mt-4 font-bold tracking-tight">
              Session started at{" "}
              <span className="text-zinc-300">{fmt(att.clock_in_time)}</span>
            </p>
          )}
        </div>

        {/* History List */}
        <section>
          <div className="flex items-center justify-between mb-4 px-2">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
              Recent Activity
            </h3>
            <CalendarIcon size={14} className="text-zinc-600" />
          </div>
          <div className="flex flex-col gap-3">
            {history.length === 0 ? (
              <div className="text-center text-zinc-500 text-sm py-8">
                No attendance records yet.
              </div>
            ) : (
              history.map((record) => {
                const hConfig = STATUS_CONFIG[record.status] || STATUS_CONFIG.not_clocked_in;
                const HIcon = hConfig.icon;
                return (
                  <motion.div
                    key={record.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#121215] border border-zinc-800/80 p-4 rounded-2xl flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-bold text-white mb-1">
                        {fmtDate(record.date)}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-zinc-500 font-mono">
                          {fmt(record.clock_in_time)}
                        </span>
                        <span className="text-zinc-700 text-[10px]">→</span>
                        <span className="text-[10px] text-zinc-500 font-mono">
                          {fmt(record.clock_out_time)}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <div
                        className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${hConfig.bg} ${hConfig.color}`}
                      >
                        <HIcon size={10} />
                        {hConfig.label}
                      </div>
                      <p className="text-[10px] font-bold text-indigo-400">
                        {record.duration_hours ? `${record.duration_hours}h` : "—"}
                      </p>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default MobileAttendance;