import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Tag,
  AlertCircle,
  Share2,
  Bookmark,
  Image as ImageIcon,
} from "lucide-react";

export const ArticleDetail = ({ articleId, onBack }) => {
  const [article, setArticle] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mock Database
  const mockDatabase = {
    1: {
      id: 1,
      title: "The Future of AI-Driven UI Generation in 2026",
      content: [
        "The landscape of web development is undergoing a seismic shift. For years, developers have manually translated design files into code, component by component. However, the rise of advanced Large Language Models (LLMs) and multimodal AI is fundamentally changing this workflow.",
        "Today, AI can ingest a screenshot of a user interface and generate production-ready React components in seconds. This isn't just about speed; it's about shifting the developer's role from a 'syntax writer' to an 'architect'. We are now focusing on state management, security, and complex business logic while the AI handles the boilerplate styling.",
        "Furthermore, edge computing is allowing these generated UIs to be served with near-zero latency. By generating personalized, AI-driven interfaces on the fly at the edge, applications can adapt to individual user preferences instantly.",
        "As we look towards the end of 2026, the question is no longer 'Will AI replace developers?' but rather, 'How will developers leverage AI to build things we previously thought impossible?'",
      ],
      author: "Sarah Jenkins",
      authorRole: "Lead UX Engineer",
      date: "June 28, 2026",
      readTime: "5 min read",
      tags: ["Artificial Intelligence", "React", "Future Tech", "UI/UX"],
      // Simulating a vibrant abstract gradient cover image
      coverGradient: "from-cyan-500 via-blue-600 to-purple-600",
    },
  };

  useEffect(() => {
    const fetchArticle = async () => {
      setIsLoading(true);
      setError(null);

      // Simulate network delay of 1.2 seconds
      await new Promise((resolve) => setTimeout(resolve, 1200));

      const foundArticle = mockDatabase[articleId];

      if (foundArticle) {
        setArticle(foundArticle);
      } else {
        // Handle Invalid Article ID
        setError(
          "We couldn't find the article you're looking for. It may have been removed or the link is invalid.",
        );
      }

      setIsLoading(false);
    };

    fetchArticle();
  }, [articleId]);

  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4 md:p-8 animate-pulse">
        <div className="h-6 w-24 bg-slate-800 rounded-lg mb-8"></div>
        <div className="h-12 w-3/4 bg-slate-800 rounded-xl mb-6"></div>
        <div className="flex gap-4 mb-8">
          <div className="h-10 w-32 bg-slate-800 rounded-full"></div>
          <div className="h-10 w-32 bg-slate-800 rounded-full"></div>
        </div>
        {/* Large Image Skeleton */}
        <div className="w-full h-[400px] bg-slate-800 rounded-2xl mb-12"></div>
        <div className="space-y-4">
          <div className="h-4 bg-slate-800 rounded w-full"></div>
          <div className="h-4 bg-slate-800 rounded w-full"></div>
          <div className="h-4 bg-slate-800 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-2xl mx-auto p-8 mt-12 bg-[#11131a] border border-red-500/20 rounded-2xl text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-8 h-8 text-red-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-100 mb-3">
          Article Not Found (404)
        </h2>
        <p className="text-slate-400 mb-8">{error}</p>
        <button
          onClick={onBack}
          className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-xl transition-colors inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Go Back
        </button>
      </div>
    );
  }

  return (
    <article className="w-full max-w-4xl mx-auto bg-[#0a0b10] min-h-screen text-slate-300 pb-20 animate-in fade-in duration-700">
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-10 bg-[#0a0b10]/80 backdrop-blur-md border-b border-slate-800 py-4 px-4 md:px-8 flex items-center justify-between mb-8">
        <button
          onClick={onBack}
          className="text-slate-400 hover:text-cyan-400 font-medium flex items-center gap-2 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to feed
        </button>
        <div className="flex items-center gap-3">
          <button
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-full transition-colors"
            aria-label="Bookmark article"
          >
            <Bookmark className="w-5 h-5" />
          </button>
          <button
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-full transition-colors"
            aria-label="Share article"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="px-4 md:px-8">
        {/* Header & Metadata */}
        <header className="mb-8 space-y-6">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-wider rounded-full"
              >
                <Tag className="w-3 h-3" /> {tag}
              </span>
            ))}
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-100 tracking-tight leading-tight">
            {article.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-sm text-slate-400 pt-4 border-t border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-tr from-purple-500 to-cyan-500 rounded-full p-0.5">
                <div className="w-full h-full bg-[#0a0b10] rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-slate-300" />
                </div>
              </div>
              <div>
                <p className="font-bold text-slate-200">{article.author}</p>
                <p className="text-xs">{article.authorRole}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-500" />
              {article.date}
            </div>

            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-500" />
              {article.readTime}
            </div>
          </div>
        </header>

        {/* Large Hero Image (Simulated with a beautiful CSS gradient) */}
        <figure className="w-full mb-12 rounded-3xl overflow-hidden shadow-2xl border border-slate-700/50 relative group">
          <div
            className={`w-full h-[300px] md:h-[450px] bg-gradient-to-br ${article.coverGradient} flex items-center justify-center opacity-90 group-hover:opacity-100 transition-opacity duration-500`}
          >
            <ImageIcon className="w-24 h-24 text-white/20" />
          </div>
          <figcaption className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm text-white/70 text-xs px-3 py-1.5 rounded-lg">
            AI Generated UI Mockup
          </figcaption>
        </figure>

        {/* Article Content */}
        <div className="prose prose-invert prose-lg max-w-none prose-p:leading-relaxed prose-p:text-slate-300">
          {article.content.map((paragraph, index) => (
            <p key={index} className="mb-6">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </article>
  );
};
