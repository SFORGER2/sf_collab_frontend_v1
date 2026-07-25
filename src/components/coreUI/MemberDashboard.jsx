import React from "react";
import {
  Briefcase,
  ListTodo,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";

export const MemberDashboard = () => {
  return (
    <section className="mt-8">
      <h2 className="text-xs font-semibold tracking-widest text-slate-500 uppercase mb-4 flex items-center gap-2">
        <Briefcase className="w-4 h-4 text-slate-400" /> My Member Dashboard
      </h2>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Active Tasks */}
        <div className="p-4 rounded-xl bg-[#0d0f17] border border-slate-800 flex flex-col gap-2 hover:border-slate-700 transition-colors">
          <div className="flex items-center gap-2">
            <ListTodo className="w-4 h-4 text-cyan-400" />
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">
              Tasks
            </p>
          </div>
          <p className="text-xl font-bold text-slate-200">4</p>
        </div>

        {/* Daily Update Status */}
        <div className="p-4 rounded-xl bg-[#0d0f17] border border-slate-800 flex flex-col gap-2 hover:border-slate-700 transition-colors">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-orange-400" />
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">
              Update Status
            </p>
          </div>
          <p className="text-xl font-bold text-orange-400">Pending</p>
        </div>

        {/* Warnings */}
        <div className="p-4 rounded-xl bg-[#0d0f17] border border-slate-800 flex flex-col gap-2 hover:border-slate-700 transition-colors">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-emerald-400" />
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">
              Warnings
            </p>
          </div>
          <p className="text-xl font-bold text-emerald-400">0</p>
        </div>

        {/* Approved Points */}
        <div className="p-4 rounded-xl bg-[#0d0f17] border border-slate-800 flex flex-col gap-2 hover:border-slate-700 transition-colors">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-purple-400" />
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">
              Approved Points
            </p>
          </div>
          <p className="text-xl font-bold text-slate-200">85</p>
        </div>

        {/* Estimated Payout */}
        <div className="p-4 rounded-xl bg-[#0d0f17] border border-slate-800 flex flex-col gap-2 hover:border-slate-700 transition-colors">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">
              Est. Payout
            </p>
          </div>
          <p className="text-xl font-bold text-slate-200">$850</p>
        </div>
      </div>
    </section>
  );
};
