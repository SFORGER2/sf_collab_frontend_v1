/**
 * PROFILE SCHEMA — the complete field catalogue.
 *
 * One place describing every piece of information SFCollab can hold about a
 * person. The profile previously carried ten fields (bio, city, country,
 * company, experience, github, linkedin, twitter, portfolio, timezone), which is
 * far too thin for what the platform does with a profile: matchmaking, team
 * assembly, pitch decks, investor introductions and the assistant's context all
 * read from it.
 *
 * This is designed to be filled *automatically*. Every field carries `aiFill`
 * describing where the assistant can source it, so the backend and the assistant
 * agree on what is inferable versus what must be confirmed by the person:
 *
 *   'infer'   — the assistant can derive it from activity in the platform
 *   'extract' — parse it out of an uploaded CV, GitHub, or LinkedIn
 *   'ask'     — must come from the person; never guess
 *   'derived' — computed by the platform, not editable
 *
 * `reuse` lists the surfaces that consume a field. It exists so nobody deletes a
 * field without knowing what breaks, and so the assistant knows which gaps are
 * worth chasing first.
 *
 * ⚠️ FRONTEND CONTRACT ONLY. The backend owns persistence and validation.
 * Field `key`s are the wire names — keep them stable.
 */

export const FIELD_GROUPS = [
  {
    id: 'identity',
    label: 'Identity',
    accent: '#ffbf5e',
    description: 'Who you are. Shown wherever you appear in the ecosystem.',
    fields: [
      { key: 'firstName', label: 'First name', type: 'text', required: true, aiFill: 'ask', reuse: ['everywhere'] },
      { key: 'lastName', label: 'Last name', type: 'text', required: true, aiFill: 'ask', reuse: ['everywhere'] },
      { key: 'headline', label: 'Headline', type: 'text', hint: 'One line: what you do', aiFill: 'infer', reuse: ['discovery', 'matchmaking', 'profile card'] },
      { key: 'bio', label: 'Bio', type: 'longtext', hint: 'A paragraph in your own words', aiFill: 'ask', reuse: ['profile', 'investor intros'] },
      { key: 'pronouns', label: 'Pronouns', type: 'text', aiFill: 'ask', reuse: ['profile'] },
      { key: 'profilePicture', label: 'Profile picture', type: 'image', aiFill: 'ask', reuse: ['everywhere'] },
      { key: 'coverPhoto', label: 'Cover image', type: 'image', aiFill: 'ask', reuse: ['profile'] },
      { key: 'languages', label: 'Languages', type: 'tags', aiFill: 'extract', reuse: ['matchmaking', 'team fit'] },
    ],
  },
  {
    id: 'location',
    label: 'Location & availability',
    accent: '#4fd8ff',
    description: 'Where you are and how you can work. Drives timezone overlap in matchmaking.',
    fields: [
      { key: 'city', label: 'City', type: 'text', aiFill: 'ask', reuse: ['discovery', 'matchmaking'] },
      { key: 'country', label: 'Country', type: 'select', aiFill: 'ask', reuse: ['discovery', 'matchmaking'] },
      { key: 'timezone', label: 'Timezone', type: 'timezone', aiFill: 'infer', reuse: ['world clock', 'meeting scheduling'] },
      { key: 'availability', label: 'Availability', type: 'select', options: ['Full-time', 'Part-time', 'Weekends', 'Occasional', 'Not looking'], aiFill: 'ask', reuse: ['matchmaking', 'team assembly'] },
      { key: 'hoursPerWeek', label: 'Hours per week', type: 'number', aiFill: 'ask', reuse: ['matchmaking', 'task planning'] },
      { key: 'workPreference', label: 'Work preference', type: 'select', options: ['Remote', 'Hybrid', 'On-site'], aiFill: 'ask', reuse: ['matchmaking'] },
      { key: 'openToRelocate', label: 'Open to relocating', type: 'boolean', aiFill: 'ask', reuse: ['matchmaking'] },
    ],
  },
  {
    id: 'skills',
    label: 'Skills & craft',
    accent: '#3ee6a0',
    description: 'What you can actually do. The single biggest input to matchmaking.',
    fields: [
      { key: 'primaryRole', label: 'Primary role', type: 'select', options: ['Fullstack Engineer', 'Frontend Developer', 'Backend Engineer', 'Mobile Engineer', 'AI Engineer', 'Data Scientist', 'Product Designer', 'Brand Designer', 'Growth Marketer', 'Content Strategist', 'Community Manager', 'Operations', 'Sales', 'Legal', 'Finance', 'Founder'], aiFill: 'infer', reuse: ['matchmaking', 'discovery'] },
      { key: 'skills', label: 'Skills', type: 'tags', hint: 'React, Figma, SQL…', aiFill: 'extract', reuse: ['matchmaking', 'task routing'] },
      { key: 'techStack', label: 'Technology stack', type: 'tags', aiFill: 'extract', reuse: ['matchmaking', 'startup fit'] },
      { key: 'seniority', label: 'Seniority', type: 'select', options: ['Junior', 'Mid', 'Senior', 'Lead', 'Principal'], aiFill: 'infer', reuse: ['matchmaking', 'equity discussions'] },
      { key: 'yearsExperience', label: 'Years of experience', type: 'number', aiFill: 'extract', reuse: ['matchmaking', 'mentor lens'] },
      { key: 'industries', label: 'Industry experience', type: 'tags', aiFill: 'extract', reuse: ['matchmaking', 'investor fit'] },
      { key: 'certifications', label: 'Certifications', type: 'list', aiFill: 'extract', reuse: ['profile', 'credibility'] },
    ],
  },
  {
    id: 'history',
    label: 'Experience & education',
    accent: '#8b6cff',
    description: 'Your track record. Extracted from a CV or LinkedIn, then confirmed by you.',
    fields: [
      { key: 'currentCompany', label: 'Current company', type: 'text', aiFill: 'extract', reuse: ['profile', 'investor intros'] },
      { key: 'jobTitle', label: 'Current title', type: 'text', aiFill: 'extract', reuse: ['profile'] },
      { key: 'experience', label: 'Work history', type: 'entries', entry: ['company', 'title', 'from', 'to', 'summary'], aiFill: 'extract', reuse: ['profile', 'pitch deck team slide'] },
      { key: 'education', label: 'Education', type: 'entries', entry: ['institution', 'qualification', 'from', 'to'], aiFill: 'extract', reuse: ['profile', 'credibility'] },
      { key: 'notableWork', label: 'Notable work', type: 'entries', entry: ['title', 'link', 'summary'], aiFill: 'extract', reuse: ['profile', 'proof of work'] },
      { key: 'exits', label: 'Exits / outcomes', type: 'entries', entry: ['company', 'outcome', 'year'], aiFill: 'ask', reuse: ['mentor lens: proven founders', 'investor trust'] },
    ],
  },
  {
    id: 'links',
    label: 'Links & presence',
    accent: '#ff4fd8',
    description: 'Where else you exist. Also how the assistant enriches everything above.',
    fields: [
      { key: 'website', label: 'Website', type: 'url', aiFill: 'ask', reuse: ['profile'] },
      { key: 'github', label: 'GitHub', type: 'url', aiFill: 'ask', reuse: ['skill extraction', 'builder credibility'] },
      { key: 'linkedin', label: 'LinkedIn', type: 'url', aiFill: 'ask', reuse: ['experience extraction'] },
      { key: 'twitter', label: 'X / Twitter', type: 'url', aiFill: 'ask', reuse: ['influencer reach'] },
      { key: 'dribbble', label: 'Dribbble / Behance', type: 'url', aiFill: 'ask', reuse: ['designer portfolio'] },
      { key: 'youtube', label: 'YouTube', type: 'url', aiFill: 'ask', reuse: ['influencer reach'] },
      { key: 'portfolio', label: 'Portfolio', type: 'url', aiFill: 'ask', reuse: ['proof of work'] },
      { key: 'cv', label: 'CV / résumé', type: 'file', hint: 'The assistant reads this to fill the rest', aiFill: 'ask', reuse: ['auto-fill source'] },
      { key: 'audienceSize', label: 'Audience size', type: 'number', aiFill: 'infer', reuse: ['influencer plans', 'mentor lens: reach'] },
    ],
  },
  {
    id: 'goals',
    label: 'Goals & intent',
    accent: '#ffbf5e',
    description: 'Why you are here. This is what makes matchmaking feel intentional instead of random.',
    fields: [
      { key: 'lookingFor', label: 'Looking for', type: 'multiselect', options: ['A co-founder', 'A team to join', 'Clients', 'Mentorship', 'To mentor', 'Investment', 'To invest', 'Learning', 'Community'], aiFill: 'ask', reuse: ['matchmaking', 'dashboard prompts'] },
      { key: 'interests', label: 'Interests', type: 'tags', aiFill: 'infer', reuse: ['discovery feed', 'AI news personalisation'] },
      { key: 'goals', label: 'Goals', type: 'list', hint: 'What you want in the next 12 months', aiFill: 'ask', reuse: ['assistant context', 'roadmap suggestions'] },
      { key: 'commitmentLevel', label: 'Commitment level', type: 'select', options: ['Exploring', 'Serious', 'All in'], aiFill: 'infer', reuse: ['matchmaking', 'founder confidence'] },
      { key: 'compensationPreference', label: 'Compensation preference', type: 'multiselect', options: ['Equity', 'Cash', 'Revenue share', 'SF Coins', 'Experience only'], aiFill: 'ask', reuse: ['team assembly', 'offer matching'] },
    ],
  },
  {
    id: 'reputation',
    label: 'Reputation & activity',
    accent: '#3ee6a0',
    description: 'Earned, not entered. Computed from what you actually do here.',
    readOnly: true,
    fields: [
      { key: 'reputationScore', label: 'Reputation', type: 'number', aiFill: 'derived', reuse: ['discovery ranking', 'matchmaking weight'] },
      { key: 'level', label: 'Level', type: 'number', aiFill: 'derived', reuse: ['profile', 'gamification'] },
      { key: 'contributionsCount', label: 'Contributions', type: 'number', aiFill: 'derived', reuse: ['proof of work'] },
      { key: 'tasksCompleted', label: 'Tasks completed', type: 'number', aiFill: 'derived', reuse: ['builder credibility'] },
      { key: 'streakDays', label: 'Streak', type: 'number', aiFill: 'derived', reuse: ['gamification'] },
      { key: 'achievements', label: 'Achievements', type: 'list', aiFill: 'derived', reuse: ['profile', 'store unlocks'] },
      { key: 'startupsFounded', label: 'Startups founded', type: 'number', aiFill: 'derived', reuse: ['founder credibility'] },
      { key: 'startupsJoined', label: 'Startups joined', type: 'number', aiFill: 'derived', reuse: ['builder credibility'] },
      { key: 'endorsements', label: 'Endorsements', type: 'list', aiFill: 'derived', reuse: ['trust signals'] },
      { key: 'satisfactionPercentage', label: 'Satisfaction', type: 'number', aiFill: 'derived', reuse: ['mentor and builder ranking'] },
    ],
  },
  {
    id: 'appearance',
    label: 'Appearance',
    accent: '#8b6cff',
    description: 'How your profile looks. Cosmetics come from the marketplace.',
    fields: [
      { key: 'profileTheme', label: 'Profile theme', type: 'select', options: ['Cosmic', 'Business', 'Minimal', 'Gamified'], aiFill: 'ask', reuse: ['profile rendering'] },
      { key: 'avatarFrame', label: 'Avatar frame', type: 'cosmetic', aiFill: 'ask', reuse: ['everywhere you appear'] },
      { key: 'profileBanner', label: 'Banner style', type: 'cosmetic', aiFill: 'ask', reuse: ['profile'] },
      { key: 'nameEffect', label: 'Name effect', type: 'cosmetic', aiFill: 'ask', reuse: ['profile', 'discovery cards'] },
    ],
  },
];

