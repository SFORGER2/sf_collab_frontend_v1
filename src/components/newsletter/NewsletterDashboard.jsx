import React, { useState } from "react";
import {
  Mail,
  Archive,
  Edit3,
  Settings,
  Send,
  Tag,
  CheckCircle2,
  Search,
  Bell,
  AlertCircle,
} from "lucide-react";

export const NewsletterDashboard = () => {
  const [activeTab, setActiveTab] = useState("subscribe");

  const tabs = [
    { id: "subscribe", label: "Subscribe", icon: <Mail className="w-4 h-4" /> },
    { id: "archive", label: "Archive", icon: <Archive className="w-4 h-4" /> },
    { id: "editor", label: "Editor UI", icon: <Edit3 className="w-4 h-4" /> },
    {
      id: "preferences",
      label: "Preferences",
      icon: <Settings className="w-4 h-4" />,
    },
  ];

  return (
    <div className="min-h-screen w-full bg-[#0a0b10] text-slate-300 p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-slate-800 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
              <Mail className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-100">
                Newsletter Hub
              </h1>
              <p className="text-sm text-slate-500">
                Manage subscriptions, archives, and campaigns.
              </p>
            </div>
          </div>

          {/* Mobile-Responsive Navigation Tabs */}
          <nav className="flex overflow-x-auto custom-scrollbar gap-2 pb-2 md:pb-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/50"
                    : "bg-slate-800/50 text-slate-400 hover:bg-slate-800 border border-transparent"
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </nav>
        </header>

        {/* Dynamic Content Area */}
        <div className="bg-[#0d0f17] border border-slate-800 rounded-2xl p-6 shadow-xl min-h-[500px]">
          {activeTab === "subscribe" && <SubscribeView />}
          {activeTab === "archive" && <ArchiveView />}
          {activeTab === "editor" && <EditorView />}
          {activeTab === "preferences" && <PreferencesView />}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// SUB-COMPONENTS FOR EACH TAB
// ==========================================

const SubscribeView = () => (
  <div className="max-w-lg mx-auto py-8 text-center animate-in fade-in zoom-in duration-300">
    <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
      <Mail className="w-8 h-8 text-purple-400" />
    </div>
    <h2 className="text-2xl font-bold text-slate-100 mb-2">
      Join Our Newsletter
    </h2>
    <p className="text-slate-400 text-sm mb-8">
      Get the latest product updates, engineering blogs, and company news
      delivered directly to your inbox.
    </p>

    <form className="space-y-4 text-left" onSubmit={(e) => e.preventDefault()}>
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1">
          Email Address
        </label>
        <input
          type="email"
          placeholder="you@company.com"
          className="w-full bg-[#0a0b10] border border-slate-700 rounded-xl p-3 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
          required
        />
      </div>

      <div className="pt-2">
        <label className="block text-xs font-medium text-slate-400 mb-2">
          Select Categories to Follow:
        </label>
        <div className="flex flex-wrap gap-2">
          {[
            "Product Updates",
            "Engineering",
            "Company News",
            "Weekly Digest",
          ].map((tag) => (
            <label
              key={tag}
              className="flex items-center gap-2 cursor-pointer bg-slate-800/50 hover:bg-slate-800 px-3 py-2 rounded-lg border border-slate-700 transition-colors"
            >
              <input
                type="checkbox"
                className="accent-purple-500 w-4 h-4"
                defaultChecked
              />
              <span className="text-xs text-slate-300">{tag}</span>
            </label>
          ))}
        </div>
      </div>

      <button className="w-full mt-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
        Subscribe Now
      </button>
    </form>
  </div>
);

const ArchiveView = () => (
  <div className="animate-in fade-in duration-300">
    <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
      <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
        <Archive className="text-cyan-400" /> Past Issues
      </h2>
      <div className="relative w-full md:w-64">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          placeholder="Search archives..."
          className="w-full bg-[#0a0b10] border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm focus:border-cyan-500 outline-none"
        />
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="p-5 bg-[#0a0b10] border border-slate-800 rounded-xl hover:border-cyan-500/30 transition-colors cursor-pointer group"
        >
          <div className="flex justify-between items-start mb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-400/10 px-2 py-1 rounded">
              Issue #{42 - i}
            </span>
            <span className="text-xs text-slate-500">Oct {15 - i}, 2023</span>
          </div>
          <h3 className="text-sm font-bold text-slate-200 mb-2 group-hover:text-cyan-400 transition-colors">
            Platform V2.0 Launch Details
          </h3>
          <p className="text-xs text-slate-500 line-clamp-2">
            A deep dive into our new architecture, performance improvements, and
            what it means for your workflow.
          </p>
        </div>
      ))}
    </div>
  </div>
);

