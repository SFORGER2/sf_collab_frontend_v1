import { Building2, Globe, InfoIcon, MapPin } from "lucide-react";
import { industries } from "../elements";
import { CardDescription, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function CompanyInformationSection({
  formData,
  handleInputChange,
}) {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="text-center mb-6">
        <div className="w-16 h-16 rounded-2xl bg-blue-400/10 border border-blue-400/30 flex items-center justify-center mx-auto mb-4">
          <Building2 className="w-8 h-8 text-blue-400" />
        </div>
        <CardTitle className="text-2xl mb-2 text-white">Company Information</CardTitle>
        <CardDescription className="text-gray-300">Let's start with the basics of your startup</CardDescription>
      </div>
                
      <div className="grid md:grid-cols-2 gap-5">
        <div className="space-y-3">
          <Label htmlFor="name" className="text-sm font-medium text-white flex items-center gap-2  justify-between w-full">
            <span>Startup Name <Badge variant="outline" className="bg-blue-400/10 text-blue-400 border-blue-400/30 text-xs">Required</Badge></span>
            <Tooltip>
              <TooltipTrigger asChild>
                <button type="button" className="rounded-full p-1 hover:bg-gray-600 transition-colors">
                  <InfoIcon className="size-4 text-gray-400" />
                </button>
              </TooltipTrigger>
              <TooltipContent arrowColor="bg-gray-800 fill-gray-800" className="max-w-xs bg-gray-800 fill-gray-800 border-gray-600 text-white">
                <p>Your official startup name. This will be visible to all users and should match your legal business name.</p>
              </TooltipContent>
            </Tooltip>
          </Label>
          <div className="relative">
            <Building2 className="absolute left-4 top-4 text-gray-400" size={20} />
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="pl-12 h-11.5 border-gray-600 bg-gray-700/50 text-white placeholder-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all"
              placeholder="Enter your startup name"
            />
          </div>
        </div>
                
        <div className="space-y-3">
          <Label htmlFor="industry" className="text-sm font-medium text-white flex items-center gap-2  justify-between w-full">
            <span>
              Industry <Badge variant="outline" className="bg-blue-400/10 text-blue-400 border-blue-400/30 text-xs">Required</Badge>
            </span>
            <Tooltip>
              <TooltipTrigger asChild>
                <button type="button" className="rounded-full p-1 hover:bg-gray-600 transition-colors">
                  <InfoIcon className="size-4 text-gray-400" />
                </button>
              </TooltipTrigger>
              <TooltipContent arrowColor="bg-gray-800 fill-gray-800" className="max-w-xs bg-gray-800 fill-gray-800 border-gray-600 text-white">
                <p>Select the primary industry your startup operates in. This helps match you with relevant talent and investors.</p>
              </TooltipContent>
            </Tooltip>
          </Label>
          <div className="relative">
            <Globe className="absolute right-4 top-3 text-gray-400 z-10" size={20} />
            <Select value={formData.industry} onValueChange={(value) => handleInputChange("industry", value)}>
              <SelectTrigger style={{ height: '45px' }} className="w-full border-gray-600 bg-gray-700/50 text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all">
                <SelectValue placeholder="Select Industry" className="text-white" />
              </SelectTrigger>
              <SelectContent position="bottom" className="w-full bg-gray-800 border-gray-600 text-white">
                {industries.map(industry => (
                  <SelectItem key={industry} value={industry} className="text-white hover:bg-gray-700 focus:bg-gray-700 "><span className="text-white w-full h-full hover:text-blue-400">{industry}</span></SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
                
        <div className="space-y-3 md:col-span-2">
          <Label htmlFor="location" className="text-sm font-medium text-white  items-center gap-2 flex justify-between w-full">
            <span>Location <Badge variant="outline" className="bg-blue-400/10 text-blue-400 border-blue-400/30 text-xs">Required</Badge></span>
            <Tooltip>
              <TooltipTrigger asChild>
                <button type="button" className="rounded-full p-1 hover:bg-gray-600 transition-colors">
                  <InfoIcon className="size-4 text-gray-400" />
                </button>
              </TooltipTrigger>
              <TooltipContent arrowColor="bg-gray-800 fill-gray-800" className="max-w-xs bg-gray-800 fill-gray-800 border-gray-600 text-white">
                <p>Your primary operating location. Include city and country. This helps local talent find your startup and indicates if you support remote work.</p>
              </TooltipContent>
            </Tooltip>
          </Label>
          <div className="relative">
            <MapPin className="absolute left-4 top-4 text-gray-400" size={20} />
            <Input
              id="location"
              type="text"
              value={formData.location}
              onChange={(e) => handleInputChange("location", e.target.value)}
              className="pl-12 h-11.5 border-gray-600 bg-gray-700/50 text-white placeholder-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all"
              placeholder="City, Country"
            />
          </div>
        </div>
      </div>
    </div>
  );
}