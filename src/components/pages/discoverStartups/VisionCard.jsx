import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Users, Lightbulb, MapPin, Target, Eye } from "lucide-react";
import { Link } from "react-router-dom";

export default function VisionCard({ vision }) {
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-blue-400';
    if (score >= 40) return 'text-yellow-400';
    return 'text-orange-400';
  };

  return (
    <Link to={`/ideation-details?ideaId=${vision?.original_id}`}>
      <Card className="cursor-pointer border border-gray-700 bg-gradient-to-br from-gray-900 to-gray-950 hover:border-gray-500 transition-all overflow-hidden group h-full flex flex-col">
        
        {/* Header / Banner area */}
        <div className="relative h-28 w-full">
          {vision?.imageUrl ? (
            <img
              src={vision.imageUrl}
              alt={vision?.name || 'Vision'}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-700" />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-gray-900/30 to-transparent" />
          
          <div className="absolute top-3 right-3 flex gap-2">
            <Badge className="bg-purple-500/20 text-purple-300 border-none">
              Idea / Vision
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 flex flex-col space-y-4 z-10">
          <div className="-mt-12">
            <div className="h-16 w-16 rounded-xl bg-gray-800 flex items-center justify-center border-2 border-gray-900 shadow-xl relative overflow-hidden">
               {vision?.imageUrl ? (
                  <img src={vision.imageUrl} alt={vision?.name} className="w-full h-full object-cover" />
               ) : (
                 <Lightbulb className="w-8 h-8 text-purple-400" />
               )}
            </div>
          </div>
          
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-semibold text-white line-clamp-1">
                {vision?.name || 'Unnamed Vision'}
              </h3>
              <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                <Target className="w-3.5 h-3.5" />
                {vision?.sector || 'General'}
              </p>
            </div>
            
            {vision?.readinessScore !== undefined && (
               <div className="text-right">
                  <div className={`text-xl font-black ${getScoreColor(vision.readinessScore)}`}>
                    {vision.readinessScore}%
                  </div>
               </div>
            )}
          </div>

          <p className="text-sm text-gray-300 leading-relaxed line-clamp-2 min-h-[40px] flex-1">
            {vision?.description || 'No description available'}
          </p>

          <div className="grid grid-cols-2 gap-3 mt-auto">
            <div className="bg-white/5 rounded-lg p-2.5 border border-white/5">
              <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
                <Users className="w-3.5 h-3.5" />
                Team Size
              </div>
              <div className="text-sm font-semibold text-white">{vision?.teamSize || 0} Members</div>
            </div>
            
            <div className="bg-white/5 rounded-lg p-2.5 border border-white/5">
              <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
                <Eye className="w-3.5 h-3.5" />
                Interest
              </div>
              <div className="text-sm font-semibold text-white">{vision?.interestedBuilders || 0} Builders</div>
            </div>
          </div>

          <div>
             <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Roles Needed</div>
             <div className="flex flex-wrap gap-2">
               {vision?.rolesNeeded?.slice(0, 3).map((role, i) => (
                 <Badge key={i} variant="outline" className="bg-transparent border-gray-700 text-gray-300 text-[10px] py-0">
                   {role}
                 </Badge>
               ))}
               {vision?.rolesNeeded?.length > 3 && (
                 <span className="text-[10px] text-gray-500 pt-0.5">+{vision.rolesNeeded.length - 3} more</span>
               )}
               {(!vision?.rolesNeeded || vision.rolesNeeded.length === 0) && (
                 <span className="text-[10px] text-gray-600 italic">No specific roles listed</span>
               )}
             </div>
          </div>

          <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white mt-2 pb-0 mb-0">
            Request Collaboration
          </Button>
        </div>
      </Card>
    </Link>
  );
}
