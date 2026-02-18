import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, UserPlus, Clock, Search, RefreshCw,
  Check, X, MessageCircle, User, Loader2, UserX,
  ArrowLeft, Compass
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { connectionAPI } from '@/utils/APIs/connectionAPI';
import { toast } from 'react-toastify';
import usePaginatedFetch from '@/utils/hooks/usePaginated';
import InfiniteList from '@/components/InfiniteList';
import { getProfilePicture } from '@/utils/getProfilePicture';
import UserCard from './UserCard';
import LoadingSkeleton from './LoadingSkeleton';
import ConfirmationModal from './ConfirmationModal';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

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
  // Fetch counts
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

  // Paginated fetchers for each tab
  const {
    items: connections,
    setItems: setConnections,
    loading: loadingConnections,
    targetRef: connectionsRef,
  } = usePaginatedFetch({
    fetchFn: async ({ page, search }) => {
      const response = await connectionAPI.getConnections(access_token, { page, search });
      const data = response.data || response;
    
      // API returns: { connections: [{ id, connected_user: {...}, connected_at }] }
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

  // ACCEPT
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

  // DECLINE
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

  // CANCEL
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

  // REMOVE
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

  return (
    <>
    <div className="min-h-screen">
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Discover Users Button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30">
              <Users className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                My Connections
              </h1>
              <p className="text-slate-400 text-sm">Manage your network</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              onClick={() => navigate('/discover-users')} 
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
            >
              <Compass className="w-4 h-4 mr-2" />
              Discover Users
            </Button>
            
            <Button 
              onClick={() => { fetchCounts(); }} 
              variant="outline" 
              size="sm" 
              className="border-slate-600 text-black"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Search */}
        {activeTab === TABS.CONNECTIONS && (
          <div className="relative max-w-md mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input
              placeholder="Search connections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-800/50 border-slate-700 text-white"
            />
          </div>
        )}

        {/* Tabs */}
        <div className="flex flex-wrap border-b border-slate-700 mb-6">
          {[
            { key: TABS.CONNECTIONS, label: 'Connections', icon: Users, count: counts.connections },
            { key: TABS.INCOMING, label: 'Incoming', icon: UserPlus, count: counts.incoming, highlight: true },
            { key: TABS.OUTGOING, label: 'Sent', icon: Clock, count: counts.outgoing },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.count > 0 && (
                <Badge className={tab.highlight ? 'bg-blue-600 text-white' : 'bg-slate-700'}>
                  {tab.count}
                </Badge>
              )}
            </button>
          ))}
        </div>

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
                <div className="max-h-[600px] overflow-y-auto">
                  <InfiniteList
                    items={connections}
                    renderItem={(conn) => (
                      <UserCard
                        key={conn.id}
                        user={conn.connected_user}
                        subtitle={`Connected ${formatDate(conn.connected_at)}`}
                        isLoading={actionLoading === conn.id}
                        actions={
                          <>
                            <Button size="sm" variant="outline" onClick={() => goToChat(conn.connected_user?.id)}
                              className="border-slate-600 text-black">
                              <MessageCircle className="w-4 h-4 mr-1" />Message
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => goToProfile(conn.connected_user?.id)}
                              className="border-slate-600 text-black">
                              <User className="w-4 h-4 mr-1" />Profile
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => {
                              setConfirmPopup(true)
                              setSelectedRequest(conn);
                            }
                            }
                              className="text-red-400 hover:bg-red-500">
                              <UserX className="w-4 h-4" />
                            </Button>
                          </>
                        }
                        onClick={() => goToProfile(conn.connected_user?.id)}
                      />
                    )}
                    sentinelRef={connectionsRef}
                    loading={loadingConnections}
                    emptyText="No connections yet. Discover users to start connecting!"
                  />
                </div>
              )}

              {/* INCOMING */}
              {activeTab === TABS.INCOMING && (
                <div className="max-h-[600px] overflow-y-auto">
                  <InfiniteList
                    items={incoming}
                    renderItem={(req) => {
                      const reqId = getRequestId(req);
                      const sender = getSender(req);

                      return (
                        <UserCard
                          key={reqId || req.id}
                          user={sender}
                          subtitle={`Requested ${formatDate(req.created_at)}`}
                          isLoading={actionLoading === reqId}
                          actions={
                            <>
                              <Button
                                size="sm"
                                onClick={(e) => { e.stopPropagation(); handleAccept(reqId); }}
                                disabled={!reqId || actionLoading === reqId}
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                {actionLoading === reqId
                                  ? <Loader2 className="w-4 h-4 animate-spin" />
                                  : <Check className="w-4 h-4 mr-1" />
                                }
                                Accept
                              </Button>

                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => { e.stopPropagation(); handleDecline(reqId); }}
                                disabled={!reqId || actionLoading === reqId}
                                className="border-red-500/50 bg-red-500 text-white hover:bg-white hover:text-red-500 hover:border-red-500 transition-all"
                              >
                                <X className="w-4 h-4 mr-1" />Decline
                              </Button>
                            </>
                          }
                          onClick={() => goToProfile(sender?.id)}
                        />
                      );
                    }}
                    sentinelRef={incomingRef}
                    loading={loadingIncoming}
                    emptyText="No pending requests"
                  />
                </div>
              )}

              {/* OUTGOING */}
              {activeTab === TABS.OUTGOING && (
                <div className="max-h-[600px] overflow-y-auto">
                  <InfiniteList
                    items={outgoing}
                    renderItem={(req) => {
                      const reqId = getRequestId(req);
                      const receiver = getReceiver(req);

                      return (
                        <UserCard
                          key={reqId || req.id}
                          user={receiver}
                          subtitle={`Sent ${formatDate(req.created_at)}`}
                          isLoading={actionLoading === reqId}
                          actions={
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => { e.stopPropagation(); handleCancel(reqId); }}
                              disabled={!reqId || actionLoading === reqId}
                              className="border-slate-600 text-black"
                            >
                              {actionLoading === reqId
                                ? <Loader2 className="w-4 h-4 animate-spin" />
                                : <X className="w-4 h-4 mr-1" />
                              }
                              Cancel
                            </Button>
                          }
                          onClick={() => goToProfile(receiver?.id)}
                        />
                      );
                    }}
                    sentinelRef={outgoingRef}
                    loading={loadingOutgoing}
                    emptyText="No sent requests. Discover users to start connecting!"
                  />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
      {confirmPopup && <ConfirmationModal onClose={() => setConfirmPopup(false)} onConfirm={() => {
        handleRemove(selectedRequest?.connected_user?.id)
        setConnections(prev => prev.filter(c => c.id !== selectedRequest.id));
        setConfirmPopup(false);
      }
      } message={"Are you sure you want to remove this connection?"} />} 
    </>
  );
}

