/**
 * TOUR CONTENT
 *
 * Every walkthrough in the app, in one place. Previously each page shipped its
 * own react-joyride component with its own copy, so the tours drifted apart and
 * none of them knew which role was reading.
 *
 * Convention: each tour ends on a finale step (one carrying `points`) — the
 * promise of what the ecosystem does for you. That is the reason people stay,
 * so every tour closes on it.
 *
 * Steps: { icon, eyebrow, title, body, cta?, points?, closing?, finishLabel? }
 */
import {
  BadgeCheck, Bookmark, BrainCircuit, Check, Coins, Eye, FolderOpen,
  GraduationCap, Heart, Lightbulb, Megaphone, MessageSquare, Rocket, Search,
  Share2, Sparkles, Target, TrendingUp, UserPlus, Users, Video,
} from 'lucide-react';

/** The shared closing promise. Reused by every tour. */
export const PROMISE_STEP = {
  icon: Sparkles,
  eyebrow: 'Why this exists',
  title: 'You will not have to do this the hard way.',
  body:
    'Starting something usually means doing five jobs badly, paying for tools you cannot afford, and hoping the right person happens to find you. That is the part we are dismantling.',
  points: [
    'The work you would normally outsource — plans, decks, landing pages, content — generated from your own project context.',
    'The people you would normally spend months hunting — matched to the roles you actually need.',
    'The money that normally gates everything — replaced by contribution, credits and crowdfunding from day one.',
    'The knowledge you would normally lose — kept, connected and reused automatically.',
  ],
  closing:
    'And because every Vision built here makes the system sharper, you are not just building your company — you are building the thing that carries the next person further. Thousands of people walking the same direction, automated, compounding.',
  finishLabel: "Let's build",
};

/* ── Dashboard, per role ──────────────────────────────────────────────── */

