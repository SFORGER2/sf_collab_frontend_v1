import React, { useState, useEffect } from "react";
import {
  Download,
  Rocket,
  CalendarDays,
  Clock,
  Layers,
  Monitor,
  Server,
  Database,
  Cloud,
  Code,
  PenTool,
  Package,
  Tag,
  CircleDollarSign,
  RefreshCcw,
  Headphones,
  FileText,
  CheckCircle2,
  File,
  Plus,
  ShieldCheck,
  Gauge,
  Lock,
  Shield,
  Headset,
} from "lucide-react";

export const ProposalViewer = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [proposalData, setProposalData] = useState(null);

  useEffect(() => {
    const fetchProposal = async () => {
      setIsLoading(true);
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setProposalData({
        title: "E-commerce Website",
        description: "Modern & responsive e-commerce platform",
        createdOn: "May 20, 2024",
        validUntil: "Jun 20, 2024",

        stack: [
          { label: "Frontend", value: "React", icon: Monitor },
          { label: "Backend", value: "Node.js", icon: Server },
          { label: "Database", value: "PostgreSQL", icon: Database },
          { label: "Hosting", value: "AWS", icon: Cloud },
          { label: "Language", value: "TypeScript", icon: Code },
          { label: "Styling", value: "Tailwind CSS", icon: PenTool },
        ],

        pack: [
          { label: "Pack Name", value: "Business Pack", icon: Tag },
          { label: "Price", value: "$399", icon: CircleDollarSign },
          { label: "Delivery Time", value: "6 Weeks", icon: Clock },
          { label: "Revisions", value: "Unlimited", icon: RefreshCcw },
          { label: "Support", value: "3 Months", icon: Headphones },
        ],

        pages: [
          "Home",
          "About Us",
          "Shop",
          "Product Details",
          "Cart",
          "Checkout",
          "Blog",
          "Contact Us",
        ],

        included: [
          {
            title: "Responsive Design",
            desc: "Fully responsive across all devices",
            icon: ShieldCheck,
            color: "text-cyan-400",
            bg: "bg-cyan-500/10",
          },
          {
            title: "Performance Optimized",
            desc: "Optimized for speed and performance",
            icon: Gauge,
            color: "text-purple-400",
            bg: "bg-purple-500/10",
          },
          {
            title: "SEO Friendly",
            desc: "Built with SEO best practices",
            icon: Lock,
            color: "text-cyan-400",
            bg: "bg-cyan-500/10",
          },
          {
            title: "Secure & Reliable",
            desc: "Security and reliability at the core",
            icon: Shield,
            color: "text-purple-400",
            bg: "bg-purple-500/10",
          },
          {
            title: "Dedicated Support",
            desc: "Dedicated support for your project",
            icon: Headset,
            color: "text-cyan-400",
            bg: "bg-cyan-500/10",
          },
        ],
      });
      setIsLoading(false);
    };

    fetchProposal();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-[#08090d] p-4 md:p-8 flex items-center justify-center">
        <div className="w-full max-w-7xl space-y-6 animate-pulse">
          <div className="h-10 bg-slate-800/50 rounded-lg w-1/4 mb-8"></div>
          <div className="h-24 bg-[#0d0f17] border border-slate-800 rounded-2xl w-full"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="h-[400px] bg-[#0d0f17] border border-slate-800 rounded-2xl"></div>
            <div className="h-[400px] bg-[#0d0f17] border border-slate-800 rounded-2xl"></div>
            <div className="h-[400px] bg-[#0d0f17] border border-slate-800 rounded-2xl"></div>
          </div>
          <div className="h-32 bg-[#0d0f17] border border-slate-800 rounded-2xl w-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#08090d] text-slate-300 p-4 md:p-8 font-sans selection:bg-cyan-500/30">
      <div className="max-w-[1400px] mx-auto space-y-6">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              Proposal Details
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Review your project proposal
            </p>
          </div>
          <button className="px-4 py-2.5 bg-transparent border border-cyan-500/50 hover:bg-cyan-500/10 text-cyan-400 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2">
            <Download className="w-4 h-4" /> Download Proposal
          </button>
        </header>

        {/* Top Banner */}
        <div className="bg-[#0b0e14] border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-purple-600/20 border border-purple-500/20 rounded-xl flex items-center justify-center">
              <Rocket className="w-7 h-7 text-purple-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {proposalData.title}
              </h2>
              <p className="text-sm text-slate-400">
                {proposalData.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-8 border-t md:border-t-0 border-slate-800 pt-4 md:pt-0">
            <div className="flex items-center gap-3">
              <CalendarDays className="w-6 h-6 text-cyan-400" />
              <div>
                <p className="text-xs font-semibold text-white">Created On</p>
                <p className="text-xs text-slate-400">
                  {proposalData.createdOn}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-6 h-6 text-slate-400" />
              <div>
                <p className="text-xs font-semibold text-white">Valid Until</p>
                <p className="text-xs text-slate-400">
                  {proposalData.validUntil}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 3-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {}
          {/* COLUMN 1: Stack Information */}
          <div className="bg-[#0b0e14] border border-cyan-500/30 rounded-2xl p-6 flex flex-col shadow-[0_0_20px_rgba(6,182,212,0.05)]">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-cyan-500/10 rounded-xl">
                <Layers className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Stack Information
                </h3>
                <p className="text-xs text-slate-400">
                  Technologies & tools used
                </p>
              </div>
            </div>

            <div className="space-y-3 flex-1">
              {proposalData.stack.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3.5 bg-[#10141d] rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-5 h-5 text-cyan-400" />
                    <span className="text-sm text-slate-300">{item.label}</span>
                  </div>
                  <span className="text-sm font-semibold text-cyan-400">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {}
          {/* COLUMN 2: Pack Information */}
          <div className="bg-[#0b0e14] border border-purple-500/30 rounded-2xl p-6 flex flex-col shadow-[0_0_20px_rgba(168,85,247,0.05)]">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-purple-500/10 rounded-xl">
                <Package className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Pack Information
                </h3>
                <p className="text-xs text-slate-400">
                  Details of the selected pack
                </p>
              </div>
            </div>

            <div className="space-y-3 flex-1">
              {proposalData.pack.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3.5 bg-[#10141d] rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-5 h-5 text-purple-400" />
                    <span className="text-sm text-slate-300">{item.label}</span>
                  </div>
                  <span className="text-sm font-semibold text-purple-400">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {}
          {/* COLUMN 3: Pages List */}
          <div className="bg-[#0b0e14] border border-cyan-500/30 rounded-2xl p-6 flex flex-col shadow-[0_0_20px_rgba(6,182,212,0.05)]">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-cyan-500/10 rounded-xl">
                <FileText className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Pages List</h3>
                <p className="text-xs text-slate-400">
                  All pages included in this proposal
                </p>
              </div>
            </div>

            <div className="space-y-2 flex-1 overflow-y-auto pr-1">
              {proposalData.pages.map((page, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-[#10141d] rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-mono text-cyan-500/70">
                      {(idx + 1).toString().padStart(2, "0")}
                    </span>
                    <span className="text-sm text-slate-200">{page}</span>
                  </div>
                  <File className="w-4 h-4 text-slate-500" />
                </div>
              ))}
            </div>

            <button className="mt-4 w-full p-3 bg-[#10141d] hover:bg-[#151a26] border border-slate-800 rounded-xl flex items-center justify-center gap-2 text-sm text-cyan-400 font-medium transition-colors">
              <Plus className="w-4 h-4" /> Add Custom Page
            </button>
          </div>
        </div>

        {}
        {/* Bottom Section: What's Included */}
        <div className="bg-[#0b0e14] border border-slate-800 rounded-2xl p-6">
          <h3 className="text-base font-bold text-white mb-6">
            What's Included
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {proposalData.included.map((item, idx) => (
              <div key={idx} className="flex items-start gap-4">
                <div className={`p-2.5 rounded-full shrink-0 ${item.bg}`}>
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white mb-1">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-400 leading-snug">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
