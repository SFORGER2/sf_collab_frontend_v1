import { Plus, X, CheckCircle, Lightbulb, Users, InfoIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

import { CardDescription, CardTitle } from "@/components/ui/card";
import StartupRoleCard from "../StartupRoleCard";
import {
Tooltip,
TooltipContent,
TooltipTrigger,
} from "@/components/ui/tooltip";
import { popularTechnologies } from "../elements";
import { useEffect, useMemo } from "react";

// Helper function to shuffle and get random items
const getRandomTechs = (arr, count) => {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

export default function StartupRolesAndTechStack({
  formData,
  techStack,
  techInput,
  setTechInput,
  handleTechInputChange,
  handleTechInputKeyDown,
  addTech,
  removeTech,
  roles,
  addRole,
  updateRole,
  removeRole,
}) {
  const randomTechs = useMemo(() => getRandomTechs(popularTechnologies, 20), []);
  const filteredTechs = useMemo(() => popularTechnologies
  .filter(
    tech =>
      tech.toLowerCase().includes(techInput.toLowerCase()) &&
      !techStack.includes(tech)
  )
  .slice(0, 8), [techInput, techStack]);
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="text-center mb-6">
        <div className="w-16 h-16 rounded-2xl bg-blue-400/10 border border-blue-400/30 flex items-center justify-center mx-auto mb-4">
          <Users className="w-8 h-8 text-blue-400" />
        </div>
        <CardTitle className="text-2xl mb-2 text-white">Build Your Team</CardTitle>
        <CardDescription className="text-gray-300">Define roles and positions needed</CardDescription>
      </div>
    
      <div className="space-y-5">
        <div className="space-y-6">
          {/* Tech Stack Input */}
          <div className="space-y-3">
            <Label htmlFor="techStack" className="text-sm font-medium text-white flex items-center gap-2">
              Technology Stack
              <Tooltip>
                <TooltipTrigger asChild>
                  <button type="button" className="rounded-full p-1 hover:bg-gray-600 transition-colors">
                    <InfoIcon className="size-4 text-gray-400" />
                  </button>
                </TooltipTrigger>
                <TooltipContent arrowColor="bg-gray-800 fill-gray-800" className="max-w-xs bg-gray-800 border-gray-600 text-white">
                  <p>List the technologies your startup uses. This helps match you with developers who have relevant skills.</p>
                </TooltipContent>
              </Tooltip>
              <span className="text-gray-400 text-xs ml-auto">{techStack.length}/15</span>
            </Label>
                              
<div className="relative space-y-3">
  <div className="flex gap-2">
    <Input
      value={techInput}
      onChange={handleTechInputChange}
      onKeyDown={handleTechInputKeyDown}
      placeholder="Add technology (e.g., React, AI, Robotics...)"
      className="flex-1 border-gray-600 bg-gray-700/50 text-white"
    />

    <Button
      onClick={() => addTech(techInput.trim())}
      disabled={!techInput.trim() || techStack.length >= 15}
      className="bg-blue-400 hover:bg-blue-500"
    >
      <Plus size={18} />
    </Button>
  </div>

  {techInput && filteredTechs.length > 0 && (
    <div className="absolute z-50 w-full rounded-xl border border-gray-600 bg-gray-800 shadow-xl">
      {filteredTechs.map(tech => (
        <button
          key={tech}
          type="button"
          onClick={() => {
            addTech(tech);
            setTechInput("");
          }}
          className="w-full px-4 py-2 text-left text-sm hover:bg-blue-400/20 text-white transition-colors"
        >
          {tech}
        </button>
      ))}
    </div>
  )}
</div>

                      
            {/* Popular Technologies */}
            <div className="space-y-2">
              <Label className="text-sm text-gray-400">Popular Technologies</Label>
              <div className="flex flex-wrap gap-2">
                {randomTechs.map(tech => (
                  <Badge
                    key={tech}
                    variant="outline"
                    onClick={() => addTech(tech)}
                    className={`cursor-pointer transition-all duration-200 ${techStack.includes(tech)
                        ? 'bg-blue-400 text-white border-blue-400 hover:bg-blue-500 shadow-lg shadow-blue-400/30'
                        : 'bg-gray-700/50 text-gray-300 border-gray-600 hover:bg-gray-600 hover:border-gray-500'
                      }`}
                  >
                    {tech}
                    {techStack.includes(tech) && <CheckCircle className="w-3 h-3 ml-1" />}
                  </Badge>
                ))}
              </div>
            </div>
                      
            {/* Selected Technologies */}
            {techStack.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm text-gray-400">Selected Technologies ({techStack.length})</Label>
                <div className="flex flex-wrap gap-2">
                  {techStack.map(tech => (
                    <Badge
                      key={tech}
                      variant="secondary"
                      className="bg-blue-400/20 text-blue-400 border-blue-400/30 flex items-center gap-1 group transition-all hover:scale-105"
                    >
                      {tech}
                      <button
                        onClick={() => removeTech(tech)}
                        className="ml-1 hover:text-blue-300 transition-colors rounded-full hover:bg-blue-400/20 p-0.5"
                      >
                        <X size={14} />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
                      
          {/* Benefits */}
          <Card className="border-blue-400/20 bg-blue-400/10 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
                <div className="space-y-2">
                  <p className="text-blue-300 text-sm font-medium">Why specify your tech stack?</p>
                  <ul className="text-blue-200 text-sm space-y-1">
                    <li>• Attracts developers with relevant skills (62% more applications)</li>
                    <li>• Shows technical direction and company culture</li>
                    <li>• Helps candidates assess if they're a good fit</li>
                    <li>• Increases matching accuracy with our algorithm</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Roles */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-white flex items-center gap-2   w-full">
              Open Roles ({roles.length}/10)
              <Tooltip>
                <TooltipTrigger asChild>
                  <button type="button" className="rounded-full p-1 hover:bg-gray-600 transition-colors">
                    <InfoIcon className="size-4 text-gray-400" />
                  </button>
                </TooltipTrigger>
                <TooltipContent arrowColor="bg-gray-800 fill-gray-800" className="max-w-xs bg-gray-800 fill-gray-800 border-gray-600 text-white">
                  <p>Define specific roles you're hiring for. Clear role descriptions attract more qualified candidates and reduce time-to-hire.</p>
                </TooltipContent>
              </Tooltip>
            </Label>
            <Button
              onClick={addRole}
              disabled={roles.length >= 10}
              className="bg-blue-400 hover:bg-blue-500 text-white border-0 transition-all hover:scale-105 shadow-lg shadow-blue-400/20"
            >
              <Plus size={18} className="mr-2" />
              Add Role
            </Button>
          </div>
    
          <div className="space-y-4  max-h-80 overflow-y-auto p-2 custom-scrollbar">
            {roles.map((role, index) => <StartupRoleCard key={index} role={role} index={index} updateRole={updateRole} removeRole={removeRole} roles={roles} />)}
          </div>
        </div>
      </div>
    </div>
  );
}