import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Book, MessageSquare, Phone, Mail, FileText, Video, Users,
  ArrowRight, HelpCircle, ChevronDown, Sparkles, Zap, Shield, Clock,
  Briefcase, CheckCircle, AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/button';
import { usersAPI } from '@/utils/APIs/userAPI';
import { toast } from 'react-toastify';
import ContactForm from './ContactForm';

const ShinyText = ({ text, className = "" }) => (
  <span className={`inline-block bg-gradient-to-r from-blue-300 via-purple-300 to-blue-300 bg-clip-text text-transparent animate-shimmer bg-[length:200%_100%] ${className}`}>
    {text}
  </span>
);

const Help = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState(null);

  const faqs = [
    {
      id: 'faq-1',
      question: 'How do I create a new project?',
      answer: 'To create a new project, navigate to the Dashboard and click the "New Project" button. Fill in the required project details including name, description, team members, goals, and deadlines. You can also configure advanced settings during the creation process.'
    },
    {
      id: 'faq-2',
      question: 'How can I invite team members?',
      answer: 'Invite team members by accessing Project Settings and selecting "Invite Members". Enter email addresses and assign appropriate roles (Admin, Editor, or Viewer). Team members will receive an invitation email with secure access links.'
    },
    {
      id: 'faq-3',
      question: 'How do I track project progress?',
      answer: 'Monitor project progress through the comprehensive Dashboard analytics, milestone tracking, and progress indicators. Each project card displays real-time metrics. Detailed reports are available in the Analytics section for in-depth analysis.'
    },
    {
      id: 'faq-4',
      question: 'What are the different project stages?',
      answer: 'Projects progress through five stages: Idea Stage (conceptualization), MVP Stage (minimum viable product), Growth Stage (user acquisition), Scale Stage (expansion), and Research Stage (market analysis). Each stage has specific KPIs and success metrics.'
    }
  ];

  const guides = [
    {
      id: 1,
      title: 'Getting Started Guide',
      icon: <Book className="w-10 h-10 text-blue-400" />,
      description: 'Learn the fundamentals of our platform',
      link: '/getting-started',
      category: 'Basics',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 2,
      title: 'Project Management',
      icon: <Briefcase className="w-10 h-10 text-purple-400" />,
      description: 'Advanced project management techniques',
      link: '/project-management',
      category: 'Advanced',
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 3,
      title: 'Team Collaboration',
      icon: <Users className="w-10 h-10 text-green-400" />,
      description: 'Optimize team workflow and communication',
      link: '/team-collaboration',
      category: 'Team',
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 4,
      title: 'Video Tutorials',
      icon: <Video className="w-10 h-10 text-orange-400" />,
      description: 'Comprehensive step-by-step video guides',
      link: '/video-tutorials',
      category: 'Learning',
      color: 'from-orange-500 to-red-500'
    }
  ];

  const supportOptions = [
    // {
    //   id: 1,
    //   title: 'Live Chat Support',
    //   icon: <MessageSquare className="w-12 h-12 text-blue-400" />,
    //   description: 'Instant assistance from our support team',
    //   details: 'Available 24/7 for premium users',
    //   badge: 'Instant',
    //   color: 'from-blue-500 to-cyan-500'
    // },
    // {
    //   id: 2,
    //   title: 'Phone Support',
    //   icon: <Phone className="w-12 h-12 text-purple-400" />,
    //   description: 'Direct conversation with our experts',
    //   details: '+48 507 351 830 • Mon-Fri 8AM-8PM EST',
    //   badge: 'Priority',
    //   color: 'from-purple-500 to-pink-500'
    // },
    // {
    //   id: 3,
    //   title: 'Email Support',
    //   icon: <Mail className="w-12 h-12 text-green-400" />,
    //   description: 'Detailed technical assistance',
    //   details: 'support@sfcollab.com • Response within 24 hours',
    //   badge: '24h Response',
    //   color: 'from-green-500 to-emerald-500'
    // }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />
        <div className="absolute top-1/4 left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-10 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" style={{ animationDelay: '2s' }} />
      </div>

      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">

        {/* Header Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-16"
        >
          <motion.h1
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
          >
            <ShinyText text="How Can We" />
            <br />
            <ShinyText text="Help You Today?" className="custom-title" />
          </motion.h1>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto"
          >
            Find answers, guides, and resources to help you get the most out of our platform.
            Our support team is here to assist you every step of the way.
          </motion.p>
        </motion.div>

        {/* Quick Guides Section */}
        <motion.section
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mb-20"
          variants={containerVariants}
        >
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Documentation & Guides</h2>
              <p className="text-gray-400">Comprehensive resources to help you succeed</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {guides.map((guide, index) => (
              <motion.div
                key={guide.id}
                variants={itemVariants}
                whileHover={{ y: -4, scale: 1.02 }}
              >
                <Link to={guide.link} className="block h-full group">
                  <div className="relative h-full p-6 bg-slate-900/50 backdrop-blur-sm rounded-xl border border-white/10 hover:border-blue-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 overflow-hidden">
                    <div className={`absolute inset-0 bg-gradient-to-br ${guide.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

                    <div className="relative">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-white/5 rounded-lg group-hover:bg-white/10 transition-colors">
                          {guide.icon}
                        </div>
                        <span className="text-xs font-medium px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full">
                          {guide.category}
                        </span>
                      </div>

                      <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">
                        {guide.title}
                      </h3>
                      <p className="text-sm text-gray-400 mb-4">{guide.description}</p>

                      <div className="flex items-center text-blue-400 text-sm font-medium group-hover:gap-2 transition-all">
                        <span>Read Guide</span>
                        <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* FAQ Section */}
        <motion.section
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="mb-20"
        >
          <h2 className="text-3xl font-bold text-white mb-8">Frequently Asked Questions</h2>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={faq.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 + index * 0.1 }}
                className="bg-slate-900/50 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition-all"
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
                >
                  <span className="text-lg font-semibold text-white pr-4">{faq.question}</span>
                  <motion.div
                    animate={{ rotate: expandedFaq === faq.id ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {expandedFaq === faq.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden border-t border-white/10"
                    >
                      <div className="px-6 py-5">
                        <p className="text-gray-300 leading-relaxed">{faq.answer}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Support Options */}
        <motion.section
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="mb-20"
          variants={containerVariants}
        >
          <h2 className="text-3xl font-bold text-white mb-2">Contact Support</h2>
          <p className="text-gray-400 mb-8">Get help from our dedicated support team</p>

          <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12" variants={containerVariants}>
            {supportOptions.map((option, index) => (
              <motion.div
                key={option.id}
                variants={itemVariants}
                whileHover={{ y: -4, scale: 1.02 }}
                className="group relative p-6 bg-slate-900/50 backdrop-blur-sm rounded-xl border border-white/10 hover:border-blue-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 text-center overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${option.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

                <div className="relative">
                  <div className="inline-flex items-center justify-center p-3 bg-white/5 rounded-lg group-hover:bg-white/10 transition-colors mb-4">
                    {option.icon}
                  </div>

                  <div className="mb-4">
                    <span className="inline-block px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium rounded-full mb-3">
                      {option.badge}
                    </span>
                    <h3 className="text-xl font-semibold text-white mb-2">{option.title}</h3>
                    <p className="text-gray-400 mb-2">{option.description}</p>
                    <p className="text-sm text-gray-500">{option.details}</p>
                  </div>

                  <Button className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all duration-300 transform group-hover:scale-105 cursor-pointer">
                    Get Started
                  </Button>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Contact Form */}
          <ContactForm />
        </motion.section>

        {/* Alert Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6 }}
          className="p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl backdrop-blur-sm"
        >
          <div className="flex items-start gap-4">
            <div className="p-2 bg-blue-500/20 rounded-lg flex-shrink-0">
              <Sparkles className="w-5 h-5 text-blue-400" />
            </div>
            <div className="flex-1">
              <p className="text-white mb-1">
                <strong>Need urgent assistance?</strong> Our priority support team is available 24/7 for enterprise customers.
              </p>
              <button className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center gap-1 mt-2">
                Learn about enterprise support
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      <style>{`
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

export default Help;
