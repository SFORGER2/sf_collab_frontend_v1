import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/utils/config";
import { Loader2 } from "lucide-react";

const ExtrasSection = ({ aiTools }) => (
  <section className="mt-24">
    <motion.h2
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      className="text-4xl font-bold text-center mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
    >
      Power Extras
    </motion.h2>

    <p className="text-center text-neutral-400 mb-12 max-w-2xl mx-auto">
      Optional power features. Add only what helps you execute. Any plan can use them.
    </p>

    {/* AI BUNDLE */}
    {aiTools.bundle && (
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/40 rounded-2xl p-8 mb-12"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold">🤖 {aiTools.bundle.title}</h3>
          <span className="text-3xl font-bold text-purple-400">${(aiTools.bundle.price / 100).toFixed(2)}/mo</span>
        </div>

        <p className="text-neutral-300 mb-4">
          {aiTools.bundle.description || "All AI tools included. Best value."}
        </p>

        <button className="px-6 py-3 rounded-xl bg-purple-500 hover:bg-purple-600 transition font-semibold">
          Add AI Bundle
        </button>
      </motion.div>
    )}

    {/* INDIVIDUAL TOOLS */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {aiTools.items.map((tool) => (
        <div
          key={tool.id}
          className="bg-neutral-900 border border-neutral-700 rounded-xl p-6 hover:border-neutral-500 transition"
        >
          <h4 className="font-semibold mb-2">{tool.title}</h4>
          <p className="text-sm text-neutral-400 mb-4">{tool.description || ""}</p>
          <div className="flex items-center justify-between">
            <span className="font-bold text-purple-400">${(tool.price / 100).toFixed(2)}/mo</span>
            <button className="text-sm text-purple-400 hover:underline">
              Add
            </button>
          </div>
        </div>
      ))}
    </div>
  </section>
);

const CreditPacks = ({ credits }) => (
  <section className="mt-24">
    <h3 className="text-3xl font-bold mb-6 text-center">SF Coins</h3>

    <p className="text-neutral-400 text-center mb-8">
      {credits.description_details || "Used for AI, automation, heavy processing & external APIs."}
    </p>

    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {credits.credit_packs.map((pack) => (
        <div key={pack.id} className="bg-neutral-900 border border-neutral-700 rounded-xl p-4 text-center">
          <p className="text-xl font-bold text-purple-400">{pack.credits.toLocaleString()}</p>
          <p className="text-sm text-neutral-400 mb-2">coins / month</p>
          <p className="font-semibold">${(pack.price / 100).toFixed(2)}</p>
        </div>
      ))}
    </div>
  </section>
);

export default function AIPricing() {
  const [aiTools, setAiTools] = useState({ bundle: null, items: [] });
  const [credits, setCredits] = useState({ credit_packs: [], description_details: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/payments/plans`);
        const aiPlan = res.data.find((p) => p.category === "ai-tools");
        const creditPlan = res.data.find((p) => p.category === "credits");

        if (aiPlan) {
          const bundle = aiPlan.tools.find((t) => t.bundle);
          const items = aiPlan.tools.filter((t) => !t.bundle);
          setAiTools({ bundle, items });
        }

        if (creditPlan) {
          setCredits(creditPlan);
        }
      } catch (err) {
        console.error("❌ Failed to load AI pricing plans", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  if (loading) {
    return (
      <div className="w-full mx-auto px-6 lg:px-40 py-16 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
      </div>
    );
  }

  return (
    <div className="w-full mx-auto px-6 lg:px-40 py-16">
      <h1 className="text-5xl font-extrabold text-center mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
        AI & SF Coins Pricing
      </h1>
      <p className="text-center text-neutral-400 max-w-3xl mx-auto">
        Flexible AI-powered features and credit packs to supercharge your collaboration experience. Choose what fits your needs and scale as you grow.
      </p>

      <ExtrasSection aiTools={aiTools} />
      <CreditPacks credits={credits} />
      
      <div className="mt-24 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-purple-500/30 rounded-2xl p-8 text-center">
        <p className="text-xl text-neutral-200 font-semibold mb-4">
          SF is not about locking features.
        </p>
        <p className="text-neutral-300">
          Start free. Scale when ready.
          Use power only when it helps you execute.
        </p>
      </div>
    </div>
  );
}