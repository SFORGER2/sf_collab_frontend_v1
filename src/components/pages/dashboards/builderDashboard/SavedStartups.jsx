import React, { useEffect, useMemo, useState } from 'react';
import { Heart, Search, TrendingUp, Layers, Bookmark } from 'lucide-react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { startupsAPI } from '@/utils/APIs/startupsAPI';
import usePaginatedFetch from '@/utils/hooks/usePaginated';
import InfiniteList from '@/components/InfiniteList';
import StartupCard from '@/components/pages/discoverStartups/StartupCard';

const SavedStartups = () => {
  const { user, access_token } = useSelector((state) => state.auth);

  const [searchQuery, setSearchQuery] = useState('');
  const [industryFilter, setIndustryFilter] = useState('all');
  const [stageFilter, setStageFilter] = useState('all');

  const {
    items: savedStartups,
    total,
    loading,
    targetRef,
    refetch
  } = usePaginatedFetch({
    fetchFn: ({ page, search }) =>
      startupsAPI.getBookmarkedStartups(user.id, {
        page,
        search,
        industry: industryFilter !== 'all' ? industryFilter : undefined,
        stage: stageFilter !== 'all' ? stageFilter : undefined,
      }),
    search: searchQuery,
    objectKey: 'startups',
    enabled: !!access_token && !!user,
  });

  useEffect(() => {
    refetch();
  }, [industryFilter, stageFilter]);

  const industries = useMemo(() => [
    'all',
    ...new Set(
      savedStartups
        .map(s => s.startup?.industry || s.industry)
        .filter(Boolean)
    )
  ], [savedStartups]);

  const stages = useMemo(() => [
    'all',
    ...new Set(
      savedStartups
        .map(s => s.startup?.stage || s.stage)
        .filter(Boolean)
    )
  ], [savedStartups]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, ease: 'easeOut' }
    }
  };

  const hasFilters =
    searchQuery ||
    industryFilter !== 'all' ||
    stageFilter !== 'all';

  const kpis = [
    {
      label: 'Saved Startups',
      value: total,
      icon: Heart
    },
    {
      label: 'Industries',
      value: industries.length - 1,
      icon: Layers,
      color: 'from-purple-500 to-indigo-500'
    },
    {
      label: 'Stages',
      value: stages.length - 1,
      icon: TrendingUp,
      color: 'from-orange-500 to-amber-500'
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white px-2 md:px-4 py-8">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(236,72,153,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(236,72,153,0.03)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />
        <div className="absolute top-1/4 left-20 w-72 h-72 bg-rose-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-10 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full mx-auto space-y-8 w-full">
        {/* Header */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-rose-500 to-pink-500 rounded-xl">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-5xl md:text-6xl font-bold text-white">
                Saved Startups
              </h1>
              <p className="text-gray-400 text-lg mt-2">
                Your personal startup watchlist
              </p>
            </div>
          </div>
        </motion.div>

        {/* KPIs */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {kpis.map((kpi, i) => {
            const Icon = kpi.icon;
            return (
              <motion.div
                key={i}
                variants={itemVariants}
                whileHover={{ y: -4, scale: 1.02 }}
                className="group relative overflow-hidden rounded-2xl"
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${kpi.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                <div className="relative bg-slate-900/90 backdrop-blur border border-white/10 group-hover:border-white/20 rounded-2xl p-6 space-y-3 transition-all">
                  <div className="flex items-center justify-between">
                    <Icon className="w-5 h-5 text-white/70" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide">
                      {kpi.label}
                    </p>
                    <p className="text-3xl font-bold text-white mt-2">
                      {kpi.value}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 z-10" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search saved startups..."
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all hover:border-white/20"
            />
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-400 mb-2 uppercase tracking-wide">Industry</p>
              <div className="flex gap-2 flex-wrap">
                {industries.map(ind => (
                  <motion.button
                    key={ind}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIndustryFilter(ind)}
                    className={`px-4 py-2 rounded-lg text-sm border font-medium transition-all ${
                      industryFilter === ind
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-lg shadow-rose-500/10'
                        : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20 hover:bg-white/10'
                    }`}
                  >
                    {ind === 'all' ? 'All Industries' : ind}
                  </motion.button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-400 mb-2 uppercase tracking-wide">Stage</p>
              <div className="flex gap-2 flex-wrap">
                {stages.map(stage => (
                  <motion.button
                    key={stage}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setStageFilter(stage)}
                    className={`px-4 py-2 rounded-lg text-sm border font-medium transition-all ${
                      stageFilter === stage
                        ? 'bg-pink-500/20 text-pink-300 border-pink-500/50 shadow-lg shadow-pink-500/10'
                        : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20 hover:bg-white/10'
                    }`}
                  >
                    {stage === 'all' ? 'All Stages' : stage}
                  </motion.button>
                ))}
              </div>
            </div>

            {hasFilters && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setIndustryFilter('all');
                  setStageFilter('all');
                }}
                className="text-sm text-rose-400 hover:text-rose-300 transition-colors"
              >
                ✕ Clear Filters
              </button>
            )}
          </div>
        </motion.div>

        {/* Results */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="relative"
        >
          {loading && savedStartups.length === 0 ? (
            <div className="flex justify-center py-12">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="rounded-full h-12 w-12 border-3 border-rose-500/20 border-t-rose-500"
              />
            </div>
          ) : savedStartups.length === 0 ? (
            <motion.div
              className="text-center py-20 bg-gradient-to-br from-white/5 to-white/0 border border-white/10 rounded-2xl backdrop-blur"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-rose-500/20 rounded-full">
                  <Bookmark className="w-12 h-12 text-rose-400" />
                </div>
              </div>
              <p className="text-gray-300 text-lg font-semibold">
                No saved startups yet
              </p>
              <p className="text-gray-500 text-sm mt-2">
                Explore startups and bookmark your favorites to see them here
              </p>
            </motion.div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              <InfiniteList
                items={savedStartups}
                loading={loading}
                sentinelRef={targetRef}
                containerClassName="all-unset"
                renderItem={(item, index) => (
                  <motion.div
                    key={item.id}
                    variants={itemVariants}
                  >
                    <StartupCard
                      startup={item.startup || item}
                      index={index}
                    />
                  </motion.div>
                )}
              />
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default SavedStartups;
