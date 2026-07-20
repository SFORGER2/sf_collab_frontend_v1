import { Link } from "react-router-dom";
import { WaitlistSignup } from "./components/WaitlistSignup";
import { Toaster } from "./components/ui/toaster";
import { Button } from "./components/ui/button";
import {
  Sparkles,
  Users,
  Award,
  Zap,
  Heart,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";

/* =========================
   CONFIG / CONSTANTS
========================= */

const POINT_VALUES = {
  startup: { points: 15, label: "Create a Startup", daily: true },
  idea: { points: 10, label: "Post an Idea", daily: true },
  referral: { points: 5, label: "Referral" },
  referral_bonus: { points: 25, label: "Referral Pack (5 referrals)" },
  poll_vote: { points: "1-10", label: "Poll Voting" },
};

const RANK_REWARDS = [
  {
    rank: "Top 1",
    badge: "🌠 Stardust Overlord",
    points: "600+",
    reward: "Lifetime full access + 0% builder fees",
    perks: [
      "Ultra-premium animated profile background (1/1, never reused)",
      "Animated elite profile border (1/1)",
      "Animated nickname (1/1)",
      "Animated custom title next to name “Stardust Overlord” or a custom permanent title",
      "1/1 Overlord sigil",
    ],
    access: [
      "Full platform lifetime access (all features) + 0% builder fees",
      "Direct founder communication",
      "×5 governance voting weight",
      "Permanent legacy recognition",
    ],
    description: "This rank carries significant real-world value and is reserved for the most committed contributors.",
  },
  {
    rank: "Top 10",
    badge: "🔑 Void Keymaster",
    points: "350+",
    reward: "Lifetime Founder Pro + 0% builder fees",
    perks: [
      "Animated void-style profile background (Top-10 exclusive)",
      "Animated elite profile border",
      "Animated nickname (shared Top-10 style)",
      "Keymaster sigil",
    ],
    access: [
      "Lifetime Founder Pro Access (3 selected premium features) + 0% builder fees",
      "Core Circle channel",
      "×3 governance voting weight",
      "Guaranteed early access",
    ],
  },
  {
    rank: "Top 50",
    badge: "☀ Solar Warlord",
    points: "250+",
    reward: "18 months Founder Pro + 0% builder fees",
    perks: [
      "Animated tier-exclusive background",
      "Animated tier-exclusive border",
      "Animated nickname (shared Top-50 style)",
      "Core Circle channel",
      "Warlord insignia",
    ],
    access: [
      "18 months Founder Pro Access (3 selected premium features) + 0% builder fees",
      "Priority support",
      "×2.5 governance voting weight",
    ],
  },
  {
    rank: "Top 150",
    badge: "🌙 Lunar Dominator",
    points: "150+",
    reward: "6 months Founder Pro + 2% builder fees",
    perks: [
      "Animated background (tier-unique)",
      "Animated profile border (tier-unique)",
      "Static nickname",
      "Dominator crest",
    ],
    access: [
      "6 months Founder Pro Access (3 selected premium features) + 2% builder fees",
      "Priority support",
      "×2 governance voting weight",
      "Early access",
    ],
  },
  {
    rank: "Top 1,000",
    badge: "🛠 Nebula Forgelord",
    points: "75+",
    reward: "6 months Founder Starter + 5% builder fees",
    perks: [
      "Tier-unique standard background",
      "Tier-unique standard border",
      "Static nickname",
      "Forgelord badge",
    ],
    access: [
      "6 months Founder Starter access + 5% builder fees",
      "Feature voting access",
      "Early access",
    ],
  },
  {
    rank: "Top 10,000",
    badge: "✦ Astral Vanguard",
    points: "25+",
    reward: "1 month Founder Starter + 5% builder fees",
    perks: [
      "Tier-unique standard background",
      "Tier-unique standard border",
      "Static nickname",
      "Vanguard mark",
      "Founding-era badge",
    ],
    access: [
      "1 month Founder Starter Access + 5% builder fees first month",
    ],
  },
];

const CONTRIBUTION_PATHS = [
  {
    icon: "🚀",
    title: "Crowdfunding Access",
    description: "Secure your access and help us grow by investing in future workspace.",
    fastest: true,
  },
  {
    icon: "💡",
    title: "Submit an Idea",
    description: "Propose innovative ideas that will shape SFCollab's future.",
    valuable: true,
  },
  {
    icon: "👥",
    title: "Refer Friends",
    description: "Invite builders or founders and earn points for every verified referral.",
  },
  {
    icon: "🗳",
    title: "Vote in Polls",
    description: "Influence product decisions by participating in community polls.",
  },
  {
    icon: "🚀",
    title: "Register Your Startup",
    description: "Create a profile for your startup and join the SFCollab community.",
  },
  {
    icon: "💡",
    title: "Idea Incubator",
    description: "Develop and refine ideas daily with community feedback.",
  },
  {
    icon: "⚡",
    title: "Report Bugs & Feedback",
    description: "Help improve SFCollab by reporting bugs and sharing feedback.",
  },
];

const QUICK_RANK_TIPS = [
  { action: "Create 1 Startup", points: "+15 pts/day", icon: "🏗" },
  { action: "Post 1 Idea", points: "+10 pts/day", icon: "💡" },
  { action: "5 Referrals", points: "+50 pts", icon: "🔗" },
];

/* =========================
   ANIMATION VARIANTS
========================= */

const containerVariants = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { staggerChildren: 0.12 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0 },
};

/* =========================
   COMPONENT
========================= */

