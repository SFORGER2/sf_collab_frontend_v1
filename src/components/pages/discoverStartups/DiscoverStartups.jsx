/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Building2,
  ChevronLeft, ChevronRight, Plus, Flame, Mail, Briefcase, AlertCircle, Lightbulb
} from 'lucide-react';
import { Button } from '../../ui/button';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import StartupCard from './StartupCard';
import StartupCardSkeleton from './StartupCardSkeleton';
import StartupsHeader from './StartupsHeader';
import StartupSearchAndFilter from './StartupSearchAndFilter';
import VisionCard from './VisionCard';
import ActivityItem from './ActivityItem';
import { startupsAPI } from '@/utils/APIs/startupsAPI';
import { discoveryFeedAPI } from '@/utils/APIs/discoveryFeedAPI';
import usePaginatedFetch from '@/utils/hooks/usePaginated';
import InfiniteList from '@/components/InfiniteList';

import { parseApiError } from '@/utils/APIs/parseApiError';
import ErrorState from '@/components/common/ErrorState';
import EmptyState from '../../common/EmptyState';

const FUNDING_RANGES = [
  { label: 'Any', min: null, max: null },
  { label: 'Bootstrapped ($0)', min: 0, max: 0 },
  { label: 'Pre-seed ($10K - $500K)', min: 10000, max: 500000 },
  { label: 'Seed ($500K - $2M)', min: 500000, max: 2000000 },
  { label: 'Series A ($2M - $15M)', min: 2000000, max: 15000000 },
  { label: 'Series B+ ($15M+)', min: 15000000, max: null },
  { label: 'Custom', min: null, max: null, custom: true }
];

const MODES = {
  discover: {
    headerTitle: 'Discover Your Next',
    headerSubtitle: 'Career Adventure',
    subtitle: 'Join thousands of innovators building the future at fast-growing startups. From pre-seed to Series C, find your perfect match.',
    ctaButton: 'Create a Vision',
    ctaRoute: '/ideation',
    cardCta: 'View Details',
    stats: [],
    emptyState: {
      title: 'No startups found',
      message: 'Try adjusting your filters or search query to discover more opportunities'
    }
  },
  myStartups: {
    headerTitle: 'My',
    headerSubtitle: 'Startups',
    subtitle: 'Manage and grow your startup portfolio. Monitor your companies, edit details, and track performance.',
    ctaButton: 'New Vision',
    ctaRoute: '/ideation',
    cardCta: 'Manage',
    stats: null,
    emptyState: {
      title: "You haven't created any startups yet",
      message: 'Start by creating a Vision. Once your Vision reaches readiness, you can activate it as a Startup.'
    }
  }
};

