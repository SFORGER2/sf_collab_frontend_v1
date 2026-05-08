import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Swal from "sweetalert2";


export default function IdeaLaunchingLoader({loading}) {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const steps = [
    { label: "Analyzing Idea", icon: "🧠" },
    { label: "Processing Market Data", icon: "📊" },
    { label: "Generating Insights", icon: "✨" },
    { label: "Finalizing Launch", icon: "🚀" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setIsComplete(true);
          clearInterval(interval);
          return 100;
        }
        return prev + Math.random() * 30;
      });
    }, loading ? 800 : 100);

    return () => clearInterval(interval);
  }, [loading]);

  useEffect(() => {
    if (!loading) {
      setProgress(100);
      setCurrentStep(steps.length - 1);
      return;
    }

    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 2000);

    return () => clearInterval(stepInterval);
  }, [loading, steps.length]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 },
    },
    exit: { opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const pulseVariants = {
    initial: { scale: 1, opacity: 0.6 },
    animate: { scale: 1.2, opacity: 0, transition: { duration: 1.5, repeat: Infinity } },
  };
  if (isComplete) {
    return null;
  }
  return (
    <motion.div 
      className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center"
      animate={{ opacity: loading ? 1 : 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      pointerEvents={loading ? "auto" : "none"}
    >
      <motion.div
        className="max-w-md w-full mx-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Premium Header */}
        <motion.div variants={itemVariants} className="text-center mb-12">
          <motion.div className="relative w-24 h-24 mx-auto mb-6">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: loading ? 3 : 0.8, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute inset-1 bg-black rounded-full flex items-center justify-center text-4xl"
              variants={pulseVariants}
              initial="initial"
              animate="animate"
            >
              🚀
            </motion.div>
          </motion.div>

          <h2 className="text-3xl font-bold text-white mb-2">Launching Your Idea</h2>
          <p className="text-gray-400 text-sm">
            Our AI is analyzing and optimizing your startup
          </p>
        </motion.div>

        {/* Progress Bar */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="relative h-2 bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progress, 100)}%` }}
              transition={{ duration: loading ? 0.5 : 0.3, ease: loading ? "easeOut" : "easeInOut" }}
            />
          </div>
          <div className="text-right mt-2">
            <span className="text-xs text-gray-400 font-medium">
              {Math.floor(Math.min(progress, 100))}%
            </span>
          </div>
        </motion.div>

        {/* Steps */}
        <motion.div variants={itemVariants} className="space-y-3 mb-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 ${
                index <= currentStep
                  ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/50"
                  : "bg-gray-800/30 border border-gray-700/50"
              }`}
              whileHover={{ scale: 1.02 }}
            >
              <motion.div
                className="text-2xl"
                animate={index === currentStep ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: loading ? 0.6 : 0.2, repeat: Infinity }}
              >
                {step.icon}
              </motion.div>
              <div className="flex-1">
                <p className={`text-sm font-medium ${
                  index <= currentStep ? "text-white" : "text-gray-500"
                }`}>
                  {step.label}
                </p>
              </div>
              {index < currentStep && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-5 h-5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center"
                >
                  <span className="text-white text-xs">✓</span>
                </motion.div>
              )}
              {index === currentStep && (
                <motion.div
                  className="w-5 h-5 border-2 border-purple-500 rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: loading ? 1 : 0.3, repeat: Infinity }}
                />
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* Premium Particles */}
        <motion.div variants={itemVariants} className="relative h-20">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
              animate={{
                x: Math.cos((i / 6) * Math.PI * 2) * 40,
                y: Math.sin((i / 6) * Math.PI * 2) * 40,
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: loading ? 2 : 0.5,
                repeat: Infinity,
                delay: i * 0.3,
              }}
              style={{
                left: "50%",
                top: "50%",
                transformOrigin: "center",
              }}
            />
          ))}
        </motion.div>

        {/* Footer Text */}
        <motion.div variants={itemVariants} className="text-center mt-8">
          <p className="text-xs text-gray-500">
            This may take a few moments while we process your data
          </p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}