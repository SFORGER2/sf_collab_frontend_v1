import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";

import { startupsAPI } from "@/utils/APIs/startupsAPI";
import AddMemberModal from "../../startupDetails/modals/AddMember";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getProfilePicture } from "@/utils/getProfilePicture";
import {
  Users,
  Search,
  UserPlus,
  Trash2,
  Crown,
  Shield,
  Calendar,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Building2,
  X,
} from "lucide-react";
import DeleteConfirmationModal from "@/utils/confirm";

const FounderManageTeam = () => {
  const { user, access_token } = useSelector((state) => state.auth);
  const [startups, setStartups] = useState([]);
  const [expandedStartup, setExpandedStartup] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(null);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [selectedStartupId, setSelectedStartupId] = useState(null);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    role: "",
    user_id: null,
  });

  useEffect(() => {
    fetchStartupsWithMembers();
  }, []);

  const fetchStartupsWithMembers = async () => {
    setLoading(true);
    try {
      const params = { my_startups: true };
      const response = await startupsAPI.getAll(params);

      if (response.success && response.data.startups.length > 0) {
        const startupsWithMembers = await Promise.all(
          response.data.startups.map(async (startup) => {
            try {
              const membersResponse = await startupsAPI.getMembers(startup.id);
              return {
                ...startup,
                members: membersResponse.success ? membersResponse.data.members || [] : [],
              };
            } catch (err) {
              console.error(`Failed to fetch members for startup ${startup.id}`, err);
              return { ...startup, members: [] };
            }
          })
        );
        setStartups(startupsWithMembers);
        setExpandedStartup(startupsWithMembers[0]?.id || null);
        setError(null);
      }
    } catch (err) {
      setError("Failed to fetch startup details");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!selectedStartupId) {
      setError("Please select a startup");
      return;
    }

    try {
      const response = await startupsAPI.createInvitation(
        selectedStartupId,
        {
          user_id: formData.user_id,
          first_name: formData.first_name,
          last_name: formData.last_name,
          role: formData.role,
        },
        access_token
      );

      if (response.success) {
        setStartups((prev) =>
          prev.map((startup) =>
            startup.id === selectedStartupId
              ? { ...startup, members: [...startup.members, response.data.member] }
              : startup
          )
        );
        setIsAddMemberOpen(false);
        setFormData({ first_name: "", last_name: "", role: "", user_id: null });
        setSuccess("Member added successfully!");
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      setError("Failed to add member");
      console.error(err);
    }
  };

  const handleRemoveMember = async (startupId, memberId) => {
    try {
      const response = await startupsAPI.removeMember(startupId, memberId);
      if (response.success) {
        setStartups((prev) =>
          prev.map((startup) =>
            startup.id === startupId
              ? {
                  ...startup,
                  members: startup.members.filter((m) => m.id !== memberId),
                }
              : startup
          )
        );
        setSuccess("Member removed successfully!");
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      setError("Failed to remove member");
      setTimeout(() => setError(null), 3000);
    }
  };

  const handlePromoteToAdmin = async (startupId, memberId) => {
    try {
      const response = await startupsAPI.promoteMemberToAdmin(startupId, memberId);
      if (response.success) {
        setStartups((prev) =>
          prev.map((startup) =>
            startup.id === startupId
              ? {
                  ...startup,
                  members: startup.members.map((m) =>
                    m.id === memberId ? { ...m, admin: true } : m
                  ),
                }
              : startup
          )
        );
        setSuccess("Member promoted to admin!");
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      setError("Failed to promote member");
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleDemoteAdmin = async (startupId, memberId) => {
    try {
      const response = await startupsAPI.demoteMemberAdmin(startupId, memberId);
      if (response.success) {
        setStartups((prev) =>
          prev.map((startup) =>
            startup.id === startupId
              ? {
                  ...startup,
                  members: startup.members.map((m) =>
                    m.id === memberId ? { ...m, admin: false } : m
                  ),
                }
              : startup
          )
        );
        setSuccess("Member demoted successfully!");
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      setError("Failed to demote member");
      setTimeout(() => setError(null), 3000);
    }
  };

  const getFilteredStartups = () => {
    if (!searchQuery) return startups;

    return startups.filter((startup) => {
      const startupMatches = startup.name.toLowerCase().includes(searchQuery.toLowerCase());
      const membersMatch = startup.members.some((member) =>
        `${member.firstName} ${member.lastName}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      );
      return startupMatches || membersMatch;
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  const filteredStartups = getFilteredStartups();
  const totalMembers = startups.reduce((sum, s) => sum + s.members.length, 0);
  const totalAdmins = startups.reduce(
    (sum, s) => sum + s.members.filter((m) => m.admin).length,
    0
  );

  return (
    <div className="min-h-screen bg-zinc-950 px-2 py-8 text-zinc-100 md:px-4">
      <div className="relative mx-auto w-full space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20">
              <Users className="h-5 w-5 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-50">
                Manage Team
              </h1>
              <p className="mt-1 text-sm text-zinc-400">
                Manage your startup team members and roles
              </p>
            </div>
          </div>
        </motion.div>

        {/* KPI Stats */}
        <motion.div
          className="grid grid-cols-1 gap-4 md:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -2 }}
            className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 transition-colors hover:border-zinc-700"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10">
              <Building2 className="h-4.5 w-4.5 text-indigo-400" />
            </div>
            <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Total Startups
            </p>
            <p className="mt-1 text-2xl font-bold text-zinc-50">{startups.length}</p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            whileHover={{ y: -2 }}
            className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 transition-colors hover:border-zinc-700"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/10">
              <Users className="h-4.5 w-4.5 text-violet-400" />
            </div>
            <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Total Members
            </p>
            <p className="mt-1 text-2xl font-bold text-zinc-50">{totalMembers}</p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            whileHover={{ y: -2 }}
            className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 transition-colors hover:border-zinc-700"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10">
              <Shield className="h-4.5 w-4.5 text-emerald-400" />
            </div>
            <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Admin Members
            </p>
            <p className="mt-1 text-2xl font-bold text-zinc-50">{totalAdmins}</p>
          </motion.div>
        </motion.div>

        {/* Search */}
        <motion.div
          className="space-y-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
        >
          <div className="relative max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by startup or member name..."
              className="border border-zinc-700 bg-zinc-900 pl-9 text-zinc-200 placeholder:text-zinc-500 focus-visible:ring-indigo-500"
            />
          </div>

          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="flex items-center gap-1 text-sm text-indigo-400 transition-colors hover:text-indigo-300"
            >
              <X className="h-3.5 w-3.5" />
              Clear search
            </button>
          )}
        </motion.div>

        {/* Messages */}
        <AnimatePresence>
          {success && (
            <motion.div
              className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-emerald-300"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              <span className="text-sm">{success}</span>
            </motion.div>
          )}

          {error && (
            <motion.div
              className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-300"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span className="text-sm">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Startups List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/60 px-6 py-5"
                >
                  <div className="space-y-2">
                    <div className="h-4 w-40 animate-pulse rounded bg-zinc-800" />
                    <div className="h-3 w-24 animate-pulse rounded bg-zinc-800" />
                  </div>
                  <div className="h-4 w-4 animate-pulse rounded bg-zinc-800" />
                </div>
              ))}
            </div>
          ) : filteredStartups.length === 0 ? (
            <motion.div
              className="rounded-2xl border border-zinc-800 bg-zinc-900/60 py-16 text-center"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="mb-3 flex justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800/80">
                  <Building2 className="h-6 w-6 text-zinc-500" />
                </div>
              </div>
              <p className="font-medium text-zinc-200">No startups found</p>
              <p className="mt-1 text-sm text-zinc-500">
                Create a startup to manage team members
              </p>
            </motion.div>
          ) : (
            filteredStartups.map((startup, startupIndex) => (
              <motion.div
                key={startup.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: startupIndex * 0.04 }}
                className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/60 transition-colors hover:border-zinc-700"
              >
                {/* Startup Header */}
                <button
                  onClick={() =>
                    setExpandedStartup(
                      expandedStartup === startup.id ? null : startup.id
                    )
                  }
                  className="flex w-full items-center justify-between px-6 py-4 transition-colors hover:bg-zinc-800/40"
                >
                  <div className="flex flex-1 items-center gap-4 text-left">
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-zinc-100">
                        {startup.name}
                      </h3>
                      <p className="mt-1 text-sm text-zinc-500">
                        {startup.members.length} member{startup.members.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                  <motion.div
                    animate={{
                      rotate: expandedStartup === startup.id ? 180 : 0,
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="h-5 w-5 text-zinc-500" />
                  </motion.div>
                </button>

                {/* Members List */}
                <motion.div
                  initial={false}
                  animate={{
                    height: expandedStartup === startup.id ? "auto" : 0,
                    opacity: expandedStartup === startup.id ? 1 : 0,
                  }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden border-t border-zinc-800"
                >
                  <div className="space-y-4 p-6">
                    {startup.members.length === 0 ? (
                      <p className="py-8 text-center text-zinc-500">
                        No members in this startup yet
                      </p>
                    ) : (
                      <>
                        {/* Add Member Button */}
                        <Button
                          onClick={() => {
                            setSelectedStartupId(startup.id);
                            setIsAddMemberOpen(true);
                          }}
                          className="w-full bg-indigo-600 text-white hover:bg-indigo-500"
                        >
                          <UserPlus className="mr-2 h-4 w-4" />
                          Add Member
                        </Button>

                        {/* Members */}
                        <div className="space-y-2">
                          {startup.members.map((member, memberIndex) => (
                            <motion.div
                              key={member.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: memberIndex * 0.04 }}
                              className="flex flex-col items-start justify-between gap-4 rounded-lg border border-zinc-800 bg-zinc-950/40 p-4 transition-colors hover:bg-zinc-800/40 md:flex-row md:items-center"
                            >
                              <div className="flex min-w-0 flex-1 items-center gap-3">
                                <Avatar className="h-10 w-10 shrink-0">
                                  <AvatarImage src={getProfilePicture(member)} />
                                  <AvatarFallback className="bg-indigo-600 text-sm font-medium text-white">
                                    {member.firstName?.[0]}
                                    {member.lastName?.[0]}
                                  </AvatarFallback>
                                </Avatar>

                                <div className="min-w-0 flex-1">
                                  <p className="truncate font-medium text-zinc-100">
                                    {member.firstName} {member.lastName}
                                  </p>
                                  <div className="mt-1 flex flex-wrap items-center gap-2">
                                    <Badge className="border border-indigo-500/20 bg-indigo-500/10 text-xs capitalize text-indigo-400 hover:bg-indigo-500/10">
                                      {member.role}
                                    </Badge>
                                    {member.admin && (
                                      <Badge className="flex items-center gap-1 border border-emerald-500/20 bg-emerald-500/10 text-xs text-emerald-400 hover:bg-emerald-500/10">
                                        <Shield className="h-3 w-3" />
                                        Admin
                                      </Badge>
                                    )}
                                    {member.joinedAt && (
                                      <p className="flex items-center gap-1 text-xs text-zinc-500">
                                        <Calendar className="h-3 w-3" />
                                        {new Date(member.joinedAt).toLocaleDateString()}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="flex w-full shrink-0 items-center gap-2 md:w-auto">
                                {!member.admin ? (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      handlePromoteToAdmin(startup.id, member.id)
                                    }
                                    className="border-emerald-500/30 bg-transparent text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300"
                                  >
                                    <Crown className="mr-1.5 h-3.5 w-3.5" />
                                    Make Admin
                                  </Button>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      handleDemoteAdmin(startup.id, member.id)
                                    }
                                    className="border-amber-500/30 bg-transparent text-amber-400 hover:bg-amber-500/10 hover:text-amber-300"
                                  >
                                    Demote
                                  </Button>
                                )}
                                {startup?.creator?.id !== member.userId && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      setIsDeleteConfirmOpen({
                                        startupId: startup.id,
                                        member: member.id,
                                      })
                                    }
                                    className="border-red-500/30 bg-transparent text-red-400 hover:bg-red-500/10 hover:text-red-300"
                                  >
                                    <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                                    Remove
                                  </Button>
                                )}
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            ))
          )}
        </motion.div>
      </div>

      {/* Add Member Modal */}
      {selectedStartupId && (
        <AddMemberModal
          isOpen={isAddMemberOpen}
          onClose={() => {
            setIsAddMemberOpen(false);
            setFormData({
              first_name: "",
              last_name: "",
              role: "",
              user_id: null,
            });
          }}
          roles={startups.find((s) => s.id === selectedStartupId)?.roles || []}
          onSubmit={handleAddMember}
          startupId={selectedStartupId}
          formData={formData}
          onFormChange={setFormData}
        />
      )}

      <DeleteConfirmationModal
        isOpen={!!isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(null)}
        onConfirm={() => {
          handleRemoveMember(
            isDeleteConfirmOpen.startupId,
            isDeleteConfirmOpen.member
          );
          setIsDeleteConfirmOpen(null);
        }}
        title="Remove Member"
        message="Are you sure you want to remove this member from the startup? This action cannot be undone."
        type="soft"
      />
    </div>
  );
};

export default FounderManageTeam;
