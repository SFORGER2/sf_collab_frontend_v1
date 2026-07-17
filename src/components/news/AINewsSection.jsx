import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Newspaper, RefreshCw, AlertCircle } from 'lucide-react';
import NewsCard from './NewsCard';
import { NewsCardSkeletonGrid } from './NewsCardSkeleton';
import aiNewsAPI from '@/utils/APIs/aiNewsAPI';

/**
 * Safely extract the articles array from various API response shapes.
 * Handles: { articles: [...] }, { data: { articles: [...] } }, { data: [...] }, [...]
 */
function extractArticles(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.articles)) return data.articles;
  if (data.data) {
    if (Array.isArray(data.data)) return data.data;
    if (Array.isArray(data.data.articles)) return data.data.articles;
  }
  return [];
}

/**
 * AI News Section — fetches articles from GET /api/ai-news/ainews
 * and displays skeleton cards while loading.
 */
export default function AINewsSection() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const fetchNews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await aiNewsAPI.getAINews();
      if (!mountedRef.current) return;

      const list = extractArticles(data);
      setArticles(list);
    } catch (err) {
      if (!mountedRef.current) return;
      console.error('Failed to fetch AI news:', err);
      setError('Unable to load AI news. Please try again later.');
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  return (
    <section className="w-full my-8">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
            <Newspaper className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">AI News</h2>
            <p className="text-sm text-slate-400">Latest in artificial intelligence</p>
          </div>
        </div>

        {!loading && (
          <motion.button
            onClick={fetchNews}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-3 py-2 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </motion.button>
        )}
      </div>

      {/* Loading state — show skeleton cards */}
      {loading && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
            <span className="text-sm text-slate-400">Fetching latest articles...</span>
          </div>
          <NewsCardSkeletonGrid count={6} />
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-16 gap-4"
        >
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <p className="text-slate-400 text-center max-w-sm">{error}</p>
          <button
            onClick={fetchNews}
            className="text-sm text-blue-400 hover:text-blue-300 underline underline-offset-4 transition-colors"
          >
            Try again
          </button>
        </motion.div>
      )}

      {/* Empty state */}
      {!loading && !error && articles.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-16 gap-2"
        >
          <div className="p-4 bg-slate-800/50 border border-white/10 rounded-xl mb-2">
            <Newspaper className="w-8 h-8 text-slate-500" />
          </div>
          <h3 className="text-lg font-semibold text-white">No articles found.</h3>
          <p className="text-slate-400">Try another category.</p>
          <button
            onClick={fetchNews}
            className="mt-4 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg transition-colors text-sm font-medium"
          >
            Clear Filters
          </button>
        </motion.div>
      )}

      {/* Articles grid */}
      {!loading && !error && articles.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence>
            {articles.map((article, idx) => (
              <motion.div
                key={article?.url || article?.id || idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
              >
                <NewsCard article={article} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </section>
  );
}
