import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Sparkles, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CosmosButton } from './CosmosButton';
import { Eyebrow, ProgressRail, Tag, Wordmark } from './primitives';
import { roleAccent } from './roles';

/**
 * The one tour component.
 *
 * Replaces four separate react-joyride tutorials (dashboard, ideation, AI tools,
 * posts) that each shipped their own copy, their own progress key, and their own
 * button styling — joyride styles via props, so the cosmos theme never reached
 * any of them.
 *
 *   <PageTour tourKey="vision" role={activeRole} steps={VISION_TOUR} />
 *
 * Steps are plain objects:
 *   { icon, eyebrow, title, body, cta?: { label, to }, points?: [], closing? }
 *
 * A step carrying `points` renders as a finale panel (used for the promise
 * screen every tour ends on). Progress is stored per tour *and* per role, so a
 * founder and a builder each see their own version once.
 *
 * Pass `autoStart={false}` to make it manual-only via `openTour(tourKey)`.
 */
export function PageTour({ tourKey, role = 'member', steps = [], autoStart = true }) {
  const accent = roleAccent(role);
  const storageKey = `sfc.tour.${tourKey}.${role}`;

  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!autoStart || !steps.length) return;
    try {
      if (localStorage.getItem(storageKey) !== 'done') {
        setIndex(0);
        setOpen(true);
      }
    } catch {
      /* storage blocked — just don't show it */
    }
  }, [storageKey, autoStart, steps.length]);

  // Any page can re-open its own tour: window.dispatchEvent(
  //   new CustomEvent('sfc:open-tour', { detail: 'vision' }))
  useEffect(() => {
    const handler = (e) => {
      if (!e.detail || e.detail === tourKey) {
        setIndex(0);
        setOpen(true);
      }
    };
    window.addEventListener('sfc:open-tour', handler);
    return () => window.removeEventListener('sfc:open-tour', handler);
  }, [tourKey]);

  const finish = () => {
    try { localStorage.setItem(storageKey, 'done'); } catch { /* noop */ }
    setOpen(false);
  };

  const step = steps[index];
  const progress = useMemo(
    () => (steps.length ? ((index + 1) / steps.length) * 100 : 0),
    [index, steps.length]
  );

  if (!open || !step) return null;

  const StepIcon = step.icon || Sparkles;
  const isFinale = Array.isArray(step.points) && step.points.length > 0;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        role="dialog"
        aria-modal="true"
        aria-label={`${tourKey} walkthrough`}
      >
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 14, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="cosmos-panel cosmos-panel-neon relative w-full max-w-xl p-7 sm:p-9 max-h-[88vh] overflow-y-auto scrollbar-visible"
          style={{ '--cosmos-accent': accent.color }}
        >
          <button
            onClick={finish}
            aria-label="Skip walkthrough"
            className="absolute top-4 right-4 p-1.5 rounded-lg text-dim hover:text-star hover:bg-white/[0.06] transition-colors"
          >
            <X size={16} />
          </button>

          {isFinale ? (
            <>
              <Wordmark as="p" className="text-[1.7rem] mb-1" />
              <Eyebrow className="mb-4">{step.eyebrow}</Eyebrow>
              <h2 className="font-display text-[1.45rem] sm:text-[1.7rem] text-star leading-tight mb-4">
                {step.title}
              </h2>
              {step.body && <p className="text-[0.95rem] text-star/85 mb-5">{step.body}</p>}

              <ul className="flex flex-col gap-2.5 mb-5">
                {step.points.map((p) => (
                  <li key={p} className="flex items-start gap-2.5 text-[0.9rem] text-dim">
                    <Check size={14} className="mt-0.5 shrink-0" style={{ color: accent.color }} />
                    {p}
                  </li>
                ))}
              </ul>

              {step.closing && (
                <>
                  <div className="cosmos-rule mb-4" />
                  <p className="text-[0.95rem] text-star/90">{step.closing}</p>
                </>
              )}
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
                {step.eyebrow && <Eyebrow>{step.eyebrow}</Eyebrow>}
                <Tag tone="neutral">{accent.label}</Tag>
              </div>

              <h2 className="font-display text-[1.35rem] sm:text-[1.55rem] text-star leading-tight mb-3">
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
                  <Sparkles size={13} /> {step.finishLabel || "Let's build"}
                </CosmosButton>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/** Re-open a tour from anywhere (a "?" button, a help menu). */
export function openTour(tourKey) {
  window.dispatchEvent(new CustomEvent('sfc:open-tour', { detail: tourKey }));
}

export default PageTour;
