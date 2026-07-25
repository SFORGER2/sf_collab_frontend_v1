/**
 * MobileToolsDashboard.jsx — SFCollab
 */

import React from "react";
import { Link } from "react-router-dom";
import { Calculator, FileText, FileSignature, ArrowRight, Sparkles, AlertCircle } from "lucide-react";

const tools = [
  {
    name: "Calculator",
    description: "Financial analysis",
    icon: Calculator,
    path: "/calculator",
    gradient: "from-blue-600 to-cyan-500",
  },
  {
    name: "Notes",
    description: "Rich text editor",
    icon: FileText,
    path: "/notes",
    gradient: "from-amber-600 to-orange-500",
  },
  {
    name: "PDF Signing",
    description: "Secure signatures",
    icon: FileSignature,
    path: "/pdf-signing",
    gradient: "from-emerald-600 to-teal-500",
  },
];

const MobileToolsDashboard = ({ user, requestingTool, handleRequestTool }) => {
  return (
    <div className="min-h-screen bg-black text-white px-4 py-8 pb-24">
      <div className="flex flex-col items-center gap-4 mb-10 text-center">
        <div className="p-3 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-xl shadow-lg shadow-indigo-500/20">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent">
          Tools
        </h1>
      </div>

      {/* Notice Banner */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex flex-col gap-3 mb-8">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
          <p className="text-[11px] font-bold text-white uppercase tracking-tight">
            We are polishing basic AI tools. Improvements coming soon.
          </p>
        </div>
        <button
          onClick={handleRequestTool}
          disabled={requestingTool}
          className="w-full py-3 rounded-xl bg-amber-500 text-zinc-950 text-[10px] font-black uppercase tracking-widest active:scale-95 disabled:opacity-50"
        >
          {requestingTool ? "Requesting..." : "Request a Tool"}
        </button>
      </div>

      {/* Tools Grid */}
      <div className="flex flex-col gap-4">
        {tools.map(({ name, description, icon: Icon, path, gradient }) => (
          <Link
            key={name}
            to={path}
            className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center gap-5 active:scale-95 transition-all"
          >
            <div className={`p-4 rounded-xl bg-gradient-to-br ${gradient} shadow-lg shadow-black/40`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-white text-base">{name}</h3>
              <p className="text-[10px] text-white/40 uppercase font-black tracking-widest">{description}</p>
            </div>
            <ArrowRight size={16} className="text-white/20" />
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MobileToolsDashboard;
