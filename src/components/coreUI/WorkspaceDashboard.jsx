import React from "react";
import { CircleDollarSign, Users, Target } from "lucide-react";

export const WorkspaceDashboard = () => {
  return (
    <section>
      <h2 className="text-xs font-semibold tracking-widest text-slate-500 uppercase mb-4 flex items-center gap-2">
        <Users className="w-4 h-4 text-slate-400" /> Workspace Dashboard
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="p-5 rounded-xl bg-[#0d0f17] border border-slate-800 flex items-center gap-4 hover:border-emerald-500/30 transition-colors shadow-sm">
          <div className="p-3 bg-[#11131a] rounded-lg border border-slate-800">
            <CircleDollarSign className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">
              Total Revenue
            </p>
            <p className="text-xl font-bold text-slate-200">$42,500</p>
          </div>
        </div>

        {/* Team Pool */}
        <div className="p-5 rounded-xl bg-[#0d0f17] border border-slate-800 flex items-center gap-4 hover:border-cyan-500/30 transition-colors shadow-sm">
          <div className="p-3 bg-[#11131a] rounded-lg border border-slate-800">
            <Users className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">
              Team Pool
            </p>
            <p className="text-xl font-bold text-slate-200">$8,400</p>
          </div>
        </div>

        {/* Total Points */}
        <div className="p-5 rounded-xl bg-[#0d0f17] border border-slate-800 flex items-center gap-4 hover:border-purple-500/30 transition-colors shadow-sm">
          <div className="p-3 bg-[#11131a] rounded-lg border border-slate-800">
            <Target className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">
              Total Points
            </p>
            <p className="text-xl font-bold text-slate-200">1,250</p>
          </div>
        </div>

        {/* Top Contributors */}
        <div className="p-5 rounded-xl bg-[#0d0f17] border border-slate-800 flex flex-col justify-center shadow-sm">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">
            Top Contributor
          </p>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-orange-500/20 border border-orange-500/50 flex items-center justify-center text-orange-400 font-bold text-xs">
              JD
            </div>
            <span className="text-sm font-medium text-slate-200">
              John Doe (320 pts)
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
