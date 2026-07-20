import React, { useState, useEffect, useRef } from "react";
import { Search, ChevronDown, X } from "lucide-react";
import { IoOptionsOutline } from "react-icons/io5";

const FindContributionHeader = ({
  mode = "contributors",

  searchQuery,
  setSearchQuery,
  selectedUserType,
  setSelectedUserType,
  selectedAvailability,
  setSelectedAvailability,
  selectedPosition,
  setSelectedPosition,

  selectedStartup,
  setSelectedStartup,
  startupOptions = [],
  selectedOwner,
  setSelectedOwner,
  ownerOptions = [],
  selectedStatus,
  setSelectedStatus,
  statusOptions = ["all", "active", "completed", "on_hold"],
  selectedMilestones,
  setSelectedMilestones,
  milestonesOptions = ["All", "Completed", "Incomplete"],
}) => {

  const [openDropdown, setOpenDropdown] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const headerRef = useRef(null);
  const lastScrollY = useRef(0);

  const userTypes = [
    "All User Types",
    "Developer",
    "Designer",
    "Product Manager",
    "Marketing",
    "Sales",
    "Business Analyst",
    "Project Manager",
  ];

  const availabilityOptions = [
    "All Availability",
    "Available Now",
    "Available in 1 Week",
    "Available in 2 Weeks",
    "Available in 1 Month",
    "Part-time",
    "Full-time",
  ];

  const positionOptions = [
    "All Positions",
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Developer",
    "Mobile Developer",
    "DevOps Engineer",
    "Data Scientist",
    "UI/UX Designer",
    "Product Designer",
    "Product Manager",
    "Project Manager",
    "Business Analyst",
    "Marketing Manager",
    "Sales Representative",
    "Content Creator",
    "QA Engineer",
    "System Administrator",
    "Database Administrator",
    "Security Engineer",
    "Machine Learning Engineer",
    "Cloud Architect",
    "Technical Lead",
    "Engineering Manager",
    "CTO",
    "CEO",
  ];

  // Sticky header behavior
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollDiff = lastScrollY.current - currentScrollY;

      if (scrollDiff > 5 && currentScrollY > 100) setIsSticky(true);
      else if (scrollDiff < -5 || currentScrollY < 10) setIsSticky(false);

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (!e.target.closest(".dropdown-btn")) {
        setOpenDropdown(null);
      }
    };

    if (openDropdown) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [openDropdown]);

  const DropdownButton = ({ selected, options, onSelect, dropdownName }) => (
    <div className="relative dropdown-btn">
      <button
        className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors w-full sm:w-auto"
        onClick={() =>
          setOpenDropdown(openDropdown === dropdownName ? null : dropdownName)
        }
        type="button"
      >
        {selected}
        <ChevronDown className="h-4 w-4" />
      </button>

      {openDropdown === dropdownName && (
        <div className="absolute top-full left-0 mt-2 w-48 bg-[#1A1A1A] rounded-lg shadow-lg py-2 z-50 max-h-60 overflow-y-auto">
          {options.map((option, index) => (
            <button
              key={index}
              className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/10"
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
    <>
      <div className={`h-[130px] ${isSticky ? "block" : "hidden"}`}></div>

      <div
        ref={headerRef}
        className={`w-full transition-all duration-300 ${
          isSticky
            ? "fixed top-0 left-0 right-0 z-50 bg-[#1A1A1A] shadow-lg"
            : "relative"
        }`}
      >
        <div className="flex flex-col sm:flex-col gap-4 p-4 max-w-7xl mx-auto">

          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-medium">Find Contribution</h1>

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
            className={`${
              isMobileMenuOpen ? "flex" : "hidden"
            } sm:flex flex-col gap-4`}
          >
            {/* Search Bar */}
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full px-4 py-2 pl-10 bg-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20 text-white placeholder-gray-400"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>

            {/* CONTRIBUTORS FILTERS ONLY IF mode === "contributors" */}
            {mode === "contributors" && (
              <div className="flex flex-wrap gap-3">
                <DropdownButton
                  selected={selectedUserType}
                  onSelect={setSelectedUserType}
                  options={userTypes}
                  dropdownName="userType"
                />

                <DropdownButton
                  selected={selectedAvailability}
                  onSelect={setSelectedAvailability}
                  options={availabilityOptions}
                  dropdownName="availability"
                />

                <DropdownButton
                  selected={selectedPosition}
                  onSelect={setSelectedPosition}
                  options={positionOptions}
                  dropdownName="position"
                />
              </div>
            )}

            {mode === "projects" && (
              <div className="flex flex-wrap gap-3 mt-1">

                {/* Startup */}
                <DropdownButton
                  selected={startupOptions.find((s) => s.id === selectedStartup)?.name || "All Startups"}
                  onSelect={(val) => {
                    const match = startupOptions.find((s) => s.name === val);
                    setSelectedStartup(match ? match.id : "all");
                  }}
                  options={["All Startups", ...startupOptions.map((s) => s.name)]}
                  dropdownName="startup"
                />

                <DropdownButton
                  selected={ownerOptions.find((o) => o.id === selectedOwner)?.name || "All Owners"}
                  onSelect={(val) => {
                    const match = ownerOptions.find((o) => o.name === val);
                    setSelectedOwner(match ? match.id : "all");
                  }}
                  options={["All Owners", ...ownerOptions.map((o) => o.name)]}
                  dropdownName="owner"
                />

                {/* Status */}
                <DropdownButton
                  selected={selectedStatus || "all"}
                  onSelect={setSelectedStatus}
                  options={statusOptions}
                  dropdownName="status"
                />

                {/* Milestones */}
                <DropdownButton
                  selected={selectedMilestones || "All"}
                  onSelect={setSelectedMilestones}
                  options={milestonesOptions}
                  dropdownName="milestones"
                />
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
};

export default FindContributionHeader;
