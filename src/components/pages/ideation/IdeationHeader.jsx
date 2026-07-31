import React, { useState, useRef } from "react";
import {
  ChevronDown,
  Filter,
  Building2,
  Plus,
  X,
  TrendingUp,
  Clock,
  Heart,
  MessageSquare,
  Users,
  Zap,
  Lightbulb,
  Flame,
} from "lucide-react";
import { IoOptionsOutline } from "react-icons/io5";
import SearchBar from "../../sections/SearchBar";
import NewIdeaForm from "./NewIdeaForm";
import { Link } from "react-router-dom";

const IdeationHeader = ({
  searchQuery,
  setSearchQuery,
  selectedStage,
  setSelectedStage,
  selectedIndustry,
  setSelectedIndustry,
  sortBy,
  setSortBy,
  onCreateIdea,
  showNewIdeaForm,
  setShowNewIdeaForm, 
}) => {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const searchTimeoutRef = useRef(null);
  

  const stages = [
    "All Stages",
    "Idea Stage",
    "Concept Stage",
    "Development Stage",
    "Research Stage",
    "MVP Stage",
    "Growth Stage",
    "Scale Stage",
  ];

  const industries = [
    "All Industries",
    "Technology",
    "Healthcare",
    "Finance",
    "Education",
    "Retail",
    "Manufacturing",
    "Sustainability",
  ];

  const sortOptions = [
    // "Moving now" ranks by momentum — recent pull, team joins and discussion,
    // decayed by age. Distinct from "Trending", which the API scores its own
    // way, and from "Most Liked", which a year-old idea can still win.
    { value: "momentum", label: "Moving Now", icon: Flame },
    { value: "trending", label: "Trending", icon: TrendingUp },
    { value: "latest", label: "Latest", icon: Clock },
    { value: "popular", label: "Most Liked", icon: Heart },
    { value: "discussed", label: "Most Discussed", icon: MessageSquare },
  ];

  const toggleDropdown = (dropdownName, e) => {
    e?.stopPropagation?.();
    setActiveDropdown(activeDropdown === dropdownName ? null : dropdownName);
  };

  const FilterButton = ({
    icon,
    label,
    dropdownName,
    options = [],
    selected,
    onSelect,
    alignRight = false,
  }) => (
    <div className={`relative shrink-0 w-auto ${activeDropdown === dropdownName ? "z-[100]" : "z-10"}`}>
      <button
        onClick={(e) => toggleDropdown(dropdownName, e)}
        className={`flex items-center justify-between gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl transition-all duration-200 w-auto min-h-[40px] sm:min-h-[44px] border text-[0.82rem] sm:text-[0.88rem] font-medium shadow-sm whitespace-nowrap cursor-pointer ${
          selected
            ? "bg-amber-500/12 text-amber-400 border-amber-500/40 shadow-[0_0_12px_-2px_rgba(255,191,94,0.2)]"
            : "bg-white/[0.04] hover:bg-white/[0.06] text-star border-white/10 hover:border-white/20"
        }`}
      >
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {icon}
          <span className="text-[0.82rem] sm:text-[0.88rem] font-medium whitespace-nowrap">{selected || label}</span>
        </div>
        <ChevronDown className={`h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 transition-transform duration-200 ${activeDropdown === dropdownName ? "rotate-180 text-amber-400" : "text-dim/70"}`} />
      </button>

      {activeDropdown === dropdownName && (
        <div
          onClick={(e) => e.stopPropagation()}
          className={`absolute top-full mt-2 min-w-[200px] sm:w-56 bg-[#12141d] border border-white/20 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.95)] p-1.5 z-[9999] backdrop-blur-2xl max-h-[60vh] overflow-y-auto ${alignRight ? "right-0 left-auto" : "left-0"}`}
        >
          {options && options.length > 0 ? (
            options.map((option, index) => {
              const isSelected = selected === option || (!selected && typeof option === "string" && option.startsWith("All"));
              return (
                <button
                  key={index}
                  type="button"
                  className={`w-full text-left px-3.5 py-2.5 text-xs sm:text-[0.88rem] transition-colors flex items-center justify-between min-h-[40px] rounded-lg cursor-pointer ${
                    isSelected
                      ? "bg-amber-500/15 text-amber-400 font-medium"
                      : "text-gray-300 hover:bg-white/[0.08] hover:text-white"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(option);
                    setActiveDropdown(null);
                  }}
                >
                  <span className="truncate">{option}</span>
                </button>
              );
            })
          ) : (
            <div className="px-3.5 py-2.5 text-xs text-gray-400">No options available</div>
          )}
        </div>
      )}
    </div>
  );

  const SortButton = () => {
    const currentOption = sortOptions.find((opt) => opt.value === sortBy) || sortOptions[1];
    const CurrentIcon = currentOption.icon || TrendingUp;

    return (
      <div className={`relative shrink-0 w-auto ${activeDropdown === "sort" ? "z-[100]" : "z-10"}`}>
        <button
          onClick={(e) => toggleDropdown("sort", e)}
          className={`bg-white/[0.04] hover:bg-white/[0.06] flex items-center justify-between gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl transition-all duration-200 w-auto min-h-[40px] sm:min-h-[44px] border border-white/10 hover:border-white/20 text-[0.82rem] sm:text-[0.88rem] font-medium text-star shadow-sm whitespace-nowrap cursor-pointer ${
            activeDropdown === "sort" ? "border-amber-500/40 bg-amber-500/12 text-amber-400" : ""
          }`}
        >
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <CurrentIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-400 shrink-0" />
            <span className="text-[0.82rem] sm:text-[0.88rem] font-medium whitespace-nowrap">
              {currentOption.label}
            </span>
          </div>
          <ChevronDown className={`h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 transition-transform duration-200 ${activeDropdown === "sort" ? "rotate-180 text-amber-400" : "text-dim/70"}`} />
        </button>

        {activeDropdown === "sort" && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute top-full left-0 mt-2 min-w-[200px] sm:w-56 bg-[#12141d] border border-white/20 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.95)] p-1.5 z-[9999] backdrop-blur-2xl max-h-[60vh] overflow-y-auto"
          >
            {sortOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = sortBy === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  className={`w-full text-left px-3.5 py-2.5 text-xs sm:text-[0.88rem] transition-colors flex items-center justify-between min-h-[40px] rounded-lg cursor-pointer ${
                    isSelected
                      ? "bg-amber-500/15 text-amber-400 font-medium"
                      : "text-gray-300 hover:bg-white/[0.08] hover:text-white"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSortBy(option.value);
                    setActiveDropdown(null);
                  }}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`h-4 w-4 shrink-0 ${isSelected ? "text-amber-400" : "text-gray-400"}`} />
                    <span className="truncate">{option.label}</span>
                  </div>
                  {isSelected && <span className="text-amber-400 text-xs font-bold">✓</span>}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full p-4 px-2 space-y-4 relative">
      {/* Click outside backdrop for closing dropdowns */}
      {activeDropdown && (
        <div
          className="fixed inset-0 z-40 bg-transparent"
          onClick={() => setActiveDropdown(null)}
        />
      )}

      <div className="w-full flex flex-col items-center justify-center text-center mb-4">
        <h1 className="text-3xl sm:text-5xl lg:text-7xl font-bold mb-2 animate-slide-up text-center w-full">
          <span className="bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent text-center w-full">
            Explore Ideas
          </span>
        </h1>
        <div className="relative w-48 sm:w-80 h-0.5 mt-3 overflow-hidden rounded-full bg-gradient-to-r from-transparent via-blue-500/40 to-transparent">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-shimmer" />
        </div>
      </div>
        
      {/* Controls Section — 1 Line on Desktop (>=1024px) when space permits; 2 Lines on Mobile/Tablet (<1024px) */}
      <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-3 w-full">
        {/* Search Bar & Mobile/Tablet Create Button (Expands fully across available width) */}
        <div className="flex flex-row items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <div className="flex-1 min-w-0">
            <SearchBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              searchTimeoutRef={searchTimeoutRef}
            />
          </div>

          <Link
            to="/vision/new"
            className="lg:hidden create-idea shrink-0 flex items-center justify-center gap-1.5 sm:gap-2 rounded-xl transition-all duration-200 px-4 sm:px-6 py-3 min-h-[46px] sm:min-h-[48px] text-xs sm:text-sm font-semibold tracking-wide border border-gold/60 bg-gold/15 text-gold hover:bg-gold/25 hover:border-gold/80 shadow-md shadow-gold/10"
          >
            <Plus className="h-4 w-4 sm:h-4.5 sm:w-4.5 shrink-0 stroke-[2.5]" />
            <span className="whitespace-nowrap">Create a Vision</span>
          </Link>
        </div>

        {/* Filters Block (Trending, Stage, Industry as 1 unit) + Desktop Create Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full lg:w-auto min-w-0 relative z-30">
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3 w-full sm:w-auto relative z-30 overflow-visible">
            <SortButton />
            <FilterButton
              icon={<Filter className="h-3.5 w-3.5 text-blue-400 shrink-0" />}
              label="Stage"
              dropdownName="stages"
              options={stages}
              selected={selectedStage !== "All Stages" ? selectedStage : ""}
              onSelect={setSelectedStage}
            />
            <FilterButton
              icon={<Building2 className="h-3.5 w-3.5 text-purple-400 shrink-0" />}
              label="Industry"
              dropdownName="industries"
              options={industries}
              selected={
                selectedIndustry !== "All Industries" ? selectedIndustry : ""
              }
              onSelect={setSelectedIndustry}
              alignRight
            />
          </div>

          <Link
            to="/vision/new"
            className="hidden lg:flex create-idea shrink-0 items-center justify-center gap-2 rounded-xl transition-all duration-200 px-6 lg:px-7 py-3 min-h-[48px] text-base font-semibold tracking-wide border border-gold/60 bg-gold/15 text-gold hover:bg-gold/25 hover:border-gold/80 shadow-md shadow-gold/10"
          >
            <Plus className="h-4.5 w-4.5 shrink-0 stroke-[2.5]" />
            <span className="whitespace-nowrap">Create a Vision</span>
          </Link>
        </div>
      </div>

      {false && showNewIdeaForm && <NewIdeaForm
        onClose={() => setShowNewIdeaForm(false)}
        onCreateIdea={onCreateIdea}
        industries={industries}
        stages={stages}
      />}
    </div>
  );
};

export default IdeationHeader;
