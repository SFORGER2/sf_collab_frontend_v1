/**
 * COLLABORATION RATINGS — three phases, not one star count.
 *
 * A single five-star rating at the end of a collaboration is close to useless.
 * It arrives too late to change anything, it compresses "was easy to reach"
 * and "shipped what they promised" into one number, and by the time it is
 * written the relationship is already over — so it is either revenge or
 * politeness, rarely information.
 *
 * So ratings are split across the life of the work:
 *
 *   BEFORE  — expectation-setting. Both sides state scope, availability and
 *             what "done" means, and rate the *fit* before committing. This is
 *             the cheapest moment to discover a mismatch.
 *   DURING  — lightweight check-ins on the things that go wrong mid-project:
 *             responsiveness, whether the scope is holding, blockers. Visible
 *             to both parties immediately, because a problem you can still fix
 *             is worth more than an accurate post-mortem.
 *   AFTER   — the outcome. Delivery against what was agreed at the start, not
 *             against a vague memory of it.
 *
 * A dispute can be opened from any phase and freezes the public score until it
 * resolves, so nobody's reputation is set by a rating they never got to answer.
 *
 * ⚠️ FRONTEND MODEL ONLY. Ratings affect reputation and matchmaking; every
 * write must be server-side and permission-checked, or people will rate
 * themselves.
 *
 * BACKEND:
 *   GET  /api/collaborations/:id/ratings
 *   POST /api/collaborations/:id/ratings { phase, criteria: {...}, note }
 *   POST /api/collaborations/:id/disputes { reason, detail, evidence[] }
 *   POST /api/disputes/:id/respond { detail, evidence[] }
 * Only participants may rate; one submission per party per phase; edits within
 * a window, then frozen.
 */

export const PHASES = {
  before: {
    id: 'before',
    label: 'Before',
    title: 'Setting expectations',
    blurb: 'Agree what this is before anyone starts. The cheapest moment to find a mismatch.',
    accent: '#4fd8ff',
    weight: 0.15,
  },
  during: {
    id: 'during',
    label: 'During',
    title: 'While the work is live',
    blurb: 'Short check-ins on what actually goes wrong mid-project, while it can still be fixed.',
    accent: '#ffbf5e',
    weight: 0.3,
  },
  after: {
    id: 'after',
    label: 'After',
    title: 'How it landed',
    blurb: 'Delivery measured against what was agreed at the start, not a vague memory of it.',
    accent: '#3ee6a0',
    weight: 0.55,
  },
};

export const PHASE_ORDER = ['before', 'during', 'after'];

/**
 * Criteria per phase.
 *
 * Deliberately different per phase — asking "did they deliver?" before the work
 * starts is meaningless, and asking "is the scope holding?" after it ends is
 * too late to matter.
 */
export const CRITERIA = {
  before: [
    { id: 'scopeClarity', label: 'Scope was clear', hint: 'Both sides could describe "done" the same way' },
    { id: 'availability', label: 'Availability was realistic', hint: 'Stated hours matched what the work needs' },
    { id: 'skillFit', label: 'Skills fit the work', hint: 'Right person for this, not just an available one' },
    { id: 'communication', label: 'Easy to talk to', hint: 'Questions got answered before committing' },
  ],
  during: [
    { id: 'responsiveness', label: 'Responsive', hint: 'Replies arrive within the agreed window' },
    { id: 'scopeHolding', label: 'Scope is holding', hint: 'No quiet expansion in either direction' },
    { id: 'progress', label: 'Progress is visible', hint: 'You can see movement without asking' },
    { id: 'blockers', label: 'Blockers raised early', hint: 'Problems surface while they are still small' },
  ],
  after: [
    { id: 'delivered', label: 'Delivered what was agreed', hint: 'Measured against the "before" scope' },
    { id: 'quality', label: 'Quality of the work', hint: 'Would you build on top of it' },
    { id: 'timeliness', label: 'On time', hint: 'Or renegotiated before the deadline, not after' },
    { id: 'wouldRepeat', label: 'Would work together again', hint: 'The only question that really matters' },
  ],
};

export const DISPUTE_REASONS = [
  { id: 'not_delivered', label: 'Work was not delivered' },
  { id: 'scope_changed', label: 'Scope changed without agreement' },
  { id: 'unpaid', label: 'Agreed compensation not honoured' },
  { id: 'unresponsive', label: 'Went unresponsive' },
  { id: 'unfair_rating', label: 'The rating is inaccurate or retaliatory' },
  { id: 'conduct', label: 'Conduct issue' },
];

export const DISPUTE_STATES = {
  open: { id: 'open', label: 'Open', accent: '#ffbf5e', blurb: 'Waiting on the other party to respond' },
  responded: { id: 'responded', label: 'Responded', accent: '#4fd8ff', blurb: 'Both sides heard, under review' },
  mediation: { id: 'mediation', label: 'In mediation', accent: '#8b6cff', blurb: 'A mentor is reviewing the evidence' },
  resolved: { id: 'resolved', label: 'Resolved', accent: '#3ee6a0', blurb: 'Outcome recorded, scores unfrozen' },
  withdrawn: { id: 'withdrawn', label: 'Withdrawn', accent: '#a9a2c2', blurb: 'Closed without a finding' },
};

/** 1–5, but worded — a bare star gives no shared meaning between two raters. */
export const SCALE = [
  { value: 1, label: 'Poor' },
  { value: 2, label: 'Below expectations' },
  { value: 3, label: 'Met expectations' },
  { value: 4, label: 'Above expectations' },
  { value: 5, label: 'Exceptional' },
];

/** Mean of the answered criteria in one phase. Unanswered are skipped, not zeroed. */
export function phaseScore(answers = {}) {
  const values = Object.values(answers).filter((v) => typeof v === 'number' && v > 0);
  if (!values.length) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

/**
 * Weighted overall score.
 *
 * "After" dominates because outcome matters most, but "during" carries real
 * weight — someone who is a pleasure to work with throughout and lands slightly
 * late should not score the same as someone who vanishes and delivers.
 *
 * Returns null until at least one phase has been rated, so an unrated
 * collaboration reads as "no data" rather than as zero.
 */
export function overallScore(phases = {}) {
  let total = 0;
  let weightUsed = 0;

  for (const id of PHASE_ORDER) {
    const score = phaseScore(phases[id]);
    if (score == null) continue;
    total += score * PHASES[id].weight;
    weightUsed += PHASES[id].weight;
  }

  return weightUsed === 0 ? null : total / weightUsed;
}

/** Which phase should be filled in next, given what exists and the state. */
export function nextPhase(phases = {}, collaborationState = 'active') {
  if (!phaseScore(phases.before)) return 'before';
  if (collaborationState === 'complete') {
    return phaseScore(phases.after) ? null : 'after';
  }
  return 'during';
}

/** A public score is withheld while a dispute is live — see the module note. */
export function isFrozen(dispute) {
  return !!dispute && ['open', 'responded', 'mediation'].includes(dispute.status);
}

export function completeness(phases = {}) {
  const done = PHASE_ORDER.filter((id) => phaseScore(phases[id]) != null).length;
  return Math.round((done / PHASE_ORDER.length) * 100);
}

/** Word for a numeric score, so the UI never shows a bare float. */
export function describe(score) {
  if (score == null) return 'Not yet rated';
  const rounded = Math.round(score);
  return SCALE.find((s) => s.value === rounded)?.label || '—';
}
