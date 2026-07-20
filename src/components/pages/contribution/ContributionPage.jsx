import { Link } from "react-router-dom";
import {
  Lightbulb,
  Users,
  Vote,
  Rocket,
  ArrowRight,
  Lock,
  Gift,
  Zap,
  CheckCircle,
  TrendingUp,
  Heart,
} from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import FeedbackPopup from "@/components/sections/SidebarFeedbackCard";

/* ================= DATA ================= */

const contributionActions = [
  
  {
  title: "Crowdfunding Access",
  description:
    "Skip the hustle, secure your access. Help us grow by investing in a cheaper future workspace for you and your fellow founders and builders. Shape SFCollab's future.",
  points: "Early access plus bonuses",
  important: true,
  pointsDetail: "Priority ranking and bonus points",
  icon: Rocket,
  cta: "Contribute Now",
  to: "/crowdfunding",
  tone: "locked",
  available: true,
  verified: false,
  repeatable: false,
  impact: "Provides a significant boost to your ranking",
},
  {
    title: "Submit an Idea",
    description:
      "Propose innovative product ideas, features, or enhancements that will shape the future of SFCollab.",
    points: "10-50 points",
    pointsDetail: "Based on impact and feasibility",
    icon: Lightbulb,
    cta: "Submit Your Idea",
    to: "/contribution-ideas",
    tone: "primary",
    available: true,
    contribution: true,
    verified: true,
    repeatable: true,
    impact: "Affects your ranking",
  },
  {
    title: "Refer Friends",
    description:
      "Invite fellow builders or founders. Earn points for every verified referral you make.",
    points: "5 points per referral",
    bonus: "+25 points for every 5 successful referrals",
    pointsDetail: "Only verified signups count",
    icon: Users,
    cta: "Get Your Referral Link",
    to: "/refer",
    tone: "neutral",
    available: true,
    verified: true,
    repeatable: true,
    impact: "Affects your ranking",
  },
  {
    title: "Vote in Polls",
    description:
      "Influence product decisions by participating in community polls.",
    points: "1–10 points per vote",
    pointsDetail: "Recurring engagement reward",
    icon: Vote,
    cta: "View Community Polls",
    to: "/contribution-polls",
    tone: "neutral",
    contribution: true,
    available: true,
    verified: true,
    repeatable: true,
    impact: "Affects your ranking immediately",
  },
  {
    title: "Register Your Startup",
    description:
      "Create a profile for your startup and join the vibrant SFCollab community.",
    points: "15 points per startup",
    pointsDetail: "Points awarded for one startup registration per day",
    icon: Rocket,
    cta: "Register or join a Startup",
    to: "/register-startup",
    tone: "primary",
    available: true,
    verified: true,
    repeatable: false,
    impact: "Affects ranking",
  },
  {
    title: "Idea Incubator",
    description:
      "Develop and refine ideas daily with community feedback and guidance.",
    points: "10 points / day",
    pointsDetail: "Points awarded for one idea submission per day",
    icon: Lightbulb,
    cta: "Access Incubator",
    to: "/ideation",
    tone: "primary",
    contribution: true,
    available: true,
    verified: true,
    repeatable: true,
    impact: "Affects your ranking",
  },
  {
    title: "Report Bugs & Feedback",
    description:
      "Help improve SFCollab by reporting bugs and sharing constructive feedback, click on the button on the lower-left part of the screen.",
    points: "10-50 points",
    pointsDetail: "Based on severity & quality",
    icon: Zap,
    cta: "Submit Report",
    to: null,
    tone: "neutral",
    available: true,
    verified: true,
    contribution: true,
    repeatable: true,
    impact: "Affects ranking",
  },
  
];

