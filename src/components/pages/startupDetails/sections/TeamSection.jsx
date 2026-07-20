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
import AddMemberModal from "../modals/AddMember";
import DeleteConfirmationModal from "@/utils/confirm";

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

export default function TeamSection({ members, setMembers, isFounder, isAdmin, startupId, callback, roles }) {
  const [view, setView] = useState(localStorage.getItem("teamView") || "list");
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(null);
  const [isDeleteAdminConfirmOpen, setIsDeleteAdminConfirmOpen] = useState(null);
  const { user } = useSelector((state) => state.auth);
  useEffect(() => {
    localStorage.setItem("teamView", view);
  }, [view]);
  const handlePromoteMember = async (memberId) => {
    try {
      const response = await startupsAPI.promoteMemberToAdmin(startupId, memberId);
      if (response.success) {
        setMembers((prevMembers) =>
          prevMembers.map((member) =>
            member.id === memberId ? { ...member, admin: true } : member
          )
        );
        callback && callback();
      }
    } catch (error) {
      console.error("Error promoting member:", error);
    }
  }

  const handleRemoveMemberAdmin = async (memberId) => {
    try {
      await startupsAPI.demoteMemberAdmin(startupId, memberId);
      setMembers((prevMembers) => prevMembers.map((member) =>
        member.id === memberId ? { ...member, admin: false } : member
      ));
    } catch (error) {
      console.error("Error removing member:", error);
    }
  }

  const [memberForm, setMemberForm] = useState({
    user_id: '',
    first_name: '',
    last_name: '',
    role: ''
  });
  // Member handlers
  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      if (!memberForm.role) {
        toast.error('Please select a role for the member');
        return
      }
      if (!memberForm.user_id) {
        toast.error('Please select a user to add as a member');
        return
      }
      const response = await startupsAPI.createInvitation(startupId, memberForm);



      if (response.success) {
        toast.success('Member added successfully');
        setIsAddMemberModalOpen(false);
        setMemberForm({ user_id: '', first_name: '', last_name: '', role: 'member' });
        setMembers((prev) => [...prev, response?.data.member])
      } else {
        throw new Error('Failed to add member');
      }
    } catch (error) {

      toast.error(error?.error || 'Error adding member');
    }
  };

  const handleRemoveMember = async (memberId) => {
    try {
      const response = await startupsAPI.removeMember(startupId, memberId);

      if (response.success) {
        toast.success('Member removed successfully');
        setMembers(prevMembers => prevMembers.filter(m => m.id !== memberId));
      } else {
        throw new Error('Failed to remove member');
      }
    } catch {
      toast.error('Error removing member');
    }
  };
  const handleChangeRole = async (memberId, newRole) => {
    try {
      const response = await startupsAPI.changeMemberRole(startupId, memberId, newRole);
      if (response.success) {
        setMembers(prevMembers => prevMembers.map(m => m.id === memberId ? { ...m, role: newRole } : m));
      } else {
        throw new Error('Failed to change member role');
      }
    } catch (error) {
      toast.error('Error changing member role');
      console.error('Error changing member role:', error);
    }
  }
  return (
    <>
      <AddMemberModal
        isOpen={isAddMemberModalOpen}
        onClose={() => setIsAddMemberModalOpen(false)}
        roles={roles || []}
        onSubmit={handleAddMember}
        formData={memberForm}
        onFormChange={setMemberForm}
      />
      <DeleteConfirmationModal
        isOpen={!!isDeleteConfirmOpen || !!isDeleteAdminConfirmOpen}
        onClose={() => {
          setIsDeleteConfirmOpen(null);
          setIsDeleteAdminConfirmOpen(null);
        }}
        onConfirm={() => {
          if (isDeleteAdminConfirmOpen) {
            handleRemoveMemberAdmin(isDeleteAdminConfirmOpen);
          } else {
            handleRemoveMember(isDeleteConfirmOpen);
          }
          setIsDeleteConfirmOpen(null);
          setIsDeleteAdminConfirmOpen(null);
        }}
        title="Confirm Action"
        message={isDeleteAdminConfirmOpen ? "Are you sure you want to remove admin privileges from this member?" : "Are you sure you want to remove this member from the startup?"}
        type="soft" />

      <div className="space-y-6">
        {/* Header */}
        <motion.div
          className="flex flex-wrap items-center justify-between"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <h2 className="text-3xl font-bold bg-linear-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
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
                  className={view === "list" ? "bg-linear-to-r from-blue-600 to-cyan-600 border-0" : "border-gray-600 hover:border-gray-500"}
                >
                  <List className="w-4 h-4" />
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="sm"
                  variant={view === "grid" ? "default" : "ghost"}
                  onClick={() => setView("grid")}
                  className={view === "grid" ? "bg-linear-to-r from-blue-600 to-cyan-600 border-0" : "border-gray-600 hover:border-gray-500"}
                >
                  <Grid3x3 className="w-4 h-4" />
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="sm"
                  variant={view === "compact" ? "default" : "ghost"}
                  onClick={() => setView("compact")}
                  className={view === "compact" ? "bg-linear-to-r from-blue-600 to-cyan-600 border-0" : "border-gray-600 hover:border-gray-500"}
                >
                  <Users className="w-4 h-4" />
                </Button>
              </motion.div>
            </div>

            {isAdmin && (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="sm"
                  onClick={() => setIsAddMemberModalOpen(true)}
                  className="bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg hover:shadow-blue-500/50 transition-all"
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
          <TeamListView members={members} isFounder={isFounder}
            isAdmin={isAdmin} user={user}
            handlePromoteMember={handlePromoteMember}
            handleRemoveMember={setIsDeleteConfirmOpen}
            handleRemoveMemberAdmin={setIsDeleteAdminConfirmOpen}
            handleChangeRole={handleChangeRole} roles={roles} />
        )}
        {view === "grid" && (
          <TeamGridView members={members} isFounder={isFounder}
            isAdmin={isAdmin} user={user}
            handleRemoveMemberAdmin={handleRemoveMemberAdmin}
            handlePromoteMember={handlePromoteMember}
            handleRemoveMember={setIsDeleteConfirmOpen}
            handleChangeRole={handleChangeRole} roles={roles} />
        )}
        {view === "compact" && (
          <TeamCompactView members={members} isFounder={isFounder}
            isAdmin={isAdmin} user={user}
            handlePromoteMember={handlePromoteMember}
            handleRemoveMember={setIsDeleteConfirmOpen}
            handleRemoveMemberAdmin={setIsDeleteAdminConfirmOpen}
            handleChangeRole={handleChangeRole} roles={roles} />
        )}
      </div>
    </>
  );
}