const EditorView = () => (
  <div className="animate-in fade-in duration-300 flex flex-col h-full">
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
        <Edit3 className="text-orange-400" /> Draft Campaign
      </h2>
      <button className="bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors">
        <Send className="w-4 h-4" /> Send Test Email
      </button>
    </div>

    <div className="space-y-4 flex-1">
      <input
        type="text"
        placeholder="Subject Line"
        className="w-full bg-[#0a0b10] border border-slate-700 rounded-lg p-3 text-sm focus:border-orange-500 outline-none font-bold text-slate-200"
        defaultValue="Platform V2.0 is officially live!"
      />

      <div className="flex items-center gap-2 bg-[#11131a] p-2 rounded-lg border border-slate-800">
        <span className="text-xs font-medium text-slate-400 px-2">Tags:</span>
        <span className="text-xs bg-slate-800 px-2 py-1 rounded flex items-center gap-1">
          <Tag className="w-3 h-3" /> Product Update
        </span>
        <button className="text-xs text-orange-400 hover:underline px-2">
          + Add Tag
        </button>
      </div>

      <textarea
        className="w-full h-64 bg-[#0a0b10] border border-slate-700 rounded-lg p-4 text-sm focus:border-orange-500 outline-none text-slate-300 resize-none custom-scrollbar"
        placeholder="Write your newsletter content here... (Markdown supported)"
        defaultValue="## Welcome to the new era! &#10;&#10;We are thrilled to announce..."
      ></textarea>
    </div>
  </div>
);

const PreferencesView = () => (
  <div className="max-w-2xl mx-auto py-4 animate-in fade-in duration-300">
    <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2 mb-2">
      <Settings className="text-emerald-400" /> Email Preferences
    </h2>
    <p className="text-sm text-slate-400 mb-8">
      Control what emails you receive and how often we contact you.
    </p>

    <div className="space-y-6">
      {/* Frequency Setting */}
      <div className="bg-[#0a0b10] p-5 rounded-xl border border-slate-800">
        <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Bell className="w-4 h-4 text-slate-400" /> Delivery Frequency
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {["As they happen", "Daily Digest", "Weekly Digest"].map(
            (freq, i) => (
              <label
                key={freq}
                className={`p-3 rounded-lg border cursor-pointer text-center text-sm transition-colors ${i === 2 ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400" : "bg-[#11131a] border-slate-800 text-slate-400 hover:border-slate-600"}`}
              >
                <input
                  type="radio"
                  name="freq"
                  className="hidden"
                  defaultChecked={i === 2}
                />
                {freq}
              </label>
            ),
          )}
        </div>
      </div>

      {/* Content Toggles */}
      <div className="bg-[#0a0b10] p-5 rounded-xl border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-slate-200 mb-2">
          Subscribed Content
        </h3>
        {[
          {
            title: "Critical Security Alerts",
            desc: "Mandatory updates about your account security.",
            locked: true,
          },
          {
            title: "Product Updates",
            desc: "New features and patch notes.",
            locked: false,
          },
          {
            title: "Marketing & Promos",
            desc: "Special offers and event invites.",
            locked: false,
          },
        ].map((item, i) => (
          <div key={i} className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-slate-200 flex items-center gap-2">
                {item.title}{" "}
                {item.locked && (
                  <AlertCircle className="w-3 h-3 text-red-400" />
                )}
              </p>
              <p className="text-xs text-slate-500">{item.desc}</p>
            </div>
            {/* Toggle Switch UI */}
            <div
              className={`w-10 h-5 rounded-full relative cursor-pointer ${item.locked ? "bg-emerald-500/50 opacity-50" : i === 1 ? "bg-emerald-500" : "bg-slate-700"}`}
            >
              <div
                className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${item.locked || i === 1 ? "right-1" : "left-1"}`}
              ></div>
            </div>
          </div>
        ))}
      </div>

      <button className="text-sm text-red-400 hover:text-red-300 font-medium px-2 py-1 mt-4 transition-colors">
        Unsubscribe from all marketing emails
      </button>
    </div>
  </div>
);
