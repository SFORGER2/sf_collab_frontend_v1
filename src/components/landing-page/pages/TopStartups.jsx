import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { startupsAPI } from '@/utils/APIs/startupsAPI';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Briefcase, MapPin, Eye, TrendingUp, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { formatCurrency } from '@/lib/utils';
import { API_URL } from '@/utils/config';

const stageColors = {
  idea: 'bg-red-500/20 text-red-300',
  pre_seed: 'bg-orange-500/20 text-orange-300',
  seed: 'bg-yellow-500/20 text-yellow-300',
  series_a: 'bg-green-500/20 text-green-300',
  series_b: 'bg-blue-500/20 text-blue-300',
  series_c: 'bg-purple-500/20 text-purple-300',
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function TopStartups() {
  const [startups, setStartups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTopStartups = async () => {
      try {
        setLoading(true);
        const response = await startupsAPI.getTopStartups({
          page: 1,
          per_page: 3,
        });
        setStartups(response.data.startups || []);
      } catch (err) {
        console.error('Failed to fetch top startups:', err);
        setError('Failed to load startups');
      } finally {
        setLoading(false);
      }
    };

    fetchTopStartups();
  }, []);

  const formatViews = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const getStageBadge = (stage) => {
    const stageKey = stage?.toLowerCase().replace('-', '_') || 'idea';
    return stageColors[stageKey] || stageColors.idea;
  };

  const handleNavigation = (path) => {
    navigate(`/login?redirect=${encodeURIComponent(path)}`);
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 py-20 px-6 lg:px-20">
        <div className="text-center space-y-4">
          <div className="h-10 w-64 mx-auto bg-slate-700 rounded-lg animate-pulse" />
          <div className="h-6 w-80 mx-auto bg-slate-700 rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <section className="bg-gradient-to-b from-slate-900 to-slate-950 py-20 px-6 lg:px-20">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        variants={containerVariants}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center space-y-3 mb-16">
          <div className="flex items-center justify-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            <span className="text-sm font-semibold text-blue-400 uppercase tracking-widest">
              Featured Opportunities
            </span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-white tracking-tight">
            Top Startups <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Hiring Now</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Join innovative teams shaping the future. Explore open positions at high-growth startups and make an impact.
          </p>
        </motion.div>

        {/* Startups Grid */}
        {startups.length > 0 ? (
          <motion.div
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
          >
            {startups.map((startup, index) => (
              <motion.div key={startup.id} variants={itemVariants}>
                <div onClick={() => handleNavigation(`/startup-details/${startup.id}`)} className="cursor-pointer">
                  <Card className="group h-full overflow-hidden bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 hover:border-blue-500/30 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/10">
                    {/* Background Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-purple-600/0 to-pink-500/0 group-hover:from-blue-500/5 group-hover:via-purple-600/5 group-hover:to-pink-500/5 transition-all duration-300" />

                    {/* Banner */}
                    <div className="relative h-32 w-full overflow-hidden bg-gradient-to-br from-blue-600/20 to-purple-600/20">
                      {startup.banner_url ? (
                        <img
                          src={startup.banner_url.startsWith('http') ? startup.banner_url : `${API_URL}${startup.banner_url}`}
                          alt={startup.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
                    </div>

                    {/* Content */}
                    <div className="relative p-6 space-y-4">
                      {/* Logo */}
                      <div className="-mt-10 mb-4">
                        {startup.logo_url ? (
                          <img
                            src={startup.logo_url.startsWith('http') ? startup.logo_url : `${API_URL}${startup.logo_url}`}
                            alt={startup.name}
                            className="h-14 w-14 rounded-lg object-cover border-2 border-slate-800 bg-slate-700"
                          />
                        ) : (
                          <div className="h-14 w-14 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center border-2 border-slate-800">
                            <Briefcase className="w-7 h-7 text-white" />
                          </div>
                        )}
                      </div>

                      {/* Title & Funding */}
                      <div>
                        <h3 className="text-xl font-bold text-white group-hover:text-blue-300 transition-colors line-clamp-1">
                          {startup.name}
                        </h3>
                        <p className="text-sm text-blue-400 font-semibold mt-1">
                          {formatCurrency(startup.funding_amount) || 'Pre-funded'}
                        </p>
                      </div>

                      {/* Stage Badge */}
                      <div>
                        <Badge className={`text-xs ${getStageBadge(startup.stage)}`}>
                          {startup.stage?.charAt(0).toUpperCase() + startup.stage?.slice(1).replace('_', ' ')}
                        </Badge>
                      </div>

                      {/* Meta Info */}
                      <div className="space-y-2 text-sm text-gray-400">
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-4 h-4 text-blue-400" />
                          <span>{startup.industry}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-blue-400" />
                          <span>{startup.location || 'Remote'}</span>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-gray-300 line-clamp-2 leading-relaxed">
                        {startup.description || 'Innovative startup building the future'}
                      </p>

                      {/* Stats */}
                      <div className="flex items-center justify-between text-xs text-gray-500 py-3 border-t border-slate-700">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5" />
                          {formatViews(startup.views)} views
                        </span>
                        <span className="px-2 py-1 rounded-full bg-slate-700/50 text-slate-300">
                          {startup.positions || 0} open positions
                        </span>
                      </div>

                      {/* CTA Button */}
                      <Button 
                        onClick={() => handleNavigation(`/startup-details/${startup.id}`)}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold mt-2 group/btn"
                      >
                        <span>Explore & Apply</span>
                        <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </Card>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div variants={itemVariants} className="text-center py-12">
            <p className="text-gray-400">No startups available at the moment</p>
          </motion.div>
        )}

        {/* CTA Section */}
        <motion.div variants={itemVariants} className="text-center space-y-6">
          <div className="inline-block">
            <Button 
              onClick={() => handleNavigation('/discover-startups')}
              size="lg" 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8"
            >
              Discover All Startups
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
          <p className="text-gray-400 max-w-xl mx-auto">
            Connect with innovative founders, collaborate on groundbreaking projects, and grow with the next generation of tech leaders.
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
}