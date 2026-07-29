/**
 * ROLE-SPECIFIC SUBSCRIPTION PLANS
 *
 * Each role gets four paid-ladder levels plus an Enterprise tier that is a
 * conversation rather than a checkout. The ladder is the same *shape* for every
 * role — Free → Starter → Pro → Elite → Enterprise — but the limits and the
 * language differ, because what a founder needs more of is not what an
 * influencer needs more of.
 *
 * A founder buys Vision capacity, matchmaking reach and investor-facing
 * documents. A builder buys applications and portfolio visibility. An
 * influencer buys generation volume. An investor buys deal flow and diligence.
 * A mentor buys directory placement and session capacity.
 *
 * ⚠️ FRONTEND SHAPING ONLY. Prices and limits here exist so the interface can
 * be designed and reviewed; the backend is the authority on both. Replace with
 * GET /api/billing/plans?role=… and mirror every limit server-side.
 *
 * `limits` keys must match those read by services/entitlements/entitlements.js
 * so checkLimit()/consume() keep working across roles.
 */

export const TIERS = ['free', 'starter', 'pro', 'elite', 'enterprise'];

/** Shared shape so every tier renders consistently. */
const TIER_META = {
  free: { name: 'Explorer', accent: '#a9a2c2', showsAds: true },
  starter: { name: 'Starter', accent: '#4fd8ff', showsAds: false },
  pro: { name: 'Pro', accent: '#ffbf5e', showsAds: false, popular: true },
  elite: { name: 'Elite', accent: '#8b6cff', showsAds: false },
  enterprise: { name: 'Enterprise', accent: '#3ee6a0', showsAds: false, contactOnly: true },
};

const INF = Infinity;

/**
 * Per-role ladders.
 * `price` is monthly USD; `null` means "talk to us".
 * `highlights` are the role-relevant selling points, not a limits dump.
 */
