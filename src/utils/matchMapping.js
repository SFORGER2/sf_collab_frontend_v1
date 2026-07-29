export function mapBackendMatchToCard(backendMatch) {
  // Detect flat (already-mapped) shape vs nested backend shape.
  // Flat shape: mock data or pre-mapped data with top-level name/role/matchScore/aiExplanation.
  // Nested shape: real backend response with { profile: { name, role... }, score, explanation }.
  const isFlat = backendMatch.name != null && backendMatch.profile == null;

  if (isFlat) {
    // Pass-through — data is already in card-ready format
    return {
      id: backendMatch.id,
      kind: backendMatch.kind || 'user',
      name: backendMatch.name,
      role: backendMatch.role || '',
      matchScore: backendMatch.matchScore ?? 0,
      aiExplanation: backendMatch.aiExplanation || null,
      avatarUrl: backendMatch.avatarUrl || backendMatch.avatar || '',
      reasons: backendMatch.reasons || [],
      meta: backendMatch.meta || {},
      breakdown: backendMatch.breakdown || null,
    };
  }

  // Nested backend shape
  const { id, kind, profile, score, explanation, reasons, breakdown } = backendMatch;
  const { name, avatar, role, bio, skills, industry, stage, open_roles, member_count, rating, experience, expertise, free_paid, company } = profile || {};

  let meta = {};
  if (kind === 'startup') {
    meta = { industry, stage, openRoles: open_roles?.join(', '), members: member_count };
  } else if (kind === 'mentor') {
    meta = { rating, experience, expertise: expertise?.join(', '), free: free_paid ? 'Free' : 'Paid' };
  } else if (kind === 'investor') {
    meta = { company, bio };
  } else {
    meta = { skills: skills?.join(', '), bio };
  }

  return {
    id,
    kind,
    name: name || 'Unknown',
    role: role || (kind === 'startup' ? 'Startup' : ''),
    matchScore: score ?? 0,
    aiExplanation: explanation || null,
    avatarUrl: avatar || '',
    reasons: reasons || [],
    meta,
    breakdown: breakdown || null,
  };
}