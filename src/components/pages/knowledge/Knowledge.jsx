import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  Download,
  ThumbsUp,
  ArrowUpRight,
  FileType,
  Clock,
  WifiOff,
  Search,
  Filter,
  Sparkles,
  TrendingUp,
  BookOpen,
  Users,
  FileText,
  ChevronDown,
  X
} from "lucide-react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ShinyText = ({ text, className = "" }) => (
  <span className={`inline-block bg-gradient-to-r from-blue-300 via-purple-300 to-blue-300 bg-clip-text text-transparent animate-shimmer bg-[length:200%_100%] ${className}`}>
    {text}
  </span>
);



const getFileType = (url) => {
  if (!url) return "file";
  const ext = url.split(".").pop().toLowerCase();
  return ext || "file";
};

const getFileTypeColor = (type) => {
  const colors = {
    pdf: "from-red-500 to-red-600",
    docx: "from-blue-500 to-blue-600",
    docs: "from-blue-500 to-blue-600",
    xls: "from-green-500 to-green-600",
    ppt: "from-yellow-500 to-yellow-600",
    txt: "from-gray-500 to-gray-600",
    png: "from-pink-500 to-pink-600",
    jpg: "from-orange-500 to-orange-600",
    jpeg: "from-orange-500 to-orange-600",
  };
  return colors[type] || "from-gray-500 to-gray-600";
};

const CATEGORIES = ["All Categories", "Startup", "Marketing", "Product", "Design", "Development"];
const SORT_OPTIONS = ["Newest First", "Oldest First", "A-Z", "Z-A", "Most Popular"];

