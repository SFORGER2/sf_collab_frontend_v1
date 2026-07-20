import React from 'react';
import { motion } from 'framer-motion';
import { 
  User, Settings, Lock, Calendar, ArrowLeft, Rocket, 
  CheckCircle, Sparkles, Zap, Shield, Clock, Target,
  Users, FileText, Bell, Globe
} from 'lucide-react';
import { Link } from 'react-router-dom';

const ShinyText = ({ text, className = "" }) => (
  <span className={`inline-block bg-gradient-to-r from-blue-300 via-purple-300 to-blue-300 bg-clip-text text-transparent animate-shimmer bg-[length:200%_100%] ${className}`}>
    {text}
  </span>
);

const GettingStarted = () => {
  const guides = [
    {
      id: 1,
      icon: User,
      title: 'Creating Your Account',
      iconColor: 'from-blue-500 to-cyan-500',
      description: 'To get started with SFCollab, you need to create an account. Follow these simple steps:',
      steps: [
        'Visit our signup page and enter your email address',
        'Check your email for a verification link',
        'Create a secure password',
        'Complete your profile with your name and photo'
      ]
    },
    {
      id: 2,
      icon: Settings,
      title: 'Setting Up Your First Project',
      iconColor: 'from-green-500 to-emerald-500',
      description: 'Once your account is created, it\'s time to set up your first project:',
      steps: [
        'Click on the "Create New Project" button',
        'Give your project a descriptive name',
        'Add a project description for team members',
        'Set the project visibility (private or team-wide)'
      ]
    },
    {
      id: 3,
      icon: Lock,
      title: 'Security & Privacy',
      iconColor: 'from-red-500 to-pink-500',
      description: 'Your security is our priority. Here\'s how we protect your data:',
      steps: [
        'End-to-end encryption for all communications',
        'Two-factor authentication support',
        'Regular security audits and updates',
        'GDPR compliant data handling'
      ]
    },
    {
      id: 4,
      icon: Calendar,
      title: 'Project Timeline',
      iconColor: 'from-yellow-500 to-orange-500',
      description: 'Manage your project schedule effectively:',
      steps: [
        'Set milestones and deadlines',
        'Track progress with visual timelines',
        'Receive notifications for upcoming tasks',
        'Adjust schedules with drag-and-drop interface'
      ]
    },
    {
      id: 5,
      icon: Users,
      title: 'Team Collaboration',
      iconColor: 'from-purple-500 to-indigo-500',
      description: 'Work seamlessly with your team members:',
      steps: [
        'Invite team members via email',
        'Assign roles and permissions',
        'Share files and documents',
        'Real-time collaboration features'
      ]
    },
    {
      id: 6,
      icon: Bell,
      title: 'Notifications & Updates',
      iconColor: 'from-pink-500 to-rose-500',
      description: 'Stay informed about important updates:',
      steps: [
        'Customize notification preferences',
        'Get real-time project updates',
        'Receive deadline reminders',
        'Track team activity and changes'
      ]
    }
  ];

  const quickTips = [
    {
      icon: Zap,
      title: 'Quick Start',
      description: 'Get up and running in under 5 minutes',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      icon: Shield,
      title: 'Secure Platform',
      description: 'Enterprise-grade security for your data',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Target,
      title: 'Goal Tracking',
      description: 'Monitor progress and achieve objectives',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Globe,
      title: 'Global Access',
      description: 'Work from anywhere, anytime',
      color: 'from-purple-500 to-pink-500'
    }
  ];

  return (
    <div className="min-h-screen">
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
            <Rocket className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-medium bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
              Start Your Journey in Minutes
            </span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
          >
            <ShinyText text="Getting Started" />
            <br />
            <ShinyText text="With SFCollab" className="custom-title" />
          </motion.h1>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed"
          >
            Welcome to SFCollab! This guide will help you set up your account and start 
            collaborating with your team in no time. Follow our step-by-step instructions below.
          </motion.p>

          {/* Quick Tips Grid */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto"
          >
            {quickTips.map((tip, index) => {
              const Icon = tip.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="p-4 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl hover:border-blue-500/50 transition-all duration-300 group"
                >
                  <div className={`inline-flex p-2 bg-gradient-to-br ${tip.color} rounded-lg mb-2`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-sm font-semibold text-white mb-1">{tip.title}</h3>
                  <p className="text-xs text-gray-400">{tip.description}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>

        {/* Setup Progress Indicator */}
        {/* <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mb-12 p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl backdrop-blur-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">Your Setup Progress</h3>
            </div>
            <span className="text-sm text-blue-400 font-medium">4 of 6 steps</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "66%" }}
              transition={{ duration: 1, delay: 0.8 }}
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
            />
          </div>
        </motion.div> */}

        {/* Guide Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {guides.map((guide, index) => {
            const Icon = guide.icon;
            return (
              <motion.div
                key={guide.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                className="group relative"
              >
                <div className="h-full p-6 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 hover:border-blue-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${guide.iconColor} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                  
                  <div className="relative">
                    {/* Icon and Title */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`p-3 bg-gradient-to-br ${guide.iconColor} rounded-xl shadow-lg shrink-0`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h2 className="text-xl font-semibold text-white group-hover:text-blue-400 transition-colors">
                          {guide.title}
                        </h2>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-400 mb-4 leading-relaxed">
                      {guide.description}
                    </p>

                    {/* Steps List */}
                    <ul className="space-y-3">
                      {guide.steps.map((step, stepIndex) => (
                        <motion.li
                          key={stepIndex}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 1 + index * 0.1 + stepIndex * 0.05 }}
                          className="flex items-start gap-3 text-gray-300 text-sm"
                        >
                          <CheckCircle className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                          <span>{step}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Help Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* Need More Help Card */}
          <div className="p-6 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl backdrop-blur-sm">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <FileText className="w-6 h-6 text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">Need More Help?</h3>
                <p className="text-gray-300 text-sm mb-4">
                  Check out our comprehensive documentation and video tutorials for detailed guides.
                </p>
                <a
                  href="/video-tutorials"
                  className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
                >
                  <span>View Video Tutorials</span>
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

          {/* Contact Support Card */}
          <div className="p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl backdrop-blur-sm">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-purple-500/20 rounded-xl">
                <Users className="w-6 h-6 text-purple-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">Contact Support</h3>
                <p className="text-gray-300 text-sm mb-4">
                  Our support team is available 24/7 to help you with any questions or issues.
                </p>
                <a
                  href="/help"
                  className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors"
                >
                  <span>Get Support</span>
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

        {/* Success Message */}
        {/* <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.7 }}
          className="mt-12 p-6 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl backdrop-blur-sm text-center"
        >
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3
            }}
            className="inline-flex p-4 bg-green-500/20 rounded-full mb-4"
          >
            <CheckCircle className="w-8 h-8 text-green-400" />
          </motion.div>
          <h3 className="text-2xl font-bold text-white mb-2">You're All Set!</h3>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Congratulations! You've completed the getting started guide. You're now ready to 
            create amazing projects and collaborate with your team on SFCollab.
          </p>
        </motion.div> */}
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

export default GettingStarted;