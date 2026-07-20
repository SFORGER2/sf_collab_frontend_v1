import React, { useState } from "react";
import { Search, Building2, MapPin, Filter, Menu, X } from "lucide-react";
import { IoOptionsOutline } from "react-icons/io5";

const StartUpHeader = ({
  searchQuery,
  setSearchQuery,
  selectedIndustry,
  setSelectedIndustry,
  selectedStage,
  setSelectedStage,
  selectedLocation,
  setSelectedLocation,
}) => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const industries = [
    "All Industries",
    "Technology",
    "Healthcare",
    "Finance",
    "Education",
    "Retail",
    "Manufacturing",
    "Real Estate",
    "Transportation",
    "Energy",
  ];

  const stages = [
    "All Stages",
    "Idea Stage",
    "MVP Stage",
    "Growth Stage",
    "Scale Stage",
    "Established",
  ];

  const locations = [
    "All Locations",
    "New York",
    "San Francisco",
    "London",
    "Berlin",
    "Tokyo",
    "Singapore",
    "Remote",
  ];

  // Close dropdowns when clicking outside
  React.useEffect(() => {
    const handleClick = (e) => {
      if (!e.target.closest(".dropdown-btn")) {
        setOpenDropdown(null);
      }
    };
    if (openDropdown) {
      document.addEventListener("mousedown", handleClick);
    }
    return () => document.removeEventListener("mousedown", handleClick);
  }, [openDropdown]);

  const DropdownButton = ({
    label,
    options,
    selected,
    onSelect,
    dropdownName,
    icon,
  }) => (
    <div className="relative dropdown-btn">
      <button
        className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-200 w-full sm:w-auto border border-white/10 hover:border-white/20"
        onClick={() =>
          setOpenDropdown(openDropdown === dropdownName ? null : dropdownName)
        }
        type="button"
      >
        {icon}
        <span className="text-sm font-medium">{selected && !selected.startsWith("All") ? selected : label}</span>
      </button>
      {openDropdown === dropdownName && (
        <div className="absolute top-full left-0 mt-2 w-48 bg-[#1A1A1A] border border-white/20 rounded-xl shadow-2xl py-2 z-50 backdrop-blur-sm">
          {options.map((option, index) => (
            <button
              key={index}
              className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
              onClick={() => {
                onSelect(option);
                setOpenDropdown(null);
              }}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="w-full p-4 px-2 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Startups</h1>
          <p className="text-xs text-gray-400">
            Explore startup companies and their profiles — filter by industry, stage, and location.
          </p>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="sm:hidden p-2 hover:bg-white/10 rounded-xl transition-colors"
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <IoOptionsOutline className="h-6 w-6" />
          )}
        </button>
      </div>

      <div
        className={`${isMobileMenuOpen ? "flex" : "hidden"} sm:flex flex-col sm:flex-row gap-3 w-full`}
      >
        <div className="flex-1">
          <div className="relative w-full sm:w-auto">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search startups..."
                className="w-full sm:w-[320px] px-4 py-2.5 pl-12 bg-white/10 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-white placeholder-gray-400 transition-all duration-200"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <DropdownButton
            label="Industry"
            options={industries}
            selected={selectedIndustry}
            onSelect={setSelectedIndustry}
            dropdownName="industry"
            icon={<Building2 className="h-4 w-4" />}
          />
          <DropdownButton
            label="Stage"
            options={stages}
            selected={selectedStage}
            onSelect={setSelectedStage}
            dropdownName="stage"
            icon={<Filter className="h-4 w-4" />}
          />
          <DropdownButton
            label="Location"
            options={locations}
            selected={selectedLocation}
            onSelect={setSelectedLocation}
            dropdownName="location"
            icon={<MapPin className="h-4 w-4" />}
          />
        </div>
      </div>
    </div>
  );
};

export default StartUpHeader;
