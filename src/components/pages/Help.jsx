import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Book, MessageSquare, Phone, Mail, FileText, Video, Users, 
  ArrowRight, HelpCircle, ChevronDown, Sparkles, Zap, Shield, Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/button';
import { usersAPI } from '@/utils/APIs/userApi';
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
      icon: <img loading="lazy" src="/roadmap.jpg" alt="" className="w-10 h-10 text-white"/>,
      description: 'Learn the fundamentals of our platform',
      link: '/getting-started',
      category: 'Basics',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 2,
      title: 'Project Management',
      icon: <img loading="lazy" src="/project.jpg" alt="" className="w-10 h-10 text-white"/>,
      description: 'Advanced project management techniques',
      link: '/project-management',
      category: 'Advanced',
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 3,
      title: 'Team Collaboration',
      icon: <img loading="lazy" src="/team.jpg" alt="" className="w-10 h-10 text-white"/>,
      description: 'Optimize team workflow and communication',
      link: '/team-collaboration',
      category: 'Team',
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 4,
      title: 'Video Tutorials',
      icon: <img loading="lazy" src="/video.jpg" alt="" className="w-10 h-10 text-white"/>,
      description: 'Comprehensive step-by-step video guides',
      link: '/video-tutorials',
      category: 'Learning',
      color: 'from-orange-500 to-red-500'
    }
  ];

  const supportOptions = [
    {
      id: 1,
      title: 'Live Chat Support',
      icon: <img loading="lazy" src="/message_2.jpg" alt="message" className="w-16 h-16 text-white"/>,
      description: 'Instant assistance from our support team',
      details: 'Available 24/7 for premium users',
      badge: 'Instant',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 2,
      title: 'Phone Support',
      icon: <img loading="lazy" src="/call.png" alt="call" className="w-16 h-16 text-white"/>,
      description: 'Direct conversation with our experts',
      details: '+48 507 351 830 • Mon-Fri 8AM-8PM EST',
      badge: 'Priority',
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 3,
      title: 'Email Support',
      icon: <img loading="lazy" src="/email.jpg" alt="email" className="w-16 h-16 text-white"/>,
      description: 'Detailed technical assistance',
      details: 'support@sfcollab.com • Response within 24 hours',
      badge: '24h Response',
      color: 'from-green-500 to-emerald-500'
    }
  ];


  return (
    <div className="min-h-screen ">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
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

          {/* Main Heading */}
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

          {/* Search Bar */}
          {/* <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="max-w-2xl mx-auto relative"
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for articles, guides, or FAQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
            />
          </motion.div> */}

          {/* Stats */}
          {/* <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-12 max-w-3xl mx-auto"
          >
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">500+</div>
              <div className="text-sm text-gray-400">Help Articles</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">24/7</div>
              <div className="text-sm text-gray-400">Support Hours</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">&lt;2min</div>
              <div className="text-sm text-gray-400">Avg Response</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">98%</div>
              <div className="text-sm text-gray-400">Satisfaction Rate</div>
            </div>
          </motion.div> */}
        </motion.div>

        {/* Quick Guides Section */}
        <motion.section
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mb-20"
        >
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Documentation & Guides</h2>
              <p className="text-gray-400">Comprehensive resources to help you succeed</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {guides.map((guide, index) => {
              const Icon = guide.icon;
              return (
                <Link
                  key={guide.id}
                  to={guide.link}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  className="group block"
                >
                  <div className="relative h-full p-6 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 hover:border-blue-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 overflow-hidden">
                    <div className={`absolute inset-0 bg-gradient-to-br ${guide.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                    
                    <div className="relative">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`p-3`}>
                          {Icon}
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
              );
            })}
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
                className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl overflow-hidden hover:border-gray-600 transition-all"
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-800/50 transition-colors"
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
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-5 pt-0">
                        <p className="text-gray-300 leading-relaxed">{faq.answer}</p>
                        {/* <button className="mt-4 text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center gap-1">
                          Read more about this topic
                          <ArrowRight className="w-4 h-4" />
                        </button> */}
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
        >
          {/* <h2 className="text-3xl font-bold text-white mb-2">Contact Support</h2>
          <p className="text-gray-400 mb-8">Get help from our dedicated support team</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {supportOptions.map((option, index) => {
              const Icon = option.icon;
              return (
                <motion.div
                  key={option.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 + index * 0.1 }}
                  className="group relative p-6 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 hover:border-blue-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 text-center overflow-hidden"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${option.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                  
                  <div className="relative">
                    <div className={`inline-flex items-center justify-center w-16 h-16 mb-4`}>
                      {Icon}
                    </div>

                    <div className="mb-4">
                      <span className="inline-block px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium rounded-full mb-3">
                        {option.badge}
                      </span>
                      <h3 className="text-xl font-semibold text-white mb-2">{option.title}</h3>
                      <p className="text-gray-400 mb-2">{option.description}</p>
                      <p className="text-sm text-gray-500">{option.details}</p>
                    </div>

                    <Button className="w-full px-4 py-3 bg-white text-black hover:bg-white hover:shadow-[0px_0px_8px_white] font-medium rounded-lg transition-all duration-300 transform group-hover:scale-102 cursor-pointer">
                      Get Started
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div> */}

          {/* Contact Form */}
          <ContactForm />
        </motion.section>

        {/* Alert Banner */}
        {/* <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6 }}
          className="p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl backdrop-blur-sm"
        >
          <div className="flex items-start gap-4">
            <div className="p-2 bg-blue-500/20 rounded-lg">
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

export default Help;