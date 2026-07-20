import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
export default function StepsTimeline({ containerVariants }) {
  return <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.1, duration: 0.6 }}
    className="mb-12"
  >
    <div className="bg-gradient-to-r from-neutral-800/50 to-neutral-900/50 border border-neutral-700/50 backdrop-blur-sm rounded-2xl p-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { step: 1, title: 'Fill Details', desc: 'Tell us about your startup' },
          { step: 2, title: 'AI Creates', desc: 'Our AI generates your logo' },
          { step: 3, title: 'Download', desc: 'Get your professional logo' }
        ].map((item, idx) => (
          <motion.div
            key={idx}
            variants={containerVariants}
            className="flex items-start gap-4"
          >
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-linear-to-br from-blue-500/30 to-purple-500/30 border border-blue-500/50">
                <span className="text-lg font-bold text-blue-300">{item.step}</span>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-white text-lg">{item.title}</h3>
              <p className="text-neutral-400 text-sm">{item.desc}</p>
            </div>
            {idx < 2 && <ArrowRight className="hidden md:block h-5 w-5 text-neutral-600 mt-2 ml-2" />}
          </motion.div>
        ))}
      </div>
    </div>
  </motion.div>
}