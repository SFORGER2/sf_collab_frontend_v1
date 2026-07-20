import { Search, DollarSign } from 'lucide-react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';

// Mobile Filter Sidebar Component
export default function MobileFilterSidebar({
  industries, stages, searchQuery,
  setSearchQuery, selectedIndustry, setSelectedIndustry,
  selectedStage, setSelectedStage, selectedFundingRange,
  setSelectedFundingRange, customMinFunding, setCustomMinFunding,
  customMaxFunding, setCustomMaxFunding, clearFilters,
  activeFiltersCount, formatCurrency, fundingRanges
}) {
  return (
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
            className="pl-9 bg-gray-700 border-gray-600 text-white" />
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
            {fundingRanges.map(range => (
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
                  className="pl-9 bg-gray-700 border-gray-600 text-white" />
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
                  className="pl-9 bg-gray-700 border-gray-600 text-white" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}