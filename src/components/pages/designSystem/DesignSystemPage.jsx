import React, { useState } from 'react';
import { Sparkles, Rocket, Users, Wallet, TrendingUp, Share2 } from 'lucide-react';
import {
  Panel,
  Card,
  Eyebrow,
  Display,
  Lede,
  Tag,
  StatTile,
  ProgressRail,
  StepPath,
  Wordmark,
  CosmosButton,
  Reveal,
  RoleTabs,
  ROLE_ACCENTS,
  ROLE_ORDER,
  roleAccentVars,
} from '@/components/cosmos';

/**
 * Live reference for the cosmos design system — every token, primitive and
 * motion in one place, so the theme can be reviewed as a whole rather than
 * judged screen by screen. Public route: /design-system
 */

const SWATCHES = [
  { name: 'void', hex: '#050309', use: 'Page background' },
  { name: 'deep', hex: '#0b1026', use: 'Nebula blend' },
  { name: 'panel', hex: '#0d0a1a', use: 'Panel fill' },
  { name: 'gold', hex: '#ffbf5e', use: 'The spark — primary CTA, ideas' },
  { name: 'violet', hex: '#8b6cff', use: 'Intelligence layer — AI' },
  { name: 'cyan', hex: '#4fd8ff', use: 'Structure — product UI' },
  { name: 'magenta', hex: '#ff4fd8', use: 'Momentum — promotion' },
  { name: 'emerald', hex: '#3ee6a0', use: 'Live status — validation' },
  { name: 'star', hex: '#f2effa', use: 'Primary text' },
  { name: 'dim', hex: '#a9a2c2', use: 'Muted text' },
];

const JOURNEY = [
  { title: 'Create a Vision', description: 'Give your idea structure and make it visible.', done: true },
  { title: 'Validate through signals', description: 'Feedback, support and early interest.', done: true },
  { title: 'Launch your MVP', description: 'Developed from your Vision context.', done: false },
  { title: 'Build momentum', description: 'Content, socials and team building.', done: false },
  { title: 'Convert to a Startup', description: 'Conversion unlocks crowdfunding.', done: false },
];

function Section({ eyebrow, title, children }) {
  return (
    <Reveal as="section" className="w-full max-w-[1120px] mx-auto px-5 py-10">
      <Panel className="p-6 sm:p-9">
        <Eyebrow>{eyebrow}</Eyebrow>
        <Display size="lg" className="mt-4 mb-6">{title}</Display>
        {children}
      </Panel>
    </Reveal>
  );
}

