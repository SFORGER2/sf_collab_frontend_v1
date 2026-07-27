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

  const toggleDropdown = (dropdownName) => {
    setActiveDropdown(activeDropdown === dropdownName ? null : dropdownName);
  };



  const FilterButton = ({
    icon,
    label,
    dropdownName,
    options,
    selected,
    onSelect,
  }) => (
    <div className="relative">
      <button
        onClick={() => toggleDropdown(dropdownName)}
        className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-200 w-full sm:w-auto border border-white/10 hover:border-white/20"
      >
        {icon}
        <span className="text-sm font-medium">{selected || label}</span>
        <ChevronDown className="h-4 w-4 opacity-60" />
      </button>

      {activeDropdown === dropdownName && (
        <div className="absolute top-full left-0 mt-2 w-48 bg-[#1A1A1A] border border-white/20 rounded-xl shadow-2xl py-2 z-50 backdrop-blur-sm">
          {options.map((option, index) => (
            <button
              key={index}
              className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
              onClick={() => {
                onSelect(option);
                setActiveDropdown(null);
              }}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  const SortButton = () => (
    <div className="relative">
      <button
        onClick={() => toggleDropdown("sort")}
        className=" bg-[#1A1A1A] flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-200 w-full sm:w-auto border border-white/20"
      >
        <TrendingUp className="h-4 w-4" />
        <span className="text-sm font-medium">
          {sortOptions.find((opt) => opt.value === sortBy)?.label || "Sort"}
        </span>
        <ChevronDown className="h-4 w-4 opacity-60" />
      </button>

      {activeDropdown === "sort" && (
        <div className="absolute top-full left-0 mt-2 w-52 bg-[#1A1A1A] border border-white/20 rounded-xl shadow-2xl py-2 z-50 backdrop-blur-sm">
          {sortOptions.map((option) => (
            <button
              key={option.value}
              className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors flex items-center gap-2"
              onClick={() => {
                setSortBy(option.value);
                setActiveDropdown(null);
              }}
            >
              <option.icon className="h-4 w-4" />
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );



  return (
    <div className="w-full p-4 px-2 space-y-4">

            <div className="w-full flex justify-center items-center flex-col mb-2">
              <h1 className="text-5xl  sm:text-6xl lg:text-7xl font-bold mb-8 animate-slide-up text-center w-full">
                <span className="bg-linear-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent text-center w-full">
                  Explore Ideas
                </span>
                <br />
                
        </h1>
      <div className=" relative inline-block w-full">
                  <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-90 h-px bg-linear-to-r from-transparent via-blue-500 to-transparent animate-shimmer" />
                </div>
      </div>
        
        {/* Controls Section */}
      <div
        className={`${
          isMobileMenuOpen ? "flex" : "hidden"
        } sm:flex flex-col justify-between sm:flex-row gap-3 w-full`}
      >
        <div className="">
          <SearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            searchTimeoutRef={searchTimeoutRef}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <SortButton />
          <FilterButton
            icon={<Filter className="h-4 w-4" />}
            label="Stage"
            dropdownName="stages"
            options={stages}
            selected={selectedStage !== "All Stages" ? selectedStage : ""}
            onSelect={setSelectedStage}
          />
          <FilterButton
            icon={<Building2 className="h-4 w-4" />}
            label="Industry"
            dropdownName="industries"
            options={industries}
            selected={
              selectedIndustry !== "All Industries" ? selectedIndustry : ""
            }
            onSelect={setSelectedIndustry}
          />
          {/* Was a modal "Post an Idea" form. Visions are what this ecosystem
              actually creates — structured, with roles, a banner and a roadmap —
              so this now goes to the Vision creator instead of a cut-down
              duplicate that produced half a Vision. */}
          <Link
            to="/vision/new"
            className="create-idea flex items-center justify-center gap-2 rounded-xl transition-all duration-200 w-full px-4 py-2.5 sm:w-auto text-sm font-medium border border-gold/45 bg-gold/10 text-gold hover:bg-gold/20 hover:border-gold/70"
          >
            <Plus className="h-4 w-4" />
            <span>Create a Vision</span>
          </Link>
        </div>
      </div>

      {/* The old cut-down "new idea" modal produced half a Vision — no banner,
          no roles, no roadmap — and then people had to redo it properly. It is
          disabled rather than deleted so nothing that still references
          `showNewIdeaForm` breaks; delete both once no caller sets it. */}
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
