import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, X, ExternalLink, CheckCheck, Loader2, Settings } from 'lucide-react';
// ✅ FIX: import from the shared context so Bell and Notifications page share state
import { useNotifications } from '../../contexts/NotificationContext';
// ✅ FIX: corrected import path — ChatNotificationProvider lives in pages/chat, not context/
import { useChatNotifications } from '@/components/pages/chat/Chatnotificationprovider';

const NotificationBell = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  const { 
    notifications, 
    unreadCount, 
    loading,
    markAsRead,
    markAllAsRead
  } = useNotifications();

  // ─── Feature 4: Chat unread count from ChatNotificationProvider ──────────
  const { chatUnreadCount = 0, resetChatUnreadCount } = useChatNotifications();

  // Combined badge = REST notifications unread + chat messages unread
  const totalUnread = unreadCount + chatUnreadCount;
  
  // Get only the 5 most recent notifications for dropdown
  const recentNotifications = notifications.slice(0, 5);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Generate link URL for notification - UPDATED FOR SF COLLAB ROUTES
  const getNotificationLink = (notification) => {
    if (notification.link_url) return notification.link_url;
    
    const { template_key, category, data } = notification;
    let metadata = {};
    if (data) {
      if (typeof data === 'string') {
        try {
          metadata = JSON.parse(data);
        } catch (e) {
          metadata = {};
        }
      } else {
        metadata = data;
      }
    }
    
    // Template-based links
    if (template_key) {
      // Messages -> /chat
      if (template_key.includes('message') || template_key.includes('chat')) {
        return '/chat';
      }
      
      // Connections -> /user-profile
      if (template_key.includes('friend') || template_key.includes('connection')) {
        const targetUserId = metadata.user_id || metadata.userId || metadata.actor_id || metadata.actorId;
        if (targetUserId) {
          return `/user-profile?userId=${targetUserId}`;
        }
        return '/user-profile';
      }
      
      // Posts -> /posts
      if (template_key.includes('like') || template_key.includes('comment') || template_key.includes('post') || template_key.includes('reply') || template_key.includes('reaction')) {
        return '/posts';
      }
      
      // Ideas -> /ideation
      if (template_key.includes('idea') || template_key.includes('feedback')) {
        return '/ideation';
      }
      
      // Startups -> /startup-details/:id
      if (template_key.includes('startup') || template_key.includes('team')) {
        const startupId = metadata.startup_id || metadata.startupId;
        if (startupId) return `/startup-details/${startupId}`;
        return '/discover-startups';
      }
      
      // Tasks/Projects -> /projects
      if (template_key.includes('task') || template_key.includes('project')) {
        return '/projects';
      }
      
      // Applications -> /builder/my-applications
      if (template_key.includes('application')) {
        return '/builder/my-applications';
      }
      
      // Contributions -> /contribution
      if (template_key.includes('contribution') || template_key.includes('poll')) {
        return '/contribution';
      }

      // Mentorship -> /help
      if (template_key.includes('mentorship') || template_key.includes('mentor')) {
        return '/help';
      }

      // Marketplace -> /pricing
      if (template_key.includes('marketplace') || template_key.includes('purchase') || template_key.includes('listing')) {
        return '/pricing';
      }
    }
    
    // Category-based fallback
    switch (category) {
      case 'social': {
        const targetUserId = metadata.user_id || metadata.userId || metadata.actor_id || metadata.actorId;
        if (targetUserId) {
          return `/user-profile?userId=${targetUserId}`;
        }
        return '/user-profile';
      }
      case 'message': return '/chat';
      case 'idea': return '/ideation';
      case 'team': return '/discover-startups';
      case 'financial':
      case 'payment':
        return '/pricing';
      case 'account': return '/setting';
      case 'newsletter':
        return '/notifications?tab=newsletter';
      case 'system':
      case 'warning':
        return '/notifications?tab=warning';
      default: return '/dashboard';
    }
  };
  
  // Handle notification click
  const handleNotificationClick = async (notification) => {
    // Mark as read — optimistic, no refresh() needed (avoids race with DB write)
    if (!notification.is_read) {
      markAsRead(notification.id); // fire-and-forget; state updates instantly
    }
    const link = getNotificationLink(notification);
    setIsOpen(false);
    navigate(link);
  };
  
  // Handle view all
  const handleViewAll = () => {
    setIsOpen(false);
    navigate('/notifications');
  };
  
  // Handle mark all read
  const handleMarkAllRead = async (e) => {
    e.stopPropagation();
    await markAllAsRead();
  };
  
  // Format time ago
  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffSec = Math.floor((now - date) / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffSec < 60) return 'now';
    if (diffMin < 60) return `${diffMin}m`;
    if (diffHour < 24) return `${diffHour}h`;
    if (diffDay < 7) return `${diffDay}d`;
    return date.toLocaleDateString();
  };
  
  // Get type color
  const getTypeColor = (type) => {
    switch (type) {
      case 'success': return 'text-green-400';
      case 'error': return 'text-red-400';
      case 'warning': return 'text-yellow-400';
      default: return 'text-blue-400';
    }
  };
  
  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => {
          setIsOpen((prev) => {
            const next = !prev;
            if (!prev && next) {
              // ─── Feature 4: reset chat badge on open ──────────────────
              if (resetChatUnreadCount) resetChatUnreadCount();
              // Clear the notification badge as soon as the dropdown opens.
              // This also marks the notifications themselves as read, so the
              // blue "unread" dots clear too — same as Gmail/Facebook.
              if (markAllAsRead) markAllAsRead();
            }
            return next;
          });
        }}
        className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-6 h-6" />
        
        {/* Unread badge — combined REST + chat */}
        {totalUnread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 flex items-center justify-center text-xs font-bold bg-red-500 text-white rounded-full">
            {totalUnread > 99 ? '99+' : totalUnread}
          </span>
        )}
      </button>
      
      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-700">
            <h3 className="font-semibold">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  <CheckCheck className="w-3 h-3" />
                  Mark all read
                </button>
              )}
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/user-profile?page=notifications');
                }}
                className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-700/50 transition-colors"
                title="Notification Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {loading && recentNotifications.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              </div>
            ) : recentNotifications.length === 0 ? (
              <div className="py-8 text-center text-slate-400">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No notifications yet</p>
              </div>
            ) : (
              recentNotifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`
                    p-4 border-b border-slate-700/50 cursor-pointer transition-colors
                    hover:bg-slate-700/50
                    ${!notification.is_read
                      ? 'bg-blue-900/30 border-l-2 border-l-blue-500'
                      : 'opacity-75'
                    }
                  `}
                >
                  <div className="flex items-start gap-3">
                    {/* Unread indicator */}
                    {!notification.is_read && (
                      <div className="w-2 h-2 mt-2 bg-blue-500 rounded-full flex-shrink-0" />
                    )}
                    
                    {/* Content */}
                    <div className={`flex-1 min-w-0 ${notification.is_read ? 'ml-5' : ''}`}>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className={`text-sm truncate ${getTypeColor(notification.type)} ${!notification.is_read ? 'font-semibold' : 'font-medium opacity-75'}`}>
                          {!notification.is_read && (
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-400 mr-1.5 mb-0.5 align-middle" />
                          )}
                          {notification.title}
                        </h4>
                        <span className="text-xs text-slate-500 whitespace-nowrap">
                          {formatTimeAgo(notification.created_at)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      
                      {/* Link indicator */}
                      <span className="text-xs text-blue-400/70 flex items-center gap-1 mt-1">
                        <ExternalLink className="w-3 h-3" />
                        Click to view
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {/* Footer */}
          <div className="p-3 border-t border-slate-700">
            <button
              onClick={handleViewAll}
              className="w-full py-2 text-sm text-blue-400 hover:text-blue-300 hover:bg-slate-700/50 rounded-lg transition-colors"
            >
              View all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;