import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Newspaper, Calendar, ExternalLink, RefreshCcw, Search, Sparkles } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { aiNewsAPI } from '@/utils/APIs/aiNewsAPI';
import { parseApiError } from '@/utils/APIs/parseApiError';
import ErrorState from '@/components/common/ErrorState';
import EmptyState from '@/components/common/EmptyState';
import { formatFriendlyDate } from '@/utils/formatFriendlyDate';
import { useNavigate } from 'react-router-dom';

const AINewsSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
      {[...Array(6)].map((_, i) => (
        <Card key={i} className="border border-slate-800 bg-slate-950/40 backdrop-blur-md overflow-hidden h-[420px] flex flex-col">
          <Skeleton className="h-48 w-full bg-slate-800 animate-pulse" />
          <div className="p-5 flex-1 flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-20 bg-slate-800 animate-pulse" />
              <Skeleton className="h-4 w-24 bg-slate-800 animate-pulse" />
            </div>
            <Skeleton className="h-6 w-full bg-slate-800 animate-pulse" />
            <Skeleton className="h-4 w-[90%] bg-slate-800 animate-pulse" />
            <Skeleton className="h-4 w-[75%] bg-slate-800 animate-pulse" />
          </div>
          <CardFooter className="p-5 pt-0 border-t border-slate-800/50 flex justify-between items-center">
            <Skeleton className="h-5 w-16 bg-slate-800 animate-pulse" />
            <Skeleton className="h-9 w-28 bg-slate-800 animate-pulse rounded-lg" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default function AINews() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchArticles = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await aiNewsAPI.getArticles();
      
      // Handle response defensively to support multiple common backend API envelopes
      const rawData = response?.data || response;
      let parsedArticles = [];
      if (Array.isArray(rawData)) {
        parsedArticles = rawData;
      } else if (Array.isArray(rawData?.articles)) {
        parsedArticles = rawData.articles;
      } else if (Array.isArray(rawData?.data)) {
        parsedArticles = rawData.data;
      } else if (Array.isArray(rawData?.data?.articles)) {
        parsedArticles = rawData.data.articles;
      }

      setArticles(parsedArticles);
    } catch (err) {
      console.error('Failed to fetch AI news:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  // Formatter fallback for dates
  const getDateLabel = (dateStr) => {
    if (!dateStr) return '';
    try {
      const formatted = formatFriendlyDate(dateStr);
      return formatted || new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch (e) {
      return '';
    }
  };

  return (
    <div className="relative min-h-screen w-full px-4 py-8 md:px-8 max-w-7xl mx-auto text-white">
      {/* Animated Background Ornaments */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2 text-blue-400 font-semibold uppercase tracking-wider text-xs">
            <Sparkles className="w-4 h-4" />
            Stay Ahead of the Curve
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            AI Insights & News
          </h1>
          <p className="text-slate-400 text-sm md:text-base mt-2 max-w-2xl leading-relaxed">
            Discover the latest announcements, breakthrough research papers, and industrial trends shaping the future of Artificial Intelligence.
          </p>
        </div>

        {!loading && !error && (
          <Button
            onClick={fetchArticles}
            variant="outline"
            className="flex items-center gap-2 border-slate-700/50 hover:bg-slate-800 text-white"
          >
            <RefreshCcw className="w-4 h-4" />
            Refresh News
          </Button>
        )}
      </div>

      {/* Main Content Area */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <AINewsSkeleton />
          </motion.div>
        ) : error ? (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-8"
          >
            <ErrorState
              onRetry={fetchArticles}
              {...parseApiError(error)}
            />
          </motion.div>
        ) : articles.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-8"
          >
            <EmptyState
              title="No AI News Available"
              description="Our news feed is currently updating. Please check back shortly for the latest updates."
              buttonText="Back to Dashboard"
              onButtonClick={() => navigate('/dashboard')}
              icon={Newspaper}
            />
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8"
          >
            {articles.map((article, index) => {
              const title = article.title || 'Untitled Article';
              const description = article.description || article.summary || article.content || 'No summary description available for this update.';
              const url = article.url || article.link || article.source_url || '#';
              const source = article.source?.name || article.source || article.author || 'AI News';
              const imageUrl = article.image_url || article.imageUrl || article.image || article.thumbnail_url || article.thumbnail || '';
              const publishedAt = article.published_at || article.publishedAt || article.date || article.created_at || '';
              const category = article.category || article.tag || 'AI Breakthrough';

              return (
                <motion.div
                  key={article.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index * 0.05, 0.5) }}
                >
                  <Card className="group h-[450px] flex flex-col border border-slate-800 bg-gradient-to-b from-slate-900/60 to-slate-950/80 backdrop-blur-md hover:border-slate-700/60 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 overflow-hidden">
                    
                    {/* Article Image / Visual Placeholder */}
                    <div className="relative h-48 w-full overflow-hidden bg-slate-950 flex items-center justify-center">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={title}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = ''; // Clear source to trigger fallback block
                          }}
                        />
                      ) : null}
                      
                      {/* Modern Tech fallback when no image URL or loading failed */}
                      {!imageUrl && (
                        <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950 flex flex-col items-center justify-center p-4">
                          <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.02)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
                          <Newspaper className="w-12 h-12 text-slate-700/80 group-hover:text-blue-500/60 transition-colors duration-300" />
                        </div>
                      )}
                      
                      {/* Top Category Badge */}
                      <Badge className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur text-blue-400 border border-blue-500/20 py-1 px-2.5 rounded-full capitalize text-xs">
                        {category}
                      </Badge>
                    </div>

                    {/* Content Section */}
                    <CardContent className="p-5 flex-1 flex flex-col justify-between overflow-hidden">
                      <div className="space-y-3">
                        {/* Meta info */}
                        <div className="flex items-center justify-between text-xs text-slate-400">
                          <span className="font-semibold text-blue-400/90 truncate max-w-[150px]">{source}</span>
                          {publishedAt && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {getDateLabel(publishedAt)}
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <h3 className="font-bold text-white text-base leading-snug tracking-tight line-clamp-2 group-hover:text-blue-400 transition-colors duration-200">
                          {title}
                        </h3>

                        {/* Excerpt Snippet */}
                        <p className="text-slate-400 text-xs md:text-sm line-clamp-3 leading-relaxed">
                          {description}
                        </p>
                      </div>
                    </CardContent>

                    {/* Card Footer */}
                    <CardFooter className="p-5 pt-0 border-t border-slate-800/40 flex items-center justify-end">
                      <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 gap-1.5 ml-auto"
                      >
                        <a href={url} target="_blank" rel="noopener noreferrer">
                          Read Article
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </Button>
                    </CardFooter>

                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
