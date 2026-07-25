import React, { useState, useEffect } from "react";
import { Link, Plus, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const MAX_URLS = 10;
const URL_RE = /^https?:\/\/.+/;

function getDomain(url) {
  try { return new URL(url).hostname; }
  catch { return ""; }
}

export default function UrlInput({ urls = [], onAdd }) {
  const [inputVal, setInputVal] = useState("");
  const [error, setError] = useState("");
  const [previewDomain, setPreviewDomain] = useState("");

  // Update favicon preview as user types a valid URL
  useEffect(() => {
    const trimmed = inputVal.trim();
    if (URL_RE.test(trimmed)) {
      setPreviewDomain(getDomain(trimmed));
    } else {
      setPreviewDomain("");
    }
  }, [inputVal]);

  const validate = (val) => {
    const trimmed = val.trim();
    if (!trimmed) { setError("Please enter a URL."); return null; }
    if (!URL_RE.test(trimmed)) { setError("Must start with http:// or https://"); return null; }
    if (urls.includes(trimmed)) { setError("URL already in list."); return null; }
    if (urls.length >= MAX_URLS) { setError(`Maximum ${MAX_URLS} URLs reached.`); return null; }
    setError("");
    return trimmed;
  };

  const handleAdd = () => {
    const valid = validate(inputVal);
    if (valid) { onAdd?.(valid); setInputVal(""); setPreviewDomain(""); }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") { e.preventDefault(); handleAdd(); }
  };

  const atMax = urls.length >= MAX_URLS;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label htmlFor="url-input-field" className="text-xs font-semibold uppercase tracking-widest text-slate-400">
          Add Reference URL
        </label>
        <span className={`text-xs font-mono tabular-nums ${
          atMax ? "text-red-400" : urls.length >= 8 ? "text-amber-400" : "text-slate-500"
        }`}>
          {urls.length}/{MAX_URLS} URLs
        </span>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          {/* Favicon or link icon prefix */}
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <AnimatePresence mode="wait">
              {previewDomain ? (
                <motion.img
                  key={previewDomain}
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  transition={{ duration: 0.15 }}
                  src={`https://www.google.com/s2/favicons?sz=32&domain=${previewDomain}`}
                  className="w-4 h-4 rounded-sm"
                  alt=""
                  onError={(e) => { e.target.style.display = "none"; }}
                />
              ) : (
                <motion.div key="icon" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <Link className="w-4 h-4 text-slate-500" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <input
            id="url-input-field"
            type="url"
            value={inputVal}
            onChange={(e) => { setInputVal(e.target.value); if (error) setError(""); }}
            onKeyDown={handleKeyDown}
            disabled={atMax}
            placeholder={atMax ? `Maximum ${MAX_URLS} URLs reached.` : "https://example.com"}
            aria-label="Reference URL"
            aria-describedby={error ? "url-input-error" : undefined}
            className={`w-full pl-9 pr-3 py-2.5 rounded-lg border text-sm text-slate-100
                        bg-white/5 placeholder-slate-600 outline-none transition-all
                        disabled:cursor-not-allowed disabled:text-slate-600 disabled:placeholder-slate-700
                        hover:border-white/20 focus:ring-2
                        ${error
                          ? "border-red-500/60 focus:ring-red-500/20 focus:border-red-500/60"
                          : "border-white/10 focus:border-violet-500/60 focus:ring-violet-500/20"
                        }`}
          />
        </div>

        {/* Gradient Add button */}
        <button
          type="button"
          onClick={handleAdd}
          disabled={atMax}
          aria-label="Add URL"
          className="relative overflow-hidden px-4 py-2.5 rounded-lg text-white text-sm font-semibold
                     disabled:opacity-30 disabled:cursor-not-allowed
                     transition-all duration-150 active:scale-95 focus:outline-none focus:ring-2
                     focus:ring-violet-500/60 flex items-center gap-1.5 whitespace-nowrap group"
          style={{
            background: atMax
              ? "rgba(255,255,255,0.05)"
              : "linear-gradient(135deg, #7c3aed, #a855f7)",
            boxShadow: atMax ? "none" : "0 0 12px rgba(124,58,237,0.4)",
          }}
        >
          {/* Shine effect */}
          {!atMax && (
            <span
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
              style={{
                background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)",
              }}
            />
          )}
          <Plus className="w-4 h-4 relative z-10" />
          <span className="relative z-10">Add URL</span>
        </button>
      </div>

      <AnimatePresence>
        {error && (
          <motion.p
            id="url-input-error"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="text-red-400 text-xs flex items-center gap-1"
            role="alert"
          >
            <AlertCircle className="w-3 h-3 flex-shrink-0" />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
