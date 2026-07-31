// src/components/common/AssistantFAB.jsx
// Floating Action Button — fires sfassistant:open so Layout.jsx opens the AI panel.
// Drop onto any page that needs quick assistant access without navigating away.

import React from 'react';
import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const FOCUS_RING =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-void';

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
        // Shape & spacing — pill, matching every other cosmos action
        'flex items-center gap-2 px-4 py-3 rounded-full',
        // Typography — theme-aware ink so the label stays visible in both themes
        'text-sm font-medium text-[var(--color-star)]',
        // Violet is the intelligence layer's colour across the whole product
        'border border-[var(--border)] backdrop-blur-md',
        'shadow-[0_8px_30px_-8px_rgba(139,108,255,0.5)]',
        'transition-colors duration-200 hover:text-[var(--color-violet)] hover:border-[var(--color-violet)]/60',
        FOCUS_RING,
        className
      )}
      style={{
        // Translucent-violet glass over the surface; fully theme-aware so the
        // pill never reads as light-with-light-text on the light theme.
        background:
          'linear-gradient(135deg, color-mix(in_srgb, var(--color-violet) 22%, var(--color-panel)) 0%, var(--color-panel) 100%)',
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
