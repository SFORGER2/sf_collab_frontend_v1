import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import {
  BadgeCheck, Clock, FileText, Loader2, Rocket, ShieldCheck, Sparkles, XCircle,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { startupsAPI } from '@/utils/APIs/startupsAPI';
import {
  CosmosButton, Display, Eyebrow, Lede, Panel, Reveal, StepPath, Tag,
} from '@/components/cosmos';
import { Field, FieldGrid, Notice, Select, TextArea, TextInput } from '../Profile/profileSettings/SettingsUI';
import RegisterStartUp from './RegisterStartUp';

/**
 * Startup registration is request-only.
 *
 * Anyone could previously walk straight into the nine-step wizard and create a
 * startup, which is why discovery fills with empty shells: a registered startup
 * takes a slot in search, can recruit, and can raise. That should be a
 * deliberate act, not a side effect of clicking a nav item.
 *
 * So this sits in front of the wizard:
 *
 *   none      → the request form (four questions, two minutes)
 *   pending   → status, with what happens next
 *   rejected  → the reason, and the option to revise and resubmit
 *   approved  → the wizard itself, unchanged
 *
 * The wizard is untouched. This only decides whether you reach it.
 *
 * ⚠️ The gate is presentation. `POST /api/startups` must reject a create from
 * anyone without an approved request — a client-side gate stops nobody.
 */
export default function RegisterStartupGate() {
  const [status, setStatus] = useState('loading');
  const [request, setRequest] = useState(null);
  const [params] = useSearchParams();

  // Editing an existing startup is not a new registration — skip the gate.
  const isEditing = !!params.get('id');

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await startupsAPI.getMyRegistrationRequest();
        const data = res?.data || res;
        if (!cancelled) {
          setRequest(data);
          setStatus(data?.status || 'none');
        }
      } catch {
        // The endpoint doesn't exist yet in most environments. Failing open
        // here would silently defeat the gate, so fail to the request form.
        if (!cancelled) setStatus('none');
      }
    })();

    return () => { cancelled = true; };
  }, []);

  if (isEditing || status === 'approved') return <RegisterStartUp />;

  if (status === 'loading') {
    return (
      <div className="min-h-[60vh] grid place-items-center text-dim">
        <Loader2 className="animate-spin" size={22} />
      </div>
    );
  }

  return (
    <div className="w-full max-w-[900px] mx-auto px-4 sm:px-6 py-8">
      <Reveal>
        <Eyebrow>Register a startup</Eyebrow>
        <Display size="xl" className="mt-3 mb-4">
          {status === 'pending' ? 'Your request is in review' : 'Tell us what you\'re building'}
        </Display>
        <Lede>
          {status === 'pending'
            ? 'We read every request. You\'ll get a notification the moment it\'s decided.'
            : 'Registration is by request. A registered startup takes a place in discovery, can recruit and can raise — so we look at each one before it goes live.'}
        </Lede>
      </Reveal>

      {status === 'pending' && <PendingState request={request} />}
      {status === 'rejected' && <RejectedState request={request} onRevise={() => setStatus('none')} />}
      {status === 'none' && <RequestForm onSubmitted={(r) => { setRequest(r); setStatus('pending'); }} />}
    </div>
  );
}

