/**
 * MOMENTUM — how alive is this Vision right now?
 *
 * A listing of Visions all rendered identically tells you nothing about which
 * ones are actually moving. Readiness score doesn't fill that gap either: a
 * Vision can score well because its creator filled in every field and then
 * abandoned it. Momentum is about *recent* pull — people arriving, joining,
 * talking — which is the thing a builder deciding where to spend their evenings
 * or an investor scanning deal flow actually wants to see.
 *
 * The output drives a flame on the card. That only means something if most
 * Visions don't have one, so the thresholds are deliberately high and `tierOf`
 * returns null below the first rung. A flame on everything is a flame on
 * nothing.
 *
 * ⚠️ Weighting is a product judgement, not a fact. It is here in one place so
 * it can be argued with and tuned. When the backend can compute this over a
 * real time window it should — `GET /api/visions?include=momentum` — and this
 * becomes the fallback for whatever it doesn't send.
 */

/**
 * What each signal is worth.
 *
 * Ordered by how hard the signal is to fake. Anyone can click a heart; joining
 * a team is a real commitment, so a collaborator counts for twenty likes.
 */
export const WEIGHTS = {
  collaborators: 20,
  comments: 4,
  likes: 1,
  views: 0.05,
  followers: 3,
};

/** Signals decay, so recent activity is worth more than the all-time total. */
const HALF_LIFE_DAYS = 14;

export const TIERS = [
  { id: 'blazing', min: 320, label: 'Blazing', accent: '#ff6f3c', flames: 3 },
  { id: 'hot', min: 140, label: 'Hot', accent: '#ffa03c', flames: 2 },
  { id: 'warm', min: 55, label: 'Rising', accent: '#ffbf5e', flames: 1 },
];

/**
 * Exponential decay on age. A Vision with 200 likes from a year ago is not hot;
 * a Vision with 60 from this week is.
 */
function recencyFactor(lastActivityAt) {
  if (!lastActivityAt) return 0.5; // unknown age — assume middling, don't reward
  const days = (Date.now() - new Date(lastActivityAt).getTime()) / 86_400_000;
  if (!Number.isFinite(days) || days < 0) return 1;
  return 2 ** (-days / HALF_LIFE_DAYS);
}

/**
 * Raw momentum score for a Vision or idea.
 *
 * Reads whatever shape the caller has — the ideation list, the vision detail
 * payload and the dashboard widgets all name these fields slightly differently.
 */
export function momentumScore(item = {}) {
  const n = (...keys) => {
    for (const k of keys) {
      const v = item[k];
      if (typeof v === 'number' && Number.isFinite(v)) return v;
      if (Array.isArray(v)) return v.length;
    }
    return 0;
  };

  const raw =
    n('collaborators', 'collaboratorsCount', 'members', 'memberCount') * WEIGHTS.collaborators +
    n('comments', 'commentsCount') * WEIGHTS.comments +
    n('likes', 'likesCount') * WEIGHTS.likes +
    n('views', 'viewsCount') * WEIGHTS.views +
    n('followers', 'followersCount') * WEIGHTS.followers;

  const recency = recencyFactor(
    item.lastActivityAt || item.updatedAt || item.updated_at || item.createdAt || item.created_at
  );

  return Math.round(raw * recency);
}

/** The tier this score falls in, or null when it hasn't earned a flame. */
export function tierOf(score) {
  return TIERS.find((t) => score >= t.min) || null;
}

/** Convenience: score and tier in one call. */
export function momentumOf(item) {
  const score = momentumScore(item);
  return { score, tier: tierOf(score) };
}

/**
 * Human summary for a tooltip. Says *why* it's hot rather than just that it is,
 * because "Hot" with no reason is noise.
 */
export function momentumReason(item = {}) {
  const parts = [];
  const collab = item.collaborators ?? item.memberCount ?? 0;
  const comments = item.comments ?? item.commentsCount ?? 0;
  const likes = item.likes ?? item.likesCount ?? 0;

  if (collab) parts.push(`${collab} ${collab === 1 ? 'person' : 'people'} on the team`);
  if (comments) parts.push(`${comments} ${comments === 1 ? 'comment' : 'comments'}`);
  if (likes) parts.push(`${likes} ${likes === 1 ? 'like' : 'likes'}`);

  return parts.length ? parts.join(' · ') : 'Recent activity';
}

/** Sort helper — highest momentum first, for "what's moving" views. */
export function byMomentum(a, b) {
  return momentumScore(b) - momentumScore(a);
}
