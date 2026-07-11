// src/utils/hooks/useDraft.js
// B5 FIX: platform-wide draft saving hook.
// Saves form state to localStorage on every change and restores it on mount.
// Shows an "unsaved changes" warning if the user tries to close the modal.
import { useState, useEffect, useCallback, useRef } from "react";

const DRAFT_PREFIX = "sf_draft_";
const DRAFT_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * useDraft — auto-saves and restores form state.
 *
 * @param {string} key       Unique key for this form e.g. "create_meeting", "create_post"
 * @param {object} initial   Initial/empty form state
 * @returns {[object, Function, Function, boolean]}
 *   [formState, setFormState, clearDraft, hasDraft]
 *
 * Usage:
 *   const [form, setForm, clearDraft, hasDraft] = useDraft("create_meeting", { title: "", ... });
 *   // On successful submit: clearDraft()
 *   // Pass hasDraft to your modal's onClose handler to warn before discarding
 */
export function useDraft(key, initial) {
  const storageKey = `${DRAFT_PREFIX}${key}`;
  const isDirtyRef = useRef(false);

  // Load saved draft on mount
  const loadDraft = useCallback(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return initial;
      const { data, savedAt } = JSON.parse(raw);
      // Expire stale drafts
      if (Date.now() - savedAt > DRAFT_TTL_MS) {
        localStorage.removeItem(storageKey);
        return initial;
      }
      return { ...initial, ...data };
    } catch {
      return initial;
    }
  }, [storageKey]);

  const [form, setFormState] = useState(() => loadDraft());
  const [hasDraft, setHasDraft] = useState(() => {
    try {
      return !!localStorage.getItem(storageKey);
    } catch { return false; }
  });

  // Save to localStorage on every change
  useEffect(() => {
    // Don't persist the very first render (initial state)
    if (!isDirtyRef.current) {
      isDirtyRef.current = true;
      return;
    }
    try {
      // Only save if form differs from initial (don't persist empty forms)
      const hasContent = Object.entries(form).some(([k, v]) => {
        const init = initial[k];
        if (typeof v === "string") return v.trim() !== (init || "").trim();
        if (Array.isArray(v)) return v.length > 0;
        if (typeof v === "object" && v !== null) return JSON.stringify(v) !== JSON.stringify(init);
        return v !== init;
      });
      if (hasContent) {
        localStorage.setItem(storageKey, JSON.stringify({ data: form, savedAt: Date.now() }));
        setHasDraft(true);
      }
    } catch {}
  }, [form, storageKey]);

  const setForm = useCallback((updater) => {
    setFormState(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      return next;
    });
  }, []);

  const clearDraft = useCallback(() => {
    try { localStorage.removeItem(storageKey); } catch {}
    setHasDraft(false);
    isDirtyRef.current = false;
    setFormState(initial);
  }, [storageKey, initial]);

  return [form, setForm, clearDraft, hasDraft];
}

/**
 * useModalDraftGuard — warns the user before closing a modal with unsaved changes.
 *
 * @param {boolean} hasDraft   Whether there is unsaved content
 * @param {Function} onClose   The modal's onClose callback
 * @returns {Function}         Safe close handler to use instead of raw onClose
 *
 * Usage:
 *   const safeClose = useModalDraftGuard(hasDraft, onClose);
 *   // Use safeClose wherever you'd call onClose (X button, backdrop click)
 */
export function useModalDraftGuard(hasDraft, onClose) {
  return useCallback(() => {
    if (!hasDraft) { onClose(); return; }
    const confirmed = window.confirm(
      "You have unsaved changes. Close anyway?\n\nYour draft will be saved and restored next time you open this form."
    );
    if (confirmed) onClose();
    // If not confirmed, draft stays in localStorage and form stays open
  }, [hasDraft, onClose]);
}

export default useDraft;