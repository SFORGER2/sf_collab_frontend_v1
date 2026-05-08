import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { InfoIcon, Rocket } from "lucide-react";
import { startupStages } from "../elements";
import { Badge } from "@/components/ui/badge";

export default function StartupDetailsSection({
  formData,
  handleInputChange,
}) {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="text-center mb-6">
        <div className="w-16 h-16 rounded-2xl bg-blue-400/10 border border-blue-400/30 flex items-center justify-center mx-auto mb-4">
          <Rocket className="w-8 h-8 text-blue-400" />
        </div>
        <CardTitle className="text-2xl mb-2 text-white">Startup Details</CardTitle>
        <CardDescription className="text-gray-300">Tell us more about your vision and stage</CardDescription>
      </div>

      <div className="space-y-5">
        <div>
          <Label htmlFor="description" className="text-sm font-medium mb-3 text-white flex items-center gap-2">
            <span>
              Description <Badge variant="outline" className="bg-blue-400/10 text-blue-400 border-blue-400/30 text-xs">Required</Badge>
            </span>
            <Tooltip>
              <TooltipTrigger asChild>
                <button type="button" className="rounded-full p-1 hover:bg-gray-600 transition-colors">
                  <InfoIcon className="size-4 text-gray-400" />
                </button>
              </TooltipTrigger>
              <TooltipContent arrowColor="bg-gray-800 fill-gray-800" className="max-w-xs bg-gray-800 fill-gray-800 border-gray-600 text-white">
                <p>Describe your startup's mission, vision, and what makes it unique. A compelling description attracts 3x more qualified applicants and helps candidates understand your company culture.</p>
              </TooltipContent>
            </Tooltip>
            <span className="text-gray-400 text-xs ml-auto">{formData.description.length}/500</span>
          </Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            rows={5}
            className="border-gray-600 bg-gray-700/50 text-white placeholder-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all resize-none"
            placeholder="Describe your startup's mission, vision, and what makes it unique..."
            maxLength={500}
          />
        </div>

        <div>
          <Label className="text-sm font-medium mb-3 text-white flex items-center gap-2">
            Current Stage <Badge variant="outline" className="bg-blue-400/10 text-blue-400 border-blue-400/30 text-xs">Required</Badge>
          </Label>
          <div className="flex flex-wrap gap-3">
            {startupStages.map((stage) => (
              <TooltipProvider key={stage.value}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Card
                      onClick={() => handleInputChange("stage", stage.value)}
                      className={`p-4 flex-1 cursor-pointer transition-all duration-200 border backdrop-blur-sm hover:scale-105 ${formData.stage === stage.value
                        ? 'border-blue-400 bg-blue-400/20 text-white shadow-lg shadow-blue-400/20'
                        : 'border-gray-600 bg-gray-700/50 text-gray-300 hover:border-blue-400 hover:text-white'
                        }`}
                    >
                      <CardContent className="p-0 text-center">
                        <div className={`flex justify-center mb-2 ${formData.stage === stage.value ? 'text-blue-400' : 'text-gray-400'}`}>
                          {stage.icon}
                        </div>
                        <div className={`font-semibold text-sm ${formData.stage === stage.value ? 'text-white' : 'text-gray-300'}`}>
                          {stage.label}
                        </div>
                        <div className={`text-xs mt-2 ${formData.stage === stage.value ? 'text-blue-300' : 'text-gray-500'}`}>
                          {stage.description}
                        </div>
                      </CardContent>
                    </Card>
                  </TooltipTrigger>
                  <TooltipContent arrowColor="bg-gray-800 fill-gray-800" side="top" className="max-w-xs bg-gray-800 fill-gray-800 border-gray-600 text-white">
                    <p className="text-sm">{stage.tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}