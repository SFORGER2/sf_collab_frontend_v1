import React, { useMemo, useState } from 'react';
import { Check, ChevronDown, Lock, Sparkles, Wand2 } from 'lucide-react';
import { CosmosButton, Eyebrow, Panel, ProgressRail, Tag } from '@/components/cosmos';
import InlineField from './InlineField';
import {
  FIELD_GROUPS, groupCompleteness, missingUserInput, profileCompleteness,
  suggestedAutoFills,
} from '@/services/profile/profileSchema';

/**
 * The full profile.
 *
 * Renders every field in the schema, grouped, with per-group completeness — so
 * it is obvious what is missing and who can fill it. Fields the assistant can
 * source itself are marked; fields only the person can answer are separated out,
 * because asking someone to type what we could infer is the fastest way to make
 * them abandon a profile.
 *
 * Derived groups (reputation) are read-only by construction — you earn those.
 *
 * NOTE FOR BACKEND: needs the full profile object keyed by the schema's wire
 * names, plus `POST /api/profile/autofill { fields: [...] }` for the assistant
 * pass. Until then the "Let the assistant fill this" button dispatches the
 * assistant-open event so the flow is reviewable.
 */
export default function ProfileDetail({ profile = {}, isOwner = false, onFieldSave }) {
  const [openGroups, setOpenGroups] = useState(() => ({ identity: true, skills: true }));

  // Local overlay of saved edits, so a field updates the moment it is saved
  // rather than waiting for the parent to refetch.
  const [edits, setEdits] = useState({});
  const merged = useMemo(() => ({ ...profile, ...edits }), [profile, edits]);

  const overall = useMemo(() => profileCompleteness(merged), [merged]);
  const autoFills = useMemo(() => suggestedAutoFills(merged), [merged]);
  const asks = useMemo(() => missingUserInput(merged), [merged]);

  const toggle = (id) => setOpenGroups((g) => ({ ...g, [id]: !g[id] }));

  const handleSave = async (key, value) => {
    // Optimistic — InlineField re-opens with the draft intact if this throws.
    setEdits((e) => ({ ...e, [key]: value }));
    try {
      await onFieldSave?.(key, value);
    } catch (err) {
      setEdits((e) => {
        const next = { ...e };
        delete next[key];
        return next;
      });
      throw err;
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Completeness + assistant offer — owner only */}
      {isOwner && (
        <Panel className="cosmos-panel-neon p-6" accent="#8b6cff">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
            <div>
              <Eyebrow>Your profile</Eyebrow>
              <h2 className="font-display text-[1.2rem] text-star mt-1.5">
                {overall}% complete
              </h2>
              <p className="text-[0.88rem] text-dim mt-1 max-w-[56ch]">
                A fuller profile means better matches, better AI output, and more of the
                right people finding you.
              </p>
            </div>
            <CosmosButton
              variant="ai"
              size="sm"
              onClick={() => window.dispatchEvent(new CustomEvent('sfassistant:open'))}
            >
              <Wand2 size={14} /> Let the assistant fill this
            </CosmosButton>
          </div>

          <ProgressRail label="Overall completeness" value={overall} />

          {autoFills.length > 0 && (
            <div className="mt-5">
              <Eyebrow className="mb-2.5">The assistant can fill these</Eyebrow>
              <div className="flex flex-wrap gap-2">
                {autoFills.map((f) => (
                  <Tag key={f.key} tone="planned">
                    <Sparkles size={10} /> {f.label}
                  </Tag>
                ))}
              </div>
            </div>
          )}

          {asks.length > 0 && (
            <div className="mt-4">
              <Eyebrow className="mb-2.5">Only you can answer these</Eyebrow>
              <div className="flex flex-wrap gap-2">
                {asks.map((f) => (
                  <Tag key={f.key} tone="accent">{f.label}</Tag>
                ))}
              </div>
            </div>
          )}
        </Panel>
      )}

      {/* Groups */}
      {FIELD_GROUPS.map((group) => {
        const pct = groupCompleteness(group, merged);
        const isOpen = openGroups[group.id];
        const visible = group.fields.filter(
          (f) => isOwner || !isEmptyValue(merged?.[f.key])
        );

        // Don't show an empty group to a visitor.
        if (!isOwner && visible.length === 0) return null;

        return (
          <Panel key={group.id} className="p-0 overflow-hidden" accent={group.accent}>
            <button
              type="button"
              onClick={() => toggle(group.id)}
              aria-expanded={isOpen}
              className="w-full flex flex-wrap items-center gap-3 p-5 text-left hover:bg-white/[0.02] transition-colors"
            >
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <Eyebrow>{group.label}</Eyebrow>
                  {group.readOnly && (
                    <span className="text-dim" title="Earned, not entered">
                      <Lock size={11} />
                    </span>
                  )}
                </span>
                <span className="block text-[0.85rem] text-dim mt-1">{group.description}</span>
              </span>

              {!group.readOnly && isOwner && (
                <span
                  className="font-mono text-[11px] tabular-nums shrink-0"
                  style={{ color: pct === 100 ? '#3ee6a0' : group.accent }}
                >
                  {pct}%
                </span>
              )}

              <ChevronDown
                size={16}
                className={`text-dim shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {isOpen && (
              <div className="px-5 pb-5">
                <div className="grid gap-x-6 gap-y-3 [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
                  {visible.map((field) => (
                    <FieldRow
                      key={field.key}
                      field={field}
                      value={merged?.[field.key]}
                      isOwner={isOwner}
                      onSave={handleSave}
                    />
                  ))}
                </div>
              </div>
            )}
          </Panel>
        );
      })}
    </div>
  );
}

function isEmptyValue(v) {
  return v == null || v === '' || (Array.isArray(v) && v.length === 0);
}

const AI_BADGE = {
  infer: { label: 'Auto', tone: 'planned' },
  extract: { label: 'From CV', tone: 'dev' },
  ask: { label: 'You', tone: 'accent' },
  derived: { label: 'Earned', tone: 'live' },
};

function FieldRow({ field, value, isOwner, onSave }) {
  const empty = isEmptyValue(value);
  const badge = AI_BADGE[field.aiFill];
  const editable = isOwner && field.aiFill !== 'derived';

  return (
    <div className="py-2 border-b border-white/[0.06]">
      <div className="flex items-center justify-between gap-2 mb-1">
        <span className="cosmos-stat-label">{field.label}</span>
        {isOwner && empty && badge && (
          <Tag tone={badge.tone} className="!py-0.5">{badge.label}</Tag>
        )}
        {!empty && <Check size={12} className="text-emerald-400 shrink-0" />}
      </div>

      <InlineField field={field} value={value} onSave={onSave} canEdit={editable}>
        {empty ? (
          <p className="text-[0.85rem] text-dim/70 italic">
            {editable ? (field.hint || 'Click the pencil to add') : '—'}
          </p>
        ) : (
          <FieldValue field={field} value={value} />
        )}
      </InlineField>
    </div>
  );
}

function FieldValue({ field, value }) {
  if (field.type === 'tags' || field.type === 'multiselect') {
    const list = Array.isArray(value) ? value : String(value).split(',');
    return (
      <div className="flex flex-wrap gap-1.5">
        {list.slice(0, 8).map((v) => (
          <Tag key={String(v)} tone="neutral">{String(v).trim()}</Tag>
        ))}
        {list.length > 8 && <Tag tone="future">+{list.length - 8}</Tag>}
      </div>
    );
  }

  if (field.type === 'list') {
    const list = Array.isArray(value) ? value : [value];
    return (
      <ul className="flex flex-col gap-1">
        {list.slice(0, 5).map((v, i) => (
          <li key={i} className="text-[0.88rem] text-star/85">
            {typeof v === 'string' ? v : v?.label || v?.title || JSON.stringify(v)}
          </li>
        ))}
      </ul>
    );
  }

  if (field.type === 'entries') {
    const list = Array.isArray(value) ? value : [];
    return (
      <ul className="flex flex-col gap-2">
        {list.slice(0, 4).map((e, i) => (
          <li key={i} className="text-[0.88rem]">
            <span className="text-star">{e.title || e.company || e.institution || '—'}</span>
            {(e.role || e.qualification || e.outcome) && (
              <span className="text-dim"> · {e.role || e.qualification || e.outcome}</span>
            )}
            {(e.from || e.year) && (
              <span className="block font-mono text-[10px] tracking-[0.1em] uppercase text-dim">
                {e.from ? `${e.from} – ${e.to || 'present'}` : e.year}
              </span>
            )}
          </li>
        ))}
      </ul>
    );
  }

  if (field.type === 'url') {
    return (
      <a
        href={String(value)}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[0.88rem] text-cyan hover:text-star transition-colors break-all"
      >
        {String(value).replace(/^https?:\/\//, '')}
      </a>
    );
  }

  if (field.type === 'boolean') {
    return <p className="text-[0.88rem] text-star/85">{value ? 'Yes' : 'No'}</p>;
  }

  if (field.type === 'number') {
    return (
      <p className="font-mono text-[0.95rem] text-star tabular-nums">
        {Number(value).toLocaleString()}
      </p>
    );
  }

  return <p className="text-[0.88rem] text-star/85 whitespace-pre-wrap">{String(value)}</p>;
}
