import React, { useEffect, useRef, useState } from 'react';
import { Check, Pencil, Plus, X } from 'lucide-react';
import { CosmosButton, Tag } from '@/components/cosmos';

/**
 * Edit-in-place for a single profile field.
 *
 * Chosen over one big form deliberately: the schema has 56 fields, and the
 * assistant fills most of them. What people actually do here is *correct one
 * thing* — a wrong job title, a missing skill — so making them open a modal,
 * scroll to a section and hit Save for a one-word change is the wrong shape.
 * A pencil per field means the edit is where the mistake is.
 *
 * Enter commits, Escape cancels, blur commits. Multi-line fields use
 * Ctrl/Cmd+Enter to commit so Enter can still make a paragraph.
 *
 * `onSave(key, value)` should persist a single field. Failures re-open the
 * editor with the value intact rather than silently dropping the edit.
 */
export function InlineField({ field, value, onSave, canEdit = true, children }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => { setDraft(value ?? ''); }, [value]);
  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);

  const readOnly = !canEdit || field.aiFill === 'derived';

  const commit = async () => {
    if (saving) return;
    const next = normalise(field, draft);

    if (JSON.stringify(next) === JSON.stringify(value ?? emptyFor(field))) {
      setEditing(false);
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await onSave?.(field.key, next);
      setEditing(false);
    } catch (e) {
      setError(e?.message || 'Could not save');
    } finally {
      setSaving(false);
    }
  };

  const cancel = () => {
    setDraft(value ?? '');
    setError(null);
    setEditing(false);
  };

  if (readOnly) return <>{children}</>;

  if (!editing) {
    return (
      <div className="group/field relative">
        {children}
        <button
          type="button"
          onClick={() => setEditing(true)}
          aria-label={`Edit ${field.label}`}
          className="absolute -top-6 right-0 p-1 rounded-md text-dim opacity-0 group-hover/field:opacity-100 focus-visible:opacity-100 hover:text-gold hover:bg-gold/10 transition-all"
        >
          <Pencil size={12} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 py-1">
      <Editor
        field={field}
        draft={draft}
        setDraft={setDraft}
        inputRef={inputRef}
        onCommit={commit}
        onCancel={cancel}
      />

      {error && <p className="text-[0.8rem] text-red-400">{error}</p>}

      <div className="flex items-center gap-2">
        <CosmosButton variant="primary" size="sm" onClick={commit} disabled={saving}>
          <Check size={12} /> {saving ? 'Saving…' : 'Save'}
        </CosmosButton>
        <CosmosButton variant="quiet" size="sm" onClick={cancel}>
          <X size={12} /> Cancel
        </CosmosButton>
        <span className="font-mono text-[9.5px] tracking-[0.14em] uppercase text-dim">
          {field.type === 'longtext' ? '⌘↵ to save' : '↵ to save'}
        </span>
      </div>
    </div>
  );
}

function emptyFor(field) {
  if (field.type === 'tags' || field.type === 'multiselect' || field.type === 'list') return [];
  if (field.type === 'boolean') return false;
  return '';
}

/** Turn the raw editor value into the shape the API expects. */
function normalise(field, draft) {
  if (field.type === 'tags' || field.type === 'multiselect' || field.type === 'list') {
    if (Array.isArray(draft)) return draft;
    return String(draft).split(',').map((s) => s.trim()).filter(Boolean);
  }
  if (field.type === 'number') return draft === '' ? null : Number(draft);
  if (field.type === 'boolean') return Boolean(draft);
  return typeof draft === 'string' ? draft.trim() : draft;
}

const INPUT =
  'w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-gold/40 text-[0.92rem] text-star ' +
  'placeholder-dim focus:outline-none focus:border-gold';

