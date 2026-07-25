import React, { useEffect, useMemo, useState } from 'react';
import { Eye, Search, TrendingUp, Layers, Mail, AlertCircle, CheckCircle } from 'lucide-react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { ideaAPI } from '@/utils/APIs/ideaAPI';
import usePaginatedFetch from '@/utils/hooks/usePaginated';
import InfiniteList from '@/components/InfiniteList';
import IdeationCard from './IdeationCard';
import { getProfilePicture } from '@/utils/getProfilePicture';

const calculateTimeAgo = (createdAt) => {
  const now = new Date();
  const created = new Date(createdAt);
  const diffMs = now - created;
  const diffHours = Math.abs(Math.floor(diffMs / (1000 * 60 * 60)));
  if (diffHours < 24)
    return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
};

const SavedIdeas = () => {
  const { user } = useSelector((state) => state.auth);
  const { activeRole } = useSelector((state) => state.auth);

  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [industryFilter, setIndustryFilter] = useState('all');

  const {
  items: rawIdeas,
  total,
  loading,
  targetRef,
  refetch
  } = usePaginatedFetch({
  fetchFn: ({ page, search }) =>
    ideaAPI.getIdeaBookmarks({
    page,
    search,
    industry: industryFilter !== 'all' ? industryFilter : undefined,
    stage: stageFilter !== 'all' ? stageFilter : undefined,
    }),
  search: searchQuery,
  objectKey: 'bookmarks',
  enabled: !!user,
  });

  const savedIdeas = useMemo(() => {
  return rawIdeas.map((idea) => ({
    id: idea.id,
    title: idea.title,
    description: idea.description,
    stage: idea.stage,
    category: idea.industry,
    privacy: idea.privacy,
    creatorId: idea.creator?.id,
    imageUrl: idea.imageUrl,
    author: {
    name: `${idea.creator?.firstName || ''} ${idea.creator?.lastName || ''}`,
    role: activeRole,
    avatar: idea.creator ? getProfilePicture(idea.creator) : '',
    id: idea.creator?.id,
    },
    createdAt: new Date(idea.createdAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    }),
    timeAgo: calculateTimeAgo(idea.createdAt),
    likes: idea.likes,
    hasLiked: idea.hasLiked || false,
    hasBookmarked: idea.hasBookmarked || false,
    comments: idea.commentsCount,
    collaborators: idea.teamSize,
    tags: idea.tags || [],
  }));
  }, [rawIdeas, activeRole]);

  useEffect(() => {
  refetch();
  }, [stageFilter, industryFilter]);

  const industries = useMemo(() => [
  'all',
  ...new Set(savedIdeas.map(i => i.category).filter(Boolean))
  ], [savedIdeas]);

  const stages = useMemo(() => [
  'all',
  ...new Set(savedIdeas.map(i => i.stage).filter(Boolean))
  ], [savedIdeas]);

  const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
  }
  };

  const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 }
  }
  };

  const hasFilters = searchQuery || industryFilter !== 'all' || stageFilter !== 'all';

  const kpis = [
  {
    label: 'Saved Ideas',
    value: total,
    icon: Eye,
    color: 'from-blue-500 to-cyan-500'
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
    <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />
    <div className="absolute top-1/4 left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
    <div className="absolute top-1/3 -right-10 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" style={{ animationDelay: '2s' }} />
    </div>

    <div className="w-full mx-auto space-y-8 relative w-full">
    
    {/* Header */}
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center gap-4">
      <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
        <Eye className="w-8 h-8 text-white" />
      </div>
      <div>
        <h1 className="text-5xl md:text-6xl font-bold text-white">
        Saved Ideas
        </h1>
        <p className="text-gray-400 text-lg mt-2">
        Your personal collection of innovative ideas
        </p>
      </div>
      </div>
    </motion.div>

    {/* KPI Stats */}
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
        <div className="relative bg-slate-900/90 backdrop-blur border border-white/10 group-hover:border-blue-500/50 rounded-2xl p-6 space-y-3 transition-all">
          <div className="flex items-center justify-between">
          <div className={`p-2 bg-gradient-to-r ${kpi.color} bg-opacity-20 rounded-lg`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
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
        placeholder="Search saved ideas..."
        className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-white/20"
      />
      </div>

      <div className="space-y-4">
      <div>
        <p className="text-sm text-gray-400 mb-3">Industry</p>
        <div className="flex gap-2 flex-wrap">
        {industries.map(ind => (
          <motion.button
          key={ind}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIndustryFilter(ind)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
            industryFilter === ind
            ? 'bg-blue-600 text-white border-blue-400 shadow-lg shadow-blue-500/20'
            : 'bg-white/5 border-white/10 text-gray-300 hover:border-white/20 hover:bg-white/10'
          }`}
          >
          {ind === 'all' ? 'All Industries' : ind}
          </motion.button>
        ))}
        </div>
      </div>

      <div>
        <p className="text-sm text-gray-400 mb-3">Stage</p>
        <div className="flex gap-2 flex-wrap">
        {stages.map(stage => (
          <motion.button
          key={stage}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setStageFilter(stage)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
            stageFilter === stage
            ? 'bg-cyan-600 text-white border-cyan-400 shadow-lg shadow-cyan-500/20'
            : 'bg-white/5 border-white/10 text-gray-300 hover:border-white/20 hover:bg-white/10'
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
        className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
        >
        ✕ Clear Filters
        </button>
      )}
      </div>
    </motion.div>

    {/* Results Grid */}
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      <InfiniteList
      items={savedIdeas}
      loading={loading}
      sentinelRef={targetRef}
      containerClassName="contents"
      renderItem={(item, index) => (
        <motion.div
        key={item.id || index}
        variants={itemVariants}
        >
        <IdeationCard
          content={item}
          index={index}
        />
        </motion.div>
      )}
      />
    </motion.div>

    {/* Empty State */}
    {!loading && savedIdeas.length === 0 && (
      <motion.div
      className="text-center py-20 bg-gradient-to-br from-white/5 to-white/0 border border-white/10 rounded-2xl backdrop-blur"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      >
      <div className="flex justify-center mb-4">
        <div className="p-4 bg-blue-500/20 rounded-full">
        <Eye className="w-12 h-12 text-blue-400" />
        </div>
      </div>
      <p className="text-gray-300 text-lg font-semibold">
        No saved ideas yet
      </p>
      <p className="text-gray-500 text-sm mt-2">
        Start exploring and save ideas to build your personal collection.
      </p>
      </motion.div>
    )}
    </div>
  </div>
  );
};

export default SavedIdeas;