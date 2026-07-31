import React, { memo } from "react";
import { Clock, Paperclip, CheckCircle2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const COMPLEXITY_CONFIG = {
  Small: { color: "bg-slate-700 text-slate-200", label: "S" },
  Medium: { color: "bg-blue-500/20 text-blue-400", label: "M" },
  Large: { color: "bg-purple-500/20 text-purple-400", label: "L" },
  Critical: { color: "bg-orange-500/20 text-orange-400", label: "C" },
};

const PRIORITY_CONFIG = {
  High: "text-red-400 bg-red-500/10 border-red-500/20",
  Medium: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  Low: "text-blue-400 bg-blue-500/10 border-blue-500/20",
};

const TaskCard = memo(({ task, onClick, className }) => {
  if (!task) return null;
  const complexity =
    COMPLEXITY_CONFIG[task.complexity] || COMPLEXITY_CONFIG.Small;

  return (
    <div
      onClick={() => onClick(task)}
      className={cn(
        "group relative bg-[#151B2B] border border-white/5 p-4 rounded-xl cursor-pointer overflow-hidden",
        "shadow-sm hover:shadow-lg hover:shadow-black/20 hover:border-white/10",
        // Pure Tailwind Animations replace Framer Motion here:
        "animate-in fade-in slide-in-from-bottom-2 duration-300",
        "hover:-translate-y-0.5 hover:scale-[1.01] active:scale-[0.98] transition-all",
        className,
      )}
    >
      <header className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              "w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold",
              complexity.color,
            )}
          >
            {complexity.label}
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
            {task.id || "UNIT-XXX"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div
            className={cn(
              "px-2 py-0.5 rounded text-[10px] font-semibold border",
              PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.Low,
            )}
          >
            {task.priority}
          </div>
          {task.status === "Approved" && (
            <div className="flex items-center gap-1 text-emerald-400 text-[10px] font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              <CheckCircle2 className="w-3 h-3" /> Approved
            </div>
          )}
          {task.status === "Done" && (
            <div className="text-amber-400 text-[10px] font-semibold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
              Pending Audit
            </div>
          )}
          {task.status === "Rejected" && (
            <div className="text-red-400 text-[10px] font-semibold bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
              Rejected
            </div>
          )}
        </div>
      </header>

      <div className="space-y-1.5 mb-4">
        <h3 className="text-sm font-semibold text-slate-100 leading-tight group-hover:text-blue-400 transition-colors line-clamp-1">
          {task.title}
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
          {task.description}
        </p>
      </div>

      <footer className="flex items-center justify-between pt-3 border-t border-white/5">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
            <Clock className="w-3.5 h-3.5 text-slate-500" /> {task.deadline}
          </div>
          {task.hasProof && (
            <div className="flex items-center gap-1.5 text-xs font-medium text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md">
              <Paperclip className="w-3 h-3" /> 1 File
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 text-slate-500 group-hover:text-blue-400 transition-all opacity-0 group-hover:opacity-100">
          <span className="text-[10px] font-semibold uppercase tracking-wider">
            View
          </span>
          <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
        </div>
      </footer>
    </div>
  );
});

TaskCard.displayName = "TaskCard";
export default TaskCard;
