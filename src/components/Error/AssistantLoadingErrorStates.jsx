import React, { useState } from "react";
import {
  Sparkles,
  WifiOff,
  Hourglass,
  Lock,
  BotOff,
  RefreshCcw,
  MessageSquareText,
  Send,
  Loader2,
} from "lucide-react";

// ==========================================
// 1. AI LOADING STATE (Thinking Animation)
// ==========================================
export const AILoadingState = () => {
  return (
    <div className="flex items-start gap-4 p-4 rounded-2xl bg-cyan-900/10 border border-cyan-800/30 w-full animate-in fade-in zoom-in-95 duration-300">
      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
        <Sparkles className="w-4 h-4 text-white animate-pulse" />
      </div>
      <div className="flex flex-col gap-2 pt-1.5 w-full">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-cyan-400">
            Assistant is thinking
          </span>
          <div className="flex gap-1">
            <span
              className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce"
              style={{ animationDelay: "0ms" }}
            ></span>
            <span
              className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce"
              style={{ animationDelay: "150ms" }}
            ></span>
            <span
              className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce"
              style={{ animationDelay: "300ms" }}
            ></span>
          </div>
        </div>
        <div className="space-y-2 mt-1">
          <div className="h-2 w-3/4 bg-slate-800 rounded animate-pulse"></div>
          <div className="h-2 w-1/2 bg-slate-800 rounded animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 2. AI ERROR STATES
// ==========================================
export const AIErrorState = ({ type, onRetry }) => {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetryClick = () => {
    setIsRetrying(true);
    setTimeout(() => {
      setIsRetrying(false);
      if (onRetry) onRetry();
    }, 1000);
  };

  const errorConfigs = {
    rate_limit: {
      icon: Hourglass,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
      title: "Rate Limit Exceeded",
      message:
        "You are sending messages too quickly. Please pause for a moment and try again.",
      canRetry: true,
    },
    network: {
      icon: WifiOff,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
      title: "Network Failure",
      message:
        "We lost connection to the assistant. Please check your internet connection.",
      canRetry: true,
    },
    unavailable: {
      icon: BotOff,
      color: "text-rose-400",
      bg: "bg-rose-500/10",
      border: "border-rose-500/20",
      title: "AI Service Unavailable",
      message:
        "The AI model is currently down or experiencing high latency. Our engineers are on it.",
      canRetry: true,
    },
    permission: {
      icon: Lock,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
      border: "border-purple-500/20",
      title: "Permission Denied",
      message:
        "You do not have the required clearance to use this specific assistant or model.",
      canRetry: false, // Permissions usually require external action, not a simple retry
    },
  };

  const config = errorConfigs[type] || errorConfigs.unavailable;
  const Icon = config.icon;

  return (
    <div
      className={`flex flex-col sm:flex-row items-start gap-4 p-5 rounded-2xl ${config.bg} border ${config.border} w-full animate-in fade-in slide-in-from-bottom-2 duration-300`}
    >
      <div
        className={`w-10 h-10 rounded-xl bg-[#0a0b10] border ${config.border} flex items-center justify-center shrink-0`}
      >
        <Icon className={`w-5 h-5 ${config.color}`} />
      </div>

      <div className="flex-1 pt-0.5">
        <h4 className={`text-sm font-bold ${config.color} mb-1`}>
          {config.title}
        </h4>
        <p className="text-sm text-slate-300 mb-4 leading-relaxed">
          {config.message}
        </p>

        {config.canRetry && (
          <button
            onClick={handleRetryClick}
            disabled={isRetrying}
            className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
              isRetrying
                ? "bg-[#0a0b10] text-slate-500 cursor-not-allowed"
                : "bg-[#0a0b10] hover:bg-[#11131a] text-slate-200 border border-slate-700/50 hover:border-slate-500"
            }`}
          >
            {isRetrying ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-cyan-500" />{" "}
                Retrying...
              </>
            ) : (
              <>
                <RefreshCcw className="w-4 h-4" /> Try Again
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

// ==========================================
// 3. ASSISTANT TEST BENCH
// ==========================================
export default function App() {
  const [assistantState, setAssistantState] = useState("thinking"); // 'thinking', 'rate_limit', 'network', 'unavailable', 'permission'

  const stateTypes = [
    { id: "thinking", label: "Thinking..." },
    { id: "rate_limit", label: "Rate Limit" },
    { id: "network", label: "Network Error" },
    { id: "unavailable", label: "AI Unavailable" },
    { id: "permission", label: "Permission Denied" },
  ];

  return (
    <div className="min-h-screen bg-[#050505] p-4 md:p-8 font-sans text-slate-200 flex flex-col items-center justify-center selection:bg-cyan-500/30">
      {/* Dev Controls */}
      <div className="w-full max-w-2xl mb-6 bg-[#0a0b10] border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-sm font-bold text-slate-400 uppercase tracking-widest pl-2">
          Force Assistant State:
        </h1>
        <div className="flex flex-wrap gap-2">
          {stateTypes.map((state) => (
            <button
              key={state.id}
              onClick={() => setAssistantState(state.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                assistantState === state.id
                  ? "bg-cyan-600 text-white shadow-md"
                  : "bg-transparent border border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`}
            >
              {state.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mock Chat Interface */}
      <div className="w-full max-w-2xl bg-[#0a0b10] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[500px]">
        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-[#11131a] flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-purple-500 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100">
              Vision AI Assistant
            </h2>
            <p className="text-xs text-slate-500">v4.0 Architecture</p>
          </div>
        </div>

        {/* Chat Stream Area */}
        <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-6">
          {/* User Message */}
          <div className="self-end max-w-[80%] bg-slate-800 text-slate-200 px-5 py-3 rounded-2xl rounded-tr-sm text-sm leading-relaxed">
            Can you help me generate a matchmaking algorithm based on these
            skills?
          </div>

          {/* Active State Component */}
          <div className="self-start w-full max-w-[90%]">
            {assistantState === "thinking" ? (
              <AILoadingState />
            ) : (
              <AIErrorState
                type={assistantState}
                onRetry={() =>
                  alert(
                    "Retry function triggered. It would re-fire the previous API call.",
                  )
                }
              />
            )}
          </div>
        </div>

        {/* Chat Input Bar (Inactive) */}
        <div className="p-4 bg-[#0a0b10] border-t border-slate-800">
          <div className="relative flex items-center">
            <MessageSquareText className="absolute left-4 w-5 h-5 text-slate-600" />
            <input
              disabled
              type="text"
              placeholder={
                assistantState === "thinking"
                  ? "Assistant is thinking..."
                  : "Message Vision AI..."
              }
              className="w-full bg-[#11131a] border border-slate-800 rounded-xl pl-12 pr-12 py-3.5 text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none opacity-60 cursor-not-allowed"
            />
            <button
              disabled
              className="absolute right-3 p-1.5 bg-slate-800 rounded-lg text-slate-500 cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
