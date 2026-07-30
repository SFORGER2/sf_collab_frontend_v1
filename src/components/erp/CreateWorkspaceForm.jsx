// src/components/erp/CreateWorkspaceForm.jsx
// Task 5: Direct workspace creation is no longer allowed.
// Workspaces are only created after a Vision is registered.
// This component now redirects users to the Vision creation flow.
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Rocket, Lock, Sparkles, ArrowRight } from 'lucide-react';

export function CreateWorkspaceForm({ onSuccess }) {
  const navigate = useNavigate();

  const handleCreateVision = () => {
    navigate('/vision/create');
    if (onSuccess) onSuccess();
  };

  return (
    <div className="bg-[#0d0a1a] border border-gold/20 rounded-2xl p-8 w-full max-w-md mx-auto text-center relative overflow-hidden">
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full blur-3xl opacity-20"
        style={{ background: '#ffbf5e' }}
      />

      {/* Icon */}
      <div className="relative inline-flex items-center justify-center mb-5">
        <div className="w-16 h-16 rounded-2xl bg-gold/10 border border-gold/30 flex items-center justify-center text-gold">
          <Rocket className="w-8 h-8" />
        </div>
        <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-[#0d0a1a] border border-gold/40 flex items-center justify-center text-gold">
          <Lock className="w-3.5 h-3.5" />
        </div>
      </div>

      <h2 className="text-xl font-bold text-white mb-2">
        Vision Registration Required
      </h2>
      <p className="text-sm text-zinc-400 mb-6 max-w-xs mx-auto leading-relaxed">
        Your Workspace is created automatically when you register a Vision.
        <br />
        <span className="text-gold/80">Create and register a Vision to unlock your Workspace.</span>
      </p>

      <button
        onClick={handleCreateVision}
        className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-gold/10 border border-gold/40 text-gold font-semibold text-sm hover:bg-gold/20 transition-all"
      >
        <Sparkles className="w-4 h-4" />
        Create Vision
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}