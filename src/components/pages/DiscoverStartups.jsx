import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Filter, X, Building2, Users, MapPin, TrendingUp, 
  Code, Mail, ExternalLink, Sparkles, Check, Eye,
  ChevronLeft, ChevronRight, Plus, DollarSign,
  Rocket, Edit3
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Progress } from '../ui/progress';
import ShinyText from "../ui/ShinyText";

import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { startupAPI } from './startupDetails/startUpAPI';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const FUNDING_RANGES = [
  { label: 'Any', min: null, max: null },
  { label: 'Bootstrapped ($0)', min: 0, max: 0 },
  { label: 'Pre-seed ($10K - $500K)', min: 10000, max: 500000 },
  { label: 'Seed ($500K - $2M)', min: 500000, max: 2000000 },
  { label: 'Series A ($2M - $15M)', min: 2000000, max: 15000000 },
  { label: 'Series B+ ($15M+)', min: 15000000, max: null },
  { label: 'Custom', min: null, max: null, custom: true }
];

// Mode configuration
const MODES = {
  discover: {
    headerTitle: 'Discover Your Next',
    headerSubtitle: 'Career Adventure',
    subtitle: 'Join thousands of innovators building the future at fast-growing startups. From pre-seed to Series C, find your perfect match.',
    ctaButton: 'Add Startup',
    ctaRoute: '/register-startup',
    cardCta: 'View Details',
    stats: [
      // { value: '1.2K+', label: 'Active Startups' },
      // { value: '$4.8B', label: 'Total Funding' },
      // { value: '15K+', label: 'Open Roles' },
      // { value: '94%', label: 'Hire Success Rate' }
    ],
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
    stats: null, // Dynamic based on user data
    emptyState: {
      title: "You haven't created any startups yet",
      message: 'Create your first startup to get started. Build something amazing and find the right talent.'
    }
  }
};

