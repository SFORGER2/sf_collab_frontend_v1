import React, { useRef, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  Users, UserPlus, Check, X, Loader2, 
  ChevronRight, Bell, UserCheck 
} from 'lucide-react';
import { useConnectionNotifications } from '../hooks/useConnectionNotifications';
import { toast } from '@/utils/hooks/use-toast';

const API_URL = import.meta.env.VITE_API_URL || '/api';
const API_HOST = API_URL.replace(/\/api\/?$/, "");


export function ConnectionNotifications({ isOpen, onClose }) {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const [actionLoading, setActionLoading] = useState(null);
  const { user: currentUser } = useSelector((state) => state.auth);
  
  const { 
    incomingRequests, 
    counts,
    isLoading, 
    actions 
  } = useConnectionNotifications();

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


  // Fetch when dropdown opens
  useEffect(() => {
    if (isOpen) {
      actions.fetchIncomingRequests();
    }
  }, [isOpen]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  /**
   * Accept request handler
   */
  const handleAccept = async (e, requestId, senderName) => {
    if (!requestId) return;
    e.stopPropagation();
    setActionLoading(requestId);
    
    const result = await actions.acceptRequest(requestId);
    
    if (result.success) {
      toast.success?.({ title: `Connected with ${senderName}!` }) ||
        toast({ title: `Connected with ${senderName}!`, variant: 'success' });
    } else {
      toast.destructive?.({ title: 'Failed to accept request' }) ||
        toast({ title: 'Failed to accept request', variant: 'destructive' });
    }
    
    setActionLoading(null);
  };

  /**
   * Decline request handler
   */
  const handleDecline = async (e, requestId) => {
    if (!requestId) return;
    e.stopPropagation();
    setActionLoading(requestId);
    
    const result = await actions.declineRequest(requestId);
    
    if (result.success) {
      toast?.({ title: 'Request declined' });
    } else {
      toast.destructive?.({ title: 'Failed to decline request' }) ||
        toast({ title: 'Failed to decline request', variant: 'destructive' });
    }
    
    setActionLoading(null);
  };

  /**
   * Navigate to user profile
   */
  const handleViewProfile = (userId) => {
  onClose();
  if (!userId) return;
  navigate(`/user-profile?userId=${userId}`);
};


  /**
   * Navigate to connections page
   */
  const handleViewAll = () => {
    onClose();
    navigate('/connections?tab=incoming');
  };

  /**
   * Get avatar URL
   */
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

  const s = String(pic);
  if (s.startsWith("http")) return s;

  return `${API_HOST}${s.startsWith("/") ? "" : "/"}${s}`;
};



  /**
   * Get user name
   */
  const getUserName = (user) => {
    if (!user) return 'Unknown User';
    return `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unknown User';
  };

  /**
   * Get initials
   */
  const getInitials = (user) => {
    if (!user) return '?';
    return `${user.first_name?.charAt(0) || ''}${user.last_name?.charAt(0) || ''}`.toUpperCase();
  };

  /**
   * Format time ago
   */
  const getTimeAgo = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (!isOpen) return null;

  const meId = getUserId(currentUser);
  
  const incomingRequestsFiltered = meId
    ? (incomingRequests || []).filter((r) => {
        const rid = getReceiverId(r);
        return rid == null ? true : rid === meId;
      })
    : (incomingRequests || []);

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full right-0 mt-2 w-80 sm:w-96 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden"
      style={{
        animation: 'slideDown 0.2s ease-out',
        zIndex: 99999999,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-zinc-950 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <UserPlus className="w-4 h-4 text-blue-400" />
          <h3 className="text-white font-semibold">Connection Requests</h3>
          {counts.incoming > 0 && (
            <span className="px-2 py-0.5 text-xs bg-blue-600 text-white rounded-full">
              {counts.incoming}
            </span>
          )}
        </div>
        <button
          onClick={handleViewAll}
          className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
        >
          View All
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      {/* Stats Bar */}
      <div className="flex items-center justify-around px-4 py-2 bg-zinc-900/50 border-b border-zinc-800 text-xs">
        <div className="flex items-center gap-1.5 text-zinc-400">
          <UserCheck className="w-3.5 h-3.5 text-green-400" />
          <span>{counts.connections} connections</span>
        </div>
        <div className="flex items-center gap-1.5 text-zinc-400">
          <UserPlus className="w-3.5 h-3.5 text-blue-400" />
          <span>{counts.incoming} pending</span>
        </div>
      </div>

      {/* Request List */}
      <div className="max-h-[400px] overflow-y-auto">
        {isLoading ? (
          <div className="p-8 text-center">
            <Loader2 className="w-6 h-6 text-blue-400 animate-spin mx-auto" />
            <p className="text-zinc-500 text-sm mt-2">Loading requests...</p>
          </div>
        ) : incomingRequestsFiltered.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6 text-zinc-600" />
            </div>
            <p className="text-zinc-400 font-medium">No pending requests</p>
            <p className="text-zinc-600 text-sm mt-1">
              Connection requests will appear here
            </p>
          </div>
        ) : (
          incomingRequestsFiltered.map((request) => {
            const sender = request.sender;
            const avatarUrl = getAvatarUrl(sender);
            const name = getUserName(sender);
            const initials = getInitials(sender);
            const requestId = getRequestId(request);
            const isProcessing = actionLoading === requestId;

            return (
              <div
                key={requestId || request.id}
                onClick={() => handleViewProfile(sender?.id)}
                className={`
                  flex items-center gap-3 px-4 py-3 
                  hover:bg-zinc-800/50 cursor-pointer 
                  border-b border-zinc-800/50 last:border-b-0
                  transition-colors
                  ${isProcessing ? 'opacity-60 pointer-events-none' : ''}
                `}
              >
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex-shrink-0">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        const fallback = e.currentTarget.nextSibling;
                        if (fallback) fallback.style.display = "flex";
                      }}
                    />
                  ) : null}

                  <div
                    className={`w-full h-full items-center justify-center text-white font-bold ${
                      avatarUrl ? "hidden" : "flex"
                    }`}
                  >
                    {initials}
                  </div>
                </div>


                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-white font-medium truncate">{name}</p>
                    <span className="text-zinc-500 text-xs flex-shrink-0 ml-2">
                      {getTimeAgo(request.created_at)}
                    </span>
                  </div>
                  {sender?.title && (
                    <p className="text-zinc-400 text-sm truncate">{sender.title}</p>
                  )}
                  <p className="text-blue-400 text-xs mt-0.5">
                    wants to connect
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {isProcessing ? (
                    <Loader2 className="w-5 h-5 text-zinc-400 animate-spin" />
                  ) : (
                    <>
                      <button
                        onClick={(e) => requestId && handleAccept(e, requestId, name)}
                        className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-full transition-colors"
                        title="Accept"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => requestId && handleDecline(e, requestId)}
                        className="p-2 bg-zinc-700 hover:bg-red-600 text-white rounded-full transition-colors"
                        title="Decline"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      {incomingRequestsFiltered.length > 0 && (
        <div className="px-4 py-3 bg-zinc-950 border-t border-zinc-800">
          <button
            onClick={handleViewAll}
            className="w-full py-2 text-sm font-medium text-blue-400 hover:text-blue-300 
                     bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
          >
            View All Requests
          </button>
        </div>
      )}

      {/* Animation keyframes */}
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

// =============================================================================
// CONNECTION BELL BUTTON (for NavBar)
// =============================================================================

export function ConnectionBellButton({ onClick, count = 0, hasNewRequest = false }) {
  return (
    <button
      onClick={onClick}
      className={`
        relative flex items-center justify-center rounded-full 
        transition-all duration-300 hover:scale-105
        ${hasNewRequest ? 'animate-pulse' : ''}
      `}
      aria-label="Connection Requests"
      type="button"
    >
      <span className={`
        relative bg-[#2A2725] p-2 rounded-full 
        hover:bg-zinc-900 transition-colors
        ${hasNewRequest ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}
      `}>
        <UserPlus className="text-white size-5" />
        
        {/* Count Badge */}
        {count > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-blue-500 text-white text-[10px] font-bold flex items-center justify-center">
            {count > 99 ? '99+' : count}
          </span>
        )}
      </span>
    </button>
  );
}

export default ConnectionNotifications;
