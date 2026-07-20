/**
 * MobileAIDashboard.jsx — SFCollab
 */

import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Brain, Zap, Lock, ArrowRight } from "lucide-react";
import { tools } from "@/components/pages/dashboards/aiDashboard/AITools";
import AITutorial from "@/components/pages/dashboards/aiDashboard/AITutorial";

const MobileAIDashboard = ({ locked, daysRemaining, credits }) => {
  return (
    <div className="min-h-screen bg-black text-white px-4 py-8 pb-24">
      <AITutorial />
      
      <div className="flex flex-col items-center gap-4 mb-10 text-center">
        <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-lg shadow-blue-500/20">
          <Brain className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
          SF AI
        </h1>
      </div>

      {/* Credits Card */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 rounded-lg">
              <Zap className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-[10px] text-white/40 uppercase font-black tracking-widest">Available Credits</p>
              <p className="text-2xl font-bold text-white">{credits || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Lock Notification */}
      {locked && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-center gap-3 text-amber-300 mb-6">
          <Lock className="w-5 h-5 flex-shrink-0" />
          <p className="text-[11px] font-bold leading-tight">
            AI tools are temporarily locked. Access resumes in {daysRemaining} day{daysRemaining !== 1 ? "s" : ""}.
          </p>
        </div>
      )}

      {/* Tools Grid */}
      <div className="flex flex-col gap-4">
        {tools.map(({ name, available = true, description, icon: Icon, path, gradient }) => (
          <Link
            key={name}
            to={available && !locked ? path : "#"}
            className={`bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center gap-4 transition-all active:scale-95 ${
              (locked || !available) ? 'opacity-50 grayscale' : ''
            }`}
          >
            <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-white text-sm">{name}</h3>
              <p className="text-[10px] text-white/40 truncate">{description}</p>
            </div>
            {available && !locked && <ArrowRight size={14} className="text-white/20" />}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MobileAIDashboard;