export default function DesignSystemPage() {
  const [role, setRole] = useState('founder');
  const [progress, setProgress] = useState(62);

  return (
    <div className="relative min-h-screen w-full">
      <div className="fixed inset-0 z-0 cosmos-atmosphere" aria-hidden="true" />
      <div className="fixed inset-0 z-0 cosmos-vignette pointer-events-none" aria-hidden="true" />

      <div className="relative z-10 pb-24">
        {/* ---- Masthead ---- */}
        <header className="w-full max-w-[1120px] mx-auto px-5 pt-16 pb-4 text-center">
          <Wordmark as="h1" className="text-[clamp(2.2rem,6vw,3.6rem)]">SFCollab</Wordmark>
          <p className="font-mono text-[12.5px] tracking-[0.3em] uppercase text-dim mt-3">
            Cosmos design system
          </p>
          <Lede className="mx-auto mt-5 text-center">
            The product's visual language, shared with the landing page. Every colour below
            carries a fixed meaning — this is a vocabulary, not a palette.
          </Lede>
        </header>

        {/* ---- Colour ---- */}
        <Section eyebrow="01 — Foundation" title="Colour carries meaning.">
          <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(210px,1fr))]">
            {SWATCHES.map((s) => (
              <Card key={s.name} className="flex items-center gap-3.5">
                <span
                  className="w-11 h-11 rounded-xl shrink-0 border border-white/10"
                  style={{ background: s.hex }}
                  aria-hidden="true"
                />
                <span className="min-w-0">
                  <span className="block font-mono text-[11px] tracking-[0.14em] uppercase text-star">
                    {s.name}
                  </span>
                  <span className="block font-mono text-[10.5px] text-dim">{s.hex}</span>
                  <span className="block text-[0.82rem] text-dim mt-0.5">{s.use}</span>
                </span>
              </Card>
            ))}
          </div>

          <h3 className="font-display text-[1.05rem] mt-9 mb-3">Global recolour</h3>
          <p className="text-dim max-w-[70ch] text-[0.95rem]">
            The app's existing Tailwind utilities were not rewritten. Each colour family was
            redefined at token level, so every <code className="font-mono text-cyan">bg-blue-500</code>{' '}
            already in the codebase now resolves to cosmos cyan, every{' '}
            <code className="font-mono text-violet">purple-500</code> to violet, and every{' '}
            <code className="font-mono text-gold">amber-400</code> to gold.
          </p>
          <div className="grid gap-3 mt-5 [grid-template-columns:repeat(auto-fit,minmax(150px,1fr))]">
            {[
              ['blue / sky', 'bg-blue-500', 'cyan'],
              ['purple / indigo', 'bg-purple-500', 'violet'],
              ['amber / yellow', 'bg-amber-400', 'gold'],
              ['pink / fuchsia', 'bg-pink-500', 'magenta'],
              ['green / emerald', 'bg-emerald-400', 'emerald'],
              ['slate / gray / zinc', 'bg-slate-700', 'void neutral'],
            ].map(([from, cls, to]) => (
              <div key={from} className="cosmos-card p-3.5">
                <div className={`${cls} h-7 rounded-lg mb-2.5`} aria-hidden="true" />
                <p className="font-mono text-[10px] tracking-[0.1em] uppercase text-dim">{from}</p>
                <p className="font-mono text-[10px] tracking-[0.1em] uppercase text-star">→ {to}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* ---- Type ---- */}
        <Section eyebrow="02 — Foundation" title="Three typefaces, three jobs.">
          <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(300px,1fr))]">
            <Card>
              <Eyebrow className="mb-3">Unbounded — display</Eyebrow>
              <p className="font-display text-[1.7rem] leading-tight">Turn one idea</p>
              <p className="font-display text-[1.7rem] leading-tight">into a startup.</p>
              <p className="text-[0.85rem] text-dim mt-3">Headings only. Never body copy.</p>
            </Card>
            <Card>
              <Eyebrow className="mb-3">Outfit — body</Eyebrow>
              <p className="text-star">
                A Vision is the beginning of a potential startup — an idea given structure,
                made visible to the ecosystem.
              </p>
              <p className="text-[0.85rem] text-dim mt-3">
                400 at 15.5px in the app; the landing page runs 300 at 17px.
              </p>
            </Card>
            <Card>
              <Eyebrow className="mb-3">JetBrains Mono — labels</Eyebrow>
              <p className="font-mono text-[11.5px] tracking-[0.34em] uppercase text-gold">
                Chapter 04 — mission path
              </p>
              <p className="font-mono text-[10.5px] tracking-[0.18em] uppercase text-dim mt-2.5">
                Active visions · 1,284
              </p>
              <p className="text-[0.85rem] text-dim mt-3">Eyebrows, tags, metrics, captions.</p>
            </Card>
          </div>

          <div className="mt-8 flex flex-col gap-3">
            <Display size="xl">Display xl — the statement</Display>
            <Display size="lg">Display lg — panel heading</Display>
            <Display size="md">Display md — subsection</Display>
            <Display size="sm">Display sm — card title</Display>
          </div>
        </Section>

        {/* ---- Buttons ---- */}
        <Section eyebrow="03 — Primitives" title="Buttons, with a spark in orbit.">
          <p className="text-dim max-w-[70ch] text-[0.95rem] mb-6">
            A conic gradient orbits each button's border and accelerates on hover. Variants are
            semantic — gold is the one main action per screen, violet means AI, magenta means
            reach an audience.
          </p>

          <div className="flex flex-wrap gap-3.5 items-center">
            <CosmosButton variant="primary">Create Your Vision</CosmosButton>
            <CosmosButton variant="ghost">Explore Visions</CosmosButton>
            <CosmosButton variant="ai"><Sparkles size={16} /> Ask the assistant</CosmosButton>
            <CosmosButton variant="promo"><Share2 size={16} /> Share</CosmosButton>
            <CosmosButton variant="quiet">Cancel</CosmosButton>
            <CosmosButton variant="primary" disabled>Disabled</CosmosButton>
          </div>

          <h3 className="font-display text-[1.05rem] mt-8 mb-3.5">Sizes</h3>
          <div className="flex flex-wrap gap-3.5 items-center">
            <CosmosButton variant="ghost" size="sm">Small</CosmosButton>
            <CosmosButton variant="ghost" size="md">Medium</CosmosButton>
            <CosmosButton variant="ghost" size="lg">Large</CosmosButton>
            <CosmosButton variant="ghost" size="icon" aria-label="Launch"><Rocket size={16} /></CosmosButton>
          </div>
        </Section>

        {/* ---- Tags ---- */}
        <Section eyebrow="04 — Primitives" title="Status at a glance.">
          <div className="flex flex-wrap gap-2.5">
            <Tag tone="live" dot>Live</Tag>
            <Tag tone="dev">In development</Tag>
            <Tag tone="planned">Planned</Tag>
            <Tag tone="future">Long-term</Tag>
            <Tag tone="demo">Demo</Tag>
            <Tag tone="accent">Featured</Tag>
            <Tag>Neutral</Tag>
          </div>
          <p className="text-[0.85rem] text-dim mt-4">
            The pulsing dot is reserved for state that is genuinely live right now — used
            everywhere it stops meaning anything.
          </p>
        </Section>

        {/* ---- Roles ---- */}
        <Section eyebrow="05 — Primitives" title="Five profiles, five colours.">
          <p className="text-dim max-w-[70ch] text-[0.95rem] mb-6">
            The same mapping as the landing page. Whichever profile you're working as, the
            sidebar, dashboard accents and badges follow it — so the app always tells you which
            hat you're wearing.
          </p>

          <RoleTabs value={role} onChange={setRole} />

          <div className="mt-7" style={roleAccentVars(role)}>
            <Panel role={role} className="p-6">
              <Eyebrow>{ROLE_ACCENTS[role].label} workspace</Eyebrow>
              <Display size="md" className="mt-3 mb-4">
                The panel takes the active role's accent.
              </Display>
              <div className="grid gap-3.5 [grid-template-columns:repeat(auto-fit,minmax(190px,1fr))]">
                <StatTile label="Contributions" value="184" delta={12} role={role} />
                <StatTile label="Reputation" value="2,940" delta={-3} role={role} />
                <StatTile label="Streak" value="17d" hint="Personal best" role={role} icon={<TrendingUp size={16} />} />
              </div>
            </Panel>
          </div>

          <div className="grid gap-3.5 mt-5 [grid-template-columns:repeat(auto-fit,minmax(170px,1fr))]">
            {ROLE_ORDER.map((r) => (
              <Card key={r} interactive role={r} className="flex items-center gap-3">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ background: ROLE_ACCENTS[r].color, boxShadow: `0 0 10px ${ROLE_ACCENTS[r].color}` }}
                  aria-hidden="true"
                />
                <span>
                  <span className="block text-star text-[0.95rem]">{ROLE_ACCENTS[r].label}</span>
                  <span className="block font-mono text-[10px] text-dim">{ROLE_ACCENTS[r].color}</span>
                </span>
              </Card>
            ))}
          </div>
        </Section>

        {/* ---- Progression ---- */}
        <Section eyebrow="06 — Gamification" title="Progress you can feel.">
          <div className="grid gap-7 [grid-template-columns:repeat(auto-fit,minmax(300px,1fr))]">
            <div>
              <Eyebrow className="mb-4">Step path</Eyebrow>
              <StepPath steps={JOURNEY} />
            </div>

            <div className="flex flex-col gap-6">
              <div>
                <Eyebrow className="mb-4">Progress rail</Eyebrow>
                <div className="flex flex-col gap-4">
                  <ProgressRail label="Profile completeness" value={progress} />
                  <ProgressRail label="Milestone: MVP launch" value={38} />
                  <ProgressRail label="Crowdfunding goal" value={81} />
                </div>
                <div className="flex gap-2.5 mt-5">
                  <CosmosButton variant="quiet" size="sm" onClick={() => setProgress((p) => Math.max(0, p - 10))}>
                    −10%
                  </CosmosButton>
                  <CosmosButton variant="quiet" size="sm" onClick={() => setProgress((p) => Math.min(100, p + 10))}>
                    +10%
                  </CosmosButton>
                </div>
              </div>

              <div>
                <Eyebrow className="mb-4">Stat tiles</Eyebrow>
                <div className="grid gap-3.5 [grid-template-columns:repeat(auto-fit,minmax(150px,1fr))]">
                  <StatTile label="Wallet" value="1,204" hint="SF points" icon={<Wallet size={16} />} />
                  <StatTile label="Team" value="7" hint="Active builders" icon={<Users size={16} />} />
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* ---- Surfaces ---- */}
        <Section eyebrow="07 — Primitives" title="Panels hold, cards list.">
          <p className="text-dim max-w-[70ch] text-[0.95rem] mb-6">
            One Panel per logical block, Cards for the items inside it. Panels never nest.
            Interactive cards lift and take their accent on hover — try one.
          </p>
          <div className="grid gap-3.5 [grid-template-columns:repeat(auto-fit,minmax(250px,1fr))]">
            <Card interactive accent="#ffbf5e">
              <h4 className="font-display text-[1rem] mb-2">Describe the problem</h4>
              <p className="text-[0.92rem] text-dim">Define the opportunity and the proposed solution.</p>
            </Card>
            <Card interactive accent="#4fd8ff">
              <h4 className="font-display text-[1rem] mb-2">Attract early signals</h4>
              <p className="text-[0.92rem] text-dim">Gather feedback and develop the concept in the open.</p>
            </Card>
            <Card interactive accent="#8b6cff">
              <h4 className="font-display text-[1rem] mb-2">Invite others in</h4>
              <p className="text-[0.92rem] text-dim">Bring builders, mentors and investors into the journey.</p>
            </Card>
          </div>
        </Section>

        {/* ---- Motion ---- */}
        <Section eyebrow="08 — Motion" title="Everything arrives from below.">
          <p className="text-dim max-w-[70ch] text-[0.95rem] mb-6">
            Content fades up and unblurs as it enters the viewport, staggered in sequence. Each
            panel on this page did it. All of it is disabled under{' '}
            <code className="font-mono text-cyan">prefers-reduced-motion</code>.
          </p>
          <Reveal stagger className="grid gap-3.5 [grid-template-columns:repeat(auto-fit,minmax(140px,1fr))]">
            {['Vision', 'Signals', 'MVP', 'Team', 'Startup', 'V1'].map((step, i) => (
              <div key={step} className="cosmos-card p-4 text-center">
                <span className="font-mono text-[10px] text-gold">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="block font-display text-[0.95rem] mt-1.5">{step}</span>
              </div>
            ))}
          </Reveal>
        </Section>
      </div>
    </div>
  );
}
