import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { startupsAPI } from "@/utils/APIs/startupsAPI";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import {
  Mail,
  CheckCircle,
  X,
  AlertCircle,
  Search,
  Building2,
  Calendar,
  User,
  Clock,
  Sparkles,
  Users,
  Trophy,
} from "lucide-react";

const InviteToStartup = () => {
  const { user } = useSelector((state) => state.auth);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("pending");
  const [invitations, setInvitations] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvitations();
  }, [user]);

  const fetchInvitations = async () => {
    setLoading(true);
    try {
      const res = await startupsAPI.getMyInvitations({
        status: filterStatus === "all" ? undefined : filterStatus,
        page: 1,
        per_page: 100,
      });
      setInvitations(res.data?.invitations || res.invitations || []);
      setError(null);
    } catch (err) {
      console.error("Failed to load invitations", err);
      setError("Failed to load invitations");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (startupId, invitationId) => {
    try {
      const res = await startupsAPI.acceptInvitation(startupId, invitationId);
      if (res.success || res.data) {
        setInvitations((prev) =>
          prev.map((inv) =>
            inv.id === invitationId ? { ...inv, status: "accepted" } : inv
          )
        );
        setSuccess("Invitation accepted! You've joined the startup.");
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      console.error("Failed to accept invitation", err);
      setError("Failed to accept invitation");
    }
  };

  const handleReject = async (startupId, invitationId) => {
    try {
      const res = await startupsAPI.rejectInvitation(startupId, invitationId);
      if (res.success || res.data) {
        setInvitations((prev) =>
          prev.filter((inv) => inv.id !== invitationId)
        );
        setSuccess("Invitation rejected");
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      console.error("Failed to reject invitation", err);
      setError("Failed to reject invitation");
    }
  };

  const statusUI = {
    pending: {
      label: "Pending",
      class: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
      icon: <Clock className="w-4 h-4" />,
    },
    accepted: {
      label: "Accepted",
      class: "bg-green-500/20 text-green-300 border-green-500/30",
      icon: <CheckCircle className="w-4 h-4" />,
    },
    rejected: {
      label: "Rejected",
      class: "bg-red-500/20 text-red-300 border-red-500/30",
      icon: <X className="w-4 h-4" />,
    },
  };

  const getFilteredInvitations = () => {
    return invitations
      .filter((inv) =>
        filterStatus === "all" || inv?.status === filterStatus
      )
      .filter((inv) => {
        const startupName = inv.startup_name || "";
        return startupName.toLowerCase().includes(searchQuery.toLowerCase());
      });
  };

  const getTotalStats = () => {
    return {
      total: invitations.length,
      pending: invitations.filter((inv) => inv?.status === "pending").length,
      accepted: invitations.filter((inv) => inv?.status === "accepted").length,
    };
  };

  const stats = getTotalStats();
  const filteredInvitations = getFilteredInvitations();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <div className="min-h-screen bg-black text-white px-2 md:px-4 lg:pl-6 py-8">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />
        <div className="absolute top-1/4 left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-10 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" style={{ animationDelay: '2s' }} />
      </div>

      <div className="w-full mx-auto space-y-8 w-full relative z-10">
        {/* Header */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-5xl md:text-6xl font-bold bg-linear-to-r from-white to-blue-200 bg-clip-text text-transparent">
                My Invitations
              </h1>
              <p className="text-gray-400 text-lg mt-2">
                Manage your startup opportunities
              </p>
            </div>
          </div>
        </motion.div>

        {/* KPI Stats */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -4, scale: 1.02 }}
            className="group relative overflow-hidden rounded-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative bg-slate-900/90 backdrop-blur border border-white/10 group-hover:border-blue-500/50 rounded-2xl p-6 space-y-3 transition-all">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Mail className="w-5 h-5 text-blue-400" />
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">
                  Total Invitations
                </p>
                <p className="text-3xl font-bold text-white mt-2">
                  {stats.total}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            whileHover={{ y: -4, scale: 1.02 }}
            className="group relative overflow-hidden rounded-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative bg-slate-900/90 backdrop-blur border border-white/10 group-hover:border-yellow-500/50 rounded-2xl p-6 space-y-3 transition-all">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <Clock className="w-5 h-5 text-yellow-400" />
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">
                  Awaiting Response
                </p>
                <p className="text-3xl font-bold text-white mt-2">
                  {stats.pending}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            whileHover={{ y: -4, scale: 1.02 }}
            className="group relative overflow-hidden rounded-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative bg-slate-900/90 backdrop-blur border border-white/10 group-hover:border-green-500/50 rounded-2xl p-6 space-y-3 transition-all">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">
                  Total Accepted
                </p>
                <p className="text-3xl font-bold text-white mt-2">
                  {stats.accepted}
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 z-10" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by startup name..."
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-white/20"
            />
          </div>

          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              ✕ Clear Search
            </button>
          )}

          <div className="flex flex-wrap gap-2">
            {[
              { value: "pending", label: "Pending" },
              { value: "accepted", label: "Accepted" },
              { value: "rejected", label: "Rejected" },
              { value: "all", label: "All" },
            ].map((filter) => (
              <motion.button
                key={filter.value}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilterStatus(filter.value)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filterStatus === filter.value
                    ? "bg-blue-600 text-white border border-blue-400 shadow-lg shadow-blue-500/20"
                    : "bg-white/5 border border-white/10 text-gray-300 hover:border-white/20 hover:bg-white/10"
                }`}
              >
                {filter.label}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Messages */}
        {success && (
          <motion.div
            className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 flex items-center gap-3 text-green-300 backdrop-blur"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span>{success}</span>
          </motion.div>
        )}

        {error && (
          <motion.div
            className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3 text-red-300 backdrop-blur"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Invitations List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          {loading ? (
            <div className="flex justify-center py-12">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="rounded-full h-12 w-12 border-3 border-blue-500/20 border-t-blue-500"
              />
            </div>
          ) : filteredInvitations.length === 0 ? (
            <motion.div
              className="text-center py-20 bg-gradient-to-br from-white/5 to-white/0 border border-white/10 rounded-2xl backdrop-blur"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-blue-500/20 rounded-full">
                  <Mail className="w-12 h-12 text-blue-400" />
                </div>
              </div>
              <p className="text-gray-300 text-lg font-semibold">
                No invitations found
              </p>
              <p className="text-gray-500 text-sm mt-2">
                You'll see invitations from startups here
              </p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {filteredInvitations.map((invitation, index) => {
                const status = statusUI[invitation?.status] || {};

                return (
                  <motion.div
                    key={invitation.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -2, scale: 1.01 }}
                    className="group relative overflow-hidden rounded-xl bg-slate-900/50 border border-white/10 hover:border-blue-500/30 transition-all backdrop-blur"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/0 to-blue-500/0 group-hover:from-blue-500/5 group-hover:via-blue-500/5 group-hover:to-transparent transition-all duration-300" />
                    
                    <div className="relative p-4 md:p-6 flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center text-white font-bold flex-shrink-0 shadow-lg">
                          <Building2 className="w-7 h-7" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-white text-lg truncate group-hover:text-blue-300 transition-colors">
                            {invitation.startup_name || "Unknown Startup"}
                          </p>
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
                              {invitation.role || "Team Member"}
                            </Badge>
                            {invitation.created_at && (
                              <p className="text-xs text-gray-400 flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(
                                  invitation.created_at
                                ).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 flex-shrink-0 w-full md:w-auto">
                        <Badge
                          className={`flex items-center gap-2 whitespace-nowrap border ${status.class}`}
                        >
                          {status.icon}
                          {status.label}
                        </Badge>

                        {invitation.status === "pending" && (
                          <div className="flex gap-2 ml-auto md:ml-0">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() =>
                                handleReject(
                                  invitation.startup_id,
                                  invitation.id
                                )
                              }
                              className="px-4 py-2 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300 hover:bg-red-500/30 hover:border-red-500/50 transition-all font-medium text-sm flex items-center gap-2 whitespace-nowrap"
                            >
                              <X className="w-4 h-4" />
                              Decline
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() =>
                                handleAccept(
                                  invitation.startup_id,
                                  invitation.id
                                )
                              }
                              className="px-4 py-2 rounded-lg bg-green-500/20 border border-green-500/30 text-green-300 hover:bg-green-500/30 hover:border-green-500/50 transition-all font-medium text-sm flex items-center gap-2 whitespace-nowrap"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Accept
                            </motion.button>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default InviteToStartup;