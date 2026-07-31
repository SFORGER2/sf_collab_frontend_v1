import { useState, useEffect } from 'react';
import { X, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import followAPI from '../utils/APIs/followAPI';
import UserCard from "./pages/connections/UserCard";
import { Button } from '@/components/ui/button';
import InfiniteList from './InfiniteList';
import usePaginatedFetch from '@/utils/hooks/usePaginated';

export function FollowersModal({
  isOpen,
  onClose,
  userId,
  type = 'followers', // 'followers' or 'following'
}) {
  const [title, setTitle] = useState(type === 'followers' ? 'Followers' : 'Following');

  const {
    items,
    loading,
    targetRef,
    hasMore,
  } = usePaginatedFetch({
    fetchFn: async ({ page }) => {
      const response = type === 'followers'
        ? await followAPI.getFollowers(userId, { page })
        : await followAPI.getFollowing(userId, { page });
      const data = response.data.data || response.data;
      const list = type === 'followers' ? data.followers : data.following;
      return {
        data: {
          users: list || [],
          pagination: data.pagination || { total: 0, per_page: 10, pages: 1 },
        },
      };
    },
    objectKey: 'users',
    enabled: isOpen && !!userId,
  });

  useEffect(() => {
    if (!isOpen) return;
    setTitle(type === 'followers' ? 'Followers' : 'Following');
  }, [type, isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center p-3.5 sm:p-4 border-b border-zinc-800">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-blue-400 shrink-0" />
                <h3 className="text-base sm:text-lg font-semibold">{title}</h3>
              </div>
              <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-white hover:bg-zinc-800 rounded-full focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500">
                <X size={18} />
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2">
              <InfiniteList
                items={items}
                renderItem={(user) => (
                  <UserCard
                    key={user.id}
                    user={user}
                    actions={null}
                    onClick={() => {
                      onClose();
                      // navigate to user profile
                      window.location.href = `/user-profile?userId=${user.id}`;
                    }}
                  />
                )}
                sentinelRef={targetRef}
                loading={loading}
                emptyText={`No ${type === 'followers' ? 'followers' : 'following'} yet.`}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}