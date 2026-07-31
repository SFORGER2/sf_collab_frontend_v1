// src/components/assistant/ConversationHistory.jsx
// Lists previous conversations and allows restoring a thread.
// API: GET /api/assistant/conversations → max 50, newest first
// API: GET /api/assistant/conversations/:id/messages → full history

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Clock, ChevronRight, Loader2, AlertTriangle } from 'lucide-react';
import { getConversations } from '@/services/assistantService';

const FOCUS_RING =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950';

function timeAgo(dateStr) {
  if (!dateStr) return '';
  try {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  } catch {
    return '';
  }
}

/**
 * @param {{ activeConversationId: number|null, onSelectConversation: (id: number) => void }} props
 */
export default function ConversationHistory({ activeConversationId, onSelectConversation }) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getConversations();
      setConversations(Array.isArray(data) ? data : (data?.conversations ?? []));
    } catch (e) {
      setError(e.message || 'Could not load conversations');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="flex flex-col h-full font-roboto">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-[var(--border)] shrink-0">
        <MessageSquare size={13} className="text-blue-400" aria-hidden="true" />
        <span className="text-xs font-semibold text-[var(--color-star)]">History</span>
      </div>

      <div className="flex-1 overflow-y-auto overscroll-contain py-1.5 space-y-0.5">
        {loading && (
          <div className="flex items-center justify-center py-8" aria-label="Loading conversations" aria-busy="true">
            <Loader2 size={16} className="text-[var(--color-dim)] animate-spin" aria-hidden="true" />
          </div>
        )}

        {error && !loading && (
          <div className="px-3 py-4 text-center" role="alert">
            <AlertTriangle size={14} className="text-amber-400 mx-auto mb-1.5" aria-hidden="true" />
            <p className="text-[11px] text-[var(--color-dim)] leading-relaxed">{error}</p>
            <button
              onClick={load}
              className={`mt-2 text-[11px] text-blue-400 hover:text-[var(--color-star)] transition-colors ${FOCUS_RING}`}
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && conversations.length === 0 && (
          <div className="px-3 py-6 text-center">
            <MessageSquare size={22} className="text-[var(--color-dim)] mx-auto mb-2" aria-hidden="true" />
            <p className="text-[11px] text-[var(--color-dim)] leading-relaxed">No conversations yet.</p>
          </div>
        )}

        <AnimatePresence>
          {!loading && conversations.map((conv, i) => {
            const isActive = conv.id === activeConversationId;
            return (
              <motion.button
                key={conv.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04, duration: 0.25, ease: 'easeOut' }}
                onClick={() => onSelectConversation(conv.id)}
                className={`w-full text-left flex items-center gap-2.5 px-3 py-2.5 rounded-lg mx-1.5 transition-all duration-200 group ${FOCUS_RING} ${
                  isActive
                    ? 'bg-[var(--color-violet)]/15 border border-[var(--color-violet)]/30 text-[var(--color-star)]'
                    : 'hover:bg-[var(--muted)] text-[var(--color-dim)] hover:text-[var(--color-star)] border border-transparent'
                }`}
                aria-current={isActive ? 'page' : undefined}
                aria-label={`Open conversation: ${conv.title || conv.preview || 'Untitled'}`}
              >
                <MessageSquare
                  size={12}
                  className={isActive ? 'text-blue-400' : 'text-[var(--color-dim)] group-hover:text-[var(--color-star)]'}
                  aria-hidden="true"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-medium truncate leading-tight">
                    {conv.title || conv.preview || 'Untitled conversation'}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Clock size={8} className="text-[var(--color-dim)] shrink-0" aria-hidden="true" />
                    <span className="text-[9px] text-[var(--color-dim)]">
                      {timeAgo(conv.updated_at || conv.created_at)}
                    </span>
                  </div>
                </div>
                <ChevronRight size={10} className="text-[var(--color-dim)] group-hover:text-[var(--color-star)] shrink-0" aria-hidden="true" />
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
