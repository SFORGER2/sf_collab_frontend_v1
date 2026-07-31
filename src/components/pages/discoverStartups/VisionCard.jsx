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

  const visionId = vision?.id || vision?.original_id || vision?._id;
  return (
    <Link to={`/ideation-details?id=${visionId}`}>
      <Card className="cursor-pointer border border-gray-700 bg-gradient-to-br from-gray-900 to-gray-950 hover:border-gray-500 transition-all overflow-hidden group h-full flex flex-col">
        
        {/* Header / Banner area */}
        <div className="relative h-20 max-[359px]:h-20 sm:h-28 w-full">
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
          
          <div className="absolute top-2 right-2 sm:top-3 sm:right-3 flex gap-2">
            <Badge className="bg-purple-500/20 text-purple-300 border-none text-[10px] sm:text-xs">
              Idea / Vision
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="p-3 max-[359px]:p-3 sm:p-5 flex-1 flex flex-col space-y-2.5 max-[359px]:space-y-2.5 sm:space-y-4 z-10">
          <div className="-mt-8 max-[359px]:-mt-8 sm:-mt-12">
            <div className="h-12 w-12 max-[359px]:h-12 max-[359px]:w-12 sm:h-16 sm:w-16 rounded-xl bg-gray-800 flex items-center justify-center border-2 border-gray-900 shadow-xl relative overflow-hidden">
               {vision?.imageUrl ? (
                  <img src={vision.imageUrl} alt={vision?.name} className="w-full h-full object-cover" />
               ) : (
                  <Lightbulb className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400" />
               )}
            </div>
          </div>
          
          <div className="flex justify-between items-start gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="text-base max-[359px]:text-base sm:text-xl font-semibold text-white line-clamp-1">
                {vision?.name || 'Unnamed Vision'}
              </h3>
              <p className="text-[11px] sm:text-xs text-gray-500 flex items-center gap-1 mt-0.5 sm:mt-1 truncate">
                <Target className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                {vision?.sector || 'General'}
              </p>
            </div>
            
            {vision?.readinessScore !== undefined && (
               <div className="text-right flex-shrink-0">
                  <div className={`text-base max-[359px]:text-base sm:text-xl font-black ${getScoreColor(vision.readinessScore)}`}>
                    {vision.readinessScore}%
                  </div>
               </div>
            )}
          </div>

          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed line-clamp-2 min-h-[32px] sm:min-h-[40px] flex-1">
            {vision?.description || 'No description available'}
          </p>

          <div className="grid grid-cols-2 gap-2 sm:gap-3 mt-auto">
            <div className="bg-white/5 rounded-lg p-2 max-[359px]:p-2 sm:p-2.5 border border-white/5">
              <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs text-gray-400 mb-0.5 sm:mb-1">
                <Users className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                Team Size
              </div>
              <div className="text-xs sm:text-sm font-semibold text-white">{vision?.teamSize || 0} Members</div>
            </div>
            
            <div className="bg-white/5 rounded-lg p-2 max-[359px]:p-2 sm:p-2.5 border border-white/5">
              <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs text-gray-400 mb-0.5 sm:mb-1">
                <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                Interest
              </div>
              <div className="text-xs sm:text-sm font-semibold text-white">{vision?.interestedBuilders || 0} Builders</div>
            </div>
          </div>

          <div>
             <div className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 sm:mb-2">Roles Needed</div>
             <div className="flex flex-wrap gap-1.5 sm:gap-2">
               {vision?.rolesNeeded?.slice(0, 3).map((role, i) => (
                 <Badge key={i} variant="outline" className="bg-transparent border-gray-700 text-gray-300 text-[10px] py-0 px-1.5">
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

          <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white mt-1 sm:mt-2 min-h-[38px] sm:min-h-[44px] text-xs sm:text-sm">
            Request Collaboration
          </Button>
        </div>
      </Card>
    </Link>
  );
}
