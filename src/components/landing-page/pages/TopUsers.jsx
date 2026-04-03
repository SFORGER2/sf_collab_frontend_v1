import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Zap, Users, ArrowRight } from 'lucide-react';
import { usersAPI } from '@/utils/APIs/userAPI';
import { useNavigate } from 'react-router-dom';
import { getProfilePicture } from '@/utils/getProfilePicture';

const API_HOST = import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, "") || 'http://localhost:5000';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function TopUsers() {
  const [topUsers, setTopUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchTopUsers() {
      try {
        const response = await usersAPI.getTopUsers();
        console.log('Fetched top users:', response);
        setTopUsers(response.data.users || []);
      } catch (error) {
        console.error('Error fetching top users:', error);
        setTopUsers([]);
      } finally {
        setLoading(false);
      }
    }
    fetchTopUsers();
  }, []);


  const getRankColor = (index) => {
    if (index === 0) return 'from-yellow-500 to-orange-500';
    if (index === 1) return 'from-gray-400 to-gray-500';
    if (index === 2) return 'from-orange-600 to-orange-700';
    return 'from-blue-500 to-purple-500';
  };

  const getRankBadge = (index) => {
    if (index === 0) return <Trophy className="w-5 h-5 text-yellow-400" />;
    if (index === 1) return <Trophy className="w-5 h-5 text-gray-300" />;
    if (index === 2) return <Trophy className="w-5 h-5 text-orange-600" />;
    return <span className="text-lg font-bold text-blue-400">#{index + 1}</span>;
  };

  return (
    <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 py-20 px-6 lg:px-20">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-4 mb-16"
      >
        <div className="flex items-center justify-center gap-2 mb-4">
          <Zap className="w-6 h-6 text-yellow-400" />
          <span className="text-sm font-semibold text-yellow-400 uppercase tracking-wider">
            Community Leaders
          </span>
          <Zap className="w-6 h-6 text-yellow-400" />
        </div>
        <h2 className="text-4xl lg:text-5xl font-bold text-white tracking-tight">
          Top Contributors
        </h2>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
          Meet our most active members elevating the SForger community. Earn XP, climb the leaderboard, and become a community leader.
        </p>
      </motion.div>

      {/* Top Users Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
        </div>
      ) : topUsers.length > 0 ? (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        >
          {topUsers.slice(0, 8).map((user, index) => {
            const initials = `${user.first_name?.charAt(0) || ''}${user.last_name?.charAt(0) || ''}`.toUpperCase();

            return (
              <motion.div key={user.id} variants={itemVariants}>
                <Card
                  onClick={() => navigate(`/login`)}
                  className="group relative h-full overflow-hidden bg-slate-800/40 backdrop-blur-xl 
                             border border-slate-700/50 hover:border-blue-500/50 rounded-xl
                             transition-all duration-300 hover:-translate-y-2 cursor-pointer
                             hover:shadow-xl hover:shadow-blue-500/20"
                >
                  {/* Rank Badge */}
                  <div
                    className={`absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center 
                               bg-gradient-to-br ${getRankColor(index)} shadow-lg`}
                  >
                    {getRankBadge(index)}
                  </div>

                  {/* Hover Gradient */}
                  <div
                    className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-purple-600/0 to-pink-500/0 
                               group-hover:from-blue-500/5 group-hover:via-purple-600/5 group-hover:to-pink-500/5 
                               transition-all duration-300"
                  />

                  <div className="relative p-6 flex flex-col h-full text-center">
                    {/* Avatar */}
                    <motion.div
                      whileHover={{ scale: 1.08 }}
                      className="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden bg-gradient-to-br 
                                 from-blue-500 to-purple-600 ring-2 ring-slate-700 shadow-lg flex-shrink-0"
                    >

                        <img
                          src={getProfilePicture(user)}
                          alt={`${user.firstName} ${user.lastName}`}
                          className="w-full h-full object-cover"
                        />

                    </motion.div>

                    {/* Name */}
                    <h3 className="text-lg font-semibold text-white group-hover:text-blue-300 transition-colors truncate">
                      {`${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User'}
                    </h3>

                    {/* XP Badge */}
                    <Badge className="mx-auto mt-3 bg-blue-500/20 text-blue-300 border-blue-400/30 font-semibold">
                      <Zap className="w-3 h-3 mr-1" />
                      {user.xp_points || 0} XP
                    </Badge>

                    {/* Stats */}
                    <div className="flex items-center justify-center gap-3 text-xs text-slate-400 mt-4 py-3 border-t border-slate-700">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        Contributor
                      </span>
                    </div>

                    {/* CTA Button */}
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/login`);
                      }}
                      className="mt-auto w-full text-xs bg-gradient-to-r from-blue-600 to-purple-600 
                               hover:from-blue-700 hover:to-purple-700 text-white rounded-lg
                               transition-all duration-300 group-hover:shadow-lg group-hover:shadow-blue-500/30"
                    >
                      View Profile
                      <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      ) : null}

      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative rounded-2xl bg-gradient-to-r from-blue-600/20 to-purple-600/20 
                   border border-blue-500/30 p-8 lg:p-12 text-center overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-transparent" />
        <div className="relative space-y-4">
          <h3 className="text-2xl lg:text-3xl font-bold text-white">
            Ready to Climb the Leaderboard?
          </h3>
          <p className="text-gray-300 max-w-2xl mx-auto mb-6">
            Contribute to projects, share knowledge, build connections, and earn XP. Every interaction counts toward your profile and journey in the SForger community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              onClick={() => navigate('/login')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 
                       text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300
                       hover:shadow-lg hover:shadow-blue-500/30"
            >
              Explore Opportunities
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/login')}
              className="border-blue-500/50 text-blue-300 hover:bg-blue-600/10 px-8 py-3 rounded-lg font-semibold"
            >
              Join a Startup
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}