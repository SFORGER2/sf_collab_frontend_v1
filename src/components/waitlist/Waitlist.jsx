import { Link } from "react-router-dom";
import { WaitlistSignup } from "./components/WaitlistSignup";
import { Toaster } from "./components/ui/toaster";
import { Button } from "./components/ui/button";
import { Sparkles, Award, ArrowRight, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";

/* =========================
   RANK TIERS
========================= */
const RANK_REWARDS = [
  {
    rank: "Top 1",
    badge: "🌠 Stardust Overlord",
    points: "600+",
    reward: "Lifetime full access + 0% builder fees",
    color: "from-yellow-600/20 to-orange-600/10",
    borderColor: "border-yellow-500/40",
    pointColor: "text-yellow-400",
    perks: [
      "Ultra-premium animated profile background (1/1, never reused)",
      "Animated elite profile border (1/1)",
      "Animated nickname (1/1)",
      'Animated custom title — "Stardust Overlord" or custom permanent title',
      "1/1 Overlord sigil",
    ],
  },
  {
    rank: "Top 10",
    badge: "🔑 Void Keymaster",
    points: "350+",
    reward: "Lifetime Founder Pro + 0% builder fees",
    color: "from-purple-600/20 to-violet-600/10",
    borderColor: "border-purple-500/40",
    pointColor: "text-purple-400",
    perks: [
      "Animated void-style profile background (Top-10 exclusive)",
      "Animated elite profile border",
      "Animated nickname (shared Top-10 style)",
      "Keymaster sigil",
    ],
  },
  {
    rank: "Top 50",
    badge: "☀️ Solar Warlord",
    points: "250+",
    reward: "18 months Founder Pro + 0% builder fees",
    color: "from-orange-600/20 to-red-600/10",
    borderColor: "border-orange-500/40",
    pointColor: "text-orange-400",
    perks: [
      "Animated tier-exclusive background",
      "Animated tier-exclusive border",
      "Animated nickname (shared Top-50 style)",
      "Core Circle channel",
      "Warlord insignia",
    ],
  },
  {
    rank: "Top 150",
    badge: "🌙 Lunar Dominator",
    points: "150+",
    reward: "6 months Founder Pro + 2% builder fees",
    color: "from-blue-600/20 to-indigo-600/10",
    borderColor: "border-blue-500/40",
    pointColor: "text-blue-400",
    perks: [
      "Animated background (tier-unique)",
      "Animated profile border (tier-unique)",
      "Static nickname",
      "Dominator crest",
    ],
  },
  {
    rank: "Top 1,000",
    badge: "🛠️ Nebula Forgelord",
    points: "75+",
    reward: "6 months Founder Starter + 5% builder fees",
    color: "from-cyan-600/20 to-teal-600/10",
    borderColor: "border-cyan-500/40",
    pointColor: "text-cyan-400",
    perks: [
      "Tier-unique standard background",
      "Tier-unique standard border",
      "Static nickname",
      "Forgelord badge",
    ],
  },
  {
    rank: "Top 10,000",
    badge: "✦ Astral Vanguard",
    points: "25+",
    reward: "1 month Founder Starter + 5% builder fees",
    color: "from-neutral-700/40 to-neutral-800/20",
    borderColor: "border-neutral-600/40",
    pointColor: "text-neutral-300",
    perks: [
      "Tier-unique standard background",
      "Tier-unique standard border",
      "Static nickname",
      "Vanguard mark",
      "Founding-era badge",
    ],
  },
];

const CONTRIBUTION_PATHS = [
  {
    icon: "🚀",
    title: "Crowdfunding Access",
    description: "Secure your access and help us grow by investing in future workspace.",
    badge: { label: "⚡ Fastest (Daily)", color: "text-yellow-400" },
  },
  {
    icon: "💡",
    title: "Submit an Idea",
    description: "Propose innovative ideas that will shape SFCollab's future.",
    badge: { label: "✨ Most Valuable (Daily)", color: "text-purple-400" },
  },
  {
    icon: "👥",
    title: "Refer Friends",
    description: "Invite builders or founders and earn points for every verified referral.",
  },
  {
    icon: "🗳️",
    title: "Vote in Polls",
    description: "Influence product decisions by participating in community polls.",
  },
  {
    icon: "🏢",
    title: "Register Your Startup",
    description: "Create a profile for your startup and join the SFCollab community.",
  },
  {
    icon: "🧪",
    title: "Idea Incubator",
    description: "Develop and refine ideas daily with community feedback.",
  },
  {
    icon: "🐛",
    title: "Report Bugs & Feedback",
    description: "Help improve SFCollab by reporting bugs and sharing feedback.",
  },
];

/* =========================
   ANIMATION VARIANTS
========================= */
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

/* =========================
   COMPONENT
========================= */
export default function Waitlist() {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="bg-neutral-950 min-h-screen text-white relative w-full">
      {/* Ambient background blobs */}
      <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-24 left-10 w-72 h-72 bg-blue-600/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-16 right-10 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="max-w-4xl mx-auto px-4 py-14 relative z-10">

        {/* ================= HERO ================= */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="text-center mb-12"
        >
          <motion.div variants={itemVariants} className="flex justify-center items-center gap-3 mb-4">
            <Sparkles className="h-7 w-7 text-blue-400 shrink-0" />
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Prestige Rank System
            </h1>
          </motion.div>
          <motion.p
            variants={itemVariants}
            className="text-base sm:text-lg text-neutral-400 max-w-2xl mx-auto leading-relaxed"
          >
            Compete for exclusive ranks through meaningful contributions, consistency, and impact — not payments.
          </motion.p>
        </motion.div>

        {/* ================= SIGNUP ================= */}
        <div className="mb-14">
          <WaitlistSignup />
        </div>

        {/* ================= HOW IT WORKS ================= */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="rounded-2xl bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-500/20 p-8 mb-14"
        >
          <motion.h2
            variants={itemVariants}
            className="text-2xl font-bold text-center mb-8"
          >
            How Prestige Ranks Work
          </motion.h2>

          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                step: "1",
                title: "Contribute",
                desc: "Earn points daily through startups, ideas, referrals & voting.",
              },
              {
                step: "2",
                title: "Climb Rankings",
                desc: "Reach point thresholds and maintain activity requirements.",
              },
              {
                step: "3",
                title: "Unlock Rewards",
                desc: "Competitive ranks unlock lifetime access, voting weight & exclusive benefits.",
              },
            ].map((s) => (
              <motion.div key={s.step} variants={itemVariants} className="text-center">
                <div className="w-12 h-12 mx-auto rounded-full bg-blue-600 flex items-center justify-center font-bold text-lg mb-3">
                  {s.step}
                </div>
                <h3 className="font-semibold mb-1">{s.title}</h3>
                <p className="text-sm text-neutral-400 leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ================= CONTRIBUTION PATHS ================= */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mb-14"
        >
          <motion.h2 variants={itemVariants} className="text-2xl font-bold text-center mb-6">
            Ways to Earn Points
          </motion.h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {CONTRIBUTION_PATHS.map((p, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className="bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-xl p-5 transition-colors"
              >
                <div className="text-2xl mb-2">{p.icon}</div>
                <h3 className="font-semibold mb-1 text-white">{p.title}</h3>
                <p className="text-sm text-neutral-400 leading-relaxed">{p.description}</p>
                {p.badge && (
                  <span className={`text-xs font-semibold block mt-2 ${p.badge.color}`}>
                    {p.badge.label}
                  </span>
                )}
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ================= RANK TIERS & REWARDS ================= */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mb-14"
        >
          <motion.h2
            variants={itemVariants}
            className="text-2xl font-bold text-center mb-6"
          >
            Competitive Rank Tiers & Rewards
          </motion.h2>

          <div className="grid sm:grid-cols-2 gap-4">
            {RANK_REWARDS.map((r, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className={`bg-gradient-to-br ${r.color} border ${r.borderColor} rounded-xl p-5 hover:brightness-110 transition-all`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="text-base font-bold text-white mb-0.5">{r.badge}</div>
                    <div className="text-xs text-neutral-400 uppercase tracking-wide">{r.rank}</div>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <div className="text-xs text-neutral-500 mb-0.5">Min Points</div>
                    <div className={`text-lg font-bold ${r.pointColor}`}>{r.points}</div>
                  </div>
                </div>
                <div className="text-sm font-medium text-neutral-200 mb-3">{r.reward}</div>
                <ul className="space-y-1">
                  {r.perks.map((perk, idx) => (
                    <li key={idx} className="text-xs text-neutral-400 flex items-start gap-1.5">
                      <span className="text-green-500 mt-0.5 shrink-0">✓</span>
                      {perk}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ================= INTEGRITY ================= */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="rounded-2xl border border-neutral-700 bg-neutral-900/50 p-6 mb-14"
        >
          <motion.h3
            variants={itemVariants}
            className="text-lg font-semibold mb-4 flex items-center gap-2"
          >
            <Award className="h-5 w-5 text-yellow-400 shrink-0" />
            Fair Play & System Integrity
          </motion.h3>
          <motion.ul variants={containerVariants} className="space-y-2.5 text-sm text-neutral-300">
            {[
              "Unlimited startups & ideas allowed — only the first of each per day earns points",
              "Ranks are competitive and actively maintained",
              "Abuse, automation, or farming may result in rank loss",
              "Prestige status must be maintained through ongoing participation",
            ].map((rule, i) => (
              <motion.li key={i} variants={itemVariants} className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5 shrink-0">✓</span>
                {rule}
              </motion.li>
            ))}
          </motion.ul>
        </motion.section>

        {/* ================= ADMIN LINK ================= */}
        {user?.role === "admin" && (
          <div className="mb-12">
            <Link to="/admin">
              <Button className="w-full bg-blue-600/80 hover:bg-blue-700 transition-colors">
                Admin Dashboard
              </Button>
            </Link>
          </div>
        )}

      </div>

      <Toaster />
    </div>
  );
}