function Editor({ field, draft, setDraft, inputRef, onCommit, onCancel }) {
  const keyHandler = (e) => {
    if (e.key === 'Escape') { e.preventDefault(); onCancel(); }
    if (e.key === 'Enter') {
      const multiline = field.type === 'longtext';
      if (!multiline || e.metaKey || e.ctrlKey) { e.preventDefault(); onCommit(); }
    }
  };

  if (field.type === 'longtext') {
    return (
      <textarea
        ref={inputRef}
        value={draft}
        rows={4}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={keyHandler}
        placeholder={field.hint}
        className={`${INPUT} resize-y`}
      />
    );
  }

  if (field.type === 'select') {
    return (
      <select
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={keyHandler}
        className={INPUT}
      >
        <option value="">Not set</option>
        {(field.options || []).map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    );
  }

  if (field.type === 'multiselect') {
    const chosen = Array.isArray(draft) ? draft : String(draft).split(',').filter(Boolean);
    const toggle = (o) =>
      setDraft(chosen.includes(o) ? chosen.filter((c) => c !== o) : [...chosen, o]);

    return (
      <div className="flex flex-wrap gap-1.5">
        {(field.options || []).map((o) => (
          <button
            key={o}
            type="button"
            onClick={() => toggle(o)}
            className={`text-[0.82rem] px-2.5 py-1 rounded-full border transition-colors ${
              chosen.includes(o)
                ? 'border-gold/60 text-gold bg-gold/10'
                : 'border-white/10 text-dim hover:text-star'
            }`}
          >
            {chosen.includes(o) && <Check size={10} className="inline mr-1" />}
            {o}
          </button>
        ))}
      </div>
    );
  }

  if (field.type === 'tags') {
    return <TagEditor draft={draft} setDraft={setDraft} inputRef={inputRef} onCancel={onCancel} hint={field.hint} />;
  }

  if (field.type === 'boolean') {
    return (
      <div className="flex items-center gap-1 p-1 rounded-full bg-white/[0.05] border border-gold/40 w-fit">
        {[['Yes', true], ['No', false]].map(([label, v]) => (
          <button
            key={label}
            type="button"
            onClick={() => setDraft(v)}
            className={`font-mono text-[10px] tracking-[0.14em] uppercase px-3 py-1.5 rounded-full transition-colors ${
              Boolean(draft) === v ? 'bg-gold/15 text-gold' : 'text-dim hover:text-star'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <input
      ref={inputRef}
      type={field.type === 'number' ? 'number' : field.type === 'url' ? 'url' : 'text'}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onKeyDown={keyHandler}
      placeholder={field.hint}
      className={INPUT}
    />
  );
}

/** Chip editor — Enter adds, Backspace on empty removes the last. */
function TagEditor({ draft, setDraft, inputRef, onCancel, hint }) {
  const tags = Array.isArray(draft) ? draft : String(draft).split(',').map((s) => s.trim()).filter(Boolean);
  const [entry, setEntry] = useState('');

  const add = () => {
    const t = entry.trim();
    if (t && !tags.includes(t)) setDraft([...tags, t]);
    setEntry('');
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-xl bg-white/[0.05] border border-gold/40">
      {tags.map((t) => (
        <Tag key={t} tone="accent">
          {t}
          <button type="button" onClick={() => setDraft(tags.filter((x) => x !== t))} aria-label={`Remove ${t}`}>
            <X size={10} />
          </button>
        </Tag>
      ))}
      <input
        ref={inputRef}
        value={entry}
        onChange={(e) => setEntry(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') { e.preventDefault(); add(); }
          if (e.key === 'Escape') { e.preventDefault(); onCancel(); }
          if (e.key === 'Backspace' && !entry && tags.length) setDraft(tags.slice(0, -1));
        }}
        placeholder={hint || 'Add…'}
        className="flex-1 min-w-[110px] bg-transparent text-[0.88rem] text-star placeholder-dim focus:outline-none px-1"
      />
      {entry && (
        <button type="button" onClick={add} className="p-1 text-gold" aria-label="Add tag">
          <Plus size={12} />
        </button>
      )}
    </div>
  );
}

export default InlineField;
