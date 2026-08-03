import React, { useState, useEffect,useRef } from 'react';
import { toast } from 'react-toastify';
import ChatWebSocketClient from '../../services/websocket/ChatWebSocketClient';
import TimeAwareMessageInput from '../TimeAwareMessageInput';
// import Alert from './sections/Alert';
import ScrollToTop from '../sections/ScrollToTop';
import { RiDeleteBin6Line } from "react-icons/ri";
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { ShineButton } from '../lightswind/shine-button'
import { LuPresentation } from "react-icons/lu";

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "../ui/avatar";
import {Badge} from "../ui/badge";
import { Action, Actions } from '../ui/shadcn-io/ai/actions';
import {
    CopyIcon,
    RefreshCcwIcon,
    ChevronLeft, ChevronRight,
    ShareIcon,
    ThumbsDownIcon,
    ThumbsUpIcon,
    Eye,
    Clock,
    Menu
  } from 'lucide-react';
import { MessageCircle, Plus, Send, Edit2, Check, X, Users, Circle, Phone, Video, Star, Search, Settings, Bell, Image, FileText, File, Download, ChevronDown, ChevronUp } from 'lucide-react';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css'; // Core CSS
import 'tippy.js/animations/scale.css'; // Animation CSS
import 'tippy.js/themes/light.css'; // Theme CSS

import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip"; 

import PaintingBoard from '../collaboration-canvas/PaintingBoard';
import { fetchUserProfile } from '../../services/auth/authThunks';
import { ConversationsCardSkeleton, MessagesSkeleton } from './Skeletons';
import { API_BASE_URL, SOCKET_API_URL } from '@/utils/config';
import { chatAPI } from '@/utils/APIs/chatApi';
import { usersAPI } from '@/utils/api/userAPI';
import MessageBubble from './MessageBubble';
import { notificationAPI } from '@/utils/api/notificationAPI';

import { toAbsoluteFileUrl } from "@/utils/toAbsoluteFileUrl";


console.log("STEP 2: handleSendMessage called");
console.log({
    conversationId: selectedConversation?.id,
    messageContent
});

