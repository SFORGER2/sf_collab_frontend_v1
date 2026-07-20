import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ClipboardList, Users, Workflow, Target, Clock, ArrowLeft,
  CheckCircle, Sparkles, TrendingUp, BarChart3, Calendar,
  MessageSquare, FileText, Zap, Shield, Award
} from 'lucide-react';
import { Link } from 'react-router-dom';

const ShinyText = ({ text, className = "" }) => (
  <span className={`inline-block bg-gradient-to-r from-blue-300 via-purple-300 to-blue-300 bg-clip-text text-transparent animate-shimmer bg-[length:200%_100%] ${className}`}>
    {text}
  </span>
);

export default function ProjectManagement() {
  const [hoveredCard, setHoveredCard] = useState(null);

  const practices = [
    {
      id: 1,
      title: "Define Clear Roles",
      description: "On SFCOLAB, every contributor has a role. Make sure responsibilities are visible and transparent to avoid confusion.",
      icon: Users,
      color: "from-blue-500 to-cyan-500",
      keyPoints: ["Project Lead", "Developers", "Designers", "Marketers"],
      badge: "Essential"
    },
    {
      id: 2,
      title: "Break Work into Tasks",
      description: "Use task-based collaboration so projects can be tracked and delivered step by step.",
      icon: ClipboardList,
      color: "from-green-500 to-emerald-500",
      keyPoints: ["Task assignments", "Progress tracking", "Task deadlines"],
      badge: "Organization"
    },
    {
      id: 3,
      title: "Set Timelines",
      description: "Projects move faster when milestones and deadlines are visible to all collaborators.",
      icon: Clock,
      color: "from-yellow-500 to-orange-500",
      keyPoints: ["Weekly updates", "Milestone reviews", "Completion targets"],
      badge: "Planning"
    },
    {
      id: 4,
      title: "Collaborative Workflow",
      description: "Leverage SFCOLAB's discussion threads, comments, and updates to keep everyone aligned.",
      icon: Workflow,
      color: "from-purple-500 to-pink-500",
      keyPoints: ["Idea discussions", "Status updates", "Feedback loops"],
      badge: "Teamwork"
    },
    {
      id: 5,
      title: "Track Goals & Impact",
      description: "Define measurable goals and track outcomes so contributors see the impact of their work.",
      icon: Target,
      color: "from-red-500 to-rose-500",
      keyPoints: ["SMART goals", "Impact metrics", "Final deliverables"],
      badge: "Results"
    },
    {
      id: 6,
      title: "Regular Communication",
      description: "Keep your team informed with consistent updates, stand-ups, and collaborative discussions.",
      icon: MessageSquare,
      color: "from-indigo-500 to-blue-500",
      keyPoints: ["Daily stand-ups", "Weekly reviews", "Team meetings"],
      badge: "Communication"
    }
  ];

  const benefits = [
    {
      icon: TrendingUp,
      title: "Boost Productivity",
      description: "Increase team efficiency by 40%",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Shield,
      title: "Risk Management",
      description: "Identify and mitigate issues early",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Award,
      title: "Quality Delivery",
      description: "Meet deadlines with excellence",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: BarChart3,
      title: "Track Progress",
      description: "Real-time insights and analytics",
      color: "from-orange-500 to-red-500"
    }
  ];

  const tips = [
    {
      title: "Start with clarity",
      description: "Define project scope, goals, and success metrics from day one"
    },
    {
      title: "Communicate often",
      description: "Regular check-ins prevent misalignment and keep momentum"
    },
    {
      title: "Document everything",
      description: "Clear documentation saves time and reduces confusion"
    },
    {
      title: "Celebrate wins",
      description: "Acknowledge achievements to keep team morale high"
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
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-medium bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
              Best Practices & Strategies
            </span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
          >
            <ShinyText text="Master Project" />
            <br />
            <ShinyText text="Management" className="custom-title" />
          </motion.h1>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed"
          >
            Learn the best practices for managing projects and collaborations on SFCOLAB. 
            Transform your team's productivity with proven strategies and frameworks.
          </motion.p>

          {/* Benefits Grid */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto"
          >
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="p-4 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl hover:border-blue-500/50 transition-all duration-300 group"
                >
                  <div className={`inline-flex p-2 bg-gradient-to-br ${benefit.color} rounded-lg mb-2`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-sm font-semibold text-white mb-1">{benefit.title}</h3>
                  <p className="text-xs text-gray-400">{benefit.description}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>

        {/* Best Practices Section */}
        <motion.section
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mb-16"
        >
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Core Best Practices</h2>
            <p className="text-gray-400">Essential strategies for successful project management</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {practices.map((practice, index) => {
              const Icon = practice.icon;
              return (
                <motion.div
                  key={practice.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  onHoverStart={() => setHoveredCard(practice.id)}
                  onHoverEnd={() => setHoveredCard(null)}
                  className="group relative"
                >
                  <div className="h-full p-6 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 hover:border-blue-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 overflow-hidden">
                    <div className={`absolute inset-0 bg-gradient-to-br ${practice.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                    
                    <div className="relative">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className={`p-3 bg-gradient-to-br ${practice.color} rounded-xl shadow-lg`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xs font-medium px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full">
                          {practice.badge}
                        </span>
                      </div>

                      {/* Title & Description */}
                      <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">
                        {practice.title}
                      </h3>
                      <p className="text-sm text-gray-400 mb-4 leading-relaxed">
                        {practice.description}
                      </p>

                      {/* Key Points */}
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                          Key Points
                        </p>
                        {practice.keyPoints.map((point, pointIndex) => (
                          <motion.div
                            key={pointIndex}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.9 + index * 0.1 + pointIndex * 0.05 }}
                            className="flex items-start gap-2"
                          >
                            <CheckCircle className={`w-4 h-4 shrink-0 mt-0.5 ${
                              hoveredCard === practice.id ? 'text-blue-400' : 'text-green-400'
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

        {/* Pro Tips Section */}
        <motion.section
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mb-16"
        >
          <div className="p-8 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-purple-500/20 rounded-xl">
                <Zap className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Pro Tips for Success</h2>
                <p className="text-gray-400 text-sm">Expert advice to take your projects to the next level</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tips.map((tip, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.3 + index * 0.1 }}
                  className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-purple-500/50 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="text-white font-semibold mb-1">{tip.title}</h3>
                      <p className="text-gray-400 text-sm">{tip.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Resources Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* Documentation Card */}
          <div className="p-6 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl backdrop-blur-sm">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <FileText className="w-6 h-6 text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">Full Documentation</h3>
                <p className="text-gray-300 text-sm mb-4">
                  Dive deeper into project management methodologies and advanced techniques.
                </p>
                <a
                  href="/help"
                  className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
                >
                  <span>Read Documentation</span>
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

          {/* Video Tutorials Card */}
          <div className="p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl backdrop-blur-sm">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-green-500/20 rounded-xl">
                <Calendar className="w-6 h-6 text-green-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">Schedule a Demo</h3>
                <p className="text-gray-300 text-sm mb-4">
                  Get personalized guidance from our team to optimize your project workflow.
                </p>
                <a
                  href="/video-tutorials"
                  className="inline-flex items-center gap-2 text-green-400 hover:text-green-300 text-sm font-medium transition-colors"
                >
                  <span>Watch Tutorials</span>
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
}