/**
 * SchemaViewer — Task 16: Schema Viewer
 *
 * Read-only SQL viewer with syntax highlighting (react-syntax-highlighter,
 * already in package.json) and a clipboard copy button.
 */

import React, { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Database, Copy, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion"; // eslint-disable-line no-unused-vars

export default function SchemaViewer({ sql = "" }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(sql);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable — fail silently
    }
  };

  return (
    <div className="space-y-4">
      {/* Section header — matches BrandingForm / other WebsiteGenerator headers */}
      <div className="flex items-center gap-3 pb-4 border-b border-white/5">
        <div className="w-9 h-9 rounded-xl bg-violet-500/15 flex items-center justify-center flex-shrink-0">
          <Database className="w-4 h-4 text-violet-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-white">Database Schema</h3>
          <p className="text-xs text-slate-500">Task 16 · Read-only SQL</p>
        </div>

        {/* Copy button */}
        <button
          id="schema-copy-btn"
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10
                     bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/20
                     text-xs font-medium text-slate-400 hover:text-slate-200
                     transition-all duration-200 flex-shrink-0"
        >
          <AnimatePresence mode="wait">
            {copied ? (
              <motion.span
                key="check"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-1.5 text-green-400"
              >
                <Check className="w-3.5 h-3.5" />
                Copied!
              </motion.span>
            ) : (
              <motion.span
                key="copy"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                Copy
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* SQL code block */}
      <div className="rounded-xl overflow-hidden border border-white/8">
        <SyntaxHighlighter
          language="sql"
          style={oneDark}
          showLineNumbers
          customStyle={{
            margin: 0,
            padding: "1.25rem",
            background: "rgba(0,0,0,0.5)",
            fontSize: "0.75rem",
            lineHeight: "1.65",
            borderRadius: 0,
          }}
          lineNumberStyle={{
            color: "rgba(255,255,255,0.15)",
            minWidth: "2.5em",
          }}
        >
          {sql}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
