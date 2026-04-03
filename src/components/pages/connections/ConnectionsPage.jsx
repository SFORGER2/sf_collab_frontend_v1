import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, UserPlus, Clock, Search, RefreshCw,
  Check, X, MessageCircle, User, Loader2, UserX,
  ArrowLeft, Compass, Mail, AlertCircle
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { connectionAPI } from '@/utils/APIs/ConnectionAPI';
import { toast } from 'react-toastify';
import usePaginatedFetch from '@/utils/hooks/usePaginated';
import InfiniteList from '@/components/InfiniteList';
import { getProfilePicture } from '@/utils/getProfilePicture';
import UserCard from './UserCard';
import LoadingSkeleton from './LoadingSkeleton';
import ConfirmationModal from './ConfirmationModal';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getUserId = (u) => u?.id ?? u?.user_id ?? u?._id ?? null;
const getRequestId = (r) =>
  r?.id ??
  r?.request_id ??
  r?.friend_request_id ??
  r?.connection_request_id ??
  r?.connectionRequestId ??
  null;

const getReceiverId = (r) => {
  const receiverObjId = getUserId(r?.receiver ?? r?.to_user ?? r?.requested);
  if (receiverObjId != null) return receiverObjId;
  return (
    r?.receiver_id ??
    r?.to_user_id ??
    r?.requested_user_id ??
    r?.requested_id ??
    r?.recipient_id ??
    r?.toUserId ??
    r?.receiverId ??
    null
  );
};

const getSenderId = (r) => {
  const senderObjId = getUserId(r?.sender ?? r?.from_user ?? r?.requester);
  if (senderObjId != null) return senderObjId;
  return (
    r?.sender_id ??
    r?.from_user_id ??
    r?.requester_id ??
    r?.requesterId ??
    r?.fromUserId ??
    r?.senderId ??
    null
  );
};

const getSender = (r) => r?.sender ?? r?.from_user ?? r?.requester ?? r?.fromUser ?? null;
const getReceiver = (r) => r?.receiver ?? r?.to_user ?? r?.requested ?? r?.toUser ?? null;

const TABS = {
  CONNECTIONS: 'connections',
  INCOMING: 'incoming',
  OUTGOING: 'outgoing',
};

const normalizeFriendRequests = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  return (
    data.friend_requests ||
    data.incoming_requests ||
    data.outgoing_requests ||
    data.requests ||
    data.items ||
    data.data ||
    []
  );
};

