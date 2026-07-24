/**
 * NewMessageModal Component - Fixed Version
 * 
 * FIXES:
 * 1. Search now works with multiple API endpoint fallbacks
 * 2. Better error handling for search failures
 * 3. Group chat creation works properly
 * 4. Shows connections by default, search finds any user
 * 5. Profile pictures display correctly
 * 
 * Features:
 * - Search for ANY user to start a direct message (not just friends)
 * - Create group chats with multiple users
 * - Shows online status with proper colors (green/grey/red)
 * - API search integration with fallback endpoints
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { X, Check, Search, Users, MessageCircle, Loader2, AlertCircle } from 'lucide-react';
import { getProfilePicture } from '@/utils/getProfilePicture';
import { usersAPI } from '@/utils/APIs/userAPI';
import { chatAPI } from '@/utils/APIs/chatApi';



// Status colors
const STATUS_COLORS = {
  online: 'bg-emerald-500',
  idle: 'bg-gray-400',
  offline: 'bg-red-500',
};

// Avatar component for this modal
const UserAvatar = ({ src, name, size = 'md', status = 'offline' }) => {
  const [imageError, setImageError] = useState(false);
  
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  };

  const statusSizes = {
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
  };

  const initials = name
    ?.split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?';

  const showImage = src && !imageError;

  return (
    <div className="relative inline-block flex-shrink-0">
      {showImage ? (
        <img loading="lazy" 
          src={src} 
          alt={name} 
          className={`${sizes[size]} rounded-full object-cover bg-zinc-700`}
          onError={() => setImageError(true)}
        />
      ) : (
        <div className={`${sizes[size]} rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center font-semibold text-white`}>
          {initials}
        </div>
      )}
      <span 
        className={`absolute -bottom-0.5 -right-0.5 ${statusSizes[size]} rounded-full border-2 border-zinc-900 ${STATUS_COLORS[status]}`} 
      />
    </div>
  );
};

const NewMessageModal = ({ 
  isOpen, 
  onClose, 
  friends = [],
  onlineUsers = [], 
  lastActiveAt = {},
  onSelectUser, 
  onCreateGroup,
  token,
  currentUserId,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isGroupMode, setIsGroupMode] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [error, setError] = useState(null);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  
  const inputRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const abortRef = useRef(null);

  // Normalize onlineUsers
  const onlineSet = useMemo(() => {
    return new Set((onlineUsers || []).map(String));
  }, [onlineUsers]);

  // Get user status
  const getUserStatus = useCallback((userId) => {
    const id = String(userId);
    const isConnected = onlineSet.has(id);
    
    if (!isConnected) return 'offline';
    
    const lastActive = lastActiveAt?.[id];
    if (lastActive) {
      const diffMs = Date.now() - Number(lastActive);
      if (diffMs > 5 * 60 * 1000) return 'idle';
    }
    
    return 'online';
  }, [onlineSet, lastActiveAt]);

  // Filter users by search term (client-side filtering)
  const filterUsersByTerm = useCallback((items, term) => {
    if (!term) return items;
    
    const needle = term.toLowerCase();
    return items.filter((u) => {
      // If it's a group conversation
      if (u.conversation_type && u.conversation_type !== 'direct') {
        return (u.name || '').toLowerCase().includes(needle);
      }
      
      const first = (u.firstName || u.first_name || '').toLowerCase();
      const last = (u.lastName || u.last_name || '').toLowerCase();
      const name = `${first} ${last}`.trim();
      const username = (u.username || '').toLowerCase();
      const email = (u.email || '').toLowerCase();
      return (
        name.includes(needle) ||
        first.includes(needle) ||
        last.includes(needle) ||
        username.includes(needle) ||
        email.includes(needle)
      );
    });
  }, []);

  const [mockFallbackData, setMockFallbackData] = useState([]);

  useEffect(() => {
    if (!isOpen) return;
    const fetchFallback = async () => {
      try {
        const res = await chatAPI.getAvailableUsersAndGroups();
        if (res && res.success) {
          const list = [
            ...(res.users || []).filter(u => String(u.id) !== String(currentUserId)),
            ...(res.groups || [])
          ];
          setMockFallbackData(list);
        }
      } catch (err) {
        console.error("Failed to load fallback users:", err);
      }
    };
    fetchFallback();
  }, [isOpen, currentUserId]);

  // Search users API - uses /api/users?search=
  const searchUsers = useCallback(async (query) => {
    const q = (query || '').trim();
    
    if (!q || q.length < 2) {
      setSearchResults([]);
      setShowSuggestions(true);
      setError(null);
      return;
    }

    if (!token) {
      setError('Authentication required. Please log in again.');
      return;
    }

    // Cancel any in-flight request
    try { 
      abortRef.current?.abort?.(); 
    } catch (_) {
      // Ignore abort errors
    }
    
    const controller = new AbortController();
    abortRef.current = controller;

    setIsSearching(true);
    setShowSuggestions(false);
    setError(null);

    try {
      // ✅ USING CENTRALIZED API
      const data = await usersAPI.getAll({
        search: q,
        per_page: 20
      }, token);
      
      if (data.success && data.data?.users) {
        let users = data.data.users;
        
        // Filter out current user
        users = users.filter(u => String(u.id) !== String(currentUserId));
        
        // Apply client-side filtering for better relevance
        users = filterUsersByTerm(users, q);
        
        setSearchResults(users);
      } else {
        // Fallback: filter mock friends and groups locally
        const filtered = filterUsersByTerm(mockFallbackData, q);
        // Exclude groups if we are in Group creation mode (don't add groups to groups)
        setSearchResults(isGroupMode ? filtered.filter(f => !f.conversation_type) : filtered);
      }
    } catch (err) {
      if (err?.name === 'AbortError') {
        return; // Request was cancelled, don't update state
      }
      
      console.warn('Search failed:', err.message);
      
      // Fallback: filter mock friends and groups locally
      const filtered = filterUsersByTerm(mockFallbackData, q);
      setSearchResults(isGroupMode ? filtered.filter(f => !f.conversation_type) : filtered);
      
      if (filtered.length === 0) {
        setError('Search failed. Showing connections only.');
      }
    } finally {
      setIsSearching(false);
    }
  }, [token, currentUserId, filterUsersByTerm, friends]);

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchTerm.length >= 2) {
      searchTimeoutRef.current = setTimeout(() => {
        searchUsers(searchTerm);
      }, 300);
    } else {
      setSearchResults([]);
      setShowSuggestions(true);
      setError(null);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm, searchUsers]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
    if (!isOpen) {
      // Reset state when modal closes
      setSearchTerm('');
      setSelectedUsers([]);
      setIsGroupMode(false);
      setGroupName('');
      setSearchResults([]);
      setShowSuggestions(true);
      setError(null);
      setIsCreatingGroup(false);
    }
  }, [isOpen]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      try {
        abortRef.current?.abort?.();
      } catch (_) {
        // Ignore
      }
    };
  }, []);

  if (!isOpen) return null;

  // Get display list (search results or friends)
  const displayList = searchTerm.length >= 2 
    ? searchResults 
    : friends.filter(f => String(f.id) !== String(currentUserId));

  // Sort: online first, then idle, then offline
  const sortedUsers = [...displayList].sort((a, b) => {
    const statusOrder = { online: 0, idle: 1, offline: 2 };
    const aStatus = getUserStatus(a.id);
    const bStatus = getUserStatus(b.id);
    return statusOrder[aStatus] - statusOrder[bStatus];
  });

  // Handle user click
  const handleUserClick = (user) => {
    if (isGroupMode) {
      // Toggle user selection for group
      setSelectedUsers((prev) =>
        prev.find((u) => String(u.id) === String(user.id))
          ? prev.filter((u) => String(u.id) !== String(user.id))
          : [...prev, user]
      );
    } else {
      // Direct message - call callback and close
      if (onSelectUser && typeof onSelectUser === 'function') {
        onSelectUser(user);
      }
      onClose();
    }
  };

  // Handle create group
  const handleCreateGroup = async () => {
    if (selectedUsers.length === 0) {
      setError('Please select at least one user');
      return;
    }

    if (!groupName.trim()) {
      setError('Please enter a group name');
      return;
    }

    if (!onCreateGroup || typeof onCreateGroup !== 'function') {
      setError('Group creation is not available. Please check your configuration.');
      return;
    }

    setError(null);
    setIsCreatingGroup(true);

    const userIds = selectedUsers.map((u) => u.id);
    const name = groupName.trim();

    try {
      const result = await onCreateGroup(userIds, name);
      
      // Handle both patterns: 
      // 1. Returns { success: false, message: '...' } on failure
      // 2. Throws error on failure
      if (result && result.success === false) {
        setError(result.message || 'Failed to create group. Please try again.');
        return;
      }
      
      onClose();
    } catch (e) {
      console.error('Create group failed:', e);
      setError(e?.message || 'Failed to create group. Please try again.');
    } finally {
      setIsCreatingGroup(false);
    }
  };

  // Remove selected user
  const removeSelectedUser = (userId) => {
    setSelectedUsers((prev) => prev.filter((u) => String(u.id) !== String(userId)));
  };

  // Switch to direct message mode
  const switchToDirectMode = () => {
    setIsGroupMode(false);
    setSelectedUsers([]);
    setGroupName('');
    setError(null);
  };

  // Switch to group mode
  const switchToGroupMode = () => {
    setIsGroupMode(true);
    setError(null);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
          <h2 className="text-base font-semibold text-white">New message</h2>
          <button 
            type="button"
            onClick={onClose} 
            className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Mode Toggle */}
        <div className="flex px-2 py-2 border-b border-zinc-800 gap-1">
          <button
            type="button"
            onClick={switchToDirectMode}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${
              !isGroupMode 
                ? 'text-amber-500 bg-amber-500/10' 
                : 'text-zinc-500 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <MessageCircle size={16} />
            Direct Message
          </button>
          <button
            type="button"
            onClick={switchToGroupMode}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${
              isGroupMode 
                ? 'text-amber-500 bg-amber-500/10' 
                : 'text-zinc-500 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Users size={16} />
            Create Group
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="px-4 py-2 bg-red-500/10 border-b border-red-500/20 flex items-center gap-2">
            <AlertCircle size={14} className="text-red-400 flex-shrink-0" />
            <p className="text-xs text-red-400">{error}</p>
          </div>
        )}

        {/* Search Field */}
        <div className="px-4 py-3 border-b border-zinc-800">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-zinc-500 text-sm">To:</span>
            
            {/* Selected users chips (group mode) */}
            {selectedUsers.length > 0 && isGroupMode && (
              <div className="flex flex-wrap gap-1">
                {selectedUsers.map((user) => (
                  <span 
                    key={user.id} 
                    className="flex items-center gap-1 px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded-full text-xs"
                  >
                    {user.firstName || user.first_name || 'User'}
                    <button 
                      type="button"
                      onClick={() => removeSelectedUser(user.id)} 
                      className="hover:text-white"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
            
            {/* Search input */}
            <div className="flex-1 relative min-w-[120px]">
              <input
                ref={inputRef}
                type="text"
                placeholder="Search for users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent text-white text-sm placeholder-zinc-500 focus:outline-none"
              />
            </div>
            
            {isSearching && (
              <Loader2 size={16} className="text-amber-500 animate-spin flex-shrink-0" />
            )}
          </div>
          
          {/* Search hint */}
          {searchTerm.length > 0 && searchTerm.length < 2 && (
            <p className="text-xs text-zinc-500 mt-2">Type at least 2 characters to search</p>
          )}
        </div>

        {/* Group Name Input (only in group mode with selections) */}
        {isGroupMode && selectedUsers.length > 0 && (
          <div className="px-4 py-3 border-b border-zinc-800">
            <input
              type="text"
              placeholder="Group name..."
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full bg-zinc-800 px-3 py-2 rounded-lg text-white text-sm placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
        )}

        {/* Suggestions Header */}
        {showSuggestions && !searchTerm && (
          <div className="px-4 py-2 bg-zinc-800/30">
            <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
              Your Connections
            </span>
          </div>
        )}

        {/* Search Results Header */}
        {searchTerm.length >= 2 && !isSearching && (
          <div className="px-4 py-2 bg-zinc-800/30">
            <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
              {searchResults.length > 0 
                ? `Found ${searchResults.length} user${searchResults.length !== 1 ? 's' : ''}`
                : 'No users found'}
            </span>
          </div>
        )}

        {/* User List */}
        <div className="max-h-80 overflow-y-auto">
          {isSearching ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={24} className="text-amber-500 animate-spin" />
            </div>
          ) : sortedUsers.length === 0 ? (
            <div className="text-center py-8 text-zinc-500 text-sm px-4">
              {searchTerm.length >= 2 
                ? 'No users found. Try a different search.' 
                : friends.length === 0 
                  ? 'No connections yet. Connect with users to message them!'
                  : 'No connections to display'}
            </div>
          ) : (
            sortedUsers.map((user) => {
              const isGroup = user.conversation_type && user.conversation_type !== 'direct';
              const status = isGroup ? 'online' : getUserStatus(user.id);
              const isSelected = selectedUsers.find((u) => String(u.id) === String(user.id));
              const userName = user.name || `${user.firstName || user.first_name || ''} ${user.lastName || user.last_name || ''}`.trim();
              const profilePic = isGroup ? null : getProfilePicture(user);
              const initials = userName.substring(0, 2).toUpperCase();

              return (
                <button
                  type="button"
                  key={user.id}
                  onClick={() => handleUserClick(user)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-zinc-800/50 transition-colors ${
                    isSelected ? 'bg-amber-500/10' : ''
                  }`}
                >
                  <UserAvatar
                    src={profilePic}
                    name={userName}
                    size="md"
                    status={isGroup ? 'online' : status}
                  />
                  <div className="flex-1 text-left min-w-0">
                    <p className="font-medium text-white text-sm truncate">
                      {userName || 'Unknown'} {isGroup && <span className="ml-2 text-[10px] uppercase bg-zinc-700 px-1.5 py-0.5 rounded text-zinc-300">Group</span>}
                    </p>
                    <p className={`text-xs ${
                      isGroup ? 'text-amber-500' :
                      status === 'online' ? 'text-emerald-500' :
                      status === 'idle' ? 'text-gray-400' :
                      'text-zinc-500'
                    }`}>
                      {isGroup ? `${(user.participants || []).length} members` :
                       status === 'online' ? 'Active now' :
                       status === 'idle' ? 'Away' :
                       'Offline'}
                    </p>
                  </div>
                  {isGroupMode && isSelected && (
                    <Check size={18} className="text-amber-500 flex-shrink-0" />
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Create Group Button */}
        {isGroupMode && selectedUsers.length > 0 && (
          <div className="p-4 border-t border-zinc-800">
            <button
              type="button"
              onClick={handleCreateGroup}
              disabled={!groupName.trim() || isCreatingGroup}
              className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-900 font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {isCreatingGroup ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Creating...
                </>
              ) : (
                `Create Group (${selectedUsers.length} member${selectedUsers.length !== 1 ? 's' : ''})`
              )}
            </button>
          </div>
        )}

        {/* Status Legend */}
        <div className="px-4 py-2 border-t border-zinc-800 bg-zinc-950/50">
          <div className="flex items-center justify-center gap-4 text-[10px] text-zinc-500">
            <div className="flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${STATUS_COLORS.online}`} />
              <span>Online</span>
            </div>
            <div className="flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${STATUS_COLORS.idle}`} />
              <span>Away</span>
            </div>
            <div className="flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${STATUS_COLORS.offline}`} />
              <span>Offline</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewMessageModal;