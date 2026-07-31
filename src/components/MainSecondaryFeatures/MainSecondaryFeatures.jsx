import React, { useState, useEffect } from "react";

// --- MOCK DATA ---
const MAIN_FEATURES = [
  {
    id: "dashboard",
    name: "Dashboard",
    desc: "Core telemetry overview and system health metrics.",
    icon: "Dashboard",
  },
  {
    id: "messaging",
    name: "Messaging",
    desc: "Encrypted peer-to-peer and team communication channels.",
    icon: "Message",
  },
  {
    id: "vision",
    name: "Vision Workspace",
    desc: "Collaborative node mapping and architectural planning.",
    icon: "Eye",
  },
  {
    id: "meet",
    name: "SF Meet",
    desc: "High-definition synchronous video conferencing protocol.",
    icon: "Video",
  },
  {
    id: "ai",
    name: "AI Assistant",
    desc: "System Intelligence for query resolution and automation.",
    icon: "Brain",
  },
  {
    id: "notifications",
    name: "Notifications",
    desc: "Global event routing and alert distribution system.",
    icon: "Bell",
  },
];

const SECONDARY_FEATURES = [
  {
    id: "lottery",
    name: "Lottery",
    desc: "Weekly randomized network credit distribution pools.",
    icon: "Ticket",
    badge: null,
    defaultState: false,
  },
  {
    id: "jackpot",
    name: "Jackpot",
    desc: "High-yield accumulated reward sector for active nodes.",
    icon: "Coin",
    badge: "New",
    defaultState: false,
  },
  {
    id: "draws",
    name: "Draws",
    desc: "Participate in exclusive hardware and protocol lotteries.",
    icon: "Gift",
    badge: null,
    defaultState: true,
  },
  {
    id: "anim_icons",
    name: "Animated Icons",
    desc: "Enable dynamic vector rendering for interface elements.",
    icon: "Sparkle",
    badge: null,
    defaultState: true,
  },
  {
    id: "anim_bg",
    name: "Animated Backgrounds",
    desc: "Render deep-space telemetry particles in the backdrop.",
    icon: "Layers",
    badge: "Beta",
    defaultState: false,
  },
  {
    id: "themes",
    name: "Custom Themes",
    desc: "Override default UI parameters with personalized colorways.",
    icon: "Palette",
    badge: null,
    defaultState: true,
  },
  {
    id: "skins",
    name: "Skins",
    desc: "Apply specialized visual wrappers to your Vision Workspace.",
    icon: "Brush",
    badge: "Coming Soon",
    defaultState: false,
    disabled: true,
  },
];

