import React, { useState } from "react";
import { Mail, CheckCircle2, ArrowRight, Sparkles } from "lucide-react";
import notificationAPI from "../../utils/APIs/notificationAPI";

const NewsletterSignup = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    // Simple validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setStatus("error");
      setMessage("Please enter a valid email address.");
      return;
    }

    setStatus("loading");
    try {
      const response = await notificationAPI.subscribeToNewsletter(email);
      if (response && response.success) {
        setStatus("success");
        setMessage("Thank you! You have been successfully subscribed.");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(response?.message || "Something went wrong. Please try again.");
      }
    } catch (error) {
      setStatus("error");
      setMessage("An unexpected error occurred. Please check your connection.");
    }
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto my-16 px-4">
      {/* Decorative background glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-indigo-600/5 to-blue-600/10 blur-3xl -z-10 rounded-3xl" />

      {/* Glassmorphic Container */}
      <div className="relative overflow-hidden bg-white/[0.02] backdrop-blur-md border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl">
        {/* Glow corner */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* Text Section */}
          <div className="max-w-md text-left space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-medium uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Stay updated
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight leading-tight">
              Get the latest startup insights delivered weekly
            </h3>
            <p className="text-gray-400 text-sm md:text-base leading-relaxed">
              Join 5,000+ founders and developers getting curate resources, execution guides, and ecosystem updates.
            </p>
          </div>

          {/* Form Section */}
          <div className="w-full max-w-md">
            {status === "success" ? (
              <div className="flex flex-col items-center justify-center p-6 text-center space-y-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl animate-fade-in">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 animate-bounce" />
                <div>
                  <h4 className="text-lg font-semibold text-white">Joined Successfully!</h4>
                  <p className="text-sm text-gray-400 mt-1">{message}</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="relative flex items-center">
                  <span className="absolute left-4 text-gray-500">
                    <Mail className="w-5 h-5" />
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (status === "error") setStatus("idle");
                    }}
                    placeholder="Enter your email address"
                    className="w-full bg-black/40 text-white placeholder-gray-500 text-sm md:text-base pl-12 pr-32 py-4 rounded-2xl border border-white/10 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none transition-all duration-300"
                    disabled={status === "loading"}
                    required
                  />
                  <button
                    type="submit"
                    className="absolute right-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-sm font-semibold rounded-xl flex items-center gap-1.5 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-purple-600/20"
                    disabled={status === "loading"}
                  >
                    {status === "loading" ? (
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        Subscribe
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>

                {status === "error" && (
                  <p className="text-rose-400 text-xs pl-2 transition-all duration-300">
                    {message}
                  </p>
                )}

                <p className="text-gray-500 text-[11px] text-center lg:text-left mt-2">
                  By subscribing, you agree to our Privacy Policy. You can unsubscribe at any time.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsletterSignup;