const DiscoverStartups = ({ myStartupsOnly = false }) => {
  const [startups, setStartups] = useState([]);
  const [industries, setIndustries] = useState([]);
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("All");
  const [selectedStage, setSelectedStage] = useState("All");
  const [selectedFundingRange, setSelectedFundingRange] = useState("Any");
  const [customMinFunding, setCustomMinFunding] = useState("");
  const [customMaxFunding, setCustomMaxFunding] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [selectedStartup, setSelectedStartup] = useState(null);
  const navigate = useNavigate();
  
  const { user, access_token, refreshToken } = useSelector((state) => state.auth);
  
  const itemsPerPage = 9;
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

  const fetchStartups = async (page = 1) => {
    try {
      setLoading(true);
      const token = access_token;
      if (!token) {
        console.error('No access token found');
        return;
      }
  
      const fundingRange = getFundingRangeValues();
      

      const params = {
        page,
        search: searchQuery,
        per_page: itemsPerPage,
        min_funding: fundingRange.min,
        max_funding: fundingRange.max,
        industry: selectedIndustry !== 'All' ? selectedIndustry : undefined,
        stage: selectedStage !== 'All' ? selectedStage : undefined,
        my_startups: myStartupsOnly ? 'true' : 'false'
      }
      const response = await startupAPI.getAll(token, params);

      const data = response;
  
      if (data.success) {
        setStartups(data.data.startups);
        setTotalPages(data.data.pagination.pages);
        setCurrentPage(data.data.pagination.page);
      }
    } catch (error) {
      console.error('Error fetching startups:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFilters = async () => {
    try {
      const token = access_token;
      if (!token) return;
  
      const [industriesData, stagesData] = await Promise.all([
        startupAPI.getIndustries(token),
        startupAPI.getStages(token)
      ]); 


  
      if (industriesData.success) setIndustries(industriesData.data.industries);
      if (stagesData.success) setStages(stagesData.data.stages);
    } catch (error) {
      console.error('Error fetching filters:', error);
    }
  };

  useEffect(() => {
    fetchStartups();
    if (mode === 'discover') {
      fetchFilters();
    }
  }, []);

  useEffect(() => {
    fetchStartups(1);
  }, [searchQuery, selectedIndustry, selectedStage, selectedFundingRange, customMinFunding, customMaxFunding, myStartupsOnly]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedIndustry("All");
    setSelectedStage("All");
    setSelectedFundingRange("Any");
    setCustomMinFunding("");
    setCustomMaxFunding("");
  };

  const handleStartupClick = (startup) => {

    navigate(`/startup-details/${startup.id}`);
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
              {/* Badge - Only show in discover mode */}
              {/* {mode === 'discover' && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-full px-6 backdrop-blur-sm"
                >
                  <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-pulse" />
                  <Rocket className="w-4 h-4 mr-1" />
                  <span className="text-xs flex items-center font-medium bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
                    1,200+ Startups Ready to Hire
                  </span>
                </motion.div>
              )} */}
              {
                !(startups.length > 0 &&
                !user?.plan_id) &&
              
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
        
        {/* Header */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-2 pb-2 relative overflow-hidden"
        >
          {/* Background Elements - Only in discover mode */}
          {mode === 'discover' && (
            <div className="absolute inset-0 overflow-hidden">
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute -top-20 -left-20 w-40 h-40 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-3xl"
              />
              <motion.div
                animate={{
                  scale: [1.2, 1, 1.2],
                  opacity: [0.4, 0.2, 0.4],
                }}
                transition={{
                  duration: 10,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl"
              />
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.2, 0.4, 0.2],
                }}
                transition={{
                  duration: 12,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute bottom-10 left-1/4 w-24 h-24 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full blur-2xl"
              />
            </div>
          )}
        
          {/* Main Heading */}
          <motion.h1
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
          >
            <span className="">
              <ShinyText
                text={modeConfig.headerTitle}
                disabled={false}
                speed={3}
              />
            </span>
            <br />
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
            >
              <ShinyText
                text={modeConfig.headerSubtitle}
                disabled={false}
                speed={3}
                className='custom-title'
              />
            </motion.span>
          </motion.h1>
        
          {/* Subheading */}
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xl sm:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed"
          >
            {mode === 'discover' && (
              <>
                Join <span className="font-semibold text-white">thousands of innovators</span> building the future at
                fast-growing startups. From pre-seed to Series C, find your perfect match.
              </>
            )}
            {mode === 'myStartups' && (
              <>
                <span className="font-semibold text-white">Manage and grow</span> your startup portfolio. Monitor your companies, edit details, and track performance.
              </>
            )}
          </motion.p>
        
          {/* Stats Grid - Only in discover mode */}
          {mode === 'discover' && (
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-2xl mx-auto"
            >
              {modeConfig.stats.map((stat, idx) => (
                <div key={idx} className="text-center">
                  <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          )}

          {/* Scroll Indicator - Only in discover mode */}
          {mode === 'discover' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="absolute bottom-2 left-1/2 transform -translate-x-1/2"
            >
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-6 h-10 border-2 border-gray-600 rounded-full flex justify-center"
              >
                <motion.div
                  animate={{ y: [0, 12, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-1 h-3 bg-gray-400 rounded-full mt-2"
                />
              </motion.div>
            </motion.div>
          )}
        </motion.div>

        {/* Search & Mobile Filter Toggle */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-6 flex gap-3"
        >
          {mode === 'discover' && (
            <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="md:hidden h-12 relative border-gray-600 bg-gray-800 text-gray-300">
                  <Filter className="w-5 h-5" />
                  {activeFiltersCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">
                      {activeFiltersCount}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 overflow-y-auto bg-gray-800 border-gray-700">
                <MobileFilterSidebar
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
                />
              </SheetContent>
            </Sheet>
          )}
        </motion.div>
        
        {/* Desktop Filters Sidebar - Only in discover mode */}
        {mode === 'discover' && (
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="hidden md:block shrink-0 w-full"
          >
            <div className="w-full">
              <FilterSidebar
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
              />
            </div>
          </motion.div>
        )}

        <div className="flex flex-wrap relative gap-8">
        
          {/* Startup Grid */}
          <div className="flex-1">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-gray-400">
                {startups.length} {startups.length === 1 ? 'startup' : 'startups'} found
              </p>
              {mode === 'discover' && activeFiltersCount > 0 && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-black">
                  Clear all filters
                </Button>
              )}
            </div>

            <AnimatePresence mode="wait">
              {loading ? (
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
                  {startups.map((startup, index) => (
                    <StartupCard
                      key={startup.id}
                      startup={startup}
                      index={index}
                      onClick={() => handleStartupClick(startup)}
                      formatCurrency={formatCurrency}
                      getStageBadgeVariant={getStageBadgeVariant}
                      mode={mode}
                    />
                  ))}
                  
                  {mode === "myStartups" &&
                    startups.length > 0 &&
                    !user?.plan_id && (
                      <motion.div
                        layout
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        className="w-full"
                      >
                        <div
                          onClick={() => {
                            toast.info("You've reached the maximum number of startups for your plan");
                            navigate("/crowdfunding");
                          }}
                          className="
          relative min-h-[220px] cursor-pointer rounded-xl
          border-2 border-dashed border-gray-700
          bg-gray-900/40 backdrop-blur-sm
          flex flex-col items-center justify-center gap-3
          transition-all
          hover:border-blue-500/50 hover:bg-gray-900/60
          hover:shadow-[0_0_40px_-10px_rgba(59,130,246,0.25)]
          group
        "
                        >
                          {/* Icon */}
                          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gray-800/60 group-hover:bg-blue-500/10 transition">
                            <Plus className="w-7 h-7 text-gray-400 group-hover:text-blue-400 transition-colors" />
                          </div>

                          {/* Text */}
                          <div className="text-center">
                            <p className="text-sm font-semibold text-gray-300 group-hover:text-blue-400 transition-colors">
                              Upgrade your plan
                            </p>
                            <p className="text-xs text-gray-500 mt-1 max-w-[240px]">
                              Unlock more startups and advanced features
                            </p>
                          </div>

                          {/* CTA hint */}
                          <span className="mt-2 text-xs text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                            View plans →
                          </span>
                        </div>
                      </motion.div>
                    )}

                </motion.div>
              )}
            </AnimatePresence>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchStartups(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="border-gray-600 text-gray-300"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => fetchStartups(page)}
                    className={currentPage === page
                      ? "bg-blue-500 hover:bg-blue-600"
                      : "border-gray-600 text-gray-300 hover:bg-gray-700"
                    }
                  >
                    {page}
                  </Button>
                ))}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchStartups(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="border-gray-600 text-gray-300"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Desktop Filter Sidebar Component
const FilterSidebar = ({
  industries,
  stages,
  searchQuery,
  setSearchQuery,
  selectedIndustry,
  setSelectedIndustry,
  selectedStage,
  setSelectedStage,
  selectedFundingRange,
  setSelectedFundingRange,
  customMinFunding,
  setCustomMinFunding,
  customMaxFunding,
  setCustomMaxFunding,
  clearFilters,
  activeFiltersCount,
  formatCurrency
}) => (
  <Card className="p-6 bg-transparent border-0 w-full">
    <div className="flex flex-col lg:flex-row gap-6 w-full">
      {/* Search Bar */}
      <div className="flex-1">
        <h4 className="text-sm font-medium text-gray-300 mb-2">Search</h4>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search startups..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-gray-700 border-gray-600 text-white w-full"
            style={{ minWidth: '200px' }}
          />
        </div>
      </div>

      {/* Industry Filter */}
      <div>
        <h4 className="text-sm font-medium text-gray-300 mb-2">Industry</h4>
        <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
          <SelectTrigger style={{width:'150px'}} className="bg-gray-700 border-gray-600 text-white">
            <SelectValue placeholder="All Industries" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-600">
            <SelectItem value="All" className="text-white hover:bg-gray-700">All Industries</SelectItem>
            {industries.map(industry => (
              <SelectItem key={industry} value={industry} className="text-white hover:bg-gray-700">
                {industry}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stage Filter */}
      <div>
        <h4 className="text-sm font-medium text-gray-300 mb-2">Stage</h4>
        <Select value={selectedStage} onValueChange={setSelectedStage}>
          <SelectTrigger style={{width:'150px'}} className="bg-gray-700 border-gray-600 text-white">
            <SelectValue placeholder="All Stages" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-600">
            <SelectItem value="All" className="text-white hover:bg-gray-700">All Stages</SelectItem>
            {stages.map(stage => (
              <SelectItem key={stage} value={stage} className="text-white hover:bg-gray-700">
                {stage.charAt(0).toUpperCase() + stage.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Funding Range Filter */}
      <div>
        <h4 className="text-sm font-medium text-gray-300 mb-2">Funding Range</h4>
        <Select value={selectedFundingRange} onValueChange={setSelectedFundingRange}>
          <SelectTrigger style={{width:'180px'}} className="bg-gray-700 border-gray-600 text-white">
            <SelectValue placeholder="Funding Range" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-600">
            {FUNDING_RANGES.map(range => (
              <SelectItem key={range.label} value={range.label} className="text-white hover:bg-gray-700">
                {range.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedFundingRange !== 'Custom' && selectedFundingRange !== 'Any' && (
          <div className="mt-1">
            <div className="text-xs text-gray-400">
              {(() => {
                const range = FUNDING_RANGES.find(r => r.label === selectedFundingRange);
                if (range?.min !== null && range?.max !== null) {
                  return `${formatCurrency(range.min)} - ${formatCurrency(range.max)}`;
                } else if (range?.min !== null) {
                  return `${formatCurrency(range.min)}+`;
                } else if (range?.max !== null) {
                  return `Up to ${formatCurrency(range.max)}`;
                }
                return 'Any amount';
              })()}
            </div>
          </div>
        )}

        {selectedFundingRange === 'Custom' && (
          <div className="mt-2 space-y-2">
            <div className="flex gap-2 items-center">
              <div className="relative flex-1">
                <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                <Input
                  type="number"
                  placeholder="Min"
                  value={customMinFunding}
                  onChange={(e) => setCustomMinFunding(e.target.value)}
                  className="pl-7 bg-gray-700 border-gray-600 text-white text-xs h-8"
                />
              </div>
              <div className="relative flex-1">
                <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                <Input
                  type="number"
                  placeholder="Max"
                  value={customMaxFunding}
                  onChange={(e) => setCustomMaxFunding(e.target.value)}
                  className="pl-7 bg-gray-700 border-gray-600 text-white text-xs h-8"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Clear Filters Button */}
      {activeFiltersCount > 0 && (
        <div className="flex items-end">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearFilters} 
            className="text-blue-400 hover:border hover:border-blue-300 hover:bg-black hover:text-blue-300 text-xs h-8"
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  </Card>
);

// Mobile Filter Sidebar Component
const MobileFilterSidebar = ({
  industries,
  stages,
  searchQuery,
  setSearchQuery,
  selectedIndustry,
  setSelectedIndustry,
  selectedStage,
  setSelectedStage,
  selectedFundingRange,
  setSelectedFundingRange,
  customMinFunding,
  setCustomMinFunding,
  customMaxFunding,
  setCustomMaxFunding,
  clearFilters,
  activeFiltersCount,
  formatCurrency
}) => (
  <div className="space-y-6 pt-10">
    <div className="flex items-center justify-between">
      <h3 className="font-semibold text-white">Filters</h3>
      {activeFiltersCount > 0 && (
        <Button variant="ghost" size="sm" onClick={clearFilters} className="text-blue-400 hover:text-blue-300 text-xs">
          Clear all
        </Button>
      )}
    </div>

    {/* Search */}
    <div>
      <h4 className="text-sm font-medium text-gray-300 mb-2">Search</h4>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search startups..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 bg-gray-700 border-gray-600 text-white"
        />
      </div>
    </div>

    {/* Industry */}
    <div>
      <h4 className="text-sm font-medium text-gray-300 mb-2">Industry</h4>
      <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
        <SelectTrigger className="w-full bg-gray-700 border-gray-600 text-white">
          <SelectValue placeholder="All Industries" />
        </SelectTrigger>
        <SelectContent className="bg-gray-800 border-gray-600">
          <SelectItem value="All" className="text-white hover:bg-gray-700">All Industries</SelectItem>
          {industries.map(industry => (
            <SelectItem key={industry} value={industry} className="text-white hover:bg-gray-700">
              {industry}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>

    {/* Stage */}
    <div>
      <h4 className="text-sm font-medium text-gray-300 mb-2">Stage</h4>
      <Select value={selectedStage} onValueChange={setSelectedStage}>
        <SelectTrigger className="w-full bg-gray-700 border-gray-600 text-white">
          <SelectValue placeholder="All Stages" />
        </SelectTrigger>
        <SelectContent className="bg-gray-800 border-gray-600">
          <SelectItem value="All" className="text-white hover:bg-gray-700">All Stages</SelectItem>
          {stages.map(stage => (
            <SelectItem key={stage} value={stage} className="text-white hover:bg-gray-700">
              {stage.charAt(0).toUpperCase() + stage.slice(1)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>

    {/* Funding Range */}
    <div>
      <h4 className="text-sm font-medium text-gray-300 mb-2">Funding Range</h4>
      <Select value={selectedFundingRange} onValueChange={setSelectedFundingRange}>
        <SelectTrigger className="w-full bg-gray-700 border-gray-600 text-white">
          <SelectValue placeholder="Funding Range" />
        </SelectTrigger>
        <SelectContent className="bg-gray-800 border-gray-600">
          {FUNDING_RANGES.map(range => (
            <SelectItem key={range.label} value={range.label} className="text-white hover:bg-gray-700">
              {range.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {selectedFundingRange === 'Custom' && (
        <div className="mt-3 space-y-3">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Minimum Funding</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="number"
                placeholder="0"
                value={customMinFunding}
                onChange={(e) => setCustomMinFunding(e.target.value)}
                className="pl-9 bg-gray-700 border-gray-600 text-white"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Maximum Funding</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="number"
                placeholder="No limit"
                value={customMaxFunding}
                onChange={(e) => setCustomMaxFunding(e.target.value)}
                className="pl-9 bg-gray-700 border-gray-600 text-white"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
);

// Startup Card Component
const StartupCard = ({ startup, index, onClick, formatCurrency, getStageBadgeVariant, mode }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 20 }}
    transition={{ delay: index * 0.05 }}
    className="flex-1"
  >
    <Card 
      className="group h-full w-full flex flex-col p-6 hover:shadow-xl transition-all duration-300 cursor-pointer border-gray-700 bg-gray-800/50 backdrop-blur-sm overflow-hidden relative hover:border-blue-500/50"
      onClick={onClick}
    >
      <div className="absolute inset-0 bg-linear-to-br from-blue-500/0 via-blue-600/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:via-blue-600/5 group-hover:to-purple-500/5 transition-all duration-300" />
      
      <div className="relative flex flex-col flex-1">
        <div className="flex items-start gap-4 mb-4">
          {startup.logo_url ? (
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="w-14 h-14 bg-linear-to-br from-blue-500/10 to-blue-600/10 rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-blue-500/20"
            >
              <img loading="lazy" 
                src={`${API_URL}${startup.logo_url}`} 
                alt={startup.name}
                className="w-10 h-10 rounded-lg object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm hidden">
                {startup.name.charAt(0)}
              </div>
            </motion.div>
          ) : (
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="w-14 h-14 bg-linear-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-sm"
            >
              {startup.name.charAt(0)}
            </motion.div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-blue-400 transition-colors line-clamp-1">
              {startup.name}
            </h3>
            <p className="text-sm text-gray-400 flex items-center gap-1">
              <Building2 className="w-3 h-3" />
              {startup.industry}
            </p>
          </div>
          <Badge className={`text-xs border ${getStageBadgeVariant(startup.stage)}`}>
            {startup.stage}
          </Badge>
        </div>

        <p className="text-gray-300 text-sm mb-4 line-clamp-2 flex-1">
          {startup.description || "No description provided"}
        </p>

        {/* Enhanced Funding Display */}
        {startup.funding_amount > 0 && (
          <div className="mb-4 p-3 bg-linear-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-400" />
                <span className="text-sm text-gray-300">Total Funding</span>
              </div>
              <span className="text-lg font-bold text-green-400">
                {formatCurrency(startup.funding_amount)}
              </span>
            </div>
            {startup.funding_round && (
              <div className="text-xs text-green-300 mt-1 capitalize">
                {startup.funding_round.replace('-', ' ')} Round
              </div>
            )}
          </div>
        )}

        <div className="flex flex-wrap gap-2 mb-4">
          {startup.tech_stack && startup.tech_stack.slice(0, 3).map(tech => (
            <Badge key={tech} variant="outline" className="text-xs bg-gray-700/50 border-gray-600 text-gray-300">
              <Code className="w-3 h-3 mr-1" />
              {tech}
            </Badge>
          ))}
          {startup.tech_stack && startup.tech_stack.length > 3 && (
            <Badge variant="outline" className="text-xs bg-gray-700/50 border-gray-600 text-gray-300">
              +{startup.tech_stack.length - 3}
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-700">
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {startup.location || 'Remote'}
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {startup.positions} roles
            </span>
            {mode === 'discover' && (
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {startup.views}
              </span>
            )}
          </div>
          <Button 
            size="sm" 
            variant="ghost"
            className="text-white underline cursor-pointer group-hover:bg-blue-500 group-hover:text-white transition-all border-gray-600"
          >
            {mode === 'discover' ? 'View Details' : (
              <>
                <Edit3 className="w-3 h-3 mr-1" />
                Manage
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  </motion.div>
);

// Skeleton Loading Component
const StartupCardSkeleton = () => (
  <Card className="p-6 border-gray-700 ">
    <div className="flex items-start gap-4 mb-4">
      <div className="w-14 h-14 bg-gray-700 rounded-xl shrink-0"></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-700 rounded w-3/4"></div>
        <div className="h-3 bg-gray-700 rounded w-1/2"></div>
      </div>
      <div className="h-6 bg-gray-700 rounded w-16"></div>
    </div>
    <div className="space-y-2 mb-4">
      <div className="h-3 bg-gray-700 rounded"></div>
      <div className="h-3 bg-gray-700 rounded w-5/6"></div>
    </div>
    <div className="h-12 bg-gray-700 rounded mb-4"></div>
    <div className="flex gap-2 mb-4">
      <div className="h-6 bg-gray-700 rounded w-16"></div>
      <div className="h-6 bg-gray-700 rounded w-20"></div>
    </div>
    <div className="flex justify-between items-center pt-4 border-t border-gray-700">
      <div className="flex gap-4">
        <div className="h-3 bg-gray-700 rounded w-12"></div>
        <div className="h-3 bg-gray-700 rounded w-16"></div>
      </div>
      <div className="h-8 bg-gray-700 rounded w-20"></div>
    </div>
  </Card>
);

export default DiscoverStartups;