import React, { useState, useEffect, useMemo } from "react";
import { Search, Calendar, Tag, ArrowLeft, Mail, ChevronRight, X, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import notificationAPI from "../../utils/APIs/notificationAPI";
import { formatFriendlyDate } from "../../utils/formatFriendlyDate";
import NewsletterSignup from "../sections/NewsletterSignup";
import NavBar from "../landing-page/Navbar";
import Footer from "../landing-page/Footer";

export default function NewsletterArchive() {
  const [newsletters, setNewsletters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState("All");
  const [selectedNewsletter, setSelectedNewsletter] = useState(null);

  // Fetch past newsletters
  useEffect(() => {
    const fetchNewsletters = async () => {
      try {
        setLoading(true);
        const response = await notificationAPI.getNewsletter();
        setNewsletters(response.newsletter || []);
      } catch (error) {
        console.error("Failed to fetch newsletters", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNewsletters();
  }, []);

  // Unique tags list extracted from newsletters (defensively parsed)
  const tagsList = useMemo(() => {
    const tags = new Set(["All"]);
    newsletters.forEach((item) => {
      if (item.tags && Array.isArray(item.tags)) {
        item.tags.forEach((tag) => tags.add(tag));
      } else if (item.category) {
        tags.add(item.category);
      }
    });
    return Array.from(tags);
  }, [newsletters]);

  // Filtered newsletters based on search & tag selection
  const filteredNewsletters = useMemo(() => {
    return newsletters.filter((item) => {
      const matchesSearch =
        item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.message?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesTag =
        selectedTag === "All" ||
        item.tags?.includes(selectedTag) ||
        item.category === selectedTag;

      return matchesSearch && matchesTag;
    });
  }, [newsletters, searchTerm, selectedTag]);

  return (
    <div className="min-h-screen bg-[#060606] text-white flex flex-col font-sans">
      <NavBar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative">
        {/* Glow Effects */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl -z-10" />
        <div className="absolute top-40 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl -z-10" />

        {/* Back Link */}
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors group">
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Back to Home
          </Link>
        </div>

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Newsletter Archive
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-gray-200 to-gray-500 bg-clip-text text-transparent">
            Ecosystem Bulletins & Updates
          </h1>
          <p className="text-gray-400 text-base md:text-lg">
            Stay informed with our historical newsletters, feature breakdowns, and deep dives into startup execution.
          </p>
        </div>

        {/* Filters and Search Bar */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-12 bg-white/[0.02] border border-white/5 p-4 rounded-2xl backdrop-blur-md">
          {/* Tags */}
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            {tagsList.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all duration-300 ${
                  selectedTag === tag
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-600/25"
                    : "bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Search past updates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-full pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-all duration-300"
            />
          </div>
        </div>

        {/* Content list */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-12 h-12 border-4 border-purple-500/25 border-t-purple-500 rounded-full animate-spin" />
            <p className="text-gray-400 text-sm">Loading archive updates...</p>
          </div>
        ) : filteredNewsletters.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
            <Mail className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white">No newsletters found</h3>
            <p className="text-gray-400 text-sm mt-1">Try adjusting your filters or search keywords.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNewsletters.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedNewsletter(item)}
                className="group relative flex flex-col justify-between bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 hover:border-purple-500/30 rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:-translate-y-1"
              >
                <div>
                  {/* Date and Category */}
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{formatFriendlyDate(item.createdAt)}</span>
                    {item.category && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-gray-700" />
                        <span className="flex items-center gap-1 text-purple-400 font-medium uppercase">
                          <Tag className="w-3 h-3" />
                          {item.category}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-2 leading-snug">
                    {item.title}
                  </h3>

                  {/* Snippet */}
                  <p className="text-gray-400 text-sm mt-3 line-clamp-4 leading-relaxed font-light">
                    {item.message}
                  </p>
                </div>

                {/* Read More button */}
                <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs font-semibold text-purple-400 group-hover:text-purple-300 transition-colors">
                  <span>Read Full Update</span>
                  <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal for Reading a Newsletter */}
        <AnimatePresence>
          {selectedNewsletter && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedNewsletter(null)}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="relative w-full max-w-3xl bg-[#0d0d0d] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header of Modal */}
                <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.01]">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{formatFriendlyDate(selectedNewsletter.createdAt)}</span>
                      {selectedNewsletter.category && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-gray-700" />
                          <span className="text-purple-400 font-medium uppercase">{selectedNewsletter.category}</span>
                        </>
                      )}
                    </div>
                    <h2 className="text-xl md:text-2xl font-bold text-white leading-tight">
                      {selectedNewsletter.title}
                    </h2>
                  </div>
                  <button
                    onClick={() => setSelectedNewsletter(null)}
                    className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Content body */}
                <div className="p-6 md:p-8 overflow-y-auto flex-1 prose prose-invert max-w-none text-gray-300 space-y-4">
                  {(selectedNewsletter.message || selectedNewsletter.content || '').split("\n\n").map((para, i) => (
                    <p key={i} className="leading-relaxed text-sm md:text-base font-light whitespace-pre-wrap">
                      {para}
                    </p>
                  ))}
                </div>

                {/* Footer of Modal */}
                <div className="p-6 border-t border-white/10 bg-white/[0.01] flex items-center justify-between text-xs text-gray-500">
                  <span>SFCollab Eco-System updates</span>
                  <button
                    onClick={() => setSelectedNewsletter(null)}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-all"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Subscribe CTA */}
        <div className="mt-24">
          <NewsletterSignup />
        </div>
      </main>

      <Footer />
    </div>
  );
}
