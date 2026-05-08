import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Calculator,
  FileText,
  Grid3X3,
  FileSignature,
  ArrowRight,
  Zap,
  Lock,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

const tools = [
  {
    name: "Calculator",
    description: "Advanced calculator for quick computations and financial analysis",
    icon: Calculator,
    path: "/calculator",
    gradient: "from-blue-600 to-cyan-500",
    bgGradient: "from-blue-500/10 to-cyan-500/5",
    borderColor: "border-blue-500/30 group-hover:border-blue-500/50",
  },
  {
    name: "Notes",
    description: "Create, organize, and manage your notes with rich text formatting",
    icon: FileText,
    path: "/notes",
    gradient: "from-amber-600 to-orange-500",
    bgGradient: "from-amber-500/10 to-orange-500/5",
    borderColor: "border-amber-500/30 group-hover:border-amber-500/50",
  },
  {
    name: "PDF Signing",
    description: "Sign and manage digital document signatures securely",
    icon: FileSignature,
    path: "/pdf-signing",
    gradient: "from-emerald-600 to-teal-500",
    bgGradient: "from-emerald-500/10 to-teal-500/5",
    borderColor: "border-emerald-500/30 group-hover:border-emerald-500/50",
  },
];

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

export default function ToolsDashboard() {
  const { user } = useSelector((state) => state.auth);
  const [requestingTool, setRequestingTool] = useState(false);

  const handleRequestTool = async () => {
    setRequestingTool(true);
    try {
      await fetch("/api/tools/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.id }),
      });
    } catch (error) {
      console.error("Failed to request tool:", error);
    } finally {
      setRequestingTool(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black text-white p-4 sm:p-8">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-1/4 left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-10 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" style={{ animationDelay: "2s" }} />
        <div className="absolute -bottom-20 left-1/2 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      {/* Grid Pattern Overlay */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)] pointer-events-none -z-10" />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* AI Tools Notice Banner */}
        <motion.div
          className="mb-8 p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 backdrop-blur-sm"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-400 mt-1 sm:mt-0 flex-shrink-0" />
              <div>
                <p className="font-semibold text-white">BASIC AI TOOLS</p>
                <p className="text-sm text-gray-300">We are improving them very soon. Currently polishing them.</p>
              </div>
            </div>
            <button
              onClick={handleRequestTool}
              disabled={requestingTool}
              className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-sm font-semibold transition-colors"
            >
              {requestingTool ? "Requesting..." : "Request a Tool"}
            </button>
          </div>
        </motion.div>

        {/* Header Section */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-semibold text-blue-300 uppercase tracking-widest">
              Productivity Suite
            </span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
              Essential Tools
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-300 mb-2 max-w-3xl mx-auto leading-relaxed">
            Welcome back, <span className="text-blue-300 font-semibold">{user?.firstName || "User"}</span>. Access your productivity tools and get things done efficiently.
          </p>

          {/* Feature Highlights */}
          <motion.div
            className="flex flex-wrap justify-center gap-4 mt-10"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {[
              { icon: "⚡", label: "Quick Access" },
              { icon: "🔒", label: "Secure" },
              { icon: "📱", label: "All Devices" },
            ].map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 hover:border-white/20 transition-all"
              >
                <span className="text-lg">{feature.icon}</span>
                <span className="text-sm text-gray-300 font-medium">{feature.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Tools Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {tools.map(({ name, description, icon: Icon, path, gradient, bgGradient, borderColor }) => (
            <motion.div key={name} variants={itemVariants}>
              <Link
                to={path}
                className="group relative rounded-2xl overflow-hidden transition-all duration-300 h-full block"
              >
                {/* Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${bgGradient} backdrop-blur-xl border ${borderColor} rounded-2xl transition-all duration-300`} />

                {/* Animated Gradient Overlay */}
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${gradient} blur-2xl`} />

                {/* Border Glow */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-500`} />

                {/* Content */}
                <div className="relative z-10 p-6 sm:p-8 h-full flex flex-col">
                  {/* Icon Container */}
                  <motion.div
                    className="mb-6"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                  </motion.div>

                  {/* Title */}
                  <h3 className="font-bold text-xl sm:text-2xl text-white mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-blue-200 group-hover:bg-clip-text transition-all duration-300">
                    {name}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-300 text-sm flex-1 mb-6 group-hover:text-white transition-colors duration-300 leading-relaxed">
                    {description}
                  </p>

                  {/* CTA */}
                  <motion.div
                    className="flex items-center gap-2 text-sm font-semibold text-white opacity-70 group-hover:opacity-100 transition-all duration-300 group-hover:gap-3"
                    whileHover={{ x: 4 }}
                  >
                    <span>Open Tool</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </motion.div>
                </div>

                {/* Corner Accent */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-bl-full" />
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}