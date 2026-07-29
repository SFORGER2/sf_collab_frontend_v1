/**
 * DEV-ONLY MOCK DATA
 *
 * The backend is not always running during frontend work, and several
 * behaviours only appear once there is enough data to trigger them — the
 * matchmaking paywall, for instance, is invisible with four results because the
 * free allowance is ten. Reviewing those states needed real volume.
 *
 * Every export here returns `[]` outside a dev build, so nothing ships. Guards
 * are written as `if (!import.meta.env.DEV) return [];` so Vite folds the
 * literal `false` and esbuild drops the data entirely — the same technique as
 * services/auth/devSession.js. Verify with:
 *   npm run build && grep -c "Alex Rivera" dist/assets/*.js   → 0
 */

const FIRST = ['Alex', 'Sarah', 'Marcus', 'Elena', 'Priya', 'Tomas', 'Aisha', 'Ravi', 'Lena', 'Diego', 'Mei', 'Omar', 'Sofia', 'Jonas', 'Nadia', 'Kwame', 'Hana', 'Felix', 'Zara', 'Nikolai', 'Ines', 'Yusuf', 'Clara', 'Dmitri'];
const LAST = ['Rivera', 'Chen', 'Dupont', 'Rostova', 'Sharma', 'Novak', 'Bello', 'Krishnan', 'Bergman', 'Marquez', 'Tanaka', 'Haddad', 'Moreau', 'Lindqvist', 'Aziz', 'Mensah', 'Sato', 'Weber', 'Okafor', 'Volkov', 'Costa', 'Demir', 'Fischer', 'Sokolov'];

const BUILDER_ROLES = [
  { role: 'Fullstack Engineer', skills: ['React', 'Node.js', 'GraphQL', 'Tailwind CSS'] },
  { role: 'AI Engineer', skills: ['Python', 'PyTorch', 'LLMs', 'FastAPI'] },
  { role: 'Product Designer', skills: ['Figma', 'UI/UX Design', 'User Research', 'Wireframing'] },
  { role: 'Frontend Developer', skills: ['Vue.js', 'React', 'TypeScript', 'UI Polish'] },
  { role: 'Backend Engineer', skills: ['Go', 'PostgreSQL', 'Kubernetes', 'gRPC'] },
  { role: 'Growth Marketer', skills: ['SEO', 'Paid Social', 'Analytics', 'Copywriting'] },
  { role: 'Data Scientist', skills: ['Pandas', 'Forecasting', 'dbt', 'Experimentation'] },
  { role: 'Mobile Engineer', skills: ['React Native', 'Swift', 'Offline Sync', 'App Store'] },
  { role: 'DevOps Engineer', skills: ['Terraform', 'AWS', 'CI/CD', 'Observability'] },
  { role: 'Brand Designer', skills: ['Identity', 'Illustration', 'Motion', 'Design Systems'] },
  { role: 'Content Strategist', skills: ['Editorial', 'Positioning', 'Newsletters', 'Video'] },
  { role: 'QA Engineer', skills: ['Playwright', 'Test Design', 'Accessibility', 'Regression'] },
  { role: 'Solutions Architect', skills: ['System Design', 'Integrations', 'Security', 'Scaling'] },
  { role: 'Community Manager', skills: ['Discord', 'Events', 'Moderation', 'Onboarding'] },
];

const REASONS = [
  'Has shipped production work in this exact stack.',
  'Worked on a similar product in a previous role.',
  'Their listed skills line up with the roles you still need.',
  'Available to start part-time immediately.',
  'Strong track record of finishing what they start.',
  'Contributed to three early-stage startups on SFCollab.',
  'Actively looking for a new project to join.',
  'Rated highly by founders they have worked with.',
  'Based in a timezone that overlaps your team.',
  'Has mentored other builders in this discipline.',
];

function pick(arr, seed) {
  return arr[seed % arr.length];
}

/** Deterministic so the list is stable across re-renders. */
function buildPerson(i) {
  const spec = pick(BUILDER_ROLES, i);
  const name = `${pick(FIRST, i)} ${pick(LAST, i * 7 + 3)}`;
  const match = 96 - i * 2 - (i % 3);

  return {
    id: `mock-${i}`,
    name,
    role: spec.role,
    skills: spec.skills,
    match: Math.max(52, match),
    reasons: [
      pick(REASONS, i),
      pick(REASONS, i * 3 + 1),
      pick(REASONS, i * 5 + 2),
    ],
    available: i % 4 !== 0,
  };
}

/**
 * Suggested contributors for a Vision.
 * 24 entries — comfortably past the 10-per-day free allowance, so the unlock
 * state is reachable during review.
 */
export function mockSuggestedContributors(count = 24) {
  if (!import.meta.env.DEV) return [];
  return Array.from({ length: count }, (_, i) => buildPerson(i));
}

const INDUSTRIES = ['Fintech', 'Health', 'Climate', 'Developer Tools', 'Education', 'Logistics', 'Creator Economy', 'Security'];
const STAGES = ['Spark', 'Vision', 'Signals', 'MVP', 'Startup'];

/** Similar Visions / startups, for the non-owner discovery lens. */
export function mockSimilarVisions(count = 18) {
  if (!import.meta.env.DEV) return [];
  return Array.from({ length: count }, (_, i) => ({
    id: `mock-vision-${i}`,
    title: [
      'Ledger for freelance collectives',
      'Carbon accounting for small manufacturers',
      'Async standups that write themselves',
      'Marketplace for lab time',
      'Curriculum builder for bootcamps',
      'Route planning for last-mile couriers',
      'Rights management for illustrators',
      'Threat modelling as a service',
      'Payroll for distributed co-ops',
      'Shared inventory for makers',
      'Grant discovery for researchers',
      'Compliance copilot for clinics',
      'Warehouse robotics scheduling',
      'Peer review for open datasets',
      'Booking layer for community spaces',
      'Supply traceability for coffee',
      'Interview scheduling without email',
      'Pricing experiments for SaaS',
    ][i % 18],
    industry: pick(INDUSTRIES, i),
    stage: pick(STAGES, i * 3),
    match: Math.max(50, 94 - i * 2),
  }));
}

/** Teams seeking mentorship, for the mentor lens. */
export function mockMentorshipSeekers(count = 16) {
  if (!import.meta.env.DEV) return [];
  return Array.from({ length: count }, (_, i) => ({
    id: `mock-seeker-${i}`,
    name: `${pick(FIRST, i * 5 + 2)} ${pick(LAST, i * 3)}`,
    role: pick(['Founder, pre-seed', 'Founder, MVP stage', 'Technical co-founder', 'Solo founder'], i),
    skills: [pick(INDUSTRIES, i), pick(STAGES, i)],
    match: Math.max(55, 92 - i * 2),
    reasons: [pick(REASONS, i * 2), 'Asked for guidance in your area of expertise.'],
  }));
}