const ROLE_PLANS = {
  founder: {
    tagline: 'Turn one idea into an operating company.',
    tiers: {
      free: {
        price: 0,
        summary: 'Register one Vision and test the water.',
        limits: { activeVisions: 1, matchSuggestionsPerDay: 3, assistantMessagesPerDay: 10, aiGenerationsPerDay: 2, driveStorageGb: 1, teamSeats: 2 },
        highlights: ['1 active Vision', '3 builder matches per day', 'Community and discovery access'],
      },
      starter: {
        price: 19,
        summary: 'Get a real team around your first Vision.',
        limits: { activeVisions: 3, matchSuggestionsPerDay: 25, assistantMessagesPerDay: 100, aiGenerationsPerDay: 25, driveStorageGb: 25, teamSeats: 8 },
        highlights: ['3 active Visions', '25 matches per day', 'Business plan generator', 'No advertising'],
      },
      pro: {
        price: 49,
        summary: 'Run the whole startup from one place.',
        limits: { activeVisions: 15, matchSuggestionsPerDay: 100, assistantMessagesPerDay: 500, aiGenerationsPerDay: 150, driveStorageGb: 200, teamSeats: 30 },
        highlights: ['15 active Visions', '100 matches per day', 'Pitch deck + landing page generators', 'Crowdfunding on conversion', 'Priority in builder search'],
      },
      elite: {
        price: 149,
        summary: 'Multiple startups, investor-ready.',
        limits: { activeVisions: INF, matchSuggestionsPerDay: INF, assistantMessagesPerDay: INF, aiGenerationsPerDay: INF, driveStorageGb: 1000, teamSeats: 100 },
        highlights: ['Unlimited Visions and matches', 'Unlimited AI generation', 'Investor portal access', 'Featured placement in discovery'],
      },
      enterprise: {
        price: null,
        summary: 'Accelerators, studios and multi-team operators.',
        limits: { activeVisions: INF, matchSuggestionsPerDay: INF, assistantMessagesPerDay: INF, aiGenerationsPerDay: INF, driveStorageGb: INF, teamSeats: INF },
        highlights: ['Unlimited everything', 'Dedicated onboarding', 'Custom contracts and SSO', 'Named support contact'],
      },
    },
  },

  builder: {
    tagline: 'Prove your ability through real work.',
    tiers: {
      free: {
        price: 0,
        summary: 'Find your first project.',
        limits: { activeApplications: 3, matchSuggestionsPerDay: 3, assistantMessagesPerDay: 10, aiGenerationsPerDay: 2, driveStorageGb: 1, portfolioItems: 3 },
        highlights: ['3 open applications', '3 startup matches per day', 'Public contribution record'],
      },
      starter: {
        price: 12,
        summary: 'Apply widely and get noticed.',
        limits: { activeApplications: 15, matchSuggestionsPerDay: 25, assistantMessagesPerDay: 100, aiGenerationsPerDay: 20, driveStorageGb: 25, portfolioItems: 20 },
        highlights: ['15 open applications', '25 matches per day', 'Full portfolio', 'No advertising'],
      },
      pro: {
        price: 29,
        summary: 'Be the builder founders find first.',
        limits: { activeApplications: 50, matchSuggestionsPerDay: 100, assistantMessagesPerDay: 400, aiGenerationsPerDay: 80, driveStorageGb: 100, portfolioItems: INF },
        highlights: ['50 open applications', '100 matches per day', 'Boosted in founder search', 'Verified skills badge'],
      },
      elite: {
        price: 79,
        summary: 'Work across many teams at once.',
        limits: { activeApplications: INF, matchSuggestionsPerDay: INF, assistantMessagesPerDay: INF, aiGenerationsPerDay: INF, driveStorageGb: 500, portfolioItems: INF },
        highlights: ['Unlimited applications and matches', 'Top of founder search results', 'Equity negotiation tooling', 'Priority payouts'],
      },
      enterprise: {
        price: null,
        summary: 'Agencies and builder collectives.',
        limits: { activeApplications: INF, matchSuggestionsPerDay: INF, assistantMessagesPerDay: INF, aiGenerationsPerDay: INF, driveStorageGb: INF, portfolioItems: INF },
        highlights: ['Team accounts', 'Shared portfolio and billing', 'Custom contracts', 'Named support contact'],
      },
    },
  },

  mentor: {
    tagline: 'Turn experience into direction.',
    tiers: {
      free: {
        price: 0,
        summary: 'Mentor a couple of teams.',
        limits: { activeMentees: 2, matchSuggestionsPerDay: 3, assistantMessagesPerDay: 10, aiGenerationsPerDay: 2, driveStorageGb: 1, sessionsPerMonth: 4 },
        highlights: ['2 active mentees', '4 sessions per month', 'Listed in the mentor directory'],
      },
      starter: {
        price: 15,
        summary: 'Take on a real cohort.',
        limits: { activeMentees: 8, matchSuggestionsPerDay: 25, assistantMessagesPerDay: 100, aiGenerationsPerDay: 20, driveStorageGb: 25, sessionsPerMonth: 20 },
        highlights: ['8 active mentees', '20 sessions per month', 'Session notes in SF Drive', 'No advertising'],
      },
      pro: {
        price: 39,
        summary: 'Build a reputation as a go-to mentor.',
        limits: { activeMentees: 25, matchSuggestionsPerDay: 100, assistantMessagesPerDay: 400, aiGenerationsPerDay: 60, driveStorageGb: 100, sessionsPerMonth: 80 },
        highlights: ['25 active mentees', 'Featured in the directory', 'Paid mentorship enabled', 'Outcome tracking'],
      },
      elite: {
        price: 99,
        summary: 'Mentorship as a practice.',
        limits: { activeMentees: INF, matchSuggestionsPerDay: INF, assistantMessagesPerDay: INF, aiGenerationsPerDay: INF, driveStorageGb: 500, sessionsPerMonth: INF },
        highlights: ['Unlimited mentees and sessions', 'Top directory placement', 'Cohort programmes', 'Revenue share on referrals'],
      },
      enterprise: {
        price: null,
        summary: 'Accelerator and university programmes.',
        limits: { activeMentees: INF, matchSuggestionsPerDay: INF, assistantMessagesPerDay: INF, aiGenerationsPerDay: INF, driveStorageGb: INF, sessionsPerMonth: INF },
        highlights: ['Multi-mentor programmes', 'Cohort reporting', 'Custom contracts', 'Named support contact'],
      },
    },
  },

  influencer: {
    tagline: 'Help good ideas get seen.',
    tiers: {
      free: {
        price: 0,
        summary: 'Try the content tools.',
        limits: { activeCampaigns: 1, matchSuggestionsPerDay: 3, assistantMessagesPerDay: 10, aiGenerationsPerDay: 3, driveStorageGb: 1, scheduledPosts: 5 },
        highlights: ['1 active campaign', '3 AI generations per day', 'Caption generator'],
      },
      starter: {
        price: 19,
        summary: 'Post consistently without running dry.',
        limits: { activeCampaigns: 5, matchSuggestionsPerDay: 25, assistantMessagesPerDay: 100, aiGenerationsPerDay: 40, driveStorageGb: 25, scheduledPosts: 60 },
        highlights: ['5 active campaigns', '40 generations per day', 'Video generator', 'No advertising'],
      },
      pro: {
        price: 49,
        summary: 'Run campaigns at volume.',
        limits: { activeCampaigns: 20, matchSuggestionsPerDay: 100, assistantMessagesPerDay: 400, aiGenerationsPerDay: 150, driveStorageGb: 150, scheduledPosts: 400 },
        highlights: ['20 active campaigns', '150 generations per day', 'Auto-posting to socials', 'Performance analytics'],
      },
      elite: {
        price: 129,
        summary: 'Full creator operation.',
        limits: { activeCampaigns: INF, matchSuggestionsPerDay: INF, assistantMessagesPerDay: INF, aiGenerationsPerDay: INF, driveStorageGb: 750, scheduledPosts: INF },
        highlights: ['Unlimited campaigns and generation', 'Featured creator placement', 'Brand-deal marketplace access', 'Priority render queue'],
      },
      enterprise: {
        price: null,
        summary: 'Agencies and creator networks.',
        limits: { activeCampaigns: INF, matchSuggestionsPerDay: INF, assistantMessagesPerDay: INF, aiGenerationsPerDay: INF, driveStorageGb: INF, scheduledPosts: INF },
        highlights: ['Multi-creator accounts', 'Consolidated reporting', 'Custom contracts', 'Named support contact'],
      },
    },
  },

  investor: {
    tagline: 'Discover potential before it is obvious.',
    tiers: {
      free: {
        price: 0,
        summary: 'Watch the ecosystem.',
        limits: { watchlistSize: 5, matchSuggestionsPerDay: 3, assistantMessagesPerDay: 10, aiGenerationsPerDay: 2, driveStorageGb: 1, dataRoomAccess: 0 },
        highlights: ['5 startups on your watchlist', '3 Vision matches per day', 'Public traction signals'],
      },
      starter: {
        price: 29,
        summary: 'Track a real pipeline.',
        limits: { watchlistSize: 25, matchSuggestionsPerDay: 25, assistantMessagesPerDay: 100, aiGenerationsPerDay: 20, driveStorageGb: 25, dataRoomAccess: 5 },
        highlights: ['25 on your watchlist', '25 matches per day', '5 data rooms', 'No advertising'],
      },
      pro: {
        price: 79,
        summary: 'Serious deal flow and diligence.',
        limits: { watchlistSize: 100, matchSuggestionsPerDay: 100, assistantMessagesPerDay: 400, aiGenerationsPerDay: 60, driveStorageGb: 150, dataRoomAccess: 30 },
        highlights: ['100 on your watchlist', 'Early access to new Visions', '30 data rooms', 'Readiness score history'],
      },
      elite: {
        price: 199,
        summary: 'Fund-grade coverage.',
        limits: { watchlistSize: INF, matchSuggestionsPerDay: INF, assistantMessagesPerDay: INF, aiGenerationsPerDay: INF, driveStorageGb: 750, dataRoomAccess: INF },
        highlights: ['Unlimited watchlist and matches', 'First look at conversions', 'Unlimited data rooms', 'Direct founder introductions'],
      },
      enterprise: {
        price: null,
        summary: 'Funds, syndicates and family offices.',
        limits: { watchlistSize: INF, matchSuggestionsPerDay: INF, assistantMessagesPerDay: INF, aiGenerationsPerDay: INF, driveStorageGb: INF, dataRoomAccess: INF },
        highlights: ['Team seats and shared pipeline', 'API access to signals', 'Custom contracts and SSO', 'Named support contact'],
      },
    },
  },
};

