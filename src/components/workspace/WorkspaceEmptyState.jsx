import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Rocket, Lock, Sparkles, ArrowRight, ShieldAlert, Layers } from 'lucide-react';
import { Panel, Display, Eyebrow, Lede, CosmosButton } from '@/components/cosmos';

/**
 * WorkspaceEmptyState Component
 * Displayed when a user attempts to access a Workspace without first registering a Vision.
 * Implements SFCollab Cosmos Design System aesthetics.
 */
export function WorkspaceEmptyState({
  title = "Workspace Locked",
  message = "Create and register a Vision to unlock your operational Workspace.",
  description = "SFCollab Workspaces are structured around an active, registered Vision. A Vision defines your project's problem statement, outcome goals, team roles, and execution score — serving as the foundation for your operational environment.",
  showBackToDashboard = true,
}) {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4 sm:p-8">
      <Panel className="cosmos-panel-neon p-8 sm:p-12 max-w-2xl w-full text-center relative overflow-hidden" accent="#ffbf5e">
        {/* Ambient Glow */}
        <div 
          className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-3xl opacity-20"
          style={{ background: '#ffbf5e' }}
        />

        {/* Icon & Lock Badge */}
        <div className="relative inline-flex items-center justify-center mb-6">
          <div className="w-20 h-20 rounded-2xl bg-gold/10 border border-gold/30 flex items-center justify-center text-gold shadow-lg shadow-gold/10">
            <Rocket className="w-10 h-10" />
          </div>
          <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-void border border-gold/40 flex items-center justify-center text-gold shadow">
            <Lock className="w-4 h-4" />
          </div>
        </div>

        <Eyebrow className="mb-2 text-gold">Vision Required</Eyebrow>
        <Display size="lg" className="mb-3 text-star font-bold">
          {title}
        </Display>

        <Lede className="mb-6 text-dim max-w-lg mx-auto">
          {message}
        </Lede>

        {/* Informative Explanation Box */}
        <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 sm:p-5 mb-8 text-left text-sm text-dim space-y-2">
          <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-gold font-semibold">
            <ShieldAlert className="w-4 h-4" />
            Why is a Vision required first?
          </div>
          <p className="leading-relaxed">
            {description}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <CosmosButton
            variant="primary"
            onClick={() => navigate('/vision/create')}
            className="w-full sm:w-auto px-8 py-3 text-base"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Create Vision
            <ArrowRight className="w-4 h-4 ml-2" />
          </CosmosButton>

          {showBackToDashboard && (
            <button
              onClick={() => navigate('/')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl border border-white/10 text-star hover:bg-white/10 text-sm font-medium transition-colors"
            >
              Return to Dashboard
            </button>
          )}
        </div>
      </Panel>
    </div>
  );
}

export default WorkspaceEmptyState;
