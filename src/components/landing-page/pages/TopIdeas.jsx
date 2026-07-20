import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, Users, ArrowRight, Zap } from 'lucide-react';
import { ideaAPI } from '@/utils/APIs/ideaAPI';
import { useNavigate } from 'react-router-dom';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  hover: { y: -8, transition: { duration: 0.3 } },
};

export default function TopIdeas() {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTopIdeas = async () => {
      try {
        setLoading(true);
        const response = await ideaAPI.getTopIdeas();
        setIdeas(response.data.ideas|| []);
      } catch (error) {
        console.error('Error fetching top ideas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopIdeas();
  }, []);

  const handleIdeaClick = (ideaId) => {
    navigate(`/login`);
  };

  const handleGetInvolved = (e, ideaId) => {
    e.stopPropagation();
    navigate(`/login`);
  };

  return (
    <div className="relative py-20 px-6 lg:px-20 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 w-full">
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/30 mb-4">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-semibold text-purple-300">Featured Visions</span>
          </div>

          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight">
            Top Visions Gaining Momentum
          </h2>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            Discover innovative visions looking for talented collaborators. Join forces with creators and help bring the next big vision to life.
          </p>
        </motion.div>

        {/* Visions Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-96 bg-slate-700/30 rounded-2xl animate-pulse"
              />
            ))}
          </div>
        ) : ideas.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {ideas.map((idea) => (
              <motion.div
                key={idea.id}
                variants={cardVariants}
                whileHover="hover"
                onClick={() => handleIdeaClick(idea.id)}
                className="group relative h-full rounded-2xl overflow-hidden cursor-pointer bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 hover:border-purple-500/50 transition-all duration-300 shadow-lg hover:shadow-purple-500/20"
              >
                {/* Hover gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 via-transparent to-indigo-500/0 group-hover:from-purple-500/5 group-hover:via-transparent group-hover:to-indigo-500/5 transition-all duration-300" />

                <div className="relative p-6 flex flex-col h-full">
                  {/* Stage Badge */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex gap-2 flex-wrap">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        <Zap className="w-3 h-3 mr-1" />
                        {idea.stage?.charAt(0).toUpperCase() + idea.stage?.slice(1) || 'Vision'}
                      </span>
                      {idea.likes > 0 && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          {idea.likes} votes
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-purple-300 transition-colors">
                    {idea.title}
                  </h3>

                  {/* Industry Badge */}
                  {idea.industry && (
                    <p className="text-sm text-slate-400 mb-3 capitalize">
                      {idea.industry}
                    </p>
                  )}

                  {/* Description */}
                  <p className="text-slate-300 text-sm leading-relaxed mb-4 line-clamp-3 flex-grow">
                    {idea.description}
                  </p>

                  {/* Team Info */}
                  <div className="flex items-center gap-4 py-3 border-t border-slate-700/50 mb-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-purple-400" />
                      {idea.teamSize || 0} collaborators
                    </span>
                    <span className="flex items-center gap-1">
                      💬 {idea.commentsCount || 0} discussions
                    </span>
                  </div>

                  {/* Creator Info */}
                  {idea.creator && (
                    <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-700/50">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-white font-semibold text-xs">
                        {idea.creator.firstName?.charAt(0) || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">
                          {idea.creator.firstName} {idea.creator.lastName}
                        </p>
                        <p className="text-xs text-slate-400">Creator</p>
                      </div>
                    </div>
                  )}

                  {/* CTA Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={(e) => handleGetInvolved(e, idea.id)}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500 text-white font-semibold text-sm transition-all duration-300 shadow-lg hover:shadow-purple-500/30 flex items-center justify-center gap-2 group/btn"
                  >
                    Get Involved
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-12">
            <p className="text-slate-400 text-lg">No visions available yet. Be the first to share!</p>
          </div>
        )}

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 text-center"
        >
          <p className="text-slate-300 mb-6">
            Ready to share your own vision or find your next collaboration?
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/login')}
            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold shadow-lg hover:shadow-purple-500/30 transition-all duration-300"
          >
            Explore All Visions
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}