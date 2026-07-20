import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Brain,
  Image as ImageIcon,
  PenTool,
  Database,
  MessageSquare,
  FileSignature,
  ArrowRight,
  Lock,
  Zap
} from "lucide-react";
import { tools } from "./AITools";
import { isAiToolsLocked, getAiToolsLockRemainingDays } from "../../../../utils/config.js";
import useGetCredits from "@/utils/hooks/useGetCredits";
import AITutorial from "./AITutorial";

export default function AIDashboard() {
  const locked = isAiToolsLocked();
  const daysRemaining = getAiToolsLockRemainingDays();
  const credits = useGetCredits();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <div className="min-h-screen bg-black text-white px-2 md:px-4 py-8">
      {/* Animated Background */}
      <AITutorial />
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />
        <div className="absolute top-1/4 left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-10 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 w-full mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <span className="text-sm font-semibold text-blue-300 uppercase tracking-widest">
            AI Suite
          </span>
        </div>

        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex justify-center items-center gap-4">
            <div>
              <h1 className="text-center text-5xl md:text-6xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                SF AI Tools
              </h1>
              <p className="text-gray-400 text-lg mt-2">
                Build, design, analyze, and scale with AI-powered intelligence
              </p>
            </div>
          </div>
        </motion.div>

        {/* Credits Card */}
        <motion.div
          className="credits bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 max-w-md mx-auto"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-400 font-medium">Available Credits</p>
                <p className="text-2xl font-bold text-white">{credits || 0}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Lock Notification */}
        {locked && (
          <motion.div
            className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-center gap-3 text-amber-300 backdrop-blur"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Lock className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="font-semibold">AI tools are temporarily locked</p>
              <p className="text-sm text-amber-200">
                We&apos;re rolling out additional security measures. 
                {daysRemaining > 0 && (
                  <span> Access will resume in <strong>{daysRemaining} day{daysRemaining !== 1 ? "s" : ""}</strong>.</span>
                )}
              </p>
            </div>
          </motion.div>
        )}

        {/* Feature Highlights */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {[
            { icon: '⚡', label: 'Lightning Fast', color: 'from-blue-500 to-cyan-500' },
            { icon: '🧠', label: 'AI Powered', color: 'from-purple-500 to-pink-500' },
            { icon: '🔒', label: 'Enterprise Grade', color: 'from-green-500 to-emerald-500' }
          ].map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -4, scale: 1.02 }}
              className="group relative overflow-hidden rounded-2xl"
            >
              <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              <div className="relative bg-slate-900/90 backdrop-blur border border-white/10 group-hover:border-white/30 rounded-2xl p-6 text-center transition-all">
                <p className="text-3xl mb-2">{feature.icon}</p>
                <p className="text-sm text-slate-300 font-medium">{feature.label}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Tools Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {tools.map(({ name, available = true, description, icon: Icon, path, gradient }) => (
            <motion.div
              key={name}
              variants={itemVariants}
              className='ai-tool'
              whileHover={available && !locked ? { y: -8, scale: 1.02 } : {}}
            >
              <Link
                to={available && !locked ? path : "#"}
                className={`group relative block rounded-2xl overflow-hidden transition-all duration-300 h-full ${
                  (locked || !available) ? 'cursor-not-allowed opacity-60' : ''
                }`}
                onClick={(e) => (locked || !available) && e.preventDefault()}
              >
                {/* Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-2xl border border-white/10 group-hover:border-white/20 transition-colors" />

                {/* Animated Gradient Overlay */}
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${gradient} blur-2xl`} />

                {/* Border Glow */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-500`} />

                {/* Content */}
                <div className="relative z-10 p-6 sm:p-8 h-full flex flex-col">
                  {/* Icon */}
                  <div className="mb-4">
                    <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${gradient} group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-lg sm:text-xl text-white mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-300 group-hover:bg-clip-text transition-all duration-300">
                    {name}
                  </h3>

                  {/* Description */}
                  <p className="text-slate-300 text-sm flex-1 mb-6 group-hover:text-white transition-colors duration-300">
                    {description}
                  </p>

                  {/* CTA */}
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    {locked ? (
                      <span className="text-amber-300">Temporarily Locked</span>
                    ) : available ? (
                      <>
                        <span className="text-white opacity-70 group-hover:opacity-100 transition-opacity">
                          Launch
                        </span>
                        <ArrowRight className="w-4 h-4 text-white opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                      </>
                    ) : (
                      <span className="text-red-400">Coming Soon</span>
                    )}
                  </div>
                </div>

                {/* Corner Accent */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-bl-full" />
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