async function downloadViaBlob(url, filename) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed: ${res.status}`);

  const blob = await res.blob();
  const blobUrl = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = blobUrl;
  a.download = filename || "download";
  document.body.appendChild(a);
  a.click();
  a.remove();

  window.URL.revokeObjectURL(blobUrl);
}

const DELETE_TIMEOUT_HOURS = Number(import.meta.env.VITE_MESSAGE_DELETE_TIMEOUT_HOURS) || 1;

const canDeleteMessage = (message) => {
  if (!message?.created_at) return true; // fallback
  const msgTime = new Date(message.created_at);
  const now = new Date();
  const diffHours = (now - msgTime) / (1000 * 60 * 60);
  return diffHours <= DELETE_TIMEOUT_HOURS;
};
//component for reusability
const RightSidebarContent = ({ 
    selectedConversation, 
    users, 
    userId, 
    onlineUsers, 
    conversationFiles,
    showFilesExpanded,
    setShowFilesExpanded,
    showLinksExpanded,
    setShowLinksExpanded,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    onClose
  }) => (
    <>
        
      
      {onClose && (
        <div className="flex items-center justify-between p-4 border-b border-gray-900">
          <h3 className="text-white font-bold">Details</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-gray-800 text-gray-300"
          >
            <X size={20} />
          </button>
        </div>
      )}
  
      {/* Members Section */}
      <div className="p-4 border-b border-gray-900">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-bold flex items-center gap-2">
            <Users size={18} />
            Members
          </h3>
          <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded-full">
            {selectedConversation.participants?.length}
          </span>
        </div>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {selectedConversation.participants?.map(participant => {
            const usr = users.find(u => u.id === participant.id) || participant;
            const isOnline = onlineUsers.has(participant.id.toString());
            const isCurrentUser = participant.id === userId;
            
            return (
              <div key={participant.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-900 transition-all">
                <div className="relative">
                  <Avatar className="size-10 bg-linear-to-br from-blue-300 to-purple-300 text-black font-bold flex items-center justify-center">
                    <AvatarImage src={participant?.profilePicture || '/default-user.jpeg'} alt="@shadcn" />
                    <AvatarFallback>
                      {(participant?.firstName || participant?.first_name)?.[0]}
                      {(participant?.lastName || participant?.last_name)?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  {isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0f0f0f]"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm font-medium flex items-center gap-2">
                    <span className="truncate">
                      {usr.firstName || usr.first_name} {usr.lastName || usr.last_name}
                    </span>
                    {isCurrentUser && (
                      <span className="shrink-0 text-xs bg-[#c1ff72] text-black px-2 py-0.5 rounded-full font-semibold">
                        You
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    {isOnline ? 'Online' : 'Offline'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
  
      {/* Files Section */}
      <div className="p-4 border-b border-gray-900">
        <button
          onClick={() => setShowFilesExpanded(!showFilesExpanded)}
          className="w-full flex items-center justify-between text-white font-bold mb-3 hover:text-[#c1ff72] transition-colors group"
        >
          <div className="flex items-center gap-2">
            <Image size={18} />
            <span>{conversationFiles.filter(f => f.file_type?.startsWith('image/')).length} photos</span>
          </div>
          {showFilesExpanded ? 
            <ChevronUp size={16} className="text-gray-400 group-hover:text-[#c1ff72]" /> : 
            <ChevronDown size={16} className="text-gray-400 group-hover:text-[#c1ff72]" />
          }
        </button>
        
        {showFilesExpanded && (
          <div className="grid grid-cols-2 gap-2 animate-in fade-in-50 duration-200">
            {conversationFiles
              .filter(file => file.file_type?.startsWith('image/'))
              .slice(0, 4)
              .map((file, idx) => {
                const imageUrl = toAbsoluteFileUrl(file.file_url);
                
                return (
                  <div 
                    key={idx} 
                    className="aspect-square rounded-lg overflow-hidden bg-gray-900 hover:opacity-80 transition-all duration-200 cursor-pointer group relative"
                  >
                    <img 
                      src={imageUrl} 
                      alt={file.file_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      loading="lazy"
                    />
                  </div>
                );
              })}
          </div>
        )}
      </div>
  
      {/* All Files Section */}
      <div className="p-4">
        <button
          onClick={() => setShowLinksExpanded(!showLinksExpanded)}
          className="w-full flex items-center justify-between text-white font-bold mb-3 hover:text-[#c1ff72] transition-colors group"
        >
          <div className="flex items-center gap-2">
            <File size={18} />
            <span>{conversationFiles.length} files</span>
          </div>
          {showLinksExpanded ? 
            <ChevronUp size={16} className="text-gray-400 group-hover:text-[#c1ff72]" /> : 
            <ChevronDown size={16} className="text-gray-400 group-hover:text-[#c1ff72]" />
          }
        </button>
        
        {showLinksExpanded && (
          <div className="space-y-2 max-h-96 overflow-y-auto animate-in fade-in-50 duration-200">
            {conversationFiles.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <File size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">No files shared yet</p>
              </div>
            ) : (
              conversationFiles.map((file, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center gap-3 p-3 bg-gray-900 rounded-lg hover:bg-gray-800 transition-all duration-200 cursor-pointer group"
                >
                  <div className="flex-shrink-0">
                    {getFileIcon(file.file_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-sm font-medium truncate">
                      {file.file_name}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-2">
                      {formatFileSize(file.file_size)}
                      <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                      {new Date(file.uploaded_at).toLocaleDateString()}
                    </div>
                  </div>
                  <a 
                    href={toAbsoluteFileUrl(file.file_url)} 
                    download
                    className="flex-shrink-0 p-2 rounded-lg hover:bg-gray-700 transition-all duration-200"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Download size={16} className="text-gray-400 hover:text-white" />
                  </a>
                </div>
              ))
            )}
          </div>
        )}
        
              
      <div className="flex items-center gap-2 px-4 py-2.5">
        <Clock size={14} className="text-gray-600" />
        <span className="text-xs text-gray-500">
          <strong>Tip:</strong> Type times like "19:00" (press Tab) or "19" (press Space for options)
        </span>
      </div>
      </div>
    </>
  );
  
  
const ChatComponent = () => {
    
  const dispatch = useDispatch();
  const { user, access_token } = useSelector((state) => state.auth);
  const [userId, setUserId] = useState(null);
  const [users, setUsers] = useState([]);
  const [mockUsers] = useState([]);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' })

  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState({});
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [isConnected, setIsConnected] = useState(false);

  const [imagePreview, setImagePreview] = useState(null);
    
  // Add these state variables
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletedMessage, setDeletedMessage] = useState(null);
  const [newConversationName, setNewConversationName] = useState('');
  const conversationId = new URLSearchParams(window.location.search).get('conversationId');
  useEffect(() => {
    async function fetchInitialData() {
      if (!conversationId || !access_token) return;
      const conversation = await chatAPI.getConversationById(conversationId, access_token);
      if (conversation) {
        setSelectedConversation(conversation);
      }
    }
    fetchInitialData();
  }, [conversationId, access_token]);
  
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [conversationType, setConversationType] = useState('direct');

    
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 30;
    
  // Edit message states
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingContent, setEditingContent] = useState('');
  const [hoveredMessageId, setHoveredMessageId] = useState(null);
    
  // File states
  const [conversationFiles, setConversationFiles] = useState([]);
  const [showFilesExpanded, setShowFilesExpanded] = useState(false);
  const [showLinksExpanded, setShowLinksExpanded] = useState(false);
    
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    
  const [readConversations, setReadConversations] = useState(new Set());
    
  const [wsClient, setWsClient] = useState(null);
  const messagesEndRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(true);
    
  const [initialConversationsLoad, setInitialConversationsLoad] = useState(true);
  const [initialMessagesLoad, setInitialMessagesLoad] = useState(true);

    
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  
  // Add this with your other state variables
  const [showWhiteboardModal, setShowWhiteboardModal] = useState(false);
  // Add to your state variables
  const [hoveredConversationId, setHoveredConversationId] = useState(null);
    
  const [likedMessages, setLikedMessages] = useState(new Set());
  const [dislikedMessages, setDislikedMessages] = useState(new Set());
  const [copiedMessage, setCopiedMessage] = useState(null);
    
  //! Like message function
  const handleLike = (messageId) => {
    const newLiked = new Set(likedMessages);
    if (newLiked.has(messageId)) {
      newLiked.delete(messageId);
      toast.info('Removed like from message');
    } else {
      newLiked.add(messageId);
      toast.success('Liked message');
    }
    setLikedMessages(newLiked);
  };
    
  //! Dislike message function
  const handleDislike = (messageId) => {
    const newDisliked = new Set(dislikedMessages);
    if (newDisliked.has(messageId)) {
      newDisliked.delete(messageId);
      toast.info('Removed dislike from message');
    } else {
      newDisliked.add(messageId);
      toast.info('Disliked message');
    }
    setDislikedMessages(newDisliked);
  };
    
  //! Copy message function
  const handleCopy = async (message) => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopiedMessage(message.id);
      toast.success('Message copied to clipboard');
        
      // Reset copied state after 2 seconds
      setTimeout(() => setCopiedMessage(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      toast.error('Failed to copy message');
    }
  };
    
  //! Share message function
  const handleShare = async (message) => {
    const shareData = {
      title: `Message from ${message.sender?.firstName || message.sender?.first_name} ${message.sender?.lastName || message.sender?.last_name}`,
      text: message.content,
      url: window.location.href + `?message=${message.id}`
    };
    
    try {
      if (navigator.share) {
        await navigator.share(shareData);
        toast.success('Message shared');
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(`${shareData.text}\n\n${shareData.url}`);
        toast.success('Link copied to clipboard');
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Share failed:', err);
        toast.error('Failed to share message');
      }
    }
  };
    
    
  const actions = [
    {
      icon: ThumbsUpIcon,
      label: 'Like',
      onClick: (message) => handleLike(message.id),
    },
    {
      icon: ThumbsDownIcon,
      label: 'Dislike',
      onClick: (message) => handleDislike(message.id),
    },
    {
      icon: CopyIcon,
      label: 'Copy',
      onClick: (message) => handleCopy(message),
    },
    {
      icon: ShareIcon,
      label: 'Share',
      onClick: (message) => handleShare(message),
    },
    {
      icon: Edit2,
      label: 'Edit',
      onClick: (message) => handleUpdate(message),
    },
    {
      icon: RiDeleteBin6Line,
      label: 'Delete',
      onClick: (message) => handleDelete(message),
    },
  ];
    
  //! Retry connection:
  // Add retryConnection function:
  const retryConnection = () => {
    if (wsClient) {
      wsClient.reconnect();
    }
  };

    
  const fetchUsers = async (page = 1) => {
    try {
      setLoading(true);
            
      if (!access_token) {
        console.error('No access token found');
        return;
      }

      // ✅ USING CENTRALIZED API
      const data = await usersAPI.getAll({
        page: page,
        per_page: itemsPerPage,
        search: searchQuery || '',
        role: selectedRole || '',
        status: selectedStatus || ''
      }, access_token);
        
      if (data.success) {
                
        // console.log(data.data.users);
                
        setUsers(data.data.users.map((u) => ({ id: u.id, firstName: u.firstName, lastName: u.lastName, email: u.email, profilePicture: u.profile.picture, timezone: u.profile.timezone, role: u.role })));
        setTotalPages(data.data.pagination.total);
        setCurrentPage(data.data.pagination.page);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };
    
    
  const clearFilters = () => {
    setSearchQuery("");
    setSelectedRole("");
    setSelectedStatus("");
  };
    
  //! Set userId when user changes
  useEffect(() => {
    if (user) {
      fetchUsers();
      setUserId(user?.id);
      loadConversations().then(() => {
        setInitialConversationsLoad(false);
      }).catch(error => {
        console.error('Failed to load conversations:', error);
        setInitialConversationsLoad(false);
      });
    }
  }, [user]);

  //! Initialize WebSocket connection
  // useEffect(() => {
  //   if (!userId) return;
    
  //   wsClient.current = new ChatWebSocketClient(SOCKET_API_URL, userId);
      
  //   // Connection events
  //   wsClient.current.on('connected', () => {
  //       console.log('WebSocket connected');
  //       setIsConnected(true);
  //       loadConversations();
  //       toast.success('Connected to chat server');
  //   });
    
  //   wsClient.current.on('disconnected', () => {
  //       console.log('WebSocket disconnected');
  //       setIsConnected(false);
  //       toast.error('Disconnected from chat server');
  //   });
    
  //   wsClient.current.on('connection_error', (error) => {
  //       console.error('Connection error:', error);
  //       toast.error('Connection error occurred');
  //   });
    
  //   wsClient.current.on('reconnected', (attemptNumber) => {
  //       console.log('Reconnected after attempt:', attemptNumber);
  //       toast.success(`Reconnected after ${attemptNumber} attempts`);
  //   });
    
  //   wsClient.current.on('reconnect_failed', () => {
  //       console.error('Reconnection failed');
  //       toast.error('Failed to reconnect to chat server');
  //   });
    
  //   // Message events
  //   wsClient.current.on('new_message', (data) => {
  //     console.log('New message received via WebSocket:', data);
        
  //     // Check if this message is for the current conversation
  //     const isCurrentConversation = selectedConversation?.id === data.conversation_id;
        
  //     // Always handle the message
  //     handleNewMessage(data);
        
  //     // Show notification only if not in the current conversation
  //     if (!isCurrentConversation) {
  //         const conversation = conversations.find(c => c.id === data.conversation_id);
  //         const conversationName = getConversationName(conversation) || 'Unknown conversation';
  //         toast.info(`New message in ${conversationName}`);
  //     }
  //   });
    
  //   wsClient.current.on('message_edited', (data) => {
  //       console.log('Message edited:', data);
  //       handleMessageEdited(data);
  //       toast.info('Message was edited');
  //   });
    
  //   wsClient.current.on('message_deleted', (data) => {
  //       console.log('Message deleted:', data);
  //       handleMessageDeleted(data);
  //       toast.info('Message was deleted');
  //   });
    
  //   wsClient.current.on('mark_message_read', (data) => {
  //       console.log('Message read:', data);
  //       // If someone else read messages in a conversation, update counts
  //       if (data.conversation_id && data.user_id !== userId) {
  //           toast.info('Messages marked as read');
  //           loadConversations();
  //       }
  //   });
    
  //   // Typing events
  //   wsClient.current.on('user_typing', (data) => {
  //       console.log('User typing:', data);
  //       handleUserTyping(data);
  //   });
    
  //   // User status events
  //   wsClient.current.on('user_online', (data) => {
  //       console.log(`User ${data.user_id} is now online`);
  //       handleUserOnline(data);
  //       toast.success(`User ${data.user_name || data.user_id} is now online`);
  //   });
    
  //   wsClient.current.on('user_offline', (data) => {
  //       console.log(`User ${data.user_id} is now offline`);
  //       handleUserOffline(data);
  //       toast.info(`User ${data.user_name || data.user_id} went offline`);
  //   });
    
  //   wsClient.current.on('user_status_changed', (data) => {
  //       console.log(`User ${data.user_id} status changed to ${data.status}`);
  //       toast.info(`User ${data.user_name || data.user_id} is now ${data.status}`);
  //   });
    
  //   // Conversation events
  //   wsClient.current.on('conversation_created', (data) => {
  //       console.log('New conversation created:', data);
  //       handleConversationCreated(data);
  //       toast.success('New conversation created');
  //   });
    
  //   wsClient.current.on('conversation_updated', (data) => {
  //       console.log('Conversation updated:', data);
  //       handleConversationUpdated(data);
  //       toast.info('Conversation updated');
  //   });
    
  //   // Participant events
  //   wsClient.current.on('participant_added', (data) => {
  //       console.log('Participant added:', data);
  //       handleParticipantAdded(data);
  //       toast.info(`User ${data.user_name} added to conversation`);
  //   });
    
  //   wsClient.current.on('participant_removed', (data) => {
  //       console.log('Participant removed:', data);
  //       handleParticipantRemoved(data);
  //       toast.info(`User ${data.user_name} removed from conversation`);
  //   });
    
  //   wsClient.current.on('added_to_conversation', (data) => {
  //       console.log('Added to conversation:', data);
  //       handleAddedToConversation(data);
  //       toast.success('You were added to a conversation');
  //   });
    
  //   wsClient.current.on('removed_from_conversation', (data) => {
  //       console.log('Removed from conversation:', data);
  //       handleRemovedFromConversation(data);
  //       toast.error('You were removed from a conversation');
  //   });
    
  //   // Error events
  //   wsClient.current.on('error', (error) => {
  //       console.error('Socket error:', error);
  //       toast.error(`Chat error: ${error.message || 'Unknown error'}`);
  //   });
    
  //   wsClient.current.connect();
  //   setWsClient(client);
      
  //   return () => {
  //       if (wsClient.current) {
  //           wsClient.current.disconnect();
  //           wsClient.current = null; 
  //       }
  //   };
  // }, [userId]);
    
    
  //! Initialize WebSocket connection
  useEffect(() => {
    if (!userId || wsClient) return; // Don't reinitialize if client already exists
  
    const client = new ChatWebSocketClient(SOCKET_API_URL, userId, {
      maxReconnectAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000
    });
    
    // Connection events
    client.on('connected', () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      loadConversations();
      // toast.success('Connected to chat server');
    });
  
    client.on('disconnected', () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
      // toast.error('Disconnected from chat server');
    });
  
    client.on('connection_error', (error) => {
      console.error('Connection error:', error);
      // toast.error('Connection error occurred');
    });
  
    client.on('reconnected', (attemptNumber) => {
      console.log('Reconnected after attempt:', attemptNumber);
      // toast.success(`Reconnected after ${attemptNumber} attempts`);
    });
  
    client.on('reconnect_failed', () => {
      // console.error('Reconnection failed');
      // toast.error('Failed to reconnect to chat server');
    });
  
    // Message events
    // client.on('new_message', (data) => {
    //   // console.log('New message received via WebSocket:', data);
      
    //   // Check if this message is for the current conversation
    //   const isCurrentConversation = selectedConversation?.id === data.conversation_id;
      
    //   // Always handle the message
    //   handleNewMessage(data);
      
    //   // Show notification only if not in the current conversation
    //   if (!isCurrentConversation) {
    //     const conversation = conversations.find(c => c.id === data.conversation_id);
    //     const conversationName = getConversationName(conversation) || 'Unknown conversation';
    //     toast.info(`New message in ${conversationName}`);
    //   }
    // });
  
    client.on('message_edited', (data) => {
      // console.log('Message edited:', data);
      handleMessageEdited(data);
      toast.info('Message was edited');
    });
  
    client.on('message_deleted', (data) => {
      // console.log('Message deleted:', data);
      handleMessageDeleted(data);
      toast.info('Message was deleted');
    });
  
    client.on('mark_message_read', (data) => {
      // console.log('Message read:', data);
      // If someone else read messages in a conversation, update counts
      if (data.conversation_id && data.user_id !== userId) {
        toast.info('Messages marked as read');
        loadConversations();
      }
    });
  
    // Typing events
    client.on('user_typing', (data) => {
      // console.log('User typing:', data);
      handleUserTyping(data);
    });
  
    // User status events
    client.on('user_online', (data) => {
      // console.log(`User ${data.user_id} is now online`);
      handleUserOnline(data);
      toast.success(`User ${data.user_name || data.user_id} is now online`);

    });
  
    client.on('user_offline', (data) => {
      // console.log(`User ${data.user_id} is now offline`);
      handleUserOffline(data);
      toast.info(`User ${data.user_name || data.user_id} went offline`);
    });
  
    client.on('user_status_changed', (data) => {
      // console.log(`User ${data.user_id} status changed to ${data.status}`);
      toast.info(`User ${data.user_name || data.user_id} is now ${data.status}`);
    });
  
    // Conversation events
    client.on('conversation_created', (data) => {
      // console.log('New conversation created:', data);
      handleConversationCreated(data);
      toast.success('New conversation created');
    });
  
    client.on('conversation_updated', (data) => {
      // console.log('Conversation updated:', data);
      handleConversationUpdated(data);
      toast.info('Conversation updated');
    });
  
    // Participant events
    client.on('participant_added', (data) => {
      // console.log('Participant added:', data);
      handleParticipantAdded(data);
      toast.info(`User ${data.user_name} added to conversation`);
    });
  
    client.on('participant_removed', (data) => {
      // console.log('Participant removed:', data);
      handleParticipantRemoved(data);
      toast.info(`User ${data.user_name} removed from conversation`);
    });
  
    client.on('added_to_conversation', (data) => {
      // console.log('Added to conversation:', data);
      handleAddedToConversation(data);
      toast.success('You were added to a conversation');
    });
  
    client.on('removed_from_conversation', (data) => {
      // console.log('Removed from conversation:', data);
      handleRemovedFromConversation(data);
      toast.error('You were removed from this conversation');
    });
  
    // Error events
    client.on('error', (error) => {
      console.error('Socket error:', error);
      toast.error(`Socket error: ${error.message || 'Unknown error'}`);
    });
  
    client.connect();
    setWsClient(client);
    
    return () => {
      if (client) {
        client.disconnect();
        setWsClient(null);
      }
    };
  }, [userId]); // Only depend on userId
  
  // Debug: Log WebSocket state changes
  useEffect(() => {
    if (!wsClient) {
      console.log('WebSocket client is null');
      return;
    }
    
    // console.log('WebSocket client state:', {
    //     isConnected: wsClient.isConnected(),
    //     socketId: wsClient.getSocketId(),
    //     userId: wsClient.userId
    // });
    
    const checkInterval = setInterval(() => {
      console.log('Current WebSocket connection state:', wsClient.isConnected());
    }, 10000); // Check every 10 seconds
    
    return () => clearInterval(checkInterval);
  }, [wsClient]);

  //! Clean up event handlers when dependencies change
  useEffect(() => {
    if (!wsClient) return;
    
    // Re-attach event handlers when selectedConversation or conversations change
    // This ensures we have the latest callbacks
    const eventHandlers = {
      new_message: handleNewMessage,
      message_edited: handleMessageEdited,
      message_deleted: handleMessageDeleted,
      mark_message_read: (data) => {
        if (data.conversation_id && data.user_id !== userId) {
          loadConversations();
        }
      },
      user_typing: handleUserTyping,
      user_online: handleUserOnline,
      user_offline: handleUserOffline,
      user_status_changed: () => { }, // Empty handler as we just show notification
      conversation_created: handleConversationCreated,
      conversation_updated: handleConversationUpdated,
      participant_added: handleParticipantAdded,
      participant_removed: handleParticipantRemoved,
      added_to_conversation: handleAddedToConversation,
      removed_from_conversation: handleRemovedFromConversation,
      error: (error) => {
        toast.error(`Socket error: ${error.message || 'Unknown error'}`);
      }
    };
    
    // Store references to the actual handler functions
    const handlerRefs = {};
    
    // Re-attach all handlers
    Object.entries(eventHandlers).forEach(([event, handler]) => {
      // Store the reference
      handlerRefs[event] = handler;
      // Remove any existing handler first
      wsClient.off(event);
      // Add new handler
      wsClient.on(event, handler);
    });
    
    return () => {
      // Clean up specific handlers when component unmounts or dependencies change
      if (wsClient) {
        Object.entries(handlerRefs).forEach(([event, handler]) => {
          // Only remove the handler we registered
          wsClient.off(event, handler);
        });
      }
    };
  }, [wsClient, userId]);
  
  //!NEw Event handlers:
  //! handle conversation created:
  const handleConversationCreated = (data) => {
    // If the new conversation includes the current user
    if (data.conversation && data.conversation.participants?.some(p => p.id === userId)) {
      // Add the new conversation to the list
      setConversations(prev => {
        if (prev.some(c => c.id === data.conversation.id)) {
          return prev;
        }
        return [data.conversation, ...prev];
      });
            
      // If this is the current user creating the conversation, select it
      if (data.conversation.created_by_id === userId) {
        setSelectedConversation(data.conversation);
        loadMessages(data.conversation.id);
        loadConversationFiles(data.conversation.id);
      }
    }
  };
    
  //! handle conversation updated:
  const handleConversationUpdated = (data) => {
    if (data.conversation) {
      // Update the conversation in the list
      setConversations(prev =>
        prev.map(c => c.id === data.conversation.id ? data.conversation : c)
      );
            
      // Update selected conversation if it's the current one
      if (selectedConversation?.id === data.conversation.id) {
        setSelectedConversation(data.conversation);
      }
    }
  };
    
  //! handle participant added:
  const handleParticipantAdded = (data) => {
    if (selectedConversation?.id === data.conversation_id) {
      // Reload conversation to get updated participant list
      loadConversations();
      toast.info(`${data.user_name} was added to the conversation`);
    }
  };
    
  //! handle participant removed:
  const handleParticipantRemoved = (data) => {
    if (selectedConversation?.id === data.conversation_id) {
      // If the current user was removed
      if (data.user_id === userId) {
        toast.error('You were removed from this conversation');
        setSelectedConversation(null);
        setMessages([]);
      } else {
        toast.info(`${data.user_name} left the conversation`)

      }
      loadConversations();
    }
  };
    
  //! handle added to conversation:
  const handleAddedToConversation = (data) => {
    if (data.conversation) {
      // Add the conversation to the list
      setConversations(prev => {
        if (prev.some(c => c.id === data.conversation.id)) {
          return prev;
        }
        return [data.conversation, ...prev];
      });
            
      // Show notification with conversation name
      const conversationName = getConversationName(data.conversation);
      toast.success(`You were added to "${conversationName}"`);
    }
  };
    
  //! handle removed from conversation:
  const handleRemovedFromConversation = (data) => {
    // Remove the conversation from the list
    setConversations(prev =>
      prev.filter(c => c.id !== data.conversation_id)
    );
        
    // If this was the selected conversation, clear it
    if (selectedConversation?.id === data.conversation_id) {
      setSelectedConversation(null);
      setMessages([]);
    }
        
    toast.error('You were removed from a conversation')
  };
    
  //! handle message deleted:
  const handleMessageDeleted = (data) => {
    if (data.message_id && selectedConversation && data.conversation_id === selectedConversation.id) {
      // Remove the deleted message from the list
      setMessages(prev => prev.filter(msg => msg.id !== data.message_id));
            
      // Reload files in case a file message was deleted
      loadConversationFiles(selectedConversation.id);
    }
  };

  //!END Event handlers:

  //! LOAD USER CONVERSATIONS:
  const loadConversations = async () => {
    if (initialConversationsLoad) {
      setLoading(true);
    }
      
    const token = access_token;
      
    if (!token) {
      console.error('No access token found');
      setLoading(false);
      if (initialConversationsLoad) {
        setInitialConversationsLoad(false);
      }
      return;
    }
      
    try {
      // ✅ USING CENTRALIZED API
      const data = await chatAPI.getAllChats();
          
      // console.log('Conversations response:', data);
          
      if (data.success && data.data?.conversations) {
        setConversations(prevConversations => {
          // Only update if conversations actually changed
          const newConversations = data.data.conversations;
          const hasChanged = JSON.stringify(prevConversations) !== JSON.stringify(newConversations);
          return hasChanged ? newConversations : prevConversations;
        });
      } else {
        console.error('No conversations found or invalid response:', data);
        setConversations([]);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
      // Don't reset conversations on error to keep existing data
    } finally {
      setLoading(false);
      if (initialConversationsLoad) {
        setInitialConversationsLoad(false);
      }
    }
  };
    
  //! LOAD USER MESSAGES FOR CHOSEN CONVERSATION:
  const loadMessages = async (conversationId) => {
  if (!conversationId) return;

  console.log("LOADING MESSAGES FOR:", conversationId);

  setLoadingMessages(true);

  try {
    const data = await chatAPI.getMessages(
      conversationId,
      50,
      0
    );

    console.log("GET MESSAGES RESPONSE:", data);

    if (
      data?.success &&
      Array.isArray(data?.data?.messages)
    ) {
      // Backend returns newest -> oldest.
      // Reverse once for chronological chat rendering.
      setMessages([...data.data.messages].reverse());
    } else {
      console.error("INVALID MESSAGES RESPONSE:", data);
      setMessages([]);
    }
  } catch (error) {
    console.error("GET MESSAGES FAILED:", error);
    setMessages([]);
    toast.error("Failed to load messages");
  } finally {
    setLoadingMessages(false);
    setInitialMessagesLoad(false);
  }
};

  
    
  //! LOAD FILES FOR CHOSEN CONVERSATION:
  const loadConversationFiles = async (conversationId) => {
    const token = access_token;
        
    if (!token) {
      console.error('No access token found');
      return;
    }
    try {
      // ✅ USING CENTRALIZED API
      const data = await chatAPI.getConversationFiles(conversationId);
            
      if (data.success && data.data?.files) {
        setConversationFiles(data.data.files);
      } else {
        setConversationFiles([]);
      }
    } catch (error) {
      console.error('Error loading files:', error);
      setConversationFiles([]);
    }
  };

    
  //! load messages and files when selected conversation changes:
  useEffect(() => {
  const conversationId = selectedConversation?.id;

  if (!conversationId) {
    setMessages([]);
    setConversationFiles([]);
    return;
  }

  console.log(
    "SELECTED CONVERSATION CHANGED:",
    conversationId
  );

  loadMessages(conversationId);
  loadConversationFiles(conversationId);

  if (wsClient) {
    wsClient.joinConversation(conversationId);
  }

}, [selectedConversation?.id]);
    
  //! scroll to bottom on new message:
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
    
  //! Clean up all typing timeouts
  useEffect(() => {
    return () => {
      if (window.typingTimeouts) {
        Object.values(window.typingTimeouts).forEach(timeout => {
          clearTimeout(timeout);
        });
        window.typingTimeouts = {};
      }
    };
  }, []);

  //! HANDLE NEW MESSAGE:
  const handleNewMessage = (data) => {
      
    if (data.message && selectedConversation && data.conversation_id === selectedConversation.id) {
      setMessages(prev => {
        // Check for duplicates more thoroughly
        const isDuplicate = prev.some(msg =>
          msg.id === data.message.id ||
          (msg.content === data.message.content &&
            msg.sender_id === data.message.sender_id &&
            Math.abs(new Date(msg.created_at).getTime() - new Date(data.message.created_at).getTime()) < 1000)
        );
              
        if (isDuplicate) {
          return prev;
        }
        return [...prev, data.message];
      });
      loadConversations();
          
          
      // Load files if needed
      if (data.message.file_url) {
        loadConversationFiles(selectedConversation.id);
      }
    } else if (data.message && data.conversation_id !== selectedConversation?.id) {
      // Message in another conversation
      console.log('Message in other conversation, updating list');
      loadConversations();
    }
  };
    
  //! handle message edited:
  const handleMessageEdited = (data) => {
    if (data.message && selectedConversation && data.conversation_id === selectedConversation.id) {
      setMessages(prev =>
        prev.map(msg => msg.id === data.message.id ? data.message : msg)
      );
    }
  };
    
  //! handle user typing:
  const handleUserTyping = (data) => {
    if (selectedConversation && data.conversation_id === selectedConversation.id && data.user_id !== userId) {
      setIsTyping(prev => ({
        ...prev,
        [data.user_id]: {
          isTyping: data.is_typing,
          userName: data.user_name || `User ${data.user_id}`
        }
      }));
    
      const timeoutKey = `typing_${data.user_id}`;
      if (window.typingTimeouts) {
        clearTimeout(window.typingTimeouts[timeoutKey]);
      } else {
        window.typingTimeouts = {};
      }
        
      if (data.is_typing) {
        window.typingTimeouts[timeoutKey] = setTimeout(() => {
          setIsTyping(prev => ({
            ...prev,
            [data.user_id]: { ...prev[data.user_id], isTyping: false }
          }));
        }, 3000);
      }
    }
  };
    
  //! handle user online:
  const handleUserOnline = (data) => {
    setOnlineUsers(prev => new Set([...prev, data.user_id]));
  };
    
  //! handle user offline:
  const handleUserOffline = (data) => {
    setOnlineUsers(prev => {
      const newSet = new Set(prev);
      newSet.delete(data.user_id);
      return newSet;
    });
  };
    
  //! delete message:
  const deleteMessage = async (message) => {
    setDeletedMessage(message);
    setShowDeleteModal(true);
        
  }
    
  //! handle delete message:
  const handleDeleteMessage = async () => {
    setLoading(true);
    const token = access_token;
        
    if (!token) {
      console.error('No access token found');
      return;
    }
    try {
      // ✅ USING CENTRALIZED API
      const data = await chatAPI.deleteMessage(selectedConversation?.id, deletedMessage?.id);
            
      if (data.success) {
        setMessages(prev => prev.filter(msg => msg.id !== deletedMessage.id));
        loadConversations();
        setShowDeleteModal(false);
        toast.success('Message deleted successfully');

      } else {
        throw new Error(data.message || "Failed to delete message");
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Failed to delete message');

    } finally {
      setLoading(false);
    }
  };

    
  //! mark conversation as read:
  const markConversationAsRead = async (conversationId) => {
    const token = access_token;
        
    if (!token) {
      console.error('No access token found');
      return;
    }
    try {
      // ✅ USING CENTRALIZED API
      const data = await chatAPI.markConversationRead(conversationId);
      if (!data.success) {
        throw new Error(data.message || "Failed to mark conversation as read");
      }

            
    } catch (error) {
      console.error('Error marking conversation as read:', error);
      throw error;
    }
  };

    
  //! handle selected conversation:
const handleSelectConversation = (conversation) => {
  if (!conversation?.id) return;

  console.log("CLICKED CONVERSATION:", conversation.id);

  setMessages([]);
  setConversationFiles([]);
  setInitialMessagesLoad(true);
  setSelectedConversation(conversation);
};
    
  //! handle notification:
  const handleCreateNotification = async (title = "", msg = "", type = "system", isRead = false, user_id = null) => {
    const newNotification = {
      user_id: user_id,
      title: title,
      message: msg,
      type: type,
      isRead: isRead
    };
      
    try {
      // ✅ USING CENTRALIZED API
      await notificationAPI.create(newNotification);

          
      
      throw new Error('Failed to create notification');
      
    } catch (error) {
      console.error("Failed to create notification:", error);
      // Fallback to local creation
      toast.error('notification not created')
    }
  };
    
    
  //! handle send message:
  const handleSendMessage = async (messageContent, file = null) => {
  const conversationId = selectedConversation?.id;
  

  if (!conversationId) {
    toast.error("Select a conversation first");
    return;
  }

  if (!file && !messageContent?.trim()) {
    return;
  }

  setLoading(true);

  try {
    let data;

    if (file) {
      data = await chatAPI.uploadFile(
        conversationId,
        file,
        messageContent?.trim() || "Sent a file"
      );
    } else {
      console.log("STEP 3: Calling chatAPI.sendMessage");
      data = await chatAPI.sendMessage(
        conversationId,
        messageContent.trim()
      );
    }

    const savedMessage = data?.data?.message;

    if (!data?.success || !savedMessage?.id) {
      throw new Error(data?.message || "Backend did not return the saved message");
    }

    setMessages((prev) => {
      const exists = prev.some(
        (message) => String(message.id) === String(savedMessage.id)
      );

      if (exists) {
        return prev;
      }

      return [...prev, savedMessage];
    });

    await loadConversations();

    if (file) {
      await loadConversationFiles(conversationId);
    }
  } catch (error) {
    console.error("Error sending message:", error);

    toast.error(
      error?.response?.data?.message ||
      error?.message ||
      "Failed to send message"
    );
  } finally {
    setLoading(false);
  }
};


  //! handle typing:
  const handleTyping = (conversationId) => {
    if (wsClient && conversationId) {
      wsClient.handleTyping(conversationId);
    }
  };
    
  //! handle create conversation:
  const handleCreateConversation = async () => {
    if (selectedParticipants.length === 0) {
      toast.error('Please select at least one participant');
      return;
    }
        
    setLoading(true);
    const token = access_token;
        
    if (!token) {
      console.error('No access token found');
      setLoading(false);
      return;
    }
        
    try {
      const participantIds = selectedParticipants.map(p => p.id);
            
      if (conversationType === 'direct' && participantIds.length !== 1) {
        toast.error('Direct messages can only have one other participant');
        setLoading(false);
        return;
      }
            
      // ✅ USING CENTRALIZED API
      let data;
      if (conversationType === 'direct') {
        data = await chatAPI.createDirectConversation(participantIds[0]);
      } else {
        data = await chatAPI.createGroupConversation(newConversationName, participantIds);
      }
            
      if (data.success && data.data?.conversation) {
        const newConversation = data.data.conversation;
        const convName = getConversationName(data.data.conversation);
        handleCreateNotification(
          `New conversation was created by ${user?.firstName} ${user?.lastName}`,
          `You were added to a new conversation: ${convName} by ${user?.firstName} ${user?.lastName}.`,
          "system",
          false,
          selectedConversation.participants?.find(u => u.id !== userId)?.id
        );
        setConversations(prev => [newConversation, ...prev]);
        setSelectedConversation(newConversation);
        setShowCreateModal(false);
        resetModal();
                
        // Load messages for the new conversation
        await loadMessages(newConversation.id);
        await loadConversationFiles(newConversation.id);
                
        // Show success alert
        toast.success('Conversation created successfully');
      } else {
        throw new Error(data.message || "Failed to create conversation");
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast.error(error.message || 'Failed to create conversation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetModal = () => {
    setNewConversationName('');
    setSelectedParticipants([]);
    setConversationType('direct');
  };
    
    
  const toggleParticipant = (usr) => {
    setSelectedParticipants(prev => {
      const isSelected = prev.some(p => p.id === usr.id);
      if (isSelected) {
        return prev.filter(p => p.id !== usr.id);
      } else {
        return [...prev, usr];
      }
    });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getTypingDisplay = () => {
    const typingUsers = Object.entries(isTyping)
      .filter(([uid, data]) => data.isTyping && parseInt(uid) !== userId)
      .map(([uid, data]) => data.userName || `User ${uid}`);
        
    if (typingUsers.length === 0) return null;
    if (typingUsers.length === 1) return `${typingUsers[0]} is typing...`;
    return `${typingUsers.length} people are typing...`;
  };

  const getConversationName = (conversation) => {
    if (conversation.name) return conversation.name;
    if (conversation.conversation_type === 'direct') {
      const otherParticipants = conversation.participants?.filter(p => p.id !== userId);
      return otherParticipants?.map(p => `${p.firstName || p.first_name} ${p.lastName || p.last_name}`).join(', ') || 'Direct Message';
    }
    return 'Group Chat';
  };

  const formatMessageContent = (content) => {
    if (!content) return '';
        
    // Only process if content contains time placeholders like [14:30]
    const timePattern = /\[(\d{1,2}:\d{2})\]/g;
        
    if (timePattern.test(content)) {
      const convertToAmPm = (time24) => {
        const [hours, minutes] = time24.split(':');
        let hour = parseInt(hours, 10);
        const minute = minutes;
                
        const period = hour >= 12 ? 'PM' : 'AM';
        hour = hour % 12 || 12;
                
        return `${hour}:${minute} ${period}`;
      };
            
      let formattedContent = content.replace(/\[(\d{1,2}:\d{2})\]/g, (match, time24) => {
        return convertToAmPm(time24);
      });
            
      formattedContent = formattedContent.replace(/(\d{1,2}:\d{2}\s*(?:AM|PM)?)/gi, '<span className="inline-block px-2 py-0.5 mx-1 text-xs font-semibold bg-green-500/20 text-green-400 rounded-full border border-green-500/30">$1</span>');
            
      return <span dangerouslySetInnerHTML={{ __html: formattedContent }} />;
    }
        
    // Return original content if no time placeholders found
    return content;
  };
    
  const formatT = (content) => {
    if (!content) return '';
        
    // Only process if content contains time placeholders like [14:30]
    const timePattern = /\[(\d{1,2}:\d{2})\]/g;
        
    if (timePattern.test(content)) {
      const convertToAmPm = (time24) => {
        const [hours, minutes] = time24.split(':');
        let hour = parseInt(hours, 10);
        const minute = minutes;
                
        const period = hour >= 12 ? 'PM' : 'AM';
        hour = hour % 12 || 12;
                
        return `${hour}:${minute} ${period}`;
      };
            
      let formattedContent = content.replace(/\[(\d{1,2}:\d{2})\]/g, (match, time24) => {
        return convertToAmPm(time24);
      });
      return formattedContent;
    }
  }
    
  // Format timestamp based on sender's timezone and display in current user's timezone
  const formatMessageTime = (timestamp, senderTimezone, currentUserTimezone = 'UTC') => {
    if (!timestamp) return '';
        
    try {
      // Convert the timestamp from sender's timezone to current user's timezone
      const date = new Date(timestamp);
            
      // Format in current user's local timezone
      const now = new Date();
      const isToday = date.toDateString() === now.toDateString();
            
      if (isToday) {
        return date.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });
      } else {
        return date.toLocaleDateString('en-US', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }) + ' ' + date.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });
      }
    } catch (error) {
      console.error('Error formatting message time:', error);
      return '';
    }
  };
    
  // Get current user's timezone (you might want to get this from user settings)
  const getCurrentUserTimezone = () => {
    // You can get this from user profile, localStorage, or default to browser timezone
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  };

  const startEditMessage = (message) => {
    setEditingMessageId(message.id);
    setEditingContent(message.content);
  };

  const cancelEditMessage = () => {
    setEditingMessageId(null);
    setEditingContent('');
  };
    
  //! Update message function
  const handleUpdate = (message) => {
    startEditMessage(message);
  };
    
  //! Delete message function
  const handleDelete = (message) => {
    deleteMessage(message);
  };

  const saveEditMessage = async (messageId) => {
    if (!editingContent.trim()) return;

    try {
      // ✅ USING CENTRALIZED API
      const data = await chatAPI.editMessage(selectedConversation.id, messageId, editingContent);

      if (data.success && data.data.message) {
        setMessages(prev =>
          prev.map(msg => msg.id === messageId ? data.data.message : msg)
        );
        setEditingMessageId(null);
        setEditingContent('');
      }
    } catch (error) {
      console.error('Error editing message:', error);
    }
  };

  const getFileIcon = (fileType) => {
    if (fileType?.startsWith('image/')) return <Image size={20} className="text-blue-400" />;
    if (fileType === 'application/pdf') return <FileText size={20} className="text-red-400" />;
    return <File size={20} className="text-gray-400" />;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  //! Whiteboard
  const WhiteboardModal = () => {
      
    if (!showWhiteboardModal || !selectedConversation || !userId || !wsClient) {
      // console.log('WhiteboardModal not showing due to missing:', {
      //     showWhiteboardModal,
      //     selectedConversation: !!selectedConversation,
      //     userId,
      //     wsClient: !!wsClient
      // });
      return null;
    }
      
    const handleBackgroundClick = (e) => {
      // Check if clicking on the background overlay
      if (e.target.className?.includes && e.target.className.includes('fixed inset-0')) {
        setShowWhiteboardModal(false);
      }
    };
    return (
      <div
        style={{ zIndex: 99999999999999 }}
        className="fixed inset-0  bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center"
        onClick={handleBackgroundClick}
      >
        {/* Close Button */}
        <button
          onClick={() => setShowWhiteboardModal(false)}
          className="absolute top-4 left-4 z-50 p-3 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-300 transition-all duration-200 group"
        >
          <X size={24} className="group-hover:rotate-90 transition-transform duration-200" />
        </button>
          
        {/* Title */}
        <div className="absolute top-4 left-4 z-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {getConversationName(selectedConversation).split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
              </span>
            </div>
            <div>
              <h2 className="text-white font-bold text-xl">
                Whiteboard: {getConversationName(selectedConversation)}
              </h2>
              <p className="text-gray-400 text-sm">
                Real-time collaborative drawing with {selectedConversation.participants?.length} participants
              </p>
            </div>
          </div>
        </div>
          
        {/* Painting Board */}
        <div className="w-full h-full pt-16 pb-4 px-4">
          <div className="w-full h-full rounded-2xl overflow-hidden border border-gray-800 bg-[#0f0f0f]">
            <PaintingBoard
              conversationId={selectedConversation.id}
              currentUserId={userId}
              wsClient={wsClient}
            />
          </div>
        </div>
          
        {/* Quick Actions Bar */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 p-2 bg-gray-900/80 backdrop-blur-lg rounded-2xl border border-gray-800">
          <button
            onClick={() => setShowWhiteboardModal(false)}
            className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 transition-all duration-200 flex items-center gap-2"
          >
            <X size={16} />
            <span>Close</span>
          </button>
          <button
            onClick={() => {
              // You could add share functionality here
              navigator.clipboard.writeText(window.location.href);
              toast.success('Whiteboard link copied!');
            }}
            className="px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white transition-all duration-200 flex items-center gap-2"
          >
            <ShareIcon size={16} />
            <span>Share</span>
          </button>
        </div>
      </div>
    );
  };
    
    
  return (
    <div className="chat-app   flex relative font-sans">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />
        <div className="absolute top-1/4 left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute top-1/3 -right-10 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>
            
      {/* <AnimatedNotification
              autoGenerate={true}
              maxNotifications={3}
              variant="glass"
              position="top-right"
              showAvatars={true}
              allowDismiss={true}
              customMessages={["Welcome!", "Task completed!"]}
              onNotificationClick={(notification) => console.log(notification)}
            /> */}
      {/* Create Conversation Modal */}
      {showCreateModal && (
        <div style={{ zIndex: 999999999999999 }} className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a1a] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto border border-gray-800">
            <div className="sticky top-0 bg-[#1a1a1a]/95 backdrop-blur-xl border-b border-gray-800 p-6 rounded-t-2xl">
              <h2 className="text-2xl font-bold text-white">
                Create New Conversation
              </h2>
            </div>
                        
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-3">
                  Conversation Type
                </label>
                <select
                  value={conversationType}
                  onChange={(e) => setConversationType(e.target.value)}
                  className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-800 rounded-xl text-white focus:outline-none focus:border-[#c1ff72] transition-all duration-300"
                >
                  <option value="direct">Direct Message</option>
                  <option value="group">Group Chat</option>
                </select>
              </div>

              {conversationType === 'group' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-3">
                    Group Name
                  </label>
                  <input
                    type="text"
                    value={newConversationName}
                    onChange={(e) => setNewConversationName(e.target.value)}
                    placeholder="Enter group name"
                    className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#c1ff72] transition-all duration-300"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-3">
                  {conversationType === 'direct' ? 'Select Participant' : 'Select Participants'}
                </label>
                <div className="w-full" data-aos='fade' data-aos-delay="500" style={{ zIndex: 99999999999999 }}>
                  {/* Search Bar */}
                  <div className="flex-1 my-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="Search user or conversation..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 bg-gray-700 border-gray-600 text-white w-full"
                        style={{ minWidth: '200px' }}
                      />
                    </div>
                  </div>
                  {selectedParticipants.length > 0 && (
                    <div className="bg-gray-900 rounded-xl p-4 border border-gray-800 mb-2">
                      <span className="text-sm font-semibold text-gray-300">Selected: </span>
                      <span className="text-sm text-gray-400">
                        {selectedParticipants.map(p => `${p.firstName} ${p.lastName}`).join(', ')}
                      </span>
                    </div>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto bg-[#0f0f0f] rounded-xl border border-gray-800">
                  {users
                    .filter(u => u.id !== userId)
                    .map(u => (
                      <div
                        key={u.id}
                        className={`flex items-center p-4 cursor-pointer transition-all duration-300 border-b border-gray-800 last:border-b-0 hover:bg-gray-900 group ${selectedParticipants.some(p => p.id === u.id)
                          ? 'bg-[#c1ff72]/10 border-l-4 border-l-[#c1ff72]'
                          : ''
                          }`}
                        onClick={() => {
                          if (conversationType === 'direct') {
                            setSelectedParticipants([u]);
                          } else {
                            toggleParticipant(u);
                          }
                        }}
                      >
                        <div className="w-12 h-12 rounded-full bg-linear-to-br from-gray-700 to-gray-800 flex items-center justify-center text-white font-bold text-sm mr-4">
                          <img
                            className="rounded-full h-full w-full"
                            alt="user"
                            src={
                              u?.profilePicture ? `${API_BASE_URL}/${u.profilePicture}`
                                : "/default-user.jpeg"
                            }
                          />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-white">{u.firstName} {u.lastName}</div>
                          <div className="text-sm text-gray-400">{u.email}</div>
                        </div>
                        <div className="text-xs px-3 py-1 flex flex-col">
                          {u.timezone && u.timezone === getCurrentUserTimezone() && (
                            <div className="text-xs w-30 text-black bg-white px-3 flex items-center justify-center rounded-full mb-2">

                              {u.timezone}
                            </div>
                          )}
                          <div className="text-xs w-30 text-black bg-white px-3 flex items-center justify-center rounded-full">
                            {u.role ? u.role : <small style={{ fontSize: '10px' }}>No role</small>}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

                            
            </div>
            <div className="p-6 border-t border-gray-800">
            <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl border border-blue-500/20 p-4">
              <h3 className="text-white font-semibold mb-2">Discover New People</h3>
              <p className="text-gray-400 text-sm mb-4">
                Expand your network and connect with amazing people.
              </p>
              <a
                href="/discover-users"
                className="inline-flex items-center justify-center w-full px-4 py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/25"
              >
                Explore Users
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
            </div>
          </div>
            <div className="sticky bottom-0 bg-[#1a1a1a]/95 backdrop-blur-xl border-t border-gray-800 p-6 rounded-b-2xl flex gap-3 justify-end">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-6 rounded-md h-10 hover:scale-102 hover:shadow-[0px_0px_10px_red] bg-red-400 text-red-950 cursor-pointer font-semibold transition-all duration-400"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateConversation}
                disabled={selectedParticipants.length === 0}
                className="px-6  rounded-md h-10 hover:scale-102 hover:shadow-[0px_0px_10px_white] bg-white text-black cursor-pointer font-semibold transition-all duration-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Conversation
              </button>
            </div>
            
          </div>
          
        </div>
      )}
            
      {showDeleteModal && (
        <div style={{ zIndex: 99999999999999 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="animate-in fade-in-90 zoom-in-95 duration-200">
            <div className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700 overflow-hidden">
              {/* Header with Warning Icon */}
              <div className="p-6 border-b border-gray-800">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/30">
                    <RiDeleteBin6Line size={24} className="text-red-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white mb-1">Delete Message</h2>
                    <p className="text-gray-400 text-sm">This action cannot be undone.</p>
                  </div>
                </div>
              </div>
                            
              {/* Warning Message */}
              <div className="p-4 bg-red-500/5 border-l-4 border-red-500 mx-6 mt-4 rounded-r-lg">
                <div className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <p className="text-red-400 text-sm font-medium">Warning: This will permanently delete the message.</p>
                </div>
              </div>
            
              {/* Actions */}
              <div className="p-6 flex gap-3 justify-end">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-6 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold transition-all duration-200 border border-gray-600 hover:border-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteMessage}
                  className="px-6 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold transition-all duration-200 shadow-lg hover:shadow-red-500/25 transform hover:scale-105"
                >
                  Delete Message
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
            
      <WhiteboardModal />
            
      {/* Main Chat Container */}
      <div style={{ zIndex: 9999 }} className="flex flex-col md:flex-row relative w-full h-screen overflow-hidden">
        {/* Sidebar - Hidden on mobile, visible on medium+ */}
        <div className="hidden md:flex flex-shrink-0 w-full md:w-80 lg:w-80 h-screen border-r border-gray-900 flex-col ">
          {/* User Header */}
          <div className="p-4 border-b border-gray-900">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-linear-to-br from-blue-300 to-purple-300 flex items-center justify-center border-blue-400 border-2 text-black font-bold">
                    <img
                      className="rounded-full h-full w-full object-cover"
                      alt="user"
                      src={user?.profile?.picture || "/default-user.jpeg"}
                    />
                  </div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0f0f0f]"></div>
                </div>
                <div className="min-w-0">
                  <div className="text-white font-semibold truncate">
                    {users.find(u => u.id === userId)?.firstName} {users.find(u => u.id === userId)?.lastName}
                  </div>
                  <div className="text-xs text-gray-400 truncate">
                    {users.find(u => u.id === userId)?.email}
                  </div>
                </div>
              </div>
            </div>
                  
            <div data-aos='fade' data-aos-delay="300" className="w-full">
              <ShineButton
                className="rounded-md flex gap-2 w-full items-center justify-center text-white"
                label="New Chat"
                icon={<Plus size={18} className="hover:animate-pulse" />}
                size="sm"
                bgColor="linear-gradient(325deg, #f09220 0%, #ffcf7d 55%, #f09220 90%)"
                onClick={() => setShowCreateModal(true)}
              />
            </div>
                  
            <div className="w-full" data-aos='fade' data-aos-delay="500">
              {/* Search Bar */}
              <div className="flex-1 my-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search user or conversation..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 bg-gray-700 border-blue-400 border text-white w-full"
                  />
                </div>
              </div>
            </div>
          </div>
              
          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto" data-aos='fade' data-aos-delay="700">
            <AnimatePresence mode="wait">
              {loading && initialConversationsLoad ? (
                <div className="flex flex-col gap-6 p-4">
                  {[...Array(3)].map((_, i) => (
                    <ConversationsCardSkeleton key={i} />
                  ))}
                </div>
              ) : (
                <motion.div
                  layout
                  className="flex flex-col gap-1 p-2"
                >
                  {conversations.map(conversation => (
                    <div
                      key={conversation.id}
                      className={`flex items-center p-3 cursor-pointer transition-all duration-200 rounded-lg hover:bg-gray-900 ${selectedConversation?.id === conversation.id
                        ? 'bg-gray-900 border-l-4 border-l-blue-300'
                        : ''
                        }`}
                      onClick={() => handleSelectConversation(conversation)}
                      onMouseEnter={() => setHoveredConversationId(conversation.id)}
                      onMouseLeave={() => setHoveredConversationId(null)}
                    >
                      <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm mr-3 ${selectedConversation?.id === conversation.id
                        ? 'bg-linear-to-br from-blue-300 to-purple-300 text-black'
                        : 'bg-gray-800 text-gray-300'
                        }`}>
                        <img
                          className="rounded-full border border-blue-300 h-full w-full object-cover"
                          alt="user"
                          src={
                            conversation.participants.find((u) => u.id !== userId)?.profilePicture || "/default-user.jpeg"
                          }
                        />
                      </div>
                      <div className="relative flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="font-semibold text-white truncate text-sm">
                            {getConversationName(conversation)}
                          </div>
                          {conversation.unread_count > 0 && (
                            <Badge
                              className="ml-2 shadow-md shadow-indigo-100 text-black text-xs font-bold py-0.5 h-5 min-w-5 rounded-full px-1 font-mono tabular-nums animate-bounce"
                              variant="secondary"
                            >
                              {conversation.unread_count}
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-gray-400 truncate">
                          {formatMessageContent(conversation.last_message?.content) || 'No messages yet'}
                        </div>
                        {conversation.conversation_type === "group" && (
                          <div className="flex -space-x-2 -bottom-2 absolute right-0">
                            {/* Show first 3 participants (excluding current user) */}
                            {conversation.participants
                              .filter(participant => participant.id !== userId) // Filter out current user
                              .slice(0, 3) // Take only first 3
                              .map((participant, index) => (
                                <Avatar
                                  key={participant.id}
                                  className="size-6 border-2 border-[#0f0f0f]"
                                  style={{ zIndex: 3 - index }} // Ensure proper stacking
                                >
                                  <AvatarImage
                                    src={participant.profilePicture || "/default-user.jpeg"}
                                    alt={`${participant.firstName} ${participant.lastName}`}
                                    className="object-cover"
                                  />
                                  <AvatarFallback>
                                    {participant.firstName?.[0] || ''}{participant.lastName?.[0] || ''}
                                  </AvatarFallback>
                                </Avatar>
                              ))}
                                    
                            {/* Show +X if there are more than 3 participants */}
                            {conversation.participants.filter(p => p.id !== userId).length > 3 && (
                              <div className="size-6 rounded-full bg-gray-800 border-2 border-[#0f0f0f] flex items-center justify-center text-xs text-gray-400 font-semibold">
                                +{conversation.participants.filter(p => p.id !== userId).length - 3}
                              </div>
                            )}
                                    
                            {/* Show current user's avatar if they're the only one in group */}
                            {conversation.participants.filter(p => p.id !== userId).length === 0 && (
                              <Avatar className="size-6 border-2 border-[#0f0f0f]">
                                <AvatarImage
                                  src={user?.profile?.picture || "/default-user.jpeg"}
                                  alt="You"
                                />
                                <AvatarFallback>YOU</AvatarFallback>
                              </Avatar>
                            )}
                          </div>
                        )}
                              
                        {hoveredConversationId === conversation.id && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectConversation(conversation);
                              setShowWhiteboardModal(true);
                            }}
                            className={`${conversation.conversation_type === "group" ? "right-16" : "right-2"} absolute flex justify-center items-center h-7 w-7 -bottom-2 transform  p-2 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 hover:from-blue-500/30 hover:to-purple-500/30 text-blue-400 transition-all duration-200`}
                                  
                                  
                            title="Open Whiteboard"
                          >
                            {/* <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg> */}
                            <LuPresentation />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
              
        {/* Mobile Header - Only shown on mobile */}
        {/* <div className="md:hidden flex items-center justify-between p-4 border-b border-gray-900 ">
                <button
                  onClick={() => setShowWhiteboardModal(true)}
                  className="p-3 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white"
                  disabled={!selectedConversation}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
                <button
                  onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
                  className="p-2 rounded-lg bg-gray-800 text-gray-300"
                >
                  <Menu size={20} />
                </button>
                {selectedConversation ? (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center font-bold text-white">
                      {getConversationName(selectedConversation).split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white truncate max-w-[150px]">
                        {getConversationName(selectedConversation)}
                      </h3>
                    </div>
                  </div>
                ) : (
                  <div className="text-white font-bold">Messages</div>
                )}
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="p-2 rounded-lg bg-gray-800 text-gray-300"
                >
                  <Plus size={20} />
                </button>
              </div> */}
              
        <div className="md:hidden flex items-center justify-between p-4 border-b border-gray-900">
          <button
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            className="p-2 rounded-lg bg-gray-800 text-gray-300"
          >
            <Menu size={20} />
          </button>
                
          {/* Title in middle */}
          {selectedConversation ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center font-bold text-white">
                {getConversationName(selectedConversation).split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
              </div>
              <div>
                <h3 className="text-sm font-bold text-white truncate max-w-[150px]">
                  {getConversationName(selectedConversation)}
                </h3>
              </div>
            </div>
          ) : (
            <div className="text-white font-bold">Messages</div>
          )}
                
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowWhiteboardModal(true)}
              className="p-3 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!selectedConversation}
              title="Whiteboard"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="p-2 rounded-lg bg-gray-800 text-gray-300"
            >
              <Plus size={20} />
            </button>
          </div>
        </div>

        {/* Mobile Sidebar Overlay */}
        {isMobileSidebarOpen && (
          <div
            className="md:hidden fixed inset-0 bg-black/70 z-50"
            onClick={() => setIsMobileSidebarOpen(false)}
          >
            <div
              className="absolute left-0 top-0 h-full w-4/5 max-w-sm bg-[#0f0f0f] border-r border-gray-900"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Mobile Sidebar Content - Same as desktop but with close button */}
              <div className="p-4 border-b border-gray-900">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-linear-to-br from-blue-300 to-purple-300 flex items-center justify-center border-blue-400 border-2 text-black font-bold">
                        <img
                          className="rounded-full h-full w-full object-cover"
                          alt="user"
                          src={user?.profile?.picture || "/default-user.jpeg"}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="text-white font-semibold">
                        {user?.firstName} {user?.lastName}
                      </div>
                      <div className="text-xs text-gray-400 truncate">
                        {user?.email}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsMobileSidebarOpen(false)}
                    className="p-2 rounded-lg bg-gray-800 text-gray-300"
                  >
                    <X size={20} />
                  </button>
                </div>
                      
                {/* Search in mobile sidebar */}
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 bg-gray-700 border-blue-400 border text-white w-full"
                  />
                </div>
              </div>
                    
              {/* Mobile conversations list */}
              <div className="overflow-y-auto h-[calc(100%-140px)]">
                {conversations.map(conversation => (
                  <div
                    key={conversation.id}
                    className={`flex items-center p-3 cursor-pointer transition-all duration-200 border-b border-gray-900 hover:bg-gray-900 ${selectedConversation?.id === conversation.id
                      ? 'bg-gray-900 border-l-4 border-l-blue-300'
                      : ''
                      }`}
                    onClick={() => {
                      handleSelectConversation(conversation);
                      setIsMobileSidebarOpen(false);
                    }}
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm mr-3 ${selectedConversation?.id === conversation.id
                      ? 'bg-linear-to-br from-blue-300 to-purple-300 text-black'
                      : 'bg-gray-800 text-gray-300'
                      }`}>
                      <img
                        className="rounded-full border border-blue-300 h-full w-full object-cover"
                        alt="user"
                        src={
                          conversation.participants.find((u) => u.id !== userId)?.profilePicture || "/default-user.jpeg"
                        }
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-white truncate text-sm mb-1">
                        {getConversationName(conversation)}
                      </div>
                      <div className="text-xs text-gray-400 truncate">
                        {formatMessageContent(conversation.last_message?.content) || 'No messages yet'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
              
        {/* Main Chat Area */}
        <div className={`flex-1 flex  flex-col h-full ${selectedConversation ? '' : 'items-center justify-center'} `}>
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="bg-[#0f0f0f] border-b border-gray-900 p-4 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center font-bold text-white">
                      {getConversationName(selectedConversation).split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-lg font-bold text-white truncate">
                        {getConversationName(selectedConversation)}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <span>{selectedConversation.participants?.length} members</span>
                        {selectedConversation.participants?.some(p => onlineUsers.has(p.id.toString())) && (
                          <span className="flex items-center gap-1 text-green-500">
                            <Circle size={6} className="fill-green-500" />
                            Online
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Mobile Menu Button */}
                    <button
                      onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
                      className="md:hidden p-3 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-300"
                    >
                      <Users size={20} />
                    </button>
                    <div className="hidden md:flex items-center gap-2">
                      {/* Whiteboard Button  */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => setShowWhiteboardModal(true)}
                            className="p-3 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-blue-500/25"
                            disabled={!selectedConversation}
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" arrowColor="bg-gray-800 fill-gray-800" className="max-w-xs bg-gray-800 fill-gray-800 border-gray-600 text-white">
                          <p>Open Whiteboard</p>
                        </TooltipContent>
                      </Tooltip>
                            
                      <button
                        onClick={() => toast.info('Voice call coming soon!')}
                        className="p-3 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-400 transition-all duration-200 cursor-not-allowed"
                        title="Voice call (Coming soon)"
                      >
                        <Phone size={20} />
                      </button>
                      <button
                        onClick={() => toast.info('Video call coming soon!')}
                        className="p-3 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-400 transition-all duration-200 cursor-not-allowed"
                        title="Video call (Coming soon)"
                      >
                        <Video size={20} />
                      </button>
                      <button className="p-3 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-300 transition-all duration-200">
                        <Star size={20} />
                      </button>
                      <button className="p-3 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-300 transition-all duration-200">
                        <Search size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Messages Area */}
              <div className={`flex-1 overflow-y-auto p-4 md:p-6 space-y-4 `}>
                {loadingMessages && initialMessagesLoad ? (
                  <div className="flex flex-col gap-6">
                    {[...Array(3)].map((_, i) => (
                      <MessagesSkeleton key={i} />
                    ))}
                  </div>
                ) : messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <MessageCircle size={64} className="mx-auto mb-4 text-gray-700" />
                      <p className="text-gray-500 text-lg">No messages yet. Start the conversation!</p>
                    </div>
                  </div>
                ) : (
                   messages.map((message, index) => {
  const senderId =
    message.sender_id ??
    message.sender?.id;

  const previousMessage = messages[index - 1];

  const previousSenderId =
    previousMessage?.sender_id ??
    previousMessage?.sender?.id;

  const isOwn =
    String(senderId) === String(userId);

  const showAvatar =
    index === 0 ||
    String(previousSenderId) !== String(senderId);

  return (
    <MessageBubble
      key={message.id}
      message={message}
      isOwn={isOwn}
      showAvatar={showAvatar}
      showSenderName={selectedConversation?.conversation_type === "group"}
      setMessages={setMessages}
      conversationId={selectedConversation.id}
      conversationType={selectedConversation.conversation_type}
      currentUserId={userId}
      onMessageUpdated={(updatedMessage) => {
        setMessages((prev) =>
          prev.map((item) =>
            String(item.id) === String(updatedMessage.id)
              ? updatedMessage
              : item
          )
        );
      }}
      variant="page"
    />
  );
})
                )}
                <div ref={messagesEndRef} />
                      
                {getTypingDisplay() && (
                  <div className="flex items-center gap-3 px-4 py-3 bg-[#1a1a1a] rounded-2xl border border-gray-800 max-w-fit">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
                      <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></span>
                      <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></span>
                    </div>
                    <span className="text-sm text-gray-400 italic">{getTypingDisplay()}</span>
                  </div>
                )}
              </div>
              
              {/* Message Input */}
              <div className="sticky bottom-0 p-4  border-t border-gray-900 flex-shrink-0">
                <TimeAwareMessageInput
                  onSend={handleSendMessage}
                  onTyping={handleTyping}
                  conversationId={selectedConversation?.id}
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-4">
              <div className="text-center space-y-6 max-w-md">
                <div className="w-24 h-24 mx-auto bg-gray-900 rounded-3xl flex items-center justify-center">
                  <MessageCircle size={48} className="text-gray-700" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Welcome to Chat</h2>
                  <p className="text-gray-500 mb-6">Select a conversation or create a new one to start chatting</p>
                  <Button
                    onClick={() => setShowCreateModal(true)}
                    className="px-6 py-3 md:px-8 md:py-4 rounded-md bg-white hover:shadow-[0px_0px_10px_white] text-black font-semibold transition-all duration-300"
                  >
                    Start New Conversation
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
              
        {/* Right Sidebar - Members & Files */}
        {selectedConversation && (
          <div className="relative">
            {/* Mobile Overlay Sidebar */}
            {isRightSidebarOpen && (
              <div
                className="md:hidden fixed inset-0  z-50"
                onClick={() => setIsRightSidebarOpen(false)}
              >
                <div
                  className="absolute right-0 top-0 h-full w-4/5 max-w-sm  border-l border-gray-900"
                  onClick={(e) => e.stopPropagation()}
                >
                  <RightSidebarContent
                    selectedConversation={selectedConversation}
                    users={users}
                    userId={userId}
                    onlineUsers={onlineUsers}
                    conversationFiles={conversationFiles}
                    showFilesExpanded={showFilesExpanded}
                    setShowFilesExpanded={setShowFilesExpanded}
                    showLinksExpanded={showLinksExpanded}
                    setShowLinksExpanded={setShowLinksExpanded}
                    onClose={() => setIsRightSidebarOpen(false)}
                  />
                </div>
              </div>
            )}
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="absolute left-0 top-14 -translate-x-1/2 z-10 p-2 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-400 transition-all duration-300 border border-gray-700"
              title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <ChevronRight size={16} className={isSidebarCollapsed ? '' : 'rotate-180'} />
            </button>
            {/* Desktop Right Sidebar */}
            <div className={`hidden relative md:flex flex-shrink-0 w-80 lg:w-80 border-l border-gray-900  flex-col overflow-y-auto transition-all duration-300 ${isSidebarCollapsed ? 'w-0 opacity-0' : 'w-80 lg:w-80 opacity-100'
              }`}>
              <RightSidebarContent
                selectedConversation={selectedConversation}
                users={users}
                userId={userId}
                onlineUsers={onlineUsers}
                conversationFiles={conversationFiles}
                showFilesExpanded={showFilesExpanded}
                setShowFilesExpanded={setShowFilesExpanded}
                showLinksExpanded={showLinksExpanded}
                setShowLinksExpanded={setShowLinksExpanded}
                isSidebarCollapsed={isSidebarCollapsed}
                setIsSidebarCollapsed={setIsSidebarCollapsed}
              />
            </div>
          </div>
        )}
      </div>
      {/* Debug Controls
            {process.env.NODE_ENV === 'development' && selectedConversation && (
                <div className="fixed bottom-4 left-4 flex gap-2 z-50">
                    <button 
                        onClick={() => {
                            handleUserTyping({
                                conversation_id: selectedConversation?.id,
                                user_id: 12,
                                user_name: 'Jane Smith',
                                is_typing: true
                            });
                        }}
                        className="px-4 py-2 rounded-xl bg-red-500/90 hover:bg-red-600 text-white text-sm font-medium transition-all duration-200 backdrop-blur-xl"
                    >
                        Test Typing
                    </button>
                    <button 
                        onClick={() => {
                            handleUserTyping({
                                conversation_id: selectedConversation?.id,
                                user_id: 12,
                                user_name: 'Jane Smith', 
                                is_typing: false
                            });
                        }}
                        className="px-4 py-2 rounded-xl bg-red-500/90 hover:bg-red-600 text-white text-sm font-medium transition-all duration-200 backdrop-blur-xl"
                    >
                        Test Stop Typing
                    </button>
                </div>
            )} */}

            {imagePreview && (
              <div
                className="fixed inset-0 z-[9999] bg-black/80"
                onClick={() => setImagePreview(null)}
              >
                <div
                  className="absolute top-0 left-0 right-0 flex items-center justify-between p-3"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => downloadViaBlob(imagePreview.url, imagePreview.name)}
                    className="p-2 rounded-xl bg-black/40 text-white hover:bg-black/60"
                    title="Download"
                  >
                    <Download size={20} />
                  </button>

                  <button
                    type="button"
                    onClick={() => setImagePreview(null)}
                    className="p-2 rounded-xl bg-black/40 text-white hover:bg-black/60"
                    title="Close"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="w-full h-full flex items-center justify-center p-6">
                  <img
                    src={imagePreview.url}
                    alt={imagePreview.name}
                    className="max-h-[90vh] max-w-[95vw] object-contain rounded-2xl"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
            )}

    </div>
  )
};

export default ChatComponent;

