import React from 'react';
import { Users, TrendingUp, Share2, Target, ArrowRight, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function InfluencerProfileSection({ userData, setHideInfluencerInfo }) {
  const previewStats = [
    { icon: Users, label: 'Audience Growth' },
    { icon: TrendingUp, label: 'Engagement Analytics' },
    { icon: Share2, label: 'Campaign Reach' },
    { icon: Target, label: 'Brand Collaborations' },
  ];

  return (
    <div className="relative my-6 overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600/20 to-blue-600/20 border border-indigo-400/30 backdrop-blur-sm p-5 sm:p-6 lg:p-8">

      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[length:20px_20px]" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-center items-start lg:items-center gap-6 mb-6">
          <div className="w-full flex flex-col justify-center items-center">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                Influencer Profile
              </h2>
              <span className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full bg-indigo-500/40 border border-indigo-400/50 text-white">
                <Lock className="w-3 h-3" />
                Locked
              </span>
            </div>
            <p className="text-white/70 max-w-2xl text-sm sm:text-base text-center">
              Hi {userData?.firstName || 'there'}, unlock your Influencer Profile to run campaigns, track performance, collaborate with startups, and earn through your audience.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="lg:absolute lg:top-1 md:right-1 flex flex-col gap-2 lg:flex-row gap-3 w-full lg:w-auto items-center">
            <Link
              to="/apply-influencer"
              className="inline-flex mx-4 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 px-6 py-3 font-semibold text-white transition-all duration-300 border border-indigo-300/50 hover:scale-105"
            >
              Apply Now
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            {/* <div
              onClick={() => {
                localStorage.setItem('preferences:hideInfluencerInfo', 'true');
                setHideInfluencerInfo(true);
                toast.success("Influencer Profile section hidden. You can turn it back on anytime in Preferences.");
              }}
              className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-xl bg-gray-700 hover:bg-gray-600 px-6 py-3 font-semibold text-white transition-all duration-300 border border-gray-600 hover:scale-105"
            >
              Not Interested
              
            </div> */}
          </div>
        </div>

        {/* Preview Features */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {previewStats.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-2 rounded-xl border border-indigo-400/30 bg-indigo-500/10 p-4 text-center hover:bg-indigo-500/20 transition-colors"
            >
              <Icon className="w-5 h-5 text-indigo-300" />
              <span className="text-xs sm:text-sm text-white/80">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
