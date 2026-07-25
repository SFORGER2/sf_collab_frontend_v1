import React, { useState } from "react";
import { LayoutDashboard, Send, CheckCircle2 } from "lucide-react";

// 👉 IMPORT YOUR NEW MODULAR COMPONENTS HERE
import { WorkspaceDashboard } from "../coreUI/WorkspaceDashboard";
import { MemberDashboard } from "../coreUI/MemberDashboard";
import { DailyUpdateUI } from "../coreUI/DailyUpdateUI";
import { AttendanceUI } from "../coreUI/AttendanceUI";

export const ERPDashboard = () => {
  return (
    <div className="min-h-screen w-full bg-[#0a0b10] text-slate-300 p-4 md:p-8 font-sans overflow-y-auto custom-scrollbar">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex items-center gap-4 border-b border-slate-800 pb-6">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
            <LayoutDashboard className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">
              SFCollab Workspace
            </h1>
            <p className="text-sm text-slate-500">
              Your daily ERP overview and task tracking.
            </p>
          </div>
        </header>

        {/* 1 & 2. TOP METRICS */}
        <WorkspaceDashboard />
        <MemberDashboard />

        {/* 3 & 4. BOTTOM ROW: Interactive Widgets */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
          {/* Daily Update Form spans 2 columns */}
          <section className="col-span-1 lg:col-span-2">
            <DailyUpdateUI />
          </section>

          {/* Attendance Tracker spans 1 column */}
          <section className="col-span-1 flex flex-col">
            <AttendanceUI />
          </section>
        </div>
      </div>
    </div>
  );
};
