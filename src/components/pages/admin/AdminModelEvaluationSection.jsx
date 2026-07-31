/* eslint-disable no-unused-vars */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminModelEvaluationSection = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-br from-gray-900/80 to-slate-900/60 p-6 rounded-2xl border border-white/10 shadow-2xl mb-8 relative overflow-hidden backdrop-blur-md">
      {/* Background Decorative Glow */}
      <div className="absolute -top-10 -left-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
        <span>🤖</span> Model Evaluation Harness Panel
      </h2>
      <p className="text-sm text-gray-400 mb-6">
        Evaluate and compare baseline task priority classifiers (v1 and v2) using a frozen ground-truth dataset. View Accuracy, Precision, Recall, and Confusion Matrices side-by-side.
      </p>

      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={() => navigate('/admin/model-evaluation')}
        className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold rounded-xl transition duration-200 flex items-center justify-center gap-3 border border-purple-400/20 shadow-lg shadow-purple-500/10 text-sm"
      >
        <Activity className="w-4 h-4 text-white" />
        <span>Open Model Evaluation Dashboard</span>
        <ArrowRight className="w-4 h-4 text-white" />
      </motion.button>
    </div>
  );
};

export default AdminModelEvaluationSection;
