import { useEffect, useState } from "react";
import { API_URL } from "@/utils/config";
import { UserPlus, X, List, Grid3x3, Users, Crown } from "lucide-react";
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

      <div className="space-y-6 text-zinc-100">
        {/* Header */}
        <motion.div
          className="flex flex-wrap items-center justify-between gap-3"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <h2 className="text-xl font-bold tracking-tight text-zinc-50">
              Team Members
            </h2>
            <p className="mt-1 text-sm text-zinc-400">{members.length} members</p>
          </div>

          <div className="flex items-center gap-2">
            {/* View switch */}
            <div className="flex overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setView("list")}
                className={`rounded-none ${
                  view === "list"
                    ? "bg-indigo-600 text-white hover:bg-indigo-500"
                    : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                }`}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setView("grid")}
                className={`rounded-none ${
                  view === "grid"
                    ? "bg-indigo-600 text-white hover:bg-indigo-500"
                    : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                }`}
              >
                <Grid3x3 className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setView("compact")}
                className={`rounded-none ${
                  view === "compact"
                    ? "bg-indigo-600 text-white hover:bg-indigo-500"
                    : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                }`}
              >
                <Users className="h-4 w-4" />
              </Button>
            </div>

            {isAdmin && (
              <Button
                size="sm"
                onClick={() => setIsAddMemberModalOpen(true)}
                className="bg-indigo-600 text-white hover:bg-indigo-500"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Add Member
              </Button>
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

const roleSelectClass =
  "text-xs bg-zinc-950 text-zinc-200 border border-zinc-700 rounded px-2 py-1 capitalize focus:outline-none focus:ring-1 focus:ring-indigo-500";

const TeamListView = ({ members, isFounder, isAdmin, user, handlePromoteMember, handleRemoveMember, handleRemoveMemberAdmin, handleChangeRole, roles }) => (
  <motion.div
    className="space-y-2"
    variants={containerVariants}
    initial="hidden"
    animate="visible"
  >
    {members.map((member) => (
      <motion.div key={member.id} variants={itemVariants}>
        <Card className="border-zinc-800 bg-zinc-900/60 transition-colors hover:border-zinc-700">
          <CardContent className="p-0">
            <Link
              to={`/user-profile?userId=${member.userId}`}
              className="flex items-center justify-between p-4"
            >
              <div className="flex min-w-0 flex-1 items-center gap-4">
                <Avatar className="h-12 w-12 shrink-0">
                  <AvatarImage
                    src={
                      getProfilePicture(member)
                    }
                  />
                  <AvatarFallback className="bg-indigo-600 text-white">
                    {member.firstName?.[0]}
                    {member.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-zinc-100">
                    {member.firstName} {member.lastName}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    {isAdmin && member.role !== 'founder' ? (
                      <select
                        value={member.role}
                        onChange={(e) => handleChangeRole && handleChangeRole(member.id, e.target.value)}
                        onClick={(e) => e.preventDefault()}
                        className={roleSelectClass}
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
                    <p className="text-xs text-zinc-500">
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
                      className="ml-2 flex items-center gap-1 rounded-full border border-emerald-500/30 px-3 py-1 text-sm text-emerald-400 transition-all hover:bg-emerald-500/10 hover:text-emerald-300"
                    >
                      <Crown className="h-3.5 w-3.5" />
                      Promote to admin
                    </button>
                  )
                }
                {
                  member.admin && member.role !== 'founder' && (
                    <Badge className="flex items-center gap-1 border border-emerald-500/20 bg-emerald-500/10 text-xs capitalize text-emerald-400 hover:bg-emerald-500/10">
                      Admin
                      {isFounder && <X className="h-3 w-3 cursor-pointer rounded-full p-0.5 text-emerald-400 transition-all hover:bg-emerald-500/10 hover:text-emerald-300" onClick={(e) => {
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
                  className="ml-2 h-8 w-8 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                >
                  <X className="h-4 w-4" />
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
    className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
    variants={containerVariants}
    initial="hidden"
    animate="visible"
  >
    {members.map((member) => (
      <motion.div key={member.id} variants={itemVariants}>
        <Card className="h-full border-zinc-800 bg-zinc-900/60 transition-colors hover:border-zinc-700">
          <CardContent className="flex flex-col items-center justify-center p-4">
            <Link
              to={`/user-profile?userId=${member.userId}`}
              className="flex flex-col items-center text-center"
            >
              <Avatar className="mb-3 h-16 w-16">
                <AvatarImage
                  src={
                    getProfilePicture(member)
                  }
                />
                <AvatarFallback className="bg-indigo-600 text-lg text-white">
                  {member.firstName?.[0]}
                  {member.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <p className="text-sm font-semibold text-zinc-100">
                {member.firstName} {member.lastName}
              </p>
              {isAdmin && member.role !== 'founder' ? (
                <select
                  value={member.role}
                  onChange={(e) => handleChangeRole && handleChangeRole(member.id, e.target.value)}
                  onClick={(e) => e.preventDefault()}
                  className={`${roleSelectClass} mt-2`}
                >
                  {Object.keys(roles || {}).map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              ) : (
                <Badge className={`mt-2 text-xs capitalize ${getRoleBadgeColor(member.role)}`}>
                  {member.role}
                </Badge>
              )}
              <p className="mt-2 text-xs text-zinc-500">
                Joined {new Date(member.joinedAt).toLocaleDateString()}
              </p>
            </Link>
            {
              member.admin && member.role !== 'founder' && (
                <Badge
                  onClick={() => isFounder && handleRemoveMemberAdmin(member.id)}
                  className="mx-auto my-2 flex items-center gap-1 border border-emerald-500/20 bg-emerald-500/10 text-xs capitalize text-emerald-400 hover:bg-emerald-500/10">
                  Admin
                  {
                    isFounder &&
                    <X className="h-3 w-3 cursor-pointer rounded-full p-0.5 text-emerald-400 transition-all hover:bg-emerald-500/10 hover:text-emerald-300" />
                  }
                </Badge>
              )
            }
            {(user?.admin || isAdmin) && (member.role !== "founder" && !member.admin) && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handlePromoteMember(member.id)}
                className="mt-3 h-8 w-full gap-1.5 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300"
              >
                <Crown className="h-3.5 w-3.5" />
                Promote to admin
              </Button>
            )}
            {(isAdmin || user?.admin) && user?.id !== member.userId && (member.role !== "founder" || user?.admin) && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveMember(member.id)}
                className="mt-3 h-8 w-full text-red-400 hover:bg-red-500/10 hover:text-red-300"
              >
                <X className="mr-2 h-4 w-4" />
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
                <Avatar className="h-10 w-10 cursor-pointer border-2 border-zinc-700 object-cover hover:border-indigo-500">
                  <AvatarImage
                    src={
                      getProfilePicture(member)
                    }
                  />
                  <AvatarFallback className="bg-indigo-600 text-xs text-white">
                    {member.firstName?.[0]}
                    {member.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right" className="flex flex-col items-center justify-center border-zinc-800 bg-zinc-900">
              <div className="w-full text-sm">
                <p className="w-full text-center font-semibold text-zinc-100">
                  {member.firstName} {member.lastName}
                </p>

                {isAdmin && member.role !== 'founder' && (
                  <select
                    value={member.role}
                    onChange={(e) => handleChangeRole && handleChangeRole(member.id, e.target.value)}
                    className={`${roleSelectClass} mt-2 w-full`}
                  >
                    {Object.keys(roles || {}).map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                )}
                {!isAdmin && (
                  <p className="mt-1 text-center text-xs capitalize text-zinc-400">{member.role}</p>
                )}

                {
                  member.admin && member.role !== 'founder' && (
                    <Badge
                      onClick={() => isFounder && handleRemoveMemberAdmin(member.id)}
                      className="mx-auto my-2 flex items-center gap-1 border border-emerald-500/20 bg-emerald-500/10 text-xs capitalize text-emerald-400 hover:bg-emerald-500/10">
                      Admin
                      {
                        isFounder &&
                        <X className="h-3 w-3 cursor-pointer rounded-full p-0.5 text-emerald-400 transition-all hover:bg-emerald-500/10 hover:text-emerald-300" />
                      }
                    </Badge>
                  )
                }
                {(isAdmin || user?.admin) && user?.id !== member.userId && (member.role !== "founder" || user?.admin) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveMember(member.id)}
                    className="mt-2 w-full text-red-400 hover:bg-red-500/10 hover:text-red-300"
                  >
                    Remove
                  </Button>
                )}
                {(user?.admin || isAdmin) && (member.role !== "founder" && !member.admin) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePromoteMember(member.id)}
                    className="mt-2 w-full text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300"
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
      return "border border-violet-500/20 bg-violet-500/10 text-violet-400";
    case "co-founder":
      return "border border-indigo-500/20 bg-indigo-500/10 text-indigo-400";
    default:
      return "border border-zinc-600/40 bg-zinc-500/10 text-zinc-400";
  }
};
