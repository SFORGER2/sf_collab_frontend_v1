import React, { useState } from "react";
import {
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  Shield,
  FileText,
  ExternalLink,
  Info,
  CheckCircle2,
} from "lucide-react";

const ConfidenceBadge = ({ level }) => {
  const configs = {
    High: {
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
      icon: ShieldCheck,
    },
    Medium: {
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
      icon: Shield,
    },
    Low: {
      color: "text-rose-400",
      bg: "bg-rose-500/10",
      border: "border-rose-500/20",
      icon: ShieldAlert,
    },
  };

  const config = configs[level] || configs.Medium;
  const Icon = config.icon;

  return (
    <div
      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${config.bg} ${config.border} ${config.color} shrink-0`}
    >
      <Icon className="w-3.5 h-3.5" />
      <span className="text-xs font-bold uppercase tracking-wider">
        {level} Confidence
      </span>
    </div>
  );
};

const SourceCard = ({ source, onClick }) => {
  // Determine color for the individual source score
  let scoreColor = "text-slate-400";
  if (source.score >= 90) scoreColor = "text-emerald-400";
  else if (source.score >= 70) scoreColor = "text-amber-400";
  else scoreColor = "text-rose-400";

  return (
    <button
      onClick={() => onClick(source)}
      className="flex items-start gap-3 p-3 bg-[#0a0b10] hover:bg-[#151822] border border-slate-800/80 hover:border-cyan-500/40 rounded-xl transition-all text-left group w-full sm:w-64 shrink-0"
    >
      <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center shrink-0 group-hover:bg-cyan-500/20 transition-colors">
        <FileText className="w-4 h-4 text-slate-400 group-hover:text-cyan-400" />
      </div>
      <div className="flex-1 min-w-0 pt-0.5">
        <h5 className="text-sm font-semibold text-slate-200 truncate group-hover:text-cyan-400 transition-colors">
          {source.title}
        </h5>
        <div className="flex items-center gap-2 mt-1">
          <span className={`text-[10px] font-bold ${scoreColor}`}>
            {source.score}% Match
          </span>
          <span className="text-slate-600 text-[10px]">•</span>
          <span className="text-[10px] text-slate-500 flex items-center gap-1">
            View Doc <ExternalLink className="w-2.5 h-2.5" />
          </span>
        </div>
      </div>
    </button>
  );
};

export const GroundedResponse = ({ data, onOpenSource }) => {
  return (
    <div className="w-full bg-[#11131a] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      {}
      <div className="px-6 py-4 border-b border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-slate-100">AI Analysis</span>
        </div>
        <ConfidenceBadge level={data.confidence} />
      </div>

      {}
      <div className="p-6 text-slate-300 text-sm md:text-base leading-relaxed space-y-4">
        {data.answer.split("\n\n").map((paragraph, idx) => (
          <p key={idx}>{paragraph}</p>
        ))}
      </div>

      {}
      <div className="px-6 py-5 bg-slate-900/40 border-t border-slate-800/60">
        <div className="flex items-center gap-2 mb-4">
          <Info className="w-4 h-4 text-slate-500" />
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Grounded Sources ({data.sources.length})
          </h4>
        </div>

        <div className="flex overflow-x-auto pb-2 -mx-2 px-2 gap-3 custom-scrollbar">
          {data.sources.map((source, index) => (
            <SourceCard key={index} source={source} onClick={onOpenSource} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [activeScenario, setActiveScenario] = useState("high");

  const handleOpenSource = (source) => {
    // In a real app, this would open a modal, new tab, or side panel
    alert(
      `Opening Document:\n\nTitle: ${source.title}\nID: ${source.id}\nConfidence Match: ${source.score}%`,
    );
  };

  const scenarios = {
    high: {
      confidence: "High",
      answer:
        "Based on the provided corporate policies, full-time employees are eligible for 20 days of Paid Time Off (PTO) per calendar year, accrued at a rate of 1.66 days per month.\n\nEmployees may carry over a maximum of 5 unused PTO days into the following year. Any additional unused days will be forfeited as of December 31st.",
      sources: [
        { id: "doc-401", title: "Employee Handbook 2023", score: 98 },
        { id: "doc-412", title: "PTO & Leave Policy v2", score: 95 },
        { id: "doc-089", title: "HR FAQ - Benefits", score: 88 },
      ],
    },
    medium: {
      confidence: "Medium",
      answer:
        "It appears the platform utilizes a hybrid matching algorithm. The documentation explicitly mentions scoring based on 'technical skills' and 'timezone overlap'.\n\nHowever, it is unclear if 'project interests' are weighted equally, as the secondary documentation suggests this feature is still in beta testing.",
      sources: [
        { id: "doc-102", title: "Matchmaking Architecture", score: 75 },
        { id: "doc-334", title: "Beta Features Q3", score: 68 },
      ],
    },
    low: {
      confidence: "Low",
      answer:
        "I could not find a definitive answer regarding the specific pricing tiers for the 'Enterprise Scaling Pack' within the provided knowledge base.\n\nThe available documents mention pricing is customized based on team size, but exact figures are not explicitly listed in the standard pricing sheets.",
      sources: [
        { id: "doc-004", title: "Public Pricing Tiers", score: 42 },
        { id: "doc-019", title: "Sales Playbook", score: 31 },
      ],
    },
  };

  return (
    <div className="min-h-screen bg-[#050505] p-4 md:p-8 font-sans text-slate-200 selection:bg-cyan-500/30 flex flex-col">
      {}
      <div className="w-full max-w-3xl mx-auto mb-8 bg-[#0a0b10] border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
        <h1 className="text-sm font-bold text-slate-400 uppercase tracking-widest pl-2 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-cyan-500" /> Grounded Answers
        </h1>
        <div className="flex flex-wrap gap-2">
          {[
            { id: "high", label: "High Confidence" },
            { id: "medium", label: "Medium Confidence" },
            { id: "low", label: "Low Confidence" },
          ].map((state) => (
            <button
              key={state.id}
              onClick={() => setActiveScenario(state.id)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeScenario === state.id
                  ? "bg-cyan-600 text-white shadow-md shadow-cyan-900/30"
                  : "bg-transparent border border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`}
            >
              {state.label}
            </button>
          ))}
        </div>
      </div>

      {}
      <div className="flex-1 w-full max-w-3xl mx-auto">
        <GroundedResponse
          data={scenarios[activeScenario]}
          onOpenSource={handleOpenSource}
        />
      </div>

      {/* Custom Scrollbar Styles for the Sources list */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .custom-scrollbar::-webkit-scrollbar {
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.2);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(51, 65, 85, 0.6);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(71, 85, 105, 0.8);
        }
      `,
        }}
      />
    </div>
  );
}
