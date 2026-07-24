// src/components/pages/pitch-deck/DeckCard.jsx
// Modules 12 & 13 — Delete Deck (confirmation modal + optimistic UI) + Template Badge Styling

import React, { useState } from 'react';
import { Download, Trash2, X, AlertTriangle } from 'lucide-react';
import { TEMPLATE_COLORS, TEMPLATE_LABELS } from './pitchDeckFormState';

/**
 * Formats an ISO date string to a readable date.
 * e.g. "2025-07-01T14:30:00" → "Jul 1, 2025"
 */
function formatDate(isoString) {
  if (!isoString) return '—';
  return new Date(isoString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * DeckCard
 *
 * Renders one generated pitch deck in the My Decks grid.
 * Handles Module 13 template badge styling and Module 12 delete flow.
 *
 * Props:
 *  @param {object}   deck          — deck object from GET /api/pitch-deck/my-decks
 *  @param {function} onDownload    — called with (deck.id, deck.file_name)
 *  @param {function} onDelete      — called with (deck.id); parent removes card optimistically
 *  @param {boolean}  isDownloading — disables download button while in progress
 */
export default function DeckCard({ deck, onDownload, onDelete, isDownloading = false }) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  // Template badge colours — Module 13
  const badge = TEMPLATE_COLORS[deck.template] ?? { bg: '#1E2761', text: '#F5A623' };
  const templateLabel = TEMPLATE_LABELS[deck.template] ?? deck.template;

  // ── Delete flow ──────────────────────────────────────────────────────────

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await onDelete(deck.id);
      // Parent removes card from local state immediately (optimistic UI).
      // No need to close modal — card will unmount.
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete. Please try again.');
      setIsDeleting(false);
    }
  };

  return (
    <>
      {/* ── Card ────────────────────────────────────────────────────────── */}
      <article
        className="group relative flex flex-col gap-4 rounded-xl p-5 border"
        style={{
          background: 'oklch(12% 0.012 270 / 0.85)',
          borderColor: 'rgba(255,255,255,0.08)',
          transition: 'border-color 200ms ease, box-shadow 200ms ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)';
          e.currentTarget.style.boxShadow = '0 0 0 1px rgba(255,255,255,0.06)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
          e.currentTarget.style.boxShadow = 'none';
        }}
        aria-label={`Pitch deck for ${deck.company_name}`}
      >
        {/* Top row: name + template badge */}
        <div className="flex items-start justify-between gap-3">
          <h3
            className="font-semibold text-base leading-snug text-white"
            style={{ maxWidth: '70%', wordBreak: 'break-word' }}
          >
            {deck.company_name}
          </h3>

          {/* Module 13 — Template badge */}
          <span
            className="shrink-0 px-2.5 py-1 rounded-md text-[11px] font-semibold tracking-wide uppercase"
            style={{
              backgroundColor: badge.bg,
              color: badge.text,
            }}
            aria-label={`Template: ${templateLabel}`}
          >
            {templateLabel}
          </span>
        </div>

        {/* Meta row: date + status */}
        <div className="flex items-center gap-3 text-xs text-white/50">
          <time dateTime={deck.created_at}>{formatDate(deck.created_at)}</time>
          <span aria-hidden="true">·</span>
          {/* Status badge — always "generated" for now */}
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium"
            style={{
              backgroundColor: 'oklch(85% 0.08 147 / 0.15)',
              color: 'oklch(85% 0.08 147)',
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: 'oklch(85% 0.08 147)' }}
              aria-hidden="true"
            />
            {deck.status ?? 'generated'}
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 mt-auto pt-2 border-t border-white/[0.06]">

          {/* Download */}
          <button
            type="button"
            onClick={() => onDownload(deck.id, deck.file_name)}
            disabled={isDownloading}
            className={[
              'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold',
              'border transition-all duration-150',
              isDownloading
                ? 'opacity-40 cursor-not-allowed border-white/10 text-white/40'
                : 'border-white/15 text-white/80 hover:border-white/30 hover:text-white hover:bg-white/[0.04]',
            ].join(' ')}
            aria-label={`Download ${deck.company_name} pitch deck`}
          >
            <Download size={13} aria-hidden="true" />
            Download
          </button>

          {/* Delete — Module 12 */}
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className={[
              'flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold',
              'border transition-all duration-150',
              'border-white/10 text-white/40',
              'hover:border-red-500/40 hover:text-red-400 hover:bg-red-500/[0.06]',
            ].join(' ')}
            aria-label={`Delete ${deck.company_name} pitch deck`}
          >
            <Trash2 size={13} aria-hidden="true" />
          </button>
        </div>
      </article>

      {/* ── Delete confirmation modal — Module 12 ───────────────────── */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-modal-title"
          aria-describedby="delete-modal-desc"
        >
          {/* Scrim */}
          <div
            className="absolute inset-0"
            style={{ backgroundColor: 'rgba(0,0,0,0.72)' }}
            onClick={() => !isDeleting && setShowDeleteModal(false)}
            aria-hidden="true"
          />

          {/* Panel */}
          <div
            className="relative w-full max-w-sm rounded-2xl p-6 flex flex-col gap-5"
            style={{
              background: 'oklch(14% 0.015 270)',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
            }}
          >
            {/* Close button */}
            <button
              type="button"
              onClick={() => !isDeleting && setShowDeleteModal(false)}
              disabled={isDeleting}
              className="absolute top-4 right-4 p-1 rounded-lg text-white/40 hover:text-white transition-colors disabled:opacity-30"
              aria-label="Cancel delete"
            >
              <X size={16} />
            </button>

            {/* Icon + title */}
            <div className="flex flex-col items-center gap-3 text-center">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'rgba(239,68,68,0.12)' }}
                aria-hidden="true"
              >
                <AlertTriangle size={22} className="text-red-400" />
              </div>
              <div>
                <h2
                  id="delete-modal-title"
                  className="text-base font-semibold text-white"
                >
                  Delete this deck?
                </h2>
                <p
                  id="delete-modal-desc"
                  className="mt-1 text-sm text-white/50 leading-relaxed"
                >
                  <strong className="text-white/70">{deck.company_name}</strong> will be
                  permanently removed. This cannot be undone.
                </p>
              </div>
            </div>

            {/* Error */}
            {deleteError && (
              <p
                className="text-center text-xs text-red-400 px-2"
                role="alert"
                aria-live="assertive"
              >
                {deleteError}
              </p>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-white/12 text-white/70 hover:text-white hover:bg-white/[0.04] transition-all duration-150 disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className={[
                  'flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150',
                  isDeleting
                    ? 'opacity-50 cursor-not-allowed text-white/60'
                    : 'text-white hover:opacity-90',
                ].join(' ')}
                style={{
                  background: isDeleting
                    ? 'rgba(239,68,68,0.3)'
                    : 'linear-gradient(135deg, #ef4444, #dc2626)',
                  boxShadow: isDeleting ? 'none' : '0 0 16px rgba(239,68,68,0.3)',
                }}
                aria-busy={isDeleting}
              >
                {isDeleting ? 'Deleting…' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
