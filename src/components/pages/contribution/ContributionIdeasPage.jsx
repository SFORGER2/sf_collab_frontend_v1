import { useState } from "react";
import { Lightbulb, Send, Info } from "lucide-react";
import { useSelector } from "react-redux";
import { contributionAPI } from "@/utils/APIs/contributionAPI";
import { toast } from "react-toastify";
import AdminIdeasReviewSection from "./AdminIdeasReviewSection";

export default function ContributionIdeasPage({
  userRoles = []
}) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    impact: "small",
    area: "product",
  });
  
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };
  const { access_token, user } = useSelector((state) => state.auth);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const body = {
        title: form.title,
        description: form.description,
        impact: form.impact,
        area: form.area,
        status: "pending",
      }
      const response = await contributionAPI.createIdea(body, access_token)

      if (!response.success) {
        toast.error("Error submitting idea: " + (response.message || "Unknown error"));
        return;
      }

      setTimeout(() => {
        toast.success("Idea submitted successfully 🚀");
        setForm({
          title: "",
          description: "",
          impact: "small",
          area: "product",
        });
      }, 800);
    }
    catch (error) {
      console.error("Error submitting idea:", error);
      toast.error("Error submitting idea: " + (error.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-6 py-10 text-white bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* ================= HEADER ================= */}
        <header className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-400/20">
              <Lightbulb className="h-8 w-8 text-indigo-400" />
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold">
            Submit an Idea
          </h1>

          <p className="text-gray-300 max-w-2xl mx-auto">
            Ideas shape the future of SFCollab. Be clear, be honest, and think in
            terms of impact — not features for yourself.
          </p>
        </header>

        {/* ================= FORM ================= */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl bg-white/5 border border-white/10 p-6 sm:p-8 space-y-6"
        >
          {/* Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-200">
              Idea title *
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              placeholder="Short, clear idea title"
              className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-indigo-400/40"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-200">
              Description *
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              rows={5}
              placeholder="Explain the problem, why it matters, and how it helps the ecosystem."
              className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-sm resize-none focus:outline-none focus:border-indigo-400/40"
            />
          </div>

          {/* Area */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-200">
              Area
            </label>
            <select
              name="area"
              value={form.area}
              onChange={handleChange}
              className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-sm focus:outline-none"
            >
              <option value="product">Product / Features</option>
              <option value="ux">UX / UI</option>
              <option value="community">Community</option>
              <option value="growth">Growth / Marketing</option>
              <option value="monetization">Monetization</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Impact */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-200">
              Expected impact *
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  value: "small",
                  label: "Small",
                  points: "10 pts",
                  desc: "Minor improvements or fixes",
                },
                {
                  value: "medium",
                  label: "Medium",
                  points: "25 pts",
                  desc: "Meaningful feature or flow improvement",
                },
                {
                  value: "large",
                  label: "High impact",
                  points: "50 pts",
                  desc: "Platform-level or strategic improvement",
                },
              ].map((opt) => (
                <label
                  key={opt.value}
                  className={`cursor-pointer rounded-xl border p-4 text-sm transition ${
                    form.impact === opt.value
                      ? "border-indigo-400/40 bg-indigo-500/10"
                      : "border-white/10 bg-black/30 hover:border-white/20"
                  }`}
                >
                  <input
                    type="radio"
                    name="impact"
                    value={opt.value}
                    checked={form.impact === opt.value}
                    onChange={handleChange}
                    className="hidden"
                  />
                  <p className="font-semibold">{opt.label}</p>
                  <p className="text-xs text-gray-400">{opt.points}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {opt.desc}
                  </p>
                </label>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="flex gap-3 text-xs text-gray-400 bg-white/5 border border-white/10 rounded-xl p-4">
            <Info className="h-4 w-4 mt-0.5" />
            <p>
              All ideas are reviewed by the SF team. Approved ideas earn points
              and may be implemented. Spam or low-effort submissions earn no
              points.
            </p>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-500/80 hover:bg-indigo-500 px-6 py-3 text-sm font-semibold transition disabled:opacity-60"
            >
              <Send className="h-4 w-4" />
              {loading ? "Submitting..." : "Submit Idea"}
            </button>
          </div>
        </form>
      </div>
      {
        (userRoles.includes('admin') || user.role === 'admin')&& (
          <div className="max-w-7xl mx-auto mt-10">
            <AdminIdeasReviewSection />
          </div>
        )
              }
    </div>
  );
}
