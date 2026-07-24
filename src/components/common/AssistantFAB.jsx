// src/components/common/AssistantFAB.jsx
// Floating Action Button — fires sfassistant:open so Layout.jsx opens the AI panel.
// Drop onto any page that needs quick assistant access without navigating away.

import React from 'react';
import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const FOCUS_RING =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950';

/**
 * Floating Action Button that opens the SF Assistant panel.
 *
 * Dispatches a custom event that Layout.jsx already listens to, so there is
 * no prop-drilling needed — just drop this anywhere in the page tree.
 *
 * @param {{ workspaceId?: number, label?: string, className?: string }} props
 */
export default function AssistantFAB({
  workspaceId,
  label = 'SF Assistant',
  className,
}) {
  const handleClick = () => {
    window.dispatchEvent(
      new CustomEvent('sfassistant:open', {
        detail: { workspaceId },
      })
    );
  };

  return (
    <motion.button
      onClick={handleClick}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      className={cn(
        // Position — fixed, bottom-right, clear of ChatDock on mobile
        'fixed bottom-20 right-4 z-[9999]',
        // Shape & spacing
        'flex items-center gap-2 px-4 py-3 rounded-2xl',
        // Typography
        'text-sm font-semibold text-white',
        // Depth
        'shadow-2xl shadow-blue-900/50',
        // Border glow
        'border border-blue-400/30',
        // Smooth transitions
        'transition-colors duration-200',
        // Accessibility
        FOCUS_RING,
        className
      )}
      style={{
        background:
          'linear-gradient(135deg, #1e40af 0%, #1d4ed8 60%, #2563eb 100%)',
      }}
      aria-label={`Open SF Assistant${workspaceId ? ` for workspace ${workspaceId}` : ''}`}
    >
      {/* Icon — always visible */}
      <Sparkles size={15} aria-hidden="true" />

      {/* Label hidden on xs screens to keep button compact on small phones */}
      <span className="hidden sm:inline whitespace-nowrap">{label}</span>
    </motion.button>
  );
}
