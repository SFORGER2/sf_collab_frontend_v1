import React, { useMemo, useState } from 'react';
import { AlertTriangle, Check, Lock, MessageSquare, Scale, Send } from 'lucide-react';
import { toast } from 'react-toastify';
import {
  CRITERIA, DISPUTE_REASONS, DISPUTE_STATES, PHASES, PHASE_ORDER, SCALE,
  completeness, describe, isFrozen, nextPhase, overallScore, phaseScore,
} from '@/services/ratings/collaborationRatings';
import { CosmosButton, Eyebrow, Panel, ProgressRail, Tag } from '@/components/cosmos';
import { Field, Notice, Select, TextArea } from '../Profile/profileSettings/SettingsUI';

/**
 * Rating a collaboration, across its life rather than at the end of it.
 *
 * The old UI was one five-star control submitted once, which is the version of
 * this that produces no useful information (see the note at the top of
 * services/ratings/collaborationRatings.js). This runs three phases and keeps a
 * dispute path open from all of them.
 *
 * The phase you're *meant* to fill next is opened automatically; the others
 * stay reachable but collapsed, so the page always has one obvious action.
 *
 * NOTE FOR BACKEND: posts to /api/collaborations/:id/ratings with a phase, and
 * disputes to /api/collaborations/:id/disputes. Only participants may write,
 * one submission per party per phase.
 */
