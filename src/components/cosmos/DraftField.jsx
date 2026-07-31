import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Check, RotateCcw, Save, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { CosmosButton } from './CosmosButton';

const PREFIX = 'sfc.draft.';

/**
 * A text field that never loses your work.
 *
 * Typing autosaves to a local draft. Clicking away with unsaved changes prompts
 * you rather than silently discarding — which is the behaviour people expect
 * from anything that looks like a document, and the absence of which is how
 * written work gets lost.
 *
 *   <DraftField draftKey="vision-123-problem" label="The problem"
 *               value={value} onSave={next => …} onChange={next => …} multiline />
 *
 * A recovered draft is offered on mount if one is newer than the saved value,
 * so a closed tab or a crash doesn't cost anything.
 *
 * NOTE: drafts persist to localStorage keyed by `draftKey`. Use a key that is
 * stable per field per record (include the record id), or two records will
 * share one draft.
 */
export function DraftField({
  draftKey,
  label,
  value = '',
  onSave,
  onChange,
  onDiscard,
  placeholder,
  multiline = false,
  rows = 4,
  className,
  autoSaveMs = 800,
}) {
  const storageKey = PREFIX + draftKey;

  const [text, setText] = useState(value);
  const [saved, setSaved] = useState(value);
  const [status, setStatus] = useState('idle'); // idle | drafting | saved
  const [prompt, setPrompt] = useState(false);
  const [recovered, setRecovered] = useState(null);

  const timer = useRef(null);
  const wrapRef = useRef(null);

  const dirty = text !== saved;

  // Sync with parent value changes
  useEffect(() => {
    if (value !== saved && !dirty) {
      setText(value);
      setSaved(value);
    }
  }, [value, saved, dirty]);

  // Offer any draft left behind by a previous session.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;
      const draft = JSON.parse(raw);
      if (draft?.text && draft.text !== value) setRecovered(draft);
    } catch {
      /* ignore malformed drafts */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  const writeDraft = useCallback(
    (next) => {
      try {
        localStorage.setItem(storageKey, JSON.stringify({ text: next, at: Date.now() }));
      } catch {
        /* storage full — the in-memory value is still correct */
      }
    },
    [storageKey]
  );

  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
    } catch {
      /* noop */
    }
  }, [storageKey]);

  const handleChange = (e) => {
    const next = e.target.value;
    setText(next);
    setStatus('drafting');
    
    // Call onChange immediately for real-time parent state updates
    onChange?.(next);

    clearTimeout(timer.current);
    timer.current = setTimeout(() => writeDraft(next), autoSaveMs);
  };

  const commit = () => {
    clearTimeout(timer.current);
    setSaved(text);
    setStatus('saved');
    clearDraft();
    setPrompt(false);
    onSave?.(text);
    setTimeout(() => setStatus('idle'), 1600);
  };

  const discard = () => {
    clearTimeout(timer.current);
    setText(saved);
    setStatus('idle');
    clearDraft();
    setPrompt(false);
    // Update parent state to the last saved value
    onChange?.(saved);
    onDiscard?.();
  };

  // Clicking outside with unsaved changes raises the prompt.
  const handleBlur = (e) => {
    // Don't re-prompt if prompt is already visible
    if (prompt) return;
    if (wrapRef.current?.contains(e.relatedTarget)) return;
    if (dirty) setPrompt(true);
  };

  // Warn on tab close too — the same work is at stake.
  useEffect(() => {
    if (!dirty) return undefined;
    const warn = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const Field = multiline ? 'textarea' : 'input';

  return (
    <div ref={wrapRef} className={cn('flex flex-col gap-1.5', className)} onBlur={handleBlur}>
      {(label || status !== 'idle') && (
        <div className="flex items-center justify-between gap-3">
          {label && <span className="cosmos-stat-label">{label}</span>}
          {status === 'drafting' && (
            <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-gold">
              Draft saved
            </span>
          )}
          {status === 'saved' && (
            <span className="flex items-center gap-1 font-mono text-[10px] tracking-[0.14em] uppercase text-emerald-400">
              <Check size={11} /> Saved
            </span>
          )}
        </div>
      )}

      {recovered && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-2.5 p-3 sm:p-3.5 rounded-xl border border-gold/30 bg-gold/[0.06]">
          <div className="flex items-start gap-2 sm:flex-1 sm:min-w-0">
            <RotateCcw size={14} className="text-gold shrink-0 mt-0.5" />
            <span className="text-[0.82rem] sm:text-[0.85rem] text-star leading-snug">
              You have an unsaved draft from a previous session.
            </span>
          </div>
          <div className="flex gap-2 sm:shrink-0">
            <CosmosButton
              variant="quiet"
              size="sm"
              onClick={() => {
                setText(recovered.text);
                setRecovered(null);
              }}
              className="justify-center flex-1 xs:flex-none"
            >
              Restore
            </CosmosButton>
            <CosmosButton
              variant="quiet"
              size="sm"
              onClick={() => {
                clearDraft();
                setRecovered(null);
              }}
              className="justify-center flex-1 xs:flex-none"
            >
              Discard
            </CosmosButton>
          </div>
        </div>
      )}

      <Field
        value={text}
        onChange={handleChange}
        placeholder={placeholder}
        rows={multiline ? rows : undefined}
        className={cn(
          'w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border text-[0.95rem] text-star',
          'placeholder-dim transition-colors focus:outline-none resize-y',
          dirty ? 'border-gold/45' : 'border-white/10 focus:border-cyan'
        )}
      />

      {prompt && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-2.5 p-3 sm:p-3.5 rounded-xl border border-gold/35 bg-gold/[0.07]">
          <span className="text-[0.85rem] sm:text-[0.88rem] text-star leading-snug sm:flex-1 sm:min-w-0">
            You have unsaved changes. Keep them?
          </span>
          <div className="flex flex-col xs:flex-row gap-2 sm:gap-2 sm:shrink-0">
            <CosmosButton 
              variant="primary" 
              size="sm" 
              onClick={commit} 
              className="justify-center xs:w-auto"
            >
              <Save size={13} /> Save
            </CosmosButton>
            <CosmosButton 
              variant="quiet" 
              size="sm" 
              onClick={() => setPrompt(false)} 
              className="justify-center xs:w-auto whitespace-nowrap"
            >
              Keep editing
            </CosmosButton>
            <CosmosButton 
              variant="quiet" 
              size="sm" 
              onClick={discard} 
              className="justify-center xs:w-auto"
            >
              <X size={13} /> Discard
            </CosmosButton>
          </div>
        </div>
      )}
    </div>
  );
}

export default DraftField;
