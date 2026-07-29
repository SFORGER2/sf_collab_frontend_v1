import React, { useState, useEffect } from "react";

// --- MOCK DATA & CONFIG ---
const INITIAL_REFERRAL_DATA = {
  referralCode: "SF-COLLAB-992X",
  referralLink: "https://sfcollab.network/join?ref=SF-COLLAB-992X",
  totalReferrals: 142,
  successfulSignups: 89,
  activeReferrals: 64,
  totalClicks: 1240,
  conversionRate: "7.17%",
  rewardsEarned: "2,450 Credits",
  commissionEarned: "$1,840.00 USD",
  history: [
    {
      id: "REF-8841",
      user: "Alex Mercer",
      date: "2026-07-28",
      status: "Successful",
      reward: "25 Credits",
      type: "Pro Tier",
    },
    {
      id: "REF-8840",
      user: "Elena Rostova",
      date: "2026-07-27",
      status: "Pending",
      reward: "Pending",
      type: "Free Trial",
    },
    {
      id: "REF-8839",
      user: "Marcus Vance",
      date: "2026-07-25",
      status: "Successful",
      reward: "50 Credits",
      type: "Team Tier",
    },
    {
      id: "REF-8838",
      user: "Sarah Jenkins",
      date: "2026-07-22",
      status: "Successful",
      reward: "25 Credits",
      type: "Pro Tier",
    },
    {
      id: "REF-8837",
      user: "David Kim",
      date: "2026-07-20",
      status: "Expired",
      reward: "0 Credits",
      type: "Free Trial",
    },
    {
      id: "REF-8836",
      user: "Chloe Bennett",
      date: "2026-07-18",
      status: "Successful",
      reward: "100 Credits",
      type: "Enterprise",
    },
    {
      id: "REF-8835",
      user: "Liam O'Connor",
      date: "2026-07-15",
      status: "Successful",
      reward: "25 Credits",
      type: "Pro Tier",
    },
    {
      id: "REF-8834",
      user: "Zoe Saldana",
      date: "2026-07-12",
      status: "Pending",
      reward: "Pending",
      type: "Free Trial",
    },
  ],
};

