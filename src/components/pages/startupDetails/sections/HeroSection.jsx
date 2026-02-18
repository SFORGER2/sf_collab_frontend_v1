import { API_URL } from "@/utils/config";
import { Building2, DollarSign, MapPin, Mail, Rocket, Share2, BookPlus, Check, DoorOpen } from "lucide-react";
import { Badge } from "../../../ui/badge";
import { Button } from "@/components/ui/button";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { startupsAPI } from "@/utils/APIs/startupsAPI";
import { formatCurrency } from "@/lib/utils";
import { FcLeave } from "react-icons/fc";
import { toast } from "react-toastify";

// Hero Section Component
export default function HeroSection({
  members,
  isAdmin,
  startup,
  onJoinClick,
  getStageBadgeVariant,
  setAlertDescription,
  setShowAlert,
  setAlertTitle,
  setAlertVariant }) {
  const { user } = useSelector((state) => state.auth);
  const [joinRequest, setJoinRequest] = useState(null);
  const isMember = useMemo(() => {
    if (!user || !startup) return false;
    if (startup.creator?.id === user.id) return true;
    const isMember = members.some(member => member.userId === user.id);
    if (isMember) return true;
    return false;
  }, [user, startup, members]);
  useEffect(() => {
    async function fetchJoinRequest() {
      if (user && startup) {
        try {
          const response = await startupsAPI.getJoinRequestByUserAndStartup(startup.id, user.id);
          setJoinRequest(response.data.join_request || null);
        }
        catch (err) {
          console.error("Error fetching join request:", err);
        }
      }
    }
    fetchJoinRequest();
  }, [user, startup]);
  async function handleLeaveStartup(startupId) {
    try {
      await startupsAPI.leaveStartup(startupId);
      toast.success("You have left the startup.");
      window.location.reload();
    } catch (error) {
      console.error("Error leaving startup:", error);
      toast.error("Failed to leave the startup. Please try again.");
    }
  }
  return (
    <div className="relative ">
      {/* Banner */}
      <div className="h-64 rounded-lg mx-auto w-full object-fit bg-gradient-to-r from-blue-600/40 via-purple-600/40 to-blue-800/40 relative overflow-hidden">
        {startup.banner_url && (
          <img
            src={startup.banner_url.startsWith("http") ? startup.banner_url : `${API_URL}${startup.banner_url}`}
            alt={startup.name}
            className="w-full  h-full object-cover opacity-40"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/50 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative  w-full shadow-2xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 ">

        
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between -mt-20 relative z-10">
          {/* Logo and Basic Info */}
          <div className="flex flex-col lg:flex-row lg:items-end gap-6">
            {/* Logo */}
            <div className="w-32 h-32 mt-3 bg-white rounded-full border-4 border-gray-800 shadow-2xl flex items-center justify-center">
              {startup.logo_url ? (
                <img
                  src={startup.logo_url.startsWith("http") ? startup.logo_url : `${API_URL}${startup.logo_url}`}
                  alt={startup.name}
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                <span className="text-2xl font-bold text-blue-600">
                  {startup.name.charAt(0)}
                </span>
              )}
            </div>

            {/* Startup Info */}
            <div className="text-white space-y-3 ">
              <h1 className="text-3xl font-bold bg-gray-500/5 backdrop-blur-sm w-fit p-2 rounded-full flex items-center">{startup.name}</h1>
              <div className="flex flex-wrap items-center gap-3">
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-400/30">
                  <Building2 className="w-3 h-3 mr-1" />
                  {startup.industry}
                </Badge>
                <Badge className="bg-green-500/20 text-green-400 border-green-400/30">
                  <MapPin className="w-3 h-3 mr-1" />
                  {startup.location || 'Remote'}
                </Badge>
                <Badge className={`${getStageBadgeVariant(startup.stage)}`}>
                  <Rocket className="w-3 h-3 mr-1" />
                  {startup.stage.charAt(0).toUpperCase() + startup.stage.slice(1)}
                </Badge>
              </div>
              <p className="text-gray-300 max-w-2xl">
                {startup.description || "Innovative startup making waves in their industry"}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mt-6 lg:mt-0">
            <Button
              onClick={(!joinRequest || !isMember) && onJoinClick}
              className={`${joinRequest?.isPending ? 'bg-green-600 hover:bg-green-700' :
                  isMember ? 'bg-green-600 hover:bg-green-700' :
                    'bg-blue-600 hover:bg-blue-700'
                } cursor-pointer text-white`}
            >
              {
                joinRequest?.isPending ?
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Request Sent
                  </>
                  :
                  user.id === startup.creator?.id ?
                      <>
                        <BookPlus className="w-4 h-4 mr-2" />
                        Founder
                      </>
                      :

                  isMember ?
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Member
                    </>
                    :
                    <>
                        <BookPlus className="w-4 h-4 mr-2" />
                        Join Team
                      </>
              }
            </Button>
            <Button
              onClick={() => {
                const url = `${window.location.origin}/startups/${startup?.id}`;
                navigator.clipboard.writeText(url);
                setShowAlert(true);
                setAlertTitle("Link Copied!");
                setAlertDescription("Startup link has been copied to clipboard.");
                setAlertVariant("success");
              }}
              variant="outline" className="border-gray-600 text-black hover:bg-black/30 cursor-pointer hover:text-white">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            {startup?.funding_amount > 0 && (
              <Button variant="outline" className="border-gray-600 text-black hover:bg-black/30 hover:text-white">
                <DollarSign className="w-4 h-4 mr-2" />
                {formatCurrency(startup.funding_amount)} raised
              </Button>
            )}
            {
              (isMember && !isAdmin) &&
              <Button
                onClick={() => handleLeaveStartup(startup.id)}
                variant="outline" className="border-red-600 bg-red-600 text-white hover:bg-red-600/20 hover:text-white">
                <DoorOpen className="w-4 h-4 mr-2" />
                Leave Startup
              </Button>
            }
          </div>
        </div>
      </div>
    </div>
  );
}
