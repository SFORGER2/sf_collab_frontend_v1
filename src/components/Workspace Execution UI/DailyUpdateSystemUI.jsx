import React, { useState } from "react";
import { Send, AlertCircle, TrendingUp, ShieldAlert } from "lucide-react";

export const DailyUpdateSystemUI = () => {
  const [form, setForm] = useState({ today: "", blockers: "", progress: 50 });
  const [hasMissedUpdate, setHasMissedUpdate] = useState(true); // Simulating a missed update

  return (
    <div className="w-full max-w-2xl bg-[#0d0f17] border border-slate-800 rounded-2xl p-6 shadow-lg font-sans text-slate-300">
      <h2 className="text-xl font-bold text-slate-100 mb-6 flex items-center gap-2">
        <TrendingUp className="text-cyan-400" /> Daily Standup
      </h2>

      {/* Missed Update Alert */}
      {hasMissedUpdate && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-bold text-red-400">
              Missed Update Alert
            </h3>
            <p className="text-xs text-red-400/80 mt-1">
              You missed your daily update yesterday. Please ensure you submit
              your progress today to maintain team sync.
            </p>
          </div>
          <button
            onClick={() => setHasMissedUpdate(false)}
            className="ml-auto text-xs text-red-400 hover:text-red-300 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Daily Standup Form */}
      <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">
            What are you working on today?
          </label>
          <textarea
            className="w-full bg-[#0a0b10] border border-slate-700 rounded-xl p-4 text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none min-h-[100px]"
            placeholder="List your core tasks..."
          />
        </div>

        {/* Blockers Section */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-400 mb-2">
            <ShieldAlert className="w-4 h-4 text-orange-400" /> Any blockers?
          </label>
          <textarea
            className="w-full bg-[#0a0b10] border border-slate-700 rounded-xl p-4 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none min-h-[80px]"
            placeholder="Describe anything slowing you down..."
          />
        </div>

        {/* Progress Slider */}
        <div className="pt-2">
          <div className="flex justify-between text-sm font-medium text-slate-400 mb-3">
            <span>Sprint Progress</span>
            <span className="text-cyan-400">{form.progress}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={form.progress}
            onChange={(e) => setForm({ ...form, progress: e.target.value })}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
          />
        </div>

        <button className="w-full py-3 mt-4 bg-cyan-600/20 hover:bg-cyan-600/40 border border-cyan-500/50 text-cyan-400 font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
          <Send className="w-4 h-4" /> Submit Standup
        </button>
      </form>
    </div>
  );
};