const TeamListView = ({ members, isFounder, isAdmin, user, handlePromoteMember, handleRemoveMember, handleRemoveMemberAdmin, handleChangeRole, roles }) => (
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
                    {isAdmin && member.role !== 'founder' ? (
                      <select
                        value={member.role}
                        onChange={(e) => handleChangeRole && handleChangeRole(member.id, e.target.value)}
                        onClick={(e) => e.preventDefault()}
                        className="text-xs bg-gray-700 text-white border border-gray-600 rounded px-2 py-1 capitalize"
                      >
                        {Object.keys(roles || {}).map((role) => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <Badge className={`text-xs capitalize ${getRoleBadgeColor(member.role)}`}>
                        {member.role}
                      </Badge>
                    )}
                    <p className="text-xs text-gray-400">
                      {new Date(member.joinedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {
                  (user?.admin || isAdmin) && (member.role !== "founder" && !member.admin) && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handlePromoteMember(member.id);
                      }}
                      className="text-sm text-green-400 hover:bg-green-500/10 hover:text-green-500 ml-2 border border-green-500 rounded-full px-3 py-1 transition-all"
                    >
                      Promote to admin
                    </button>
                  )
                }
                {
                  member.admin && member.role !== 'founder' && (
                    <Badge className="text-xs capitalize bg-green-500/20 text-green-400">
                      Admin
                      {isFounder && <X className="w-3 h-3 text-green-400 hover:bg-green-500/10 hover:text-green-500 rounded-full p-0.5 transition-all cursor-pointer" onClick={(e) => {
                        e.preventDefault();
                        handleRemoveMemberAdmin(member.id);
                      }} />}
                    </Badge>
                  )
                }
              </div>
              {(isAdmin || user?.admin) && user?.id !== member.userId && (member.role !== "founder" || user?.admin) && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.preventDefault();
                    handleRemoveMember(member.id);
                  }}
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

const TeamGridView = ({ members, isAdmin, isFounder, user, handleRemoveMemberAdmin, handlePromoteMember, handleRemoveMember, handleChangeRole, roles }) => (
  <motion.div
    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
    variants={containerVariants}
    initial="hidden"
    animate="visible"
  >
    {members.map((member) => (
      <motion.div key={member.id} variants={itemVariants}>
        <Card className="bg-linear-to-br from-gray-800 to-gray-900 border-gray-700 hover:border-blue-500 transition-all h-full">
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
              {console.log(member.role, roles)}
              {isAdmin && member.role !== 'founder' ? (
                <select
                  value={member.role}
                  onChange={(e) => handleChangeRole && handleChangeRole(member.id, e.target.value)}
                  onClick={(e) => e.preventDefault()}
                  className="text-xs bg-gray-700 text-white border border-gray-600 rounded px-2 py-1 capitalize mt-2"
                >
                  {Object.keys(roles || {}).map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              ) : (
                <Badge className={`text-xs capitalize mt-2 ${getRoleBadgeColor(member.role)}`}>
                  {member.role}
                </Badge>
              )}
              <p className="text-xs text-gray-400 mt-2">
                Joined {new Date(member.joinedAt).toLocaleDateString()}
              </p>
            </Link>
            {
              member.admin && member.role !== 'founder' && (
                <Badge
                  onClick={() => isFounder && handleRemoveMemberAdmin(member.id)}
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
                onClick={() => handlePromoteMember(member.id)}
                className="h-8 text-green-400 hover:bg-green-500/10 hover:text-green-500 mt-3 w-full"
              >
                Promote to admin
              </Button>
            )}
            {(isAdmin || user?.admin) && user?.id !== member.userId && (member.role !== "founder" || user?.admin) && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveMember(member.id)}
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

const TeamCompactView = ({ members, isAdmin, isFounder, handleRemoveMember, user, handlePromoteMember, handleRemoveMemberAdmin, roles, handleChangeRole }) => (
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
            <TooltipContent side="right" className="bg-gray-900 border-gray-700 flex flex-col items-center justify-center">
              <div className="text-sm w-full">
                <p className="font-semibold text-center w-full text-white">
                  {member.firstName} {member.lastName}
                </p>

                {isAdmin && member.role !== 'founder' && (
                  <select
                    value={member.role}
                    onChange={(e) => handleChangeRole && handleChangeRole(member.id, e.target.value)}
                    className="mt-2 w-full px-2 py-1 text-xs bg-gray-800 text-white border border-gray-700 rounded capitalize"
                  >
                    {Object.keys(roles || {}).map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                )}
                {!isAdmin && (
                  <p className="text-xs text-gray-400 capitalize mt-1">{member.role}</p>
                )}

                {
                  member.admin && member.role !== 'founder' && (
                    <Badge
                      onClick={() => isFounder && handleRemoveMemberAdmin(member.id)}
                      className="mx-auto my-2 text-xs capitalize bg-green-500/20 text-green-400">
                      Admin
                      {
                        isFounder &&
                        <X className="w-3 h-3 text-green-400 hover:bg-green-500/10 hover:text-green-500 rounded-full p-0.5 transition-all" />
                      }
                    </Badge>
                  )
                }
                {(isAdmin || user?.admin) && user?.id !== member.userId && (member.role !== "founder" || user?.admin) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveMember(member.id)}
                    className="text-red-400 hover:bg-red-500 mt-2 w-full"
                  >
                    Remove
                  </Button>
                )}
                {(user?.admin || isAdmin) && (member.role !== "founder" && !member.admin) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePromoteMember(member.id)}
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
