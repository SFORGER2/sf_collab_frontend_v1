import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  PlayCircle,
  Clock,
  TrendingUp,
  Users,
  Rocket,
  DollarSign,
  Target,
  Briefcase,
  Code,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Eye,
  ArrowLeft,
  Sparkles
} from "lucide-react";
import { Link } from "react-router-dom";

const CATEGORIES = [
  "All",
  "Getting Started",
  "Fundraising",
  "Product Development",
  "Marketing",
  "Team Building",
  "Growth Strategies",
  "Legal & Compliance"
];

const VIDEOS = [
  // Getting Started
  {
    id: 1,
    title: "How to Start a Startup",
    description: "Essential guide covering ideation, validation, and first steps to launching your startup.",
    thumbnail: "https://img.youtube.com/vi/CBYhVcO4WgI/maxresdefault.jpg",
    link: "https://www.youtube.com/watch?v=CBYhVcO4WgI",
    duration: "45:32",
    views: "2.1M",
    category: "Getting Started"
  },
  {
    id: 2,
    title: "Zero to One: Building Your Startup",
    description: "Peter Thiel's insights on creating something new and building a successful startup from scratch.",
    thumbnail: "https://img.youtube.com/vi/3vCdfa_aeI8/maxresdefault.jpg",
    link: "https://www.youtube.com/watch?v=3vCdfa_aeI8",
    duration: "52:18",
    views: "1.8M",
    category: "Getting Started"
  },
  {
    id: 3,
    title: "Startup Ideas: How to Find the Right One",
    description: "Learn systematic approaches to discovering and validating startup ideas that solve real problems.",
    thumbnail: "https://img.youtube.com/vi/uvw-u99yj8w/maxresdefault.jpg",
    link: "https://www.youtube.com/watch?v=uvw-u99yj8w",
    duration: "38:45",
    views: "950K",
    category: "Getting Started"
  },
  
  // Fundraising
  {
    id: 4,
    title: "How to Pitch Your Startup to Investors",
    description: "Master the art of pitching with proven techniques from Y Combinator partners.",
    thumbnail: "https://img.youtube.com/vi/17XZGUX_9iM/maxresdefault.jpg",
    link: "https://www.youtube.com/watch?v=17XZGUX_9iM",
    duration: "42:15",
    views: "1.5M",
    category: "Fundraising"
  },
  {
    id: 5,
    title: "Raising Your Seed Round",
    description: "Complete guide to preparing for and successfully raising your first round of funding.",
    thumbnail: "https://img.youtube.com/vi/KQJ6zsNCA-4/maxresdefault.jpg",
    link: "https://www.youtube.com/watch?v=KQJ6zsNCA-4",
    duration: "51:30",
    views: "890K",
    category: "Fundraising"
  },
  {
    id: 6,
    title: "Understanding Venture Capital",
    description: "Deep dive into how VCs think, what they look for, and how to approach them strategically.",
    thumbnail: "https://img.youtube.com/vi/xWyb_JiQoCY/maxresdefault.jpg",
    link: "https://www.youtube.com/watch?v=xWyb_JiQoCY",
    duration: "47:20",
    views: "720K",
    category: "Fundraising"
  },
  {
    id: 7,
    title: "Term Sheets Explained",
    description: "Navigate the complexities of term sheets, valuation, and deal structures with confidence.",
    thumbnail: "https://img.youtube.com/vi/7SX1fZFNXbY/maxresdefault.jpg",
    link: "https://www.youtube.com/watch?v=7SX1fZFNXbY",
    duration: "55:12",
    views: "640K",
    category: "Fundraising"
  },

  // Product Development
  {
    id: 8,
    title: "Building Products Users Love",
    description: "Product development strategies from industry leaders on creating must-have products.",
    thumbnail: "https://img.youtube.com/vi/sz_LgBAGYyo/maxresdefault.jpg",
    link: "https://www.youtube.com/watch?v=sz_LgBAGYyo",
    duration: "43:28",
    views: "1.2M",
    category: "Product Development"
  },
  {
    id: 9,
    title: "MVP Development Best Practices",
    description: "Learn how to build a minimum viable product that validates your assumptions quickly.",
    thumbnail: "https://img.youtube.com/vi/QRZ_l7cVzzU/maxresdefault.jpg",
    link: "https://www.youtube.com/watch?v=QRZ_l7cVzzU",
    duration: "36:45",
    views: "880K",
    category: "Product Development"
  },
  {
    id: 10,
    title: "Design Thinking for Startups",
    description: "Apply design thinking methodologies to solve customer problems effectively.",
    thumbnail: "https://img.youtube.com/vi/a7sEoEvT8l8/maxresdefault.jpg",
    link: "https://www.youtube.com/watch?v=a7sEoEvT8l8",
    duration: "49:33",
    views: "750K",
    category: "Product Development"
  },

  // Marketing
  {
    id: 11,
    title: "Growth Hacking Strategies",
    description: "Proven growth hacking techniques that helped startups achieve exponential growth.",
    thumbnail: "https://img.youtube.com/vi/raIUQP71SBU/maxresdefault.jpg",
    link: "https://www.youtube.com/watch?v=raIUQP71SBU",
    duration: "41:18",
    views: "1.4M",
    category: "Marketing"
  },
  {
    id: 12,
    title: "Content Marketing for Startups",
    description: "Build a content strategy that attracts and converts your target audience.",
    thumbnail: "https://img.youtube.com/vi/krgfN_eEHkU/maxresdefault.jpg",
    link: "https://www.youtube.com/watch?v=krgfN_eEHkU",
    duration: "38:52",
    views: "670K",
    category: "Marketing"
  },
  {
    id: 13,
    title: "Social Media Strategy",
    description: "Leverage social media platforms to build brand awareness and drive growth.",
    thumbnail: "https://img.youtube.com/vi/QY0T9Qvpo4w/maxresdefault.jpg",
    link: "https://www.youtube.com/watch?v=QY0T9Qvpo4w",
    duration: "44:25",
    views: "820K",
    category: "Marketing"
  },

  // Team Building
  {
    id: 14,
    title: "Hiring Your First Employees",
    description: "Critical insights on building your founding team and making your first hires count.",
    thumbnail: "https://img.youtube.com/vi/Mfz1_blYQ5g/maxresdefault.jpg",
    link: "https://www.youtube.com/watch?v=Mfz1_blYQ5g",
    duration: "46:15",
    views: "920K",
    category: "Team Building"
  },
  {
    id: 15,
    title: "Building Company Culture",
    description: "Create a strong company culture that attracts top talent and drives success.",
    thumbnail: "https://img.youtube.com/vi/RyTQ5-SQYTo/maxresdefault.jpg",
    link: "https://www.youtube.com/watch?v=RyTQ5-SQYTo",
    duration: "39:48",
    views: "710K",
    category: "Team Building"
  },
  {
    id: 16,
    title: "Remote Team Management",
    description: "Best practices for managing and scaling remote teams effectively.",
    thumbnail: "https://img.youtube.com/vi/oPQ-5QPIvH4/maxresdefault.jpg",
    link: "https://www.youtube.com/watch?v=oPQ-5QPIvH4",
    duration: "42:33",
    views: "580K",
    category: "Team Building"
  },

  // Growth Strategies
  {
    id: 17,
    title: "Scaling Your Startup",
    description: "Strategies for scaling operations, team, and revenue without losing momentum.",
    thumbnail: "https://img.youtube.com/vi/ZoqgAy3h4OM/maxresdefault.jpg",
    link: "https://www.youtube.com/watch?v=ZoqgAy3h4OM",
    duration: "53:22",
    views: "1.1M",
    category: "Growth Strategies"
  },
  {
    id: 18,
    title: "International Expansion",
    description: "Navigate the challenges of taking your startup global with proven frameworks.",
    thumbnail: "https://img.youtube.com/vi/B7E8OZIr-6U/maxresdefault.jpg",
    link: "https://www.youtube.com/watch?v=B7E8OZIr-6U",
    duration: "48:15",
    views: "530K",
    category: "Growth Strategies"
  },
  {
    id: 19,
    title: "Metrics That Matter",
    description: "Identify and track the key metrics that truly indicate your startup's health.",
    thumbnail: "https://img.youtube.com/vi/FBOLk9s9Ci4/maxresdefault.jpg",
    link: "https://www.youtube.com/watch?v=FBOLk9s9Ci4",
    duration: "40:28",
    views: "790K",
    category: "Growth Strategies"
  },

  // Legal & Compliance
  {
    id: 20,
    title: "Legal Basics for Startups",
    description: "Essential legal knowledge every founder needs to protect their startup.",
    thumbnail: "https://img.youtube.com/vi/gCYcqW0d3fM/maxresdefault.jpg",
    link: "https://www.youtube.com/watch?v=gCYcqW0d3fM",
    duration: "45:50",
    views: "620K",
    category: "Legal & Compliance"
  },
  {
    id: 21,
    title: "Equity & Stock Options",
    description: "Understand equity distribution, vesting schedules, and employee stock options.",
    thumbnail: "https://img.youtube.com/vi/tL6eNl2_JqY/maxresdefault.jpg",
    link: "https://www.youtube.com/watch?v=tL6eNl2_JqY",
    duration: "51:15",
    views: "560K",
    category: "Legal & Compliance"
  },
  {
    id: 22,
    title: "Intellectual Property Protection",
    description: "Protect your startup's innovations with patents, trademarks, and copyrights.",
    thumbnail: "https://img.youtube.com/vi/rBkQmF5qWCA/maxresdefault.jpg",
    link: "https://www.youtube.com/watch?v=rBkQmF5qWCA",
    duration: "43:40",
    views: "480K",
    category: "Legal & Compliance"
  }
];

