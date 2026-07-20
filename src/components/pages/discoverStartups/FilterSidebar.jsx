import { Search, DollarSign } from 'lucide-react';
import { Input } from '../../ui/input';
import { Button } from '../../ui/button';
import { Card } from '../../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';



export default function FilterSidebar({
  industries, stages, searchQuery,
  setSearchQuery, selectedIndustry, setSelectedIndustry,
  selectedStage, setSelectedStage, selectedFundingRange,
  setSelectedFundingRange, customMinFunding, setCustomMinFunding,
  customMaxFunding, setCustomMaxFunding, clearFilters,
  activeFiltersCount, formatCurrency, fundingRanges
}) {
  return (
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
              style={{ minWidth: '200px' }} />
          </div>
        </div>

        {/* Industry Filter */}
        <div>
          <h4 className="text-sm font-medium text-gray-300 mb-2">Industry</h4>
          <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
            <SelectTrigger style={{ width: '150px' }} className="bg-gray-700 border-gray-600 text-white">
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
            <SelectTrigger style={{ width: '150px' }} className="bg-gray-700 border-gray-600 text-white">
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
            <SelectTrigger style={{ width: '180px' }} className="bg-gray-700 border-gray-600 text-white">
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

          {selectedFundingRange !== 'Custom' && selectedFundingRange !== 'Any' && (
            <div className="mt-1">
              <div className="text-xs text-gray-400">
                {(() => {
                  const range = fundingRanges.find(r => r.label === selectedFundingRange);
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
                    className="pl-7 bg-gray-700 border-gray-600 text-white text-xs h-8" />
                </div>
                <div className="relative flex-1">
                  <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={customMaxFunding}
                    onChange={(e) => setCustomMaxFunding(e.target.value)}
                    className="pl-7 bg-gray-700 border-gray-600 text-white text-xs h-8" />
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
}