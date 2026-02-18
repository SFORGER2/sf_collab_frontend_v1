import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Building2,
  ChevronLeft, ChevronRight, Plus
} from 'lucide-react';
import { Button } from '../../ui/button';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import StartupCard from './StartupCard';
import StartupCardSkeleton from './StartupCardSkeleton';
import StartupsHeader from './StartupsHeader';
import StartupSearchAndFilter from './StartupSearchAndFilter';
import ApplyToStartupModal from './ApplyToStartupModal';
import { startupsAPI } from '@/utils/APIs/startupsAPI';
import usePaginatedFetch from '@/utils/hooks/usePaginated';
import InfiniteList from '@/components/InfiniteList';

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
    ctaButton: 'Add Startup',
    ctaRoute: '/register-startup',
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
    ctaButton: 'Create New Startup',
    ctaRoute: '/register-startup',
    cardCta: 'Manage',
    stats: null,
    emptyState: {
      title: "You haven't created any startups yet",
      message: 'Create your first startup to get started. Build something amazing and find the right talent.'
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
        per_page: 9,
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
    enabled: !!access_token,
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
    if (mode === 'discover') {
      fetchFilters();
    }
  }, [mode]);

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
      idea: 'bg-blue-100 text-blue-700 border-blue-200',
      seed: 'bg-green-100 text-green-700 border-green-200',
      early: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      growth: 'bg-orange-100 text-orange-700 border-orange-200',
      scale: 'bg-purple-100 text-purple-700 border-purple-200'
    };
    return variants[stage] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  return (
    <>
      <div className="min-h-screen">
        <div className="w-full mx-auto px-4 sm:px-6 py-2">
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
                      className={mode === 'myStartups' ? "bg-blue-600 hover:bg-blue-700 text-white" : "text-gray-300 hover:text-black"}
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

          <div className="flex flex-wrap relative gap-8">
            {/* Startup Grid */}
            <div className="flex-1">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-gray-400">
                  {totalStartups} {totalStartups === 1 ? 'startup' : 'startups'} found
                </p>
                {mode === 'discover' && activeFiltersCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="text-black">
                    Clear all filters
                  </Button>
                )}
              </div>

              {loading && startups.length === 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <StartupCardSkeleton key={i} />
                  ))}
                </div>
              ) : startups.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex flex-col items-center justify-center py-20"
                >
                  <div className="w-20 h-20 bg-linear-to-br from-blue-500/10 to-blue-600/10 rounded-2xl flex items-center justify-center mb-4">
                    {mode === 'discover' ? (
                      <Search className="w-10 h-10 text-blue-500" />
                    ) : (
                      <Building2 className="w-10 h-10 text-blue-500" />
                    )}
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {modeConfig.emptyState.title}
                  </h3>
                  <p className="text-gray-400 mb-6 text-center max-w-md">
                    {modeConfig.emptyState.message}
                  </p>
                  {mode === 'discover' ? (
                    <Button onClick={clearFilters} variant="outline" className="border-gray-600 text-black">
                      Clear all filters
                    </Button>
                  ) : (
                    <Button
                      onClick={() => navigate(modeConfig.ctaRoute)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {modeConfig.ctaButton}
                    </Button>
                  )}
                </motion.div>
              ) : (
                <motion.div
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
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DiscoverStartups;
