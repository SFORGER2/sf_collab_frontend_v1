import React, { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
  ArrowLeft, ArrowRight, Check, ImageIcon, Lightbulb, Rocket, Sparkles,
  Target, Upload, Users, X,
} from 'lucide-react';
import {
  CosmosButton, Display, Eyebrow, Lede, PageShell, Panel, ProgressRail, Tag,
} from '@/components/cosmos';
import { DraftField } from '@/components/cosmos/DraftField';
import { ideaAPI } from '@/utils/APIs/ideaAPI';

/**
 * Vision Creator.
 *
 * The old creator was a single modal with four fields — title, description,
 * industry, stage — which is far too thin for something the whole platform then
 * builds on. Matchmaking needs the roles you want. The readiness score needs a
 * problem and an outcome. The AI tools need positioning. None of that existed,
 * so every Vision started life underspecified and scored badly.
 *
 * This is the same shape as startup registration: staged, resumable, with
 * branding. Every field maps onto something downstream:
 *
 *   Identity      → the Vision's name, logo and banner
 *   Problem       → readiness: problem_statement
 *   Outcome       → readiness: outcome_goal
 *   Roles         → matchmaking input, readiness: required_roles
 *   Roadmap       → readiness: roadmap
 *
 * Text fields use DraftField, so a half-written Vision survives a closed tab.
 *
 * NOTE FOR BACKEND: submits the same multipart contract the old form used
 * (title, description, projectDetails, industry, stage, tags, image) plus new
 * fields — problem, outcome, requiredRoles, roadmap, banner. The extra fields
 * need persisting on Idea and feeding compute_readiness_score().
 */

const INDUSTRIES = [
  'Technology', 'Fintech', 'Health', 'Climate', 'Education', 'Developer Tools',
  'Logistics', 'Creator Economy', 'Security', 'Commerce', 'AI / SaaS', 'Other',
];

const STAGES = [
  { id: 'Spark', hint: 'A thought worth exploring' },
  { id: 'Idea Stage', hint: 'Shaped, not yet started' },
  { id: 'Prototype', hint: 'Something exists' },
  { id: 'MVP', hint: 'Real users touching it' },
];

const ROLE_OPTIONS = [
  'Fullstack Engineer', 'Frontend Developer', 'Backend Engineer', 'Mobile Engineer',
  'AI Engineer', 'Data Scientist', 'Product Designer', 'Brand Designer',
  'Growth Marketer', 'Content Strategist', 'Community Manager', 'Operations',
  'Sales', 'Legal', 'Finance',
];

const STEPS = [
  { id: 'identity', label: 'Identity', icon: Lightbulb },
  { id: 'problem', label: 'The Problem', icon: Target },
  { id: 'outcome', label: 'The Outcome', icon: Rocket },
  { id: 'team', label: 'Who You Need', icon: Users },
  { id: 'branding', label: 'Branding', icon: ImageIcon },
  { id: 'review', label: 'Review', icon: Check },
];

