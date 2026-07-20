import { Badge } from "@/components/ui/badge";
import { CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { InfoIcon, Mail, User } from "lucide-react";

export default function FounderDetailsSection({
    formData,
    handleInputChange,
    id,
}) {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="text-center mb-6">
        <div className="w-16 h-16 rounded-2xl bg-blue-400/10 border border-blue-400/30 flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-blue-400" />
        </div>
        <CardTitle className="text-2xl mb-2 text-white">Founder Information</CardTitle>
        <CardDescription className="text-gray-300">Tell us about yourself as the founder</CardDescription>
      </div>
                
      <div className="grid md:grid-cols-2 gap-5">
        <div className="space-y-3">
          <Label htmlFor="firstName" className="text-sm font-medium text-white  items-center gap-2 flex justify-between w-full">
            <span>
              First Name <Badge variant="outline" className="bg-blue-400/10 text-blue-400 border-blue-400/30 text-xs">Required</Badge>
            </span>
            <Tooltip>
              <TooltipTrigger asChild>
                <button type="button" className="rounded-full p-1 hover:bg-gray-600 transition-colors">
                  <InfoIcon className="size-4 text-gray-400" />
                </button>
              </TooltipTrigger>
              <TooltipContent arrowColor="bg-gray-800 fill-gray-800" className="max-w-xs bg-gray-800 fill-gray-800 border-gray-600 text-white">
                <p>Your legal first name as the founder. This builds credibility with potential team members and investors.</p>
              </TooltipContent>
            </Tooltip>
          </Label>
          <div className="relative">
            <User className="absolute left-4 top-4 text-gray-400" size={20} />
            <Input
              id="firstName"
              type="text"
              value={formData.creator_first_name}
              onChange={(e) => handleInputChange("creator_first_name", e.target.value)}
              className="pl-12 h-11.5 border-gray-600 bg-gray-700/50 text-white placeholder-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all"
              placeholder="Your first name"
            />
          </div>
        </div>
                
        <div className="space-y-3">
          <Label htmlFor="lastName" className="text-sm font-medium text-white  items-center gap-2 flex justify-between w-full">
            <span>
              Last Name <Badge variant="outline" className="bg-blue-400/10 text-blue-400 border-blue-400/30 text-xs">Required</Badge>
            </span>
            <Tooltip>
              <TooltipTrigger asChild>
                <button type="button" className="rounded-full p-1 hover:bg-gray-600 transition-colors">
                  <InfoIcon className="size-4 text-gray-400" />
                </button>
              </TooltipTrigger>
              <TooltipContent arrowColor="bg-gray-800 fill-gray-800" className="max-w-xs bg-gray-800 fill-gray-800 border-gray-600 text-white">
                <p>Your legal last name. Complete founder profiles receive 47% more applications from qualified candidates.</p>
              </TooltipContent>
            </Tooltip>
          </Label>
          <div className="relative">
            <User className="absolute left-4 top-4 text-gray-400" size={20} />
            <Input
              id="lastName"
              type="text"
              value={formData.creator_last_name}
              onChange={(e) => handleInputChange("creator_last_name", e.target.value)}
              className="pl-12 h-11.5 border-gray-600 bg-gray-700/50 text-white placeholder-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all"
              placeholder="Your last name"
            />
          </div>
        </div>
                
        <div className="space-y-3 md:col-span-2">
          <Label htmlFor="email" className="text-sm font-medium text-white items-center flex justify-between w-full gap-2">
            <span>
              Email <Badge variant="outline" className="bg-blue-400/10 text-blue-400 border-blue-400/30 text-xs">Required</Badge>
            </span>
            {
              id && (
                <span className="text-sm text-yellow-400 italic">(We encrypt your email for security, please write it again)</span>
              )
            }
            <Tooltip>
              <TooltipTrigger asChild>
                <button type="button" className="rounded-full p-1 hover:bg-gray-600 transition-colors">
                  <InfoIcon className="size-4 text-gray-400" />
                </button>
              </TooltipTrigger>
              <TooltipContent arrowColor="bg-gray-800 fill-gray-800" className="max-w-xs bg-gray-800 fill-gray-800 border-gray-600 text-white">
                <p>Your professional email address. Using a company domain email enhances credibility and trust with potential team members.</p>
              </TooltipContent>
            </Tooltip>
          </Label>
          <div className="relative">
            <Mail className="absolute left-4 top-4 text-gray-400" size={20} />
            <Input
              id="email"
              type="email"
              value={formData.creator_email}
              onChange={(e) => handleInputChange("creator_email", e.target.value)}
              className="pl-12 h-11.5 border-gray-600 bg-gray-700/50 text-white placeholder-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all"
              placeholder="your.email@company.com"
            />
          </div>
        </div>
      </div>
    </div>
  )
}