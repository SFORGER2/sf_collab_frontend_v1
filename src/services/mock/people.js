/**
 * SAMPLE PEOPLE.
 *
 * Discovery, matchmaking and the Vision "unlock more profiles" gate are all
 * unreviewable against an empty list — you cannot tell a broken page from an
 * empty one, and you certainly cannot see whether a credits gate that triggers
 * after ten results actually works. So there are sixteen here: enough to fill a
 * grid, page, and push past the free tier.
 *
 * They are deliberately varied across role, seniority, location and
 * availability, because a list of sixteen identical senior React developers
 * tests nothing about filtering.
 *
 * ⚠️ SAMPLE DATA. Surfaces that use it must say so — see `isSample` on the
 * result — and it must never be mixed silently into real results.
 */

const P = (id, first, last, role, headline, extra = {}) => ({
  id: `sample-${id}`,
  firstName: first,
  lastName: last,
  first_name: first,
  last_name: last,
  name: `${first} ${last}`,
  role,
  headline,
  status: 'active',
  isSample: true,
  ...extra,
});

export const SAMPLE_PEOPLE = [
  P(1, 'Ada', 'Okonkwo', 'founder', 'Building payments rails for African SMEs', {
    city: 'Lagos', country: 'Nigeria', skills: ['Product', 'Fintech', 'Fundraising'],
    seniority: 'Lead', yearsExperience: 9, availability: 'Full-time', match: 94,
  }),
  P(2, 'Mikkel', 'Rasmussen', 'builder', 'Backend engineer — Go, Postgres, boring reliable systems', {
    city: 'Copenhagen', country: 'Denmark', skills: ['Go', 'Postgres', 'Kubernetes'],
    seniority: 'Senior', yearsExperience: 7, availability: 'Part-time', match: 91,
  }),
  P(3, 'Priya', 'Raghavan', 'builder', 'Frontend + design systems', {
    city: 'Bengaluru', country: 'India', skills: ['React', 'TypeScript', 'Figma'],
    seniority: 'Senior', yearsExperience: 6, availability: 'Full-time', match: 89,
  }),
  P(4, 'Tomás', 'Ferreira', 'builder', 'Payments and billing infrastructure', {
    city: 'Lisbon', country: 'Portugal', skills: ['Stripe', 'Node', 'Security'],
    seniority: 'Senior', yearsExperience: 8, availability: 'Weekends', match: 86,
  }),
  P(5, 'Yuki', 'Nakamura', 'influencer', 'Design storytelling, 240k across platforms', {
    city: 'Tokyo', country: 'Japan', skills: ['Brand', 'Video', 'Community'],
    seniority: 'Lead', yearsExperience: 5, audienceSize: 240000, match: 84,
  }),
  P(6, 'Lena', 'Hoffmann', 'builder', 'Product designer — 0 to 1, then again', {
    city: 'Berlin', country: 'Germany', skills: ['Figma', 'Prototyping', 'Research'],
    seniority: 'Senior', yearsExperience: 7, availability: 'Full-time', match: 83,
  }),
  P(7, 'Kwame', 'Boateng', 'mentor', 'Two exits. Now helping first-time founders not repeat them', {
    city: 'Accra', country: 'Ghana', skills: ['GTM', 'Fundraising', 'Hiring'],
    seniority: 'Principal', yearsExperience: 15, match: 81,
  }),
  P(8, 'Sofia', 'Marchetti', 'builder', 'Design systems and component libraries', {
    city: 'Milan', country: 'Italy', skills: ['Design systems', 'CSS', 'Accessibility'],
    seniority: 'Senior', yearsExperience: 6, availability: 'Part-time', match: 79,
  }),
  P(9, 'Idris', 'Haddad', 'builder', 'Security engineer — audits, threat models, incident response', {
    city: 'Amman', country: 'Jordan', skills: ['AppSec', 'Cloud', 'Auditing'],
    seniority: 'Lead', yearsExperience: 10, availability: 'Occasional', match: 77,
  }),
  P(10, 'Nora', 'Lindqvist', 'investor', 'Pre-seed cheques into climate and infrastructure', {
    city: 'Stockholm', country: 'Sweden', skills: ['Diligence', 'Climate', 'Pre-seed'],
    seniority: 'Principal', yearsExperience: 12, match: 76,
  }),
  // Everything from here is behind the ten-result free tier — the whole point
  // of having sixteen is that the gate is visible.
  P(11, 'Diego', 'Salazar', 'builder', 'Mobile — React Native, shipped 14 apps', {
    city: 'Bogotá', country: 'Colombia', skills: ['React Native', 'iOS', 'Android'],
    seniority: 'Mid', yearsExperience: 4, availability: 'Full-time', match: 74,
  }),
  P(12, 'Aisha', 'Rahman', 'founder', 'Health records that patients actually own', {
    city: 'Kuala Lumpur', country: 'Malaysia', skills: ['Health tech', 'Regulatory', 'Product'],
    seniority: 'Senior', yearsExperience: 8, availability: 'Full-time', match: 72,
  }),
  P(13, 'Owen', 'Whitfield', 'builder', 'Data engineering and pipelines that do not wake you up', {
    city: 'Manchester', country: 'United Kingdom', skills: ['Python', 'dbt', 'Airflow'],
    seniority: 'Senior', yearsExperience: 9, availability: 'Part-time', match: 70,
  }),
  P(14, 'Marta', 'Nowak', 'mentor', 'Scaled two engineering orgs from 5 to 60', {
    city: 'Kraków', country: 'Poland', skills: ['Engineering management', 'Hiring', 'Process'],
    seniority: 'Principal', yearsExperience: 14, match: 68,
  }),
  P(15, 'Rafael', 'Costa', 'influencer', 'Developer education, 90k on YouTube', {
    city: 'São Paulo', country: 'Brazil', skills: ['Content', 'Teaching', 'Video'],
    seniority: 'Mid', yearsExperience: 4, audienceSize: 90000, match: 66,
  }),
  P(16, 'Hana', 'Suleiman', 'builder', 'ML engineer — retrieval, evals, and saying no to demos', {
    city: 'Dubai', country: 'UAE', skills: ['Python', 'LLMs', 'Evaluation'],
    seniority: 'Senior', yearsExperience: 6, availability: 'Occasional', match: 64,
  }),
];

/** How many results a free plan sees before the credits gate — see entitlements. */
export const FREE_RESULTS = 10;

/**
 * Use real results when there are any, sample data when there are none.
 *
 * Returns `isSample` so the surface can label it. Silently blending sample
 * people into a real list would be worse than an empty page — someone would
 * try to message them.
 */
export function withSampleFallback(items, { enabled = true } = {}) {
  if (!enabled) return { items, isSample: false };
  if (Array.isArray(items) && items.length > 0) return { items, isSample: false };
  return { items: SAMPLE_PEOPLE, isSample: true };
}
