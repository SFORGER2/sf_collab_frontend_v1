import { useEffect, useState } from "react";
import { API_URL } from "@/utils/config";
import { UserPlus, X, List, Grid3x3, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { getProfilePicture } from "@/utils/getProfilePicture";
import { useSelector } from "react-redux";
import { startupsAPI } from "@/utils/APIs/startupsAPI";
import { toast } from "react-toastify";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, ease: "easeOut" },
  },
};

export default function TeamSection({ members, setMembers, onJoinClick, isFounder, isAdmin, onRemoveMember, startupId }) {
  const [view, setView] = useState(localStorage.getItem("teamView") || "list");
  const { user } = useSelector((state) => state.auth);
  useEffect(() => {
    localStorage.setItem("teamView", view);
  }, [view]);
  const onPromoteMember = async (e, memberId) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const response = await startupsAPI.promoteMemberToAdmin(startupId, memberId);
      if (response.success) {
        setMembers((prevMembers) =>
          prevMembers.map((member) =>
            member.id === memberId ? { ...member, admin: true } : member
          )
        );
      }
    } catch (error) {
      console.error("Error promoting member:", error);
    }
  }

  const onRemoveMemberAdmin = async (e, memberId) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await startupsAPI.demoteMemberAdmin(startupId, memberId);
      setMembers((prevMembers) => prevMembers.map((member) =>
        member.id === memberId ? { ...member, admin: false } : member
      ));
    } catch (error) {
      console.error("Error removing member:", error);
    }
  }
  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        className="flex flex-wrap items-center justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Team Members
          </h2>
          <p className="text-gray-400 text-sm mt-1">{members.length} members</p>
        </div>

        <div className="flex items-center gap-2">
          {/* View switch */}
          <div className="flex rounded-lg bg-gray-800 border border-gray-700 overflow-hidden">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="sm"
                variant={view === "list" ? "default" : "ghost"}
                onClick={() => setView("list")}
                className={view === "list" ? "bg-gradient-to-r from-blue-600 to-cyan-600 border-0" : "border-gray-600 hover:border-gray-500"}
              >
                <List className="w-4 h-4" />
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="sm"
                variant={view === "grid" ? "default" : "ghost"}
                onClick={() => setView("grid")}
                className={view === "grid" ? "bg-gradient-to-r from-blue-600 to-cyan-600 border-0" : "border-gray-600 hover:border-gray-500"}
              >
                <Grid3x3 className="w-4 h-4" />
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="sm"
                variant={view === "compact" ? "default" : "ghost"}
                onClick={() => setView("compact")}
                className={view === "compact" ? "bg-gradient-to-r from-blue-600 to-cyan-600 border-0" : "border-gray-600 hover:border-gray-500"}
              >
                <Users className="w-4 h-4" />
              </Button>
            </motion.div>
          </div>

          {isAdmin && (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="sm"
                onClick={onJoinClick}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg hover:shadow-blue-500/50 transition-all"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Add Member
              </Button>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Views */}
      {view === "list" && (
        <TeamListView members={members} isFounder={isFounder} isAdmin={isAdmin} onRemoveMember={onRemoveMember} user={user} onPromoteMember={onPromoteMember} onRemoveMemberAdmin={onRemoveMemberAdmin}/>
      )}
      {view === "grid" && (
        <TeamGridView members={members} isFounder={isFounder} isAdmin={isAdmin} onRemoveMember={onRemoveMember} user={user} onPromoteMember={onPromoteMember} onRemoveMemberAdmin={onRemoveMemberAdmin}/>
      )}
      {view === "compact" && (
        <TeamCompactView members={members} isFounder={isFounder} isAdmin={isAdmin} onRemoveMember={onRemoveMember} user={user} onPromoteMember={onPromoteMember} onRemoveMemberAdmin={onRemoveMemberAdmin}/>
      )}
    </div>
  );
}

const TeamListView = ({ members, isFounder, isAdmin, onRemoveMember, user, onPromoteMember, onRemoveMemberAdmin }  ) => (
  <motion.div
    className="space-y-3"
    variants={containerVariants}
    initial="hidden"
    animate="visible"
  >
    {members.map((member) => (
      <motion.div key={member.id} variants={itemVariants}>
        <Card className="bg-gray-800 border-gray-700 hover:border-blue-500 transition-all">
          <CardContent className="p-0">
            <Link
              to={`/user-profile?userId=${member.userId}`}
              className="flex items-center justify-between p-4"
            >
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <Avatar className="h-12 w-12 shrink-0">
                  <AvatarImage
                    src={
                      getProfilePicture(member)
                    }
                  />
                  <AvatarFallback className="bg-blue-600 text-white">
                    {member.firstName?.[0]}
                    {member.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white truncate">
                    {member.firstName} {member.lastName}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={`text-xs capitalize ${getRoleBadgeColor(member.role)}`}>
                      {member.role}
                    </Badge>
                    <p className="text-xs text-gray-400">
                      {new Date(member.joinedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {
                (user?.admin || isAdmin) && (member.role !== "founder" && !member.admin) && (
                  <button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => onPromoteMember(e, member.id)}
                    className="text-sm text-green-400 hover:bg-green-500/10 hover:text-green-500 ml-2 border border-green-500 rounded-full px-3 py-1 transition-all"
                  >
                    Promote to admin
                  </button>
                )
                }
                {
                  member.role === 'founder' && (
                    <Badge className="text-xs capitalize bg-purple-500/20 text-purple-400">
                      Founder
                    </Badge>
                  )
                }
                {
                  member.admin && member.role !== 'founder' && (
                    <Button
                      onClick={(e) => {
                        isFounder && onRemoveMemberAdmin(e, member.id)
                      }
                      }
                      className="text-xs capitalize bg-green-500/20 text-green-400">
                      Admin
                      {
                        isFounder &&<X className="w-3 h-3 text-green-400 hover:bg-green-500/10 hover:text-green-500 rounded-full p-0.5 transition-all" />
                      }
                    </Button>

                   )
                }
              </div>
              {user?.id !== member.userId && (member.role !== "founder" || user?.admin) && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => onRemoveMember(e, member.id)}
                  className="h-8 w-8 text-red-400 hover:bg-red-500/10 hover:text-red-500 ml-2"
                >
                  <X className="w-4 h-4" />
                </Button>
                
              )}
              
            </Link>
          </CardContent>
        </Card>
      </motion.div>
    ))}
  </motion.div>
);

