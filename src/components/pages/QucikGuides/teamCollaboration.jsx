import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, MessageSquare, GitBranch, Clock, Shield, FileText, ArrowLeft,
  CheckCircle, Sparkles, Zap, Video, Share2, Bell, Lock, Cloud,
  Heart, TrendingUp, Award, Rocket
} from 'lucide-react';
import { Link } from 'react-router-dom';

const ShinyText = ({ text, className = "" }) => (
  <span className={`inline-block bg-gradient-to-r from-blue-300 via-purple-300 to-blue-300 bg-clip-text text-transparent animate-shimmer bg-[length:200%_100%] ${className}`}>
    {text}
  </span>
);

const TeamCollaboration = () => {
  const [hoveredCard, setHoveredCard] = useState(null);

  const features = [
    {
      id: 1,
      icon: Users,
      title: 'Real-time Collaboration',
      color: 'from-blue-500 to-cyan-500',
      description: 'SFcollab offers several tools for seamless teamwork and simultaneous work:',
      points: [
        'Live editing with multiple team members',
        'Real-time cursor presence and updates',
        'Simultaneous document collaboration',
        'Instant change synchronization'
      ],
      badge: 'Live'
    },
    {
      id: 2,
      icon: MessageSquare,
      title: 'Communication Tools',
      color: 'from-green-500 to-emerald-500',
      description: 'Effective communication features to keep your team aligned:',
      points: [
        'Comments & @mentions system',
        'Threaded discussions',
        'Integrated chat and video calls',
        'Notification management'
      ],
      badge: 'Essential'
    },
    {
      id: 3,
      icon: GitBranch,
      title: 'Version Control',
      color: 'from-purple-500 to-pink-500',
      description: 'Track changes and maintain project integrity:',
      points: [
        'Complete version history tracking',
        'Easy revert to previous versions',
        'Change comparison tools',
        'Automatic backup system'
      ],
      badge: 'Advanced'
    },
    {
      id: 4,
      icon: FileText,
      title: 'File Management',
      color: 'from-yellow-500 to-orange-500',
      description: 'Efficient file sharing and organization:',
      points: [
        'Easy document sharing system',
        'File permission controls',
        'Cloud storage integration',
        'Advanced search and organization'
      ],
      badge: 'Storage'
    },
    {
      id: 5,
      icon: Clock,
      title: 'Project Coordination',
      color: 'from-red-500 to-rose-500',
      description: 'Keep projects on track with time management:',
      points: [
        'Shared calendars and scheduling',
        'Deadline tracking system',
        'Time zone synchronization',
        'Meeting and milestone planning'
      ],
      badge: 'Planning'
    },
    {
      id: 6,
      icon: Shield,
      title: 'Security & Permissions',
      color: 'from-cyan-500 to-blue-500',
      description: 'Control access and maintain security:',
      points: [
        'Role-based access controls',
        'Custom permission levels',
        'Secure data encryption',
        'Audit logs and activity tracking'
      ],
      badge: 'Security'
    }
  ];

  const stats = [
    {
      icon: TrendingUp,
      value: '85%',
      label: 'Faster Delivery',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Heart,
      value: '95%',
      label: 'Team Satisfaction',
      color: 'from-pink-500 to-rose-500'
    },
    {
      icon: Zap,
      value: '3x',
      label: 'More Productive',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      icon: Award,
      value: '24/7',
      label: 'Always Available',
      color: 'from-purple-500 to-indigo-500'
    }
  ];

  const bestPractices = [
    {
      title: 'Set Clear Expectations',
      description: 'Define roles, responsibilities, and communication protocols from the start',
      icon: '🎯'
    },
    {
      title: 'Regular Check-ins',
      description: 'Schedule consistent meetings to maintain alignment and address blockers',
      icon: '📅'
    },
    {
      title: 'Use Async Communication',
      description: 'Leverage threaded discussions and comments for timezone-friendly collaboration',
      icon: '💬'
    },
    {
      title: 'Document Everything',
      description: 'Keep shared documentation up-to-date for team knowledge and onboarding',
      icon: '📝'
    },
    {
      title: 'Celebrate Wins',
      description: 'Acknowledge achievements and milestones to boost team morale',
      icon: '🎉'
    },
    {
      title: 'Provide Feedback',
      description: 'Give timely, constructive feedback to help team members grow',
      icon: '⭐'
    }
  ];

  return (
    <div className="min-h-screen ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Back Button */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
        >
          <Link to="/help">
            <button className="mb-8 border border-gray-600 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-white hover:text-black transition-all duration-300 text-gray-300">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back to Help</span>
            </button>
          </Link>
        </motion.div>

        {/* Header Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-16 relative overflow-hidden"
        >
          {/* Background Elements */}
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
              className="absolute -top-20 left-1/4 w-40 h-40 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-3xl"
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
              className="absolute -top-10 right-1/4 w-32 h-32 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl"
            />
          </div>

          {/* Badge */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-full px-6 py-2 backdrop-blur-sm mb-6"
          >
            <Users className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-medium bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
              Collaborate Seamlessly
            </span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
          >
            <ShinyText text="Team Collaboration" />
            <br />
            <ShinyText text="Made Simple" className="custom-title" />
          </motion.h1>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed"
          >
            Great collaboration is the key to successful projects. Discover how to effectively 
            communicate and work together using SFcollab's powerful collaboration features.
          </motion.p>

          {/* Stats Grid */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto"
          >
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="p-4 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl hover:border-blue-500/50 transition-all duration-300 group"
                >
                  <div className={`inline-flex p-2 bg-gradient-to-br ${stat.color} rounded-lg mb-2`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-xs text-gray-400">{stat.label}</div>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>

        {/* Features Grid */}
        <motion.section
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mb-16"
        >
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Collaboration Features</h2>
            <p className="text-gray-400">Everything you need to work together effectively</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  onHoverStart={() => setHoveredCard(feature.id)}
                  onHoverEnd={() => setHoveredCard(null)}
                  className="group relative"
                >
                  <div className="h-full p-6 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 hover:border-blue-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 overflow-hidden">
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                    
                    <div className="relative">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className={`p-3 bg-gradient-to-br ${feature.color} rounded-xl shadow-lg`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xs font-medium px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full">
                          {feature.badge}
                        </span>
                      </div>

                      {/* Title & Description */}
                      <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-gray-400 mb-4 leading-relaxed">
                        {feature.description}
                      </p>

                      {/* Points List */}
                      <div className="space-y-2">
                        {feature.points.map((point, pointIndex) => (
                          <motion.div
                            key={pointIndex}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.9 + index * 0.1 + pointIndex * 0.05 }}
                            className="flex items-start gap-2"
                          >
                            <CheckCircle className={`w-4 h-4 shrink-0 mt-0.5 ${
                              hoveredCard === feature.id ? 'text-blue-400' : 'text-green-400'
                            } transition-colors`} />
                            <span className="text-sm text-gray-300">{point}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* Best Practices Section */}
        <motion.section
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mb-16"
        >
          <div className="p-8 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-purple-500/20 rounded-xl">
                <Sparkles className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Best Practices for Team Success</h2>
                <p className="text-gray-400 text-sm">Proven strategies to enhance your team collaboration</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {bestPractices.map((practice, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.3 + index * 0.1 }}
                  className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-purple-500/50 transition-all group"
                >
                  <div className="text-3xl mb-3">{practice.icon}</div>
                  <h3 className="text-white font-semibold mb-2 group-hover:text-purple-400 transition-colors">
                    {practice.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{practice.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* Start Collaborating Card */}
          <div className="p-6 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl backdrop-blur-sm">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <Rocket className="w-6 h-6 text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">Start Collaborating Today</h3>
                <p className="text-gray-300 text-sm mb-4">
                  Create your first project and invite your team to experience seamless collaboration.
                </p>
                <a
                  href="/getting-started"
                  className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
                >
                  <span>Get Started</span>
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    →
                  </motion.div>
                </a>
              </div>
            </div>
          </div>

          {/* Learn More Card */}
          <div className="p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl backdrop-blur-sm">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-green-500/20 rounded-xl">
                <Video className="w-6 h-6 text-green-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">Watch Video Tutorials</h3>
                <p className="text-gray-300 text-sm mb-4">
                  Learn collaboration tips and tricks from our comprehensive video guide library.
                </p>
                <a
                  href="/video-tutorials"
                  className="inline-flex items-center gap-2 text-green-400 hover:text-green-300 text-sm font-medium transition-colors"
                >
                  <span>View Tutorials</span>
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    →
                  </motion.div>
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <style >{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .animate-shimmer {
          animation: shimmer 3s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default TeamCollaboration;