import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ExternalLink, 
  Trash2, 
  MessageCircle, 
  Heart, 
  UserPlus, 
  Bell,
  Lightbulb,
  Users,
  Calendar,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Info,
  Star,
  MoreVertical,
  Eye,
  EyeOff,
  Copy,
  FileText
} from 'lucide-react';
// ✅ FIX: use shared NotificationContext so markAsRead updates the bell badge instantly
import { useNotifications } from '../../contexts/NotificationContext';


// Get icon based on notification type/category
const getNotificationIcon = (notification) => {
  const { type, category, template_key } = notification;
  
  if (template_key) {
    if (template_key.includes('message')) return MessageCircle;
    if (template_key.includes('friend') || template_key.includes('connection')) return UserPlus;
    if (template_key.includes('like') || template_key.includes('reaction')) return Heart;
    if (template_key.includes('comment') || template_key.includes('reply')) return MessageCircle;
    if (template_key.includes('idea') || template_key.includes('feedback')) return Lightbulb;
    if (template_key.includes('team') || template_key.includes('startup')) return Users;
    if (template_key.includes('event') || template_key.includes('meeting')) return Calendar;
    if (template_key.includes('payment') || template_key.includes('invest')) return DollarSign;
  }
  
  switch (category) {
    case 'social': return UserPlus;
    case 'message': return MessageCircle;
    case 'idea': return Lightbulb;
    case 'team': return Users;
    case 'event': return Calendar;
    case 'financial': return DollarSign;
    default: break;
  }
  
  switch (type) {
    case 'success': return CheckCircle;
    case 'error': return AlertCircle;
    case 'warning': return AlertCircle;
    case 'info': return Info;
    default: return Bell;
  }
};

