import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ExternalLink, X, Link } from "lucide-react";

const MAX_URLS = 10;

function getDomain(url) {
  try { return new URL(url).hostname; }
  catch { return ""; }
}

export default function UrlList({ urls = [], onRemove }) {
  return (
    <div className="space-y-2">
      {urls.length > 0 && (
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">
            Added URLs
          </span>
          <span className={`text-xs font-mono tabular-nums ${
            urls.length >= MAX_URLS ? "text-red-400" : urls.length >= 8 ? "text-amber-400" : "text-slate-600"
          }`}>
            {urls.length}/{MAX_URLS}
          </span>
        </div>
      )}

      <ul className="space-y-2" role="list" aria-label="Reference URL list">
        <AnimatePresence mode="popLayout" initial={false}>
          {urls.length === 0 && (
            <motion.li
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-20 rounded-xl border border-dashed border-white/8 text-slate-600 text-xs gap-1"
            >
              <Link className="w-4 h-4 opacity-40" />
              No reference URLs added yet.
            </motion.li>
          )}

          {urls.map((url, idx) => {
            const domain = getDomain(url);
            return (
              <motion.li
                key={url}
                layout
                initial={{ opacity: 0, y: -8, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -8, height: 0, marginTop: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 35 }}
                className="overflow-hidden"
              >
                <div
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl
                               border border-white/6 bg-white/[0.025] hover:border-white/12 hover:bg-white/5
                               transition-all duration-150 group"
                >
                  {/* Favicon */}
                  <div className="flex-shrink-0 w-6 h-6 rounded-md bg-white/8 flex items-center justify-center overflow-hidden">
                    {domain ? (
                      <img
                        src={`https://www.google.com/s2/favicons?sz=32&domain=${domain}`}
                        className="w-4 h-4"
                        alt=""
                        onError={(e) => { e.target.style.display = "none"; }}
                      />
                    ) : (
                      <Link className="w-3 h-3 text-slate-500" />
                    )}
                  </div>

                  {/* Domain + full URL */}
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-slate-300 truncate">{domain || url}</div>
                    <div className="text-[10px] text-slate-600 truncate font-mono">{url}</div>
                  </div>

                  {/* Number badge */}
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-white/8 text-[9px] font-bold
                                    text-slate-500 flex items-center justify-center tabular-nums">
                    {idx + 1}
                  </span>

                  {/* External link */}
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Open ${url} in new tab`}
                    className="flex-shrink-0 text-slate-600 hover:text-violet-400 transition-colors
                               opacity-0 group-hover:opacity-100"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  {/* Delete */}
                  <button
                    type="button"
                    onClick={() => onRemove?.(idx)}
                    aria-label={`Remove URL: ${url}`}
                    className="flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center
                               text-slate-600 hover:text-red-400 hover:bg-red-500/10
                               opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>
    </div>
  );
}