export const DASHBOARD_TOURS = {
  founder: [
    { icon: Lightbulb, eyebrow: 'Step one', title: 'Start with a Vision.', body: 'Your idea does not have to pretend to be a company yet. Register it as a Vision, describe the problem and the outcome, and let it exist at the stage it is actually in.', cta: { label: 'Create a Vision', to: '/vision/new' } },
    { icon: Users, eyebrow: 'Step two', title: 'Let the ecosystem find your team.', body: 'Name the roles you need and AI matchmaking surfaces builders, designers and marketers whose skills fit. Ten matches a day are included; message several at once when you find the right ones.' },
    { icon: BrainCircuit, eyebrow: 'Step three', title: 'Build without starting from an empty page.', body: 'Business plan, landing page, logo, content — all generated from your Vision context, so you describe your company once instead of once per tool.' },
    { icon: TrendingUp, eyebrow: 'Step four', title: 'Prove it with signals.', body: 'Every milestone you complete earns readiness points. Hit the threshold and your Vision converts into a Startup — which unlocks crowdfunding from day one.' },
    { icon: FolderOpen, eyebrow: 'Step five', title: 'Keep what you learn.', body: 'SF Drive and SF Meet keep files, decisions and meetings attached to the project, so nothing is lost and your assistant keeps getting more useful.' },
    PROMISE_STEP,
  ],
  builder: [
    { icon: Rocket, eyebrow: 'Step one', title: 'Find work worth doing.', body: 'Browse Visions and Startups that need your exact skills. Filter to what you are good at, not what a job board thinks you are.', cta: { label: 'Browse startups', to: '/discover-startups' } },
    { icon: Check, eyebrow: 'Step two', title: 'Contribute real work.', body: 'Join a team, take tasks, ship them. Everything you complete is recorded — this becomes proof of what you can do, not a self-description.' },
    { icon: BadgeCheck, eyebrow: 'Step three', title: 'Build a reputation that travels.', body: 'Reputation here comes from contribution quality, reliability and outcomes. Founders search on it, so it opens the next door for you.' },
    { icon: Coins, eyebrow: 'Step four', title: 'Get paid, in more than one way.', body: 'Cash, equity promises, SF Coins and reputation. Track all of it in Rewards, and stake your coins in draws for credits and upgrades.' },
    PROMISE_STEP,
  ],
  mentor: [
    { icon: GraduationCap, eyebrow: 'Step one', title: 'Find teams worth your time.', body: 'See founders and builders actively asking for guidance in your areas of expertise — not cold outreach, people who want help.', cta: { label: 'Find people to mentor', to: '/mentors?seeking=1' } },
    { icon: Users, eyebrow: 'Step two', title: 'Guide the work, not just the meeting.', body: 'You see the roadmap, the decisions and the real execution. Your input lands on something concrete instead of a monthly catch-up call.' },
    { icon: BadgeCheck, eyebrow: 'Step three', title: 'Your track record compounds.', body: 'Outcomes you influenced become part of your standing here, which moves you up the mentor directory and brings better projects to you.' },
    PROMISE_STEP,
  ],
  influencer: [
    { icon: Rocket, eyebrow: 'Step one', title: 'Find what deserves attention.', body: 'Discover projects approaching launch that need an audience — early, before everyone else is talking about them.', cta: { label: 'Find launches', to: '/discover-startups?stage=launching' } },
    { icon: Megaphone, eyebrow: 'Step two', title: 'Create without the blank page.', body: 'Caption and video generators build from the startup real positioning, so what you publish is accurate as well as fast.' },
    { icon: TrendingUp, eyebrow: 'Step three', title: 'Your impact is measured.', body: 'Reach, traction and launches you supported are recorded — so your contribution is provable, not anecdotal.' },
    PROMISE_STEP,
  ],
  investor: [
    { icon: TrendingUp, eyebrow: 'Step one', title: 'See potential early.', body: 'Browse Visions and Startups with live readiness scores, team activity and real traction signals — before they are polished for a pitch.', cta: { label: 'Discover startups', to: '/discover-startups' } },
    { icon: Users, eyebrow: 'Step two', title: 'Watch execution, not decks.', body: 'Follow a project and you see what actually happens: milestones hit, people joining, decisions made. Diligence from primary evidence.' },
    { icon: BadgeCheck, eyebrow: 'Step three', title: 'Reach founders directly.', body: 'No warm-intro lottery. Contact teams whose progress you have been tracking, at the moment it makes sense.' },
    PROMISE_STEP,
  ],
  member: [
    { icon: Lightbulb, eyebrow: 'Step one', title: 'Choose how you want to build.', body: 'Founder, builder, mentor, influencer or investor — each gives you a different dashboard, different tools and different opportunities. You can hold more than one.' },
    { icon: Rocket, eyebrow: 'Step two', title: 'Explore what people are building.', body: 'Browse active Visions and Startups. Follow what interests you, save what you might join.', cta: { label: 'Explore Visions', to: '/ideation' } },
    { icon: Video, eyebrow: 'Step three', title: 'Everything in one place.', body: 'SF Drive for files, SF Meet for calls, the assistant for everything else — all sharing the same project context.' },
    PROMISE_STEP,
  ],
};

/* ── Visions page ─────────────────────────────────────────────────────── */

const VISION_ROLE_STEP = {
  founder: { icon: Target, eyebrow: 'For founders', title: 'This is where your idea becomes real.', body: 'Register a Vision and it starts working for you immediately: matchmaking looks for your missing roles, the AI tools inherit your context, and mentors and investors can find you.', cta: { label: 'Create a Vision', to: '/vision/new' } },
  builder: { icon: Search, eyebrow: 'For builders', title: 'Find the project you want your name on.', body: 'Every Vision lists the roles it needs. Filter to your craft, read the problem, and apply where the work actually interests you.' },
  mentor: { icon: GraduationCap, eyebrow: 'For mentors', title: 'Spot the teams who need direction.', body: 'Readiness scores show you where a Vision is weak — often exactly the gap your experience closes fastest.' },
  influencer: { icon: Megaphone, eyebrow: 'For influencers', title: 'Get in before the launch.', body: 'Visions approaching MVP are the ones worth amplifying. You can see their stage and momentum before anyone is talking about them.' },
  investor: { icon: TrendingUp, eyebrow: 'For investors', title: 'Watch ideas mature in the open.', body: 'Readiness points, team growth and community signals are all visible. You are seeing evidence, not a pitch.' },
  member: { icon: Heart, eyebrow: 'Getting started', title: 'Follow what interests you.', body: 'Save Visions, join discussions, and see which ones gather real momentum.' },
};

