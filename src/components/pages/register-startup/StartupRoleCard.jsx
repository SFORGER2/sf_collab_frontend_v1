import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Minus, Plus, X, InfoIcon } from "lucide-react";
import { roleTypes } from "./elements";

export default function StartupRoleCard({ role, index, updateRole, removeRole, roles }) {
  return (
    <Card key={index} className="p-4 border bg-blue-300/5 border-gray-600 hover:border-blue-400/50 transition-all duration-200 backdrop-blur-sm hover:scale-102">
      <CardContent className="p-0">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label className="text-xs text-gray-400 uppercase font-medium flex items-center justify-between gap-2 w-full">
              Role Title
              <Tooltip>
                <TooltipTrigger asChild>
                  <button type="button" className="rounded-full p-1 hover:bg-gray-600 transition-colors">
                    <InfoIcon className="size-3 text-gray-400" />
                  </button>
                </TooltipTrigger>
                <TooltipContent arrowColor="bg-gray-800 fill-gray-800" className="max-w-xs bg-gray-800 fill-gray-800 border-gray-600 text-white">
                  <p>Enter the specific job title you're hiring for. Be clear and descriptive (e.g., "Senior Frontend Developer" instead of just "Developer").</p>
                </TooltipContent>
              </Tooltip>
            </Label>
            <Input
              type="text"
              value={role.title}
              onChange={(e) => updateRole(index, "title", e.target.value)}
              className="border-gray-600 bg-gray-700/50 text-white placeholder-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all"
              placeholder="e.g., Frontend Developer"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-gray-400 uppercase font-medium flex items-center justify-between gap-2 w-full">
              Role Type
              <Tooltip>
                <TooltipTrigger asChild>
                  <button type="button" className="rounded-full p-1 hover:bg-gray-600 transition-colors">
                    <InfoIcon className="size-3 text-gray-400" />
                  </button>
                </TooltipTrigger>
                <TooltipContent arrowColor="bg-gray-800 fill-gray-800" className="max-w-xs bg-gray-800 fill-gray-800 border-gray-600 text-white">
                  <p>{roleTypes.find(t => t.value === role.roleType)?.description || "Select the employment type for this role."}</p>
                </TooltipContent>
              </Tooltip>
            </Label>
            <Select value={role.roleType} onValueChange={(value) => updateRole(index, "roleType", value)}>
              <SelectTrigger className="w-full border-gray-600 bg-gray-700/50 text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all">
                <SelectValue placeholder="Select role type" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600 text-white">
                {roleTypes.map(type => (
                  <SelectItem key={type.value} value={type.value} className="hover:bg-gray-700 focus:bg-gray-700">
                    <div className="flex flex-col">
                      <span className='text-white hover:text-blue-400'>{type.label}</span>
                      <span className='text-xs text-gray-400'>{type.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 relative">
            <Label className="text-xs text-gray-400 uppercase font-medium flex items-center justify-between gap-2 w-full">
              Available Positions
              <Tooltip>
                <TooltipTrigger asChild>
                  <button type="button" className="rounded-full p-1 hover:bg-gray-600 transition-colors">
                    <InfoIcon className="size-3 text-gray-400" />
                  </button>
                </TooltipTrigger>
                <TooltipContent arrowColor="bg-gray-800 fill-gray-800" className="max-w-xs bg-gray-800 fill-gray-800 border-gray-600 text-white">
                  <p>Total number of open positions across all roles. This helps candidates understand your hiring scale and growth trajectory.</p>
                </TooltipContent>
              </Tooltip>
            </Label>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => updateRole(index, "positionsNumber", Math.max(0, (role.positionsNumber || 0) - 1))}
                size="icon"
                type="button"
                className="rounded-full w-8 h-8 bg-gray-700/70 border border-gray-600"
                style={{ zIndex: 99999, cursor: 'pointer' }}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                id="positionsNumber"
                type="number"
                value={role.positionsNumber || 0}
                onChange={(e) => updateRole(index, "positionsNumber", parseInt(e.target.value) || 0)}
                min="0"
                className="w-full pl-8 border-gray-600 bg-gray-700/50 text-white placeholder-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all"
                placeholder="Number of positions"
              />
              <Button
                onClick={() => updateRole(index, "positionsNumber", (role.positionsNumber || 0) + 1)}
                size="icon"
                type="button"
                className="rounded-full w-8 h-8 bg-gray-700/70 border border-gray-600"
                style={{ zIndex: 99999, cursor: 'pointer' }}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="absolute right-0 top-0 flex items-center justify-between">
            {roles.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeRole(index)}
                className="text-red-400 hover:text-red-500 hover:bg-red-500/10 transition-colors h-6 w-6 p-0 rounded-full"
              >
                <X size={16} />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}