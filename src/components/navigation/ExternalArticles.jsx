import React from "react";
import {
  ExternalLink,
  BookOpen,
  Clock,
  ArrowRight,
  ShieldCheck,
  Globe,
} from "lucide-react";

export const ExternalArticles = () => {
  const articles = [
    {
      id: 1,
      title: "The Future of Web Development in 2026",
      excerpt:
        "Explore the latest trends in server components, edge computing, and AI-driven UI generation.",
      readTime: "5 min read",
      category: "Engineering",
      url: "https://example.com/article1",
      color: "cyan",
    },
    {
      id: 2,
      title: "Designing Accessible User Interfaces",
      excerpt:
        "A comprehensive guide to WCAG 2.2 standards, contrast ratios, and semantic HTML.",
      readTime: "8 min read",
      category: "Design",
      url: "https://example.com/article2",
      color: "purple",
    },
    {
      id: 3,
      title: "Securing React Applications",
      excerpt:
        "Why rel='noopener' matters, preventing XSS attacks, and safely handling user input.",
      readTime: "4 min read",
      category: "Security",
      url: "https://example.com/article3",
      color: "emerald",
    },
  ];

  return (
    <div className="min-h-screen w-full bg-[#0a0b10] text-slate-300 p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-800 pb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-xs font-bold uppercase tracking-wider mb-4">
              <Globe className="w-4 h-4" /> Recommended Reading
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-100 tracking-tight">
              Read More
            </h1>
            <p className="text-slate-400 mt-2 max-w-xl leading-relaxed">
              Expand your knowledge with curated articles from around the web.
              All external links open securely in a new tab.
            </p>
          </div>
        </header>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <article
              key={article.id}
              className="bg-[#0d0f17] border border-slate-800 rounded-2xl p-6 flex flex-col transition-all duration-300 hover:border-slate-600 hover:shadow-xl hover:-translate-y-1 group"
            >
              <div className="flex items-center justify-between mb-4">
                <span
                  className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                    article.color === "cyan"
                      ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
                      : article.color === "purple"
                        ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                        : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  }`}
                >
                  {article.category}
                </span>
                <span className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                  <Clock className="w-3.5 h-3.5" /> {article.readTime}
                </span>
              </div>

              <h2 className="text-xl font-bold text-slate-100 mb-3 group-hover:text-blue-400 transition-colors">
                {article.title}
              </h2>

              <p className="text-sm text-slate-400 leading-relaxed mb-8 flex-1">
                {article.excerpt}
              </p>

              <div className="mt-auto pt-4 border-t border-slate-800/50">
                {/* 
                  CRITICAL ACCESSIBILITY & SECURITY FIX:
                  1. target="_blank" opens in a new tab
                  2. rel="noopener noreferrer" prevents reverse tabnabbing and hides referer data
                */}
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-bold text-slate-300 hover:text-white transition-colors group/link"
                  aria-label={`Read more about ${article.title} (opens in a new tab)`}
                >
                  Read Article
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-800 group-hover/link:bg-blue-600 transition-colors">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </span>
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};