function PendingState({ request }) {
  const submitted = request?.submittedAt ? new Date(request.submittedAt) : null;

  return (
    <Panel className="cosmos-panel-neon p-7 mt-7" accent="#ffbf5e">
      <div className="flex items-center gap-3 mb-5">
        <span
          className="grid place-items-center w-12 h-12 rounded-2xl"
          style={{ background: 'rgba(255,191,94,0.12)', color: '#ffbf5e' }}
        >
          <Clock size={22} />
        </span>
        <div>
          <Tag tone="accent" dot>In review</Tag>
          {submitted && (
            <p className="text-[0.82rem] text-dim mt-1.5">
              Submitted {submitted.toLocaleDateString()} at{' '}
              {submitted.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </div>
      </div>

      <StepPath
        steps={[
          { title: 'Request sent', description: 'We have it.', done: true },
          { title: 'Reviewed by SF', description: 'A person reads it, not a filter.' },
          { title: 'Registration unlocked', description: 'The full nine-step setup opens.' },
        ]}
      />

      <div className="mt-6 flex flex-col gap-2.5 text-[0.9rem] text-dim">
        <p>Most requests are answered within two working days.</p>
        <p>
          While you wait, a Vision is the faster way to start — it needs no approval, and it
          is where most startups here begin.
        </p>
      </div>

      <div className="flex flex-wrap gap-2.5 mt-6">
        <CosmosButton variant="primary" size="sm" asChild>
          <Link to="/vision/new"><Sparkles size={14} /> Create a Vision instead</Link>
        </CosmosButton>
        <CosmosButton variant="ghost" size="sm" asChild>
          <Link to="/discover-startups">Browse startups</Link>
        </CosmosButton>
      </div>
    </Panel>
  );
}

function RejectedState({ request, onRevise }) {
  return (
    <Panel className="p-7 mt-7" accent="#ff6f6f">
      <div className="flex items-center gap-3 mb-4">
        <span
          className="grid place-items-center w-12 h-12 rounded-2xl"
          style={{ background: 'rgba(255,111,111,0.12)', color: '#ff8080' }}
        >
          <XCircle size={22} />
        </span>
        <Tag tone="neutral">Not approved yet</Tag>
      </div>

      {request?.note && (
        <div className="mb-5">
          <Notice tone="warn">{request.note}</Notice>
        </div>
      )}

      <p className="text-[0.9rem] text-dim max-w-[60ch]">
        This isn't a no forever. Most requests that come back are missing something concrete —
        what exists today, who is already involved, or why now. Add that and send it again.
      </p>

      <div className="mt-6">
        <CosmosButton variant="primary" size="sm" onClick={onRevise}>
          <FileText size={14} /> Revise and resubmit
        </CosmosButton>
      </div>
    </Panel>
  );
}

const STAGES = [
  'Just an idea',
  'Building the first version',
  'Live with early users',
  'Generating revenue',
  'Raised funding',
];

function RequestForm({ onSubmitted }) {
  const [form, setForm] = useState({ pitch: '', stage: '', why: '', links: '' });
  const [submitting, setSubmitting] = useState(false);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const ready = form.pitch.trim().length >= 40 && !!form.stage && form.why.trim().length >= 40;

  const submit = async () => {
    if (!ready || submitting) return;
    setSubmitting(true);
    try {
      const res = await startupsAPI.requestRegistration(form);
      const data = res?.data || res;
      toast.success('Request sent — we\'ll be in touch');
      onSubmitted(data || { status: 'pending', submittedAt: Date.now() });
    } catch (e) {
      toast.error(e?.response?.data?.message || e.message || 'Could not send your request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Panel className="p-6 mt-7">
        <div className="flex items-start gap-3">
          <ShieldCheck size={18} className="text-gold shrink-0 mt-0.5" />
          <p className="text-[0.88rem] text-dim">
            We're not looking for a polished pitch. Four questions, two minutes — enough to
            tell a real venture from a placeholder.
          </p>
        </div>
      </Panel>

      <Panel className="p-7 mt-4" accent="#ffbf5e" style={{ '--field-accent': '#ffbf5e' }}>
        <Field
          label="What are you building?"
          required
          hint={
            form.pitch.trim().length < 40
              ? `${form.pitch.trim().length}/40 characters minimum`
              : 'One or two sentences is plenty.'
          }
        >
          <TextArea
            rows={3}
            value={form.pitch}
            placeholder="The problem, and what you're doing about it."
            onChange={(e) => set({ pitch: e.target.value })}
          />
        </Field>

        <FieldGrid className="mt-4">
          <Field label="Where are you today?" required>
            <Select
              value={form.stage}
              onChange={(e) => set({ stage: e.target.value })}
              placeholder="Pick the closest"
              options={STAGES}
            />
          </Field>

          <Field label="Links" hint="Site, repo, deck, demo — anything that exists.">
            <TextInput
              value={form.links}
              placeholder="Comma-separated"
              onChange={(e) => set({ links: e.target.value })}
            />
          </Field>
        </FieldGrid>

        <Field
          label="Why register it here, and why now?"
          required
          className="mt-4"
          hint={
            form.why.trim().length < 40
              ? `${form.why.trim().length}/40 characters minimum`
              : 'What you want from the ecosystem — a team, funding, distribution.'
          }
        >
          <TextArea
            rows={3}
            value={form.why}
            placeholder="What you need that you can't get on your own."
            onChange={(e) => set({ why: e.target.value })}
          />
        </Field>

        <div className="flex flex-wrap items-center gap-3 mt-6 pt-5 border-t border-white/[0.07]">
          <span className="text-[0.8rem] text-dim mr-auto">
            Approval unlocks the full registration.
          </span>
          <CosmosButton variant="primary" size="sm" onClick={submit} disabled={!ready || submitting}>
            {submitting ? <Loader2 size={14} className="animate-spin" /> : <BadgeCheck size={14} />}
            {submitting ? 'Sending…' : 'Send request'}
          </CosmosButton>
        </div>
      </Panel>

      <Panel className="p-6 mt-4">
        <Eyebrow className="mb-3">Don't want to wait?</Eyebrow>
        <p className="text-[0.9rem] text-dim max-w-[62ch]">
          A Vision needs no approval. It's a public statement of what you want to build that
          people can join, back and help shape — and when it has a team behind it, registering
          the startup becomes a formality.
        </p>
        <div className="mt-4">
          <CosmosButton variant="ai" size="sm" asChild>
            <Link to="/vision/new"><Rocket size={14} /> Start a Vision</Link>
          </CosmosButton>
        </div>
      </Panel>
    </>
  );
}