export default function Waitlist() {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="bg-neutral-950 min-h-screen text-white relative overflow-y-auto w-full">
      {/* Background blobs */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-24 left-10 w-72 h-72 bg-blue-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-16 right-10 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="container px-4 py-14 relative z-10 w-full">
        {/* ================= HERO ================= */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="text-center mb-14"
        >
          <motion.div variants={itemVariants} className="flex justify-center gap-2 mb-4">
            <Sparkles className="h-8 w-8 text-blue-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Prestige Rank System
            </h1>
          </motion.div>

          <motion.p
            variants={itemVariants}
            className="text-xl text-neutral-400 max-w-2xl mx-auto"
          >
            Compete for exclusive ranks through meaningful contributions, consistency, and impact—not payments.
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
          className="rounded-2xl bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-500/30 p-8 mb-14"
        >
          <motion.h2
            variants={itemVariants}
            className="text-2xl font-bold text-center mb-8"
          >
            How Prestige Ranks Work
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {[
              { step: "1", title: "Contribute", desc: "Earn points daily through startups, ideas, referrals & voting." },
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
              <motion.div
                key={s.step}
                variants={itemVariants}
                className="text-center"
              >
                <div className="w-12 h-12 mx-auto rounded-full bg-blue-600 flex items-center justify-center font-bold mb-3">
                  {s.step}
                </div>
                <h3 className="font-semibold mb-1">{s.title}</h3>
                <p className="text-sm text-neutral-400">{s.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/contribution">
              <Button className="bg-blue-600 hover:bg-blue-700 flex gap-2">
                Start Contributing <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/refer">
              <Button variant="outline" className="border-blue-500/50 text-black">
                View Rankings <TrendingUp className="h-4 w-4" />
              </Button>
            </Link>
          </div> */}
        </motion.section>

        {/* ================= FAST TRACK ================= */}
        {/* <motion.section
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 mb-14"
        >
          <motion.h3 variants={itemVariants} className="text-xl font-semibold mb-6">
            Fastest Ways to Rank Up (Daily)
          </motion.h3>

          <div className="grid md:grid-cols-3 gap-4">
            {QUICK_RANK_TIPS.map((t, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className="bg-neutral-800/40 border border-neutral-700 rounded-lg p-4"
              >
                <div className="text-3xl mb-2">{t.icon}</div>
                <div className="font-semibold">{t.action}</div>
                <div className="text-yellow-400 font-bold">{t.points}</div>
              </motion.div>
            ))}
          </div>
        </motion.section> */}

        {/* ================= CONTRIBUTION PATHS ================= */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 gap-4 mb-14"
        >
          {CONTRIBUTION_PATHS.map((p, i) => (
            <motion.div
              key={i}
              variants={itemVariants}
              className="bg-neutral-900 border border-neutral-800 rounded-lg p-5"
            >
              <div className="text-2xl mb-2">{p.icon}</div>
              <h3 className="font-semibold mb-1">{p.title}</h3>
              <p className="text-sm text-neutral-400">{p.description}</p>
              {p.fastest && (
                <span className="text-xs text-yellow-400 font-semibold block mt-2">
                  ⚡ Fastest (Daily)
                </span>
              )}
              {p.valuable && (
                <span className="text-xs text-purple-400 font-semibold block mt-2">
                  ✨ Most Valuable (Daily)
                </span>
              )}
            </motion.div>
          ))}
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

          <div className="grid md:grid-cols-2 gap-4">
            {RANK_REWARDS.map((r, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className={`bg-gradient-to-br ${r.color} border border-neutral-700 rounded-lg p-5 hover:border-neutral-600 transition-all`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="text-lg font-bold text-white mb-1">
                      {r.badge}
                    </div>
                    <div className="text-sm text-neutral-300">{r.rank}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-neutral-400 mb-1">Min Points</div>
                    <div className="text-lg font-bold text-cyan-400">{r.points}</div>
                  </div>
                </div>
                <div className="font-semibold text-sm mb-3 text-neutral-200">{r.reward}</div>
                <ul className="text-xs text-neutral-400 space-y-1">
                  {r.perks.map((p, idx) => (
                    <li key={idx}>✓ {p}</li>
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
          <motion.h3 variants={itemVariants} className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Award className="h-5 w-5 text-yellow-400" />
            Fair Play & System Integrity
          </motion.h3>
          <motion.div variants={containerVariants} className="space-y-3 text-sm text-neutral-300">
            <motion.p variants={itemVariants}>✓ Unlimited startups & ideas allowed—only first of each per day earns points</motion.p>
            <motion.p variants={itemVariants}>✓ Ranks are competitive and actively maintained</motion.p>
            <motion.p variants={itemVariants}>✓ Abuse, automation, or farming may result in rank loss</motion.p>
            <motion.p variants={itemVariants}>✓ Prestige status must be maintained through ongoing participation</motion.p>
          </motion.div>
        </motion.section>

        {/* ================= FINAL CTA ================= */}
        {/* <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
        >
          <Link to="/contribution" className="flex-1">
            <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-700">
              Start Contributing <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </Link>
          <Link to="/refer" className="flex-1">
            <Button size="lg" variant="outline" className="w-full text-black">
              View Rankings <TrendingUp className="h-5 w-5 ml-2" />
            </Button>
          </Link>
        </motion.div> */}

        {user?.role === "admin" && (
          <div className="mb-12">
            <Link to="/admin">
              <Button className="w-full bg-blue-600/80 hover:bg-blue-700">
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
