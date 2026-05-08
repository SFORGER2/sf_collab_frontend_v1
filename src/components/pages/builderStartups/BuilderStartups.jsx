import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Building2, Plus, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { startupsAPI } from '@/utils/APIs/startupsAPI';
import usePaginatedFetch from '@/utils/hooks/usePaginated';
import InfiniteList from '@/components/InfiniteList';
import StartupCard from '@/components/pages/discoverStartups/StartupCard';
import StartupCardSkeleton from '@/components/pages/discoverStartups/StartupCardSkeleton';
import { Button } from '@/components/ui/button';

const BuilderStartups = () => {
  const navigate = useNavigate();
  const { user, access_token } = useSelector((state) => state.auth);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [industries, setIndustries] = useState([]);
  const [stages, setStages] = useState([]);
  const [selectedIndustry, setSelectedIndustry] = useState('All');
  const [selectedStage, setSelectedStage] = useState('All');

  const {
    items: startups,
    total,
    loading,
    targetRef,
  } = usePaginatedFetch({
    fetchFn: ({ page, search }) =>
      startupsAPI.getAll({
        page,
        per_page: 30,
        search: searchQuery,
        builder: true,
        industry: selectedIndustry !== 'All' ? selectedIndustry : undefined,
        stage: selectedStage !== 'All' ? selectedStage : undefined,
      }),
    search: searchQuery,
    objectKey: 'startups',
    enabled: !!access_token && !!user,
  });

  const fetchFilters = async () => {
    try {
      const [industriesData, stagesData] = await Promise.all([
        startupsAPI.getIndustries(),
        startupsAPI.getStages()
      ]);

      if (industriesData.success) setIndustries(industriesData.data.industries);
      if (stagesData.success) setStages(stagesData.data.stages);
    } catch (error) {
      console.error('Error fetching filters:', error);
    }
  };

  useEffect(() => {
    fetchFilters();
  }, []);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedIndustry('All');
    setSelectedStage('All');
  };

  const activeFiltersCount = [
    selectedIndustry !== 'All',
    selectedStage !== 'All',
    searchQuery !== ''
  ].filter(Boolean).length;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />
        <div className="absolute top-1/4 left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-10 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full mx-auto px-2 md:px-4 py-8 w-full relative">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 space-y-4"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                  My Builder Startups
                </h1>
                <p className="text-gray-400 text-sm md:text-base mt-1">
                  Here are your startups you are builder of. Click on any startup to view details, manage your role, and track your contributions.
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/register-startup')}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              Add Startup
            </motion.button>
          </div>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-6 relative"
        >
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 z-10" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search builder startups..."
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-white/20"
          />
        </motion.div>

        {/* Filters */}
        <motion.div
          className="space-y-4 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
        >
          {/* Industry Filter */}
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-3">Industry</p>
            <div className="flex gap-2 flex-wrap">
              {['All', ...industries].map((ind) => (
                <motion.button
                  key={ind}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedIndustry(ind)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                    selectedIndustry === ind
                      ? 'bg-blue-500/20 text-blue-300 border-blue-500/50 shadow-lg shadow-blue-500/10'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20 hover:bg-white/10'
                  }`}
                >
                  {ind === 'All' ? 'All Industries' : ind}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Stage Filter */}
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-3">Stage</p>
            <div className="flex gap-2 flex-wrap">
              {['All', ...stages].map((stage) => (
                <motion.button
                  key={stage}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedStage(stage)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                    selectedStage === stage
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-lg shadow-cyan-500/10'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20 hover:bg-white/10'
                  }`}
                >
                  {stage === 'All' ? 'All Stages' : stage}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Clear Filters */}
          {activeFiltersCount > 0 && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={clearFilters}
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              ✕ Clear Filters ({activeFiltersCount})
            </motion.button>
          )}
        </motion.div>

        {/* Results Info */}
        <motion.div
          className="mb-6 flex items-center justify-between"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-sm text-gray-400">
            {total} {total === 1 ? 'startup' : 'startups'} found
          </p>
        </motion.div>

        {/* Startup Grid */}
        {loading && startups.length === 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <StartupCardSkeleton key={i} />
            ))}
          </div>
        ) : startups.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 bg-gradient-to-br from-white/5 to-white/0 border border-white/10 rounded-2xl backdrop-blur"
          >
            <div className="p-4 bg-blue-500/20 rounded-full mb-4">
              <Building2 className="w-12 h-12 text-blue-400" />
            </div>
            <h3 className="text-lg md:text-xl font-semibold text-white mb-2">
              No startups found
            </h3>
            <p className="text-gray-400 mb-6 text-center max-w-md text-sm">
              Try adjusting your filters or search query to discover more builder startups
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={clearFilters}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-all"
            >
              Clear All Filters
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
          >
            <InfiniteList
              items={startups}
              loading={loading}
              sentinelRef={targetRef}
              renderItem={(startup, index) => (
                <motion.div
                  key={startup.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -2, scale: 1.01 }}
                >
                  <StartupCard
                    startup={startup}
                    index={index}
                  />
                </motion.div>
              )}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default BuilderStartups;