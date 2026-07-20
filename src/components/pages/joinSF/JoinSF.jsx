import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Code, Palette, Film, Zap } from 'lucide-react';
import { Button } from '../../ui/button';
import ContactForm from '../ContactForm';
import JoinSFApplicationForm from './joinSFForm';
const JoinSF = () => {
  const roles = [
    {
      icon: Code,
      title: 'Developers',
      description: 'Full-stack, Frontend, Backend, Mobile developers needed to build amazing features',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: Palette,
      title: '3D Designers',
      description: 'Create stunning 3D assets and visual experiences for our platform',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: Film,
      title: 'Content Creators',
      description: 'Help us tell our story through engaging videos, blogs, and social media content',
      color: 'from-pink-500 to-pink-600'
    },
    {
      icon: Zap,
      title: 'More Roles',
      description: 'Marketing, UI/UX, Project Managers, and other talented individuals welcome',
      color: 'from-orange-500 to-orange-600'
    }
  ];

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden text-white">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-600/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="py-20 text-center"
        >
          <h1 className="text-5xl mb-6 md:text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-6">
            Join the SForger Revolution
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-4">
            We're building the future and we need YOU
          </p>
          <p className="text-slate-400">Be part of something extraordinary. Multiple roles available now.</p>
        </motion.section>

        {/* Positions Grid */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="py-16 mb-16"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {roles.map((role, index) => {
              const Icon = role.icon;
              return (
                <motion.div
                  key={role.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group relative p-6 rounded-2xl bg-slate-800/50 border border-slate-700 hover:border-slate-600 transition-all duration-300 overflow-hidden"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${role.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                  
                  <div className="relative z-10">
                    <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${role.color} mb-4`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">{role.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{role.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.section>
        <JoinSFApplicationForm />
        {/* CTA Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="py-16 text-center"
        >
          <div className="max-w-2xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Ready to make an impact?
            </h2>
            {/* <p className="text-lg text-slate-300 mb-8">
              Email us with your portfolio or resume to join our growing team.
            </p> */}
            
            <a href="mailto:sfcollab333@gmail.com">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-6 rounded-xl text-lg">
                <Mail className="w-5 h-5 mr-2" />
                Get In Touch
              </Button>
            </a>

            <p className="mt-8 text-slate-400">
              <span className="font-semibold text-blue-400">sfcollab333@gmail.com</span>
            </p>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default JoinSF;