/** Flat lookup by wire name. */
export const FIELDS_BY_KEY = FIELD_GROUPS.reduce((acc, g) => {
  g.fields.forEach((f) => { acc[f.key] = { ...f, group: g.id }; });
  return acc;
}, {});

/** Every field the assistant can populate without asking. */
export const AUTO_FILLABLE = Object.values(FIELDS_BY_KEY).filter(
  (f) => f.aiFill === 'infer' || f.aiFill === 'extract'
);

const isEmpty = (v) =>
  v == null || v === '' || (Array.isArray(v) && v.length === 0) ||
  (typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 0);

/**
 * Completeness for one group, ignoring derived fields (you cannot "fill in"
 * your reputation).
 */
export function groupCompleteness(group, profile = {}) {
  const scored = group.fields.filter((f) => f.aiFill !== 'derived');
  if (!scored.length) return 100;
  const filled = scored.filter((f) => !isEmpty(profile?.[f.key])).length;
  return Math.round((filled / scored.length) * 100);
}

/** Overall completeness across every non-derived field. */
export function profileCompleteness(profile = {}) {
  const scored = Object.values(FIELDS_BY_KEY).filter((f) => f.aiFill !== 'derived');
  const filled = scored.filter((f) => !isEmpty(profile?.[f.key])).length;
  return Math.round((filled / scored.length) * 100);
}

/**
 * What the assistant should chase next: empty fields it can fill itself,
 * highest-leverage first (most reuse sites wins).
 */
export function suggestedAutoFills(profile = {}, limit = 6) {
  return AUTO_FILLABLE
    .filter((f) => isEmpty(profile?.[f.key]))
    .sort((a, b) => (b.reuse?.length || 0) - (a.reuse?.length || 0))
    .slice(0, limit);
}

/** Empty fields only the person can answer. */
export function missingUserInput(profile = {}, limit = 6) {
  return Object.values(FIELDS_BY_KEY)
    .filter((f) => f.aiFill === 'ask' && isEmpty(profile?.[f.key]))
    .sort((a, b) => (b.reuse?.length || 0) - (a.reuse?.length || 0))
    .slice(0, limit);
}
