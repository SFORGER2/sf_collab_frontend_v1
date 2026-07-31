/**
 * SAMPLE VISIONS AND STARTUPS.
 *
 * The two board pages — /ideation and /discover-startups — are the ones people
 * judge the product by, and both were empty. An empty board is indistinguishable
 * from a broken one, and it makes every feature that sits on top of it
 * (momentum flames, the burning-box treatment, filters, sorting, the credits
 * gate) impossible to review.
 *
 * So: twelve Visions and ten startups, spread deliberately across stages,
 * industries and engagement levels. Some are hot, most are not — a board where
 * everything burns tells you as little as a board where nothing does.
 *
 * ⚠️ SAMPLE DATA. Boards must label it — see `isSample` — and never blend it
 * silently with real records.
 */

/**
 * Banners and logos are generated gradients rather than image files.
 *
 * There is no asset pipeline yet and stock photography would be a lie about
 * what these are. A deterministic gradient per record gives every card a
 * distinct, stable identity that survives a reload — and when real uploads
 * arrive, `bannerUrl`/`logoUrl` simply take precedence.
 */
export const BANNERS = [
  'linear-gradient(135deg,#ffbf5e 0%,#ff6f3c 55%,#8b6cff 100%)',
  'linear-gradient(135deg,#4fd8ff 0%,#8b6cff 60%,#ff4fd8 100%)',
  'linear-gradient(135deg,#3ee6a0 0%,#4fd8ff 60%,#8b6cff 100%)',
  'linear-gradient(135deg,#ff6fd8 0%,#8b6cff 55%,#4fd8ff 100%)',
  'linear-gradient(135deg,#ffbf5e 0%,#3ee6a0 60%,#4fd8ff 100%)',
  'linear-gradient(135deg,#8b6cff 0%,#4fd8ff 50%,#3ee6a0 100%)',
];

/** Stable per-id, so a card keeps its colours between renders. */
export function bannerFor(id = '') {
  let h = 0;
  for (let i = 0; i < id.length; i += 1) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return BANNERS[h % BANNERS.length];
}

const hoursAgo = (h) => new Date(Date.now() - h * 3600_000).toISOString();
const daysAgo = (d) => new Date(Date.now() - d * 86400_000).toISOString();

const author = (id, name, role) => ({ id: `sample-${id}`, name, role, avatar: '' });

