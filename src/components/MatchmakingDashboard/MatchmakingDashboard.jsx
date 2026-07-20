import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  Inbox,
  UserPlus,
  X,
  Zap,
  Code,
  Star,
  Briefcase,
  MapPin,
  Loader2,
} from "lucide-react";

// ==========================================
// 1. MODULAR COMPONENTS (Highly Reusable)
// ==========================================

export const ScoreBadge = ({ score }) => {
  let colorClass = "bg-slate-800 text-slate-400 border-slate-700";
  if (score >= 90)
    colorClass = "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
  else if (score >= 75)
    colorClass = "bg-amber-500/10 text-amber-400 border-amber-500/30";
  else if (score >= 50)
    colorClass = "bg-orange-500/10 text-orange-400 border-orange-500/30";

  return (
    <div
      className={`px-2.5 py-1 rounded-full border text-xs font-bold flex items-center gap-1.5 ${colorClass}`}
    >
      <Zap className="w-3 h-3" />
      {score}% Match
    </div>
  );
};

export const ExplanationList = ({ explanations }) => {
  if (!explanations || explanations.length === 0) return null;

  return (
    <ul className="space-y-2.5 mt-4 pt-4 border-t border-slate-800/50">
      {explanations.map((exp, index) => (
        <li
          key={index}
          className="flex items-start gap-2 text-sm text-slate-400"
        >
          <CheckCircle className="w-4 h-4 text-cyan-500 shrink-0 mt-0.5" />
          <span>{exp}</span>
        </li>
      ))}
    </ul>
  );
};

export const LoadingSkeleton = ({ count = 3 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className="bg-[#11131a] border border-slate-800 rounded-2xl p-6 animate-pulse"
      >
        <div className="flex justify-between items-start mb-6">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-full bg-slate-800"></div>
            <div className="space-y-2">
              <div className="w-32 h-4 bg-slate-800 rounded"></div>
              <div className="w-20 h-3 bg-slate-800 rounded"></div>
            </div>
          </div>
          <div className="w-20 h-6 bg-slate-800 rounded-full"></div>
        </div>
        <div className="space-y-3 mb-6">
          <div className="w-full h-3 bg-slate-800 rounded"></div>
          <div className="w-5/6 h-3 bg-slate-800 rounded"></div>
          <div className="w-4/5 h-3 bg-slate-800 rounded"></div>
        </div>
        <div className="flex gap-3 mt-auto">
          <div className="flex-1 h-10 bg-slate-800 rounded-xl"></div>
          <div className="w-10 h-10 bg-slate-800 rounded-xl"></div>
        </div>
      </div>
    ))}
  </div>
);

export const EmptyState = ({ title, description, actionText, onAction }) => (
  <div className="w-full bg-[#11131a] border border-slate-800 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center text-center">
    <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
      <Inbox className="w-8 h-8 text-slate-500" />
    </div>
    <h3 className="text-xl font-bold text-slate-200 mb-2">{title}</h3>
    <p className="text-slate-400 max-w-md mb-6">{description}</p>
    {actionText && onAction && (
      <button
        onClick={onAction}
        className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-xl transition-colors"
      >
        {actionText}
      </button>
    )}
  </div>
);

export const MatchCard = ({ match, onConnect, onDismiss }) => {
  return (
    <div className="bg-[#11131a] border border-slate-800 hover:border-cyan-500/30 rounded-2xl p-6 transition-all duration-300 flex flex-col h-full group hover:shadow-[0_0_20px_rgba(6,182,212,0.05)]">
      <div className="flex justify-between items-start mb-4">
        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-500 to-purple-500 p-0.5 shrink-0">
            <div className="w-full h-full bg-[#0a0b10] rounded-full overflow-hidden">
              <img
                src={match.avatarUrl}
                alt={match.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div>
            <h4 className="font-bold text-slate-100 text-lg leading-tight group-hover:text-cyan-400 transition-colors">
              {match.name}
            </h4>
            <p className="text-sm text-slate-400 mt-0.5">{match.role}</p>
          </div>
        </div>
        <ScoreBadge score={match.score} />
      </div>

      <div className="flex flex-wrap gap-2 mb-2">
        {match.skills.map((skill) => (
          <span
            key={skill}
            className="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md flex items-center gap-1.5"
          >
            <Code className="w-3 h-3 text-cyan-400" /> {skill}
          </span>
        ))}
      </div>

      <ExplanationList explanations={match.matchReasons} />

      <div className="mt-auto pt-6 flex gap-3">
        <button
          onClick={() => onConnect(match.id)}
          className="flex-1 py-2.5 bg-cyan-600/10 hover:bg-cyan-600 border border-cyan-500/20 hover:border-cyan-500 text-cyan-400 hover:text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
        >
          <UserPlus className="w-4 h-4" /> Connect
        </button>
        <button
          onClick={() => onDismiss(match.id)}
          className="w-11 h-11 flex items-center justify-center bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-red-400 rounded-xl transition-colors"
          aria-label="Dismiss match"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export const MatchmakingSection = ({
  title,
  description,
  matches,
  isLoading,
  onConnect,
  onDismiss,
  onRefresh,
}) => {
  return (
    <section className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Star className="w-6 h-6 text-amber-400" /> {title}
          </h2>
          {description && (
            <p className="text-slate-400 mt-1 text-sm">{description}</p>
          )}
        </div>
        {matches.length > 0 && !isLoading && (
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-800/50 px-3 py-1.5 rounded-lg">
            {matches.length} Results
          </span>
        )}
      </div>

      {isLoading ? (
        <LoadingSkeleton count={3} />
      ) : matches.length === 0 ? (
        <EmptyState
          title="No pending matches"
          description="We couldn't find any new matches right now. Adjust your preferences or check back later as new users join."
          actionText="Refresh Matches"
          onAction={onRefresh}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matches.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              onConnect={onConnect}
              onDismiss={onDismiss}
            />
          ))}
        </div>
      )}
    </section>
  );
};