export default function VisionCreator() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    problem: '',
    outcome: '',
    industry: '',
    stage: 'Idea Stage',
    roles: [],
    roadmap: ['', '', ''],
    tags: [],
    tagDraft: '',
  });

  const [logo, setLogo] = useState(null);
  const [banner, setBanner] = useState(null);
  const logoRef = useRef(null);
  const bannerRef = useRef(null);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  /** Completeness across the whole form — mirrors what readiness will score. */
  const completeness = useMemo(() => {
    const checks = [
      form.title.trim().length > 2,
      form.description.trim().length > 30,
      form.problem.trim().length > 20,
      form.outcome.trim().length > 20,
      Boolean(form.industry),
      form.roles.length > 0,
      form.roadmap.filter((r) => r.trim()).length > 0,
      Boolean(logo || banner),
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [form, logo, banner]);

  const canAdvance = () => {
    if (step === 0) return form.title.trim().length > 2 && form.description.trim().length > 10 && form.industry;
    if (step === 1) return form.problem.trim().length > 10;
    if (step === 2) return form.outcome.trim().length > 10;
    return true;
  };

  const toggleRole = (role) =>
    set({ roles: form.roles.includes(role) ? form.roles.filter((r) => r !== role) : [...form.roles, role] });

  const addTag = () => {
    const t = form.tagDraft.trim();
    if (t && !form.tags.includes(t)) set({ tags: [...form.tags, t], tagDraft: '' });
    else set({ tagDraft: '' });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('creator_first_name', user?.firstName || '');
      fd.append('creator_last_name', user?.lastName || '');
      fd.append('title', form.title.trim());
      fd.append('description', form.description.trim());
      fd.append('projectDetails', form.description.trim() || 'No additional details provided.');
      fd.append('industry', form.industry || 'Technology');
      fd.append('stage', form.stage || 'Idea Stage');
      fd.append('tags', JSON.stringify(form.tags.length ? form.tags : ['General']));

      // New fields — see the backend note in the module header.
      fd.append('problem', form.problem.trim());
      fd.append('outcome', form.outcome.trim());
      fd.append('requiredRoles', JSON.stringify(form.roles));
      fd.append('roadmap', JSON.stringify(form.roadmap.filter((r) => r.trim())));

      if (logo) fd.append('image', logo);
      if (banner) fd.append('banner', banner);

      const res = await ideaAPI.createIdea(fd);
      const created = res?.data?.idea ?? res?.idea;
      toast.success('Your Vision is live.');
      navigate(created?.id ? `/vision/${created.id}` : '/ideation');
    } catch (err) {
      console.error('Vision creation failed:', err);
      toast.error(err?.response?.data?.error || 'Could not create your Vision');
    } finally {
      setSubmitting(false);
    }
  };

  const StepIcon = STEPS[step].icon;

  return (
    <PageShell width="default" showAd={false}>
      <Eyebrow>Create</Eyebrow>
      <Display size="xl" className="mt-3 mb-4">Start A Vision</Display>
      <Lede>
        A Vision is how an idea enters the ecosystem — visible to builders, mentors, influencers
        and investors, and connected to AI tools that already understand it.
      </Lede>

      {/* Step rail */}
      <div className="flex flex-wrap items-center gap-2 mt-8 mb-5">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const done = i < step;
          const active = i === step;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => i <= step && setStep(i)}
              disabled={i > step}
              className={`flex items-center gap-1.5 font-mono text-[10px] tracking-[0.14em] uppercase px-3 py-1.5 rounded-full border transition-colors ${
                active
                  ? 'border-gold/60 text-gold bg-gold/10'
                  : done
                    ? 'border-emerald-400/40 text-emerald-400'
                    : 'border-white/10 text-dim cursor-not-allowed'
              }`}
            >
              {done ? <Check size={11} /> : <Icon size={11} />}
              {s.label}
            </button>
          );
        })}
      </div>

      <ProgressRail label="Vision completeness" value={completeness} className="mb-6" />

      <Panel className="cosmos-panel-neon p-6 sm:p-8" accent="#ffbf5e">
        <div className="flex items-center gap-2.5 mb-6">
          <StepIcon size={18} className="text-gold" />
          <h2 className="font-display text-[1.2rem] text-star">{STEPS[step].label}</h2>
        </div>

        {/* ── 0. Identity ── */}
        {step === 0 && (
          <div className="flex flex-col gap-5">
            <DraftField
              draftKey="vision-new-title"
              label="Vision name"
              value={form.title}
              onSave={(v) => set({ title: v })}
              placeholder="What are you building?"
            />
            <DraftField
              draftKey="vision-new-description"
              label="One-paragraph summary"
              value={form.description}
              onSave={(v) => set({ description: v })}
              placeholder="What is it, who is it for, and why now?"
              multiline
              rows={4}
            />

            <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
              <label className="flex flex-col gap-2">
                <span className="cosmos-stat-label">Industry</span>
                <select
                  value={form.industry}
                  onChange={(e) => set({ industry: e.target.value })}
                  className="px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-[0.95rem] text-star focus:outline-none focus:border-gold"
                >
                  <option value="">Choose an industry…</option>
                  {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
                </select>
              </label>

              <div className="flex flex-col gap-2">
                <span className="cosmos-stat-label">Stage</span>
                <div className="flex flex-wrap gap-1.5">
                  {STAGES.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => set({ stage: s.id })}
                      title={s.hint}
                      className={`font-mono text-[10px] tracking-[0.12em] uppercase px-2.5 py-1.5 rounded-full border transition-colors ${
                        form.stage === s.id
                          ? 'border-gold/60 text-gold bg-gold/10'
                          : 'border-white/10 text-dim hover:text-star'
                      }`}
                    >
                      {s.id}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── 1. Problem ── */}
        {step === 1 && (
          <div className="flex flex-col gap-4">
            <p className="text-[0.9rem] text-dim">
              The clearest Visions name a problem someone actually has. This earns your first
              readiness points.
            </p>
            <DraftField
              draftKey="vision-new-problem"
              label="What is broken, missing, or too hard today?"
              value={form.problem}
              onSave={(v) => set({ problem: v })}
              placeholder="Describe the problem as the person experiencing it would…"
              multiline
              rows={6}
            />
          </div>
        )}

        {/* ── 2. Outcome ── */}
        {step === 2 && (
          <div className="flex flex-col gap-4">
            <p className="text-[0.9rem] text-dim">
              What does success look like? This is what collaborators sign up to, and what your
              pitch deck will be built from later.
            </p>
            <DraftField
              draftKey="vision-new-outcome"
              label="If this works, what changes?"
              value={form.outcome}
              onSave={(v) => set({ outcome: v })}
              placeholder="The outcome you're aiming for, and how you'd know you got there…"
              multiline
              rows={6}
            />

            <div className="flex flex-col gap-2 mt-2">
              <span className="cosmos-stat-label">First three steps (roadmap)</span>
              {form.roadmap.map((r, i) => (
                <input
                  key={i}
                  value={r}
                  onChange={(e) => {
                    const next = [...form.roadmap];
                    next[i] = e.target.value;
                    set({ roadmap: next });
                  }}
                  placeholder={`Step ${i + 1}`}
                  className="px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-[0.92rem] text-star placeholder-dim focus:outline-none focus:border-gold"
                />
              ))}
            </div>
          </div>
        )}

        {/* ── 3. Team ── */}
        {step === 3 && (
          <div className="flex flex-col gap-5">
            <p className="text-[0.9rem] text-dim">
              Pick the roles you need. AI matchmaking has nothing to work with until you do — this
              is what turns your Vision into real introductions.
            </p>

            <div className="flex flex-wrap gap-2">
              {ROLE_OPTIONS.map((role) => {
                const on = form.roles.includes(role);
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => toggleRole(role)}
                    className={`text-[0.85rem] px-3 py-1.5 rounded-full border transition-colors ${
                      on
                        ? 'border-cyan/60 text-cyan bg-cyan/10'
                        : 'border-white/10 text-dim hover:text-star hover:border-white/25'
                    }`}
                  >
                    {on && <Check size={11} className="inline mr-1" />}
                    {role}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-col gap-2">
              <span className="cosmos-stat-label">Tags</span>
              <div className="flex flex-wrap items-center gap-2">
                {form.tags.map((t) => (
                  <span key={t} className="cosmos-tag cosmos-tag-accent">
                    {t}
                    <button type="button" onClick={() => set({ tags: form.tags.filter((x) => x !== t) })}>
                      <X size={10} />
                    </button>
                  </span>
                ))}
                <input
                  value={form.tagDraft}
                  onChange={(e) => set({ tagDraft: e.target.value })}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                  onBlur={addTag}
                  placeholder="Add a tag…"
                  className="px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-[0.85rem] text-star placeholder-dim focus:outline-none focus:border-gold w-36"
                />
              </div>
            </div>
          </div>
        )}

        {/* ── 4. Branding ── */}
        {step === 4 && (
          <div className="flex flex-col gap-6">
            <p className="text-[0.9rem] text-dim">
              A Vision with a face gets noticed. Both are optional and can be changed later.
            </p>

            <ImageDrop
              label="Logo"
              hint="Square, at least 256×256"
              file={logo}
              inputRef={logoRef}
              onPick={setLogo}
              accent="#ffbf5e"
              aspect="aspect-square max-w-[160px]"
            />

            <ImageDrop
              label="Banner"
              hint="Wide, at least 1200×400"
              file={banner}
              inputRef={bannerRef}
              onPick={setBanner}
              accent="#4fd8ff"
              aspect="aspect-[3/1]"
            />
          </div>
        )}

        {/* ── 5. Review ── */}
        {step === 5 && (
          <div className="flex flex-col gap-5">
            <div className="flex flex-wrap items-center gap-2.5">
              <Tag tone={completeness >= 75 ? 'live' : 'planned'} dot={completeness >= 75}>
                {completeness}% complete
              </Tag>
              <span className="text-[0.85rem] text-dim">
                {completeness >= 75
                  ? 'Strong start — this will score well on readiness.'
                  : 'You can publish now and fill the rest in later.'}
              </span>
            </div>

            <div className="cosmos-card p-5 flex flex-col gap-3">
              <h3 className="font-display text-[1.1rem] text-star">{form.title || 'Untitled Vision'}</h3>
              <p className="text-[0.9rem] text-star/85">{form.description || '—'}</p>
              <div className="flex flex-wrap gap-2">
                {form.industry && <Tag>{form.industry}</Tag>}
                {form.stage && <Tag>{form.stage}</Tag>}
                {form.roles.slice(0, 4).map((r) => <Tag key={r} tone="dev">{r}</Tag>)}
                {form.roles.length > 4 && <Tag tone="future">+{form.roles.length - 4} roles</Tag>}
              </div>
            </div>

            <ReviewRow label="Problem" value={form.problem} />
            <ReviewRow label="Outcome" value={form.outcome} />
            <ReviewRow label="Roadmap" value={form.roadmap.filter((r) => r.trim()).join(' → ')} />
          </div>
        )}

        {/* Nav */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-8 pt-5 border-t border-white/10">
          <CosmosButton
            variant="quiet"
            size="sm"
            onClick={() => (step === 0 ? navigate('/ideation') : setStep(step - 1))}
          >
            <ArrowLeft size={14} /> {step === 0 ? 'Cancel' : 'Back'}
          </CosmosButton>

          {step < STEPS.length - 1 ? (
            <CosmosButton
              variant="primary"
              size="sm"
              disabled={!canAdvance()}
              onClick={() => setStep(step + 1)}
            >
              Continue <ArrowRight size={14} />
            </CosmosButton>
          ) : (
            <CosmosButton variant="primary" size="sm" disabled={submitting} onClick={handleSubmit}>
              <Sparkles size={14} /> {submitting ? 'Publishing…' : 'Publish Vision'}
            </CosmosButton>
          )}
        </div>
      </Panel>
    </PageShell>
  );
}

function ReviewRow({ label, value }) {
  return (
    <div>
      <span className="cosmos-stat-label">{label}</span>
      <p className="text-[0.9rem] text-star/85 mt-1">{value || <span className="text-dim">Not set</span>}</p>
    </div>
  );
}

/** Image picker with a live preview and a neon frame. */
function ImageDrop({ label, hint, file, inputRef, onPick, accent, aspect }) {
  const preview = file ? URL.createObjectURL(file) : null;

  return (
    <div className="flex flex-col gap-2" style={{ '--cosmos-accent': accent }}>
      <div className="flex items-baseline justify-between gap-3">
        <span className="cosmos-stat-label">{label}</span>
        <span className="font-mono text-[10px] tracking-[0.1em] uppercase text-dim">{hint}</span>
      </div>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={`cosmos-neon relative w-full ${aspect} rounded-2xl overflow-hidden flex items-center justify-center transition-opacity hover:opacity-90`}
      >
        {preview ? (
          <img src={preview} alt={`${label} preview`} className="w-full h-full object-cover" />
        ) : (
          <span className="flex flex-col items-center gap-2 text-dim">
            <Upload size={18} style={{ color: accent }} />
            <span className="text-[0.85rem]">Choose a file</span>
          </span>
        )}
      </button>

      {file && (
        <button
          type="button"
          onClick={() => onPick(null)}
          className="self-start font-mono text-[10px] tracking-[0.14em] uppercase text-dim hover:text-star transition-colors"
        >
          Remove
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && onPick(e.target.files[0])}
      />
    </div>
  );
}
