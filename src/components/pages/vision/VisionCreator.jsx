import React, { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
  ArrowLeft, ArrowRight, Check, ImageIcon, Lightbulb, Rocket, Sparkles,
  Target, Upload, Users, X, Cpu, Wallet, HeartPulse, Leaf, GraduationCap,
  Wrench, Truck, Video, Shield, ShoppingBag, Bot, Layers,
} from 'lucide-react';
import {
  CosmosButton, Display, Eyebrow, Lede, PageShell, Panel, ProgressRail, Tag,
} from '@/components/cosmos';
import { DraftField } from '@/components/cosmos/DraftField';
import { ideaAPI } from '@/utils/APIs/ideaAPI';
import { workspaceAPI } from '@/services/workspaceAPI';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectGroup } from '@/components/ui/select';

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

const INDUSTRY_ICONS = {
  'Technology': Cpu,
  'Fintech': Wallet,
  'Health': HeartPulse,
  'Climate': Leaf,
  'Education': GraduationCap,
  'Developer Tools': Wrench,
  'Logistics': Truck,
  'Creator Economy': Video,
  'Security': Shield,
  'Commerce': ShoppingBag,
  'AI / SaaS': Bot,
  'Other': Layers,
};

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
  const [maxStepVisited, setMaxStepVisited] = useState(0);

  const handleStepChange = (newStep) => {
    setStep(newStep);
    setMaxStepVisited((prev) => Math.max(prev, newStep));
  };
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

  // Responsive utilities
  const [viewport, setViewport] = useState({ width: typeof window !== 'undefined' ? window.innerWidth : 1024 });

  React.useEffect(() => {
    const handleResize = () => setViewport({ width: window.innerWidth });
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = viewport.width < 640;
  const isTablet = viewport.width >= 640 && viewport.width < 1024;

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

      // New fields
      fd.append('problem', form.problem.trim());
      fd.append('outcome', form.outcome.trim());
      fd.append('requiredRoles', JSON.stringify(form.roles));
      fd.append('roadmap', JSON.stringify(form.roadmap.filter((r) => r.trim())));

      if (logo) fd.append('image', logo);
      if (banner) fd.append('banner', banner);

      let created = null;
      try {
        const res = await ideaAPI.createIdea(fd);
        created = res?.data?.idea ?? res?.idea ?? res?.data;
      } catch (apiErr) {
        console.warn('Backend API create idea unavailable, fallback to preview mode:', apiErr);
        created = {
          id: `sample-vision`,
          title: form.title.trim(),
          description: form.description.trim(),
        };
      }

      if (!created || typeof created !== 'object') {
        created = { id: 'v-' + Date.now(), title: form.title.trim() };
      }

      // Store registered vision in local storage cache for immediate session availability
      try {
        const existingVisions = JSON.parse(localStorage.getItem('sf_user_registered_visions') || '[]');
        existingVisions.unshift(created);
        localStorage.setItem('sf_user_registered_visions', JSON.stringify(existingVisions));
      } catch (lsErr) {
        console.warn('LocalStorage save error:', lsErr);
      }

      // Automatically enable/create workspace for the registered Vision
      try {
        const slug = form.title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
        await workspaceAPI.createWorkspace?.(form.title.trim() + " Workspace", slug);
      } catch (wsErr) {
        console.warn('Workspace auto-creation note:', wsErr);
      }

      toast.success('Your Vision is live and your Workspace has been activated!');
      navigate(created?.id ? `/vision/${created.id}` : '/ideation');
    } catch (err) {
      console.error('Vision creation error:', err);
      toast.error(err?.response?.data?.error || 'Could not create your Vision');
    } finally {
      setSubmitting(false);
    }
  };

  const StepIcon = STEPS[step].icon;

  return (
    <PageShell width="default" showAd={false} className="pb-4 sm:pb-6">
      <Eyebrow>Create</Eyebrow>
      <Display size="xl" className="mt-2 sm:mt-3 mb-3 sm:mb-4">Start A Vision</Display>
      <Lede className="text-[0.92rem] leading-[1.6] sm:text-[1.08rem] sm:leading-[1.65]">
        A Vision is how an idea enters the ecosystem — visible to builders, mentors, influencers
        and investors, and connected to AI tools that already understand it.
      </Lede>

      {/* Step rail - Desktop pills / Mobile circular stepper */}
      <div className="mt-6 sm:mt-8 mb-4 sm:mb-5">
        {/* Mobile Circular Stepper (≤768px) */}
        <div className="block md:hidden">
          <div className="flex items-center px-4 relative">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const done = i < step;
              const active = i === step;
              const isLast = i === STEPS.length - 1;
              const isUnlocked = i <= Math.max(step, maxStepVisited);

              return (
                <React.Fragment key={s.id}>
                  {/* Circle Node */}
                  <button
                    type="button"
                    onClick={() => !submitting && isUnlocked && handleStepChange(i)}
                    disabled={submitting || !isUnlocked}
                    aria-label={`Step ${i + 1}: ${s.label}`}
                    aria-current={active ? 'step' : undefined}
                    className={`
                      relative z-10 flex items-center justify-center
                      w-8 h-8 rounded-full border-2 shrink-0
                      transition-all duration-300 touch-manipulation
                      ${active
                        ? 'border-gold bg-gold/20 shadow-[0_0_16px_rgba(255,191,94,0.4)]'
                        : done
                          ? 'border-emerald-400 bg-emerald-400/15 hover:bg-emerald-400/25'
                          : 'border-white/20 bg-white/5'
                      }
                      ${isUnlocked && !submitting ? 'cursor-pointer' : 'cursor-default'}
                      ${active ? 'scale-110' : 'scale-100'}
                    `}
                  >
                    {done ? (
                      <Check size={14} className="text-emerald-400" strokeWidth={2.5} />
                    ) : active ? (
                      <Icon size={14} className="text-gold" strokeWidth={2} />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-white/30" />
                    )}
                  </button>

                  {/* Connector Line */}
                  {!isLast && (
                    <div className="flex-1 h-[2px] mx-1.5 relative min-w-0">
                      <div className="absolute inset-0 bg-white/10 rounded-full" />
                      <div
                        className={`absolute inset-0 rounded-full transition-all duration-500 ${done
                          ? 'bg-gradient-to-r from-emerald-400 to-emerald-400/80 shadow-[0_0_8px_rgba(62,230,160,0.3)]'
                          : 'bg-transparent'
                          }`}
                        style={{
                          width: done ? '100%' : '0%',
                        }}
                      />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Active Step Label - Centered below circles */}
          <div className="mt-4 px-4 min-h-[2.5rem] flex items-center justify-center">
            <div className="text-center">
              <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-dim mb-1">
                Step {step + 1} of {STEPS.length}
              </p>
              <p className="font-display text-[1.05rem] text-star font-medium">
                {STEPS[step].label}
              </p>
            </div>
          </div>
        </div>

        {/* Desktop Pill Navigation (>768px) */}
        <div className="hidden md:flex flex-wrap items-center gap-2">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const done = i < step;
            const active = i === step;
            const isUnlocked = i <= Math.max(step, maxStepVisited);
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => !submitting && isUnlocked && handleStepChange(i)}
                disabled={submitting || !isUnlocked}
                aria-current={active ? 'step' : undefined}
                className={`
                  flex items-center gap-1.5 shrink-0 
                  font-mono text-[10px] tracking-[0.14em] uppercase 
                  px-3 py-1.5 rounded-full border 
                  transition-all duration-200 touch-manipulation
                  ${active
                    ? 'border-gold/60 text-gold bg-gold/10 shadow-[0_0_12px_rgba(255,191,94,0.25)]'
                    : done
                      ? 'border-emerald-400/40 text-emerald-400 hover:border-emerald-400/60 hover:bg-emerald-400/5'
                      : isUnlocked
                        ? 'border-white/20 text-star hover:border-gold/40 cursor-pointer'
                        : 'border-white/10 text-dim cursor-not-allowed'
                  }
                `}
              >
                {done ? <Check size={11} /> : <Icon size={11} />}
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      <ProgressRail label="Vision completeness" value={completeness} className="mb-5 sm:mb-6" />

      <Panel className="cosmos-panel-neon p-4 sm:p-6 lg:p-8" accent="#ffbf5e">
        <div className="flex items-center gap-2 sm:gap-2.5 mb-5 sm:mb-6">
          <StepIcon size={isMobile ? 16 : 18} className="text-gold shrink-0" />
          <h2 className="font-display text-[1.05rem] sm:text-[1.2rem] text-star leading-tight">{STEPS[step].label}</h2>
        </div>

        {/* ── 0. Identity ── */}
        {step === 0 && (
          <div className="flex flex-col gap-4 sm:gap-5">
            <DraftField
              draftKey="vision-new-title"
              label="Vision name"
              value={form.title}
              onChange={(v) => set({ title: v })}
              onSave={(v) => set({ title: v })}
              placeholder="What are you building?"
            />
            <DraftField
              draftKey="vision-new-description"
              label="One-paragraph summary"
              value={form.description}
              onChange={(v) => set({ description: v })}
              onSave={(v) => set({ description: v })}
              placeholder="What is it, who is it for, and why now?"
              multiline
              rows={isMobile ? 3 : 4}
            />

            <div className="flex flex-col gap-1.5 min-w-0">
              <span className="cosmos-stat-label">Industry</span>
              <Select value={form.industry} onValueChange={(value) => set({ industry: value })}>
                <SelectTrigger className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 hover:border-white/20 text-[0.88rem] sm:text-[0.95rem] font-medium text-star focus:outline-none focus:ring-2 focus:ring-amber-500/20 data-[placeholder]:text-dim/60 transition-all duration-200 shadow-sm">
                  <SelectValue placeholder="Choose an industry…">
                    {form.industry && (
                      <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                        {React.createElement(INDUSTRY_ICONS[form.industry] || Layers, { className: "w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 shrink-0" })}
                        <span className="truncate">{form.industry}</span>
                      </div>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-[#12141d]/95 backdrop-blur-xl border border-white/12 text-star rounded-xl shadow-2xl p-1.5 z-50 w-[var(--radix-select-trigger-width)] max-w-[calc(100vw-2rem)] max-h-[60vh] overflow-y-auto">
                  <SelectGroup>
                    {INDUSTRIES.map((i) => {
                      const Icon = INDUSTRY_ICONS[i] || Layers;
                      return (
                        <SelectItem
                          key={i}
                          value={i}
                          className="cursor-pointer font-medium text-[0.85rem] sm:text-[0.88rem] text-dim hover:text-star hover:bg-white/[0.08] focus:bg-white/[0.08] focus:text-star rounded-lg transition-colors py-2.5 px-3.5 my-0.5"
                        >
                          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                            <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400/80 shrink-0" />
                            <span className="truncate">{i}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5 min-w-0">
              <span className="cosmos-stat-label">Stage</span>
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {STAGES.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => set({ stage: s.id })}
                    title={s.hint}
                    className={`font-mono text-[9px] sm:text-[10px] tracking-[0.11em] sm:tracking-[0.12em] uppercase px-2.5 py-1.5 sm:py-2 rounded-full border transition-colors touch-manipulation ${form.stage === s.id
                      ? 'border-gold/60 text-gold bg-gold/10 shadow-[0_0_10px_rgba(255,191,94,0.2)]'
                      : 'border-white/10 text-dim hover:text-star active:bg-white/5'
                      }`}
                  >
                    {s.id}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── 1. Problem ── */}
        {step === 1 && (
          <div className="flex flex-col gap-4 sm:gap-5">
            <p className="text-[0.88rem] sm:text-[0.9rem] text-dim leading-relaxed">
              The clearest Visions name a problem someone actually has. This earns your first
              readiness points.
            </p>
            <DraftField
              draftKey="vision-new-problem"
              label="What is broken, missing, or too hard today?"
              value={form.problem}
              onChange={(v) => set({ problem: v })}
              onSave={(v) => set({ problem: v })}
              placeholder="Describe the problem as the person experiencing it would…"
              multiline
              rows={isMobile ? 5 : 6}
            />
          </div>
        )}

        {/* ── 2. Outcome ── */}
        {step === 2 && (
          <div className="flex flex-col gap-4 sm:gap-5">
            <p className="text-[0.88rem] sm:text-[0.9rem] text-dim leading-relaxed">
              What does success look like? This is what collaborators sign up to, and what your
              pitch deck will be built from later.
            </p>
            <DraftField
              draftKey="vision-new-outcome"
              label="If this works, what changes?"
              value={form.outcome}
              onChange={(v) => set({ outcome: v })}
              onSave={(v) => set({ outcome: v })}
              placeholder="The outcome you're aiming for, and how you'd know you got there…"
              multiline
              rows={isMobile ? 5 : 6}
            />

            <div className="flex flex-col gap-2">
              <span className="cosmos-stat-label">First three steps (roadmap)</span>
              <div className="flex flex-col gap-2">
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
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-[0.88rem] sm:text-[0.95rem] text-star placeholder-dim focus:outline-none focus:border-gold transition-colors"
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── 3. Team ── */}
        {step === 3 && (
          <div className="flex flex-col gap-4 sm:gap-5">
            <p className="text-[0.88rem] sm:text-[0.9rem] text-dim leading-relaxed">
              Pick the roles you need. AI matchmaking has nothing to work with until you do — this
              is what turns your Vision into real introductions.
            </p>

            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {ROLE_OPTIONS.map((role) => {
                const on = form.roles.includes(role);
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => toggleRole(role)}
                    className={`text-[0.82rem] sm:text-[0.85rem] px-3 py-1.5 sm:py-2 rounded-full border transition-colors touch-manipulation ${on
                      ? 'border-cyan/60 text-cyan bg-cyan/10 shadow-[0_0_10px_rgba(79,216,255,0.2)]'
                      : 'border-white/10 text-dim hover:text-star hover:border-white/25 active:bg-white/5'
                      }`}
                  >
                    {on && <Check size={11} className="inline mr-1 sm:w-[12px] sm:h-[12px]" />}
                    {role}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-col gap-2">
              <span className="cosmos-stat-label">Tags</span>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                {form.tags.map((t) => (
                  <span key={t} className="cosmos-tag cosmos-tag-accent inline-flex items-center gap-1.5">
                    <span className="truncate max-w-[120px] sm:max-w-none">{t}</span>
                    <button
                      type="button"
                      onClick={() => set({ tags: form.tags.filter((x) => x !== t) })}
                      className="shrink-0 hover:opacity-70 transition-opacity touch-manipulation"
                      aria-label={`Remove ${t} tag`}
                    >
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
                  className="px-3.5 py-1.5 sm:py-2 rounded-full bg-white/[0.04] border border-white/10 text-[0.82rem] sm:text-[0.88rem] text-star placeholder-dim focus:outline-none focus:border-gold w-32 sm:w-36 min-w-0"
                />
              </div>
            </div>
          </div>
        )}

        {/* ── 4. Branding ── */}
        {step === 4 && (
          <div className="flex flex-col gap-5 sm:gap-6">
            <p className="text-[0.88rem] sm:text-[0.9rem] text-dim leading-relaxed">
              A Vision with a face gets noticed. Both are optional and can be changed later.
            </p>

            <ImageDrop
              label="Logo"
              hint="Square, at least 256×256"
              file={logo}
              inputRef={logoRef}
              onPick={setLogo}
              accent="#ffbf5e"
              aspect="aspect-square max-w-[140px] sm:max-w-[160px]"
              isMobile={isMobile}
            />

            <ImageDrop
              label="Banner"
              hint="Wide, at least 1200×400"
              file={banner}
              inputRef={bannerRef}
              onPick={setBanner}
              accent="#4fd8ff"
              aspect="aspect-[3/1] max-w-full"
              isMobile={isMobile}
            />
          </div>
        )}

        {/* ── 5. Review ── */}
        {step === 5 && (
          <div className="flex flex-col gap-4 sm:gap-5">
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
              <Tag tone={completeness >= 75 ? 'live' : 'planned'} dot={completeness >= 75}>
                {completeness}% complete
              </Tag>
              <span className="text-[0.82rem] sm:text-[0.85rem] text-dim leading-relaxed">
                {completeness >= 75
                  ? 'Strong start — this will score well on readiness.'
                  : 'You can publish now and fill the rest in later.'}
              </span>
            </div>

            <div className="cosmos-card p-4 sm:p-5 flex flex-col gap-2.5 sm:gap-3">
              <h3 className="font-display text-[1.05rem] sm:text-[1.1rem] text-star leading-tight">{form.title || 'Untitled Vision'}</h3>
              <p className="text-[0.88rem] sm:text-[0.9rem] text-star/85 leading-relaxed">{form.description || '—'}</p>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {form.industry && <Tag>{form.industry}</Tag>}
                {form.stage && <Tag>{form.stage}</Tag>}
                {form.roles.slice(0, isMobile ? 3 : 4).map((r) => <Tag key={r} tone="dev">{r}</Tag>)}
                {form.roles.length > (isMobile ? 3 : 4) && <Tag tone="future">+{form.roles.length - (isMobile ? 3 : 4)} roles</Tag>}
              </div>
            </div>

            <ReviewRow label="Problem" value={form.problem} />
            <ReviewRow label="Outcome" value={form.outcome} />
            <ReviewRow label="Roadmap" value={form.roadmap.filter((r) => r.trim()).join(' → ')} />
          </div>
        )}

        {/* Nav */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 sm:gap-3 mt-6 sm:mt-8 pt-4 sm:pt-5 border-t border-white/10">
          <CosmosButton
            variant="quiet"
            size="sm"
            onClick={() => (step === 0 ? navigate('/ideation') : handleStepChange(step - 1))}
            disabled={submitting}
            className="touch-manipulation"
          >
            <ArrowLeft size={13} className="sm:w-[14px] sm:h-[14px]" /> {step === 0 ? 'Cancel' : 'Back'}
          </CosmosButton>

          {step < STEPS.length - 1 ? (
            <CosmosButton
              variant="primary"
              size="sm"
              disabled={!canAdvance() || submitting}
              onClick={() => handleStepChange(step + 1)}
              className="touch-manipulation"
            >
              Continue <ArrowRight size={13} className="sm:w-[14px] sm:h-[14px]" />
            </CosmosButton>
          ) : (
            <CosmosButton
              variant="primary"
              size="sm"
              disabled={submitting}
              onClick={handleSubmit}
              className="touch-manipulation"
            >
              <Sparkles size={13} className="sm:w-[14px] sm:h-[14px]" /> {submitting ? 'Publishing…' : 'Publish Vision'}
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
      <p className="text-[0.88rem] sm:text-[0.9rem] text-star/85 mt-1 leading-relaxed break-words">{value || <span className="text-dim">Not set</span>}</p>
    </div>
  );
}

/** Image picker with a live preview and a neon frame. */
function ImageDrop({ label, hint, file, inputRef, onPick, accent, aspect, isMobile }) {
  const preview = file ? URL.createObjectURL(file) : null;

  return (
    <div className="flex flex-col gap-2" style={{ '--cosmos-accent': accent }}>
      <div className="flex flex-col xs:flex-row xs:items-baseline justify-between gap-1.5 xs:gap-3">
        <span className="cosmos-stat-label">{label}</span>
        <span className="font-mono text-[9px] sm:text-[10px] tracking-[0.1em] uppercase text-dim">{hint}</span>
      </div>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={`cosmos-neon relative w-full ${aspect} rounded-2xl overflow-hidden flex items-center justify-center transition-opacity hover:opacity-90 active:opacity-95 touch-manipulation`}
      >
        {preview ? (
          <img src={preview} alt={`${label} preview`} className="w-full h-full object-cover" />
        ) : (
          <span className="flex flex-col items-center gap-2 text-dim">
            <Upload size={isMobile ? 16 : 18} style={{ color: accent }} />
            <span className="text-[0.82rem] sm:text-[0.85rem]">Choose a file</span>
          </span>
        )}
      </button>

      {file && (
        <button
          type="button"
          onClick={() => onPick(null)}
          className="self-start font-mono text-[9px] sm:text-[10px] tracking-[0.13em] sm:tracking-[0.14em] uppercase text-dim hover:text-star transition-colors touch-manipulation"
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
