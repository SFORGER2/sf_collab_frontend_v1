import React from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

// Helper to format dates to relative time
function getRelativeTime(dateString) {
  if (!dateString) return "Recently";
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  
  if (isNaN(diffMs) || diffMs < 0) return "Recently";
  
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) {
    return `${diffMins}m ago`;
  }
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) {
    return `${diffDays}d ago`;
  }
  
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=600&auto=format&fit=crop";

// Get badge configuration based on impact score and category
const getImpactBadge = (article) => {
  const category = (article.category || "").trim().toLowerCase();

  if (category === "research") {
    return {
      label: "Research",
      dotColor: "bg-indigo-400",
      textColor: "text-zinc-200",
    };
  }

  const score = article.impact_score;
  if (!score || score < 8) return null;

  if (score >= 9) {
    return {
      label: "High Impact",
      dotColor: "bg-red-400",
      textColor: "text-zinc-200",
    };
  }

  return {
    label: "Trending",
    dotColor: "bg-amber-400",
    textColor: "text-zinc-200",
  };
};

const ArticleCard = React.memo(({ article }) => {
  const title = article.title || "Untitled AI Article";
  const summary = article.summary || "No summary available";
  const imageUrl = article.image_url || PLACEHOLDER_IMAGE;
  const source = article.source || "Unknown Source";
  const author = article.author;
  const displayDate = article.published_at || article.scraped_at;
  const relativeTime = getRelativeTime(displayDate);
  const category = article.category || "General";

  const badge = getImpactBadge(article);

  const handleCardClick = () => {
    if (article.url) {
      window.open(article.url, "_blank", "noopener,noreferrer");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleCardClick();
    }
  };

  const metadata = author && author !== source 
    ? `${source} • By ${author} • ${relativeTime}` 
    : `${source} • ${relativeTime}`;

  return (
    <div 
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      className="group flex flex-col md:flex-row gap-6 p-5 md:p-6 bg-[#18181b] hover:bg-[#1e1e22] border border-zinc-800/80 hover:border-zinc-600/80 rounded-2xl transition-all duration-200 ease-out outline-none focus:ring-1 focus:ring-blue-500/40 cursor-pointer hover:shadow-xl hover:shadow-black/50 hover:-translate-y-0.5 text-left w-full"
    >
      {/* Thumbnail */}
      <div className="relative w-full md:w-[30%] aspect-[16/10] overflow-hidden rounded-xl bg-zinc-900 shrink-0 border border-zinc-700/30">
        <img
          src={imageUrl}
          alt={title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.04]"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = PLACEHOLDER_IMAGE;
          }}
        />
        {/* Subtle gradient overlay on image for overall depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
        
        {/* Premium Pill Badge */}
        {badge && (
          <div className="absolute top-3 left-3 z-10 flex items-center">
            <div className="flex items-center gap-2 px-2.5 py-1 bg-black/60 backdrop-blur-xl border border-white/15 rounded-full shadow-xl">
              <div className="flex items-center gap-1.5">
                <div className={`w-1.5 h-1.5 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.4)] ${badge.dotColor}`} />
                <span className={`text-[9px] font-bold uppercase tracking-widest ${badge.textColor}`}>
                  {badge.label}
                </span>
              </div>
              {article.impact_score && (
                <>
                  <div className="w-[1px] h-3 bg-white/20 mx-0.5" />
                  <span className="text-[10px] font-mono font-bold text-white tracking-tight">
                    {article.impact_score}
                  </span>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Content area */}
      <div className="flex-1 flex flex-col justify-between min-w-0 py-0.5">
        <div>
          {/* Category tag */}
          <div className="flex items-center justify-between gap-4 mb-2.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400/90">
              {category}
            </span>
          </div>

          {/* Headline */}
          <h3 className="text-base md:text-lg font-semibold text-zinc-100 group-hover:text-blue-300 transition-colors duration-200 leading-snug line-clamp-2 mb-2.5">
            {title}
          </h3>

          {/* Summary */}
          <p className="text-xs md:text-sm text-zinc-500 leading-relaxed line-clamp-2 mb-4">
            {summary}
          </p>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-zinc-700/40 mt-auto">
          <div className="text-xs text-zinc-600 font-mono tracking-tight truncate">
            {metadata}
          </div>
          
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 group-hover:text-blue-400 transition-colors duration-200 shrink-0">
            Read Article
            <span className="transition-transform duration-200 ease-out group-hover:translate-x-1">→</span>
          </span>
        </div>
      </div>
    </div>
  );
});

ArticleCard.displayName = "ArticleCard";

export default ArticleCard;
