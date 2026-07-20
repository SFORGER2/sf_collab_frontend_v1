import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import NavBar from "../../landing-page/Navbar";
import Footer from "../../../components/landing-page/Footer";
import AIPricing from "./aiPricing";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "@/utils/config";
import { Loader2 } from "lucide-react";

const Pricing = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/payments/plans?type=standard`);
        if (res.data.length > 0) {
          const plan = res.data[0];
          setPlans(
            plan.roles.map((role) => ({
              title: role.role.charAt(0).toUpperCase() + role.role.slice(1),
              description: role.role === "builder" 
                ? "People Who Contribute" 
                : "People Who Create Projects",
              subtitle: role.role === "builder"
                ? "Builders never pay upfront. They only pay when they earn."
                : "Unlock creation, visibility, and execution readiness.",
              tiers: role.tiers.map((tier) => ({
                id: tier.id,
                name: tier.title,
                price: `$${(tier.price / 100).toFixed(0)}/mo`,
                platformFee: tier.fee ? `${(tier.fee * 100).toFixed(0)}%` : null,
                features: tier.features || [],
              })),
            }))
          );
        }
      } catch (err) {
        console.error("❌ Failed to load pricing plans", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-white/60" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <NavBar />

      {/* HEADER */}
      <div className="w-full mx-auto px-6 lg:px-40 pt-24">
        <h1 className="text-4xl md:text-5xl font-bold text-center bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Pricing & Plans
        </h1>
        <p className="text-neutral-400 text-center mt-4 max-w-2xl mx-auto">
          Choose how you participate. Builders earn. Founders build.
        </p>
        <p className="text-neutral-300 text-center mt-2 text-sm italic">
          Prices are subject to change after release.
        </p>
      </div>

      {/* TOGGLE */}
      <div className="w-full mx-auto px-6 lg:px-40 mt-12">
        <div className="relative mt-12 bg-neutral-900 border border-neutral-800 rounded-full flex p-1 max-w-md mx-auto">
          <motion.div
            layout
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute top-1 bottom-1 w-1/2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
            style={{ left: activeIndex === 0 ? "0%" : "50%" }}
          />
          {plans.map((plan, i) => (
            <button
              key={plan.title}
              onClick={() => setActiveIndex(i)}
              className={`relative z-10 w-1/2 py-3 text-sm font-semibold transition ${
                activeIndex === i ? "text-white" : "text-neutral-400"
              }`}
            >
              {plan.title}
            </button>
          ))}
        </div>

        {/* CONTENT */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="mt-16"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold">{plans[activeIndex].description}</h2>
              <p className="text-neutral-400 mt-2">{plans[activeIndex].subtitle}</p>
            </div>

            <div className="flex flex-row items-stretch justify-center flex-wrap gap-6">
              {plans[activeIndex].tiers.map((tier) => (
                <Link key={tier.id} to={`/checkout/${tier.id}`}>
                  <motion.div
                    whileHover={{ y: -6 }}
                    className="min-w-[20rem] flex-1 h-full bg-gradient-to-br from-neutral-900 to-neutral-800 border border-neutral-700 rounded-2xl p-6 flex flex-col justify-between"
                  >
                    <div>
                      <h3 className="text-xl font-semibold mb-3">{tier.name}</h3>
                      <p className="text-4xl font-bold text-blue-400 mb-2">{tier.price}</p>

                      {/* Platform Fee Highlight */}
                      {tier.platformFee && (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-2 mb-4">
                          <p className="text-sm font-semibold text-red-400">
                            Platform Fee: {tier.platformFee}
                          </p>
                        </div>
                      )}

                      <ul className="space-y-2 text-sm text-neutral-300 mb-6">
                        {tier.features.map((f, i) => (
                          <li key={i} className="flex gap-2">
                            <span className="text-green-400 flex-shrink-0">✓</span>
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button className="w-full py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 font-semibold hover:opacity-90 transition">
                      Choose Plan
                    </button>
                  </motion.div>
                </Link>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      <AIPricing />
      {/* DISCLAIMER */}
      <div className="w-full mx-auto px-6 lg:px-40 py-12">
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 max-w-3xl mx-auto">
          <p className="text-neutral-300 text-sm leading-relaxed">
            <span className="font-semibold text-white">Founder plans</span> unlock access to platform capabilities and define usage limits. Some services such as AI, hosting, email, automation, and external integrations are usage-based and billed separately. As SF evolves, new features will be added within existing plans based on capacity and access level.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Pricing;
