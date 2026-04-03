import React, { useState, useEffect, useRef } from "react";
import {
  Bell,
  BellOff,
  CheckCircle,
  AlertCircle,
  Info,
  X,
  Filter,
  Search,
  Clock,
  User,
  MessageSquare,
  TrendingUp,
  Building2,
  Settings,
  MoreVertical,
  Plus,
  Archive,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  Mail,
  Shield,
  Zap,
  Calendar,
  Download,
  Upload,
  Send,
} from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from "react-redux";
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../ui/sheet';
import { Textarea } from '../ui/textarea';
import { ScrollArea } from '../ui/scroll-area';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import LoadingSpinner from "../LoadingSpinner";
// ✅ FIX: import shared context so the page and bell stay in sync
import { useNotifications as useNotificationsContext } from '../../contexts/NotificationContext';



const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Notifications = () => {
  const dispatch = useDispatch();
  const { user, access_token } = useSelector((state) => state.auth);
  
  // ✅ FIX: pull markAllAsRead and unread count from the shared context.
  // This means when this page opens the bell badge also drops to 0 instantly.
  const {
    markAllAsRead: markAllAsReadContext,
    unreadCount: contextUnreadCount,
    refresh: refreshContext,
  } = useNotificationsContext();

  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingNotification, setEditingNotification] = useState(null);
  const [deletingNotification, setDeletingNotification] = useState(null);

  // New notification form state
  const [newNotification, setNewNotification] = useState({
    title: "",
    message: "",
    type: "system",
    isRead: false,
    data: {}
  });

  // Fetch notifications with fetch API
  const fetchNotifications = async () => {
    const token = access_token;
    if (!token) return;

    try {
      const response = await fetch(`${BASE_URL}/notifications`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // Debug log to see the actual response structure
      // console.log('Notifications API Response:', result);
      
      // The API returns { data: { notifications: [...] } }
      const notificationsData = result.data?.notifications || [];
      setNotifications(notificationsData);
      
    } catch (error) {
      // console.error("Failed to fetch notifications:", error);
      // Fallback to user relationships if API fails
      if (user?.relationships?.notifications) {
        setNotifications(user?.relationships?.notifications);
      }
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
  }, [access_token, user]);

  // ✅ FIX: Auto-mark ALL notifications as read the moment this page opens.
  // markAllAsReadContext() is optimistic — the bell badge drops to 0 immediately.
  // The backend call and socket emit happen in the background.
  useEffect(() => {
    if (access_token) {
      markAllAsReadContext();
      // Also update local state so the unread dots disappear in the list
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true, is_read: true })));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [access_token]);

  // Real-time updates polling with fetch
  useEffect(() => {
    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000); // Poll every 30 seconds

    return () => clearInterval(interval);
  }, [access_token]);

  // Update form when editing
  useEffect(() => {
    if (editingNotification) {
      setNewNotification({
        title: editingNotification.title,
        message: editingNotification.message,
        type: editingNotification.type,
        isRead: editingNotification.isRead,
        data: editingNotification.data || {}
      });
    } else {
      setNewNotification({
        title: "",
        message: "",
        type: "system",
        isRead: false,
        data: {}
      });
    }
  }, [editingNotification]);

  // Filter notifications based on active tab and search
  const filteredNotifications = notifications.filter((notification) => {
    const matchesSearch = searchQuery === "" ||
      notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = selectedFilter === "all" || 
      notification.type === selectedFilter;

    const matchesTab = activeTab === "all" || 
      (activeTab === "unread" && !notification.isRead);

    return matchesSearch && matchesFilter && matchesTab;
  });

  // ✅ FIX: use contextUnreadCount from shared context so the page header
  // badge matches the bell badge exactly, without needing a page refresh.
  const unreadCount = contextUnreadCount;
  const totalCount = notifications.length;

  // Notification actions with fetch
  const handleMarkAsRead = async (id) => {
    try {
      const response = await fetch(`${BASE_URL}/notifications/${id}/read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // ✅ FIX: set both is_read (backend) and isRead (legacy page state)
        setNotifications(prev => prev.map(n => 
          n.id === id ? { ...n, is_read: true, isRead: true, readAt: new Date().toISOString() } : n
        ));
      } else {
        throw new Error('Failed to mark as read');
      }
    } catch (error) {
      console.error("Failed to mark as read:", error);
      // Fallback to local update
      setNotifications(prev => prev.map(n => 
        n.id === id ? { ...n, is_read: true, isRead: true, readAt: new Date().toISOString() } : n
      ));
    }
  };

  const handleMarkAsUnread = async (id) => {
    try {
      const response = await fetch(`${BASE_URL}/notifications/${id}/unread`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setNotifications(prev => prev.map(n => 
          n.id === id ? { ...n, isRead: false, readAt: null } : n
        ));
      } else {
        throw new Error('Failed to mark as unread');
      }
    } catch (error) {
      console.error("Failed to mark as unread:", error);
      setNotifications(prev => prev.map(n => 
        n.id === id ? { ...n, isRead: false, readAt: null } : n
      ));
    }
  };

  const handleDeleteNotification = async (id) => {
    try {
      const response = await fetch(`${BASE_URL}/notifications/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${access_token}`,
        },
      });

      if (response.ok) {
        setNotifications(prev => prev.filter(n => n.id !== id));
        setDeletingNotification(null);
      } else {
        throw new Error('Failed to delete notification');
      }
    } catch (error) {
      console.error("Failed to delete notification:", error);
      setNotifications(prev => prev.filter(n => n.id !== id));
      setDeletingNotification(null);
    }
  };

  const handleCreateNotification = async () => {
    try {
      const response = await fetch(`${BASE_URL}/notifications`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newNotification),
      });

      if (response.ok) {
        const result = await response.json();
        setNotifications(prev => [result.data?.notification, ...prev]);
        setShowCreateModal(false);
        setNewNotification({
          title: "",
          message: "",
          type: "system",
          isRead: false,
          data: {}
        });
      } else {
        throw new Error('Failed to create notification');
      }
    } catch (error) {
      console.error("Failed to create notification:", error);
      // Fallback to local creation
      const tempNotification = {
        ...newNotification,
        id: Date.now(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        user: user,
        isRecent: true
      };
      setNotifications(prev => [tempNotification, ...prev]);
      setShowCreateModal(false);
      setNewNotification({
        title: "",
        message: "",
        type: "system",
        isRead: false,
        data: {}
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      // ✅ FIX: use shared context — single API call, optimistic badge update,
      // and socket emission to sync the bell badge instantly.
      await markAllAsReadContext();
      // Also update the local list so unread dots disappear
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true, is_read: true })));
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-400" />;
      case "urgent":
        return <Shield className="h-5 w-5 text-red-400" />;
      case "suggestion":
        return <TrendingUp className="h-5 w-5 text-purple-300" />;
      default:
        return <Bell className="h-5 w-5 text-blue-300" />;
    }
  };

  const getNotificationBorder = (type) => {
    switch (type) {
      case "system":
        return "border-l-blue-300";
      case "suggestion":
        return "border-l-purple-300";
      case "urgent":
        return "border-l-red-400";
      case "welcome":
        return "border-l-green-400";
      default:
        return "border-l-gray-400";
    }
  };

  const getNotificationBadge = (type) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full";
    switch (type) {
      case "system":
        return `${baseClasses} bg-blue-500/10 text-blue-300 border border-blue-300/20`;
      case "suggestion":
        return `${baseClasses} bg-purple-500/10 text-purple-300 border border-purple-300/20`;
      case "urgent":
        return `${baseClasses} bg-red-500/10 text-red-300 border border-red-300/20`;
      case "welcome":
        return `${baseClasses} bg-green-500/10 text-green-300 border border-green-300/20`;
      default:
        return `${baseClasses} bg-gray-500/10 text-gray-300 border border-gray-300/20`;
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  // Debug: Log current state
  // console.log('Current notifications:', notifications);
  // console.log('Filtered notifications:', filteredNotifications);
  // console.log('Loading state:', loading);

  if (loading) {
    return (
      <LoadingSpinner
        title="Syncing notifications…"
        message="Just a moment while we pull the latest activity for you."
      />
    
    );
  }

  return (
    <div className="min-h-screen text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <Card className="bg-transparent border-zinc-800 shadow-none mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Bell className="h-8 w-8 text-blue-300" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-gradient-to-r from-blue-300 to-purple-300 text-black text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
                    Notifications
                  </h1>
                  <p className="text-gray-400 text-sm">
                    {unreadCount} unread of {totalCount} total
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Button
                  onClick={handleMarkAllAsRead}
                  variant="outline"
                  className="border-blue-300/50 text-blue-300 hover:bg-blue-500/20"
                  disabled={unreadCount === 0}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark All Read
                </Button>
                
                {/* <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-blue-300 to-purple-300 text-black hover:from-blue-400 hover:to-purple-400">
                      <Plus className="h-4 w-4 mr-2" />
                      New Notification
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-md">
                    <DialogHeader>
                      <DialogTitle className="bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
                        {editingNotification ? 'Edit Notification' : 'Create Notification'}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <Input
                        placeholder="Title"
                        value={newNotification.title}
                        onChange={(e) => setNewNotification(prev => ({ ...prev, title: e.target.value }))}
                        className="bg-zinc-800 border-zinc-700 text-white"
                      />
                      <Textarea
                        placeholder="Message"
                        value={newNotification.message}
                        onChange={(e) => setNewNotification(prev => ({ ...prev, message: e.target.value }))}
                        className="bg-zinc-800 border-zinc-700 text-white min-h-[100px]"
                      />
                      <select
                        value={newNotification.type}
                        onChange={(e) => setNewNotification(prev => ({ ...prev, type: e.target.value }))}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white"
                      >
                        <option value="system">System</option>
                        <option value="suggestion">Suggestion</option>
                        <option value="urgent">Urgent</option>
                        <option value="welcome">Welcome</option>
                      </select>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="unread"
                          checked={!newNotification.isRead}
                          onChange={(e) => setNewNotification(prev => ({ ...prev, isRead: !e.target.checked }))}
                          className="rounded border-zinc-700 bg-zinc-800"
                        />
                        <label htmlFor="unread" className="text-sm text-gray-300">
                          Mark as unread
                        </label>
                      </div>
                    </div>
                    <DialogFooter className="mt-6">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowCreateModal(false);
                          setEditingNotification(null);
                        }}
                        className="border-zinc-700 text-gray-300"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleCreateNotification}
                        className="bg-gradient-to-r from-blue-300 to-purple-300 text-black"
                      >
                        {editingNotification ? 'Update' : 'Create'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog> */}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <Card className="bg-transparent border-zinc-800 shadow-none lg:col-span-1">
            <CardContent className="p-6">
              <div className="space-y-6">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search notifications..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-400"
                  />
                </div>

                {/* Tabs */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">View</h3>
                  {[
                    { key: "all", label: "All Notifications", count: totalCount },
                    { key: "unread", label: "Unread", count: unreadCount },
                  ].map((tab) => {
                    const isActive = activeTab === tab.key;
                    return (
                      <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 ${
                          isActive
                            ? "bg-gradient-to-r from-blue-300/20 to-purple-300/20 border border-blue-300/30"
                            : "hover:bg-white/5 border border-transparent"
                        }`}
                      >
                        <span className={`text-sm font-medium ${isActive ? 'text-white' : 'text-gray-300'}`}>
                          {tab.label}
                        </span>
                        {tab.count > 0 && (
                          <Badge variant="outline" className={`${
                            isActive 
                              ? 'bg-gradient-to-r from-blue-300 to-purple-300 text-black border-transparent' 
                              : 'bg-zinc-800 text-gray-300 border-zinc-700'
                          }`}>
                            {tab.count}
                          </Badge>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Filters */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Filters</h3>
                  {[
                    { key: "all", label: "All Types", icon: Bell },
                    { key: "system", label: "System", icon: Settings },
                    { key: "suggestion", label: "Suggestions", icon: TrendingUp },
                    { key: "urgent", label: "Security", icon: Shield },
                  ].map((filter) => {
                    const Icon = filter.icon;
                    const isActive = selectedFilter === filter.key;
                    const count = filter.key === "all" 
                      ? totalCount 
                      : notifications.filter(n => n.type === filter.key).length;
                    
                    return (
                      <button
                        key={filter.key}
                        onClick={() => setSelectedFilter(filter.key)}
                        className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 ${
                          isActive
                            ? "bg-gradient-to-r from-blue-300/20 to-purple-300/20 border border-blue-300/30"
                            : "hover:bg-white/5 border border-transparent"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={`h-4 w-4 ${isActive ? 'text-blue-300' : 'text-gray-400'}`} />
                          <span className={`text-sm font-medium ${isActive ? 'text-white' : 'text-gray-300'}`}>
                            {filter.label}
                          </span>
                        </div>
                        {count > 0 && (
                          <Badge variant="outline" className={`${
                            isActive 
                              ? 'bg-gradient-to-r from-blue-300 to-purple-300 text-black border-transparent' 
                              : 'bg-zinc-800 text-gray-300 border-zinc-700'
                          }`}>
                            {count}
                          </Badge>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Content */}
          <Card className="bg-transparent border-zinc-800 shadow-none lg:col-span-3">
            <CardContent className="p-6">
              <ScrollArea className="h-[600px]">
                <AnimatePresence>
                  {filteredNotifications.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-12"
                    >
                      <BellOff className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-400 mb-2">
                        {searchQuery || selectedFilter !== "all" || activeTab !== "all"
                          ? "No notifications found"
                          : "All caught up!"}
                      </h3>
                      <p className="text-sm text-gray-500 mb-4">
                        {searchQuery || selectedFilter !== "all" || activeTab !== "all"
                          ? "Try adjusting your search or filters"
                          : "You're all caught up! Check back later for updates."}
                      </p>
                      {(searchQuery || selectedFilter !== "all" || activeTab !== "all") && (
                        <Button
                          onClick={() => {
                            setSearchQuery("");
                            setSelectedFilter("all");
                            setActiveTab("all");
                          }}
                          variant="outline"
                          className="border-blue-300/50 text-blue-300 hover:bg-blue-500/20"
                        >
                          Clear filters
                        </Button>
                      )}
                    </motion.div>
                  ) : (
                    <div className="space-y-3">
                      {filteredNotifications.map((notification) => (
                        <motion.div
                          key={notification.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className={`group p-4 rounded-xl border-l-4 transition-all duration-200 hover:bg-white/5 ${
                            getNotificationBorder(notification.type)
                          } ${!notification.isRead ? "bg-white/5" : ""}`}
                        >
                          <div className="flex items-start gap-4">
                            {/* Unread Indicator */}
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-gradient-to-r from-blue-300 to-purple-300 rounded-full mt-2 flex-shrink-0" />
                            )}
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <h3 className="font-semibold text-white text-sm">
                                    {notification.title}
                                  </h3>
                                  <Badge className={getNotificationBadge(notification.type)}>
                                    {notification.type}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-1">
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => 
                                            notification.isRead 
                                              ? handleMarkAsUnread(notification.id)
                                              : handleMarkAsRead(notification.id)
                                          }
                                          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                          {notification.isRead ? (
                                            <EyeOff className="h-4 w-4 text-gray-400" />
                                          ) : (
                                            <Eye className="h-4 w-4 text-blue-300" />
                                          )}
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        {notification.isRead ? "Mark as unread" : "Mark as read"}
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>

                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                      >
                                        <MoreVertical className="h-4 w-4 text-gray-400" />
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-sm">
                                      <DialogHeader>
                                        <DialogTitle>Notification Actions</DialogTitle>
                                      </DialogHeader>
                                      <div className="space-y-2">
                                        {/* <Button
                                          variant="ghost"
                                          className="w-full justify-start text-blue-300 hover:bg-blue-500/20"
                                          onClick={() => {
                                            setEditingNotification(notification);
                                            setShowCreateModal(true);
                                          }}
                                        >
                                          <Edit className="h-4 w-4 mr-2" />
                                          Edit
                                        </Button> */}
                                        <Button
                                          variant="ghost"
                                          className="w-full justify-start text-purple-300 hover:bg-purple-500/20"
                                          onClick={() => 
                                            notification.isRead 
                                              ? handleMarkAsUnread(notification.id)
                                              : handleMarkAsRead(notification.id)
                                          }
                                        >
                                          {notification.isRead ? (
                                            <EyeOff className="h-4 w-4 mr-2" />
                                          ) : (
                                            <Eye className="h-4 w-4 mr-2" />
                                          )}
                                          {notification.isRead ? "Mark as unread" : "Mark as read"}
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          className="w-full justify-start text-red-300 hover:bg-red-500/20"
                                          onClick={() => setDeletingNotification(notification)}
                                        >
                                          <Trash2 className="h-4 w-4 mr-2" />
                                          Delete
                                        </Button>
                                      </div>
                                    </DialogContent>
                                  </Dialog>
                                </div>
                              </div>
                              
                              <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                                {notification.message}
                              </p>
                              
                              <div className="flex items-center justify-between text-xs text-gray-400">
                                <div className="flex items-center gap-4">
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    <span>{formatTime(notification.createdAt)}</span>
                                  </div>
                                  {notification.user && (
                                    <div className="flex items-center gap-1">
                                      <User className="h-3 w-3" />
                                      <span>{notification.user?.firstName} {notification.user?.lastName}</span>
                                    </div>
                                  )}
                                </div>
                                {notification.isRecent && (
                                  <Badge variant="outline" className="bg-green-500/10 text-green-300 border-green-300/20">
                                    New
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </AnimatePresence>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingNotification} onOpenChange={() => setDeletingNotification(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-300">Delete Notification</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-300">
              Are you sure you want to delete this notification?
            </p>
            {deletingNotification && (
              <div className="bg-zinc-800 rounded-lg p-3 border border-zinc-700">
                <p className="font-medium text-white text-sm">{deletingNotification.title}</p>
                <p className="text-gray-400 text-xs mt-1 line-clamp-2">{deletingNotification.message}</p>
              </div>
            )}
          </div>
          <DialogFooter className="mt-6">
            <Button
              variant="outline"
              onClick={() => setDeletingNotification(null)}
              className="border-zinc-700 text-gray-300"
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleDeleteNotification(deletingNotification.id)}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Notifications;