const ShinyText = ({ text, className = "" }) => (
  <span className={`inline-block bg-gradient-to-r from-blue-300 via-purple-300 to-blue-300 bg-clip-text text-transparent animate-shimmer bg-[length:200%_100%] ${className}`}>
    {text}
  </span>
);

export default function VideoTutorials() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const itemsPerPage = 9;

  const filteredVideos = VIDEOS.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         video.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || video.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredVideos.length / itemsPerPage);
  const paginatedVideos = filteredVideos.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory]);

  const getCategoryIcon = (category) => {
    const icons = {
      "Getting Started": Rocket,
      "Fundraising": DollarSign,
      "Product Development": Code,
      "Marketing": TrendingUp,
      "Team Building": Users,
      "Growth Strategies": Target,
      "Legal & Compliance": Briefcase
    };
    return icons[category] || Sparkles;
  };

  return (
    <div className="min-h-screen ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Back Button */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
        >
          <Link to="/help">
            <button className="mb-6 border border-gray-600 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-white hover:text-black transition-all duration-300 text-gray-300">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back to Help</span>
            </button>
          </Link>
        </motion.div>

        {/* Header Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-12 relative overflow-hidden"
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
              className="absolute -top-20 -left-20 w-40 h-40 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-3xl"
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
              className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl"
            />
          </div>

          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-full px-6 py-2 backdrop-blur-sm mb-6"
          >
            <PlayCircle className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-medium bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
              {VIDEOS.length}+ Expert Video Tutorials
            </span>
          </motion.div>

          <motion.h1
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
          >
            <ShinyText text="Master the Art of" />
            <br />
            <ShinyText text="Building Startups" className="custom-title" />
          </motion.h1>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto"
          >
            Learn from industry experts and successful founders with our curated collection
            of startup tutorials covering every aspect of building a successful company.
          </motion.p>

          {/* Stats */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-2xl mx-auto"
          >
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">22+</div>
              <div className="text-sm text-gray-400">Video Tutorials</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">15M+</div>
              <div className="text-sm text-gray-400">Total Views</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">7</div>
              <div className="text-sm text-gray-400">Categories</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">50K+</div>
              <div className="text-sm text-gray-400">Founders Trained</div>
            </div>
          </motion.div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mb-8"
        >
          <div className="flex flex-col gap-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search tutorials by title or topic..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
              />
            </div>

            {/* Category Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {CATEGORIES.map((category) => {
                const Icon = getCategoryIcon(category);
                return (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                      selectedCategory === category
                        ? "bg-blue-500 text-white"
                        : "bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{category}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Results Count */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-gray-400">
            {filteredVideos.length} {filteredVideos.length === 1 ? 'tutorial' : 'tutorials'} found
          </p>
          {(searchQuery || selectedCategory !== "All") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
              }}
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Video Grid */}
        <AnimatePresence mode="wait">
          {filteredVideos.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-2xl flex items-center justify-center mb-4">
                <Search className="w-10 h-10 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No tutorials found</h3>
              <p className="text-gray-400 mb-6 text-center max-w-md">
                Try adjusting your search or filters to discover more content
              </p>
            </motion.div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {paginatedVideos.map((video, index) => (
                <VideoCard key={video.id} video={video} index={index} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-12">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  currentPage === page
                    ? "bg-blue-500 text-white"
                    : "border border-gray-600 text-gray-300 hover:bg-gray-700"
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      <style >{`
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
      `}</style>
    </div>
  );
}

const VideoCard = ({ video, index }) => {
  const CategoryIcon = video.category ? (() => {
    const icons = {
      "Getting Started": Rocket,
      "Fundraising": DollarSign,
      "Product Development": Code,
      "Marketing": TrendingUp,
      "Team Building": Users,
      "Growth Strategies": Target,
      "Legal & Compliance": Briefcase
    };
    return icons[video.category] || Sparkles;
  })() : Sparkles;

  return (
    <motion.a
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ delay: index * 0.05 }}
      href={video.link}
      target="_blank"
      rel="noopener noreferrer"
      className="group block bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700 hover:border-blue-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10"
    >
      {/* Thumbnail */}
      <div className="relative overflow-hidden aspect-video bg-gray-900">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center transform scale-90 group-hover:scale-100 transition-transform duration-300">
            <PlayCircle className="w-8 h-8 text-white" fill="white" />
          </div>
        </div>

        {/* Duration Badge */}
        <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-sm px-2 py-1 rounded flex items-center gap-1">
          <Clock className="w-3 h-3 text-gray-300" />
          <span className="text-xs text-gray-300 font-medium">{video.duration}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Category Badge */}
        <div className="flex items-center gap-2 mb-3">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-full px-3 py-1 flex items-center gap-1.5">
            <CategoryIcon className="w-3 h-3 text-blue-400" />
            <span className="text-xs font-medium text-blue-400">{video.category}</span>
          </div>
        </div>

        <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors">
          {video.title}
        </h3>

        <p className="text-sm text-gray-400 mb-4 line-clamp-2">
          {video.description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-700">
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Eye className="w-3 h-3" />
            <span>{video.views} views</span>
          </div>
          <div className="flex items-center gap-2 text-blue-400 font-medium text-sm group-hover:gap-3 transition-all">
            <span>Watch Now</span>
            <PlayCircle className="w-4 h-4" />
          </div>
        </div>
      </div>
    </motion.a>
  );
};