export const SAMPLE_VISIONS = [
  {
    id: 'sv-1', title: 'Founder Match: Find Your Tech Co-Founder',
    description: 'Connects non-technical founders with developers on actual skills and shared interests, not resume buzzwords.',
    stage: 'Prototype', category: 'AI / SaaS', privacy: 'public',
    author: author(1, 'Ada Okonkwo', 'Founder & CEO'), creatorId: 'sample-1',
    likes: 184, comments: 37, collaborators: 4, views: 3100,
    lastActivityAt: hoursAgo(2), timeAgo: '2 hours ago', createdAt: 'March 4, 2026',
    tags: ['Matchmaking', 'Startup Tool', 'Community'], readinessScore: 68, visionState: 'team_forming',
  },
  {
    id: 'sv-2', title: 'Ledger for Informal Traders',
    description: 'Bookkeeping that works over SMS for traders who have a phone but not a smartphone.',
    stage: 'MVP Stage', category: 'Fintech', privacy: 'public',
    author: author(2, 'Kwame Boateng', 'Founder'), creatorId: 'sample-7',
    likes: 142, comments: 28, collaborators: 5, views: 2400,
    lastActivityAt: hoursAgo(9), timeAgo: '9 hours ago', createdAt: 'February 19, 2026',
    tags: ['Fintech', 'Africa', 'SMS'], readinessScore: 74, visionState: 'team_forming',
  },
  {
    id: 'sv-3', title: 'Carbon Ledger for Small Manufacturers',
    description: 'Emissions accounting that a 20-person factory can actually complete, and auditors accept.',
    stage: 'Concept', category: 'Climate', privacy: 'public',
    author: author(3, 'Nora Lindqvist', 'Investor & Founder'), creatorId: 'sample-10',
    likes: 96, comments: 21, collaborators: 3, views: 1800,
    lastActivityAt: daysAgo(1), timeAgo: '1 day ago', createdAt: 'March 1, 2026',
    tags: ['Climate', 'Compliance', 'B2B'], readinessScore: 52, visionState: 'public',
  },
  {
    id: 'sv-4', title: 'Design System as a Service',
    description: 'A maintained component library for teams too small to staff a design systems engineer.',
    stage: 'Development Stage', category: 'Developer Tools', privacy: 'public',
    author: author(4, 'Sofia Marchetti', 'Product Designer'), creatorId: 'sample-8',
    likes: 74, comments: 15, collaborators: 4, views: 1300,
    lastActivityAt: daysAgo(2), timeAgo: '2 days ago', createdAt: 'February 26, 2026',
    tags: ['Design', 'DX', 'SaaS'], readinessScore: 61, visionState: 'team_forming',
  },
  {
    id: 'sv-5', title: 'Evals for Small Teams',
    description: 'LLM evaluation that fits in CI, for teams shipping AI features without an ML org behind them.',
    stage: 'Prototype', category: 'AI / SaaS', privacy: 'public',
    author: author(5, 'Hana Suleiman', 'ML Engineer'), creatorId: 'sample-16',
    likes: 58, comments: 12, collaborators: 2, views: 1100,
    lastActivityAt: daysAgo(2), timeAgo: '2 days ago', createdAt: 'March 6, 2026',
    tags: ['AI', 'Testing', 'DevTools'], readinessScore: 44, visionState: 'public',
  },
  {
    id: 'sv-6', title: 'Patient-Owned Health Records',
    description: 'Records the patient controls and can hand to any clinician, instead of records the clinic controls.',
    stage: 'Research Stage', category: 'Health', privacy: 'public',
    author: author(6, 'Aisha Rahman', 'Founder'), creatorId: 'sample-12',
    likes: 47, comments: 9, collaborators: 2, views: 980,
    lastActivityAt: daysAgo(3), timeAgo: '3 days ago', createdAt: 'January 30, 2026',
    tags: ['Health', 'Privacy', 'Regulated'], readinessScore: 38, visionState: 'public',
  },
  {
    id: 'sv-7', title: 'Warm Intro Graph',
    description: 'Who in your network can actually introduce you to a given company, ranked by how warm it really is.',
    stage: 'Concept', category: 'Networking', privacy: 'public',
    author: author(7, 'Mikkel Rasmussen', 'Engineer'), creatorId: 'sample-2',
    likes: 34, comments: 6, collaborators: 1, views: 620,
    lastActivityAt: daysAgo(4), timeAgo: '4 days ago', createdAt: 'March 2, 2026',
    tags: ['Graph', 'Sales', 'B2B'], readinessScore: 29, visionState: 'public',
  },
  {
    id: 'sv-8', title: 'Localised Dev Education, Portuguese First',
    description: 'Practical engineering courses written for Lusophone developers rather than translated at them.',
    stage: 'MVP Stage', category: 'Education', privacy: 'public',
    author: author(8, 'Rafael Costa', 'Educator'), creatorId: 'sample-15',
    likes: 88, comments: 19, collaborators: 3, views: 1600,
    lastActivityAt: daysAgo(1), timeAgo: '1 day ago', createdAt: 'February 12, 2026',
    tags: ['Education', 'Content', 'LATAM'], readinessScore: 57, visionState: 'team_forming',
  },
  {
    id: 'sv-9', title: 'Contract Review for Freelancers',
    description: 'Flags the three clauses that actually cost freelancers money, in plain language.',
    stage: 'Idea Stage', category: 'Legal', privacy: 'public',
    author: author(9, 'Lena Hoffmann', 'Designer'), creatorId: 'sample-6',
    likes: 22, comments: 4, collaborators: 0, views: 410,
    lastActivityAt: daysAgo(6), timeAgo: '6 days ago', createdAt: 'March 8, 2026',
    tags: ['Legal', 'Freelance', 'AI'], readinessScore: 18, visionState: 'public',
  },
  {
    id: 'sv-10', title: 'Shared Compute for Student Labs',
    description: 'Pooled GPU time for university groups that each need a cluster for two weeks a year.',
    stage: 'Concept', category: 'Infrastructure', privacy: 'public',
    author: author(10, 'Priya Raghavan', 'Engineer'), creatorId: 'sample-3',
    likes: 41, comments: 8, collaborators: 1, views: 730,
    lastActivityAt: daysAgo(5), timeAgo: '5 days ago', createdAt: 'February 22, 2026',
    tags: ['Infra', 'Education', 'GPU'], readinessScore: 33, visionState: 'public',
  },
  {
    id: 'sv-11', title: 'Audit Trail for AI Decisions',
    description: 'Records why a model produced an outcome, in a form a regulator will accept.',
    stage: 'Development Stage', category: 'Compliance', privacy: 'public',
    author: author(11, 'Idris Haddad', 'Security Engineer'), creatorId: 'sample-9',
    likes: 119, comments: 24, collaborators: 4, views: 2100,
    lastActivityAt: hoursAgo(20), timeAgo: '20 hours ago', createdAt: 'January 18, 2026',
    tags: ['Compliance', 'AI', 'Enterprise'], readinessScore: 71, visionState: 'ready_for_activation',
  },
  {
    id: 'sv-12', title: 'Repair Marketplace for Appliances',
    description: 'Connects people with a broken washing machine to someone two streets away who can fix it.',
    stage: 'Idea Stage', category: 'Marketplace', privacy: 'public',
    author: author(12, 'Diego Salazar', 'Mobile Engineer'), creatorId: 'sample-11',
    likes: 16, comments: 3, collaborators: 0, views: 290,
    lastActivityAt: daysAgo(9), timeAgo: '9 days ago', createdAt: 'March 9, 2026',
    tags: ['Marketplace', 'Sustainability', 'Local'], readinessScore: 12, visionState: 'public',
  },
];

