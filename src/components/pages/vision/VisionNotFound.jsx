import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lightbulb, Plus, Home, AlertCircle } from 'lucide-react';
import { CosmosButton, Eyebrow } from '@/components/cosmos';

export default function VisionNotFound({
  title = "Vision Not Available",
  message = "This Vision may have been removed, converted into a startup, or the link might be incorrect.",
}) {
  const navigate = useNavigate();

  return (
    <div className="min-h-[75vh] w-full flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="max-w-md w-full text-center cosmos-card p-8 rounded-2xl border border-white/10 bg-gradient-to-b from-[#0e1118] to-[#07090d] shadow-2xl relative overflow-hidden"
      >
        {/* Glow backdrop effect */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-gold/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shadow-inner">
            <AlertCircle size={32} />
          </div>

          <div className="space-y-2">
            <Eyebrow className="justify-center">404 · Not Found</Eyebrow>
            <h1 className="font-display text-2xl font-bold text-star">{title}</h1>
            <p className="text-sm text-dim leading-relaxed">{message}</p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <CosmosButton
              variant="primary"
              size="sm"
              onClick={() => navigate('/ideation')}
              className="justify-center gap-2"
            >
              <Lightbulb size={16} /> Explore Visions
            </CosmosButton>

            <CosmosButton
              variant="ghost"
              size="sm"
              onClick={() => navigate('/vision/new')}
              className="justify-center gap-2"
            >
              <Plus size={16} /> Create Vision
            </CosmosButton>
          </div>

          <div className="pt-4 border-t border-white/[0.06]">
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center gap-1.5 text-xs text-dim hover:text-star transition-colors"
            >
              <Home size={14} /> Return to Dashboard
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
