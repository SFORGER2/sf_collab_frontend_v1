import { motion } from 'framer-motion';
import { Filter } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import FilterSidebar from './FilterSidebar';
import MobileFilterSidebar from './MobileFilterSidebar';
export default function StartupSearchAndFilter({
  mode,
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
  formatCurrency,
  mobileFiltersOpen,
  setMobileFiltersOpen,
  FUNDING_RANGES,
}) {
  return (
    <>
    <motion.div

          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-6 flex gap-3"
        >{/* Search & Mobile Filter Toggle */}
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
                  fundingRanges={FUNDING_RANGES}
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
                fundingRanges={FUNDING_RANGES}
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
)
}
        </>
  )
}

