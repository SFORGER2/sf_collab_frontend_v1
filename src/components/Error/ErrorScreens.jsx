import React, { useState, useEffect } from "react";
import {
  AlertTriangle,
  WifiOff,
  Database,
  Hourglass,
  KeyRound,
  SearchX,
  Home,
  ArrowLeft,
} from "lucide-react";

// ==========================================
// 1. REUSABLE ERROR COMPONENT (Split Layout)
// ==========================================

export const ErrorScreen = ({ type, onRetry, onSecondaryAction }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const errorConfigs = {
    validation: {
      code: "400",
      icon: AlertTriangle,
      accent: "from-orange-500 to-amber-500",
      textAccent: "text-orange-400",
      title: "Invalid Request",
      message:
        "The data provided didn't pass our validation checks. Please review the highlighted fields and try submitting again.",
      primaryText: "Review Inputs",
    },
    api: {
      code: "503",
      icon: WifiOff,
      accent: "from-blue-500 to-cyan-500",
      textAccent: "text-blue-400",
      title: "Connection Lost",
      message:
        "We are unable to reach the servers right now. This is usually a temporary network issue.",
      primaryText: "Try Again",
    },
    server: {
      code: "500",
      icon: Database,
      accent: "from-red-500 to-rose-600",
      textAccent: "text-rose-400",
      title: "System Failure",
      message:
        "An unexpected error occurred on our end. Our engineering team has automatically been notified of this issue.",
      primaryText: "Reload System",
    },
    timeout: {
      code: "408",
      icon: Hourglass,
      accent: "from-amber-400 to-orange-500",
      textAccent: "text-amber-400",
      title: "Request Timeout",
      message:
        "The server took too long to process your request. Please check your connection and try the operation again.",
      primaryText: "Retry Request",
    },
    unauthorized: {
      code: "401",
      icon: KeyRound,
      accent: "from-purple-500 to-fuchsia-500",
      textAccent: "text-fuchsia-400",
      title: "Access Denied",
      message:
        "Your secure session has expired or you lack the necessary permissions to view this content.",
      primaryText: "Authenticate",
    },
    download_missing: {
      code: "404",
      icon: SearchX,
      accent: "from-slate-400 to-slate-600",
      textAccent: "text-slate-300",
      title: "Asset Not Found",
      message:
        "The file or resource you are looking for has been moved, deleted, or never existed in the first place.",
      primaryText: "Return Home",
    },
  };

  const config = errorConfigs[type] || errorConfigs.server;
  const Icon = config.icon;

  return (
    <div className="w-full h-full min-h-[600px] flex flex-col md:flex-row bg-[#0a0b10] overflow-hidden rounded-3xl border border-slate-800 shadow-2xl relative">
      {/* Massive Background Text */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[25vw] md:text-[15vw] font-black text-white/[0.02] pointer-events-none select-none z-0">
        {config.code}
      </div>

      {/* Left Column: Visual/Art Direction */}
      <div className="w-full md:w-2/5 p-8 md:p-12 flex flex-col justify-center relative z-10 border-b md:border-b-0 md:border-r border-slate-800/50">
        <div
          className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${config.accent}`}
        ></div>

        <div className="relative mb-6">
          <div
            className={`absolute -inset-8 bg-gradient-to-br ${config.accent} opacity-10 blur-2xl rounded-full`}
          ></div>
          <div
            className={`w-20 h-20 md:w-28 md:h-28 rounded-2xl bg-[#11131a] border border-slate-700/50 flex items-center justify-center shadow-xl relative z-10 transform transition-all duration-700 ${mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
          >
            <Icon
              className={`w-10 h-10 md:w-14 md:h-14 ${config.textAccent}`}
              strokeWidth={1.5}
            />
          </div>
        </div>
      </div>

      {/* Right Column: Content & Actions */}
      <div className="w-full md:w-3/5 p-8 md:p-12 flex flex-col justify-center relative z-10 bg-[#0d0f17]">
        <div
          className={`transform transition-all duration-700 delay-150 ${mounted ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0"}`}
        >
          <h4
            className={`text-sm font-bold tracking-widest uppercase mb-3 ${config.textAccent}`}
          >
            Error {config.code}
          </h4>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
            {config.title}
          </h1>
          <p className="text-lg text-slate-400 mb-10 max-w-lg leading-relaxed">
            {config.message}
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={onRetry}
              className={`px-8 py-4 bg-gradient-to-r ${config.accent} text-white font-bold rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg flex items-center justify-center gap-2`}
            >
              {config.primaryText}
            </button>

            {onSecondaryAction && (
              <button
                onClick={onSecondaryAction}
                className="px-8 py-4 bg-[#11131a] border border-slate-700 text-slate-300 hover:text-white font-semibold rounded-xl transition-all hover:bg-slate-800 flex items-center justify-center gap-2"
              >
                {type === "download_missing" ? (
                  <ArrowLeft className="w-5 h-5" />
                ) : (
                  <Home className="w-5 h-5" />
                )}
                {type === "download_missing" ? "Go Back" : "Dashboard"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 2. MAIN APP DEMONSTRATION
// ==========================================

export default function App() {
  const [activeError, setActiveError] = useState("server");

  const errorTypes = [
    { id: "validation", label: "400 Validation" },
    { id: "unauthorized", label: "401 Auth" },
    { id: "download_missing", label: "404 Missing" },
    { id: "timeout", label: "408 Timeout" },
    { id: "server", label: "500 Server" },
    { id: "api", label: "503 API" },
  ];

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col p-4 md:p-8 font-sans selection:bg-slate-500/30">
      {/* Dev Controls */}
      <div className="w-full max-w-5xl mx-auto mb-6 p-4 bg-[#0a0b10] border border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-sm font-bold text-slate-300 uppercase tracking-widest pl-2">
          Error States
        </h1>
        <div className="flex flex-wrap gap-2">
          {errorTypes.map((error) => (
            <button
              key={error.id}
              onClick={() => setActiveError(error.id)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeError === error.id
                  ? "bg-slate-200 text-slate-900 shadow-md"
                  : "bg-transparent border border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`}
            >
              {error.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Display Area */}
      <div className="flex-1 w-full max-w-5xl mx-auto flex items-center justify-center">
        <ErrorScreen
          type={activeError}
          onRetry={() => alert(`Retrying action for: ${activeError}`)}
          onSecondaryAction={() => alert("Navigating away...")}
        />
      </div>
    </div>
  );
}
