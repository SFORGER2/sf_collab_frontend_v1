import React, { createContext, useContext, useState, useEffect } from "react";

const COMMON_TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Asia/Kolkata",
  "Australia/Sydney",
];

const MOCK_DATA = {
  meetings: [
    {
      id: 1,
      title: "Regional Operations Sync",
      type: "Global",
      time: "2026-05-15T10:00:00Z",
    },
    {
      id: 2,
      title: "Quarterly ERP Audit",
      type: "Internal",
      time: "2026-05-15T15:30:00Z",
    },
  ],
  deadlines: [
    {
      id: 1,
      title: "Tax Compliance Filing",
      status: "Pending",
      time: "2026-05-16T23:59:59Z",
    },
  ],
  updates: [
    {
      id: 1,
      user: "System",
      message: "Timezone auto-sync completed",
      time: "2026-05-14T09:12:00Z",
    },
    {
      id: 2,
      user: "Admin",
      message: "New compliance parameters deployed",
      time: "2026-05-14T11:45:00Z",
    },
  ],
};

// --- CORE UTILITIES ---

const detectSystemTimezone = () =>
  Intl.DateTimeFormat().resolvedOptions().timeZone;

const formatInTimezone = (date, timezone, options = {}) => {
  const d = new Date(date);
  return new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    timeZoneName: "short",
    ...options,
  }).format(d);
};

// --- STATE SYNC ---

const TimezoneContext = createContext();

export const TimezoneProvider = ({ children }) => {
  const [timezone, setTimezone] = useState(() => {
    return localStorage.getItem("erp-timezone") || detectSystemTimezone();
  });

  useEffect(() => {
    localStorage.setItem("erp-timezone", timezone);
  }, [timezone]);

  return (
    <TimezoneContext.Provider value={{ timezone, setTimezone }}>
      {children}
    </TimezoneContext.Provider>
  );
};

const useTimezone = () => {
  const context = useContext(TimezoneContext);
  if (!context)
    throw new Error("useTimezone must be used within a TimezoneProvider");
  return context;
};

// --- INTERNAL COMPONENTS ---

const StatusBadge = ({ children, variant = "pending" }) => {
  const styles = {
    approved: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    pending: "bg-amber-500/10 border-amber-500/20 text-amber-400",
  };
  return (
    <span
      className={`border text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${styles[variant]}`}
    >
      {children}
    </span>
  );
};

const TimezoneSelector = () => {
  const { timezone, setTimezone } = useTimezone();

  return (
    <div className="flex flex-col text-left">
      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1 block">
        System Locale
      </span>
      <div className="relative group">
        <select
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          className="bg-[#0F1423] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-slate-200 appearance-none min-w-[260px] focus:outline-none focus:border-blue-500 transition-colors"
        >
          {COMMON_TIMEZONES.map((tz) => (
            <option key={tz} value={tz} className="bg-[#151B2B]">
              {tz}
            </option>
          ))}
          {!COMMON_TIMEZONES.includes(timezone) && (
            <option value={timezone} className="bg-[#151B2B]">
              {timezone}
            </option>
          )}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[10px] font-bold text-slate-600">
          SELECT
        </div>
      </div>
    </div>
  );
};

/**
 * THE DASHBOARD
 */

const TimezoneConverter = () => {
  const { timezone } = useTimezone();

  return (
    <div className="space-y-8 animate-in fade-in duration-500 font-sans">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-8">
        <div className="text-left">
          <h1 className="text-lg font-semibold text-white tracking-wide mb-1 uppercase">
            Global Operations Hub
          </h1>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            Real-time Synchronization Engine
          </p>
        </div>
        <TimezoneSelector />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel: Meetings */}
        <div className="bg-[#151B2B] border border-white/5 rounded-xl p-5 shadow-sm transition-all hover:border-white/10 text-left">
          <div className="flex items-center justify-between mb-6">
            <span className="text-xs font-bold text-white uppercase tracking-widest border-l-2 border-blue-500 pl-3">
              Operational Syncs
            </span>
            <StatusBadge variant="approved">Sync Active</StatusBadge>
          </div>
          <div className="space-y-4">
            {MOCK_DATA.meetings.map((m) => (
              <div
                key={m.id}
                className="p-4 bg-[#0F1423]/50 border border-white/5 rounded-lg group hover:border-blue-500/30 transition-all"
              >
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1 block">
                  {m.type}
                </span>
                <div className="text-sm font-medium text-slate-100 mb-2">
                  {m.title}
                </div>
                <div className="text-xs font-bold text-blue-500 font-mono tracking-tight uppercase">
                  {formatInTimezone(m.time, timezone, {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Panel: Deadlines */}
        <div className="bg-[#151B2B] border border-white/5 rounded-xl p-5 shadow-sm transition-all hover:border-white/10 text-left">
          <div className="flex items-center justify-between mb-6">
            <span className="text-xs font-bold text-white uppercase tracking-widest border-l-2 border-amber-500 pl-3">
              Critical Deadlines
            </span>
          </div>
          <div className="space-y-4">
            {MOCK_DATA.deadlines.map((d) => (
              <div
                key={d.id}
                className="p-4 bg-[#0F1423]/50 border border-white/5 rounded-lg group hover:border-amber-500/30 transition-all"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    Compliance
                  </span>
                  <StatusBadge variant="pending">{d.status}</StatusBadge>
                </div>
                <div className="text-sm font-medium text-slate-100 mb-2">
                  {d.title}
                </div>
                <div className="text-xs font-bold text-amber-500 font-mono tracking-tight uppercase">
                  {formatInTimezone(d.time, timezone, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Panel: Audit Log */}
        <div className="bg-[#151B2B] border border-white/5 rounded-xl p-5 shadow-sm transition-all hover:border-white/10 text-left">
          <div className="flex items-center justify-between mb-6">
            <span className="text-xs font-bold text-white uppercase tracking-widest border-l-2 border-slate-500 pl-3">
              System Events
            </span>
          </div>
          <div className="space-y-4">
            {MOCK_DATA.updates.map((u) => (
              <div
                key={u.id}
                className="flex gap-4 p-3 hover:bg-white/5 transition-colors rounded-lg group border border-transparent hover:border-white/5"
              >
                <div className="h-1.5 w-1.5 mt-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">
                      {u.user}
                    </span>
                    <span className="text-[10px] font-medium text-slate-700">
                      •
                    </span>
                    <span className="text-[10px] font-medium text-slate-600 uppercase">
                      {formatInTimezone(u.time, timezone, {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-slate-400 leading-relaxed">
                    {u.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Global Actions */}
      <div className="flex items-center gap-4 pt-4">
        <button className="h-11 bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white text-sm font-semibold rounded-lg shadow-lg shadow-blue-500/20 border border-blue-400/20 transition-all px-8 uppercase tracking-wide">
          Sync Global Data
        </button>
        <button className="h-11 bg-transparent border border-white/10 hover:bg-white/5 text-slate-300 text-sm font-semibold rounded-lg transition-colors px-8 uppercase tracking-wide">
          Export Manifest
        </button>
      </div>
    </div>
  );
};

export default TimezoneConverter;