const Knowledge = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedSort, setSelectedSort] = useState("Newest First");
  const [knowledgeContent, setKnowledgeContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [networkError, setNetworkError] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [totalContent, setTotalContent] = useState(0);
  const fetchKnowledgeResources = async () => {
    try {
      setLoading(true);
      setNetworkError(false);

      const { data } = await axios.get(
        `${API_URL}/knowledge?page=1&per_page=200`
      );
      if (!data.success) {
        throw new Error("Failed to fetch knowledge resources");
      }

      const mapped = data.data.knowledge_posts.map((item) => ({
        id: item.id,
        title: item.title,
        titleDescription: item.titleDescription ?? "",
        contentPreview: item.contentPreview ?? "",
        category: item.category,
        fileType: getFileType(item.fileUrl),
        fileUrl: item.fileUrl,
        views: item.views ?? 0,
        downloads: item.downloads ?? 0,
        likes: item.likes ?? 0,
        tags: item.tags || [],
        author: {
          name: `${item.author.firstName} ${item.author.lastName}`,
          avatar: `https://i.pravatar.cc/150?u=user-${item.author.id}`,
        },
        date: new Date(item.createdAt).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        }),
        dateRaw: item.createdAt,
      }));

      setKnowledgeContent(mapped);
      setTotalContent(data.total || 0)
    } catch (error) {
      console.warn("Backend failed — using mock data instead.");
      setKnowledgeContent(mockKnowledgeData);
      setNetworkError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKnowledgeResources();
  }, []);

  const filteredAndSortedContent = useMemo(() => {
    let filtered = knowledgeContent.filter((c) => {
      const s = searchQuery.toLowerCase();
      const matchSearch =
        c.title.toLowerCase().includes(s) ||
        c.titleDescription.toLowerCase().includes(s) ||
        c.contentPreview.toLowerCase().includes(s) ||
        c.category.toLowerCase().includes(s) ||
        c.author.name.toLowerCase().includes(s) ||
        c.tags.some((t) => t.toLowerCase().includes(s));

      const matchCategory =
        selectedCategory === "All Categories" ||
        c.category === selectedCategory;

      return matchSearch && matchCategory;
    });

    switch (selectedSort) {
      case "Newest First":
        filtered.sort((a, b) => new Date(b.dateRaw) - new Date(a.dateRaw));
        break;
      case "Oldest First":
        filtered.sort((a, b) => new Date(a.dateRaw) - new Date(b.dateRaw));
        break;
      case "A-Z":
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "Z-A":
        filtered.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case "Most Popular":
        filtered.sort((a, b) => b.views - a.views);
        break;
    }

    return filtered;
  }, [knowledgeContent, searchQuery, selectedCategory, selectedSort]);

  const stats = [
    { icon: BookOpen, value: totalContent, label: "Resources" },
    { icon: TrendingUp, value: "95%", label: "Helpful Rate" },
    { icon: FileText, value: "20+", label: "Categories" }
  ];

  if (loading) {
    return (
      <div className="min-h-screen  flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-gray-300">Loading knowledge resources...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen ">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Header Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-16 relative overflow-hidden"
        >
          {/* Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute -top-20 left-1/4 w-40 h-40 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-3xl"
            />
            <motion.div
              animate={{
                scale: [1.2, 1, 1.2],
                opacity: [0.4, 0.2, 0.4],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute -top-10 right-1/4 w-32 h-32 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl"
            />
          </div>


          {/* Main Heading */}
          <motion.h1
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
          >
            <ShinyText text="Knowledge" />
            <br />
            <ShinyText text="Library" className="custom-title" />
          </motion.h1>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed"
          >
            Explore curated guides, templates, and resources to accelerate your startup journey.
            Learn from industry experts and successful founders.
          </motion.p>

          {/* Stats */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex frex-wrap justify-center items-center gap-4 max-w-3xl mx-auto"
          >
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="p-4 flex-grow flex-1 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl"
                >
                  <Icon className="w-5 h-5 text-blue-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-xs text-gray-400">{stat.label}</div>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>

        {/* Network Error Warning */}
        <AnimatePresence>
          {networkError && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl backdrop-blur-sm"
            >
              <div className="flex items-center gap-3">
                <WifiOff className="w-5 h-5 text-yellow-400" />
                <span className="text-sm text-yellow-400">
                  Backend unavailable — showing demo data
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search and Filters */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mb-8"
        >
          <div className="flex flex-col gap-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search resources by title, category, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-gray-300 rounded-lg border border-gray-700 hover:bg-gray-700 transition-all whitespace-nowrap"
              >
                <Filter className="w-4 h-4" />
                <span className="text-sm font-medium">Filters</span>
              </button>

              {CATEGORIES.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all text-sm font-medium ${
                    selectedCategory === category
                      ? "bg-blue-500 text-white"
                      : "bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-white">Sort By</h3>
                      <button
                        onClick={() => setShowFilters(false)}
                        className="text-gray-400 hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {SORT_OPTIONS.map((option) => (
                        <button
                          key={option}
                          onClick={() => setSelectedSort(option)}
                          className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                            selectedSort === option
                              ? "bg-purple-500 text-white"
                              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Results Count */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-gray-400">
            {filteredAndSortedContent.length} {filteredAndSortedContent.length === 1 ? 'resource' : 'resources'} found
          </p>
          {(searchQuery || selectedCategory !== "All Categories") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All Categories");
              }}
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Content Grid */}
        <AnimatePresence mode="wait">
          {filteredAndSortedContent.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-2xl flex items-center justify-center mb-4">
                <Search className="w-10 h-10 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No resources found</h3>
              <p className="text-gray-400 text-center max-w-md">
                Try adjusting your search or filters to discover more content
              </p>
            </motion.div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6"
            >
              {filteredAndSortedContent.map((content, index) => (
                <KnowledgeCard key={content.id} content={content} index={index} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* <style jsx>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .animate-shimmer {
          animation: shimmer 3s linear infinite;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style> */}
    </div>
  );
};

const KnowledgeCard = ({ content, index }) => {
  return (
    <motion.a
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ delay: index * 0.05 }}
      href={`/knowledge-details?id=${content.id}`}
      className="group block h-full"
    >
      <div className="h-full p-6 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 hover:border-blue-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-blue-600/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:via-blue-600/5 group-hover:to-purple-500/5 transition-all duration-300" />
        
        <div className="relative space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="h-12 w-12 rounded-xl bg-gray-700 flex items-center justify-center shrink-0">
                <FileType className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-white line-clamp-2 group-hover:text-blue-400 transition-colors">
                {content.title}
              </h3>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r ${getFileTypeColor(content.fileType)} shrink-0`}>
              {content.fileType}
            </span>
          </div>

          {/* Content Preview */}
          <p className="text-sm text-gray-400 line-clamp-3 leading-relaxed">
            {content.contentPreview}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {content.tags.map((tag, i) => (
              <span
                key={i}
                className="bg-gray-700/50 text-gray-300 text-xs px-2 py-1 rounded-full border border-gray-600"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium text-gray-300">{content.views}</span>
            </div>
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium text-gray-300">{content.downloads}</span>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-700">
            <div className="flex gap-3 text-sm">
              <span className="flex items-center gap-1 text-gray-400">
                <ThumbsUp className="w-4 h-4 text-red-400" />
                {content.likes}
              </span>
              <span className="flex items-center gap-1 text-gray-400">
                <Clock className="w-4 h-4 text-blue-400" />
                {content.date}
              </span>
            </div>
            <span className="text-blue-400 flex items-center gap-1 text-sm font-medium group-hover:gap-2 transition-all">
              View <ArrowUpRight className="w-4 h-4" />
            </span>
          </div>
        </div>
      </div>
    </motion.a>
  );
};

export default Knowledge;