export const SAMPLE_STARTUPS = [
  {
    id: 'ss-1', name: 'Meridian Payments', industry: 'Fintech', stage: 'seed',
    description: 'Cross-border payouts for contractors, settling in under an hour.',
    memberCount: 11, funding_amount: 1_400_000, executionScore: 82,
    likes: 210, comments: 44, collaborators: 11, views: 5200, lastActivityAt: hoursAgo(3),
    roles: { 'Backend Engineer': 2, 'Compliance Lead': 1 },
  },
  {
    id: 'ss-2', name: 'Thornfield Health', industry: 'Health', stage: 'series-a',
    description: 'Remote monitoring for post-surgical recovery, deployed in 40 clinics.',
    memberCount: 24, funding_amount: 6_800_000, executionScore: 88,
    likes: 176, comments: 31, collaborators: 24, views: 4400, lastActivityAt: hoursAgo(11),
    roles: { 'Clinical Data Scientist': 1, 'Mobile Engineer': 2 },
  },
  {
    id: 'ss-3', name: 'Halyard Logistics', industry: 'Logistics', stage: 'seed',
    description: 'Route optimisation for last-mile fleets under 50 vehicles.',
    memberCount: 8, funding_amount: 900_000, executionScore: 71,
    likes: 94, comments: 18, collaborators: 8, views: 2100, lastActivityAt: daysAgo(1),
    roles: { 'Operations Research': 1, 'Fullstack Engineer': 1 },
  },
  {
    id: 'ss-4', name: 'Kestrel Security', industry: 'Security', stage: 'pre-seed',
    description: 'Continuous threat modelling that keeps up with a weekly release cycle.',
    memberCount: 5, funding_amount: 350_000, executionScore: 64,
    likes: 61, comments: 12, collaborators: 5, views: 1400, lastActivityAt: daysAgo(2),
    roles: { 'Security Engineer': 2 },
  },
  {
    id: 'ss-5', name: 'Verdant Grid', industry: 'Climate', stage: 'seed',
    description: 'Demand-shifting for industrial sites on renewable tariffs.',
    memberCount: 14, funding_amount: 2_200_000, executionScore: 79,
    likes: 133, comments: 26, collaborators: 14, views: 3300, lastActivityAt: hoursAgo(30),
    roles: { 'Data Engineer': 1, 'Energy Analyst': 1 },
  },
  {
    id: 'ss-6', name: 'Foundry Labs', industry: 'Developer Tools', stage: 'pre-seed',
    description: 'Reproducible build environments that survive a laptop change.',
    memberCount: 4, funding_amount: 180_000, executionScore: 58,
    likes: 45, comments: 9, collaborators: 4, views: 900, lastActivityAt: daysAgo(3),
    roles: { 'Systems Engineer': 1, 'DX Engineer': 1 },
  },
  {
    id: 'ss-7', name: 'Cadence Learning', industry: 'Education', stage: 'seed',
    description: 'Spaced-repetition training for regulated industries with real audit trails.',
    memberCount: 9, funding_amount: 750_000, executionScore: 69,
    likes: 72, comments: 14, collaborators: 9, views: 1700, lastActivityAt: daysAgo(2),
    roles: { 'Learning Designer': 1 },
  },
  {
    id: 'ss-8', name: 'Ironwood Supply', industry: 'Manufacturing', stage: 'series-a',
    description: 'Parts sourcing for small manufacturers, with lead times you can trust.',
    memberCount: 31, funding_amount: 9_500_000, executionScore: 91,
    likes: 198, comments: 38, collaborators: 31, views: 6100, lastActivityAt: hoursAgo(6),
    roles: { 'Supply Chain Lead': 1, 'Backend Engineer': 3 },
  },
  {
    id: 'ss-9', name: 'Palewell Studio', industry: 'Creative', stage: 'bootstrapped',
    description: 'Brand systems for technical founders who cannot describe what they do.',
    memberCount: 6, funding_amount: 0, executionScore: 66,
    likes: 53, comments: 11, collaborators: 6, views: 1200, lastActivityAt: daysAgo(4),
    roles: { 'Brand Designer': 1 },
  },
  {
    id: 'ss-10', name: 'Northgate Data', industry: 'Analytics', stage: 'pre-seed',
    description: 'Warehouse-native product analytics without a second copy of your data.',
    memberCount: 3, funding_amount: 120_000, executionScore: 49,
    likes: 28, comments: 5, collaborators: 3, views: 640, lastActivityAt: daysAgo(7),
    roles: { 'Analytics Engineer': 1, 'Frontend Engineer': 1 },
  },
];

/* Give every sample a banner and a monogram logo. Done here rather than in
   each literal so adding a record can't forget one. */
for (const v of SAMPLE_VISIONS) {
  v.banner = bannerFor(v.id);
  v.logoText = v.title.slice(0, 2).toUpperCase();
}
for (const st of SAMPLE_STARTUPS) {
  st.banner = bannerFor(st.id);
  st.logoText = st.name.slice(0, 2).toUpperCase();
  st.isSample = true;
}

/** Real records when there are any, samples when there are none. */
export function withBoardFallback(items, samples, { enabled = true } = {}) {
  if (!enabled) return { items, isSample: false };
  if (Array.isArray(items) && items.length > 0) return { items, isSample: false };
  return { items: samples, isSample: true };
}
