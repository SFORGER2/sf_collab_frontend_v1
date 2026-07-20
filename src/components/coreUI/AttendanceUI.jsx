import React, { useState } from "react";
import { Clock, Play, Square, CheckCircle, AlertCircle } from "lucide-react";

export const AttendanceUI = () => {
  // State to track the user's current status and punch times
  const [status, setStatus] = useState("Not Started"); // 'Not Started', 'Active', 'Completed'
  const [clockInTime, setClockInTime] = useState(null);
  const [clockOutTime, setClockOutTime] = useState(null);

  const handleClockIn = () => {
    setStatus("Active");
    setClockInTime(
      new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    );
  };

  const handleClockOut = () => {
    setStatus("Completed");
    setClockOutTime(
      new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    );
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-8 font-sans">
      {/* Main Widget Card */}
      <div className="w-full max-w-md bg-[#0d0f17] border border-slate-800 rounded-2xl p-6 shadow-[0_0_40px_rgba(0,0,0,0.5)] relative overflow-hidden">
        {/* Decorative Top Glow */}
        <div
          className={`absolute top-0 left-0 w-full h-1 ${
            status === "Active"
              ? "bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]"
              : status === "Completed"
                ? "bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.5)]"
                : "bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.5)]"
          }`}
        ></div>

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg bg-[#151822] border border-slate-700 flex items-center justify-center">
            <Clock className="w-5 h-5 text-slate-300" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-200">
              Daily Attendance
            </h2>
            <p className="text-xs text-slate-500">
              {new Date().toLocaleDateString(undefined, {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* Daily Status Display */}
        <div className="mb-8 p-4 rounded-xl bg-[#11131a] border border-slate-800/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-400">
              Current Status
            </span>
            {status === "Not Started" && (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-cyan-400 bg-cyan-400/10 px-2.5 py-1 rounded-full">
                <AlertCircle className="w-3 h-3" /> Waiting for punch
              </span>
            )}
            {status === "Active" && (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-full border border-emerald-400/20">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>{" "}
                Clocked In
              </span>
            )}
            {status === "Completed" && (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-purple-400 bg-purple-400/10 px-2.5 py-1 rounded-full border border-purple-400/20">
                <CheckCircle className="w-3 h-3" /> Shift Completed
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="p-3 bg-[#0a0b10] rounded-lg border border-slate-800">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">
                Clock In
              </p>
              <p className="text-sm font-medium text-slate-200">
                {clockInTime || "--:--"}
              </p>
            </div>
            <div className="p-3 bg-[#0a0b10] rounded-lg border border-slate-800">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">
                Clock Out
              </p>
              <p className="text-sm font-medium text-slate-200">
                {clockOutTime || "--:--"}
              </p>
            </div>
          </div>
        </div>

        {/* Clock-in / Clock-out Buttons */}
        <div className="flex gap-4">
          <button
            onClick={handleClockIn}
            disabled={status !== "Not Started"}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${
              status === "Not Started"
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 hover:border-emerald-500/50"
                : "bg-[#151822] text-slate-600 border border-slate-800 cursor-not-allowed"
            }`}
          >
            <Play className="w-4 h-4" /> Clock In
          </button>

          <button
            onClick={handleClockOut}
            disabled={status !== "Active"}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${
              status === "Active"
                ? "bg-orange-500/10 text-orange-400 border border-orange-500/30 hover:bg-orange-500/20 hover:border-orange-500/50"
                : "bg-[#151822] text-slate-600 border border-slate-800 cursor-not-allowed"
            }`}
          >
            <Square className="w-4 h-4" /> Clock Out
          </button>
        </div>
      </div>
    </div>
  );
};
