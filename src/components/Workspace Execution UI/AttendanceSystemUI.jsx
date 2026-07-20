import React, { useState } from "react";
import {
  Clock,
  Play,
  Square,
  History,
  Flame,
  AlertTriangle,
} from "lucide-react";

export const AttendanceSystemUI = () => {
  const [isClockedIn, setIsClockedIn] = useState(false);

  // Mock data to fulfill the requirements
  const streak = 12;
  const isLate = true;
  const history = [
    { date: "Today", in: "09:15 AM", out: "--:--", status: "Late" },
    { date: "Yesterday", in: "08:55 AM", out: "05:05 PM", status: "On Time" },
    { date: "Monday", in: "09:00 AM", out: "05:00 PM", status: "On Time" },
  ];

  return (
    <div className="w-full max-w-md bg-[#0d0f17] border border-slate-800 rounded-2xl p-6 shadow-lg font-sans text-slate-300">
      {/* Header & Streak */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Clock className="text-purple-400" /> Attendance
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Clock in to track your hours.
          </p>
        </div>
        <div className="flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/30 px-3 py-1.5 rounded-lg">
          <Flame className="w-4 h-4 text-orange-400" />
          <span className="text-xs font-bold text-orange-400">
            {streak} Day Streak
          </span>
        </div>
      </div>

      {/* Late Status Indicator */}
      {isLate && isClockedIn && (
        <div className="mb-6 flex items-center gap-2 text-xs font-semibold text-yellow-400 bg-yellow-400/10 p-3 rounded-lg border border-yellow-400/20">
          <AlertTriangle className="w-4 h-4" />
          Punched in 15 minutes late today.
        </div>
      )}

      {/* Clock In/Out Buttons */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={() => setIsClockedIn(true)}
          disabled={isClockedIn}
          className={`flex-1 py-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
            !isClockedIn
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 hover:bg-emerald-500/30"
              : "bg-slate-800/50 text-slate-600 border border-slate-800 cursor-not-allowed"
          }`}
        >
          <Play className="w-4 h-4" /> Clock In
        </button>
        <button
          onClick={() => setIsClockedIn(false)}
          disabled={!isClockedIn}
          className={`flex-1 py-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
            isClockedIn
              ? "bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30"
              : "bg-slate-800/50 text-slate-600 border border-slate-800 cursor-not-allowed"
          }`}
        >
          <Square className="w-4 h-4" /> Clock Out
        </button>
      </div>

      {/* Attendance History */}
      <div>
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
          <History className="w-4 h-4" /> Recent History
        </h3>
        <div className="space-y-2">
          {history.map((record, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 bg-[#11131a] border border-slate-800 rounded-lg"
            >
              <span className="text-sm font-medium text-slate-300 w-24">
                {record.date}
              </span>
              <div className="flex gap-4 text-xs text-slate-500">
                <span>
                  In: <strong className="text-slate-300">{record.in}</strong>
                </span>
                <span>
                  Out: <strong className="text-slate-300">{record.out}</strong>
                </span>
              </div>
              <div
                className={`w-2 h-2 rounded-full ${record.status === "Late" ? "bg-yellow-400" : "bg-emerald-400"}`}
              ></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
