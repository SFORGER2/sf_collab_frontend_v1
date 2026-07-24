import React, { useState, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, AlertCircle, AlertTriangle, Plus } from "lucide-react";

const MAX_FEATURES = 40;
const MAX_CHARS = 120;

// Rotating palette for colorful chips
const CHIP_PALETTE = [
  { bg: "bg-violet-500/15 border-violet-500/25 text-violet-300", dot: "#7c3aed" },
  { bg: "bg-sky-500/15 border-sky-500/25 text-sky-300", dot: "#0ea5e9" },
  { bg: "bg-emerald-500/15 border-emerald-500/25 text-emerald-300", dot: "#10b981" },
  { bg: "bg-amber-500/15 border-amber-500/25 text-amber-300", dot: "#f59e0b" },
  { bg: "bg-pink-500/15 border-pink-500/25 text-pink-300", dot: "#ec4899" },
  { bg: "bg-cyan-500/15 border-cyan-500/25 text-cyan-300", dot: "#06b6d4" },
];

// Quick-add suggestion chips
const SUGGESTIONS = [
  "User Authentication",
  "Dark Mode",
  "Analytics Dashboard",
  "API Integration",
  "Real-time Notifications",
  "Mobile Responsive",
];

export default function FeatureChipInput({ value = [], onChange }) {
  const [inputVal, setInputVal] = useState("");
  const [inputError, setInputError] = useState("");
  const [toast, setToast] = useState("");
  const inputRef = useRef(null);
  const toastRef = useRef(null);

  const showToast = (msg) => {
    setToast(msg);
    clearTimeout(toastRef.current);
    toastRef.current = setTimeout(() => setToast(""), 2500);
  };

  const addFeature = (raw) => {
    const text = raw.trim().replace(/,$/, "").trim();
    if (!text) return;
    if (text.length > MAX_CHARS) { setInputError(`Max ${MAX_CHARS} characters per feature.`); return; }
    if (value.length >= MAX_FEATURES) { showToast(`Maximum ${MAX_FEATURES} features reached.`); return; }
    if (value.includes(text)) { showToast("Feature already added."); return; }
    setInputError("");
    onChange?.([...value, text]);
    setInputVal("");
  };

  const removeFeature = (idx) => {
    onChange?.(value.filter((_, i) => i !== idx));
    setInputError("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addFeature(inputVal); }
    else if (e.key === "Backspace" && !inputVal && value.length > 0) removeFeature(value.length - 1);
  };

  const handleChange = (e) => {
    const raw = e.target.value;
    setInputVal(raw);
    if (raw.length > MAX_CHARS) setInputError(`Max ${MAX_CHARS} characters per feature.`);
    else setInputError("");
    if (raw.endsWith(",")) addFeature(raw);
  };

  const atMax = value.length >= MAX_FEATURES;
  const fillPct = (value.length / MAX_FEATURES) * 100;
  const barColor =
    value.length >= MAX_FEATURES ? "#ef4444" :
    value.length >= 35 ? "#f59e0b" :
    "#7c3aed";

  const availableSuggestions = SUGGESTIONS.filter((s) => !value.includes(s));

  return (
    <div className="space-y-3">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-widest text-slate-400">
          Features
        </label>
        <div className="flex items-center gap-2">
          {/* Progress bar */}
          <div className="w-20 h-1.5 rounded-full bg-white/8 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              animate={{ width: `${Math.min(fillPct, 100)}%`, backgroundColor: barColor }}
              transition={{ duration: 0.2 }}
            />
          </div>
          <span
            className={`text-xs font-mono tabular-nums ${
              atMax ? "text-red-400" : value.length >= 35 ? "text-amber-400" : "text-slate-500"
            }`}
          >
            {value.length}/{MAX_FEATURES}
          </span>
        </div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs"
            role="alert" aria-live="polite"
          >
            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chips + input container */}
      <div
        className={`min-h-[80px] w-full px-3 py-2.5 rounded-xl border bg-white/5 flex flex-wrap gap-2 items-start cursor-text transition-all duration-200
                    ${inputError
                      ? "border-red-500/60"
                      : "border-white/10 hover:border-white/20 focus-within:border-violet-500/60 focus-within:ring-2 focus-within:ring-violet-500/20"
                    }`}
        style={{
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)",
        }}
        onClick={() => inputRef.current?.focus()}
      >
        <AnimatePresence mode="popLayout">
          {value.map((feat, idx) => {
            const theme = CHIP_PALETTE[idx % CHIP_PALETTE.length];
            return (
              <motion.span
                key={feat}
                layout
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className={`inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1 rounded-full border text-xs font-medium select-none ${theme.bg}`}
              >
                <span className="max-w-[150px] truncate">{feat}</span>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); removeFeature(idx); }}
                  aria-label={`Remove feature: ${feat}`}
                  className="flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center
                             hover:bg-white/20 transition-colors"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </motion.span>
            );
          })}
        </AnimatePresence>

        <input
          ref={inputRef}
          type="text"
          value={inputVal}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={atMax}
          placeholder={atMax ? `Maximum ${MAX_FEATURES} features reached.` : "Add a feature, press Enter or ,"}
          aria-label="Feature input"
          className="flex-1 min-w-[180px] bg-transparent text-slate-100 text-sm
                     placeholder-slate-600 outline-none disabled:cursor-not-allowed
                     disabled:text-slate-600 disabled:placeholder-slate-700"
        />
      </div>

      {inputError && (
        <p className="text-red-400 text-xs flex items-center gap-1">
          <AlertCircle className="w-3 h-3 flex-shrink-0" />
          {inputError}
        </p>
      )}

      <p className="text-xs text-slate-600">
        Press{" "}
        <kbd className="px-1 py-0.5 rounded bg-white/10 text-slate-400 text-[10px] font-mono">Enter</kbd>{" "}
        or{" "}
        <kbd className="px-1 py-0.5 rounded bg-white/10 text-slate-400 text-[10px] font-mono">,</kbd>{" "}
        to add · Backspace to remove last
      </p>

      {/* Quick-add suggestions */}
      {!atMax && availableSuggestions.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[10px] text-slate-600 uppercase tracking-widest font-semibold">
            Quick Add
          </p>
          <div className="flex flex-wrap gap-2">
            {availableSuggestions.slice(0, 6).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => addFeature(s)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium
                           border border-white/10 bg-white/4 text-slate-400 hover:text-white
                           hover:border-white/25 hover:bg-white/8 transition-all duration-150 active:scale-95"
              >
                <Plus className="w-2.5 h-2.5" />
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