const pointRanges = [
  { action: "Submit Ideas", range: "10–50 pts", detail: "Based on quality & impact" },
  { action: "Bug Reports & Testing", range: "10-30 pts", detail: "Verified issues only" },
  { action: "Polls & Engagement", range: "1–10 pts", detail: "Per vote or submission" },
  { action: "Referrals", range: "5 pts each", detail: "Verified signups only" },
  { action: "Referral Bonus", range: "+25 pts", detail: "Every 5 successful referrals" },
  { action: "Documentation & Guides", range: "10–50 pts", detail: "Community-approved content" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

/* ================= PAGE ================= */

export default function ContributionPage() {
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(localStorage.getItem("feedbackOpenedFromContributionPage") === "true");
  useEffect(() => {
    if (isFeedbackOpen) {
      localStorage.removeItem("feedbackOpenedFromContributionPage");  
    }
  }, [isFeedbackOpen]);
  
  return (
    <>
    <FeedbackPopup open={isFeedbackOpen} onOpenChange={setIsFeedbackOpen} trigger="none" />
    <div className="min-h-screen bg-gradient-to-b from-neutral-950 via-purple-950/20 to-neutral-950 px-2 md:px-6 py-10 text-white">
      <div className="max-w-7xl mx-auto space-y-12">

        {/* ================= HEADER ================= */}
        <motion.section
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div>
            <h1 className="text-5xl font-bold mb-3">
              Earn Points. Unlock Access.
            </h1>
            <p className="text-lg text-gray-400 max-w-3xl">
              Your contributions shape SFCollab's future. Earn points through ideas, feedback, testing, and community engagement. Contributions matter more than referrals—quality always wins.
            </p>
          </div>
        </motion.section>
      {/* ================= ACTIONS ================= */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="space-y-6"
        >
          <motion.h2 variants={itemVariants} className="text-2xl font-bold">
            Ways to Contribute
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {contributionActions.map((action, idx) => (
              <>
                {
                  action.title !== "Report Bugs & Feedback" ?
                    <Link
                      to={action.to || "#"} key={idx} className={`w-full ${action.important ? 'md:col-span-2' : ''}`}>
                      <ActionCard action={action} />
                      </Link>
                      :
                      <div
                        onClick={() => {
                          setIsFeedbackOpen(true);
                        }}
                      >
                      <ActionCard
                          key={idx} action={action} />
                      </div>
                  }
                </>
            ))}
          </div>
          <motion.div
  variants={itemVariants}
  className="rounded-xl border border-blue-400/40 bg-gradient-to-br from-blue-500/15 to-purple-500/10 p-5 text-sm text-blue-200"
>
  <p className="font-semibold text-white mb-2">Important Contribution Rules</p>
  <ul className="space-y-1 text-blue-200/90">
    <li>• You can contribute without limits across SFCollab.</li>
    <li>• To keep rankings fair, points are capped per contribution type per day.</li>
    <li>
      • Until February/March launch, you may create multiple startups, ideas, and
      submissions freely — only the <b>first verified action per day</b> grants points.
    </li>
  </ul>
</motion.div>

        </motion.section>
          
        {/* ================= POINTS OVERVIEW ================= */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-600/10 to-purple-900/10 backdrop-blur p-8 space-y-6"
        >
          <motion.h2 variants={itemVariants} className="text-2xl font-bold flex items-center gap-3">
            <Zap className="h-6 w-6 text-yellow-400" />
            How Points Work
          </motion.h2>

          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-neutral-900/50 border border-neutral-700 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-2">🎯 Points Determine</p>
              <p className="font-semibold text-white">Your Rank</p>
              <p className="text-xs text-gray-500 mt-2">Higher points = higher position on leaderboard</p>
            </div>
            <div className="bg-neutral-900/50 border border-neutral-700 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-2">🔓 Rank Determines</p>
              <p className="font-semibold text-white">Access & Rewards</p>
              <p className="text-xs text-gray-500 mt-2">Top ranks get lifetime discounts & early access</p>
            </div>
            <div className="bg-neutral-900/50 border border-neutral-700 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-2">⭐ Contributions</p>
              <p className="font-semibold text-white">&gt; Referrals</p>
              <p className="text-xs text-gray-500 mt-2">Quality feedback beats quantity every time</p>
            </div>
          </motion.div>

          
        </motion.section>

        
        {/* ================= WHY CONTRIBUTIONS MATTER ================= */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="rounded-2xl border border-red-500/30 bg-gradient-to-br from-red-600/10 to-red-900/10 backdrop-blur p-8 space-y-6"
        >
          <motion.h2 variants={itemVariants} className="text-2xl font-bold flex items-center gap-3">
            <Heart className="h-6 w-6 text-red-400" />
            Why Contributions Matter More Than Referrals
          </motion.h2>

          <motion.div
            variants={containerVariants}
            className="space-y-4"
          >
            <motion.div variants={itemVariants} className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/20 border border-red-500/50">
                  <CheckCircle className="h-6 w-6 text-red-400" />
                </div>
              </div>
              <div>
                <p className="font-semibold text-white mb-1">Builders Shape the Product</p>
                <p className="text-sm text-gray-400">
                  Your feedback, ideas, and testing directly influence feature prioritization and product direction. You're not just a user—you're a co-builder.
                </p>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/20 border border-red-500/50">
                  <CheckCircle className="h-6 w-6 text-red-400" />
                </div>
              </div>
              <div>
                <p className="font-semibold text-white mb-1">Quality Feedback Prevents Bad Launches</p>
                <p className="text-sm text-gray-400">
                  Early testing and bug reports catch critical issues before they reach users. This protects both quality and reputation.
                </p>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/20 border border-red-500/50">
                  <CheckCircle className="h-6 w-6 text-red-400" />
                </div>
              </div>
              <div>
                <p className="font-semibold text-white mb-1">Quality Users Deserve Priority Access</p>
                <p className="text-sm text-gray-400">
                  Contributors, testers, and engaged members move up the queue. We launch with people who care, not just with early signups.
                </p>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/20 border border-red-500/50">
                  <CheckCircle className="h-6 w-6 text-red-400" />
                </div>
              </div>
              <div>
                <p className="font-semibold text-white mb-1">Referrals Are Optional, Not Required</p>
                <p className="text-sm text-gray-400">
                  Introverts, solo builders, and independent thinkers can earn top ranks purely through quality contributions. No pressure to be a salesperson.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </motion.section>


        {/* ================= FINAL CTAs ================= */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link to="/waitlist" className="w-full">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full px-6 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Lightbulb className="h-5 w-5" />
                Go to Waitlist Details
              </motion.button>
            </Link>
            <Link to="/refer" className="w-full">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full px-6 py-4 rounded-xl border-2 border-purple-500/50 text-white font-semibold hover:bg-purple-500/10 transition-all flex items-center justify-center gap-2"
              >
                <Users className="h-5 w-5" />
                View Rankings
              </motion.button>
            </Link>
          </div>
        </motion.section>
      </div>
    </div>
    </>
  );
}

/* ================= COMPONENTS ================= */

function ActionCard({ action }) {
  const Icon = action.icon;

  const toneStyles = {
    primary: `
      relative
      border border-amber-400/60
      bg-gradient-to-br from-amber-500/50 via-amber-500/40 to-transparent
      backdrop-blur-md
      shadow-[0_0_40px_-10px_rgba(251,191,36,0.35)]
      hover:border-amber-400/60
      hover:shadow-[0_0_55px_-10px_rgba(251,191,36,0.55)]
      transition-all duration-300
    `,
    neutral: `
      relative
      border border-indigo-400/30
      bg-gradient-to-br from-indigo-500/60 via-purple-600/20 to-transparent
      backdrop-blur-md
      shadow-[0_0_40px_-10px_rgba(99,102,241,0.35)]
      hover:border-indigo-400/60
      hover:shadow-[0_0_55px_-10px_rgba(99,102,241,0.55)]
      transition-all duration-300
    `,
    locked: `
      relative
      border border-white/10
      bg-white/5
      backdrop-blur-sm
      opacity-60
      cursor-not-allowed
    `,
    contribution: `
      relative
      border border-emerald-400/60
      bg-gradient-to-br from-emerald-500/40 via-emerald-400/20 to-transparent
      backdrop-blur-md
      shadow-[0_0_40px_-10px_rgba(52,211,153,0.45)]
      hover:border-emerald-400
      hover:shadow-[0_0_55px_-10px_rgba(52,211,153,0.65)]
      transition-all duration-300
    `
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`
        rounded-2xl
        border
        p-6
        transition-all
        ${action.important
          ? `
            col-span-2
            bg-blue-600/60
            hover:bg-blue-500
            border-blue-400/40
            text-white
            shadow-[0_0_40px_-10px_rgba(59,130,246,0.55)]
            hover:shadow-[0_0_55px_-10px_rgba(59,130,246,0.75)]
          `
          : toneStyles[action.tone]
        }
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4 text-white">
        <div className="flex items-center gap-3 flex-1">
          <div className="p-3 rounded-xl bg-black/40 border border-neutral-700">
            {Icon && <Icon className="h-5 w-5 text-purple-300" />}
          </div>
          <h3 className="text-lg font-semibold">
            {action.title}
          </h3>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-white mb-5">
        {action.description}
      </p>

      {/* Points Box */}
      <div className="mb-5 space-y-3 bg-neutral-800/30 rounded-lg p-3 border border-neutral-700/50">
        <div className="flex items-center justify-between">
          <p className="text-sm text-white">Points</p>
          <p className="text-white font-semibold">
            {action.points}
          </p>
        </div>

        {action.bonus && (
          <div className="flex items-center justify-between">
            <p className="text-xs text-white">Bonus</p>
            <p className="text-emerald-400 text-xs font-semibold">
              {action.bonus}
            </p>
          </div>
        )}

        <div className="pt-2 border-t border-neutral-700/50 space-y-1 text-xs text-white">
          {action.verified && <p>✓ Verified by team</p>}
          {action.pointsDetail && <p>✓ {action.pointsDetail}</p>}
          {action.impact && <p>✓ {action.impact}</p>}
        </div>
      </div>

      {/* CTA */}
      {action.to !== null && (
        <div className="mt-6">
          {action.available ? (
            <Link
              to={action.to}
              className="inline-flex items-center gap-2 text-sm font-medium text-purple-300 hover:text-purple-200 transition-colors"
            >
              {action.cta}
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <div className="inline-flex items-center gap-2 text-sm text-gray-400">
              <Lock className="h-4 w-4" />
              Coming Soon
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
function StatusCard({ label, value }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-neutral-700 bg-neutral-900/50 backdrop-blur px-6 py-4 min-w-[160px]"
    >
      <p className="text-xs uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <p className="text-2xl font-bold mt-2 text-purple-400">{value}</p>
    </motion.div>
  );
}
