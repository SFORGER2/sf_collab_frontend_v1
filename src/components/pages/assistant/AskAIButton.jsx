// src/components/pages/assistant/AskAIButton.jsx
// Task 7 — "Ask About This Document" button
// Drop onto any document or workspace page to open the AI assistant with context.

import React from 'react';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const FOCUS_RING =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950';

/**
 * Dispatches a custom event that Layout.jsx's AIAssistant listens to.
 * This avoids prop-drilling through the entire page tree.
 *
 * @param {{ workspaceId?: number, label?: string, className?: string }} props
 */
export default function AskAIButton({ workspaceId, label = 'Ask AI', className }) {
  const handleClick = () => {
    // Signal Layout to open the floating assistant
    window.dispatchEvent(
      new CustomEvent('sfassistant:open', {
        detail: { workspaceId },
      })
    );
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        'inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-roboto font-semibold',
        'bg-blue-500/15 border border-blue-500/25 text-blue-400',
        'hover:bg-blue-500/25 hover:border-blue-500/40 hover:text-white',
        'transition-all duration-200',
        FOCUS_RING,
        className
      )}
      aria-label={`${label}${workspaceId ? ` (workspace ${workspaceId})` : ''}`}
    >
      <Sparkles size={13} aria-hidden="true" />
      {label}
    </button>
  );
}
