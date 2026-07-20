import React, { useState, useEffect } from "react";
import { waitlistAPI } from "@/utils/APIs/waitlistAPI";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { Copy, Trophy, TrendingUp, Users, Zap, Target, Share2, Award, Heart, Sparkles, Mail, AlertCircle, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import ReferralTutorial from "./referralTutorial";

const card = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const RANK_REWARDS = [
  {
    rank: "Top 1",
    maxPosition: 1,
    badge: "🌠 Stardust Overlord",
    points: 600,
    reward: "Lifetime full access + 0% builder fees",
    color: "from-yellow-400 to-orange-500",
  },
  {
    rank: "Top 10",
    maxPosition: 10,
    badge: "🔑 Void Keymaster",
    points: 350,
    reward: "Lifetime Founder Pro + 0% builder fees",
    color: "from-purple-500 to-indigo-500",
  },
  {
    rank: "Top 50",
    maxPosition: 50,
    badge: "☀ Solar Warlord",
    points: 250,
    reward: "18 months Founder Pro + 0% builder fees",
    color: "from-orange-400 to-yellow-500",
  },
  {
    rank: "Top 150",
    maxPosition: 150,
    badge: "🌙 Lunar Dominator",
    points: 150,
    reward: "6 months Founder Pro + 2% builder fees",
    color: "from-blue-400 to-purple-500",
  },
  {
    rank: "Top 1,000",
    maxPosition: 1000,
    badge: "🛠 Nebula Forgelord",
    points: 75,
    reward: "6 months Founder Starter + 5% builder fees",
    color: "from-slate-400 to-slate-600",
  },
  {
    rank: "Top 10,000",
    maxPosition: 10000,
    badge: "✦ Astral Vanguard",
    points: 25,
    reward: "1 month Founder Starter + 5% builder fees",
    color: "from-neutral-400 to-neutral-600",
  },
];

const RANK_DISCOUNTS = [
  { rank: "Top 1–500", discount: "25% lifetime" },
  { rank: "501–1000", discount: "20% lifetime" },
  { rank: "1001–1500", discount: "15% lifetime" },
  { rank: "1501–2000", discount: "10% lifetime" },
  { rank: "2001–2500", discount: "5% lifetime" },
];

const CONTRIBUTION_SYSTEM = [
  {
    type: "Crowdfunding & Investment",
    examples: [
      "Invest in SFCollab's crowdfunding round",
      "Secure early access with priority ranking",
      "Help shape SFCollab's future",
      "Unlock bonus points and benefits",
      "Support fellow founders and builders",
      "Get cheaper future workspace access",
    ],
  },
  {
    type: "Ideas & Innovation",
    examples: [
      "Submit innovative product ideas",
      "Propose new features or enhancements",
      "Daily idea incubator submissions",
      "Refine ideas with community feedback",
      "Suggest workflow optimizations",
      "Contribute strategic insights",
    ],
  },
  {
    type: "Community Engagement",
    examples: [
      "Refer friends and fellow builders",
      "Vote in community polls",
      "Participate in product decisions",
      "Influence feature prioritization",
      "Share your perspective",
      "Build the SFCollab community",
    ],
  },
  {
    type: "Startup Registration",
    examples: [
      "Create your startup profile",
      "Join the vibrant community",
      "Showcase your startup",
      "Participate in SF Idea Incubator",
    ],
  },
  {
    type: "Quality Assurance & Feedback",
    examples: [
      "Report bugs with detailed steps",
      "Share constructive feedback",
      "Test features thoroughly",
      "Identify edge cases",
      "Report security vulnerabilities",
      "Suggest performance improvements",
    ],
  },
  {
    type: "Continuous Contribution",
    examples: [
      "Daily idea submissions",
      "Regular community polls participation",
      "Ongoing feedback and suggestions",
      "Consistent bug reporting",
      "Active community engagement",
      "Sustained impact over time",
    ],
  },
];

const ReferPage = () => {
  const [isOnWaitlist, setIsOnWaitlist] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user, access_token } = useSelector((state) => state.auth);

  const [userRankInfo, setUserRankInfo] = useState({
    position: 0,
    points: { total: 0, referral: 0, contribution: 0, activity: 0 },
  });
  const [referralLink] = useState(
    `${window.location.origin}/signup?ref=${user?.id || ""}`
  );
  const [leaderboard, setLeaderboard] = useState([]);
  const [mvpDeadline] = useState(new Date("2026-01-20"));

  // Fetch waitlist status
  useEffect(() => {
    const checkWaitlistStatus = async () => {
      try {
        const response = await waitlistAPI.isOnWaitlist(user?.email);
        setIsOnWaitlist(response.on_waitlist);
      } catch (error) {
        console.error("Error checking waitlist status:", error);
        setIsOnWaitlist(false);
      }
    };

    if (user?.email) {
      checkWaitlistStatus();
    }
  }, [user?.email]);

  // Fetch leaderboard
  useEffect(() => {
    const fetchLeaderboard = async () => {
      if (!user?.id) return;
      try {
        const data = await waitlistAPI.getLeaderboard(50);
        const dataWithYouFlag = data.map((userEntry) => ({
          ...userEntry,
          isYou: userEntry.id === user.id,
        }));
        setLeaderboard(dataWithYouFlag);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      }
    };

    fetchLeaderboard();
  }, [user?.id]);

  // Fetch user ranking
  useEffect(() => {
    const fetchUserRank = async () => {
      if (!user?.id || !access_token) return;
      try {
        setLoading(true);
        const rankInfo = await waitlistAPI.getMyRanking(user.id, access_token);
        setUserRankInfo(rankInfo);
      } catch (error) {
        console.error("Error fetching user rank:", error);
      } finally {
        setLoading(false);
      }
    };

    if (isOnWaitlist) {
      fetchUserRank();
    }
  }, [user?.id, access_token, isOnWaitlist]);

  const daysRemaining = Math.max(
    0,
    Math.ceil((mvpDeadline - new Date()) / (1000 * 60 * 60 * 24))
  );

  // Not on waitlist - show redirect prompt
  if (!isOnWaitlist) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white md:px-4">
        {/* Animated Background */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />
          <div className="absolute top-1/4 left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/3 -right-10 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" style={{ animationDelay: '2s' }} />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full relative"
        >
          <div className="bg-slate-900/90 backdrop-blur border border-white/10 rounded-2xl p-8 text-center shadow-xl">
            <div className="mb-4 flex justify-center">
              <div className="p-3 bg-yellow-500/20 rounded-full">
                <Trophy className="h-12 w-12 text-yellow-400" />
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-3 text-white">Join the Competition</h2>
            <p className="text-gray-400 text-sm mb-6">
              You need to join the waitlist first to see rankings and compete for exclusive rewards.
            </p>
            <Link to="/waitlist" className="w-full block">
              <button className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300 hover:scale-105">
                Join Waitlist Now
              </button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="rounded-full h-12 w-12 border-3 border-blue-500/20 border-t-blue-500"
        />
      </div>
    );
  }

  const currentTier = RANK_REWARDS.find(
    (tier) => userRankInfo.position > 0 && userRankInfo.position <= tier.maxPosition
  );

  return (
    <div className="min-h-screen bg-black text-white px-2 md:px-4 py-8">
      {/* Animated Background */}
      <ReferralTutorial />
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />
        <div className="absolute top-1/4 left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-10 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" style={{ animationDelay: '2s' }} />
      </div>

      <div className="w-full mx-auto max-w-7xl space-y-8 relative">
        {/* HEADER SECTION */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Zap className="h-6 w-6 text-yellow-400" />
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Ranking & Competition
            </h1>
            <Zap className="h-6 w-6 text-yellow-400" />
          </div>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Climb the ranks to earn exclusive rewards!
          </p>
        </motion.div>

        {/* STATS CARDS */}
        <motion.div
          className="stats grid grid-cols-1 md:grid-cols-3 gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Rank Card */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -4, scale: 1.02 }}
            className="group relative overflow-hidden rounded-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative bg-slate-900/90 backdrop-blur border border-white/10 group-hover:border-blue-500/50 rounded-2xl p-6 space-y-3 transition-all">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Trophy className="w-5 h-5 text-blue-400" />
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">
                  Your Rank
                </p>
                <p className="text-5xl font-bold text-blue-400 mt-2">
                  #{userRankInfo.position}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  out of {leaderboard.length} competitors
                </p>
              </div>
            </div>
          </motion.div>

          {/* Points Card */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -4, scale: 1.02 }}
            className="group relative overflow-hidden rounded-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative bg-slate-900/90 backdrop-blur border border-white/10 group-hover:border-purple-500/50 rounded-2xl p-6 space-y-3 transition-all">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-purple-400" />
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">
                  Total Points
                </p>
                <p className="text-5xl font-bold text-purple-400 mt-2">
                  {userRankInfo.points.total}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  {leaderboard[0]?.points?.total
                    ? `${userRankInfo.points.total} of ${leaderboard[0].points.total} (leader)`
                    : "accumulating"}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Referral Card */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -4, scale: 1.02 }}
            className="group relative overflow-hidden rounded-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative bg-slate-900/90 backdrop-blur border border-white/10 group-hover:border-green-500/50 rounded-2xl p-6 space-y-3 transition-all">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <Users className="w-5 h-5 text-green-400" />
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">
                  Share & Earn
                </p>
                <p className="text-3xl font-bold text-green-400 mt-2">
                  {userRankInfo.points.referral}
                </p>
                <p className="text-xs text-gray-500 mt-2">Referral Points</p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* REFERRAL BUTTONS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="share grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              navigator.clipboard.writeText(referralLink);
              toast.success("Referral link copied! 🎉");
            }}
            className="px-6 py-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30 border border-green-500/50 hover:border-green-500/70 rounded-xl text-green-300 font-semibold transition-all duration-300 flex items-center justify-center gap-2"
          >
            <Copy className="h-5 w-5" />
            Copy Referral Link
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: "Join SFCollab Waitlist",
                  text: "Join me on the SFCollab waitlist!",
                  url: referralLink,
                });
              } else {
                navigator.clipboard.writeText(referralLink);
                toast.info("Link copied to clipboard!");
              }
            }}
            className="px-6 py-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 hover:from-blue-500/30 hover:to-purple-500/30 border border-blue-500/50 hover:border-blue-500/70 rounded-xl text-blue-300 font-semibold transition-all duration-300 flex items-center justify-center gap-2"
          >
            <Share2 className="h-5 w-5" />
            Share Referral
          </motion.button>
        </motion.div>

        {/* POINTS BREAKDOWN */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-slate-900/90 to-slate-900/50 border border-white/10 backdrop-blur rounded-2xl p-8"
        >
          <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Target className="h-6 w-6 text-orange-400" />
            Points Breakdown
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                label: "Referrals",
                value: userRankInfo.points.referral,
                color: "from-green-500 to-green-600",
                icon: Users,
              },
              {
                label: "Contributions",
                value: userRankInfo.points.contribution,
                color: "from-blue-500 to-blue-600",
                icon: Zap,
              },
              {
                label: "Activity",
                value: userRankInfo.points.activity,
                color: "from-purple-500 to-purple-600",
                icon: TrendingUp,
              },
            ].map(({ label, value, color, icon: Icon }, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="bg-slate-900/90 border border-white/10 rounded-xl p-4 hover:border-white/20 transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <Icon className="h-5 w-5 text-gray-400" />
                  <p className="text-gray-400 text-xs font-medium">{label}</p>
                </div>
                <p className={`text-3xl font-bold bg-gradient-to-r ${color} bg-clip-text text-transparent`}>
                  {value}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* LEADERBOARD */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="ranking bg-gradient-to-br from-slate-900/90 to-slate-900/50 border border-white/10 backdrop-blur rounded-2xl p-8"
        >
          <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-400" />
            Top 50 Contributors
          </h3>

          {currentTier && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-gray-400 mb-6"
            >
              Your current tier:{" "}
              <span className="font-semibold text-blue-400">
                {currentTier.badge} {currentTier.rank}
              </span>
            </motion.p>
          )}

          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {leaderboard.slice(0, 50).map((leaderUser, idx) => {
              const tier = RANK_REWARDS.find(
                (t) => leaderUser.position <= t.maxPosition
              );

              return (
                <motion.div
                  key={leaderUser.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.02 }}
                  whileHover={{ x: 4 }}
                  className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                    leaderUser.isYou
                      ? "bg-blue-500/20 border-blue-500/50"
                      : "bg-slate-900/50 border-white/10 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-10 text-center font-bold text-gray-300">
                      #{leaderUser.position}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-white truncate">
                        {leaderUser.name || leaderUser.email}
                        {leaderUser.isYou && (
                          <span className="ml-2 text-xs bg-blue-500/30 text-blue-300 px-2 py-1 rounded-full">
                            You
                          </span>
                        )}
                      </p>

                      {tier && (
                        <p
                          className={`text-xs bg-gradient-to-r ${tier.color} bg-clip-text text-transparent font-semibold`}
                        >
                          {tier.badge}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-purple-400">
                      {leaderUser.points.total}
                    </p>
                    <p className="text-xs text-gray-500">pts</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* HOW TO EARN POINTS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-gradient-to-br from-slate-900/90 to-slate-900/50 border border-white/10 backdrop-blur rounded-2xl p-8"
        >
          <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Zap className="h-6 w-6 text-yellow-400" />
            How to Earn Points
          </h3>
          <p className="text-gray-400 text-sm mb-6">Multiple ways to climb the ranks. Choose your path:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {[
              { action: "Crowdfunding Access", reward: "Early access + bonuses", highlight: true },
              { action: "Submit Ideas", reward: "10–50 points", highlight: false },
              { action: "Refer Friends", reward: "5 pts + 25 bonus per 5", highlight: false },
              { action: "Vote in Polls", reward: "1–10 points per vote", highlight: false },
              { action: "Register Startup", reward: "15 points/day", highlight: false },
              { action: "Idea Incubator", reward: "10 points/day", highlight: false },
              { action: "Report Bugs & Feedback", reward: "10–50 points", highlight: false },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className={`rounded-lg p-4 border transition-all ${
                  item.highlight
                    ? "bg-green-500/10 border-green-500/50 md:col-span-2"
                    : "bg-slate-900/50 border-white/10 hover:border-white/20"
                }`}
              >
                <p className="font-semibold text-white text-sm">{item.action}</p>
                <p
                  className={`text-xs mt-1 ${
                    item.highlight ? "text-green-300" : "text-gray-400"
                  }`}
                >
                  {item.reward}
                </p>
              </motion.div>
            ))}
          </div>
          <Link to="/contribution" className="w-full">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-blue-500 text-white font-semibold hover:shadow-lg hover:shadow-green-500/20 transition-all duration-300"
            >
              Go to Contribution Page
            </motion.button>
          </Link>
        </motion.div>

        {/* CONTRIBUTION SYSTEM */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.37 }}
          className="bg-gradient-to-br from-slate-900/90 to-slate-900/50 border border-white/10 backdrop-blur rounded-2xl p-8"
        >
          <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-blue-400" />
            Contribution Points System
          </h3>
          <p className="text-gray-400 text-sm mb-6">
            Contributions are the most valuable path. They reward builders and serious users.
          </p>
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            {CONTRIBUTION_SYSTEM.map((contrib, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="bg-slate-900/90 border border-white/10 rounded-lg p-4 hover:border-white/20 transition-all"
              >
                <h4 className="font-semibold text-white text-sm mb-3">
                  {contrib.type}
                </h4>
                <ul className="text-xs text-gray-400 space-y-1.5">
                  {contrib.examples.map((ex, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-blue-400 flex-shrink-0">•</span>
                      <span>{ex}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <p className="text-sm text-blue-300">
              <strong>Why contributions matter:</strong> Feedback, bug reports, testing, documentation, and community support shape SF's future.
            </p>
          </div>
        </motion.div>

        {/* RANK REWARDS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.42 }}
          className="space-y-4"
        >
          <h2 className="text-3xl font-bold flex items-center gap-3 mb-6">
            <Award className="h-8 w-8 text-yellow-400" />
            Rank Rewards & Prestige
          </h2>
          {RANK_REWARDS.map((tier, idx) => {
            const isUserTier = currentTier && currentTier.rank === tier.rank;

            return (
              <motion.div
                key={idx}
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                className={`rounded-xl p-6 border transition-all ${
                  isUserTier
                    ? "border-blue-500/50 bg-blue-500/10"
                    : "border-white/10 bg-slate-900/50 hover:border-white/20"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-2xl mb-2">{tier.badge}</div>
                    <div className="text-xs text-gray-400 mb-2 font-medium">
                      {tier.rank}
                    </div>
                    <div className="font-semibold text-white text-sm">
                      {tier.reward}
                    </div>
                  </div>
                  {isUserTier && (
                    <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold flex-shrink-0">
                      Current
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* ANIMATED PROFILES */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="bg-gradient-to-br from-slate-900/90 to-slate-900/50 border border-white/10 backdrop-blur rounded-2xl p-8"
        >
          <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-pink-400" />
            Animated Profiles & Visual Prestige
          </h3>
          <p className="text-gray-400 text-sm mb-6">
            Top-ranked contributors unlock exclusive animated profile enhancements that visually distinguish them across SFCollab.
          </p>

          <div className="mb-6 bg-slate-900/90 rounded-lg p-4 border border-white/10">
            <p className="text-sm text-gray-300 mb-3 font-semibold">Where Animations Appear:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {["Leaderboards", "Profiles", "Comments & Discussions", "Startup Pages", "Community Interactions"].map((location, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm text-gray-400">
                  <span className="h-1.5 w-1.5 bg-pink-400 rounded-full" />
                  {location}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                title: "Profile Backgrounds",
                desc: "Subtle animated gradients, particles, or energy effects. Some are 1/1 and never reused.",
                icon: "🎨",
              },
              {
                title: "Profile Borders",
                desc: "Animated frames around avatars. Tier-exclusive designs.",
                icon: "⭐",
              },
              {
                title: "Nicknames",
                desc: "Animated display names with glow, shimmer, or pulse effects. Highly visible across the platform.",
                icon: "✨",
              },
              {
                title: "Titles & Sigils",
                desc: "Permanent titles displayed next to your name. Tier-specific crests and insignias.",
                icon: "🏆",
              },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="bg-slate-900/90 border border-white/10 rounded-lg p-4 hover:border-white/20 transition-all"
              >
                <p className="text-2xl mb-2">{item.icon}</p>
                <p className="font-semibold text-white text-sm mb-2">{item.title}</p>
                <p className="text-xs text-gray-400">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-6 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <p className="font-semibold text-blue-300 text-sm mb-3">💎 Cosmetic-Only Customization (Future)</p>
            <p className="text-xs text-blue-200 mb-3">Some non-prestige animated cosmetics may be available separately:</p>
            <ul className="text-xs text-blue-200 space-y-1 mb-3 ml-3">
              <li>✓ Seasonal animated backgrounds</li>
              <li>✓ Themed animated borders</li>
              <li>✓ Supporter-exclusive visual styles</li>
            </ul>
            <div className="bg-slate-900 rounded p-3 border border-blue-500/20">
              <p className="text-xs text-blue-300 font-semibold mb-1">Rules:</p>
              <p className="text-xs text-blue-200">
                ❌ No ranking advantage  |  ❌ No leaderboard impact  |  ❌ No prestige titles
              </p>
              <p className="text-xs text-blue-300 mt-2">
                <strong>Prestige is earned. Style can be customized.</strong>
              </p>
            </div>
          </div>
        </motion.div>

        {/* DISCOUNT TIERS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-br from-slate-900/90 to-slate-900/50 border border-white/10 backdrop-blur rounded-2xl p-8"
        >
          <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-purple-400" />
            Lifetime Discount Tiers
          </h3>
          <p className="text-gray-400 text-sm mb-6">
            Beyond free access, all ranked users receive permanent discounts on SF-developed features.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-6">
            {RANK_DISCOUNTS.map((tier, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                whileHover={{ y: -2 }}
                className="bg-slate-900/90 border border-white/10 rounded-lg p-4 text-center hover:border-white/20 transition-all"
              >
                <p className="text-xs text-gray-400 mb-2">{tier.rank}</p>
                <p className="text-2xl font-bold text-purple-400">{tier.discount}</p>
                <p className="text-xs text-gray-500 mt-2">Lifetime</p>
              </motion.div>
            ))}
          </div>
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
            <p className="text-sm text-purple-300">
              <strong>Note:</strong> Discounts apply only to SF-developed features. API overages and third-party tools follow their own limits.
            </p>
          </div>
        </motion.div>

        {/* SNAPSHOT & LOCKING */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.52 }}
          className="bg-gradient-to-br from-slate-900/90 to-slate-900/50 border border-white/10 backdrop-blur rounded-2xl p-8"
        >
          <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Heart className="h-6 w-6 text-red-400" />
            Snapshot & Rewards Locking
          </h3>
          <div className="space-y-4">
            <div className="bg-slate-900/90 border border-white/10 rounded-lg p-4">
              <p className="font-semibold text-white mb-3">How It Works</p>
              <ol className="text-sm text-gray-300 space-y-2">
                <li className="flex gap-3">
                  <span className="text-blue-400 font-bold flex-shrink-0">1.</span>
                  <span>Snapshot dates are announced in advance</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-400 font-bold flex-shrink-0">2.</span>
                  <span>Your rank at snapshot time determines your rewards</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-400 font-bold flex-shrink-0">3.</span>
                  <span>Rewards are locked and cannot be changed retroactively</span>
                </li>
              </ol>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <p className="text-sm text-blue-300">
                <strong>Why snapshots?</strong> They ensure fairness, prevent disputes, and lock in rewards based on your actual contributions and rank at key moments.
              </p>
            </div>
          </div>
        </motion.div>

        {/* CORE PRINCIPLES */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.54 }}
          className="bg-gradient-to-br from-slate-900/90 to-slate-900/50 border border-white/10 backdrop-blur rounded-2xl p-8"
        >
          <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Heart className="h-6 w-6 text-red-400" />
            Core Principles
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              "Access is earned, not promised",
              "Contributions matter as much as referrals",
              "Early users are co-builders, not customers",
              "Rank snapshots lock rewards fairly",
              "No fake urgency or empty promises",
              "Quality over speed — measure twice, launch once",
            ].map((principle, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="flex items-start gap-3 bg-slate-900/90 border border-white/10 rounded-lg p-4 hover:border-white/20 transition-all"
              >
                <span className="text-green-400 font-bold text-lg mt-0 flex-shrink-0">
                  ✓
                </span>
                <span className="text-gray-300">{principle}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ReferPage;
