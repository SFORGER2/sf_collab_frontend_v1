
import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, UserPlus, Clock, Search, RefreshCw,
  Check, X, MessageCircle, User, Loader2, UserX,
  ArrowLeft
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { connectionAPI } from '@/utils/APIs/connectionAPI';
import { toast } from 'react-toastify';

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
  // receiver as object
  const receiverObjId = getUserId(r?.receiver ?? r?.to_user ?? r?.requested);
  if (receiverObjId != null) return receiverObjId;

  // receiver as scalar id (common API shapes)
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



const getAvatarUrl = (u) => {
  if (!u) return null;

  const pic =
    u.profilePicture ||
    u.profile_picture ||
    u.avatar_url ||
    u.profile?.picture ||
    u.profile?.avatar ||
    u.picture ||
    u.avatar ||
    null;

  if (!pic) return null;
  const API_HOST = API_URL.replace(/\/api\/?$/, "");
  return String(pic).startsWith("http")
    ? pic
    : `${API_HOST}${String(pic).startsWith("/") ? "" : "/"}${pic}`;

};


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

  const [connections, setConnections] = useState([]);
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [counts, setCounts] = useState({ connections: 0, incoming: 0, outgoing: 0 });

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

  // Fetch data
  const fetchData = useCallback(async () => {
    if (!access_token) return;
    setLoading(true);
    
    try {
      switch (activeTab) {
        case TABS.CONNECTIONS: {
          const response = await connectionAPI.getConnections(access_token);
          const data = response.data || response;
          
          // Map to get the OTHER user (not current user)
          const mapped = (data.friend_requests || []).map(fr => {
            const otherUser = fr.sender_id === currentUser?.id ? fr.receiver : fr.sender;
            return {
              id: fr.id,
              connected_user: otherUser,
              connected_at: fr.updated_at,
            };
          });
          setConnections(mapped);
          break;
        }
        case TABS.INCOMING: {
  const response = await connectionAPI.getIncomingRequests(access_token);
  const data = response.data || response;

  const raw = normalizeFriendRequests(data);
  const meId = getUserId(currentUser);

  // If the API doesn't include sender/receiver IDs, don't over-filter (keep list visible).
  const incomingOnly = meId
            ? raw.filter((r) => {
                const rid = getReceiverId(r);
                if (rid != null) return rid === meId;
                // If receiver id isn't present, fall back to sender id: incoming requests are not sent by me
                const sid = getSenderId(r);
                return sid == null ? true : sid !== meId;
              })
            : raw;

  setIncoming(incomingOnly);
  break;
}
        case TABS.OUTGOING: {
  const response = await connectionAPI.getOutgoingRequests(access_token);
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

  setOutgoing(outgoingOnly);
  break;
}
      }
    } catch (err) {
      console.error('Failed to fetch data:', err);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [activeTab, access_token, currentUser?.id]);

  useEffect(() => { fetchCounts(); }, [fetchCounts]);
  useEffect(() => { fetchData(); }, [fetchData]);

  // ACCEPT
  const handleAccept = async (requestId) => {
    console.log('Accepting:', requestId);
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
      console.error('Accept error:', err.response?.data);
      toast.error(err.response?.data?.message || 'Failed to accept');
    } finally {
      setActionLoading(null);
    }
  };

  // DECLINE (uses reject endpoint)
  const handleDecline = async (requestId) => {
    console.log('Declining:', requestId);
    if (!requestId) return;
    
    setActionLoading(requestId);
    try {
      await connectionAPI.declineRequest(requestId, access_token);
      setIncoming(prev => prev.filter(r => (getRequestId(r) ?? r.id) !== requestId));
      setCounts(prev => ({ ...prev, incoming: Math.max(0, prev.incoming - 1) }));
      toast.info('Request declined');
    } catch (err) {
      console.error('Decline error:', err.response?.data);
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
    if (!confirm('Remove this connection?')) return;
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

  return (
    <div className="min-h-screen">
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* BACK TO DASHBOARD */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Button
            onClick={() => navigate('/dashboard')}
            variant="outline"
            className="text-gray-300 border-gray-600 hover:bg-gray-800 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </motion.div>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
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
          
          <Button onClick={() => { fetchData(); fetchCounts(); }} variant="outline" size="sm" className="border-slate-600 text-slate-300">
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
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
        <div className="flex border-b border-slate-700 mb-6">
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
          {loading ? (
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
                connections.length === 0 ? (
                  <EmptyState icon={Users} title="No connections yet" description="Start connecting!" 
                    action={{ label: 'Discover Users', onClick: () => navigate('/discover-users') }} />
                ) : (
                  connections.map((conn) => (
                    <UserCard
                      key={conn.id}
                      user={conn.connected_user}
                      subtitle={`Connected ${formatDate(conn.connected_at)}`}
                      isLoading={actionLoading === conn.id}
                      actions={
                        <>
                          <Button size="sm" variant="outline" onClick={() => goToChat(conn.connected_user?.id)}
                            className="border-slate-600 text-slate-300">
                            <MessageCircle className="w-4 h-4 mr-1" />Message
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => goToProfile(conn.connected_user?.id)}
                            className="border-slate-600 text-slate-300">
                            <User className="w-4 h-4 mr-1" />Profile
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleRemove(conn.id)}
                            className="text-red-400 hover:bg-red-500/10">
                            <UserX className="w-4 h-4" />
                          </Button>
                        </>
                      }
                      onClick={() => goToProfile(conn.connected_user?.id)}
                    />
                  ))
                )
              )}

              {/* INCOMING */}
              {activeTab === TABS.INCOMING && (
                incoming.length === 0 ? (
                  <EmptyState icon={UserPlus} title="No pending requests" description="Requests will appear here" />
                ) : (
                  incoming.map((req) => {
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
                              className="border-red-500/50 text-red-400 hover:bg-red-500/20"
                            >
                              <X className="w-4 h-4 mr-1" />Decline
                            </Button>
                          </>
                        }
                        onClick={() => goToProfile(sender?.id)}
                      />
                    );
                  })

                )
              )}

              {/* OUTGOING */}
              {activeTab === TABS.OUTGOING && (
                outgoing.length === 0 ? (
                  <EmptyState icon={Clock} title="No sent requests" description="Requests you send will appear here" />
                ) : (
                  outgoing.map((req) => {
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
                            className="border-slate-600 text-slate-300"
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
                  })

                )
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Sub-components
function UserCard({ user, subtitle, actions, onClick, isLoading }) {
  const fullName = user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unknown' : 'Unknown';
  const initials = `${user?.first_name?.charAt(0) || ''}${user?.last_name?.charAt(0) || ''}`;
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  const avatarUrl = (() => {
    if (!user) return null;
    const pic =
      user.profilePicture ||
      user.profile_picture ||
      user.avatar_url ||
      user.profile?.picture ||
      user.profile?.avatar ||
      user.picture ||
      user.avatar ||
      null;

    if (!pic) return null;
    const API_HOST = API_URL.replace(/\/api\/?$/, "");

return String(pic).startsWith("http")
  ? pic
  : `${API_HOST}${String(pic).startsWith("/") ? "" : "/"}${pic}`;

  })();


  return (
    <Card className={`p-5 bg-slate-800/50 border-slate-700 cursor-pointer ${isLoading ? 'opacity-60' : ''}`} onClick={onClick}>
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-xl overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0">
  {avatarUrl ? (
    <img
      src={avatarUrl}
      alt={fullName}
      className="w-full h-full object-cover"
      onError={(e) => {
        e.currentTarget.style.display = "none";
        const fallback = e.currentTarget.nextSibling;
        if (fallback) fallback.style.display = "flex";
      }}
    />
  ) : null}
  <div
    className={`w-full h-full items-center justify-center ${avatarUrl ? "hidden" : "flex"}`}
  >
    {(initials || "?").toUpperCase()}
  </div>
</div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white truncate">{fullName}</h3>
          {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        </div>
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>{actions}</div>
      </div>
    </Card>
  );
}

function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="text-center py-16">
      <div className="inline-flex p-4 rounded-2xl bg-slate-800/50 border border-slate-700 mb-6">
        <Icon className="w-10 h-10 text-slate-500" />
      </div>
      <h3 className="text-xl font-semibold text-slate-300 mb-2">{title}</h3>
      <p className="text-slate-500 mb-6">{description}</p>
      {action && (
        <Button onClick={action.onClick} className="bg-blue-600 hover:bg-blue-700 text-white">
          {action.label}
        </Button>
      )}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="p-5 bg-slate-800/50 border-slate-700 animate-pulse">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-slate-700 rounded-xl" />
            <div className="flex-1 space-y-2">
              <div className="h-5 bg-slate-700 rounded w-1/3" />
              <div className="h-3 bg-slate-700 rounded w-1/4" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}