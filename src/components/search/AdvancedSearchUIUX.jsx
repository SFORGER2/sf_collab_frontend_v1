import React, { useState, useMemo } from "react";
import {
  Search,
  Filter,
  Briefcase,
  ListTodo,
  Rocket,
  Tag,
  Users,
  Check,
  X,
  Inbox,
} from "lucide-react";

export const AdvancedSearchUIUX = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedContributors, setSelectedContributors] = useState([]);

  const categories = [
    { name: "All", icon: <Search className="w-4 h-4" /> },
    { name: "Workspaces", icon: <Briefcase className="w-4 h-4" /> },
    { name: "Tasks", icon: <ListTodo className="w-4 h-4" /> },
    { name: "Startups", icon: <Rocket className="w-4 h-4" /> },
  ];

  const availableTags = [
    "Frontend",
    "Backend",
    "Design",
    "Marketing",
    "Urgent",
  ];
  const availableContributors = [
    "John Doe",
    "Sarah Smith",
    "Alex Chen",
    "Maria Garcia",
  ];

  const mockResults = [
    {
      id: 1,
      type: "Tasks",
      title: "Implement OAuth2 Login",
      tag: "Backend",
      contributor: "Sarah Smith",
      desc: "Secure the main API endpoints.",
    },
    {
      id: 2,
      type: "Workspaces",
      title: "Q3 Marketing Launch",
      tag: "Marketing",
      contributor: "Maria Garcia",
      desc: "Collaborative space for the Q3 push.",
    },
    {
      id: 3,
      type: "Startups",
      title: "Fintech Revolution App",
      tag: "Frontend",
      contributor: "Alex Chen",
      desc: "A new way to track expenses.",
    },
    {
      id: 4,
      type: "Tasks",
      title: "Design System Overhaul",
      tag: "Design",
      contributor: "John Doe",
      desc: "Update core UI components to v2.",
    },
    {
      id: 5,
      type: "Startups",
      title: "AI Copywriter Beta",
      tag: "Backend",
      contributor: "Sarah Smith",
      desc: "LLM integration for automated marketing copy.",
    },
  ];

  // UX Feature 1: Actual Filtering Logic
  const filteredResults = useMemo(() => {
    return mockResults.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.desc.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat =
        activeCategory === "All" || item.type === activeCategory;
      const matchesTags =
        selectedTags.length === 0 || selectedTags.includes(item.tag);
      const matchesContrib =
        selectedContributors.length === 0 ||
        selectedContributors.includes(item.contributor);

      return matchesSearch && matchesCat && matchesTags && matchesContrib;
    });
  }, [searchQuery, activeCategory, selectedTags, selectedContributors]);

  // Helper to toggle multi-select filters
  const toggleFilter = (item, list, setList) => {
    if (list.includes(item)) {
      setList(list.filter((i) => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0a0b10] text-slate-300 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto flex flex-col h-full gap-6">
        {/* Top Bar: Main Search Input */}
        <div className="relative w-full group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-6 w-6 text-cyan-400 group-focus-within:text-cyan-300 transition-colors" />
          </div>
          <input
            type="text"
            className="w-full bg-[#0d0f17] border border-slate-800 text-slate-100 rounded-2xl pl-14 pr-12 py-5 text-lg shadow-lg focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder:text-slate-600"
            placeholder="Search across your entire ERP..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {/* UX Feature 2: Quick Clear Search */}
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* LEFT SIDEBAR: Advanced Filters */}
          <div className="w-full lg:w-72 shrink-0 space-y-6">
            {/* Category Filter */}
            <div className="bg-[#0d0f17] border border-slate-800 rounded-xl p-5 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400" /> Categories
              </h3>
              <div className="flex flex-col gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.name}
                    onClick={() => setActiveCategory(cat.name)}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      activeCategory === cat.name
                        ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                        : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-300 border border-transparent"
                    }`}
                  >
                    {cat.icon} {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Tag Filter */}
            <div className="bg-[#0d0f17] border border-slate-800 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-purple-400" /> Tags
                </h3>
                {/* UX Feature 3: Clear Tags Button */}
                {selectedTags.length > 0 && (
                  <button
                    onClick={() => setSelectedTags([])}
                    className="text-[10px] text-purple-400 hover:text-purple-300 underline"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() =>
                      toggleFilter(tag, selectedTags, setSelectedTags)
                    }
                    className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors duration-200 ${
                      selectedTags.includes(tag)
                        ? "bg-purple-500/20 border-purple-500/50 text-purple-300 scale-105"
                        : "bg-[#11131a] border-slate-700 text-slate-400 hover:border-slate-500"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Contributor Filter */}
            <div className="bg-[#0d0f17] border border-slate-800 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-400" /> Contributors
                </h3>
                {/* UX Feature 3: Clear Contributors Button */}
                {selectedContributors.length > 0 && (
                  <button
                    onClick={() => setSelectedContributors([])}
                    className="text-[10px] text-emerald-400 hover:text-emerald-300 underline"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="space-y-3">
                {availableContributors.map((person) => (
                  <label
                    key={person}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <div
                      className={`w-5 h-5 rounded border flex items-center justify-center transition-all duration-200 ${
                        selectedContributors.includes(person)
                          ? "bg-emerald-500 border-emerald-500 scale-110"
                          : "bg-[#11131a] border-slate-700 group-hover:border-slate-500"
                      }`}
                    >
                      {selectedContributors.includes(person) && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <span
                      className={`text-sm transition-colors ${selectedContributors.includes(person) ? "text-slate-200 font-medium" : "text-slate-400"}`}
                    >
                      {person}
                    </span>
                    <input
                      type="checkbox"
                      className="hidden"
                      onChange={() =>
                        toggleFilter(
                          person,
                          selectedContributors,
                          setSelectedContributors,
                        )
                      }
                    />
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT PANEL: Search Results */}
          <div className="flex-1 bg-[#0d0f17] border border-slate-800 rounded-xl p-6 shadow-sm min-h-[500px] flex flex-col">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
              <h2 className="text-lg font-bold text-slate-200">
                {activeCategory === "All"
                  ? "Global Search Results"
                  : `${activeCategory} Results`}
              </h2>
              <span className="text-xs text-slate-500 font-medium bg-slate-800/50 px-3 py-1 rounded-full">
                {filteredResults.length}{" "}
                {filteredResults.length === 1 ? "item" : "items"}
              </span>
            </div>

            {/* UX Feature 4: The Empty State */}
            {filteredResults.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center animate-in fade-in duration-300">
                <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mb-4 border border-slate-700">
                  <Inbox className="w-8 h-8 text-slate-500" />
                </div>
                <h3 className="text-lg font-bold text-slate-300 mb-2">
                  No results found
                </h3>
                <p className="text-sm text-slate-500 max-w-sm mb-6">
                  We couldn't find anything matching your current search and
                  filter criteria. Try adjusting your tags or searching for a
                  different keyword.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setActiveCategory("All");
                    setSelectedTags([]);
                    setSelectedContributors([]);
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-lg transition-colors border border-slate-700"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredResults.map((result) => (
                  <div
                    key={result.id}
                    className="p-5 bg-[#0a0b10] border border-slate-800/80 rounded-xl hover:border-cyan-500/30 transition-all cursor-pointer group animate-in slide-in-from-bottom-2 fade-in duration-300"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg ${
                            result.type === "Tasks"
                              ? "bg-orange-500/10 text-orange-400"
                              : result.type === "Workspaces"
                                ? "bg-cyan-500/10 text-cyan-400"
                                : "bg-purple-500/10 text-purple-400"
                          }`}
                        >
                          {result.type === "Tasks" && (
                            <ListTodo className="w-4 h-4" />
                          )}
                          {result.type === "Workspaces" && (
                            <Briefcase className="w-4 h-4" />
                          )}
                          {result.type === "Startups" && (
                            <Rocket className="w-4 h-4" />
                          )}
                        </div>
                        <h3 className="text-base font-bold text-slate-200 group-hover:text-cyan-400 transition-colors">
                          {result.title}
                        </h3>
                      </div>
                      <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold bg-[#11131a] px-2 py-1 rounded border border-slate-800">
                        {result.type}
                      </span>
                    </div>

                    <p className="text-sm text-slate-400 mb-4 ml-11">
                      {result.desc}
                    </p>

                    <div className="flex items-center gap-3 ml-11">
                      <span className="flex items-center gap-1.5 text-xs text-slate-300 bg-slate-800/50 px-2.5 py-1 rounded-md border border-slate-700/50">
                        <Tag className="w-3 h-3 text-purple-400" /> {result.tag}
                      </span>
                      <span className="flex items-center gap-1.5 text-xs text-slate-300 bg-slate-800/50 px-2.5 py-1 rounded-md border border-slate-700/50">
                        <Users className="w-3 h-3 text-emerald-400" />{" "}
                        {result.contributor}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