// --- INLINE SVG ICONS ---
const Icons = {
  Copy: () => (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
      />
    </svg>
  ),
  Check: () => (
    <svg
      className="w-4 h-4 text-emerald-400"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 13l4 4L19 7"
      />
    </svg>
  ),
  Share: () => (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
      />
    </svg>
  ),
  Refresh: ({ spinning }) => (
    <svg
      className={`w-4 h-4 ${spinning ? "animate-spin" : ""}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
      />
    </svg>
  ),
  Users: () => (
    <svg
      className="w-5 h-5 text-purple-400"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
      />
    </svg>
  ),
  CursorClick: () => (
    <svg
      className="w-5 h-5 text-cyan-400"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
      />
    </svg>
  ),
  Award: () => (
    <svg
      className="w-5 h-5 text-emerald-400"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  TrendUp: () => (
    <svg
      className="w-5 h-5 text-pink-500"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
      />
    </svg>
  ),
  Sparkles: () => (
    <svg
      className="w-5 h-5 text-amber-400 animate-pulse"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
      />
    </svg>
  ),
  AlertCircle: () => (
    <svg
      className="w-12 h-12 text-rose-500 mb-3"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  EmptyBox: () => (
    <svg
      className="w-16 h-16 text-slate-600 mb-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
      />
    </svg>
  ),
};

export default function ReferralSystem() {
  // --- STATE MANAGEMENT ---
  const [role, setRole] = useState("Influencer"); // 'Regular' | 'Influencer'
  const [dataState, setDataState] = useState("Populated"); // 'Populated' | 'Loading' | 'Error' | 'Empty'
  const [data, setData] = useState(INITIAL_REFERRAL_DATA);

  // UI Interactive States
  const [copied, setCopied] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [activeShareModal, setActiveShareModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [toastMessage, setToastMessage] = useState(null);

  const itemsPerPage = 5;

  // Simulate loading or error transitions
  useEffect(() => {
    if (dataState === "Loading") {
      const timer = setTimeout(() => setDataState("Populated"), 2000);
      return () => clearTimeout(timer);
    }
  }, [dataState]);

  // Handle Toast Notifications
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Copy Referral Link Action
  const handleCopy = () => {
    navigator.clipboard.writeText(data.referralLink);
    setCopied(true);
    showToast("Referral link copied to clipboard!");
    setTimeout(() => setCopied(false), 2500);
  };

  // Regenerate Link Action
  const handleRegenerate = () => {
    setIsRegenerating(true);
    setTimeout(() => {
      const randomCode =
        "SF-" +
        Math.random().toString(36).substring(2, 6).toUpperCase() +
        "-" +
        Math.floor(100 + Math.random() * 900);
      setData((prev) => ({
        ...prev,
        referralCode: randomCode,
        referralLink: `https://sfcollab.network/join?ref=${randomCode}`,
      }));
      setIsRegenerating(false);
      showToast("New referral link and code generated successfully.");
    }, 800);
  };

  // Share Link via Socials
  const handleSocialShare = (platform) => {
    const encodedUrl = encodeURIComponent(data.referralLink);
    const encodedText = encodeURIComponent(
      "Join me on SFCollab Network! Build and scale your next architecture with encrypted deep-space telemetry.",
    );

    let shareUrl = "";
    switch (platform) {
      case "WhatsApp":
        shareUrl = `https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`;
        break;
      case "Twitter":
        shareUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`;
        break;
      case "LinkedIn":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      case "Facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case "Telegram":
        shareUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;
        break;
      default:
        handleCopy();
        return;
    }
    window.open(shareUrl, "_blank", "noopener,noreferrer");
    showToast(`Opening ${platform} share window...`);
  };

  // --- RENDER HELPERS ---
  const paginatedHistory = data.history.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );
  const totalPages = Math.ceil(
    (dataState === "Empty" ? 0 : data.history.length) / itemsPerPage,
  );

  return (
    <div className="min-h-screen bg-[#090A10] text-slate-200 font-sans pb-16">
      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[#131524] border border-purple-500/50 text-white px-5 py-3 rounded-xl shadow-[0_0_30px_rgba(139,92,246,0.25)] animate-bounce">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* TOP NAVBAR / DEMO CONTROLS */}
      <header className="border-b border-slate-800/80 bg-[#0E101A]/90 backdrop-blur sticky top-0 z-40 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-cyan-500 flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(139,92,246,0.4)]">
            SF
          </div>
          <span className="font-bold tracking-wider text-white text-lg">
            SFCollab{" "}
            <span className="text-xs text-purple-400 font-mono ml-1 px-1.5 py-0.5 bg-purple-950/60 border border-purple-800/50 rounded">
              CORE V1.0
            </span>
          </span>
        </div>

        {/* TESTING CONTROL BAR */}
        <div className="flex items-center gap-4 bg-[#141726] border border-slate-700/60 px-4 py-1.5 rounded-full text-xs">
          <span className="text-slate-400 font-mono">DEMO CONTROLS:</span>

          <div className="flex items-center gap-1 border-r border-slate-700 pr-3">
            <span className="text-slate-400">Role:</span>
            <button
              onClick={() => setRole("Regular")}
              className={`px-2 py-0.5 rounded transition ${role === "Regular" ? "bg-purple-600 text-white font-medium" : "text-slate-400 hover:text-white"}`}
            >
              Regular
            </button>
            <button
              onClick={() => setRole("Influencer")}
              className={`px-2 py-0.5 rounded transition ${role === "Influencer" ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium shadow-[0_0_10px_rgba(236,72,153,0.3)]" : "text-slate-400 hover:text-white"}`}
            >
              Influencer
            </button>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-slate-400">State:</span>
            {["Populated", "Loading", "Empty", "Error"].map((st) => (
              <button
                key={st}
                onClick={() => setDataState(st)}
                className={`px-2 py-0.5 rounded transition ${dataState === st ? "bg-cyan-600 text-white font-medium" : "text-slate-400 hover:text-white"}`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* PAGE HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono tracking-widest uppercase mb-1">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              Universal Network Protocol
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Referral Ecosystem & Growth
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Manage telemetry invitations, track conversion analytics, and
              claim network distribution rewards.
            </p>
          </div>

          {/* QUICK SHARE BUTTON */}
          <button
            onClick={() => setActiveShareModal(!activeShareModal)}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium px-5 py-2.5 rounded-xl shadow-[0_0_20px_rgba(139,92,246,0.3)] transition transform active:scale-95"
          >
            <Icons.Share />
            <span>Quick Share Link</span>
          </button>
        </div>

        {/* ERROR STATE */}
        {dataState === "Error" && (
          <div className="bg-[#141726]/80 border border-rose-500/30 rounded-2xl p-12 text-center my-12 backdrop-blur max-w-xl mx-auto shadow-[0_0_40px_rgba(244,63,94,0.1)]">
            <div className="flex justify-center">
              <Icons.AlertCircle />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              Telemetry Desynchronization
            </h3>
            <p className="text-slate-400 text-sm mb-6">
              We were unable to fetch your referral metrics from the Deep Space
              Node. Please verify your connection or re-authenticate your
              session.
            </p>
            <button
              onClick={() => setDataState("Loading")}
              className="bg-rose-600 hover:bg-rose-500 text-white font-medium px-6 py-2.5 rounded-xl transition shadow-lg shadow-rose-600/30"
            >
              Retry Sync
            </button>
          </div>
        )}

        {/* LOADING STATE (SKELETONS) */}
        {dataState === "Loading" && (
          <div className="space-y-6 animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-32 bg-[#141726] rounded-2xl border border-slate-800"
                />
              ))}
            </div>
            <div className="h-48 bg-[#141726] rounded-2xl border border-slate-800" />
            <div className="h-96 bg-[#141726] rounded-2xl border border-slate-800" />
          </div>
        )}

        {/* POPULATED OR EMPTY STATE */}
        {(dataState === "Populated" || dataState === "Empty") && (
          <>
            {/* INFLUENCER ENHANCED PANEL (CONDITIONAL) */}
            {role === "Influencer" && (
              <div className="relative overflow-hidden bg-gradient-to-r from-[#17132A] via-[#141726] to-[#0E1B2E] border border-purple-500/40 rounded-2xl p-6 md:p-8 mb-8 shadow-[0_0_35px_rgba(139,92,246,0.15)]">
                {/* Background Glows */}
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6 pb-6 border-b border-slate-700/60">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-xl text-white shadow-lg shadow-purple-500/30">
                      <Icons.Sparkles />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-bold text-white tracking-wide">
                          Influencer Growth Portal
                        </h2>
                        <span className="text-[10px] font-mono uppercase bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-0.5 rounded-full font-bold">
                          VIP TIER
                        </span>
                      </div>
                      <p className="text-slate-400 text-sm mt-0.5">
                        Real-time commission tracking and enhanced conversion
                        telemetry.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 bg-[#0B0D17]/80 border border-slate-700/60 px-4 py-2 rounded-xl font-mono text-sm">
                    <span className="text-slate-400">Status:</span>
                    <span className="text-emerald-400 flex items-center gap-1.5 font-bold">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      ACTIVE PARTNER
                    </span>
                  </div>
                </div>

                {/* Influencer Specific KPI Grid */}
                <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-[#0B0D17]/60 border border-slate-800/80 rounded-xl p-4">
                    <div className="text-xs text-slate-400 uppercase font-mono">
                      Commission Earned
                    </div>
                    <div className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 mt-1 font-mono">
                      {dataState === "Empty"
                        ? "$0.00 USD"
                        : data.commissionEarned}
                    </div>
                    <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1 font-mono">
                      ↑ 14.2%{" "}
                      <span className="text-slate-500">vs last cycle</span>
                    </div>
                  </div>

                  <div className="bg-[#0B0D17]/60 border border-slate-800/80 rounded-xl p-4">
                    <div className="text-xs text-slate-400 uppercase font-mono">
                      Conversion Rate
                    </div>
                    <div className="text-2xl font-extrabold text-white mt-1 font-mono">
                      {dataState === "Empty" ? "0.00%" : data.conversionRate}
                    </div>
                    <div className="text-xs text-purple-400 mt-1 font-mono">
                      Top 5% of network
                    </div>
                  </div>

                  <div className="bg-[#0B0D17]/60 border border-slate-800/80 rounded-xl p-4">
                    <div className="text-xs text-slate-400 uppercase font-mono">
                      Total Link Clicks
                    </div>
                    <div className="text-2xl font-extrabold text-white mt-1 font-mono">
                      {dataState === "Empty"
                        ? "0"
                        : data.totalClicks.toLocaleString()}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      Across 6 platforms
                    </div>
                  </div>

                  <div className="bg-[#0B0D17]/60 border border-slate-800/80 rounded-xl p-4">
                    <div className="text-xs text-slate-400 uppercase font-mono">
                      Active Referrals
                    </div>
                    <div className="text-2xl font-extrabold text-white mt-1 font-mono">
                      {dataState === "Empty" ? "0" : data.activeReferrals}
                    </div>
                    <div className="text-xs text-cyan-400 mt-1 font-mono">
                      4 pending onboarding
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 1: PERSONAL REFERRAL LINK & CODE */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Link Display Card */}
              <div className="lg:col-span-2 bg-[#141726] border border-slate-800/80 rounded-2xl p-6 shadow-xl flex flex-col justify-between relative">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      Personal Referral Protocol
                    </h3>
                    <button
                      onClick={handleRegenerate}
                      disabled={isRegenerating}
                      className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 transition disabled:opacity-50"
                    >
                      <Icons.Refresh spinning={isRegenerating} />
                      <span>Regenerate Link</span>
                    </button>
                  </div>
                  <p className="text-slate-400 text-sm mb-6">
                    Share your unique cryptographic link with colleagues. When
                    they deploy their first node, both protocols receive instant
                    network rewards.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Link Copy Box */}
                  <div className="bg-[#0B0D17] border border-slate-800 rounded-xl p-2 pl-4 flex items-center justify-between gap-3">
                    <div className="truncate font-mono text-sm text-cyan-400">
                      {data.referralLink}
                    </div>
                    <button
                      onClick={handleCopy}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-medium text-sm transition shrink-0 ${
                        copied
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_15px_rgba(139,92,246,0.3)]"
                      }`}
                    >
                      {copied ? <Icons.Check /> : <Icons.Copy />}
                      <span>{copied ? "Copied!" : "Copy Link"}</span>
                    </button>
                  </div>

                  {/* Share Platform Pills */}
                  <div className="flex items-center gap-2 flex-wrap pt-2">
                    <span className="text-xs text-slate-500 mr-2 font-mono uppercase">
                      Share via:
                    </span>
                    {[
                      "WhatsApp",
                      "Twitter",
                      "LinkedIn",
                      "Telegram",
                      "Facebook",
                    ].map((platform) => (
                      <button
                        key={platform}
                        onClick={() => handleSocialShare(platform)}
                        className="bg-[#1C2035] hover:bg-[#252A45] text-slate-300 hover:text-white text-xs px-3 py-1.5 rounded-lg border border-slate-700/50 transition flex items-center gap-1.5"
                      >
                        <span>{platform}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Referral Code & Quick Stats */}
              <div className="bg-[#141726] border border-slate-800/80 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-mono uppercase text-slate-400 mb-1">
                    Your Referral Code
                  </h3>
                  <div className="flex items-center justify-between bg-[#0B0D17] border border-purple-500/30 rounded-xl p-4 my-3">
                    <span className="text-xl font-mono font-bold text-white tracking-wider">
                      {data.referralCode}
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(data.referralCode);
                        showToast("Code copied to clipboard!");
                      }}
                      className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition"
                    >
                      <Icons.Copy />
                    </button>
                  </div>
                </div>

                <div className="border-t border-slate-800/80 pt-4 mt-2">
                  <div className="text-xs font-mono uppercase text-slate-500 mb-2">
                    Reward Tier Advantage
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-300">
                      Standard Signup Reward
                    </span>
                    <span className="text-emerald-400 font-mono font-bold">
                      +25 Credits
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-1.5">
                    <span className="text-slate-300">Enterprise Referral</span>
                    <span className="text-purple-400 font-mono font-bold">
                      +100 Credits
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 2: REFERRAL STATISTICS CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-[#141726] border border-slate-800/80 rounded-xl p-5 relative overflow-hidden group hover:border-slate-700 transition">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase text-slate-400">
                    Total Referrals
                  </span>
                  <div className="p-2 bg-purple-500/10 rounded-lg">
                    <Icons.Users />
                  </div>
                </div>
                <div className="text-2xl font-bold text-white mt-3 font-mono">
                  {dataState === "Empty" ? "0" : data.totalReferrals}
                </div>
                <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  <span className="text-emerald-400 font-mono">
                    +{dataState === "Empty" ? 0 : 12}
                  </span>{" "}
                  registered this week
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-transparent opacity-0 group-hover:opacity-100 transition" />
              </div>

              <div className="bg-[#141726] border border-slate-800/80 rounded-xl p-5 relative overflow-hidden group hover:border-slate-700 transition">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase text-slate-400">
                    Successful Sign-ups
                  </span>
                  <div className="p-2 bg-cyan-500/10 rounded-lg">
                    <Icons.CursorClick />
                  </div>
                </div>
                <div className="text-2xl font-bold text-white mt-3 font-mono">
                  {dataState === "Empty" ? "0" : data.successfulSignups}
                </div>
                <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  <span className="text-cyan-400 font-mono">
                    {dataState === "Empty" ? "0%" : "62.6%"}
                  </span>{" "}
                  completion rate
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500 to-transparent opacity-0 group-hover:opacity-100 transition" />
              </div>

              <div className="bg-[#141726] border border-slate-800/80 rounded-xl p-5 relative overflow-hidden group hover:border-slate-700 transition">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase text-slate-400">
                    Rewards Earned
                  </span>
                  <div className="p-2 bg-emerald-500/10 rounded-lg">
                    <Icons.Award />
                  </div>
                </div>
                <div className="text-2xl font-bold text-white mt-3 font-mono">
                  {dataState === "Empty" ? "0 Credits" : data.rewardsEarned}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Available in Storage Scopes
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 to-transparent opacity-0 group-hover:opacity-100 transition" />
              </div>

              <div className="bg-[#141726] border border-slate-800/80 rounded-xl p-5 relative overflow-hidden group hover:border-slate-700 transition">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase text-slate-400">
                    Network Growth
                  </span>
                  <div className="p-2 bg-pink-500/10 rounded-lg">
                    <Icons.TrendUp />
                  </div>
                </div>
                <div className="text-2xl font-bold text-white mt-3 font-mono">
                  {dataState === "Empty" ? "0.0%" : "+24.8%"}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Velocity over last 30 cycles
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-pink-500 to-transparent opacity-0 group-hover:opacity-100 transition" />
              </div>
            </div>

            {/* SECTION 3: REFERRAL HISTORY TABLE / EMPTY STATE */}
            <div className="bg-[#141726] border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
              <div className="p-6 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-white">
                    Referral Activity Log
                  </h3>
                  <p className="text-slate-400 text-xs mt-0.5">
                    Real-time synchronization of invitee registrations and
                    reward distributions.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-400 bg-[#0B0D17] border border-slate-800 px-3 py-1 rounded-full">
                    Total Records:{" "}
                    {dataState === "Empty" ? 0 : data.history.length}
                  </span>
                </div>
              </div>

              {/* EMPTY STATE CONDITION */}
              {dataState === "Empty" ? (
                <div className="p-16 text-center max-w-md mx-auto flex flex-col items-center justify-center">
                  <Icons.EmptyBox />
                  <h4 className="text-lg font-bold text-white mb-1">
                    No Referral Activity Yet
                  </h4>
                  <p className="text-slate-400 text-sm mb-6">
                    You haven't invited anyone to the SFCollab Network yet.
                    Share your link to start earning network credits and
                    commissions!
                  </p>
                  <button
                    onClick={() => handleCopy()}
                    className="bg-purple-600 hover:bg-purple-500 text-white font-medium px-6 py-2.5 rounded-xl shadow-[0_0_20px_rgba(139,92,246,0.4)] transition flex items-center gap-2"
                  >
                    <Icons.Copy />
                    <span>Copy Your Referral Link</span>
                  </button>
                </div>
              ) : (
                <>
                  {/* TABLE */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800/80 text-xs font-mono uppercase text-slate-400 bg-[#0E101A]/50">
                          <th className="py-3 px-6">Ref ID</th>
                          <th className="py-3 px-6">User Name</th>
                          <th className="py-3 px-6">Registration Date</th>
                          <th className="py-3 px-6">Tier Type</th>
                          <th className="py-3 px-6">Status</th>
                          <th className="py-3 px-6 text-right">
                            Reward Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/50 text-sm">
                        {paginatedHistory.map((item) => (
                          <tr
                            key={item.id}
                            className="hover:bg-[#1A1E32]/40 transition"
                          >
                            <td className="py-4 px-6 font-mono text-xs text-purple-400">
                              {item.id}
                            </td>
                            <td className="py-4 px-6 font-medium text-white flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 border border-slate-600 flex items-center justify-center text-[10px] font-bold">
                                {item.user.charAt(0)}
                              </div>
                              {item.user}
                            </td>
                            <td className="py-4 px-6 font-mono text-xs text-slate-400">
                              {item.date}
                            </td>
                            <td className="py-4 px-6">
                              <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                                {item.type}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium font-mono ${
                                  item.status === "Successful"
                                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                    : item.status === "Pending"
                                      ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                      : "bg-slate-500/10 text-slate-400 border border-slate-500/20"
                                }`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    item.status === "Successful"
                                      ? "bg-emerald-400"
                                      : item.status === "Pending"
                                        ? "bg-amber-400 animate-pulse"
                                        : "bg-slate-400"
                                  }`}
                                />
                                {item.status}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-right font-mono font-medium">
                              <span
                                className={
                                  item.reward === "Pending" ||
                                  item.reward === "0 Credits"
                                    ? "text-slate-500"
                                    : "text-cyan-400"
                                }
                              >
                                {item.reward}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* PAGINATION */}
                  <div className="p-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400 bg-[#0E101A]/30">
                    <div>
                      Showing{" "}
                      <span className="text-white">
                        {(currentPage - 1) * itemsPerPage + 1}
                      </span>{" "}
                      to{" "}
                      <span className="text-white">
                        {Math.min(
                          currentPage * itemsPerPage,
                          data.history.length,
                        )}
                      </span>{" "}
                      of{" "}
                      <span className="text-white">{data.history.length}</span>{" "}
                      entries
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                        disabled={currentPage === 1}
                        className="px-3 py-1 rounded bg-[#1C2035] border border-slate-700 text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none transition"
                      >
                        Prev
                      </button>

                      {[...Array(totalPages)].map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentPage(i + 1)}
                          className={`w-7 h-7 rounded flex items-center justify-center transition ${
                            currentPage === i + 1
                              ? "bg-purple-600 text-white font-bold border border-purple-500"
                              : "bg-[#1C2035] border border-slate-700 text-slate-400 hover:bg-slate-800"
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}

                      <button
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(prev + 1, totalPages),
                          )
                        }
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 rounded bg-[#1C2035] border border-slate-700 text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none transition"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>

      {/* QUICK SHARE MODAL */}
      {activeShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-[#141726] border border-purple-500/40 rounded-2xl max-w-md w-full p-6 shadow-[0_0_50px_rgba(139,92,246,0.2)] relative">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Icons.Share /> Broadcast Protocol Link
              </h3>
              <button
                onClick={() => setActiveShareModal(false)}
                className="text-slate-400 hover:text-white text-lg font-mono px-2"
              >
                ✕
              </button>
            </div>

            <p className="text-slate-400 text-sm mb-6">
              Select a communication channel below to instantly generate a
              pre-formatted invitation message containing your cryptographic
              referral link.
            </p>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {[
                {
                  name: "WhatsApp",
                  color: "hover:border-emerald-500 hover:bg-emerald-500/10",
                },
                {
                  name: "Twitter",
                  color: "hover:border-cyan-500 hover:bg-cyan-500/10",
                },
                {
                  name: "LinkedIn",
                  color: "hover:border-blue-500 hover:bg-blue-500/10",
                },
                {
                  name: "Telegram",
                  color: "hover:border-sky-500 hover:bg-sky-500/10",
                },
                {
                  name: "Facebook",
                  color: "hover:border-indigo-500 hover:bg-indigo-500/10",
                },
                {
                  name: "Copy Link",
                  color: "hover:border-purple-500 hover:bg-purple-500/10",
                },
              ].map((btn) => (
                <button
                  key={btn.name}
                  onClick={() => {
                    if (btn.name === "Copy Link") handleCopy();
                    else handleSocialShare(btn.name);
                    setActiveShareModal(false);
                  }}
                  className={`p-3 rounded-xl border border-slate-800 bg-[#0B0D17] text-left text-sm font-medium text-slate-200 transition flex items-center justify-between group ${btn.color}`}
                >
                  <span>{btn.name}</span>
                  <span className="text-slate-500 group-hover:text-white transition">
                    →
                  </span>
                </button>
              ))}
            </div>

            <div className="bg-[#0B0D17] border border-slate-800 rounded-xl p-3 flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400 truncate mr-2">
                {data.referralLink}
              </span>
              <button
                onClick={handleCopy}
                className="text-xs bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded-lg transition shrink-0"
              >
                Copy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
