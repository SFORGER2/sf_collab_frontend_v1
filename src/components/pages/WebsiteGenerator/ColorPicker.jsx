import React, { useState, useEffect } from "react";
import { Pipette, AlertCircle, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const PRESETS = [
  { color: "#7c3aed", label: "Violet" },
  { color: "#a855f7", label: "Purple" },
  { color: "#ec4899", label: "Pink" },
  { color: "#f59e0b", label: "Amber" },
  { color: "#0ea5e9", label: "Sky" },
  { color: "#14b8a6", label: "Teal" },
  { color: "#16a34a", label: "Green" },
  { color: "#dc2626", label: "Red" },
  { color: "#14213d", label: "Ink" },
];

const HEX_RE = /^#[0-9A-Fa-f]{6}$/;

/** WCAG relative luminance of a hex color */
function relativeLuminance(hex) {
  if (!HEX_RE.test(hex)) return 0;
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const toLinear = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

/** WCAG contrast ratio against white */
function contrastWithWhite(hex) {
  const L = relativeLuminance(hex);
  return (1.05) / (L + 0.05);
}

export default function ColorPicker({ label, value, onChange }) {
  const [hex, setHex] = useState(value || "#7c3aed");
  const [error, setError] = useState("");
  const [hoveredPreset, setHoveredPreset] = useState(null);

  useEffect(() => {
    if (value && HEX_RE.test(value)) {
      setHex(value);
      setError("");
    }
  }, [value]);

  const commit = (newHex) => {
    if (!HEX_RE.test(newHex)) {
      setError("Invalid hex colour — must be #RRGGBB");
      return;
    }
    setError("");
    setHex(newHex);
    onChange?.(newHex);
  };

  const handleTextChange = (e) => {
    const raw = e.target.value;
    setHex(raw);
    if (HEX_RE.test(raw)) { setError(""); onChange?.(raw); }
    else setError("Invalid hex colour — must be #RRGGBB");
  };

  const handleNativeChange = (e) => {
    const raw = e.target.value;
    setHex(raw);
    setError("");
    onChange?.(raw);
  };

  const contrast = contrastWithWhite(hex);
  const passesAA = contrast >= 4.5;
  const passesAAA = contrast >= 7;
  const validHex = HEX_RE.test(hex) ? hex : "#7c3aed";

  return (
    <div className="space-y-3">
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-widest text-slate-400">
          {label}
        </label>
      )}

      {/* Live preview rectangle */}
      <div
        className="w-full h-14 rounded-xl border-2 border-white/10 flex items-center justify-between px-4 transition-all duration-300"
        style={{
          background: validHex,
          boxShadow: `0 4px 20px ${validHex}50`,
        }}
      >
        <span className="font-mono text-sm font-bold" style={{ color: passesAA ? "#fff" : "#000" }}>
          {hex.toUpperCase()}
        </span>
        {/* Contrast badge */}
        <div
          className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-bold"
          style={{
            background: passesAA ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.2)",
            color: passesAA ? "#fff" : "#000",
          }}
        >
          {passesAAA ? (
            <CheckCircle className="w-3 h-3" />
          ) : passesAA ? (
            <CheckCircle className="w-3 h-3" />
          ) : (
            <AlertCircle className="w-3 h-3" />
          )}
          {passesAAA ? "AAA" : passesAA ? "AA ✓" : "AA ✗"}
          <span className="opacity-70">{contrast.toFixed(1)}:1</span>
        </div>
      </div>

      {/* Picker + hex input row */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <input
            type="color"
            value={validHex}
            onChange={handleNativeChange}
            className="sr-only"
            id={`color-native-${label}`}
            aria-label={`${label} colour picker`}
          />
          <label
            htmlFor={`color-native-${label}`}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-white/10 bg-white/5
                       hover:bg-white/10 cursor-pointer text-xs text-slate-300 transition-all select-none
                       hover:border-white/25 active:scale-95"
          >
            <Pipette className="w-3.5 h-3.5 text-violet-400" />
            Pick Color
          </label>
        </div>

        {/* Hex text input */}
        <input
          type="text"
          value={hex}
          onChange={handleTextChange}
          maxLength={7}
          spellCheck={false}
          placeholder="#7c3aed"
          aria-label={`${label} hex value`}
          className={`flex-1 px-3 py-2 rounded-lg border text-sm font-mono tracking-wider
                      bg-white/5 text-slate-100 placeholder-slate-600 transition-colors outline-none
                      focus:ring-2 focus:ring-violet-500/40
                      ${error ? "border-red-500/70 focus:ring-red-500/30" : "border-white/10 hover:border-white/20 focus:border-violet-500/50"}`}
        />
      </div>

      {/* Preset swatches */}
      <div>
        <p className="text-[10px] text-slate-600 uppercase tracking-widest font-semibold mb-2">
          Popular Palettes
        </p>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Preset colours">
          {PRESETS.map(({ color, label: swatchLabel }) => (
            <div key={color} className="relative group">
              <button
                type="button"
                title={swatchLabel}
                aria-label={`${swatchLabel} ${color}`}
                onClick={() => commit(color)}
                onMouseEnter={() => setHoveredPreset(color)}
                onMouseLeave={() => setHoveredPreset(null)}
                className="w-7 h-7 rounded-full border-2 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black"
                style={{
                  background: color,
                  borderColor: hex === color ? "#fff" : "rgba(255,255,255,0.15)",
                  transform: hex === color || hoveredPreset === color ? "scale(1.2)" : "scale(1)",
                  boxShadow: hex === color ? `0 0 10px ${color}80, 0 0 0 2px ${color}60` : "none",
                }}
              />
              {/* Tooltip */}
              <AnimatePresence>
                {hoveredPreset === color && (
                  <motion.span
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.12 }}
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-0.5 rounded text-[10px] font-medium text-white whitespace-nowrap pointer-events-none z-10"
                    style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
                  >
                    {swatchLabel}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="text-red-400 text-xs flex items-center gap-1"
          >
            <AlertCircle className="w-3 h-3 flex-shrink-0" />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