// Get colors based on type
const getTypeColors = (type) => {
  switch (type) {
    case 'success': return { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30' };
    case 'error': return { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' };
    case 'warning': return { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30' };
    case 'info': return { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' };
    default: return { bg: 'bg-slate-500/20', text: 'text-slate-400', border: 'border-slate-500/30' };
  }
};

// Generate link URL based on notification data - SF COLLAB ROUTES
const getNotificationLink = (notification) => {
  if (notification.link_url) {
    return notification.link_url;
  }
  
  const { template_key, category, data } = notification;
  const metadata = data || {};
  
  if (template_key) {
    if (template_key.includes('message') || template_key.includes('chat')) {
      return '/chat';
    }
    if (template_key.includes('friend_request') || template_key.includes('connection_request')) {
      return '/connections';
    }
    if (template_key.includes('friend_accepted') || template_key.includes('connection_accepted')) {
      if (metadata.user_id) return `/users/${metadata.user_id}`;
      if (metadata.sender_id) return `/users/${metadata.sender_id}`;
      return '/connections';
    }
    if (template_key.includes('connection_removed') || template_key.includes('friend_removed')) {
      return '/connections';
    }
    if (template_key.includes('like') || template_key.includes('reaction')) {
      return '/posts';
    }
    if (template_key.includes('comment') || template_key.includes('reply')) {
      return '/posts';
    }
    if (template_key.includes('mention')) {
      return '/posts';
    }
    if (template_key.includes('post')) {
      return '/posts';
    }
    if (template_key.includes('idea')) {
      return '/ideation';
    }
    if (template_key.includes('startup') || template_key.includes('team')) {
      if (metadata.startup_id) return `/startup-details/${metadata.startup_id}`;
      return '/discover-startups';
    }
    if (template_key.includes('task') || template_key.includes('project')) {
      return '/projects';
    }
    if (template_key.includes('invest') || template_key.includes('funding') || template_key.includes('crowdfund')) {
      return '/crowdfunding';
    }
    if (template_key.includes('application')) {
      return '/builder/my-applications';
    }
    if (template_key.includes('profile') || template_key.includes('follow')) {
      if (metadata.user_id) return `/users/${metadata.user_id}`;
      return '/user-profile';
    }
    if (template_key.includes('contribution') || template_key.includes('poll')) {
      return '/contribution';
    }
    if (template_key.includes('welcome') || template_key.includes('account')) {
      return '/dashboard';
    }
  }
  
  switch (category) {
    case 'social':
      if (metadata.user_id) return `/users/${metadata.user_id}`;
      return '/connections';
    case 'message':
      return '/chat';
    case 'idea':
      return '/ideation';
    case 'team':
      if (metadata.startup_id) return `/startup-details/${metadata.startup_id}`;
      return '/discover-startups';
    case 'event':
      return '/dashboard';
    case 'financial':
      return '/crowdfunding';
    case 'mentorship':
      return '/mentor-dashboard';
    case 'account':
      return '/setting';
    case 'system':
      return '/dashboard';
    default:
      return '/dashboard';
  }
};

// Format relative time
const formatRelativeTime = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  
  if (diffSec < 60) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  
  return date.toLocaleDateString();
};

const NotificationItem = ({ notification, onDelete }) => {
  const navigate = useNavigate();
  const { markAsRead, markAsUnread, copyToNotes } = useNotifications();
  const itemRef = useRef(null);
  const menuRef = useRef(null);
  const markedRef = useRef(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const {
    id,
    title,
    message,
    type = 'info',
    category,
    is_read,
    created_at,
    priority,
    actor_avatar_url
  } = notification;
  
  const Icon = getNotificationIcon(notification);
  const colors = getTypeColors(type);
  const linkUrl = getNotificationLink(notification);
  const timeAgo = formatRelativeTime(created_at);
  
  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Handle notification click
  const handleClick = async (e) => {
    // Don't navigate if clicking menu or buttons
    if (e.target.closest('.menu-btn') || e.target.closest('.menu-dropdown')) return;
    
    // Mark as read immediately when clicked (optimistic — no refresh needed)
    if (!is_read && !markedRef.current) {
      markedRef.current = true;
      markAsRead(id); // fire-and-forget; context updates state instantly
    }

    // Navigate to the appropriate page
    if (linkUrl) {
      navigate(linkUrl);
    }
  };
  
  // Handle menu toggle
  const stop = (e) => {
    if (!e) return;
    e.preventDefault();
    e.stopPropagation();
  };


  const handleMenuToggle = (e) => {
    stop(e);
    setShowMenu(!showMenu);
  };

  
  // Handle mark as read/unread
  const handleToggleRead = async (e) => {
    stop(e);
    setShowMenu(false);
    // Context is optimistic — no refresh() needed
    if (is_read) {
      await markAsUnread(id);
    } else {
      await markAsRead(id);
    }
  };

  
  // Handle copy to notes
  const handleCopyToNotes = async (e) => {
    stop(e);
    setShowMenu(false);
    setIsCopying(true);
    
    try {
      await copyToNotes(notification);
      // no alert
    } catch (err) {
      console.error('Failed to copy to notes:', err);
    } finally {
      setIsCopying(false);
    }

  };
  
  // Handle delete
  const handleDelete = async (e) => {
    stop(e);
    setShowMenu(false);
    setIsDeleting(true);

    try {
      if (onDelete) {
        await onDelete(id); // Context removeNotification handles state update
      }
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  
  // Handle copy to clipboard
  const handleCopyToClipboard = async (e) => {
    stop(e);
    setShowMenu(false);

    const text = `${title}\n${message}\n${new Date(created_at).toLocaleString()}`;

    try {
      await navigator.clipboard.writeText(text);
      // no alert
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  
  return (
    <div
      ref={itemRef}
      onClick={handleClick}
      className={`
        relative p-4 rounded-xl border transition-all duration-200
        ${!is_read
          ? 'bg-gradient-to-r from-blue-950/60 to-slate-800/80 border-l-[3px] border-l-blue-400 border-t border-r border-b border-blue-500/25 shadow-sm shadow-blue-900/20'
          : 'bg-slate-800/40 border-slate-700/40 opacity-80'
        }
        cursor-pointer hover:bg-slate-700/60 hover:opacity-100
        group
        ${isDeleting ? 'opacity-50 pointer-events-none' : ''}
      `}
    >
      {/* Unread indicator */}
      {!is_read && (
        <div className="absolute top-4 left-2 w-2 h-2 bg-blue-500 rounded-full" />
      )}
      
      {/* Priority indicator */}
      {priority === 'high' && (
        <div className="absolute top-2 right-12">
          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
        </div>
      )}
      
      <div className="flex items-start gap-3">
        {/* Avatar or Icon */}
        <div className="flex-shrink-0">
          {actor_avatar_url ? (
            <img loading="lazy" 
              src={actor_avatar_url} 
              alt="" 
              className="w-10 h-10 rounded-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div 
            className={`w-10 h-10 rounded-full ${colors.bg} flex items-center justify-center ${actor_avatar_url ? 'hidden' : ''}`}
          >
            <Icon className={`w-5 h-5 ${colors.text}`} />
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className={`truncate ${colors.text} ${!is_read ? 'font-semibold' : 'font-medium'}`}>
                {!is_read && (
                  <span className="relative inline-flex mr-1.5 align-middle">
                    <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-blue-400 opacity-60" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
                  </span>
                )}
                {title}
              </h4>
            <span className="text-xs text-slate-500 whitespace-nowrap">
              {timeAgo}
            </span>
          </div>
          
          <p className="text-sm text-slate-400 mt-1 line-clamp-2">
            {message}
          </p>
          
          {/* Category badge and link indicator */}
          <div className="flex items-center gap-2 mt-2">
            {category && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-400">
                {category}
              </span>
            )}
            
            <span className="text-xs text-blue-400 flex items-center gap-1">
              <ExternalLink className="w-3 h-3" />
              Click to view
            </span>
          </div>
        </div>
        
        {/* Menu button */}
        <div className="relative menu-btn" ref={menuRef}>
          <button
            onClick={handleMenuToggle}
            className="p-2 text-slate-500 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            title="More options"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          
          {/* Dropdown menu */}
          {showMenu && (
            <div className="menu-dropdown absolute right-0 top-full mt-1 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden">
              {/* Mark as read/unread */}
              <button
                onClick={handleToggleRead}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:bg-slate-700 transition-colors"
              >
                {is_read ? (
                  <>
                    <EyeOff className="w-4 h-4" />
                    Mark as unread
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4" />
                    Mark as read
                  </>
                )}
              </button>
              
              {/* Copy to Notes */}
              <button
                onClick={handleCopyToNotes}
                disabled={isCopying}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:bg-slate-700 transition-colors"
              >
                <FileText className="w-4 h-4" />
                {isCopying ? 'Copying...' : 'Copy to Notes'}
              </button>
              
              {/* Copy to clipboard */}
              <button
                onClick={handleCopyToClipboard}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:bg-slate-700 transition-colors"
              >
                <Copy className="w-4 h-4" />
                Copy to clipboard
              </button>
              
              {/* Delete */}
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/20 transition-colors border-t border-slate-700"
              >
                <Trash2 className="w-4 h-4" />
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;