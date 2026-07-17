import React from 'react';
import MatchCard from '@/components/matchmaking/MatchCard';

const demoMatches = [
  {
    id: 'startup-1001',
    kind: 'startup',
    name: 'Northstar Robotics',
    role: 'Series A startup',
    matchScore: 92,
    aiExplanation: 'Strong alignment on robotics, automation, and execution stage.',
    avatarUrl: 'https://i.pravatar.cc/160?img=12',
    reasons: [
      'Building in a market that matches your operating background',
      'Team needs line up with your current role and strengths',
      'High momentum with a clear near-term delivery plan',
    ],
    meta: {
      stage: 'Series A',
      company: 'Northstar Robotics',
      focus: 'Autonomous systems',
    },
  },
  {
    id: 'builder-2048',
    kind: 'builder',
    name: 'Avery Chen',
    role: 'Full-stack builder',
    matchScore: 86,
    aiExplanation: 'Solid product and shipping fit with strong frontend execution.',
    avatarUrl: 'https://i.pravatar.cc/160?img=32',
    reasons: [
      'Strong overlap with product-led growth and rapid iteration',
      'Experience shipping across frontend and API layers',
      'Good fit for collaborative startup environments',
    ],
    meta: {
      skills: ['React', 'Node.js', 'Design systems'],
      expertise: 'Frontend architecture',
      focus: 'Product engineering',
    },
  },
  {
    id: 7082,
    kind: 'mentor',
    name: 'Priya Nair',
    role: 'Go-to-market mentor',
    matchScore: 79,
    aiExplanation: 'Best suited for strategic guidance and launch support.',
    avatarUrl: 'https://i.pravatar.cc/160?img=45',
    reasons: [
      'Relevant domain expertise for early-stage teams',
      'Can help with positioning, messaging, and outreach',
      'Balanced operational and advisory style',
    ],
    meta: {
      expertise: 'B2B SaaS GTM',
      thesis: 'Early-stage growth',
      focus: 'Mentorship',
    },
  },
];

export default function MatchCardDemo() {
  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Local demo</p>
          <h1 className="text-2xl font-semibold sm:text-3xl">MatchCard action preview</h1>
          <p className="max-w-2xl text-sm leading-6 text-slate-400">
            This route is only for local visual testing of the new startup and profile actions.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {demoMatches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      </div>
    </div>
  );
}