export default function CollaborationRating({
  collaboration = {},
  ratings = {},
  dispute = null,
  onSubmitPhase,
  onOpenDispute,
  readOnly = false,
}) {
  const state = collaboration.state || 'active';
  const suggested = useMemo(() => nextPhase(ratings, state), [ratings, state]);
  const [openPhase, setOpenPhase] = useState(suggested || 'after');
  const [drafts, setDrafts] = useState({});
  const [showDispute, setShowDispute] = useState(false);

  const overall = overallScore(ratings);
  const frozen = isFrozen(dispute);

  const setAnswer = (phase, criterion, value) =>
    setDrafts((d) => ({ ...d, [phase]: { ...(d[phase] || {}), [criterion]: value } }));

  const submit = async (phase) => {
    const answers = drafts[phase] || {};
    if (Object.keys(answers).length === 0) {
      toast.error('Rate at least one thing before submitting');
      return;
    }
    try {
      await onSubmitPhase?.(phase, answers, drafts[`${phase}:note`]);
      toast.success(`${PHASES[phase].label} rating saved`);
      setDrafts((d) => ({ ...d, [phase]: {} }));
    } catch (e) {
      toast.error(e?.message || 'Could not save that rating');
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Summary */}
      <Panel className="cosmos-panel-neon p-6" accent="#8b6cff">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <Eyebrow>Collaboration rating</Eyebrow>
            <h2 className="font-display text-[1.5rem] text-star mt-1.5 leading-tight">
              {frozen ? 'On hold' : describe(overall)}
            </h2>
            <p className="text-[0.85rem] text-dim mt-1 max-w-[52ch]">
              {frozen
                ? 'The public score is withheld while a dispute is open, so nobody’s reputation is set by a rating they never got to answer.'
                : 'Rated across three phases. Outcome carries the most weight, but how the work felt while it was live counts too.'}
            </p>
          </div>

          <div className="text-right shrink-0">
            <span className="cosmos-stat-label block">Overall</span>
            <span className="font-display text-[1.6rem] tabular-nums text-star">
              {frozen ? <Lock size={20} className="inline text-dim" /> : overall ? overall.toFixed(1) : '—'}
            </span>
          </div>
        </div>

        <div className="mt-5">
          <ProgressRail label="Phases completed" value={completeness(ratings)} />
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          {PHASE_ORDER.map((id) => {
            const score = phaseScore(ratings[id]);
            return (
              <span
                key={id}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.78rem]"
                style={{
                  background: `${PHASES[id].accent}14`,
                  border: `1px solid ${PHASES[id].accent}33`,
                  color: PHASES[id].accent,
                }}
              >
                {score != null && <Check size={11} />}
                {PHASES[id].label}
                <span className="font-mono text-[9px] opacity-70">
                  {score != null ? score.toFixed(1) : 'not yet'}
                </span>
              </span>
            );
          })}
        </div>
      </Panel>

      {dispute && <DisputeBanner dispute={dispute} />}

      {/* Phases */}
      {PHASE_ORDER.map((id) => {
        const phase = PHASES[id];
        const existing = ratings[id];
        const done = phaseScore(existing) != null;
        const isOpen = openPhase === id;
        const isSuggested = suggested === id;

        return (
          <Panel key={id} className="p-0 overflow-hidden" accent={phase.accent}>
            <button
              type="button"
              onClick={() => setOpenPhase(isOpen ? null : id)}
              aria-expanded={isOpen}
              className="w-full flex flex-wrap items-center gap-3 p-5 text-left hover:bg-white/[0.02] transition-colors"
            >
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-2">
                  <Eyebrow>{phase.label}</Eyebrow>
                  {done && <Tag tone="live" dot>Rated</Tag>}
                  {!done && isSuggested && <Tag tone="accent">Your turn</Tag>}
                </span>
                <span className="block text-[0.95rem] text-star mt-1">{phase.title}</span>
                <span className="block text-[0.82rem] text-dim mt-0.5 max-w-[62ch]">{phase.blurb}</span>
              </span>

              {done && (
                <span className="font-display text-[1.15rem] tabular-nums shrink-0" style={{ color: phase.accent }}>
                  {phaseScore(existing).toFixed(1)}
                </span>
              )}
            </button>

            {isOpen && (
              <div className="px-5 pb-5">
                <div className="flex flex-col gap-2.5">
                  {CRITERIA[id].map((c) => (
                    <CriterionRow
                      key={c.id}
                      criterion={c}
                      accent={phase.accent}
                      value={drafts[id]?.[c.id] ?? existing?.[c.id] ?? 0}
                      readOnly={readOnly || done}
                      onChange={(v) => setAnswer(id, c.id, v)}
                    />
                  ))}
                </div>

                {!done && !readOnly && (
                  <>
                    <Field label="Anything worth saying in words?" className="mt-4">
                      <TextArea
                        rows={2}
                        placeholder={
                          id === 'before'
                            ? 'What you both agreed, in one line.'
                            : id === 'during'
                            ? 'What is working, what is not.'
                            : 'What you would tell the next person considering this collaboration.'
                        }
                        value={drafts[`${id}:note`] || ''}
                        onChange={(e) => setDrafts((d) => ({ ...d, [`${id}:note`]: e.target.value }))}
                      />
                    </Field>

                    <div className="flex flex-wrap items-center gap-3 mt-4">
                      <CosmosButton variant="primary" size="sm" onClick={() => submit(id)}>
                        <Send size={13} /> Submit {phase.label.toLowerCase()} rating
                      </CosmosButton>
                      <span className="text-[0.78rem] text-dim">
                        The other party sees this immediately.
                      </span>
                    </div>
                  </>
                )}

                {done && existing?.note && (
                  <p className="text-[0.85rem] text-dim mt-4 pt-4 border-t border-white/[0.07]">
                    “{existing.note}”
                  </p>
                )}
              </div>
            )}
          </Panel>
        );
      })}

      {/* Dispute */}
      {!dispute && !readOnly && (
        <Panel className="p-5">
          {!showDispute ? (
            <div className="flex flex-wrap items-center gap-3">
              <Scale size={16} className="text-dim shrink-0" />
              <span className="text-[0.88rem] text-dim flex-1 min-w-0">
                Something went wrong that a rating can’t capture?
              </span>
              <CosmosButton variant="quiet" size="sm" onClick={() => setShowDispute(true)}>
                Open a dispute
              </CosmosButton>
            </div>
          ) : (
            <DisputeForm
              onCancel={() => setShowDispute(false)}
              onSubmit={async (payload) => {
                await onOpenDispute?.(payload);
                setShowDispute(false);
                toast.success('Dispute opened — the other party has been notified');
              }}
            />
          )}
        </Panel>
      )}
    </div>
  );
}

