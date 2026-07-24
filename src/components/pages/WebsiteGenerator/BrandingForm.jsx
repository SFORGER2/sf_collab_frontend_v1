import React, { useState } from "react";
import { Palette, Link, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ColorPicker from "./ColorPicker";

const TAGLINE_MAX = 200;
const URL_RE = /^https?:\/\/.+/;

/** Auto-resize textarea via scrollHeight */
function AutoTextarea({ value, onChange, placeholder, "aria-label": ariaLabel }) {
  return (
    <textarea
      rows={2}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      aria-label={ariaLabel}
      className="w-full px-3 py-2.5 rounded-lg border border-white/10 bg-white/5 text-slate-100
                 placeholder-slate-600 text-sm leading-relaxed resize-none
                 hover:border-white/20 focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20
                 outline-none transition-all duration-200"
      style={{ fieldSizing: "content", minHeight: "72px" }}
      onInput={(e) => {
        // Fallback for browsers not supporting field-sizing
        e.target.style.height = "auto";
        e.target.style.height = `${e.target.scrollHeight}px`;
      }}
    />
  );
}

export default function BrandingForm({ value = {}, onChange }) {
  const [branding, setBranding] = useState({
    primary_color: value.primary_color || "#7c3aed",
    accent_color:  value.accent_color  || "#f59e0b",
    tagline:       value.tagline       || "",
    logo_url:      value.logo_url      || "",
  });
  const [logoError, setLogoError] = useState("");

  const update = (patch) => {
    const next = { ...branding, ...patch };
    setBranding(next);
    onChange?.(next);
  };

  const handleLogoChange = (e) => {
    const val = e.target.value.trim();
    setLogoError(val && !URL_RE.test(val) ? "Must be a valid http:// or https:// URL" : "");
    update({ logo_url: val });
  };

  const handleTaglineChange = (e) => {
    const val = e.target.value;
    if (val.length <= TAGLINE_MAX) update({ tagline: val });
  };

  const taglineLen = branding.tagline.length;
  const taglinePct = (taglineLen / TAGLINE_MAX) * 100;
  const taglineNearLimit = taglineLen >= TAGLINE_MAX * 0.85;

  return (
    <div className="space-y-6">
      {/* ── Section header ──────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 pb-4 border-b border-white/5">
        <div className="w-9 h-9 rounded-xl bg-violet-500/15 flex items-center justify-center flex-shrink-0">
          <Palette className="w-4 h-4 text-violet-400" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">Branding</h3>
          <p className="text-xs text-slate-500">Step 2 · Colours, tagline &amp; logo</p>
        </div>
      </div>

      {/* ── Live Brand Preview Strip ─────────────────────────────────────── */}
      <div className="rounded-xl overflow-hidden border border-white/8 shadow-lg">
        {/* Mock browser chrome */}
        <div className="flex items-center gap-1.5 px-3 py-2 bg-white/5 border-b border-white/5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
          <div className="flex-1 mx-3 h-4 rounded-sm bg-white/5 flex items-center px-2">
            <span className="text-[9px] text-slate-600 font-mono truncate">yoursite.com</span>
          </div>
        </div>
        {/* Brand header preview */}
        <div
          className="h-16 flex items-center justify-between px-5 transition-all duration-500"
          style={{
            background: `linear-gradient(135deg, ${branding.primary_color} 0%, ${branding.accent_color} 100%)`,
          }}
        >
          <div className="flex items-center gap-2">
            {branding.logo_url && URL_RE.test(branding.logo_url) ? (
              <img src={branding.logo_url} className="w-7 h-7 rounded object-cover" alt="logo" />
            ) : (
              <div className="w-7 h-7 rounded bg-white/20 flex items-center justify-center text-white font-bold text-xs">
                {branding.tagline ? branding.tagline[0].toUpperCase() : "A"}
              </div>
            )}
            <span className="text-white text-sm font-bold drop-shadow">
              {branding.tagline || "Your Brand"}
            </span>
          </div>
          <div className="flex gap-3">
            {["Home","About","Pricing"].map((n) => (
              <span key={n} className="text-white/70 text-[10px] font-medium">{n}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Brand colours ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="bg-white/[0.02] rounded-xl p-4 border border-white/8">
          <ColorPicker
            label="Primary Colour"
            value={branding.primary_color}
            onChange={(c) => update({ primary_color: c })}
          />
        </div>
        <div className="bg-white/[0.02] rounded-xl p-4 border border-white/8">
          <ColorPicker
            label="Accent Colour"
            value={branding.accent_color}
            onChange={(c) => update({ accent_color: c })}
          />
        </div>
      </div>

      {/* ── Tagline ─────────────────────────────────────────────────────── */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold uppercase tracking-widest text-slate-400">
            Tagline
          </label>
          {/* Arc-style progress bar */}
          <div className="flex items-center gap-2">
            <div className="w-24 h-1.5 rounded-full bg-white/8 overflow-hidden">
              <motion.div
                className="h-full rounded-full transition-colors duration-300"
                animate={{ width: `${Math.min(taglinePct, 100)}%` }}
                style={{
                  background: taglineLen >= TAGLINE_MAX
                    ? "#ef4444"
                    : taglineNearLimit
                    ? "#f59e0b"
                    : "linear-gradient(90deg, #7c3aed, #a855f7)",
                }}
                transition={{ duration: 0.15 }}
              />
            </div>
            <span
              className={`text-xs font-mono tabular-nums transition-colors ${
                taglineLen >= TAGLINE_MAX ? "text-red-400" : taglineNearLimit ? "text-amber-400" : "text-slate-600"
              }`}
            >
              {taglineLen}/{TAGLINE_MAX}
            </span>
          </div>
        </div>
        <AutoTextarea
          value={branding.tagline}
          onChange={handleTaglineChange}
          placeholder="Roasted daily, delivered fresh."
          aria-label="Project tagline"
        />
      </div>

      {/* ── Logo URL ────────────────────────────────────────────────────── */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold uppercase tracking-widest text-slate-400">
          Logo URL
          <span className="ml-1.5 text-slate-600 font-normal normal-case tracking-normal">(optional)</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Link className="w-4 h-4 text-slate-500" />
          </div>
          <input
            type="url"
            value={branding.logo_url}
            onChange={handleLogoChange}
            placeholder="https://example.com/logo.png"
            aria-label="Logo URL"
            className={`w-full pl-9 pr-3 py-2.5 rounded-lg border text-sm text-slate-100
                        bg-white/5 placeholder-slate-600 outline-none transition-all
                        hover:border-white/20 focus:ring-2
                        ${logoError
                          ? "border-red-500/60 focus:ring-red-500/20 focus:border-red-500/60"
                          : "border-white/10 focus:border-violet-500/60 focus:ring-violet-500/20"
                        }`}
          />
        </div>
        <AnimatePresence>
          {logoError && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="text-red-400 text-xs flex items-center gap-1"
            >
              <AlertCircle className="w-3 h-3 flex-shrink-0" />
              {logoError}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
