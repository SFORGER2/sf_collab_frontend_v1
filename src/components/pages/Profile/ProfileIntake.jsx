import React, { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Check, FileText, Loader2, Sparkles, Upload, Wand2, X,
} from 'lucide-react';
import { toast } from 'react-toastify';
import {
  AUTO_FILLABLE, FIELDS_BY_KEY, missingUserInput, profileCompleteness,
} from '@/services/profile/profileSchema';
import { CosmosButton, Eyebrow, Panel, ProgressRail, Tag } from '@/components/cosmos';
import { Field, Notice, Select, TextArea, TextInput } from './profileSettings/SettingsUI';

/**
 * Profile intake — ask once, then let the assistant do the rest.
 *
 * Matchmaking, discovery and every AI surface in the app are only as good as
 * what they know about you, and almost nobody fills in 56 fields by hand. So
 * this asks for the small number of things only a person can answer, and takes
 * a CV or portfolio link for everything else.
 *
 * The order matters: upload first, questions second. Once the CV is parsed most
 * of the questions are already answered, and being asked something the system
 * could have read is the fastest way to make someone abandon a form.
 *
 * Every extracted field is shown before it is saved. Silently writing inferred
 * data into someone's profile is how you end up with confident nonsense on a
 * public page they never checked.
 *
 * NOTE FOR BACKEND: needs
 *   POST /api/profile/parse-cv  (multipart: file)  → { fields: { key: value }, confidence }
 *   POST /api/profile/enrich    { links: [...] }   → same shape
 *   POST /api/profile/autofill  { fields }         → persists the accepted set
 * Parsing must happen server-side; the file should never go to a third party
 * without an explicit consent step.
 */

const ACCEPTS = '.pdf,.doc,.docx,.txt,.rtf';
const MAX_MB = 8;