function CriterionRow({ criterion, value, onChange, accent, readOnly }) {
  return (
    <div className="flex flex-wrap items-center gap-3 py-2.5 border-b border-white/[0.06] last:border-0">
      <span className="min-w-0 flex-1">
        <span className="block text-[0.88rem] text-star">{criterion.label}</span>
        <span className="block text-[0.76rem] text-dim mt-0.5">{criterion.hint}</span>
      </span>

      <span className="flex items-center gap-1 shrink-0">
        {SCALE.map((s) => {
          const active = value === s.value;
          return (
            <button
              key={s.value}
              type="button"
              disabled={readOnly}
              onClick={() => onChange(s.value)}
              title={s.label}
              aria-label={`${criterion.label}: ${s.label}`}
              aria-pressed={active}
              className="w-8 h-8 rounded-lg font-mono text-[11px] tabular-nums transition-colors disabled:cursor-default"
              style={
                active
                  ? { background: `${accent}22`, border: `1px solid ${accent}`, color: accent }
                  : { border: '1px solid rgba(255,255,255,0.1)', color: 'var(--color-dim)' }
              }
            >
              {s.value}
            </button>
          );
        })}
      </span>
    </div>
  );
}

function DisputeBanner({ dispute }) {
  const state = DISPUTE_STATES[dispute.status] || DISPUTE_STATES.open;

  return (
    <Panel className="p-5" accent={state.accent}>
      <div className="flex flex-wrap items-start gap-3">
        <span className="grid place-items-center w-10 h-10 rounded-xl shrink-0"
              style={{ background: `${state.accent}18`, color: state.accent }}>
          <Scale size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Eyebrow>Dispute</Eyebrow>
            <Tag tone="accent">{state.label}</Tag>
          </div>
          <p className="text-[0.85rem] text-dim mt-1.5">{state.blurb}</p>
          {dispute.detail && (
            <p className="text-[0.85rem] text-star/85 mt-2">“{dispute.detail}”</p>
          )}
        </div>
      </div>
    </Panel>
  );
}

function DisputeForm({ onSubmit, onCancel }) {
  const [reason, setReason] = useState('');
  const [detail, setDetail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const ready = reason && detail.trim().length >= 40;

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle size={15} className="text-gold" />
        <Eyebrow>Open a dispute</Eyebrow>
      </div>

      <Notice tone="warn">
        This notifies the other party and pauses the public score for both of you until it
        resolves. Use it for real problems — not for a rating you disagree with, unless the
        rating itself is the problem.
      </Notice>

      <div className="mt-4 flex flex-col gap-4" style={{ '--field-accent': '#ffbf5e' }}>
        <Field label="What went wrong" required>
          <Select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Pick the closest"
            options={DISPUTE_REASONS.map((r) => ({ value: r.id, label: r.label }))}
          />
        </Field>

        <Field
          label="What happened"
          required
          hint={detail.trim().length < 40 ? `${detail.trim().length}/40 characters minimum` : 'Dates and specifics help more than adjectives.'}
        >
          <TextArea
            rows={4}
            value={detail}
            placeholder="What was agreed, what actually happened, and what you have already tried."
            onChange={(e) => setDetail(e.target.value)}
          />
        </Field>
      </div>

      <div className="flex flex-wrap items-center gap-2.5 mt-4">
        <CosmosButton
          variant="primary"
          size="sm"
          disabled={!ready || submitting}
          onClick={async () => {
            setSubmitting(true);
            try { await onSubmit({ reason, detail }); }
            finally { setSubmitting(false); }
          }}
        >
          <MessageSquare size={13} /> {submitting ? 'Opening…' : 'Open dispute'}
        </CosmosButton>
        <CosmosButton variant="quiet" size="sm" onClick={onCancel}>Cancel</CosmosButton>
      </div>
    </div>
  );
}
