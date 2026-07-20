import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Mail, CheckCircle2, AlertCircle, ArrowLeft, Info, Sparkles } from "lucide-react";
import notificationAPI from "../../utils/APIs/notificationAPI";
import NavBar from "../landing-page/Navbar";
import Footer from "../landing-page/Footer";

export default function Unsubscribe() {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [message, setMessage] = useState("");
  
  // Options
  const [options, setOptions] = useState({
    all: true,
    weekly: false,
    updates: false,
    marketing: false,
  });

  // Prepopulate email from query param if available
  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const handleOptionChange = (key) => {
    if (key === 'all') {
      setOptions(prev => ({
        all: !prev.all,
        // When toggling all ON, clear individual selections
        // When toggling all OFF, leave individual selections as-is
        weekly: !prev.all ? false : prev.weekly,
        updates: !prev.all ? false : prev.updates,
        marketing: !prev.all ? false : prev.marketing,
      }));
    } else {
      setOptions(prev => ({
        ...prev,
        [key]: !prev[key],
        all: false, // individual selection always deactivates 'all'
      }));
    }
  };

  const handleUnsubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setStatus("error");
      setMessage("Please enter a valid email address.");
      return;
    }

    setStatus("loading");
    try {
      // Call the API
      const res = await notificationAPI.unsubscribeFromNewsletter(email);
      if (res && res.success) {
        setStatus("success");
        setMessage("You have been unsubscribed from the selected newsletters.");
      } else {
        setStatus("error");
        setMessage(res?.message || "Something went wrong. Please try again.");
      }
    } catch (err) {
      setStatus("error");
      setMessage("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden flex flex-col font-sans">
      <NavBar />

      <main className="flex-1 w-full max-w-lg mx-auto px-4 py-32 flex flex-col justify-center relative">
        {/* Glow Background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl -z-10" />

        {/* Back Link */}
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors group">
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Back to Home
          </Link>
        </div>

        {/* Form Container */}
        <div className="bg-white/5 bg-gradient-to-br from-white/10 via-white/5 to-transparent border border-white/20 rounded-3xl p-8 md:p-10 shadow-2xl backdrop-blur-2xl">
          {status === "success" ? (
            <div className="flex flex-col items-center text-center space-y-4 py-6 bg-white/5 bg-gradient-to-br from-white/10 via-white/5 to-transparent border border-white/20 rounded-xl backdrop-blur-2xl">
              <CheckCircle2 className="w-16 h-16 text-emerald-400 animate-bounce" />
              <h2 className="text-2xl font-bold">Preferences Updated</h2>
              <p className="text-gray-400 text-sm max-w-sm">
                {message || "Your newsletter subscription preferences have been updated successfully."}
              </p>
              <Link
                to="/"
                className="mt-6 px-6 py-2.5 bg-white text-black hover:bg-gray-200 rounded-xl text-sm font-semibold transition-all duration-300"
              >
                Return to Home
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  Subscription Settings
                </div>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Unsubscribe or Manage Preferences</h2>
                <p className="text-gray-400 text-xs md:text-sm">
                  We're sorry to see you go. Let us know how we can tailor your subscription.
                </p>
              </div>

              <form onSubmit={handleUnsubscribe} className="space-y-6">
                {/* Email field */}
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Email Address
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                      <Mail className="w-5 h-5" />
                    </span>
                    <input
                      type="email"
                      id="email"
                      required
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (status === "error") setStatus("idle");
                      }}
                      placeholder="Enter your email address"
                      className="w-full bg-black/40 text-white placeholder-gray-500 text-sm pl-12 pr-4 py-3.5 rounded-xl border border-white/10 focus:border-purple-500 focus:outline-none transition-all duration-300"
                    />
                  </div>
                </div>

                {/* Preference Choices */}
                <div className="space-y-3 pt-2">
                  <span className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Options
                  </span>

                  {/* Option: Unsubscribe from all */}
                  <label
                    onClick={() => handleOptionChange("all")}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-300 ${
                      options.all
                        ? "bg-purple-600/10 border-purple-500 text-white"
                        : "bg-white/[0.01] border-white/5 text-gray-400 hover:text-white hover:border-white/10"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={options.all}
                      onChange={() => {}} // handled by click container
                      className="mt-1 accent-purple-500"
                    />
                    <div className="text-left">
                      <span className="block text-sm font-semibold">Unsubscribe from all newsletters</span>
                      <span className="block text-xs text-gray-500 mt-0.5">Opt-out from all future marketing updates and bulletins.</span>
                    </div>
                  </label>

                  {/* Option: Weekly Digest */}
                  <label
                    onClick={() => handleOptionChange("weekly")}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-300 ${
                      options.weekly
                        ? "bg-purple-600/10 border-purple-500 text-white"
                        : "bg-white/[0.01] border-white/5 text-gray-400 hover:text-white hover:border-white/10"
                    } ${options.all ? "opacity-50 pointer-events-none" : ""}`}
                  >
                    <input
                      type="checkbox"
                      checked={options.weekly}
                      disabled={options.all}
                      onChange={() => {}} // handled by click container
                      className="mt-1 accent-purple-500"
                    />
                    <div className="text-left">
                      <span className="block text-sm font-semibold">Weekly Eco-system Digest</span>
                      <span className="block text-xs text-gray-500 mt-0.5">Keep receiving curated startup stories and ecosystem progress reports.</span>
                    </div>
                  </label>

                  {/* Option: Updates */}
                  <label
                    onClick={() => handleOptionChange('updates')}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-300 ${
                      options.updates
                        ? 'bg-purple-600/10 border-purple-500 text-white'
                        : 'bg-white/[0.01] border-white/5 text-gray-400 hover:text-white hover:border-white/10'
                    } ${options.all ? 'opacity-50 pointer-events-none' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={options.updates}
                      disabled={options.all}
                      onChange={() => {}} // handled by click container
                      className="mt-1 accent-purple-500"
                    />
                    <div className="text-left">
                      <span className="block text-sm font-semibold">Product Updates &amp; Features</span>
                      <span className="block text-xs text-gray-500 mt-0.5">Get notified when new tools and ecosystem updates go live.</span>
                    </div>
                  </label>

                  {/* Option: Marketing */}
                  <label
                    onClick={() => handleOptionChange('marketing')}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-300 ${
                      options.marketing
                        ? 'bg-purple-600/10 border-purple-500 text-white'
                        : 'bg-white/[0.01] border-white/5 text-gray-400 hover:text-white hover:border-white/10'
                    } ${options.all ? 'opacity-50 pointer-events-none' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={options.marketing}
                      disabled={options.all}
                      onChange={() => {}} // handled by click container
                      className="mt-1 accent-purple-500"
                    />
                    <div className="text-left">
                      <span className="block text-sm font-semibold">Events &amp; Partner Promotions</span>
                      <span className="block text-xs text-gray-500 mt-0.5">Invitations to webinars, founder meetups, and ecosystem events.</span>
                    </div>
                  </label>
                </div>

                {status === "error" && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{message}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2"
                >
                  {status === "loading" ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    "Save Preferences"
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