export default function ProfileIntake({ profile = {}, onSave, onDismiss }) {
  const fileRef = useRef(null);
  const [file, setFile] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [extracted, setExtracted] = useState(null);
  const [rejected, setRejected] = useState(() => new Set());
  const [links, setLinks] = useState({ linkedin: '', github: '', portfolio: '' });
  const [answers, setAnswers] = useState({});
  const [saving, setSaving] = useState(false);

  const completeness = profileCompleteness(profile);

  // Only ask what genuinely can't be inferred, and cap it — a wall of
  // questions is the thing people close.
  const asks = useMemo(() => missingUserInput(profile).slice(0, 6), [profile]);

  const pickFile = (f) => {
    if (!f) return;
    if (f.size > MAX_MB * 1024 * 1024) {
      toast.error(`That file is over ${MAX_MB}MB`);
      return;
    }
    setFile(f);
  };

  const parse = async () => {
    if (!file && !Object.values(links).some(Boolean)) {
      toast.error('Add a CV or at least one link first');
      return;
    }
    setParsing(true);
    try {
      const fd = new FormData();
      if (file) fd.append('file', file);
      Object.entries(links).forEach(([k, v]) => v && fd.append(k, v));

      const res = await fetch('/api/profile/parse-cv', { method: 'POST', body: fd });
      if (!res.ok) throw new Error(String(res.status));
      const body = await res.json();
      const fields = body?.data?.fields || body?.fields;
      if (!fields || !Object.keys(fields).length) throw new Error('nothing extracted');

      setExtracted(fields);
      setRejected(new Set());
      toast.success(`Found ${Object.keys(fields).length} things`);
    } catch {
      // The endpoint doesn't exist yet in most environments. Say so plainly
      // rather than faking an extraction — invented profile data is worse than
      // an empty profile.
      toast.info('CV parsing needs the backend endpoint — see the note in this file');
      setExtracted(null);
    } finally {
      setParsing(false);
    }
  };

  const accepted = useMemo(() => {
    if (!extracted) return {};
    return Object.fromEntries(Object.entries(extracted).filter(([k]) => !rejected.has(k)));
  }, [extracted, rejected]);

  const save = async () => {
    const payload = { ...accepted, ...answers };
    if (!Object.keys(payload).length) {
      toast.error('Nothing to save yet');
      return;
    }
    setSaving(true);
    try {
      await onSave?.(payload);
      toast.success('Profile updated');
    } catch (e) {
      toast.error(e?.message || 'Could not save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <Panel className="cosmos-panel-neon p-6" accent="#8b6cff">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
          <div className="min-w-0">
            <Eyebrow>Finish your profile</Eyebrow>
            <h2 className="font-display text-[1.35rem] text-star mt-1.5">
              Answer a few things. The assistant does the rest.
            </h2>
            <p className="text-[0.88rem] text-dim mt-1.5 max-w-[58ch]">
              A fuller profile means better matches, better AI output, and the right people
              finding you. Upload a CV and most of it fills itself in.
            </p>
          </div>
          {onDismiss && (
            <button
              type="button"
              onClick={onDismiss}
              aria-label="Dismiss"
              className="p-1.5 rounded-lg text-dim hover:text-star hover:bg-white/[0.06] transition-colors shrink-0"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <ProgressRail label="Profile completeness" value={completeness} />
      </Panel>

      {/* 1 — Upload */}
      <Panel className="p-6" accent="#4fd8ff" style={{ '--field-accent': '#4fd8ff' }}>
        <Eyebrow className="mb-1">Step one · Upload</Eyebrow>
        <p className="text-[0.85rem] text-dim mb-4">
          A CV, résumé or portfolio. The assistant reads it and proposes what to fill in —
          you approve each item before anything is saved.
        </p>

        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); pickFile(e.dataTransfer.files?.[0]); }}
          className="rounded-xl border border-dashed border-white/15 bg-white/[0.02] p-6 text-center transition-colors hover:border-cyan/40"
        >
          {file ? (
            <div className="flex flex-wrap items-center justify-center gap-3">
              <FileText size={18} className="text-cyan" />
              <span className="text-[0.9rem] text-star">{file.name}</span>
              <span className="font-mono text-[10px] text-dim">
                {(file.size / 1024 / 1024).toFixed(1)}MB
              </span>
              <button
                type="button"
                onClick={() => setFile(null)}
                className="text-dim hover:text-star transition-colors"
                aria-label="Remove file"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <>
              <Upload size={20} className="mx-auto text-dim mb-2.5" />
              <p className="text-[0.88rem] text-star">Drop a file here, or</p>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="text-[0.88rem] text-gold hover:text-star transition-colors underline underline-offset-2"
              >
                choose one
              </button>
              <p className="font-mono text-[9.5px] tracking-[0.12em] uppercase text-dim mt-2">
                PDF, DOC, DOCX or TXT · up to {MAX_MB}MB
              </p>
            </>
          )}
          <input
            ref={fileRef}
            type="file"
            accept={ACCEPTS}
            className="hidden"
            onChange={(e) => pickFile(e.target.files?.[0])}
          />
        </div>

        <div className="grid gap-3 mt-4 [grid-template-columns:repeat(auto-fit,minmax(190px,1fr))]">
          <Field label="LinkedIn">
            <TextInput
              value={links.linkedin}
              placeholder="linkedin.com/in/…"
              onChange={(e) => setLinks((l) => ({ ...l, linkedin: e.target.value }))}
            />
          </Field>
          <Field label="GitHub">
            <TextInput
              value={links.github}
              placeholder="github.com/…"
              onChange={(e) => setLinks((l) => ({ ...l, github: e.target.value }))}
            />
          </Field>
          <Field label="Portfolio">
            <TextInput
              value={links.portfolio}
              placeholder="yoursite.com"
              onChange={(e) => setLinks((l) => ({ ...l, portfolio: e.target.value }))}
            />
          </Field>
        </div>

        <div className="flex flex-wrap items-center gap-3 mt-4">
          <CosmosButton variant="ai" size="sm" onClick={parse} disabled={parsing}>
            {parsing ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
            {parsing ? 'Reading…' : 'Read this and fill my profile'}
          </CosmosButton>
          <span className="text-[0.78rem] text-dim">
            {AUTO_FILLABLE.length} fields can be filled this way.
          </span>
        </div>
      </Panel>

      {/* 2 — Review what was found */}
      {extracted && (
        <Panel className="p-6" accent="#3ee6a0">
          <div className="flex flex-wrap items-baseline justify-between gap-3 mb-1">
            <Eyebrow>Step two · Review</Eyebrow>
            <span className="font-mono text-[10px] tracking-[0.12em] uppercase text-dim">
              {Object.keys(accepted).length} of {Object.keys(extracted).length} accepted
            </span>
          </div>
          <p className="text-[0.85rem] text-dim mb-4">
            Nothing is saved until you say so. Uncheck anything that’s wrong.
          </p>

          <div className="flex flex-col gap-1.5">
            {Object.entries(extracted).map(([key, value]) => {
              const field = FIELDS_BY_KEY[key];
              const isRejected = rejected.has(key);
              return (
                <label
                  key={key}
                  className="flex items-start gap-3 p-2.5 rounded-xl border border-white/[0.07] hover:bg-white/[0.03] cursor-pointer transition-colors"
                  style={isRejected ? { opacity: 0.45 } : undefined}
                >
                  <input
                    type="checkbox"
                    checked={!isRejected}
                    onChange={() =>
                      setRejected((r) => {
                        const next = new Set(r);
                        next.has(key) ? next.delete(key) : next.add(key);
                        return next;
                      })
                    }
                    className="mt-1 accent-emerald-400"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="cosmos-stat-label block">{field?.label || key}</span>
                    <span className="block text-[0.88rem] text-star mt-0.5 break-words">
                      {Array.isArray(value) ? value.join(', ') : String(value)}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        </Panel>
      )}

      {/* 3 — Only you can answer these */}
      {asks.length > 0 && (
        <Panel className="p-6" accent="#ffbf5e" style={{ '--field-accent': '#ffbf5e' }}>
          <Eyebrow className="mb-1">Step three · Only you know these</Eyebrow>
          <p className="text-[0.85rem] text-dim mb-4">
            Nothing here can be read off a CV — it’s about what you want, not what you’ve done.
          </p>

          <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
            {asks.map((f) => (
              <Field key={f.key} label={f.label} hint={f.hint}>
                {f.type === 'select' ? (
                  <Select
                    value={answers[f.key] || ''}
                    onChange={(e) => setAnswers((a) => ({ ...a, [f.key]: e.target.value }))}
                    options={f.options || []}
                  />
                ) : f.type === 'longtext' ? (
                  <TextArea
                    rows={3}
                    value={answers[f.key] || ''}
                    placeholder={f.hint}
                    onChange={(e) => setAnswers((a) => ({ ...a, [f.key]: e.target.value }))}
                  />
                ) : (
                  <TextInput
                    value={answers[f.key] || ''}
                    placeholder={f.hint}
                    onChange={(e) => setAnswers((a) => ({ ...a, [f.key]: e.target.value }))}
                  />
                )}
              </Field>
            ))}
          </div>
        </Panel>
      )}

      <Panel className="p-5">
        <div className="flex flex-wrap items-center gap-3">
          <Notice tone="info">
            Your CV is used to fill your profile and is never shown publicly.
          </Notice>
          <span className="flex-1" />
          <CosmosButton variant="quiet" size="sm" asChild>
            <Link to="/user-profile">Skip for now</Link>
          </CosmosButton>
          <CosmosButton variant="primary" size="sm" onClick={save} disabled={saving}>
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            {saving ? 'Saving…' : 'Save to my profile'}
          </CosmosButton>
        </div>
      </Panel>
    </div>
  );
}
