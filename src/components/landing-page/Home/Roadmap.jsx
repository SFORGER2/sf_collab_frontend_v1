import { Rocket, Target, Brain } from "lucide-react";
import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion } from "framer-motion";

gsap.registerPlugin(ScrollTrigger);

const phases = [
  {
    icon: Rocket,
    phase: "🧬 PHASE 0 — MVP",
    title: "Community-Driven Foundation (SFCollab)",
    gradient: "from-purple-900 to-black-500",
    dot: "bg-white",
    items: [
      "Community-Powered Idea Battles & Validation",
      "Startup Creation, Joining & Creative Spaces",
      "Vision Shaping & Early Pitch Creation",
      "Team Building & Creative Collaboration",
      "Founder Social Network",
      "Knowledge Hub & Lightweight Tools",
      "Contribution Points & Gamified Progress",
      "Basic Payments & Community Support",
      "Unified Startup Ecosystem",
    ],
    description:
      "Validate ideas, connect builders, and enable early-stage startup creation inside one unified creative ecosystem.",
  },
  {
    icon: Target,
    phase: "⚙️ PHASE 1 — CORE PLATFORM",
    title: "Creation, Growth & Execution Bridge",
    gradient: "from-purple-900 to-black-500",
    dot: "bg-white",
    items: [
      "Advanced Business Plan & Pitch Deck Creation",
      "Mentor Registration & Mentorship Ecosystem",
      "AI Interaction & Voice Control Layer",
      "Advanced Team Collaboration & Shared Spaces",
      "Smart Meetings & Activity Tracking",
      "Enhanced Social Experience",
      "Payments, Rewards & Mentor Incentives",
      "Connected Apps & Integrations",
      "SFManagers Integration for Execution",
    ],
    description:
      "Move startups from validated ideas to structured execution with intelligence, collaboration, and clear ownership.",
  },
  {
    icon: Brain,
    phase: "🧠 PHASE 2 — INVESTOR-READY & SCALABLE ECOSYSTEM",
    title: "Intelligence, Capital & Long-Term Infrastructure",
    gradient: "from-purple-900 to-black-500",
    dot: "bg-white",
    items: [
      "Investor Access & Startup Discovery",
      "Secure Funding, Escrow & Milestone Enforcement",
      "Advanced AI Research & Creation Tools",
      "Sustainable Crypto & Token Infrastructure",
      "Startup Infrastructure & Services",
      "Automation & Intelligent Workflows",
      "Global Collaboration & Community Events",
      "Proprietary AI & Platform Intelligence",
      "SFCollab × SFManagers Unified Operating System"
    ],
    description:
      "Enable funding readiness, secure capital flows, advanced intelligence, and sustainable ecosystem growth.",
  },
];

export default function Roadmap() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const ctx = gsap.context((self) => {
      const cards = self.selector(".phase-card");
      const grid = self.selector(".phases-grid")[0];

      gsap.fromTo(
        ".roadmap-title",
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 85%" } }
      );

      if (cards.length === 3 && grid) {
        gsap.set(cards, {
          x: (i, target) => {
            const gridRect = grid.getBoundingClientRect();
            const targetRect = target.getBoundingClientRect();
            const gridCenter = gridRect.left + gridRect.width / 2;
            const targetCenter = targetRect.left + targetRect.width / 2;
            return gridCenter - targetCenter;
          },
          y: -50,
          opacity: 0,
          scale: 0.8,
        });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: grid,
            start: "center center",
            end: "+=800", // Controls the duration of the pin and scrub
            pin: true,
            scrub: 1,
            anticipatePin: 1,
          },
        });

        // 1. Phase 0 (First card) appears, then moves left
        tl.to(cards[0], {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.4,
          ease: "power2.out",
        }).to(cards[0], { x: 0, duration: 0.6, ease: "power3.inOut" });

        // 2. Phase 1 (Second card) appears and stays in the center
        tl.to(cards[1], {
          opacity: 1,
          scale: 1,
          x: 0,
          y: 0,
          duration: 0.6,
          ease: "back.out(1.5)",
        }, "-=0.3");

        // 3. Phase 2 (Third card) appears, then moves right
        tl.to(cards[2], {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.4,
          ease: "power2.out",
        }, "-=0.3")
        .to(cards[2], { x: 0, duration: 0.6, ease: "power3.inOut" });
      }
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={sectionRef} className="h-auto p-6">
      <div className="w-full mx-auto">
        <div className="mb-16 flex flex-col items-center justify-center w-full text-center">
          <h2 className="roadmap-title text-4xl md:text-5xl font-bold text-white mb-4">
            Momentum Roadmap
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            A deliberate path from core execution to intelligent automation. Built to scale without noise.
          </p>
        </div>
        <div className="phases-grid grid grid-cols-1 lg:h-[600px] h-auto w-full lg:grid-cols-3 gap-6">
          {phases.map((phase, idx) => {
            const Icon = phase.icon;
            return (
              <motion.div
                key={phase.phase}
                className="phase-card bg-transparent border border-gray-600 rounded-xl overflow-hidden shadow-[rgba(88,28,135,0.35)] shadow-2xl hover:shadow-[rgba(88,28,135,0.5)] transition-shadow duration-300"
                whileHover={{ y: -4 }}
              >
                <div className={`bg-gradient-to-r ${phase.gradient} text-white p-6`}>
                  <div className="flex items-center gap-3 mb-2">
                    <Icon className="w-8 h-8" />
                    <div>
                      <p className="text-sm font-medium opacity-90">{phase.phase}</p>
                      <h2 className="text-xl font-bold">{phase.title}</h2>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-white font-semibold mb-6 leading-relaxed">{phase.description}</p>
                  <ul className="space-y-3">
                    {phase.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <div className={`w-2 h-2 ${phase.dot} rounded-full mt-2 flex-shrink-0`}></div>
                        <span className="text-slate-400">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
