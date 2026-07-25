import React, { useState, useEffect, useId } from "react";
import { AnimatePresence, motion } from "framer-motion";
import AppTypeCard from "./AppTypeCard";

/* ─── Mock data matching GET /api/generator/packs ───────────────────────── */
const MOCK_PACKS = [
  {
    key: "landing",
    label: "Marketing / Landing Site",
    description: "Brand-driven landing site with content sections, testimonials and a lead-capture API.",
  },
  {
    key: "blog",
    label: "Blog / Publication",
    description: "Content publication with categories, tags and moderated comments.",
  },
  {
    key: "ecommerce",
    label: "E-commerce Storefront",
    description: "Catalogue, customers, carts and orders with normalised order items.",
  },
  {
    key: "saas_dashboard",
    label: "SaaS Dashboard",
    description: "Multi-tenant dashboard with organizations, plans, subscriptions and API keys.",
  },
];

/* ─── Shimmer Skeleton Card ──────────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="w-full rounded-2xl border border-white/5 bg-white/[0.02] p-5 space-y-3 overflow-hidden relative">
      <div
        className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite]"
        style={{
          background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 50%, transparent 100%)",
        }}
      />
      <div className="w-11 h-11 rounded-xl bg-white/8" />
      <div className="w-2/3 h-3.5 rounded-lg bg-white/8" />
      <div className="space-y-1.5">
        <div className="w-full h-2 rounded bg-white/5" />
        <div className="w-4/5 h-2 rounded bg-white/5" />
      </div>
      <div className="flex gap-1 pt-1">
        <div className="w-14 h-4 rounded-md bg-white/5" />
        <div className="w-16 h-4 rounded-md bg-white/5" />
      </div>
    </div>
  );
}

/* ─── Inline field error ─────────────────────────────────────────────────── */
function FieldError({ id, message }) {
  if (!message) return null;
  return (
    <motion.p
      id={id}
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      className="flex items-center gap-1 text-red-400 text-xs mt-1"
      role="alert"
    >
      <svg className="w-3 h-3 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
      {message}
    </motion.p>
  );
}

const NAME_MIN = 2;
const NAME_MAX = 120;

/**
 * AppTypeSelector — Step A of the Website Creation Wizard
 * Props: value { name, app_type }, onChange
 */
export default function AppTypeSelector({ value, onChange }) {
  const nameId = useId();
  const [isFocused, setIsFocused] = useState(false);

  /* ── Pack fetch simulation ─────────────────────────────────────────────── */
  const [packs, setPacks] = useState([]);
  const [loadState, setLoadState] = useState("idle");

  const fetchPacks = () => {
    setLoadState("loading");
    setTimeout(() => {
      setPacks(MOCK_PACKS);
      setLoadState("success");
    }, 1200);
  };

  useEffect(() => { fetchPacks(); }, []);

  /* ── Name validation ───────────────────────────────────────────────────── */
  const [nameTouched, setNameTouched] = useState(false);
  const nameError = (() => {
    if (!nameTouched) return "";
    const n = (value.name || "").trim();
    if (n.length < NAME_MIN) return `Name must be at least ${NAME_MIN} characters.`;
    if (n.length > NAME_MAX) return `Name must be at most ${NAME_MAX} characters.`;
    return "";
  })();

  const nameLength = (value.name || "").length;
  const nameCountColor =
    nameLength > NAME_MAX ? "text-red-400" :
    nameLength > NAME_MAX * 0.85 ? "text-amber-400" :
    "text-slate-600";

  const hasValue = nameLength > 0;
  const isLabelFloated = isFocused || hasValue;

  return (
    <div className="space-y-7">

      {/* ── Website Name — Float Label Input ─────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label
            htmlFor={nameId}
            className="text-xs font-semibold uppercase tracking-widest text-slate-400"
          >
            Website Name <span className="text-red-400">*</span>
          </label>
          <span className={`text-xs font-mono tabular-nums ${nameCountColor}`}>
            {nameLength} / {NAME_MAX}
          </span>
        </div>

        <div className="relative">
          <input
            id={nameId}
            type="text"
            value={value.name}
            onChange={(e) => onChange({ ...value, name: e.target.value })}
            onBlur={() => setNameTouched(true)}
            onFocus={() => setIsFocused(true)}
            placeholder="e.g. My Startup Landing Page"
            aria-invalid={!!nameError}
            aria-describedby={nameError ? `${nameId}-error` : undefined}
            maxLength={NAME_MAX + 1}
            className={`w-full px-4 py-3 rounded-xl bg-white/5 border text-sm text-slate-100
                        placeholder-slate-600 outline-none transition-all duration-200
                        ${nameError
                          ? "border-red-500/60 focus:border-red-500/80 focus:ring-2 focus:ring-red-500/20"
                          : "border-white/10 hover:border-white/20 focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20"
                        }`}
            style={{
              boxShadow: isFocused && !nameError
                ? "0 0 0 3px rgba(124,58,237,0.15), 0 0 20px rgba(124,58,237,0.08)"
                : "none",
            }}
          />
        </div>

        <AnimatePresence>
          {nameError && (
            <FieldError id={`${nameId}-error`} message={nameError} />
          )}
        </AnimatePresence>

        {!nameError && (
          <p className="text-xs text-slate-600 mt-1.5">
            2–120 characters · Used as the project title in your dashboard.
          </p>
        )}
      </div>

      {/* ── App Type Selector ─────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <label className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            App Type
          </label>
          <span className="text-[10px] text-slate-600">(fetched from /api/generator/packs)</span>
        </div>

        <AnimatePresence mode="wait">
          {/* Loading — shimmer skeleton grid */}
          {loadState === "loading" && (
            <motion.div
              key="skeletons"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {[0, 1, 2, 3].map((i) => <SkeletonCard key={i} />)}
            </motion.div>
          )}

          {/* Error state */}
          {loadState === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-3 py-10 px-6 rounded-2xl border border-red-500/20 bg-red-500/5"
            >
              <svg className="w-8 h-8 text-red-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-red-300 text-center">
                Failed to load app types.<br />
                <span className="text-xs text-slate-500">Could not reach GET /api/generator/packs</span>
              </p>
              <button
                type="button"
                id="retry-packs-btn"
                onClick={fetchPacks}
                className="px-4 py-2 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-300
                           text-sm font-medium transition-colors border border-red-500/30"
              >
                Try Again
              </button>
            </motion.div>
          )}

          {/* Success — staggered card grid */}
          {loadState === "success" && (
            <motion.div
              key="cards"
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0 }}
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.07 } },
              }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {packs.map((pack) => (
                <motion.div
                  key={pack.key}
                  variants={{
                    hidden: { opacity: 0, y: 16 },
                    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
                  }}
                >
                  <AppTypeCard
                    pack={pack}
                    isSelected={value.app_type === pack.key}
                    onSelect={() => onChange({ ...value, app_type: pack.key })}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {loadState === "success" && (
          <p className="text-xs text-slate-600 mt-3">
            Default: <span className="font-mono text-slate-500">landing</span>. Determines the backend stack and schema generated for your project.
          </p>
        )}
      </div>
    </div>
  );
}
