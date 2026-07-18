import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Calendar, User, Newspaper, Clock, Sparkles, Tag } from 'lucide-react';
import { aiNewsAPI } from '@/utils/APIs/aiNewsAPI';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import ErrorState from '@/components/common/ErrorState';
import SentimentIndicator from '@/components/ui/SentimentIndicator';
import ReadingTime from '@/components/ai-news/ReadingTime';

export default function AINewsDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchArticleDetail = useCallback(async () => {
    if (!id) {
      setLoading(false);
      setError(new Error('Article ID is missing'));
      return;
    }
    setLoading(true);
    setError(null);
    try {
      let articleData = null;
      try {
        const res = await aiNewsAPI.getArticleById(id);
        articleData = res?.data || res;
      } catch (e) {
        // Fallback list retrieval for local/offline verification environments
        const digestRes = await aiNewsAPI.getDigest();
        const list = digestRes?.data?.articles || digestRes?.articles || [];
        articleData = list.find((a) => String(a.id) === String(id) || String(a._id) === String(id));
      }

      if (articleData) {
        setArticle(articleData);
      } else {
        setError(new Error('Article not found'));
      }
    } catch (err) {
      console.error('Failed to load AI news article detail:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchArticleDetail();
  }, [fetchArticleDetail]);

  if (loading) {
    return (
      <div className="min-h-screen w-full max-w-5xl mx-auto px-6 sm:px-10 lg:px-12 py-8 space-y-8 bg-black text-white">
        <Skeleton className="h-10 w-36 bg-slate-800 rounded-xl" />
        <Skeleton className="h-72 w-full bg-slate-800 rounded-2xl" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4 bg-slate-800" />
          <Skeleton className="h-4 w-1/2 bg-slate-800" />
          <Skeleton className="h-32 w-full bg-slate-800" />
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen w-full max-w-5xl mx-auto px-6 sm:px-10 lg:px-12 py-12 bg-black text-white space-y-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/ai-news')}
          className="text-slate-400 hover:text-white gap-2"
        >
          <ArrowLeft className="size-4" />
          Back to AI News
        </Button>
        <ErrorState
          title="Article Not Found"
          message="We couldn't load the details for this AI news article. Please try again."
          onRetry={fetchArticleDetail}
          type="network"
        />
      </div>
    );
  }

  // Exact property extraction per task specification
  const {
    title,
    url,
    summary,
    source_label,
    category,
    tags,
    sentiment,
    entities,
    reading_time_min,
    published_at,
    image,
    author,
  } = article;

  return (
    <div className="min-h-screen w-full max-w-5xl mx-auto px-6 sm:px-10 lg:px-12 py-8 space-y-8 bg-black text-white">
      {/* Navigation Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/ai-news')}
          className="text-slate-400 hover:text-white hover:bg-slate-900 gap-2 rounded-xl transition-all"
        >
          <ArrowLeft className="size-4" />
          Back to AI News
        </Button>

        <div className="flex items-center gap-2">
          {category && (
            <Badge variant="outline" className="border-blue-500/30 bg-blue-500/10 text-blue-300 text-xs px-3 py-1 rounded-full uppercase tracking-wider font-semibold">
              {category}
            </Badge>
          )}
          {sentiment && <SentimentIndicator sentiment={sentiment} />}
        </div>
      </div>

      {/* Hero Image Section (Conditional) */}
      {image && (
        <div className="relative w-full h-72 sm:h-96 rounded-3xl overflow-hidden border border-white/10 bg-slate-950 flex items-center justify-center shadow-2xl">
          <img
            src={image}
            alt={title || 'AI News Detail'}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.style.display = 'none';
            }}
          />
        </div>
      )}

      {/* Main Details */}
      <div className="space-y-6">
        {title && (
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            {title}
          </h1>
        )}

        {/* Metadata Bar */}
        {(author || source_label || published_at || reading_time_min) && (
          <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-400 border-y border-white/5 py-4">
            {author && (
              <div className="flex items-center gap-1.5 font-medium text-slate-300">
                <User className="size-4 text-blue-400" />
                <span>By {author}</span>
              </div>
            )}

            {source_label && (
              <div className="flex items-center gap-1.5 font-medium text-slate-400">
                <span>Source: <strong className="text-slate-200">{source_label}</strong></span>
              </div>
            )}

            {published_at && (
              <div className="flex items-center gap-1.5">
                <Calendar className="size-4 text-slate-400" />
                <span>{published_at}</span>
              </div>
            )}

            {reading_time_min && (
              <div className="flex items-center gap-1.5">
                <Clock className="size-4 text-slate-400" />
                <ReadingTime minutes={reading_time_min} />
              </div>
            )}
          </div>
        )}

        {/* Summary Card */}
        {summary && (
          <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-6 backdrop-blur-md space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Sparkles className="size-4 text-blue-400" />
              Summary
            </h2>
            <p className="text-base sm:text-lg leading-relaxed text-slate-200">
              {summary}
            </p>
          </div>
        )}

        {/* Tags & Entities */}
        {((Array.isArray(tags) && tags.length > 0) || (Array.isArray(entities) && entities.length > 0)) && (
          <div className="space-y-3 pt-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Tag className="size-3.5" />
              Topics & Entities
            </span>
            <div className="flex flex-wrap gap-2">
              {Array.isArray(tags) && tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-lg border border-slate-800 bg-slate-900 px-3 py-1 text-xs font-medium text-slate-300"
                >
                  #{tag}
                </span>
              ))}
              {Array.isArray(entities) && entities.map((entity) => (
                <span
                  key={entity}
                  className="inline-flex items-center rounded-lg border border-blue-800/40 bg-blue-950/40 px-3 py-1 text-xs font-medium text-blue-300"
                >
                  {entity}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action Button */}
        {url && (
          <div className="pt-6 border-t border-white/5">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white px-8 py-3.5 text-sm font-semibold transition-all shadow-lg shadow-blue-500/20"
            >
              Open Original Article
              <ExternalLink className="size-4" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
