// src/components/assistant/SourceCitations.jsx
// Renders grounded answer source documents per the integration guide:
// sources: [{ document_id, title, score }]
// confidence: 'high' | 'medium' | 'low'

import React from 'react';
import { FileText, ChevronRight } from 'lucide-react';

const CONFIDENCE_STYLES = {
  high:   'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  medium: 'bg-amber-500/15   text-amber-400   border-amber-500/25',
  low:    'bg-zinc-500/15    text-[var(--color-dim)] border-zinc-500/25',
};

const CONFIDENCE_LABEL = {
  high:   'High confidence',
  medium: 'Medium confidence',
  low:    'Low confidence',
};

/**
 * @param {{ sources: Array<{ document_id: number, title: string, score: number }>, confidence: string }} props
 */
export default function SourceCitations({ sources, confidence }) {
  if (!sources || sources.length === 0) return null;

  const confKey = (confidence || 'low').toLowerCase();
  const confStyle = CONFIDENCE_STYLES[confKey] || CONFIDENCE_STYLES.low;
  const confLabel = CONFIDENCE_LABEL[confKey] || confidence;

  return (
    <div className="mt-2 space-y-1.5">
      {/* Confidence badge */}
      <span
        className={`inline-flex items-center text-[10px] font-roboto font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${confStyle}`}
        aria-label={`Confidence: ${confLabel}`}
      >
        {confLabel}
      </span>

      {/* Source documents */}
      <div className="space-y-1">
        {sources.map((src) => (
          <button
            key={src.document_id}
            className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-xl bg-[var(--muted)] border border-[var(--border)] hover:border-[var(--border)] hover:bg-[var(--color-panel)] transition-all duration-200 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-void)]"
            aria-label={`Open document: ${src.title}`}
            title="Open referenced document"
          >
            <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/15 shrink-0" aria-hidden="true">
              <FileText size={11} className="text-blue-400" />
            </div>
            <span className="flex-1 text-xs font-roboto text-[var(--color-star)] group-hover:text-[var(--color-star)] truncate transition-colors duration-200">
              {src.title}
            </span>
            <span className="text-[10px] font-roboto text-[var(--color-dim)] shrink-0">
              {Math.round((src.score || 0) * 100)}% match
            </span>
            <ChevronRight size={11} className="text-[var(--color-dim)] group-hover:text-[var(--color-star)] transition-colors shrink-0" aria-hidden="true" />
          </button>
        ))}
      </div>
    </div>
  );
}
