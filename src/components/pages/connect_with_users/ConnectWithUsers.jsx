/* eslint-disable no-unused-vars */
import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Users } from 'lucide-react';
import { Input } from '../../ui/input';
import { mockUsers } from './usersMock';
import UserCardSkeleton from './UserCardSkeleton';
import UserCard from './UserCard';
import { usersAPI } from '@/utils/APIs/userAPI';
import connectionAPI from '@/utils/APIs/connectionAPI';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};



const ConnectWithUsers = () => {
  const navigate = useNavigate();
  const { user, access_token } = useSelector((state) => state.auth);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  const itemsPerPage = 12;

  const fetchUsers = useCallback(async (page = 1, query = '') => {
    try {
      setLoading(true);

      const response = await usersAPI.getAll({ page, per_page: itemsPerPage, search: query }, access_token);

      if (response.success) {
        setUsers(response.data?.users || response.users || []);
        setTotalPages(Math.ceil((response.data?.total || response.total || 0) / itemsPerPage));
        setTotalUsers(response.data?.total || response.total || 0);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  }, [access_token]);

  useEffect(() => {
    fetchUsers(1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        fetchUsers(1, searchQuery);
      } else {
        fetchUsers(1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, fetchUsers]);

  const handleUserClick = (userId) => {
    navigate(`/user-profile/${userId}`);
  };

  const handleSendMessage = (userId, e) => {
    e.stopPropagation();
    navigate(`/messages/${userId}`);
  };

  const handleConnect = async (userId, e) => {
    e.stopPropagation();
    try {
      const response = await connectionAPI.sendRequest(userId);

      if (response.success) {
        fetchUsers(currentPage, searchQuery);
      }
    } catch (error) {
      console.error('Failed to connect:', error);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-600/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="mb-12">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 backdrop-blur-sm">
                <Users className="w-8 h-8 text-blue-400" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Connect with Users
                </h1>
                <p className="text-slate-400 mt-2">
                  Discover and collaborate with {totalUsers.toLocaleString()} members
                </p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-2xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <Input
                placeholder="Search by name, company, title, skills..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700 text-white placeholder:text-slate-500 text-base focus:border-blue-500/50 focus:bg-slate-800 transition-all"
              />
            </div>
          </motion.div>
        </div>

        {/* Results Info */}
        {(searchQuery || totalUsers > 0) && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8 flex items-center justify-between">
            <p className="text-slate-400 text-sm">
              {searchQuery ? (
                <span>
                  Found <span className="text-blue-400 font-semibold">{totalUsers}</span> results for "{searchQuery}"
                </span>
              ) : (
                <span>Showing all <span className="text-blue-400 font-semibold">{totalUsers}</span> registered users</span>
              )}
            </p>
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setCurrentPage(1);
                }}
                className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
              >
                Clear
              </button>
            )}
          </motion.div>
        )}

        {/* Users Grid */}
        {loading ? (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {Array.from({ length: itemsPerPage }).map((_, i) => (
                <UserCardSkeleton key={i} />
            ))}
          </motion.div>
        ) : users.length > 0 ? (
          <>
            <motion.div
              layout
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
            >
              {users.map((userItem, index) => (
                <UserCard
                  key={userItem.id}
                  user={userItem}
                  index={index}
                  onUserClick={handleUserClick}
                  onSendMessage={handleSendMessage}
                  onConnect={handleConnect}
                  currentUser={user}
                />
              ))}
            </motion.div>

            {/* Pagination */}
            {totalPages > 1 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-slate-800/50 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-slate-300 hover:text-white rounded-lg border border-slate-700 transition-all"
                >
                  Previous
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }).map((_, i) => {
                    const page = i + 1;
                    const isActive = page === currentPage;
                    const isNear = Math.abs(page - currentPage) <= 2;

                    if (!isNear && page !== 1 && page !== totalPages) return null;

                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-2 rounded-lg transition-all ${
                          isActive
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold'
                            : 'bg-slate-800/50 hover:bg-slate-700 text-slate-300 border border-slate-700'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-slate-800/50 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-slate-300 hover:text-white rounded-lg border border-slate-700 transition-all"
                >
                  Next
                </button>
              </motion.div>
            )}
          </>
) : (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
    <div className="inline-flex p-4 rounded-2xl bg-slate-800/50 border border-slate-700 mb-6">
      <Users className="w-12 h-12 text-slate-600" />
    </div>

    <h3 className="text-2xl font-semibold text-slate-300 mb-4">
      No suitable collaborators found.
    </h3>

    <p className="text-slate-400 mb-4">
      Try updating:
    </p>

    <div className="text-slate-500 space-y-2">
      <p>• Required Roles</p>
      <p>• Industry</p>
      <p>• Technology Stack</p>
    </div>
  </motion.div>
)}
      </div>
    </div>
  );
};





export default ConnectWithUsers;