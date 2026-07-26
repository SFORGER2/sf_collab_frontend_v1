import { useEffect, useState } from "react";
import axios from "axios";
import { Loader2, Rocket, Bell, CheckCircle, Clock } from "lucide-react";
import { FaInstagram } from "react-icons/fa";
import { API_BASE_URL } from "@/utils/config";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { paymentAPI } from "@/utils/APIs/paymentAPI";
import { IoChatbubble } from "react-icons/io5";
import { Copy } from "lucide-react";

// ─────────────────────────────────────────────
// Crowdfunding is temporarily disabled.
// This page collects "interest" from users only.
// No payments or campaign creation are possible.
// ─────────────────────────────────────────────

export default function CrowdfundingSection() {
  const [loading, setLoading] = useState(true);
  const [totalCrowdfunding, setTotalCrowdfunding] = useState(80);
  const [interestSubmitted, setInterestSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { access_token, user } = useSelector((state) => state.auth);

  const FUNDING_GOAL = 25000;

  // Still fetch total so the progress bar is live
  useEffect(() => {
    const fetchTotal = async () => {
      try {
        const res = await paymentAPI.getTotalCrowdfunding();
        setTotalCrowdfunding(res?.data?.data?.total_crowdfunding / 100 || 80);
      } catch (err) {
        console.error("Failed to load total crowdfunding amount", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTotal();
  }, [access_token]);

  // Check if user already expressed interest (stored in localStorage as a lightweight flag)
  useEffect(() => {
    if (user?.id) {
      const key = `cf_interest_${user.id}`;
      if (localStorage.getItem(key) === "true") {
        setInterestSubmitted(true);
      }
    }
  }, [user]);

  const handleInterest = async () => {
    if (!access_token) {
      toast.warning("Please log in to register your interest.");
      return;
    }
    setSubmitting(true);
    try {
      await axios.post(
        `${API_BASE_URL}/payments/crowdfunding-interest`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${access_token}`,
          },
        }
      );
      // Persist locally so button stays "registered" on next visit
      if (user?.id) {
        localStorage.setItem(`cf_interest_${user.id}`, "true");
      }
      setInterestSubmitted(true);
      toast.success("🎉 Your interest has been registered! We'll notify you when crowdfunding launches.");
    } catch (err) {
      // If already registered (409) just mark as submitted
      if (err?.response?.status === 409) {
        setInterestSubmitted(true);
        if (user?.id) localStorage.setItem(`cf_interest_${user.id}`, "true");
      } else {
        toast.error("Something went wrong. Please try again.");
        console.error(err);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrice = (amount) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount);

  const progressPercent = Math.min(
    ((totalCrowdfunding / FUNDING_GOAL) * 100).toFixed(2),
    100
  );

  if (loading) {
    return (
      <section className="py-32 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-white/60" />
      </section>
    );
  }

  return (
    <>
      <section className="relative mb-20 py-24 px-6 bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950 text-white">
        <div className="w-full px-6 md:px-40 mx-auto space-y-16">

          {/* ── HEADER ── */}
          <header className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Support SFCollab.{" "}
              <span className="text-indigo-400">Unlock the future.</span>
            </h1>
            <p className="text-white/60 max-w-2xl mx-auto">
              Early supporters unlock permanent advantages and help shape how collaboration platforms are built.
            </p>
            <div className="flex gap-4 justify-center mt-6">
              <a
                href="https://instagram.com/sfcollab_official"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-2 flex gap-3 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold hover:opacity-90 transition"
              >
                <FaInstagram size={22} />
                Instagram
              </a>
              <button
                onClick={() => {
                  navigator.clipboard.writeText("support@sfcollab.com");
                  toast.success("Email copied to clipboard!");
                }}
                className="px-6 py-2 flex gap-3 rounded-lg bg-neutral-800 border border-neutral-700 text-white hover:bg-neutral-700 transition"
              >
                <Copy size={22} />
                Email
              </button>
              <Link
                to="/contact"
                className="px-6 py-2 flex gap-3 items-center justify-center rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold hover:opacity-90 transition"
              >
                <IoChatbubble size={22} />
                Chat Support
              </Link>
            </div>
          </header>

          {/* ── PROGRESS METER ── */}
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="flex justify-between text-sm text-white/70">
              <span>
                Raised{" "}
                <span className="text-white font-semibold">{formatPrice(totalCrowdfunding)}</span>
              </span>
              <span>
                Goal{" "}
                <span className="text-white font-semibold">{formatPrice(FUNDING_GOAL)}</span>
              </span>
            </div>

            <div className="relative h-4 rounded-full bg-neutral-800 overflow-hidden border border-neutral-700">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 shadow-[0_0_20px_rgba(139,92,246,0.6)] transition-all duration-700"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="flex justify-between items-center text-xs text-white/60">
              <span>{progressPercent}% funded</span>
              <span className="text-indigo-400 font-medium">
                Early supporters get permanent advantages 🚀
              </span>
            </div>
          </div>

          {/* ── COMING SOON CARD ── */}
          <div className="max-w-2xl mx-auto">
            <div className="relative overflow-hidden rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-900/30 to-purple-900/20 p-10 text-center space-y-6 shadow-2xl shadow-indigo-500/10">

              {/* Decorative glow */}
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

              {/* Icon */}
              <div className="relative flex justify-center">
                <div className="p-4 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30">
                  <Rocket className="w-12 h-12 text-indigo-400" />
                </div>
              </div>

              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-sm font-semibold">
                <Clock className="w-4 h-4" />
                Coming Soon
              </div>

              <div className="space-y-3 relative">
                <h2 className="text-3xl md:text-4xl font-bold text-white">
                  Crowdfunding is{" "}
                  <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                    launching soon
                  </span>
                </h2>
                <p className="text-white/60 max-w-md mx-auto leading-relaxed">
                  We're putting the final touches on our crowdfunding platform. 
                  Register your interest now and be the first to know when it goes live — 
                  early supporters will unlock exclusive permanent advantages.
                </p>
              </div>

              {/* What to expect bullets */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-white/70 relative">
                {[
                  { icon: "🎯", text: "Exclusive early-supporter perks" },
                  { icon: "🔔", text: "Priority launch notification" },
                  { icon: "🏆", text: "Permanent platform advantages" },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10"
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>

              {/* ── INTEREST BUTTON ── */}
              <div className="relative">
                {interestSubmitted ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex items-center gap-3 px-8 py-4 rounded-xl bg-green-500/20 border border-green-500/30 text-green-400 font-semibold text-lg">
                      <CheckCircle className="w-6 h-6" />
                      You're on the list!
                    </div>
                    <p className="text-white/50 text-sm">
                      We'll send you a notification when crowdfunding launches.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <button
                      onClick={handleInterest}
                      disabled={submitting}
                      className="group relative px-10 py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold text-lg hover:opacity-90 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/30 flex items-center gap-3"
                    >
                      <Bell className="w-5 h-5" />
                      {submitting ? "Registering..." : "Interested in Crowdfunding"}
                    </button>
                    <p className="text-white/40 text-xs">
                      No payment required. We'll notify you when it's ready.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── DISCLAIMER ── */}
          <div className="max-w-3xl mx-auto bg-neutral-900/50 border border-neutral-700 rounded-xl p-6 text-sm text-neutral-300 space-y-2">
            <p>● Crowdfunding is not yet available — no payments can be made at this time</p>
            <p>● Platform fees apply only when you earn</p>
            <p>● Crowdfunding does not guarantee work or income</p>
            <p>● Priority affects matching order, not selection outcomes</p>
            <p>● All core tools remain free for builders</p>
          </div>
        </div>
      </section>
    </>
  );
}