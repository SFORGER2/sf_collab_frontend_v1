import React from 'react';
import { useUserVision } from '@/hooks/useUserVision';
import { WorkspaceEmptyState } from './WorkspaceEmptyState';
import { Loader2 } from 'lucide-react';

/**
 * VisionWorkspaceGuard Component
 * Route guard that ensures users have a registered Vision before accessing Workspace features.
 * If no Vision exists, renders the Cosmos-styled WorkspaceEmptyState.
 */
export function VisionWorkspaceGuard({ children }) {
  const { hasVision, loading } = useUserVision();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-dim">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
        <span className="font-mono text-xs uppercase tracking-widest">Validating Vision Access...</span>
      </div>
    );
  }

  if (!hasVision) {
    return <WorkspaceEmptyState />;
  }

  return children;
}

export default VisionWorkspaceGuard;
