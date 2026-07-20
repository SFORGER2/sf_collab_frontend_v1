import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import './fire.css'
export default function CrowdfundingSection() {
  return (
    <section className="flex flex-col relative py-2 px-6 gap-2 bg-gradient-to-r from-indigo-900 via-purple-900 to-pink-900 rounded-2xl overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-transparent to-pink-500/20 blur-3xl" />

      <div className="relative z-10 max-w-4xl mx-auto text-center space-y-4">
        <h2 className="text-3xl md:text-4xl font-bold text-white">
          Be Part of the Future
        </h2>

        <p className="text-lg text-white/80">
          Become an early supporter and secure permanent benefits. Lifetime
          access reserved for our first believers.
        </p>

        {/* 🔥 FIRE BUTTON */}
        <div className="fire-border mx-auto overflow-hidden">
          <Link
            to="/crowdfunding"
            className="fire-button inline-flex  items-center gap-2 px-8 py-3 text-white font-semibold rounded-lg relative z-10"
          >
            Explore Crowdfunding
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
