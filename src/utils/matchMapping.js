export function mapBackendMatchToCard(backendMatch) {
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
    matchScore: score || 0,
    aiExplanation: explanation || null,
    avatarUrl: avatar || '',
    reasons: reasons || [],
    meta,
    // We'll add breakdown separately for the card to use
    breakdown: breakdown || null,
  };
}