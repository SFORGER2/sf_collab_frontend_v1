import React, { useCallback, useEffect, useState } from 'react';
import { Rss, Sparkles } from 'lucide-react';
import { aiNewsAPI } from '@/utils/APIs/aiNewsAPI';
import ArticleCard from './components/ArticleCard';
import EmptyState from '@/components/common/EmptyState';
import ErrorState from '@/components/common/ErrorState';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';

export default function AINewsPage() {
  const [digestData, setDigestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const fetchDigest = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await aiNewsAPI.getDigest();
      if (response && response.success) {
        setDigestData(response.data);
      } else {
        setError(new Error(response?.error || 'Failed to fetch AI news digest'));
      }
    } catch (err) {
      console.error('AINewsPage: Failed to load personalized digest', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDigest();
  }, [fetchDigest]);

  // Loading skeleton layout matching the article card grid
  const renderLoadingSkeletons = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-slate-950/80 p-6 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-24 bg-slate-800" />
              <Skeleton className="h-5 w-16 bg-slate-800" />
            </div>
            <Skeleton className="h-6 w-full bg-slate-800" />
            <Skeleton className="h-4 w-[90%] bg-slate-800" />
            <Skeleton className="h-4 w-[75%] bg-slate-800" />
          </div>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Skeleton className="h-4 w-12 bg-slate-800" />
              <Skeleton className="h-4 w-16 bg-slate-800" />
            </div>
            <Skeleton className="h-10 w-full rounded-xl bg-slate-800" />
          </div>
        </div>
      ))}
    </div>
  );

  // Extract categories dynamically
  const categories = ['All', ...new Set((digestData?.articles || []).map(a => a.category).filter(Boolean))];

  const filteredArticles = selectedCategory === 'All'
    ? (digestData?.articles || [])
    : (digestData?.articles || []).filter(a => a.category === selectedCategory);

  return (
    <div className="min-h-screen w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-black text-white">
      {/* Animated Background Gradients */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />
        <div className="absolute top-1/4 left-10 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-10 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      {/* Page Header */}
      <div className="border-b border-white/5 pb-6">
        <h1 className="flex items-center gap-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
          <Rss className="w-8 h-8 text-blue-500" />
          AI News Feed
        </h1>
        <p className="mt-1 text-sm text-slate-400 sm:text-base">
          Curated industry updates, market insights, and trend signals personalized for you.
        </p>
      </div>

      {/* Tabs Layout */}
      <Tabs defaultValue="for-you" className="w-full space-y-6">
        <TabsList className="bg-slate-900 border border-white/10 p-1 rounded-xl">
          <TabsTrigger value="for-you" className="px-4 py-2 text-sm font-semibold tracking-wide">
            For You
          </TabsTrigger>
          <TabsTrigger value="global" className="px-4 py-2 text-sm font-semibold tracking-wide">
            Global Ecosystem
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: For You */}
        <TabsContent value="for-you" className="space-y-6">
          {loading ? (
            renderLoadingSkeletons()
          ) : error ? (
            <ErrorState
              title="Failed to Load AI News"
              message="An error occurred while loading your personalized news feed. Please try again."
              onRetry={fetchDigest}
              type="server"
            />
          ) : (
            <>
              {/* Profile Prompt Banner (When personalized is false) */}
              {digestData?.personalized === false && (
                <div className="relative overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-r from-amber-500/5 to-orange-500/5 p-5 sm:p-6 backdrop-blur-xl">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h4 className="text-base font-bold text-amber-400">Personalization Not Active</h4>
                      <p className="text-sm text-slate-300">
                        Complete your Startup profile to receive personalized AI News.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Personalized Interests Badges (When personalized is true) */}
              {digestData?.personalized === true && Array.isArray(digestData.interests) && digestData.interests.length > 0 && (
                <div className="flex flex-col gap-3 rounded-2xl border border-white/5 bg-slate-900/30 p-4 sm:p-5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Your Personalized Interests
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {digestData.interests.map((interest) => (
                      <span
                        key={interest}
                        className="inline-flex items-center gap-1 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-300"
                      >
                        <Sparkles className="size-3" />
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Category Filter Chips */}
              {digestData?.articles?.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide" data-testid="category-filter">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all text-sm font-medium border ${
                        selectedCategory === category
                          ? "bg-blue-500 text-white border-blue-500 shadow-lg shadow-blue-500/20"
                          : "bg-gray-800 text-gray-300 hover:bg-gray-700 border-gray-700"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              )}

              {/* Recommendations list */}
              {!Array.isArray(digestData?.articles) || digestData.articles.length === 0 ? (
                <EmptyState
                  title="No Articles Available"
                  description="We couldn't find any relevant news articles for your profile at the moment. Try updating your profile keywords or preferences."
                  icon={Rss}
                />
              ) : filteredArticles.length === 0 ? (
                <EmptyState
                  title="No articles found."
                  description="Try another category."
                  buttonText="Clear Filters"
                  onButtonClick={() => setSelectedCategory('All')}
                  icon={Rss}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredArticles.map((article, idx) => (
                    <ArticleCard key={article.id || idx} article={article} />
                  ))}
                </div>
              )}
            </>
          )}
        </TabsContent>

        {/* Tab 2: Global Ecosystem (Placeholder) */}
        <TabsContent value="global" className="pt-6">
          <EmptyState
            title="Global Feed Coming Soon"
            description="We are currently index-aggregating global startup feeds. Check back soon for broader global market news."
            buttonText="Back to For You"
            onButtonClick={() => {
              // Direct state change is not possible on Radix TabsPrimitive without controlled value,
              // but we can let the user switch naturally.
            }}
            icon={Rss}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
