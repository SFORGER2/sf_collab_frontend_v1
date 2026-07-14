import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { startupsAPI } from "@/utils/APIs/startupsAPI";
import { API_URL } from "@/utils/config";
import { motion } from "framer-motion";
import { Building2, MapPin, Eye, Briefcase, ChevronDown, Bookmark } from "lucide-react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import ApplyToStartupModal from "./ApplyToStartupModal";
const stageColors = [
  'bg-red-500/20 text-red-300',
  'bg-orange-500/20 text-orange-300',
  'bg-yellow-500/20 text-yellow-300',
  'bg-green-500/20 text-green-300',
  'bg-blue-500/20 text-blue-300',
  'bg-purple-500/20 text-purple-300',
  'bg-pink-500/20 text-pink-300',
  'bg-indigo-500/20 text-indigo-300',
];

export default function StartupCard({
  startup,
  index,
  recommendedRole
}) {
  const [selectedStartup, setSelectedStartup] = useState(null);
  const [bannerFailed, setBannerFailed] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);
  
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [expandedRoles, setExpandedRoles] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  useEffect(() => {
    async function checkIfBookmarked() {
      try {
        const response = await startupsAPI.getBookmarkStatus({
          startupId: startup.id,
          userId: user.id,
        });
        if (!response.success) {
          setIsBookmarked(false);
          return;
        }
        setIsBookmarked(response.data.bookmarked);
      } catch (error) {
        console.error("Failed to check bookmark status:", error);
      }
    }
    checkIfBookmarked();
  }, [startup?.id, user?.id]);
  const getStageBadgeVariant = (startupId) => {
    const index = startupId % stageColors.length;
    return stageColors[index];
  };
  async function bookmarkStartup() {
    try {
      const response = await startupsAPI.toggleBookmarkStartup({
        startupId: startup?.id,
        userId: user?.id,
      })
      console.log("Bookmark response:", response);
      if (!response.success) {
        setIsBookmarked(isBookmarked);
        return;
      }
      setIsBookmarked(response.data.bookmarked)
      // await fetch(`${API_URL}/bookmarks`, { ... })
    } catch (error) {
      console.error("Failed to bookmark startup:", error);
      setIsBookmarked(!isBookmarked);
    }
  }
  const formatViews = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    } else {
      return num.toString();
    }
  }
  

  return (
    <>
      <div 
        onClick={(e) => {
          if (e.target.closest('button') || e.target.closest('a')) return;
          navigate(`/startup-details/${startup?.original_id || startup?.id}`);
        }}
        className="block h-full group"
      >
        <Card className="cursor-pointer border border-gray-700 bg-gradient-to-br from-gray-900 to-gray-950 hover:border-gray-500 transition-all overflow-hidden h-full flex flex-col">

          {/* Banner */}
          <div className="relative h-28 w-full shrink-0">
            {startup?.banner_url && !bannerFailed ? (
              <img
                src={startup.banner_url.startsWith("http")
                  ? startup.banner_url
                  : `${API_URL}${startup.banner_url}`
                }
                alt={startup?.name || 'Startup'}
                className="absolute inset-0 w-full h-full object-cover"
                onError={() => setBannerFailed(true)}
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-700" />
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-gray-900/30 to-transparent" />

            {/* Actions */}
            <div className="absolute top-3 left-3 flex gap-2">
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 bg-black/40 hover:bg-black/60"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation();
                  bookmarkStartup();
                }}
              >
                <Bookmark
                  className={`w-4 h-4 ${isBookmarked
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                    }`}
                />
              </Button>

              <Badge className={`text-xs ${getStageBadgeVariant(startup?.id || 1)}`}>
                {startup?.stage ? startup.stage[0].toUpperCase() + startup.stage.slice(1) : 'Active'}
              </Badge>
            </div>
          </div>

          {/* Content */}
          <div className="p-5 flex-1 flex flex-col space-y-4 z-10">
            {/* Image */}
            <div className="-mt-12 flex justify-between items-end">
              {startup?.logo_url && !logoFailed ? (
                <img
                  src={startup.logo_url.startsWith("http")
                    ? startup.logo_url
                    : `${API_URL}${startup.logo_url}`
                  }
                  alt={startup?.name || 'Logo'}
                  className="h-16 w-16 rounded-lg object-cover border-2 border-gray-900 bg-gray-800 shrink-0"
                  onError={() => setLogoFailed(true)}
                />
              ) : (
                <div className="h-16 w-16 rounded-lg bg-gray-800 flex items-center justify-center border-2 border-gray-900 shrink-0">
                  <Briefcase className="w-8 h-8 text-gray-500" />
                </div>
              )}
              
              {startup?.executionScore !== undefined && (
                <div className="text-right mb-2">
                   <div className="text-2xl font-black text-emerald-400">
                     {startup.executionScore}%
                   </div>
                   <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest leading-none">Execution</div>
                </div>
              )}
            </div>
            {/* Title */}
            
            <div>
              <h3 className="text-xl font-semibold text-white line-clamp-1">
                {startup?.name || 'Unnamed Startup'}
              </h3>
              {startup?.funding_amount ? (
                 <p className="text-sm text-blue-400 font-medium">
                   {formatCurrency(startup.funding_amount)}
                 </p>
              ) : startup?.totalMilestones !== undefined ? (
                 <p className="text-sm text-blue-400 font-medium flex items-center gap-1 mt-1">
                   Milestones: {startup.milestonesCompleted || 0}/{startup.totalMilestones}
                 </p>
              ) : (
                 <p className="text-sm text-blue-400 font-medium">No funding disclosed</p>
              )}
            </div>

            {/* Meta */}
            <div className="flex flex-wrap gap-4 text-xs text-gray-400">
              <span className="flex items-center gap-1.5 shrink-0">
                <Building2 className="w-3.5 h-3.5" />
                {startup?.sector || startup?.industry || 'General'}
              </span>
              <span className="flex items-center gap-1.5 shrink-0">
                <MapPin className="w-3.5 h-3.5" />
                {startup?.location || "Remote"}
              </span>
              {startup?.views !== undefined && (
                <span className="flex items-center gap-1.5 shrink-0">
                  <Eye className="w-3.5 h-3.5" />
                  {formatViews(startup.views)} views
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-sm text-gray-300 leading-relaxed line-clamp-2 flex-1 min-h-[40px]">
              {startup?.description || "No description available"}
            </p>

            {/* Recommended Role */}
            {recommendedRole && startup?.roles && startup.roles[recommendedRole] && (
              <div className="flex items-center justify-between p-3 rounded-lg border border-blue-500/30 bg-blue-500/5">
                <div>
                  <p className="text-xs text-blue-300 font-semibold mb-0.5">
                    Recommended role
                  </p>
                  <p className="text-sm font-medium text-white">
                    {recommendedRole}
                  </p>
                </div>
                <Button
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedStartup(startup);
                  }}
                >
                  Apply
                </Button>
              </div>
            )}

            {/* Other Roles */}
            {startup?.roles && Object.keys(startup.roles).length > 0 && (
              <div className="space-y-2 mt-auto">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setExpandedRoles(!expandedRoles);
                  }}
                  className="w-full flex justify-between items-center text-sm text-gray-300 hover:text-white transition"
                >
                  <span className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    Roles needed ({Object.keys(startup.roles).length})
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${expandedRoles ? "rotate-180" : ""
                      }`}
                  />
                </button>

                {expandedRoles && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{ duration: 0.2 }}
                    className="space-y-2"
                  >
                    {Object.entries(startup.roles)
                      .filter(([role]) => role !== recommendedRole)
                      .map(([role]) => (
                        <div
                          key={role}
                          className="flex justify-between items-center p-2 rounded-md bg-gray-800 border border-gray-700"
                        >
                          <span className="text-sm text-gray-200">{role}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setSelectedStartup(startup);
                              setSelectedRole(role);
                            }}
                          >
                            Apply
                          </Button>
                        </div>
                      ))}
                  </motion.div>
                )}
              </div>
            )}
            {/* Fallback array of rolesNeeded from Discovery Feed */}
            {startup?.rolesNeeded && Array.isArray(startup.rolesNeeded) && startup.rolesNeeded.length > 0 && !startup?.roles && (
               <div className="mt-auto pt-2 flex items-center justify-between">
                 <div>
                   <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Roles Needed</div>
                   <div className="flex flex-wrap gap-2">
                     {startup.rolesNeeded.slice(0, 3).map((role, i) => (
                       <Badge key={i} variant="outline" className="bg-transparent border-gray-700 text-gray-300 text-[10px] py-0">
                         {role}
                       </Badge>
                     ))}
                     {startup.rolesNeeded.length > 3 && (
                       <span className="text-[10px] text-gray-500 pt-0.5">+{startup.rolesNeeded.length - 3} more</span>
                     )}
                   </div>
                 </div>
                 <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 ml-2 shrink-0"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedStartup(startup);
                    }}
                  >
                    Apply Now
                 </Button>
               </div>
            )}
            
          </div>
        </Card>
      </div>
      {
        selectedStartup && (
          <ApplyToStartupModal
            roles={() => {
              if (selectedStartup?.roles) return Object.keys(selectedStartup.roles);
              if (selectedStartup?.rolesNeeded) return selectedStartup.rolesNeeded;
              return [];
            }}
            startup={{
              ...selectedStartup,
              id: selectedStartup?.original_id || selectedStartup?.id
            }}
            isOpen={!!selectedStartup}
            onClose={() => {
              setSelectedRole(null);
              setSelectedStartup(null);
            }}
            getStageBadgeVariant={getStageBadgeVariant}
            roleSelected={selectedRole}
          />
        )
      }
    </>
  );
}