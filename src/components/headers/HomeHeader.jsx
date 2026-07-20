import React, { useState, useRef } from "react";
import {
  ChevronDown,
  MapPin,
  Filter,
  Building2,
  Menu,
  X,
} from "lucide-react";
import { IoOptionsOutline } from "react-icons/io5";
import HomeSearchBar from "../sections/HomeSearchBar";


const FilterHeader = ({
  searchQuery,
  setSearchQuery,
  selectedLocation,
  setSelectedLocation,
  selectedStage,
  setSelectedStage,
  selectedIndustry,
  setSelectedIndustry,
}) => {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const searchTimeoutRef = useRef(null);

  const locations = [
    "All Locations",
    "New York",
    "San Francisco",
    "London",
    "Berlin",
    "Tokyo",
    "Singapore",
    "Boston",
  ];

  const stages = [
    "All Stages",
    "IDEA Stage",
    "MVP Stage",
    "Growth Stage",
    "Scale Stage",
    "Research Stage",
  ];

  const industries = [
    "All Industries",
    "Technology",
    "Healthcare",
    "Finance",
    "Education",
    "Retail",
    "Manufacturing",
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
        className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors w-full sm:w-auto"
      >
        {icon}
        <span>{selected || label}</span>
        <ChevronDown className="h-4 w-4" />
      </button>

      {activeDropdown === dropdownName && (
        <div className="absolute top-full left-0 mt-2 w-48 bg-[#1A1A1A] rounded-lg shadow-lg py-2 z-50">
          {options.map((option, index) => (
            <button
              key={index}
              className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/10"
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



  return (
    <div className="w-full flex flex-col sm:flex-col justify-end items-end min-h-20 p-4 px-2">
      {/* page hint */}
      <div className="w-full self-start mb-4">
        <p className="text-xs text-gray-400">
          Discover active projects and open roles. Filter by location, stage, and industry.
        </p>
      </div>
      <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-4">
        <div className="flex items-center justify-between gap-4 w-full sm:w-auto">
          <HomeSearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            searchTimeoutRef={searchTimeoutRef}
          />
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="sm:hidden p-2 hover:bg-white/10 rounded-lg"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <IoOptionsOutline className="h-6 w-6" />
            )}
          </button>
        </div>

        <div
          className={`${isMobileMenuOpen ? "flex" : "hidden"
            } sm:flex flex-col sm:flex-row gap-4 w-full sm:w-auto`}
        >
          <FilterButton
            icon={<MapPin className="h-4 w-4" />}
            label="Location"
            dropdownName="location"
            options={locations}
            selected={selectedLocation}
            onSelect={setSelectedLocation}
          />
          <FilterButton
            icon={<Filter className="h-4 w-4" />}
            label="Filter by stages"
            dropdownName="stages"
            options={stages}
            selected={selectedStage}
            onSelect={setSelectedStage}
          />
          <FilterButton
            icon={<Building2 className="h-4 w-4" />}
            label="Select industry"
            dropdownName="industry"
            options={industries}
            selected={selectedIndustry}
            onSelect={setSelectedIndustry}
          />
        </div>
      </div>
    </div>
  );
};

export default FilterHeader;
