import { withSampleFallback } from '@/services/mock/people';
import React, { useState, useMemo } from 'react';
// `motion` was used 16 times in this file but never imported, so the component
// threw `motion is not defined` on first render and React unmounted the whole
// tree — which is why the page was blank rather than merely broken.
import { AnimatePresence, motion } from 'framer-motion';
import { Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import ShinyText from "../ui/ShinyText";
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { usersAPI } from '@/utils/APIs/userAPI';
import FilterSidebar from './FilterSidebar';
import UserCard from './UserCard';
import { chatAPI } from '@/utils/APIs/chatApi';
import { useNavigate, Link } from "react-router-dom";
import { ConnectionButton } from '@/components/connection/ConnectionButton';
import { getProfilePicture } from '@/utils/getProfilePicture';
import usePaginatedFetch from '@/utils/hooks/usePaginated';
import InfiniteList from '@/components/InfiniteList';
import EmptyState from '../common/EmptyState';

const API_URL = import.meta.env.VITE_API_URL || "/api";

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
  return String(pic).startsWith("http") ? pic : `${API_URL}${pic}`;
};

const DiscoverUsers = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);

  const { user, access_token } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  // Build search filter string
  const searchFilter = useMemo(() => {
    const filters = [];
    if (searchQuery) filters.push(searchQuery);
    if (selectedRole) filters.push(`role:${selectedRole}`);
    if (selectedStatus) filters.push(`status:${selectedStatus}`);
    return filters.join(' ');
  }, [searchQuery, selectedRole, selectedStatus]);

  // Use paginated hook with infinite scroll
  const {
    items: users,
    total: totalUsers,
    loading,
    targetRef,
  } = usePaginatedFetch({
    fetchFn: ({ page, search }) =>
      usersAPI.getAll({
        page,
        per_page: 20,
        search,
      }),
    search: searchFilter,
    objectKey: 'users',
    enabled: !!access_token,
  });

  /**
   * Fall back to sample people when the API returns nothing.
   *
   * Without this the page is indistinguishable from broken whenever the
   * backend is down or the instance is new, and the ten-result credits gate
   * can never be seen at all. Labelled below, never silently blended.
   */
  const { items: shown, isSample } = withSampleFallback(users, { enabled: !loading });

  // Filter out current user
  const filteredUsers = shown.filter(u => u.id !== user?.id);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedRole("");
    setSelectedStatus("");
  };

  const activeFiltersCount = [
    selectedRole !== "",
    selectedStatus !== "",
    searchQuery !== ""
  ].filter(Boolean).length;

  const goToProfile = (userId) => {
    if (!userId) return;
    navigate(`/user-profile?userId=${userId}`);
  };

  const sendMessage = async () => {
    if (!messageText.trim()) {
      toast.warning('Please enter a message');
      return;
    }

    try {
      setSendingMessage(true);
      const response = await chatAPI.sendDirectMessage(
        selectedUser.id,
        messageText,
        access_token
      );

      if (response) {
        toast.success(
          <div className="flex items-center justify-between w-full">
            <span>Message sent successfully!</span>
            <button
              onClick={() =>
                (window.location.href = `/chat?conversationId=${response.conversation.id}`)
              }
              className="ml-4 px-3 py-1 bg-white text-blue-600 rounded text-sm font-medium hover:bg-gray-100"
            >
              Go to Chat
            </button>
          </div>,
          { autoClose: false }
        );
      }

      setMessageText("");
      setShowModal(false);
    } catch {
      toast.error('Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const roleOptions = ['admin', 'moderator', 'member', 'founder', 'investor'];
  const statusOptions = ['active', 'inactive', 'suspended'];
  const parseNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num;
  }
  return (
    <div className="min-h-screen">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-8 relative overflow-hidden"
        >
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute -top-20 -left-20 w-40 h-40 bg-linear-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-3xl"
            />
            <motion.div
              animate={{
                scale: [1.2, 1, 1.2],
                opacity: [0.4, 0.2, 0.4],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute -top-10 -right-10 w-32 h-32 bg-linear-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl"
            />
          </div>

          <motion.h1
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 leading-tight"
          >
            <span className="">
              <ShinyText
                text="Discover Amazing"
                disabled={false}
                speed={3}
              />
            </span>
            <br />
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
            >
              <ShinyText
                text="People & Innovators"
                disabled={false}
                speed={3}
              />
            </motion.span>
          </motion.h1>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-lg sm:text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed"
          >
            Connect with {totalUsers > 1000 ? `${parseNumber(totalUsers)} ` : "thousands of "} <span className="font-semibold text-white">innovators, founders, and creators</span>.
            Build your network and discover new opportunities.
          </motion.p>
        </motion.div>

        {/* Filters Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="md:hidden h-12 relative border-gray-600 bg-gray-800 text-gray-300 mb-4">
                <Filter className="w-5 h-5" />
                {activeFiltersCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 overflow-y-auto bg-gray-800 border-gray-700">
              <div className="space-y-6 pt-10">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-white">Filters</h3>
                  {activeFiltersCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="text-blue-400 hover:text-blue-300 text-xs">
                      Clear all
                    </Button>
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Search</h4>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Role</h4>
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger className="w-full bg-gray-700 border-gray-600 text-white">
                      <SelectValue placeholder="All Roles" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="" className="text-white hover:bg-gray-700">All Roles</SelectItem>
                      {roleOptions.map(role => (
                        <SelectItem key={role} value={role} className="text-white hover:bg-gray-700">
                          {role.charAt(0).toUpperCase() + role.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Status</h4>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="w-full bg-gray-700 border-gray-600 text-white">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="" className="text-white hover:bg-gray-700">All Status</SelectItem>
                      {statusOptions.map(status => (
                        <SelectItem key={status} value={status} className="text-white hover:bg-gray-700">
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="hidden md:block"
          >
            <FilterSidebar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedRole={selectedRole}
              setSelectedRole={setSelectedRole}
              selectedStatus={selectedStatus}
              setSelectedStatus={setSelectedStatus}
              clearFilters={clearFilters}
              activeFiltersCount={activeFiltersCount}
              roleOptions={roleOptions}
              statusOptions={statusOptions}
            />
          </motion.div> 
        </motion.div>

        {/* User Grid with Infinite Scroll */}
        {/* Say plainly when these aren't real people — someone would try to
            message them otherwise. */}
        {isSample && (
          <div
            className="mb-4 rounded-xl px-3.5 py-2.5 text-[0.83rem]"
            style={{
              background: 'rgba(255,191,94,0.08)',
              border: '1px solid rgba(255,191,94,0.28)',
              color: '#ffbf5e',
            }}
          >
            Showing sample profiles — the directory is empty or the backend is unreachable.
          </div>
        )}

        <AnimatePresence mode="wait">
          {loading && filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-400">Loading users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <EmptyState
              title="No candidates yet"
              description="Try adjusting your filters or search query to discover more people."
              buttonText="Clear all filters"
              onButtonClick={clearFilters}
              icon={Search}
            />
          ) : (
            <motion.div layout className="flex flex-col w-full items-center justify-center">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 w-full">
                <InfiniteList
                  items={filteredUsers}
                  renderItem={(userItem) => {
                    const avatarUrl = getAvatarUrl(userItem);
                    return (
                      <UserCard
  key={userItem.id}
  user={{
    ...userItem,
    profilePicture: avatarUrl,
    disableConnection: userItem.isSample === true,
  }}
  onOpen={(user) => {
    setSelectedUser(user);
    setShowModal(true);
  }}
/>
                    );
                  }}
                  sentinelRef={targetRef}
                  loading={loading}
                  emptyText="No users found"
                  containerClassName="w-full"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* User Detail Modal */}
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent className="max-w-md bg-gray-900 border-gray-800 text-white">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>{selectedUser?.fullName}</span>
              </DialogTitle>
            </DialogHeader>

            {selectedUser && (
              <div className="space-y-4 flex flex-col items-center justify-center">
                <Link to={`/user-profile?id=${selectedUser.id}`} className="w-full">
                  <div className="flex justify-center">
                    <img
                      src={getProfilePicture(selectedUser)}
                      alt={selectedUser.fullName}
                      className="w-24 h-24 rounded-full object-cover border-2 border-blue-500"
                    />
                  </div>
                </Link>

                <div className="space-y-2 text-sm w-full text-center">
                  <p><span className="font-semibold">Role:</span> {selectedUser.role}</p>
                  <p><span className="font-semibold">Status:</span> {selectedUser.status}</p>
                  {selectedUser.profile?.company && (
                    <p><span className="font-semibold">Company:</span> {selectedUser.profile.company}</p>
                  )}
                  {selectedUser.profile?.bio && (
                    <p><span className="font-semibold">Bio:</span> {selectedUser.profile.bio}</p>
                  )}
                  {selectedUser.active_startups_count !== 0 && (
                    <p>
                      <span className="font-semibold">Startups:</span>{" "}
                      {selectedUser.active_startups_count}
                    </p>
                  )}
                </div>

                <div className="grid w-full grid-cols-2 gap-2 pt-2 border-t border-gray-700">
                  <div className="text-center">
                    <p className="font-bold text-blue-400">{selectedUser.xp_points || 0}</p>
                    <p className="text-xs text-gray-400">XP Points</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-blue-400">{selectedUser.streak_days || 0}</p>
                    <p className="text-xs text-gray-400">Streak Days</p>
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={() => goToProfile(selectedUser.id)}
                  className="w-full bg-gray-800 hover:bg-gray-700 text-white"
                >
                  View Profile
                </Button>

                <div className="pt-2 border-t border-gray-700 w-full">
  {!selectedUser?.isSample && (
    <ConnectionButton
      userId={selectedUser.id}
      size="default"
      className="w-full"
    />
  )}
</div>

                <div className="space-y-2 pt-2 border-t w-full border-gray-700">
                  <label className="text-sm font-medium text-gray-300">Send a Message</label>
                  <textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Write your message..."
                    className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                    rows={3}
                  />
                </div>

                <Button
                  onClick={sendMessage}
                  disabled={sendingMessage || !messageText.trim()}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  {sendingMessage ? "Sending..." : "Send Message"}
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default DiscoverUsers;