/** Member falls back to the founder ladder — it is the broadest. */
ROLE_PLANS.member = ROLE_PLANS.founder;

/** Human labels for the limit keys each role cares about. */
export const LIMIT_LABELS = {
  activeVisions: 'Active Visions',
  activeApplications: 'Open applications',
  activeMentees: 'Active mentees',
  activeCampaigns: 'Active campaigns',
  watchlistSize: 'Watchlist size',
  matchSuggestionsPerDay: 'AI matches per day',
  assistantMessagesPerDay: 'Assistant messages per day',
  aiGenerationsPerDay: 'AI generations per day',
  driveStorageGb: 'SF Drive storage (GB)',
  teamSeats: 'Team seats',
  portfolioItems: 'Portfolio items',
  sessionsPerMonth: 'Sessions per month',
  scheduledPosts: 'Scheduled posts',
  dataRoomAccess: 'Data rooms',
};

/**
 * Resolve the full ladder for a role, merged with the shared tier metadata.
 * Returns an array in ladder order, ready to render.
 */
export function plansForRole(role = 'member') {
  const ladder = ROLE_PLANS[role] || ROLE_PLANS.member;
  return TIERS.map((tier) => ({
    id: tier,
    ...TIER_META[tier],
    ...ladder.tiers[tier],
  }));
}

export function taglineForRole(role = 'member') {
  return (ROLE_PLANS[role] || ROLE_PLANS.member).tagline;
}

/** The limit keys this role's ladder actually uses, in a sensible order. */
export function limitKeysForRole(role = 'member') {
  const ladder = ROLE_PLANS[role] || ROLE_PLANS.member;
  return Object.keys(ladder.tiers.pro.limits);
}
