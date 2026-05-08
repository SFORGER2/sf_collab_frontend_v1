import { motion } from "framer-motion";
import { Loader2, Sparkles } from "lucide-react";
import InfluencerApplicationForm from "./InfluencerApplicationForm";
import { useEffect, useState } from "react";
import { applicationAPI } from "@/utils/APIs/applicationAPI";
import { useSelector } from "react-redux";

export default function InfluencerApplication() {
  const [allApplications, setAllApplications] = useState([]);
  const { user } = useSelector((state) => state.auth);
  useEffect(() => {
    async function fetchApplications() {
      const response = await applicationAPI.getAll({ page: 1, per_page: 1000 });
      setAllApplications(response.data.applications || []);
    }
    fetchApplications();
  }, []);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden py-12 px-4 sm:px-6 lg:px-8">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-600/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-6 h-6 text-blue-400" />
            <span className="text-sm font-semibold text-blue-400 uppercase tracking-wider">Become a Co-Builder</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
            Influencer Application
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Join us as a <span className="font-semibold text-blue-400">Strategic Partner</span> and help shape the future of SForger
          </p>
        </motion.div>

        {/* Form Card */}
        <InfluencerApplicationForm />
        

        {/* Influencer Applications Review for Admins */}
        {
          user?.role === 'admin' && (
        
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-8 p-6 bg-gradient-to-br from-slate-800/40 to-slate-700/20 rounded-xl border border-slate-700/50"
            >
              <h3 className="text-lg font-semibold mb-4 text-purple-300">⭐ Influencer Applications</h3>
              <ul className="space-y-3 max-h-96 overflow-y-auto">
                {allApplications
                  .filter(item => item.application_type === 'influencer')
                  .map((app) => (
                    <li key={app.id} className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/30 hover:border-slate-500/50 transition">
                      <div className="font-medium text-purple-300">{app.name}</div>
                      <p className="text-xs text-slate-400 mt-1">📧 {app.email}</p>
                      <p className="text-xs text-slate-400">🌍 {app.country}</p>
                      <div className="text-xs text-slate-300 mt-2">
                        <p><strong>Niche:</strong> {app.data?.niche}</p>
                        <p><strong>Followers:</strong> {app.data?.followers}</p>
                        <p><strong>Audience Fit:</strong> {app.data?.audienceFit}</p>
                        <p><strong>Early Partner:</strong> {app.data?.earlyPartner}</p>
                      </div>
                      <p className="text-xs text-slate-400 mt-2">{new Date(app.created_at).toLocaleDateString()}</p>
                    </li>
                  ))}
              </ul>
            </motion.div>
          )}
      </div>
    </div>
  );
}
