import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight, BadgeCheck, BrainCircuit, Check, Coins, FolderOpen, GraduationCap,
  Lightbulb, Megaphone, Rocket, Sparkles, TrendingUp, Users, Video, X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";
import { CosmosButton, Eyebrow, ProgressRail, Tag, Wordmark } from "@/components/cosmos";
import { roleAccent } from "@/components/cosmos/roles";

/**
 * The onboarding tour.
 *
 * Replaces a react-joyride walkthrough that showed the same six generic steps to
 * everyone and styled its buttons via props, so the theme never reached it.
 *
 * Each role now gets its own tour describing what *that* role actually does
 * here, and every tour closes on the same promise screen — the reason the whole
 * ecosystem exists.
 *
 * Progress is stored per role, so switching roles offers that role's tour once.
 */

const PROMISE = {
  id: "promise",
  icon: Sparkles,
  eyebrow: "Why this exists",
  title: "You will not have to do this the hard way.",
  body:
    "Starting something usually means doing five jobs badly, paying for tools you cannot afford, and hoping the right person happens to find you. That is the part we are dismantling.",
  points: [
    "The work you would normally outsource — plans, decks, landing pages, content — generated from your own project context.",
    "The people you would normally spend months hunting — matched to the roles you actually need.",
    "The money that normally gates everything — replaced by contribution, credits and crowdfunding from day one.",
    "The knowledge you would normally lose — kept, connected, and reused automatically.",
  ],
  closing:
    "And because every Vision built here makes the system sharper, you are not just building your company — you are building the thing that carries the next person further. Thousands of people walking the same direction, automated, compounding.",
};

const TOURS = {
  founder: [
    { icon: Lightbulb, eyebrow: "Step one", title: "Start with a Vision.", body: "Your idea does not have to pretend to be a company yet. Register it as a Vision, describe the problem and the outcome, and let it exist at the stage it is actually in.", cta: { label: "Create a Vision", to: "/vision/new" } },
    { icon: Users, eyebrow: "Step two", title: "Let the ecosystem find your team.", body: "Name the roles you need and AI matchmaking surfaces builders, designers and marketers whose skills fit. Ten matches a day are included; message several at once when you find the right ones." },
    { icon: BrainCircuit, eyebrow: "Step three", title: "Build without starting from an empty page.", body: "Business plan, landing page, logo, content — all generated from your Vision's context, so you describe your company once instead of once per tool." },
    { icon: TrendingUp, eyebrow: "Step four", title: "Prove it with signals.", body: "Every milestone you complete earns readiness points. Hit the threshold and your Vision converts into a Startup — which unlocks crowdfunding from day one." },
    { icon: FolderOpen, eyebrow: "Step five", title: "Keep what you learn.", body: "SF Drive and SF Meet keep files, decisions and meetings attached to the project, so nothing is lost and your assistant keeps getting more useful." },
    PROMISE,
  ],
  builder: [
    { icon: Rocket, eyebrow: "Step one", title: "Find work worth doing.", body: "Browse Visions and Startups that need your exact skills. Filter to what you are good at, not what a job board thinks you are.", cta: { label: "Browse startups", to: "/discover-startups" } },
    { icon: Check, eyebrow: "Step two", title: "Contribute real work.", body: "Join a team, take tasks, ship them. Everything you complete is recorded — this becomes proof of what you can do, not a self-description." },
    { icon: BadgeCheck, eyebrow: "Step three", title: "Build a reputation that travels.", body: "Reputation here comes from contribution quality, reliability and outcomes. Founders search on it, so it opens the next door for you." },
    { icon: Coins, eyebrow: "Step four", title: "Get paid, in more than one way.", body: "Cash, equity promises, SF Coins and reputation. Track all of it in Rewards, and stake your coins in draws for credits and upgrades." },
    PROMISE,
  ],
  mentor: [
    { icon: GraduationCap, eyebrow: "Step one", title: "Find teams worth your time.", body: "See founders and builders actively asking for guidance in your areas of expertise — not cold outreach, people who want help.", cta: { label: "Find people to mentor", to: "/mentors?seeking=1" } },
    { icon: Users, eyebrow: "Step two", title: "Guide the work, not just the meeting.", body: "You see the roadmap, the decisions and the real execution. Your input lands on something concrete instead of a monthly catch-up call." },
    { icon: BadgeCheck, eyebrow: "Step three", title: "Your track record compounds.", body: "Outcomes you influenced become part of your standing here, which moves you up the mentor directory and brings better projects to you." },
    PROMISE,
  ],
  influencer: [
    { icon: Rocket, eyebrow: "Step one", title: "Find what deserves attention.", body: "Discover projects approaching launch that need an audience — early, before everyone else is talking about them.", cta: { label: "Find launches", to: "/discover-startups?stage=launching" } },
    { icon: Megaphone, eyebrow: "Step two", title: "Create without the blank page.", body: "Caption and video generators build from the startup's real positioning, so what you publish is accurate as well as fast." },
    { icon: TrendingUp, eyebrow: "Step three", title: "Your impact is measured.", body: "Reach, traction and launches you supported are recorded — so your contribution is provable, not anecdotal." },
    PROMISE,
  ],
  investor: [
    { icon: TrendingUp, eyebrow: "Step one", title: "See potential early.", body: "Browse Visions and Startups with live readiness scores, team activity and real traction signals — before they are polished for a pitch.", cta: { label: "Discover startups", to: "/discover-startups" } },
    { icon: Users, eyebrow: "Step two", title: "Watch execution, not decks.", body: "Follow a project and you see what actually happens: milestones hit, people joining, decisions made. Diligence from primary evidence." },
    { icon: BadgeCheck, eyebrow: "Step three", title: "Reach founders directly.", body: "No warm-intro lottery. Contact teams whose progress you have been tracking, at the moment it makes sense." },
    PROMISE,
  ],
  member: [
    { icon: Lightbulb, eyebrow: "Step one", title: "Choose how you want to build.", body: "Founder, builder, mentor, influencer or investor — each one gives you a different dashboard, different tools and different opportunities. You can hold more than one." },
    { icon: Rocket, eyebrow: "Step two", title: "Explore what people are building.", body: "Browse active Visions and Startups. Follow what interests you, save what you might join.", cta: { label: "Explore Visions", to: "/ideation" } },
    { icon: Video, eyebrow: "Step three", title: "Everything in one place.", body: "SF Drive for files, SF Meet for calls, the assistant for everything else — all sharing the same project context." },
    PROMISE,
  ],
};