// --- INLINE SVG ICONS ---
const Icons = {
  Dashboard: () => (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
      />
    </svg>
  ),
  Message: () => (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
      />
    </svg>
  ),
  Eye: () => (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
      />
    </svg>
  ),
  Video: () => (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
      />
    </svg>
  ),
  Brain: () => (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
      />
    </svg>
  ),
  Bell: () => (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
      />
    </svg>
  ),
  Ticket: () => (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
      />
    </svg>
  ),
  Coin: () => (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  Gift: () => (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
      />
    </svg>
  ),
  Sparkle: () => (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
      />
    </svg>
  ),
  Layers: () => (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
      />
    </svg>
  ),
  Palette: () => (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
      />
    </svg>
  ),
  Brush: () => (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
      />
    </svg>
  ),
  Check: () => (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 13l4 4L19 7"
      />
    </svg>
  ),
  X: () => (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  ),
  Spinner: () => (
    <svg
      className="w-4 h-4 animate-spin text-white"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  ),
  Lock: () => (
    <svg
      className="w-3.5 h-3.5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
      />
    </svg>
  ),
};

export default function FeaturesSettings() {
  // --- STATE MANAGEMENT ---

  // Track enabled/disabled status of secondary features
  const [featureStates, setFeatureStates] = useState(
    SECONDARY_FEATURES.reduce((acc, feature) => {
      acc[feature.id] = feature.defaultState;
      return acc;
    }, {}),
  );

  // Track which features are currently processing (loading)
  const [loadingFeatures, setLoadingFeatures] = useState({});

  // Global toasts
  const [toast, setToast] = useState(null);

  // Demo tool: Force error mode to demonstrate error handling
  const [forceErrorMode, setForceErrorMode] = useState(false);

  // Handles Toast Lifecycle
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  /**
   * --- ARCHITECTURE NOTE: DYNAMIC & LAZY LOADING ---
   * In a real application, `featureStates` would ideally be mapped to a global
   * Context (e.g., `FeaturesContext`) or state management tool (Redux, Zustand).
   *
   * When a feature toggle changes here, it updates the global store.
   * Other components (Sidebar, AppCenter, Routes) listen to this store:
   *
   * // App.jsx Route Example:
   * {isFeatureEnabled('lottery') && (
   *   <Route path="/lottery" element={
   *     <Suspense fallback={<Loading />}>
   *       <LazyLotteryComponent />
   *     </Suspense>
   *   } />
   * )}
   */

  // --- TOGGLE HANDLER ---
  const handleToggle = async (featureId, featureName) => {
    const currentState = featureStates[featureId];
    const newState = !currentState;

    // 1. Set loading state to prevent multiple clicks
    setLoadingFeatures((prev) => ({ ...prev, [featureId]: true }));

    try {
      // Simulate Backend API Call Delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Simulate Error if Force Error Mode is ON
      if (forceErrorMode) {
        throw new Error("Simulated Backend Rejection");
      }

      // 2. On Success: Update local state to trigger dynamic interface updates
      setFeatureStates((prev) => ({ ...prev, [featureId]: newState }));
      showToast(
        `${featureName} module successfully ${newState ? "enabled" : "disabled"}.`,
        "success",
      );
    } catch (error) {
      // 3. On Error: Leave toggle in original state (pessimistic) and alert user
      showToast(
        `Protocol sync failed: Unable to update ${featureName}.`,
        "error",
      );
    } finally {
      // 4. Remove loading state
      setLoadingFeatures((prev) => ({ ...prev, [featureId]: false }));
    }
  };

  return (
    <div className="min-h-screen bg-[#090A10] text-slate-200 font-sans pb-16">
      {/* TOAST NOTIFICATION */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl transition-all animate-fade-in border ${
            toast.type === "success"
              ? "bg-[#131524] border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.15)] text-white"
              : "bg-[#1A1016] border-rose-500/50 shadow-[0_0_30px_rgba(244,63,94,0.15)] text-white"
          }`}
        >
          <div
            className={`w-2 h-2 rounded-full animate-ping ${toast.type === "success" ? "bg-emerald-400" : "bg-rose-400"}`}
          />
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      {/* TOP NAVBAR / DEMO CONTROLS */}
      <header className="border-b border-slate-800/80 bg-[#0E101A]/90 backdrop-blur sticky top-0 z-40 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-cyan-500 flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(139,92,246,0.4)]">
            SF
          </div>
          <span className="font-bold tracking-wider text-white text-lg">
            SFCollab{" "}
            <span className="text-xs text-purple-400 font-mono ml-1 px-1.5 py-0.5 bg-purple-950/60 border border-purple-800/50 rounded">
              CORE V1.0
            </span>
          </span>
        </div>

        {/* TESTING CONTROL BAR */}
        <div className="flex items-center gap-4 bg-[#141726] border border-slate-700/60 px-4 py-2 rounded-full text-xs">
          <span className="text-slate-400 font-mono">DEMO CONTROLS:</span>

          <label className="flex items-center gap-2 cursor-pointer border-l border-slate-700 pl-4">
            <span
              className={forceErrorMode ? "text-rose-400" : "text-slate-400"}
            >
              Force API Errors
            </span>
            <div
              className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors ${forceErrorMode ? "bg-rose-600" : "bg-slate-700"}`}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={forceErrorMode}
                onChange={() => setForceErrorMode(!forceErrorMode)}
              />
              <span
                className={`inline-block h-3 w-3 transform rounded-full bg-white transition ${forceErrorMode ? "translate-x-3.5" : "translate-x-0.5"}`}
              />
            </div>
          </label>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        {/* PAGE HEADER */}
        <div className="mb-10">
          <div className="flex items-center gap-2 text-purple-400 text-xs font-mono tracking-widest uppercase mb-2">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
            System Configuration
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Features & Modules
          </h1>
          <p className="text-slate-400 text-sm mt-2 max-w-2xl">
            Manage your operational toolset. Core architectural modules are
            locked for stability, while auxiliary modules can be lazy-loaded on
            demand to optimize performance.
          </p>
        </div>

        {/* --- SECTION 1: MAIN FEATURES --- */}
        <div className="mb-14">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
            <h2 className="text-xl font-bold text-white">Main Features</h2>
            <span className="text-xs font-mono text-slate-500 uppercase">
              Core Architecture
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {MAIN_FEATURES.map((feature) => {
              const IconComponent = Icons[feature.icon];
              return (
                <div
                  key={feature.id}
                  className="bg-[#141726] border border-slate-800/80 rounded-xl p-5 hover:border-slate-700 transition relative overflow-hidden group"
                >
                  {/* Subtle Background Glow */}
                  <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-cyan-900/10 rounded-full blur-2xl group-hover:bg-cyan-600/10 transition-colors pointer-events-none" />

                  <div className="flex items-start justify-between mb-3 relative z-10">
                    <div className="p-2.5 bg-[#0B0D17] border border-slate-700/50 rounded-lg text-cyan-400">
                      <IconComponent />
                    </div>
                    {/* Always Enabled Badge */}
                    <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-wide font-bold">
                      <Icons.Lock /> Enabled
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-white mb-1.5 relative z-10">
                    {feature.name}
                  </h3>
                  <p className="text-sm text-slate-400 relative z-10 leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* --- SECTION 2: SECONDARY FEATURES --- */}
        <div>
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
            <h2 className="text-xl font-bold text-white">Secondary Features</h2>
            <span className="text-xs font-mono text-slate-500 uppercase">
              Optional Modules
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {SECONDARY_FEATURES.map((feature) => {
              const IconComponent = Icons[feature.icon];
              const isEnabled = featureStates[feature.id];
              const isLoading = loadingFeatures[feature.id];
              const isDisabled = feature.disabled || isLoading;

              return (
                <div
                  key={feature.id}
                  className={`bg-[#141726] border rounded-xl p-5 transition relative overflow-hidden group flex flex-col justify-between ${
                    isEnabled
                      ? "border-purple-500/40 shadow-[0_0_20px_rgba(139,92,246,0.05)]"
                      : "border-slate-800/80"
                  } ${feature.disabled ? "opacity-60" : ""}`}
                >
                  <div>
                    <div className="flex items-start justify-between mb-3">
                      <div
                        className={`p-2.5 rounded-lg transition-colors ${
                          isEnabled
                            ? "bg-gradient-to-br from-purple-600/20 to-indigo-600/20 text-purple-400 border border-purple-500/30"
                            : "bg-[#0B0D17] border border-slate-700/50 text-slate-400"
                        }`}
                      >
                        <IconComponent />
                      </div>

                      {/* Custom Toggle Switch */}
                      <button
                        onClick={() =>
                          !isDisabled && handleToggle(feature.id, feature.name)
                        }
                        disabled={isDisabled}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full border-2 border-transparent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0D17] ${
                          isDisabled ? "cursor-not-allowed opacity-70" : ""
                        } ${isEnabled ? "bg-purple-600" : "bg-slate-700"}`}
                        aria-checked={isEnabled}
                        role="switch"
                      >
                        <span className="sr-only">Toggle {feature.name}</span>
                        <span
                          aria-hidden="true"
                          className={`pointer-events-none flex h-5 w-5 transform items-center justify-center rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            isEnabled ? "translate-x-5" : "translate-x-0"
                          }`}
                        >
                          {/* Inner Thumb Icon based on State */}
                          {isLoading ? (
                            <Icons.Spinner />
                          ) : isEnabled ? (
                            <div className="text-purple-600 scale-[0.6]">
                              <Icons.Check />
                            </div>
                          ) : (
                            <div className="text-slate-400 scale-[0.6]">
                              <Icons.X />
                            </div>
                          )}
                        </span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2 mb-1.5">
                      <h3 className="text-base font-bold text-white">
                        {feature.name}
                      </h3>

                      {/* Optional Badges (Beta, New, Coming Soon) */}
                      {feature.badge && (
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wide font-bold ${
                            feature.badge === "New"
                              ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                              : feature.badge === "Beta"
                                ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                                : "bg-slate-700/50 text-slate-400 border border-slate-600"
                          }`}
                        >
                          {feature.badge}
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-slate-400 leading-relaxed">
                      {feature.desc}
                    </p>
                  </div>

                  {/* Status Text (Optional contextual feedback) */}
                  <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between">
                    <span
                      className={`text-xs font-mono transition-colors ${isEnabled ? "text-purple-400" : "text-slate-500"}`}
                    >
                      {isEnabled ? "MODULE LOADED" : "MODULE OFFLINE"}
                    </span>
                    {isLoading && (
                      <span className="text-[10px] uppercase font-mono text-slate-400 flex items-center gap-1 animate-pulse">
                        Syncing <Icons.Spinner />
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
