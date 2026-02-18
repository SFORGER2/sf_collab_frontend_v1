import React, { useEffect, useMemo, useState } from 'react';
import { Heart, Search, TrendingUp, Layers } from 'lucide-react';
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

  /* --------------------------------------------
   * Derived Filters
   * ------------------------------------------ */
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

  /* --------------------------------------------
   * Motion
   * ------------------------------------------ */
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

  /* --------------------------------------------
   * KPIs
   * ------------------------------------------ */
  const kpis = [
    {
      label: 'Saved Startups',
      value: total,
      icon: Heart,
      color: 'from-rose-500 to-pink-500'
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
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white p-2 md:p-6">
      <div className="w-full mx-auto space-y-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-3">
            <Heart className="w-8 h-8 text-rose-500" fill="currentColor" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-rose-400 to-pink-400 bg-clip-text text-transparent">
              Saved Startups
            </h1>
          </div>
          <p className="text-gray-400 text-lg">
            Your personal startup watchlist
          </p>
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
                whileHover={{ y: -6 }}
                className={`bg-gradient-to-br ${kpi.color} p-0.5 rounded-xl`}
              >
                <div className="bg-slate-900 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-3">
                    <Icon className="w-5 h-5 text-white/70" />
                    <span className="text-xs text-gray-500">Saved</span>
                  </div>
                  <p className="text-xs uppercase tracking-wider text-gray-400">
                    {kpi.label}
                  </p>
                  <p className="text-3xl font-bold">{kpi.value}</p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative"
        >
          <Search className="absolute left-4 top-3 w-5 h-5 text-gray-500" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search saved startups..."
            className="w-full pl-12 pr-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:ring-2 focus:ring-rose-500 outline-none transition"
          />
        </motion.div>

        {/* Filters */}
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-400 mb-2">Industry</p>
            <div className="flex gap-2 flex-wrap">
              {industries.map(ind => (
                <motion.button
                  key={ind}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIndustryFilter(ind)}
                  className={`px-4 py-2 rounded-lg text-sm border transition ${
                    industryFilter === ind
                      ? 'bg-rose-500/30 text-rose-300 border-rose-500/50'
                      : 'bg-white/5 border-white/10 text-gray-400'
                  }`}
                >
                  {ind === 'all' ? 'All' : ind}
                </motion.button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-400 mb-2">Stage</p>
            <div className="flex gap-2 flex-wrap">
              {stages.map(stage => (
                <motion.button
                  key={stage}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setStageFilter(stage)}
                  className={`px-4 py-2 rounded-lg text-sm border transition ${
                    stageFilter === stage
                      ? 'bg-pink-500/30 text-pink-300 border-pink-500/50'
                      : 'bg-white/5 border-white/10 text-gray-400'
                  }`}
                >
                  {stage === 'all' ? 'All' : stage}
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
              className="text-sm text-rose-400 hover:text-rose-300"
            >
              ✕ Clear Filters
            </button>
          )}
        </div>

        {/* Results */}
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
      </div>
    </div>
  );
};

export default SavedStartups;