export default function DashboardTutorial({ activeRole = "member" }) {
  const { user } = useSelector((state) => state.auth);
  const role = TOURS[activeRole] ? activeRole : "member";
  const steps = TOURS[role];
  const accent = roleAccent(role);
  const storageKey = `sfc.tour.${role}`;

  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    try {
      if (localStorage.getItem(storageKey) !== "done") {
        setIndex(0);
        setOpen(true);
      }
    } catch {
      /* storage blocked — simply don't show the tour */
    }
  }, [storageKey]);

  const finish = () => {
    try { localStorage.setItem(storageKey, "done"); } catch { /* noop */ }
    setOpen(false);
  };

  const step = steps[index];
  const isPromise = step?.id === "promise";
  const StepIcon = step?.icon || Sparkles;
  const progress = useMemo(() => ((index + 1) / steps.length) * 100, [index, steps.length]);

  if (!open || !step) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        role="dialog"
        aria-modal="true"
        aria-label={`${accent.label} walkthrough`}
      >
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 14, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="cosmos-panel cosmos-panel-neon relative w-full max-w-xl p-7 sm:p-9"
          style={{ "--cosmos-accent": accent.color }}
        >
          <button
            onClick={finish}
            aria-label="Skip walkthrough"
            className="absolute top-4 right-4 p-1.5 rounded-lg text-dim hover:text-star hover:bg-white/[0.06] transition-colors"
          >
            <X size={16} />
          </button>

          {isPromise ? (
            <>
              <Wordmark as="p" className="text-[1.7rem] mb-1" />
              <Eyebrow className="mb-4">{step.eyebrow}</Eyebrow>
              <h2 className="font-display text-[1.5rem] sm:text-[1.75rem] text-star leading-tight mb-4">
                {step.title}
              </h2>
              <p className="text-[0.95rem] text-star/85 mb-5">{step.body}</p>

              <ul className="flex flex-col gap-2.5 mb-5">
                {step.points.map((p) => (
                  <li key={p} className="flex items-start gap-2.5 text-[0.9rem] text-dim">
                    <Check size={14} className="mt-0.5 shrink-0" style={{ color: accent.color }} />
                    {p}
                  </li>
                ))}
              </ul>

              <div className="cosmos-rule mb-4" />
              <p className="text-[0.95rem] text-star/90">{step.closing}</p>
            </>
          ) : (
            <>
              <span
                className="inline-flex items-center justify-center w-11 h-11 rounded-2xl mb-5"
                style={{ background: `${accent.color}1f`, color: accent.color }}
              >
                <StepIcon size={20} />
              </span>

              <div className="flex items-center gap-2.5 mb-3">
                <Eyebrow>{step.eyebrow}</Eyebrow>
                <Tag tone="neutral">{accent.label}</Tag>
              </div>

              <h2 className="font-display text-[1.4rem] sm:text-[1.6rem] text-star leading-tight mb-3">
                {step.title}
              </h2>
              <p className="text-[0.95rem] text-star/85">{step.body}</p>

              {step.cta && (
                <CosmosButton variant="quiet" size="sm" className="mt-5" asChild>
                  <Link to={step.cta.to} onClick={finish}>
                    {step.cta.label} <ArrowRight size={13} />
                  </Link>
                </CosmosButton>
              )}
            </>
          )}

          <div className="mt-7">
            <ProgressRail
              label={`Step ${index + 1} of ${steps.length}`}
              value={progress}
              showValue={false}
            />
          </div>

          <div className="flex items-center justify-between gap-3 mt-5">
            <button
              onClick={finish}
              className="font-mono text-[10px] tracking-[0.14em] uppercase text-dim hover:text-star transition-colors"
            >
              Skip
            </button>

            <div className="flex items-center gap-2">
              {index > 0 && (
                <CosmosButton variant="quiet" size="sm" onClick={() => setIndex(index - 1)}>
                  Back
                </CosmosButton>
              )}
              {index < steps.length - 1 ? (
                <CosmosButton variant="primary" size="sm" onClick={() => setIndex(index + 1)}>
                  Next <ArrowRight size={13} />
                </CosmosButton>
              ) : (
                <CosmosButton variant="primary" size="sm" onClick={finish}>
                  <Sparkles size={13} /> Let's build
                </CosmosButton>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