export function visionTour(role = 'member') {
  return [
    {
      icon: Lightbulb,
      eyebrow: 'What a Vision is',
      title: 'An idea, at the stage it is actually in.',
      body:
        'A Vision is not a pretend company. It is a structured idea — a problem, an outcome, the roles it needs — visible to the whole ecosystem while it is still forming.',
    },
    VISION_ROLE_STEP[role] || VISION_ROLE_STEP.member,
    {
      icon: TrendingUp,
      eyebrow: 'How it grows',
      title: 'Readiness points, not opinions.',
      body:
        'Defining the problem, naming roles, gathering collaborators and keeping momentum each earn points. At the threshold, the Vision converts into a Startup and crowdfunding opens.',
    },
    {
      icon: MessageSquare,
      eyebrow: 'How to help',
      title: 'Anyone can move a Vision forward.',
      body:
        'Saving, following, asking a good question and sharing all count as real signal. Support here is measurable, and it is remembered.',
    },
    /**
     * The card's secondary actions became icons in the redesign, which saved a
     * lot of space and cost their labels. Anything whose meaning is not obvious
     * from its icon alone gets explained here — Save and Share do not need it,
     * the two interest signals absolutely do.
     */
    {
      icon: Eye,
      eyebrow: 'The buttons on a card',
      title: 'Four ways to say you are interested.',
      body:
        'Interested in Contributing is the big one — it starts a real application with a role and your availability. The three icons beside it are one-tap signals that need no form.',
      legend: [
        { icon: UserPlus, label: 'Interested in Contributing', text: 'Apply to join the team. Asks for a role and hours.' },
        { icon: Eye, label: 'Interested in using', text: 'You would use this if it existed. Tells the founder there is demand.' },
        { icon: TrendingUp, label: 'Interested in investing', text: 'You would back it. Tells the founder there is capital.' },
        { icon: Bookmark, label: 'Save', text: 'Keeps it in Saved Ideas for later.' },
        { icon: Share2, label: 'Share', text: 'Copies a direct link to the Vision.' },
      ],
    },
    PROMISE_STEP,
  ];
}

/* ── AI tools page ────────────────────────────────────────────────────── */

export const AI_TOOLS_TOUR = [
  {
    icon: BrainCircuit,
    eyebrow: 'The idea',
    title: 'Tools that already know your startup.',
    body:
      'Every generator here reads your Vision context — the problem, the outcome, the positioning. You describe your company once, not once per tool.',
  },
  {
    icon: Coins,
    eyebrow: 'How it is priced',
    title: 'Credits, and only for real work.',
    body:
      'Each plan includes a daily allowance; credits cover anything beyond it. Longer outputs cost more, because a short answer and a twenty-page plan are not the same work. AI News is always free.',
    cta: { label: 'See credit costs', to: '/credits' },
  },
  {
    icon: Sparkles,
    eyebrow: 'Where to start',
    title: 'Your role decides the order.',
    body:
      'The tools most useful to your current role are surfaced first and marked "For You". Everything else stays one click away.',
  },
  PROMISE_STEP,
];

/* ── Posts / community ───────────────────────────────────────────────── */

export const POSTS_TOUR = [
  {
    icon: MessageSquare,
    eyebrow: 'The feed',
    title: 'Where the ecosystem talks.',
    body:
      'Progress updates, questions, launches and lessons from people building right now. Following someone here is how you end up working with them later.',
  },
  {
    icon: Users,
    eyebrow: 'Why post',
    title: 'Visibility is how you get found.',
    body:
      'Founders find builders through their posts. Investors notice teams that show their work. Posting consistently is the cheapest distribution you have.',
  },
  PROMISE_STEP,
];