export default function ConnectionsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user: currentUser, access_token } = useSelector((state) => state.auth);

  const initialTab = searchParams.get('tab') || TABS.CONNECTIONS;
  const [activeTab, setActiveTab] = useState(
    Object.values(TABS).includes(initialTab) ? initialTab : TABS.CONNECTIONS
  );

  const [actionLoading, setActionLoading] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [counts, setCounts] = useState({ connections: 0, incoming: 0, outgoing: 0 });
  const [confirmPopup, setConfirmPopup] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const fetchCounts = useCallback(async () => {
    if (!access_token) return;
    try {
      const response = await connectionAPI.getCounts(access_token);
      const data = response.data || response;
      setCounts({
        connections: data.connections || 0,
        incoming: data.incoming || 0,
        outgoing: data.outgoing || 0,
      });
    } catch (err) {
      console.error('Failed to fetch counts:', err);
    }
  }, [access_token]);

  const {
    items: connections,
    setItems: setConnections,
    loading: loadingConnections,
    targetRef: connectionsRef,
  } = usePaginatedFetch({
    fetchFn: async ({ page, search }) => {
      const response = await connectionAPI.getConnections(access_token, { page, search });
      const data = response.data || response;
      return {
        data: {
          connections: data.connections || [],
          pagination: data.pagination || {
            total: 0,
            per_page: 10,
            pages: 1,
          },
        },
      };
    },
    objectKey: 'connections',
    search: searchQuery,
    enabled: activeTab === TABS.CONNECTIONS && !!access_token,
  });

  const {
    items: incoming,
    setItems: setIncoming,
    loading: loadingIncoming,
    targetRef: incomingRef,
  } = usePaginatedFetch({
    fetchFn: async ({ page }) => {
      const response = await connectionAPI.getIncomingRequests(access_token, { page });
      const data = response.data || response;
      const raw = normalizeFriendRequests(data);
      const meId = getUserId(currentUser);
      const incomingOnly = meId
        ? raw.filter((r) => {
          const rid = getReceiverId(r);
          if (rid != null) return rid === meId;
          const sid = getSenderId(r);
          return sid == null ? true : sid !== meId;
        })
        : raw;
      return {
        data: {
          incoming_requests: incomingOnly,
          pagination: data.pagination || {
            total: incomingOnly.length,
            per_page: 10,
            pages: 1,
          },
        },
      };
    },
    objectKey: 'incoming_requests',
    enabled: activeTab === TABS.INCOMING && !!access_token,
  });

  const {
    items: outgoing,
    setItems: setOutgoing,
    loading: loadingOutgoing,
    targetRef: outgoingRef,
  } = usePaginatedFetch({
    fetchFn: async ({ page }) => {
      const response = await connectionAPI.getOutgoingRequests(access_token, { page });
      const data = response.data || response;
      const raw = normalizeFriendRequests(data);
      const meId = getUserId(currentUser);
      const outgoingOnly = meId
        ? raw.filter((r) => {
          const sid = getSenderId(r);
          if (sid != null) return sid === meId;
          const rid = getReceiverId(r);
          return rid == null ? true : rid !== meId;
        })
        : raw;
      return {
        data: {
          outgoing_requests: outgoingOnly,
          pagination: data.pagination || {
            total: outgoingOnly.length,
            per_page: 10,
            pages: 1,
          },
        },
      };
    },
    objectKey: 'outgoing_requests',
    enabled: activeTab === TABS.OUTGOING && !!access_token,
  });

  useEffect(() => { fetchCounts(); }, [fetchCounts]);

  const handleAccept = async (requestId) => {
    if (!requestId) return;
    setActionLoading(requestId);
    try {
      await connectionAPI.acceptRequest(requestId, access_token);
      setIncoming(prev => prev.filter(r => (getRequestId(r) ?? r.id) !== requestId));
      setCounts(prev => ({
        ...prev,
        incoming: Math.max(0, prev.incoming - 1),
        connections: prev.connections + 1,
      }));
      toast.success('Connection accepted!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to accept');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDecline = async (requestId) => {
    if (!requestId) return;
    setActionLoading(requestId);
    try {
      await connectionAPI.declineRequest(requestId, access_token);
      setIncoming(prev => prev.filter(r => (getRequestId(r) ?? r.id) !== requestId));
      setCounts(prev => ({ ...prev, incoming: Math.max(0, prev.incoming - 1) }));
      toast.info('Request declined');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to decline');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (requestId) => {
    if (!requestId) return;
    setActionLoading(requestId);
    try {
      await connectionAPI.cancelRequest(requestId, access_token);
      setOutgoing(prev => prev.filter(r => (getRequestId(r) ?? r.id) !== requestId));
      setCounts(prev => ({ ...prev, outgoing: Math.max(0, prev.outgoing - 1) }));
      toast.info('Request cancelled');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemove = async (connectionId) => {
    setActionLoading(connectionId);
    try {
      await connectionAPI.removeConnection(connectionId, access_token);
      setConnections(prev => prev.filter(c => c.id !== connectionId));
      setCounts(prev => ({ ...prev, connections: Math.max(0, prev.connections - 1) }));
      toast.success('Connection removed');
    } catch (err) {
      toast.error('Failed to remove');
    } finally {
      setActionLoading(null);
    }
  };

  const goToProfile = (userId) => {
    if (!userId) return;
    navigate(`/user-profile?userId=${userId}`);
  };

  const goToChat = (userId) => navigate(`/chat?user=${userId}`);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  const isLoading =
    (activeTab === TABS.CONNECTIONS && loadingConnections) ||
    (activeTab === TABS.INCOMING && loadingIncoming) ||
    (activeTab === TABS.OUTGOING && loadingOutgoing);

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
    <div className="min-h-screen bg-black text-white px-2 md:px-4 py-8">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />
        <div className="absolute top-1/4 left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-10 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" style={{ animationDelay: '2s' }} />
      </div>

      <div className="w-full mx-auto space-y-8 w-full relative">
        {/* Header */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                My Connections
              </h1>
              <p className="text-gray-400 text-lg mt-2">
                Manage and grow your professional network
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
              <div className="p-2 bg-blue-500/20 rounded-lg w-fit">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">
                  Total Connections
                </p>
                <p className="text-3xl font-bold text-white mt-2">
                  {counts.connections}
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
              <div className="p-2 bg-yellow-500/20 rounded-lg w-fit">
                <UserPlus className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">
                  Incoming Requests
                </p>
                <p className="text-3xl font-bold text-white mt-2">
                  {counts.incoming}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            whileHover={{ y: -4, scale: 1.02 }}
            className="group relative overflow-hidden rounded-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative bg-slate-900/90 backdrop-blur border border-white/10 group-hover:border-purple-500/50 rounded-2xl p-6 space-y-3 transition-all">
              <div className="p-2 bg-purple-500/20 rounded-lg w-fit">
                <Clock className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">
                  Pending Requests
                </p>
                <p className="text-3xl font-bold text-white mt-2">
                  {counts.outgoing}
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Search and Actions */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex flex-col gap-4">
            {activeTab === TABS.CONNECTIONS && (
              <div className="relative flex-1">
                <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 z-10" />
                <Input
                  placeholder="Search connections..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-white/20"
                />
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                onClick={() => navigate('/discover-users')}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
              >
                <Compass className="w-4 h-4 mr-2" />
                Discover Users
              </Button>

              <Button
                onClick={fetchCounts}
                variant="outline"
                className="border-slate-600 text-black hover:bg-slate-800 hover:text-white transition-all"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>

          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              ✕ Clear Search
            </button>
          )}
        </motion.div>

        {/* Tabs */}
        <motion.div
          className="flex flex-wrap border-b border-slate-700"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {[
            { key: TABS.CONNECTIONS, label: 'Connections', icon: Users, count: counts.connections },
            { key: TABS.INCOMING, label: 'Incoming', icon: UserPlus, count: counts.incoming, highlight: true },
            { key: TABS.OUTGOING, label: 'Sent Requests', icon: Clock, count: counts.outgoing },
          ].map((tab) => (
            <motion.button
              key={tab.key}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.key
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.count > 0 && (
                <Badge className={tab.highlight && activeTab !== tab.key ? 'bg-blue-600 text-white' : 'bg-slate-700'}>
                  {tab.count}
                </Badge>
              )}
            </motion.button>
          ))}
        </motion.div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {isLoading && connections.length === 0 && incoming.length === 0 && outgoing.length === 0 ? (
            <LoadingSkeleton />
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* CONNECTIONS */}
              {activeTab === TABS.CONNECTIONS && (
                <InfiniteList
                  items={connections}
                  renderItem={(conn) => (
                    <motion.div
                      key={conn.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ y: -2, scale: 1.01 }}
                      className="group relative overflow-hidden rounded-xl bg-slate-900/50 border border-white/10 hover:border-blue-500/30 transition-all backdrop-blur"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/0 to-blue-500/0 group-hover:from-blue-500/5 group-hover:via-blue-500/5 group-hover:to-transparent transition-all duration-300" />

                      <div className="relative p-4 md:p-6 flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
                        <div className="flex items-center gap-4 flex-1 min-w-0 cursor-pointer" onClick={() => goToProfile(conn.connected_user?.id)}>
                          <img
                            src={getProfilePicture(conn.connected_user)}
                            alt={conn.connected_user?.name}
                            className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-white text-lg truncate group-hover:text-blue-300 transition-colors">
                              {conn.connected_user?.name || conn.connected_user?.first_name || 'User'}
                            </p>
                            <p className="text-xs text-gray-400 flex items-center gap-1 mt-2">
                              Connected {formatDate(conn.connected_at)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0 w-full md:w-auto">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => goToChat(conn.connected_user?.id)}
                            className="px-4 py-2 rounded-lg bg-blue-500/20 border border-blue-500/30 text-blue-300 hover:bg-blue-500/30 hover:border-blue-500/50 transition-all font-medium text-sm flex items-center gap-2 whitespace-nowrap"
                          >
                            <MessageCircle className="w-4 h-4" />
                            Message
                          </motion.button>

                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => goToProfile(conn.connected_user?.id)}
                            className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20 transition-all font-medium text-sm flex items-center gap-2 whitespace-nowrap"
                          >
                            <User className="w-4 h-4" />
                            Profile
                          </motion.button>

                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              setConfirmPopup(true);
                              setSelectedRequest(conn);
                            }}
                            disabled={actionLoading === conn.id}
                            className="px-3 py-2 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300 hover:bg-red-500/30 hover:border-red-500/50 transition-all font-medium text-sm flex items-center gap-2"
                          >
                            {actionLoading === conn.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <UserX className="w-4 h-4" />
                            )}
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  sentinelRef={connectionsRef}
                  loading={loadingConnections}
                  emptyText="No connections yet. Discover users to start connecting!"
                />
              )}

              {/* INCOMING */}
              {activeTab === TABS.INCOMING && (
                <InfiniteList
                  items={incoming}
                  renderItem={(req) => {
                    const reqId = getRequestId(req);
                    const sender = getSender(req);

                    return (
                      <motion.div
                        key={reqId || req.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ y: -2, scale: 1.01 }}
                        className="group relative overflow-hidden rounded-xl bg-slate-900/50 border border-white/10 hover:border-blue-500/30 transition-all backdrop-blur"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/0 to-blue-500/0 group-hover:from-blue-500/5 group-hover:via-blue-500/5 group-hover:to-transparent transition-all duration-300" />

                        <div className="relative p-4 md:p-6 flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
                          <div className="flex items-center gap-4 flex-1 min-w-0 cursor-pointer" onClick={() => goToProfile(sender?.id)}>
                            <img
                              src={getProfilePicture(sender)}
                              alt={sender?.name}
                              className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-white text-lg truncate group-hover:text-blue-300 transition-colors">
                                {sender?.name || sender?.first_name || 'User'}
                              </p>
                              <p className="text-xs text-gray-400 flex items-center gap-1 mt-2">
                                Requested {formatDate(req.created_at)}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0 w-full md:w-auto">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleAccept(reqId)}
                              disabled={!reqId || actionLoading === reqId}
                              className="px-4 py-2 rounded-lg bg-green-500/20 border border-green-500/30 text-green-300 hover:bg-green-500/30 hover:border-green-500/50 transition-all font-medium text-sm flex items-center gap-2 whitespace-nowrap disabled:opacity-50"
                            >
                              {actionLoading === reqId ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Check className="w-4 h-4" />
                              )}
                              Accept
                            </motion.button>

                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleDecline(reqId)}
                              disabled={!reqId || actionLoading === reqId}
                              className="px-4 py-2 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300 hover:bg-red-500/30 hover:border-red-500/50 transition-all font-medium text-sm flex items-center gap-2 whitespace-nowrap disabled:opacity-50"
                            >
                              {actionLoading === reqId ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <X className="w-4 h-4" />
                              )}
                              Decline
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  }}
                  sentinelRef={incomingRef}
                  loading={loadingIncoming}
                  emptyText="No pending requests"
                />
              )}

              {/* OUTGOING */}
              {activeTab === TABS.OUTGOING && (
                <InfiniteList
                  items={outgoing}
                  renderItem={(req) => {
                    const reqId = getRequestId(req);
                    const receiver = getReceiver(req);

                    return (
                      <motion.div
                        key={reqId || req.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ y: -2, scale: 1.01 }}
                        className="group relative overflow-hidden rounded-xl bg-slate-900/50 border border-white/10 hover:border-blue-500/30 transition-all backdrop-blur"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/0 to-blue-500/0 group-hover:from-blue-500/5 group-hover:via-blue-500/5 group-hover:to-transparent transition-all duration-300" />

                        <div className="relative p-4 md:p-6 flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
                          <div className="flex items-center gap-4 flex-1 min-w-0 cursor-pointer" onClick={() => goToProfile(receiver?.id)}>
                            <img
                              src={getProfilePicture(receiver)}
                              alt={receiver?.name}
                              className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-white text-lg truncate group-hover:text-blue-300 transition-colors">
                                {receiver?.name || receiver?.first_name || 'User'}
                              </p>
                              <p className="text-xs text-gray-400 flex items-center gap-1 mt-2">
                                Sent {formatDate(req.created_at)}
                              </p>
                            </div>
                          </div>

                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleCancel(reqId)}
                            disabled={!reqId || actionLoading === reqId}
                            className="px-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600 text-gray-300 hover:bg-slate-600 transition-all font-medium text-sm flex items-center gap-2 whitespace-nowrap disabled:opacity-50"
                          >
                            {actionLoading === reqId ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <X className="w-4 h-4" />
                            )}
                            Cancel
                          </motion.button>
                        </div>
                      </motion.div>
                    );
                  }}
                  sentinelRef={outgoingRef}
                  loading={loadingOutgoing}
                  emptyText="No sent requests. Discover users to start connecting!"
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {confirmPopup && (
        <ConfirmationModal
          onClose={() => setConfirmPopup(false)}
          onConfirm={() => {
            handleRemove(selectedRequest?.id);
            setConfirmPopup(false);
          }}
          message="Are you sure you want to remove this connection?"
        />
      )}
    </div>
  );
}
