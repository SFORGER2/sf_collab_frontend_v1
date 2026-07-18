import React, { useCallback, useEffect, useState } from 'react';
import { Rss, Sparkles } from 'lucide-react';
import { aiNewsAPI } from '@/utils/APIs/aiNewsAPI';
import ArticleCard from './components/ArticleCard';
import EmptyState from '@/components/common/EmptyState';
import ErrorState from '@/components/common/ErrorState';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import SearchBar from '@/components/common/SearchBar';
import CategoryFilter from '@/components/common/CategoryFilter';
import SourceFilter from '@/components/common/SourceFilter';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function AINewsPage() {
  // Personalized Tab State
  const [digestData, setDigestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Global Tab State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSource, setSelectedSource] = useState('');
  const [selectedSort, setSelectedSort] = useState('latest');
  const [globalArticles, setGlobalArticles] = useState([]);
  const [globalLoading, setGlobalLoading] = useState(true);
  const [globalError, setGlobalError] = useState(null);

  // Fetch Personalized News
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

  // Fetch Global Ecosystem News
  const fetchGlobalNews = useCallback(async () => {
    setGlobalLoading(true);
    setGlobalError(null);
    try {
      const params = {};
      if (searchQuery) params.search = searchQuery;
      if (selectedCategory) params.category = selectedCategory;
      if (selectedSource) params.source = selectedSource;
      if (selectedSort) params.sort = selectedSort;

      const response = await aiNewsAPI.getNews(params);
      
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

      setGlobalArticles(parsedArticles);
    } catch (err) {
      console.error('AINewsPage: Failed to load global news feed', err);
      setGlobalError(err);
    } finally {
      setGlobalLoading(false);
    }
  }, [searchQuery, selectedCategory, selectedSource, selectedSort]);

  useEffect(() => {
    fetchDigest();
  }, [fetchDigest]);

  useEffect(() => {
    fetchGlobalNews();
  }, [fetchGlobalNews]);

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

              {/* Recommendations list */}
              {!Array.isArray(digestData?.articles) || digestData.articles.length === 0 ? (
                <EmptyState
                  title="No Articles Available"
                  description="We couldn't find any relevant news articles for your profile at the moment. Try updating your profile keywords or preferences."
                  icon={Rss}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {digestData.articles.map((article, idx) => (
                    <ArticleCard key={article.id || idx} article={article} />
                  ))}
                </div>
              )}
            </>
          )}
        </TabsContent>

        {/* Tab 2: Global Ecosystem */}
        <TabsContent value="global" className="space-y-6 pt-2">
          {/* Controls Bar */}
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between border-b border-white/5 pb-6">
            <div className="flex-1 w-full max-w-md">
              <SearchBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                placeholder="Search articles..."
              />
            </div>
            
            <div className="flex items-center gap-3 w-full md:w-auto">
              <span className="text-sm text-slate-400 font-medium whitespace-nowrap">Sort By:</span>
              <Select value={selectedSort} onValueChange={setSelectedSort}>
                <SelectTrigger className="w-full md:w-[180px] bg-slate-900 border-white/10 text-white rounded-xl h-10">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/10 text-white">
                  <SelectItem value="latest">Latest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                  <SelectItem value="impact">Highest Impact</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Categories and Sources Filters */}
          <div className="space-y-4">
            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Categories</span>
              <CategoryFilter
                selectedCategory={selectedCategory}
                onCategoryChange={(cat) => setSelectedCategory(cat === selectedCategory ? '' : cat)}
              />
            </div>
            
            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Sources</span>
              <SourceFilter
                selectedSource={selectedSource}
                onSourceChange={(src) => setSelectedSource(src === selectedSource ? '' : src)}
              />
            </div>
          </div>

          {/* Results Grid */}
          {globalLoading ? (
            renderLoadingSkeletons()
          ) : globalError ? (
            <ErrorState
              title="Failed to Load Global Feed"
              message="An error occurred while fetching the ecosystem articles. Please try again."
              onRetry={fetchGlobalNews}
              type="server"
            />
          ) : globalArticles.length === 0 ? (
            <EmptyState
              title="No Articles Found"
              description="No articles match your search or filter selections. Try adjusting your query or resetting filters."
              icon={Rss}
              buttonText="Clear Filters"
              onButtonClick={() => {
                setSearchQuery('');
                setSelectedCategory('');
                setSelectedSource('');
                setSelectedSort('latest');
              }}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {globalArticles.map((article, idx) => (
                <ArticleCard key={article.id || idx} article={article} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
