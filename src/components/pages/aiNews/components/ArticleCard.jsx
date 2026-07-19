import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, ExternalLink, Flame, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatFriendlyDate } from '@/utils/formatFriendlyDate';

// Helper to determine sentiment badge classes and icons
const getSentimentConfig = (sentiment) => {
  const normalized = String(sentiment).toLowerCase();
  if (normalized === 'positive') {
    return {
      label: 'Positive',
      badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      dotClass: 'bg-emerald-400',
    };
  }
  if (normalized === 'negative') {
    return {
      label: 'Negative',
      badgeClass: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      dotClass: 'bg-rose-400',
    };
  }
  return {
    label: 'Neutral',
    badgeClass: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    dotClass: 'bg-slate-400',
  };
};

// Helper to determine impact score colors
const getImpactColor = (score) => {
  if (score >= 80) return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
  if (score >= 50) return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
  return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
};

export default function ArticleCard({ article }) {
  const {
    title,
    summary = 'No summary available.', // fallback for null/undefined
    url,
    image_url = '',
    impact_score = 0,
    ai_enriched = false,
    sentiment = 'Neutral',
    entities = [],
    tags = [],
    author = '',
    source = '',
    source_label = '',
    category = '',
    reading_time_min,
    published_at = '',
    id,
  } = article;

  const sentimentConfig = getSentimentConfig(sentiment);
  const impactColor = getImpactColor(impact_score);

  const coverImageUrl = image_url;
  const sourceName = source_label || source;
  const readingTimeLabel =
    reading_time_min !== undefined && reading_time_min !== null && reading_time_min !== ''
      ? `${reading_time_min} min read`
      : '';
  const publishedDateLabel = published_at
    ? formatFriendlyDate(published_at) ||
      new Date(published_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  const detailUrl = id ? `/ai-news/${id}` : null;

  return (
    <Card className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-slate-950/80 shadow-md backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-2xl hover:shadow-blue-500/5">
      {/* Glow Effect on Hover */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      {/* Cover Image */}
      <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950">
        {coverImageUrl ? (
          <img
            src={coverImageUrl}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.02)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
              <ExternalLink className="size-7 text-slate-500" />
            </div>
          </div>
        )}
      </div>

      <div>
        {/* Card Header with Badges */}
        <CardHeader className="p-5 pb-3">
          <div className="flex flex-wrap items-start sm:items-center justify-between gap-1.5 sm:gap-2">
            {/* Impact & AI Enriched */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <Badge
                variant="outline"
                className={cn('flex items-center gap-1 border px-2.5 py-1 text-[11px] font-medium tracking-wide uppercase', impactColor)}
              >
                <Flame className="size-3.5" />
                Impact: {impact_score}
              </Badge>

              {ai_enriched && (
                <Badge
                  variant="outline"
                  className="flex items-center gap-1 border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1 text-[11px] font-medium uppercase text-cyan-300 tracking-wide"
                >
                  <Sparkles className="size-3.5 fill-cyan-300/20" />
                  AI Enriched
                </Badge>
              )}

              {category && (
                <Badge
                  variant="outline"
                  className="flex items-center gap-1 border border-slate-500/30 bg-slate-500/10 px-2.5 py-1 text-[11px] font-medium uppercase text-slate-300 tracking-wide"
                >
                  {category}
                </Badge>
              )}
            </div>

            {/* Sentiment Tag */}
            <Badge
              variant="outline"
              className={cn('flex items-center gap-1.5 border px-2.5 py-1 text-[11px] uppercase tracking-wide', sentimentConfig.badgeClass)}
            >
              <span className={cn('size-1.5 rounded-full animate-pulse', sentimentConfig.dotClass)} />
              {sentimentConfig.label}
            </Badge>
          </div>
        </CardHeader>

        {/* Card Content with Title & Description */}
        <CardContent className="p-5 pt-0 pb-4 space-y-3">
          {/* Single Title – conditionally wrapped as a Link */}
          {detailUrl ? (
            <Link to={detailUrl} className="block group-hover:text-blue-400 transition-colors duration-200">
              <h3 className="text-lg font-bold text-white leading-snug">
                {title}
              </h3>
            </Link>
          ) : (
            <h3 className="text-lg font-bold text-white leading-snug group-hover:text-blue-400 transition-colors duration-200">
              {title}
            </h3>
          )}

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
            {(author || sourceName) && (
              <span className="font-medium text-slate-400">
                {author}
                {author && sourceName ? ` ${'\u00B7'} ` : ''}
                {sourceName}
              </span>
            )}
            {readingTimeLabel && (
              <span className="flex items-center gap-1">
                <span className="text-slate-600">{'\u00B7'}</span>
                <span>{readingTimeLabel}</span>
              </span>
            )}
            {publishedDateLabel && (
              <span className="flex items-center gap-1">
                <span className="text-slate-600">{'\u00B7'}</span>
                <span>{publishedDateLabel}</span>
              </span>
            )}
          </div>

          <p className="text-sm leading-relaxed text-slate-400 line-clamp-3">
            {summary}
          </p>
        </CardContent>
      </div>

      {/* Footer with Tags, Entities, and CTA */}
      <CardFooter className="p-5 pt-0 flex flex-col items-start gap-4">
        {/* Tags & Entities Section */}
        {ai_enriched && (tags.length > 0 || entities.length > 0) && (
          <div className="space-y-3 w-full text-left">
            {tags.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
                  Tags
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="text-[10px] bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 transition-colors py-0.5 px-2 font-medium animate-in fade-in duration-300"
                    >
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {entities.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
                  Entities
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {entities.map((ent) => (
                    <Badge
                      key={ent}
                      variant="outline"
                      className="text-[10px] bg-blue-950/20 border border-blue-900/30 text-blue-300 hover:bg-blue-900/20 transition-colors py-0.5 px-2 font-medium animate-in fade-in duration-300"
                    >
                      {ent}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2 w-full">
          {detailUrl && (
            <Link
              to={detailUrl}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-blue-500/30 bg-blue-500/10 py-2.5 text-xs font-semibold text-blue-300 transition-all duration-300 hover:bg-blue-600 hover:text-white"
            >
              View Details
              <ChevronRight className="size-4" />
            </Link>
          )}

          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 py-2.5 text-xs font-semibold text-white transition-all duration-300 hover:bg-white hover:text-slate-950"
          >
            Read Article
            <ExternalLink className="size-3.5" />
          </a>
        </div>
      </CardFooter>
    </Card>
  );
}

ArticleCard.propTypes = {
  article: PropTypes.shape({
    title: PropTypes.string.isRequired,
    summary: PropTypes.string, // now optional
    url: PropTypes.string.isRequired,
    image_url: PropTypes.string,
    impact_score: PropTypes.number,
    ai_enriched: PropTypes.bool,
    sentiment: PropTypes.string,
    entities: PropTypes.arrayOf(PropTypes.string),
    tags: PropTypes.arrayOf(PropTypes.string),
    author: PropTypes.string,
    source: PropTypes.string,
    source_label: PropTypes.string,
    category: PropTypes.string,
    reading_time_min: PropTypes.number,
    published_at: PropTypes.string,
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]), // added for detailUrl
  }).isRequired,
};