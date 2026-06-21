import React from "react";

export const SectionHeader = ({ title, subtitle, action, onAction }) => (
  <div className="flex justify-between items-end mb-4">
    <div>
      <h2 className="text-sm font-bold text-white tracking-tight uppercase opacity-80">{title}</h2>
      {subtitle && <p className="text-[10px] text-zinc-500 mt-0.5 font-bold uppercase tracking-widest">{subtitle}</p>}
    </div>
    {action && (
      <button 
        onClick={onAction}
        className="text-[10px] font-bold text-zinc-500 hover:text-white transition-colors flex items-center gap-1 uppercase tracking-widest"
      >
        {action}
      </button>
    )}
  </div>
);