const DiscoverStartups = ({ myStartupsOnly = false }) => {
  const [industries, setIndustries] = useState([]);
  const [stages, setStages] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("All");
  const [selectedStage, setSelectedStage] = useState("All");
  const [selectedFundingRange, setSelectedFundingRange] = useState("Any");
  const [customMinFunding, setCustomMinFunding] = useState("");
  const [customMaxFunding, setCustomMaxFunding] = useState("");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [topStartups, setTopStartups] = useState([]);
  const [topStartupsLoading, setTopStartupsLoading] = useState(false);
  const [error, setError] = useState(null);       // legacy plain-string errors
  const [errorInfo, setErrorInfo] = useState(null); // parsed structured error

  // New discovery feed state
  const [feedSections, setFeedSections] = useState({
    visions: [],
    startups: [],
    milestones: [],
    fastGrowing: []
  });
  const [feedLoading, setFeedLoading] = useState(false);

  const navigate = useNavigate();
  
  const { user, access_token } = useSelector((state) => state.auth);
  const mode = myStartupsOnly ? 'myStartups' : 'discover';
  const modeConfig = MODES[mode];



  const getFundingRangeValues = () => {
    if (selectedFundingRange === 'Custom') {
      return {
        min: customMinFunding ? parseFloat(customMinFunding) : null,
        max: customMaxFunding ? parseFloat(customMaxFunding) : null
      };
    }
    
    const range = FUNDING_RANGES.find(r => r.label === selectedFundingRange);
    return {
      min: range?.min || null,
      max: range?.max || null
    };
  };

  const buildSearchString = () => {
    const fundingRange = getFundingRangeValues();
    const filters = [];
    
    if (searchQuery) filters.push(`search:${searchQuery}`);
    if (selectedIndustry !== 'All') filters.push(`industry:${selectedIndustry}`);
    if (selectedStage !== 'All') filters.push(`stage:${selectedStage}`);
    if (fundingRange.min !== null) filters.push(`min_funding:${fundingRange.min}`);
    if (fundingRange.max !== null) filters.push(`max_funding:${fundingRange.max}`);
    
    return filters.join('|');
  };

  const {
    items: startups,
    total: totalStartups,
    loading,
    targetRef,
  } = usePaginatedFetch({
    fetchFn: ({ page, search }) => {
      const fundingRange = getFundingRangeValues();
      return startupsAPI.getAll({
        page,
        per_page: 30,
        search: searchQuery,
        industry: selectedIndustry !== 'All' ? selectedIndustry : undefined,
        stage: selectedStage !== 'All' ? selectedStage : undefined,
        min_funding: fundingRange.min,
        max_funding: fundingRange.max,
        my_startups: myStartupsOnly ? 'true' : 'false'
      }, access_token);
    },
    search: buildSearchString(),
    objectKey: 'startups',
    enabled: !!access_token && mode === 'myStartups',
  });

  const fetchFilters = async () => {
    try {
      const [industriesData, stagesData] = await Promise.all([
        startupsAPI.getIndustries(),
        startupsAPI.getStages()
      ]); 
  
      if (industriesData.success) setIndustries(industriesData.data.industries);
      if (stagesData.success) setStages(stagesData.data.stages);
    } catch (err) {
      console.error('Error fetching filters:', err);
      const parsed = parseApiError(err);
      setError(parsed.message);
      setErrorInfo(parsed);
    }
  };

  const fetchTopStartups = async () => {
    try {
      setTopStartupsLoading(true);
      setError(null);
      setErrorInfo(null);
      const data = await startupsAPI.getTopStartups();
      if (data.success) {
        setTopStartups(data.data.startups || []);
      }
    } catch (err) {
      console.error('Error fetching top startups:', err);
      const parsed = parseApiError(err);
      setError(parsed.message);
      setErrorInfo(parsed);
    } finally {
      setTopStartupsLoading(false);
    }
  };

  useEffect(() => {
    if (mode === 'discover') {
      fetchFilters();
      // fetchTopStartups(); // Replaced by feedSections.fastGrowing
    }
  }, [mode]);

  // Feed fetching effect
  useEffect(() => {
    if (mode === 'discover' && access_token) {
      const fetchDiscoveryFeed = async () => {
        setFeedLoading(true);
        try {
          const response = await discoveryFeedAPI.getFeed({
            sector: selectedIndustry !== 'All' ? selectedIndustry : '',
            search: searchQuery,
          }, access_token);
          if (response.success && response.sections) {
            setFeedSections(response.sections);
          }
        } catch (error) {
          console.error('Error fetching discovery feed:', error);
          setError('Failed to load discovery feed');
        } finally {
          setFeedLoading(false);
        }
      };
      
      const timeoutId = setTimeout(() => {
        fetchDiscoveryFeed();
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
  }, [mode, access_token, searchQuery, selectedIndustry, selectedStage, selectedFundingRange, customMinFunding, customMaxFunding]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedIndustry("All");
    setSelectedStage("All");
    setSelectedFundingRange("Any");
    setCustomMinFunding("");
    setCustomMaxFunding("");
  };

  const activeFiltersCount = [
    selectedIndustry !== "All",
    selectedStage !== "All",
    searchQuery !== "",
    selectedFundingRange !== "Any"
  ].filter(Boolean).length;

  const formatCurrency = (amount) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}K`;
    }
    return `$${amount}`;
  };

  const getStageBadgeVariant = (stage) => {
    const variants = {
      idea: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      seed: 'bg-green-500/20 text-green-300 border-green-500/30',
      early: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      growth: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
      scale: 'bg-purple-500/20 text-purple-300 border-purple-500/30'
    };
    return variants[stage] || 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  };

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
    <>
      <div className="min-h-screen bg-black">
        {/* Animated Background */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />
          <div className="absolute top-1/4 left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/3 -right-10 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
        </div>

        <div className="w-full mx-auto px-4 sm:px-6 py-2 relative">
          {/* Navigation */}
          <motion.nav
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="sticky top-0 z-50"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                {
                  !(startups.length > 0 && !user?.plan_id) &&
                  <div className="hidden md:flex items-center gap-4 ml-auto">
                    <Button
                      variant={mode === 'myStartups' ? "default" : "ghost"}
                      size="sm"
                      className={mode === 'myStartups' ? "bg-blue-600 hover:bg-blue-700 text-white" : "text-gray-300 hover:text-white"}
                      onClick={() => navigate(modeConfig.ctaRoute)}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      {modeConfig.ctaButton}
                    </Button>
                  </div>
                }
              </div>
            </div>
          </motion.nav>
          
          <StartupsHeader mode={mode} modeConfig={modeConfig} />

          {/* Error Message */}
          {errorInfo ? (
            <ErrorState
              title={errorInfo.title}
              message={errorInfo.message}
              type={errorInfo.type}
              onRetry={() => {
                setError(null);
                setErrorInfo(null);
                fetchFilters();
              }}
              className="mb-8"
            />
          ) : error ? (
            <motion.div
              className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3 text-red-300 backdrop-blur mb-8"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </motion.div>
          ) : null}

          {/* Hidden Trending Now block, replaced via Feed Sections below filters */}

          <StartupSearchAndFilter
            mode={mode}
            industries={industries}
            stages={stages}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedIndustry={selectedIndustry}
            setSelectedIndustry={setSelectedIndustry}
            selectedStage={selectedStage}
            setSelectedStage={setSelectedStage}
            selectedFundingRange={selectedFundingRange}
            setSelectedFundingRange={setSelectedFundingRange}
            customMinFunding={customMinFunding}
            setCustomMinFunding={setCustomMinFunding}
            customMaxFunding={customMaxFunding}
            setCustomMaxFunding={setCustomMaxFunding}
            clearFilters={clearFilters}
            activeFiltersCount={activeFiltersCount}
            formatCurrency={formatCurrency}
            mobileFiltersOpen={mobileFiltersOpen}
            setMobileFiltersOpen={setMobileFiltersOpen}
            FUNDING_RANGES={FUNDING_RANGES}
          />

          <div className="flex flex-wrap relative gap-8 mt-12">
            {mode === 'discover' ? (
              <div className="flex-1">
              {feedLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {[...Array(6)].map((_, i) => <StartupCardSkeleton key={i} />)}
                </div>
              ) : (
                (!feedSections?.visions?.length && !feedSections?.startups?.length && !feedSections?.fastGrowing?.length && !feedSections?.milestones?.length) ? (
                  <EmptyState
                    title="No startups found"
                    description="Try adjusting your filters or search query to discover more opportunities."
                    buttonText="Clear all filters"
                    onButtonClick={clearFilters}
                    icon={Search}
                  />
                ) : (
                    <div className="space-y-16 mt-4">
                       
                       {/* Section: Trending Now */}
                       {feedSections?.fastGrowing && feedSections.fastGrowing.length > 0 && (
                          <motion.div variants={containerVariants} initial="hidden" animate="visible">
                              <div className="flex items-center gap-2 mb-6">
                                <Flame className="w-6 h-6 text-orange-500" />
                                <h2 className="text-2xl font-bold text-white tracking-tight">Trending Now</h2>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                 {feedSections.fastGrowing.map((startup, i) => (
                                    <motion.div key={startup.id} variants={itemVariants}>
                                      <StartupCard startup={startup} index={i} getStageBadgeVariant={getStageBadgeVariant} mode={mode} />
                                    </motion.div>
                                 ))}
                              </div>
                          </motion.div>
                       )}

                       {/* Section: Visions */}
                       {feedSections?.visions && feedSections.visions.length > 0 && (
                          <motion.div variants={containerVariants} initial="hidden" animate="visible">
                              <div className="flex items-center gap-2 mb-6">
                                <Lightbulb className="w-6 h-6 text-purple-400" />
                                <h2 className="text-2xl font-bold text-white tracking-tight">Visions Exploring Ideas</h2>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                 {feedSections.visions.map((vision, i) => (
                                    <motion.div key={vision.id} variants={itemVariants}>
                                      <VisionCard vision={vision} />
                                    </motion.div>
                                 ))}
                              </div>
                          </motion.div>
                       )}

                       {/* Section: Startups Recruiting */}
                       {feedSections?.startups && feedSections.startups.length > 0 && (
                          <motion.div variants={containerVariants} initial="hidden" animate="visible">
                              <div className="flex items-center gap-2 mb-6">
                                <Briefcase className="w-6 h-6 text-blue-400" />
                                <h2 className="text-2xl font-bold text-white tracking-tight">Startups Recruiting</h2>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                 {feedSections.startups.map((startup, i) => (
                                    <motion.div key={startup.id} variants={itemVariants}>
                                      <StartupCard startup={startup} index={i} getStageBadgeVariant={getStageBadgeVariant} mode={mode} />
                                    </motion.div>
                                 ))}
                              </div>
                          </motion.div>
                       )}

                       {/* Section: Recent Activity */}
                       {feedSections?.milestones && feedSections.milestones.length > 0 && (
                          <motion.div variants={containerVariants} initial="hidden" animate="visible">
                              <div className="flex items-center gap-2 mb-6">
                                <AlertCircle className="w-6 h-6 text-green-400" />
                                <h2 className="text-2xl font-bold text-white tracking-tight">Recent Activity</h2>
                              </div>
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                 {feedSections.milestones.map((activity, i) => (
                                    <motion.div key={activity.id} variants={itemVariants}>
                                      <ActivityItem activity={activity} />
                                    </motion.div>
                                 ))}
                              </div>
                          </motion.div>
                       )}

                    </div>
                  )
                )}
              </div>
            ) : (
              <div className="flex-1">
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-sm text-gray-400">
                    {totalStartups} {totalStartups === 1 ? 'startup' : 'startups'} found
                  </p>
                  {mode === 'discover' && activeFiltersCount > 0 && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={clearFilters}
                      className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      Clear all filters
                    </motion.button>
                  )}
                </div>

                {loading && startups.length === 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                      <StartupCardSkeleton key={i} />
                    ))}
                  </div>
                ) : startups.length === 0 ? (
                  <EmptyState
                    title={modeConfig.emptyState.title}
                    description={modeConfig.emptyState.message}
                    buttonText={mode === 'discover' ? "Clear all filters" : modeConfig.ctaButton}
                    onButtonClick={mode === 'discover' ? clearFilters : () => navigate(modeConfig.ctaRoute)}
                    icon={mode === 'discover' ? Search : Building2}
                  />
                ) : (
                  <div
                    layout
                    className="md:grid flex flex-col gap-6 w-full"
                    style={{
                      gridTemplateColumns: 'repeat(auto-fill, minmax(480px, 1fr))'
                    }}
                  >
                    <InfiniteList
                      items={startups}
                      renderItem={(startup, index) => (
                        <StartupCard
                          key={startup.id}
                          startup={startup}
                          index={index}
                          getStageBadgeVariant={getStageBadgeVariant}
                          mode={mode}
                        />
                      )}
                      sentinelRef={targetRef}
                      loading={loading}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default DiscoverStartups;