const TeamGridView = ({ members, isAdmin, isFounder, onRemoveMember, user, onPromoteMember, onRemoveMemberAdmin }) => (
  <motion.div
    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
    variants={containerVariants}
    initial="hidden"
    animate="visible"
  >
    {members.map((member) => (
      <motion.div key={member.id} variants={itemVariants}>
        <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 hover:border-blue-500 transition-all h-full">
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <Link
              to={`/user-profile?userId=${member.userId}`}
              className="flex flex-col items-center text-center"
            >
              <Avatar className="h-16 w-16 mb-3">
                <AvatarImage
                  src={
                    getProfilePicture(member)
                  }
                />
                <AvatarFallback className="bg-blue-600 text-white text-lg">
                  {member.firstName?.[0]}
                  {member.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <p className="text-sm font-semibold text-white">
                {member.firstName} {member.lastName}
              </p>
              <Badge className={`text-xs capitalize mt-2 ${getRoleBadgeColor(member.role)}`}>
                {member.role}
              </Badge>
              <p className="text-xs text-gray-400 mt-2">
                Joined {new Date(member.joinedAt).toLocaleDateString()}
              </p>
            </Link>
            {
              member.admin && member.role !== 'founder' && (
                <Badge
                  onClick={(e) => {
                      
                        isFounder && onRemoveMemberAdmin(e, member.id)
                      }
                      }
                  className="mx-auto my-2 text-xs capitalize bg-green-500/20 text-green-400">
                  Admin
                  {
                    isFounder &&
                  
                    <X className="w-3 h-3 text-green-400 hover:bg-green-500/10 hover:text-green-500 rounded-full p-0.5 transition-all" />
                  }
                </Badge>
              )
            }
            
            
            {(user?.admin || isAdmin) && (member.role !== "founder" && !member.admin) && (
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => onPromoteMember(e, member.id)}
                className="h-8 text-green-400 hover:bg-green-500/10 hover:text-green-500 mt-3 w-full"
              >
                Promote to admin
              </Button>
            )
            }
            {user?.id !== member.userId && (member.role !== "founder" || user?.admin) && (
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => onRemoveMember(e, member.id)}
                className="h-8 text-red-400 hover:bg-red-500/10 hover:text-red-500 mt-3 w-full"
              >
                <X className="w-4 h-4 mr-2" />
                Remove
              </Button>
            )}
          </CardContent>
        </Card>
      </motion.div>
    ))}
  </motion.div>
);

const TeamCompactView = ({ members, isAdmin, isFounder, onRemoveMember, user, onPromoteMember, onRemoveMemberAdmin }) => (
  <motion.div
    className="flex flex-wrap gap-2"
    variants={containerVariants}
    initial="hidden"
    animate="visible"
  >
    {members.map((member) => (
      <motion.div key={member.id} variants={itemVariants}>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Link to={`/user-profile?userId=${member.userId}`}>
                <Avatar className="h-10 w-10 border-2 border-blue-500 hover:border-cyan-400 cursor-pointer object-cover">
                  <AvatarImage
                    src={
                      getProfilePicture(member)
                    }
                  />
                  <AvatarFallback className="bg-blue-600 text-white text-xs">
                    {member.firstName?.[0]}
                    {member.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
              </Link>
            </TooltipTrigger>
            <TooltipContent className="bg-gray-900 border-gray-700 flex flex-col items-center justify-center">
              <div className="text-sm">
                <p className="font-semibold text-white">
                  {member.firstName} {member.lastName}
                </p>
                <p className="text-xs text-gray-400 capitalize">{member.role}</p>
                {
                  member.admin && member.role !== 'founder' && (
                    <Badge
                      onClick={(e) => {
                      
                        isFounder && onRemoveMemberAdmin(e, member.id)
                      }
                      }
                      className="mx-auto my-2 text-xs capitalize bg-green-500/20 text-green-400">
                      Admin
                      {

                        isFounder &&
                        <X className="w-3 h-3 text-green-400 hover:bg-green-500/10 hover:text-green-500 rounded-full p-0.5 transition-all" />
                      }
                    </Badge>
                  )
                }
                {user?.id !== member.userId && (member.role !== "founder" || user?.admin) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => onRemoveMember(e, member.id)}
                    className="text-red-400 hover:bg-red-500 mt-2 w-full"
                  >
                    Remove
                  </Button>
                )}
                {(user?.admin || isAdmin) && (member.role !== "founder" && !member.admin) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => onPromoteMember(e, member.id)}
                    className="text-green-400 hover:bg-green-500 mt-2 w-full"
                  >
                    Promote to admin
                  </Button>
                )
                }
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </motion.div>
    ))}
  </motion.div>
);

const getRoleBadgeColor = (role) => {
  switch (role) {
    case "founder":
      return "bg-purple-500/20 text-purple-400";
    case "co-founder":
      return "bg-blue-500/20 text-blue-400";
    default:
      return "bg-gray-500/20 text-gray-400";
  }
};
