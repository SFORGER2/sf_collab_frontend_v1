/**
 * Role accent map — mirrors the five profiles on the SFCollab landing page.
 * Each role owns one colour across the entire app: sidebar, dashboard, badges.
 *
 *   founder    gold      the spark, the originating idea
 *   builder    cyan      structure, product, execution
 *   mentor     emerald   validation, guidance
 *   influencer magenta   momentum, promotion
 *   investor   violet    the intelligence layer, pattern recognition
 */
export const ROLE_ACCENTS = {
  founder: {
    label: 'Founder',
    color: '#ffbf5e',
    soft: 'rgba(255, 191, 94, 0.12)',
    border: 'rgba(255, 191, 94, 0.45)',
    glow: 'rgba(255, 191, 94, 0.55)',
  },
  builder: {
    label: 'Builder',
    color: '#4fd8ff',
    soft: 'rgba(79, 216, 255, 0.12)',
    border: 'rgba(79, 216, 255, 0.45)',
    glow: 'rgba(79, 216, 255, 0.55)',
  },
  mentor: {
    label: 'Mentor',
    color: '#3ee6a0',
    soft: 'rgba(62, 230, 160, 0.12)',
    border: 'rgba(62, 230, 160, 0.45)',
    glow: 'rgba(62, 230, 160, 0.55)',
  },
  influencer: {
    label: 'Influencer',
    color: '#ff4fd8',
    soft: 'rgba(255, 79, 216, 0.12)',
    border: 'rgba(255, 79, 216, 0.45)',
    glow: 'rgba(255, 79, 216, 0.55)',
  },
  investor: {
    label: 'Investor',
    color: '#8b6cff',
    soft: 'rgba(139, 108, 255, 0.12)',
    border: 'rgba(139, 108, 255, 0.45)',
    glow: 'rgba(139, 108, 255, 0.55)',
  },
  /* `member` is the app's default role and has no landing-page profile of its
     own, so it inherits the neutral spark. */
  member: {
    label: 'Member',
    color: '#ffbf5e',
    soft: 'rgba(255, 191, 94, 0.10)',
    border: 'rgba(255, 191, 94, 0.35)',
    glow: 'rgba(255, 191, 94, 0.45)',
  },
};

export const ROLE_ORDER = ['founder', 'builder', 'mentor', 'influencer', 'investor'];

/** Resolve a role name to its accent, falling back to the member default. */
export function roleAccent(role) {
  return ROLE_ACCENTS[String(role || '').toLowerCase()] || ROLE_ACCENTS.member;
}

/**
 * Style object that sets `--cosmos-accent` for a subtree, so any cosmos
 * primitive inside picks up the role colour without prop drilling.
 */
export function roleAccentVars(role) {
  const a = roleAccent(role);
  return {
    '--cosmos-accent': a.color,
    '--cosmos-accent-soft': a.soft,
    '--cosmos-accent-border': a.border,
    '--cosmos-accent-glow': a.glow,
  };
}
