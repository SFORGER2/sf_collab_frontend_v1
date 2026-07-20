import React from 'react';
import { DollarSign, InfoIcon, Minus, Plus, BarChart3, TargetIcon, TrendingUp, Calendar } from 'lucide-react';
import { CardDescription, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/utils';
import { fundingRounds } from '../elements';
import { Textarea } from '@/components/ui/textarea';



export default function StartupFinancialForm({
  formData,
  handleInputChange,
  handleFinancialChange,
}) {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="text-center mb-6">
        <div className="w-16 h-16 rounded-2xl bg-blue-400/10 border border-blue-400/30 flex items-center justify-center mx-auto mb-4">
          <DollarSign className="w-8 h-8 text-blue-400" />
        </div>
        <CardTitle className="text-2xl mb-2 text-white">Financial Foundation</CardTitle>
        <CardDescription className="text-gray-300">Share your financial metrics to attract the right talent</CardDescription>
      </div>
                  
      <div className="grid md:grid-cols-2 gap-5">
        <div className="space-y-3">
          <Label htmlFor="fundingRound" className="text-sm font-medium text-white flex items-center gap-2  justify-between w-full">
            Funding Round
            <Tooltip>
              <TooltipTrigger asChild>
                <button type="button" className="rounded-full p-1 hover:bg-gray-600 transition-colors">
                  <InfoIcon className="size-4 text-gray-400" />
                </button>
              </TooltipTrigger>
              <TooltipContent arrowColor="bg-gray-800 fill-gray-800" className="max-w-xs bg-gray-800 fill-gray-800 border-gray-600 text-white">
                <p>Current funding stage. Transparency about funding helps candidates assess company stability and growth potential.</p>
              </TooltipContent>
            </Tooltip>
          </Label>
          <Select value={formData.funding_round} onValueChange={(value) => handleInputChange("funding_round", value)}>
            <SelectTrigger style={{ height: '45px' }} className="w-full pl-14 border-gray-600 bg-gray-700/50 text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all">
              <SelectValue placeholder="Select funding round" />
            </SelectTrigger>
            <SelectContent style={{ width: '100%' }} className="bg-gray-800 border-gray-600 text-white">
              {fundingRounds.map(round => (
                <SelectItem key={round.value} value={round.value} className="text-white hover:bg-gray-700  focus:bg-gray-700">
                  <div className="flex flex-col">
                    <span className='text-white hover:text-blue-400'>{round.label}</span>
                    <span className="text-xs text-gray-400">{round.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
                  
        <div className="space-y-3">
          <Label htmlFor="fundingAmount" className="text-sm font-medium text-white flex items-center gap-2  justify-between w-full">
            Total Funding Raised
            <Tooltip>
              <TooltipTrigger asChild>
                <button type="button" className="rounded-full p-1 hover:bg-gray-600 transition-colors">
                  <InfoIcon className="size-4 text-gray-400" />
                </button>
              </TooltipTrigger>
              <TooltipContent arrowColor="bg-gray-800 fill-gray-800" className="max-w-xs bg-gray-800 fill-gray-800 border-gray-600 text-white">
                <p>Cumulative amount raised from all funding rounds. Shows investor confidence and financial backing.</p>
              </TooltipContent>
            </Tooltip>
          </Label>
          <div className="relative">
            <DollarSign className="absolute right-14 top-3.5 text-gray-400" size={20} />
            <div className="relative">
              <DollarSign className="absolute right-14 top-3.5 text-gray-400" size={20} />
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => handleFinancialChange("funding_amount", Math.max(0, formData.funding_amount - 1000))}
                  size="icon"
                  type="button"
                  // variant=""
                  style={{ zIndex: 99999, cursor: 'pointer' }}
                  className="rounded-full bg-gray-700/70 border border-gray-600 "
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  id="fundingAmount"
                  type="number"
                  value={formData.funding_amount}
                  onChange={(e) => handleFinancialChange("funding_amount", e.target.value)}
                  className="pl-12 h-11.5 border-gray-600 bg-gray-700/50 text-white placeholder-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all"
                  placeholder="0"
                  min="0"
                  step="1000"
                />
                <Button
                  onClick={() => handleFinancialChange("funding_amount", formData.funding_amount + 1000)}
                  size="icon"
                  type="button"
                  // variant=""
                  style={{ zIndex: 99999, cursor: 'pointer' }}
                  className="rounded-full bg-gray-700/70 border border-gray-600 "
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          {formData.funding_amount > 0 && (
            <p className="text-xs text-blue-400">{formatCurrency(formData.funding_amount)}</p>
          )}
        </div>
                  
        <div className="space-y-3">
          <Label htmlFor="revenue" className="text-sm font-medium text-white flex items-center gap-2  justify-between w-full">
            Annual Revenue
            <Tooltip>
              <TooltipTrigger asChild>
                <button type="button" className="rounded-full p-1 hover:bg-gray-600 transition-colors">
                  <InfoIcon className="size-4 text-gray-400" />
                </button>
              </TooltipTrigger>
              <TooltipContent arrowColor="bg-gray-800 fill-gray-800" className="max-w-xs bg-gray-800 fill-gray-800 border-gray-600 text-white">
                <p>Total annual revenue generated. Important for revenue-stage startups to show traction and market validation.</p>
              </TooltipContent>
            </Tooltip>
          </Label>
          <div className="relative">
            <BarChart3 className="absolute right-14 top-3.5 text-gray-400" size={20} />
            <div className="flex items-center gap-2">
              <Button
                onClick={() => handleFinancialChange("revenue", Math.max(0, formData.revenue - 1000))}
                size="icon"
                type="button"
                // variant="outline"
                className="rounded-full bg-gray-700/70 border border-gray-600 "
                style={{ zIndex: 99999, cursor: 'pointer' }}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                id="revenue"
                type="number"
                value={formData.revenue}
                onChange={(e) => handleFinancialChange("revenue", e.target.value)}
                className="pl-12 h-11.5 border-gray-600 bg-gray-700/50 text-white placeholder-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all"
                placeholder="0"
                min="0"
                step="1000"
              />
              <Button
                onClick={() => handleFinancialChange("revenue", formData.revenue + 1000)}
                size="icon"
                type="button"
                // variant="outline"
                className="rounded-full bg-gray-700/70 border border-gray-600 "
                style={{ zIndex: 99999, cursor: 'pointer' }}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {formData.revenue > 0 && (
            <p className="text-xs text-blue-400">{formatCurrency(formData.revenue)}</p>
          )}
        </div>
                  
        <div className="space-y-3">
          <Label htmlFor="valuation" className="flex justify-between w-full text-sm font-medium text-white  items-center gap-2">
            Company Valuation
            <Tooltip>
              <TooltipTrigger asChild>
                <button type="button" className="rounded-full p-1 hover:bg-gray-600 transition-colors">
                  <InfoIcon className="size-4 text-gray-400" />
                </button>
              </TooltipTrigger>
              <TooltipContent arrowColor="bg-gray-800 fill-gray-800" className="max-w-xs bg-gray-800 fill-gray-800 border-gray-600 text-white">
                <p>Current company valuation from your latest funding round. Indicates market potential and growth expectations.</p>
              </TooltipContent>
            </Tooltip>
          </Label>
          <div className="relative">
            <TargetIcon className="absolute right-14 top-3.5 text-gray-400" size={20} />
            <div className="flex items-center gap-2">
              <Button
                onClick={() => handleFinancialChange("valuation", Math.max(0, formData.valuation - 1000))}
                size="icon"
                type="button"
                // variant="outline"
                className="rounded-full bg-gray-700/70 border border-gray-600 "
                style={{ zIndex: 99999, cursor: 'pointer' }}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                id="valuation"
                type="number"
                value={formData.valuation}
                onChange={(e) => handleFinancialChange("valuation", e.target.value)}
                className="pl-12 h-11.5 border-gray-600 bg-gray-700/50 text-white placeholder-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all"
                placeholder="0"
                min="0"
                step="1000"
              />
              <Button
                onClick={() => handleFinancialChange("valuation", formData.valuation + 1000)}
                size="icon"
                type="button"
                // variant="outline"
                className="rounded-full bg-gray-700/70 border border-gray-600 "
                style={{ zIndex: 99999, cursor: 'pointer' }}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
  
          {formData.valuation > 0 && (
            <p className="text-xs text-blue-400">{formatCurrency(formData.valuation)}</p>
          )}
        </div>
                  
        <div className="space-y-3">
          <Label htmlFor="burnRate" className="text-sm font-medium text-white flex items-center gap-2  justify-between w-full">
            Monthly Burn Rate
            <Tooltip>
              <TooltipTrigger asChild>
                <button type="button" className="rounded-full p-1 hover:bg-gray-600 transition-colors">
                  <InfoIcon className="size-4 text-gray-400" />
                </button>
              </TooltipTrigger>
              <TooltipContent arrowColor="bg-gray-800 fill-gray-800" className="max-w-xs bg-gray-800 fill-gray-800 border-gray-600 text-white">
                <p>Average monthly cash expenditure. Helps candidates understand your financial discipline and operational efficiency.</p>
              </TooltipContent>
            </Tooltip>
          </Label>
          <div className="relative">
            <TrendingUp className="absolute right-14 top-3.5 text-gray-400" size={20} />
            <div className="flex items-center gap-2">
              <Button
                onClick={() => handleFinancialChange("burn_rate", Math.max(0, formData.burn_rate - 1000))}
                size="icon"
                type="button"
                // variant="outline"
                className="rounded-full bg-gray-700/70 border border-gray-600 "
                style={{ zIndex: 99999, cursor: 'pointer' }}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                id="burnRate"
                type="number"
                value={formData.burn_rate}
                onChange={(e) => handleFinancialChange("burn_rate", e.target.value)}
                className="pl-12 h-11.5 border-gray-600 bg-gray-700/50 text-white placeholder-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all"
                placeholder="0"
                min="0"
                step="1000"
              />
              <Button
                onClick={() => handleFinancialChange("burn_rate", formData.burn_rate + 1000)}
                size="icon"
                type="button"
                // variant="outline"
                className="rounded-full bg-gray-700/70 border border-gray-600 "
                style={{ zIndex: 99999, cursor: 'pointer' }}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {formData.burn_rate > 0 && (
            <p className="text-xs text-blue-400">{formatCurrency(formData.burn_rate)}/month</p>
          )}
        </div>
                  
        <div className="space-y-3">
          <Label htmlFor="runwayMonths" className="text-sm font-medium text-white flex items-center gap-2  justify-between w-full">
            Runway (Months)
            <Tooltip>
              <TooltipTrigger asChild>
                <button type="button" className="rounded-full p-1 hover:bg-gray-600 transition-colors">
                  <InfoIcon className="size-4 text-gray-400" />
                </button>
              </TooltipTrigger>
              <TooltipContent arrowColor="bg-gray-800 fill-gray-800" className="max-w-xs bg-gray-800 fill-gray-800 border-gray-600 text-white">
                <p>Months until you run out of cash at current burn rate. Companies with 12+ months runway see 60% more applications.</p>
              </TooltipContent>
            </Tooltip>
          </Label>
          <div className="relative">
            <Calendar className="absolute right-14 top-3.5 text-gray-400" size={20} />
            <div className="flex items-center gap-2">
              <Button
                onClick={() => handleFinancialChange("runway_months", Math.max(0, formData.runway_months - 1))}
                size="icon"
                type="button"
                // variant="outline"
                className="rounded-full bg-gray-700/70 border border-gray-600 "
                style={{ zIndex: 99999, cursor: 'pointer' }}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                id="runwayMonths"
                type="number"
                value={formData.runway_months}
                onChange={(e) => handleFinancialChange("runway_months", e.target.value)}
                className="pl-12 h-11.5 border-gray-600 bg-gray-700/50 text-white placeholder-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all"
                placeholder="0"
                min="0"
              />
              <Button
                onClick={() => handleFinancialChange("runway_months", formData.runway_months + 1)}
                size="icon"
                type="button"
                // variant="outline"
                className="rounded-full bg-gray-700/70 border border-gray-600 "
                style={{ zIndex: 99999, cursor: 'pointer' }}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {formData.runway_months > 0 && (
            <p className="text-xs text-blue-400">{formData.runway_months} months remaining</p>
          )}
        </div>
                  
        <div className="space-y-3 md:col-span-2">
          <Label htmlFor="financialNotes" className="text-sm font-medium text-white flex items-center gap-2  justify-between w-full">
            Financial Notes & Context
            <Tooltip>
              <TooltipTrigger asChild>
                <button type="button" className="rounded-full p-1 hover:bg-gray-600 transition-colors">
                  <InfoIcon className="size-4 text-gray-400" />
                </button>
              </TooltipTrigger>
              <TooltipContent arrowColor="bg-gray-800 fill-gray-800" className="max-w-xs bg-gray-800 fill-gray-800 border-gray-600 text-white">
                <p>Additional context about revenue models, growth metrics, funding strategy, or financial milestones.</p>
              </TooltipContent>
            </Tooltip>
          </Label>
          <Textarea
            id="financialNotes"
            value={formData.financial_notes}
            onChange={(e) => handleInputChange("financial_notes", e.target.value)}
            rows={3}
            className="border-gray-600 bg-gray-700/50 text-white placeholder-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all resize-none"
            placeholder="Additional context about your financial situation, growth plans, or funding strategy..."
            maxLength={500}
          />
          <p className="text-xs text-gray-400">
            This helps candidates understand your financial health and growth trajectory.
          </p>
        </div>
      </div>
    </div>
  );
}