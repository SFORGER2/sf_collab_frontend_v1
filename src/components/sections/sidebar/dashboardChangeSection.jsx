import React, { useState, useEffect } from "react";
import { Layers, ChevronDown, Check } from "lucide-react";


// Role icons mapping
const ROLE_ICONS = {
  founder: "🚀",
  builder: "🔧",
  investor: "💰",
  influencer: "📣",
  admin: "👑",
};

// Role colors mapping
const ROLE_COLORS = {
  founder: {
    bg: "from-purple-600 to-indigo-600",
    border: "border-purple-500/30",
    text: "text-purple-300",
    activeBg: "bg-purple-500/20",
    hoverBg: "hover:bg-purple-500/10",
  },
  builder: {
    bg: "from-emerald-600 to-teal-600",
    border: "border-emerald-500/30",
    text: "text-emerald-300",
    activeBg: "bg-emerald-500/20",
    hoverBg: "hover:bg-emerald-500/10",
  },
  investor: {
    bg: "from-blue-600 to-cyan-600",
    border: "border-blue-500/30",
    text: "text-blue-300",
    activeBg: "bg-blue-500/20",
    hoverBg: "hover:bg-blue-500/10",
  },
  influencer: {
    bg: "from-pink-600 to-rose-600",
    border: "border-pink-500/30",
    text: "text-pink-300",
    activeBg: "bg-pink-500/20",
    hoverBg: "hover:bg-pink-500/10",
  },
  admin: {
    bg: "from-amber-600 to-orange-600",
    border: "border-amber-500/30",
    text: "text-amber-300",
    activeBg: "bg-amber-500/20",
    hoverBg: "hover:bg-amber-500/10",
  },
};

export default function DashboardChangeSection({
  sections = [],
  onSectionChange,
  activeRole,
}) {
  const [activeSection, setActiveSection] = useState(
    activeRole || (sections.length > 0 ? sections[0].id : null)
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    if (activeRole) {
      setActiveSection(activeRole);
    }
  }, [activeRole]);

  const handleSectionChange = (sectionId) => {
    setActiveSection(sectionId);
    onSectionChange?.(sectionId);
    setIsDropdownOpen(false);
  };

  const activeRoleData = sections.find((s) => s.id === activeSection);
  const activeColors = ROLE_COLORS[activeSection] || ROLE_COLORS.founder;

  // Don't render if only one role
  if (sections.length <= 1) return null;

  return (
    <div className="relative z-50">
      {/* Desktop View - Horizontal Pills */}
      <div className="hidden sm:flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-sm">
        <div className="flex items-center gap-2 pr-4 border-r border-white/10">
          <Layers className="w-5 h-5 text-white/50" />
          <span className="text-sm font-medium text-white/70">Dashboard</span>
        </div>

        <div className="flex items-center gap-2">
          {sections.map((section) => {
            const isActive = activeSection === section.id;
            const colors = ROLE_COLORS[section.id] || ROLE_COLORS.founder;
            const icon = ROLE_ICONS[section.id] || "📊";

            return (
              <button
                key={section.id}
                onClick={() => handleSectionChange(section.id)}
                className={`group relative flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-300 ${
                  isActive
                    ? `${colors.activeBg} ${colors.border} border ${colors.text} shadow-lg`
                    : `bg-white/5 border border-white/10 text-white/60 ${colors.hoverBg} hover:text-white hover:border-white/20`
                }`}
              >
                {/* Active indicator dot */}
                {isActive && (
                  <span
                    className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-gradient-to-r ${colors.bg} animate-pulse`}
                  />
                )}

                <span className="text-base">{icon}</span>
                <span className="text-sm">
                  {section.label || section.name}
                </span>

                {/* Hover gradient effect */}
                <div
                  className={`absolute inset-0 rounded-xl bg-gradient-to-r ${colors.bg} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile View - Dropdown */}
      <div className="sm:hidden">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl ${activeColors.activeBg} border ${activeColors.border} transition-all`}
        >
          <div className="flex items-center gap-3">
            <span className="text-lg">
              {ROLE_ICONS[activeSection] || "📊"}
            </span>
            <div className="text-left">
              <p className="text-xs text-white/50">Active Dashboard</p>
              <p className={`text-sm font-semibold ${activeColors.text}`}>
                {activeRoleData?.label || activeRoleData?.name || "Dashboard"}
              </p>
            </div>
          </div>
          <ChevronDown
            className={`w-5 h-5 text-white/50 transition-transform ${
              isDropdownOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsDropdownOpen(false)}
            />

            {/* Menu */}
            <div className="absolute top-full left-0 right-0 mt-2 p-2 rounded-xl bg-zinc-900/95 border border-white/10 backdrop-blur-xl shadow-xl z-50">
              <p className="px-3 py-2 text-xs font-medium text-white/40 uppercase tracking-wider">
                Select Dashboard
              </p>
              {sections.map((section) => {
                const isActive = activeSection === section.id;
                const colors = ROLE_COLORS[section.id] || ROLE_COLORS.founder;
                const icon = ROLE_ICONS[section.id] || "📊";

                return (
                  <button
                    key={section.id}
                    onClick={() => handleSectionChange(section.id)}
                    className={`w-full flex items-center justify-between gap-3 px-3 py-3 rounded-lg transition-all ${
                      isActive
                        ? `${colors.activeBg} ${colors.text}`
                        : "text-white/70 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{icon}</span>
                      <span className="text-sm font-medium">
                        {section.label || section.name}
                      </span>
                    </div>
                    {isActive && <Check className="w-4 h-4" />}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Role Description (optional) */}
      <div className="mt-3 px-1">
        <p className="text-xs text-white/40">
          {activeSection === "founder" &&
            "Manage startups, teams, and fundraising"}
          {activeSection === "builder" &&
            "Find tasks, earn rewards, build your portfolio"}
          {activeSection === "investor" &&
            "Track investments, analyze startups, manage portfolio"}
          {activeSection === "influencer" &&
            "Run campaigns, track performance, grow your influence"}
        </p>
      </div>
    </div>
  );
}