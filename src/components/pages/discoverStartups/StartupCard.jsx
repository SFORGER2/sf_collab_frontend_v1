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

export default function StartupCard({
  startup,
  index,
  recommendedRole
}) {
  const [selectedStartup, setSelectedStartup] = useState(null);
  
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
  const getStageBadgeVariant = (stage) => {
    const variants = {
      'Pre-seed': 'bg-red-500/20 text-red-300',
      Seed: 'bg-orange-500/20 text-orange-300',
      'Series A': 'bg-yellow-500/20 text-yellow-300',
      'Series B': 'bg-green-500/20 text-green-300',
      'Series C+': 'bg-blue-500/20 text-blue-300',
    };
    return variants[stage] || 'bg-gray-500/20 text-gray-300';
  };
  async function bookmarkStartup() {
    try {
      const response = await startupsAPI.toggleBookmarkStartup({
        startupId: startup.id,
        userId: user.id,
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
      <Link to={`/startup-details/${startup.id}`}>
        <Card className="cursor-pointer border border-gray-700 bg-gradient-to-br from-gray-900 to-gray-950 hover:border-gray-500 transition-all overflow-hidden group">

          {/* Banner */}
          <div className="relative h-28 w-full">
            {startup.banner_url ? (
              <img
                src={startup.banner_url.startsWith("http")
                  ? startup.banner_url
                  : `${API_URL}${startup.banner_url}`
                }
                alt={startup.name}
                className="absolute inset-0 w-full h-full object-cover"
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

              <Badge className={`text-xs ${getStageBadgeVariant(startup.stage)}`}>
                {startup.stage}
              </Badge>
            </div>
          </div>

          {/* Content */}
          <div className="p-5 space-y-4 z-10">
            {/* Image */}
            <div className="-mt-12 ">
              {startup.logo_url ? (
                <img
                  src={startup.logo_url.startsWith("http")
                    ? startup.logo_url
                    : `${API_URL}${startup.logo_url}`
                  }
                  alt={startup.name}
                  className="h-16 w-16 rounded-lg object-cover border-2 border-gray-900 bg-gray-800"
                />
              ) : (
                <div className="h-16 w-16 rounded-lg bg-gray-800 flex items-center justify-center border-2 border-gray-900">
                  <Briefcase className="w-8 h-8 text-gray-500" />
                </div>
              )}
            </div>
            {/* Title */}
            
            <div>
              <h3 className="text-xl font-semibold text-white">
                {startup.name}
              </h3>
              <p className="text-sm text-blue-400 font-medium">
                {formatCurrency(startup.funding_amount) || "No funding disclosed"}
              </p>
            </div>

            {/* Meta */}
            <div className="flex flex-wrap gap-4 text-xs text-gray-400">
              <span className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" />
                {startup.industry}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                {startup.location || "Remote"}
              </span>
              <span className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5" />
                {formatViews(startup.views)} views
              </span>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-300 leading-relaxed line-clamp-2">
              {startup.description || "No description available"}
            </p>

            {/* Recommended Role */}
            {recommendedRole && startup.roles[recommendedRole] && (
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
            {Object.keys(startup.roles).length > 1 && (
              <div className="space-y-2">
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
                    Other roles ({Object.keys(startup.roles).length})
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
          </div>
        </Card>
      </Link>
      {
        selectedStartup && (
          <ApplyToStartupModal
            roles={() => Object.keys(selectedStartup.roles)}
            startup={selectedStartup}
            isOpen={!!selectedStartup}
            onClose={() => {
              setSelectedRole(null);
              setSelectedStartup(null)
            }
            }
            getStageBadgeVariant={getStageBadgeVariant}
            roleSelected={selectedRole}
          />
        )
      }
    </>
  );
}