// ==========================================
// 2. MAIN APP DEMONSTRATION
// ==========================================

export default function App() {
  const [matches, setMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [demoState, setDemoState] = useState("loading");

  const mockMatches = [
    {
      id: 1,
      name: "Alex Rivera",
      role: "Senior Frontend Developer",
      avatarUrl: "https://i.pravatar.cc/150?u=alex",
      score: 98,
      skills: ["React", "TypeScript", "Tailwind"],
      matchReasons: [
        "Uses your exact tech stack",
        "Similar timezone (EST)",
        "Looking for a UX Designer",
      ],
    },
    {
      id: 2,
      name: "Samira Chen",
      role: "Fullstack Engineer",
      avatarUrl: "https://i.pravatar.cc/150?u=samira",
      score: 82,
      skills: ["Node.js", "Vue", "AWS"],
      matchReasons: [
        "Highly complementary skills",
        "Similar project interests",
        "Mutual connections in 'SF Devs'",
      ],
    },
    {
      id: 3,
      name: "Marcus Johnson",
      role: "UI/UX Designer",
      avatarUrl: "https://i.pravatar.cc/150?u=marcus",
      score: 65,
      skills: ["Figma", "Design Systems"],
      matchReasons: [
        "Shared industry (Fintech)",
        "Open to collaborative side-projects",
      ],
    },
  ];

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
      setMatches(demoState === "data" ? mockMatches : []);
    }, 1500);
    return () => clearTimeout(timer);
  }, [demoState]);

  const handleConnect = (id) => {
    alert(`Connection request sent to user ${id}!`);
    setMatches(matches.filter((m) => m.id !== id));
  };

  const handleDismiss = (id) => {
    setMatches(matches.filter((m) => m.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#0a0b10] p-4 md:p-12 font-sans selection:bg-cyan-500/30">
      <div className="max-w-6xl mx-auto mb-10 p-4 bg-slate-900 border border-slate-700 rounded-xl flex flex-wrap items-center gap-4 text-sm">
        <span className="text-slate-400 font-bold uppercase tracking-wider text-xs">
          Simulate State:
        </span>
        <button
          onClick={() => setDemoState("loading")}
          className={`px-4 py-1.5 rounded-lg transition-colors ${demoState === "loading" ? "bg-cyan-600 text-white" : "bg-slate-800 text-slate-300"}`}
        >
          Loading UI
        </button>
        <button
          onClick={() => setDemoState("data")}
          className={`px-4 py-1.5 rounded-lg transition-colors ${demoState === "data" ? "bg-cyan-600 text-white" : "bg-slate-800 text-slate-300"}`}
        >
          Loaded Data UI
        </button>
        <button
          onClick={() => setDemoState("empty")}
          className={`px-4 py-1.5 rounded-lg transition-colors ${demoState === "empty" ? "bg-cyan-600 text-white" : "bg-slate-800 text-slate-300"}`}
        >
          Empty State UI
        </button>
      </div>

      <div className="max-w-6xl mx-auto">
        <MatchmakingSection
          title="Recommended Co-Founders"
          description="Based on your skills, timezone, and project interests."
          matches={matches}
          isLoading={isLoading}
          onConnect={handleConnect}
          onDismiss={handleDismiss}
          onRefresh={() => setDemoState("data")}
        />
      </div>
    </div>
  );
}
