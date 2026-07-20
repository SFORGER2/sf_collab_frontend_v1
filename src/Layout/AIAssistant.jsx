// src/Layout/AIAssistant.jsx
// SF Assistant v2 — upgraded chat widget
// Integration guide: POST /api/assistant/chat
// UX contract: action_proposed → confirmation card → re-send with execute=true

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { X, Sparkles, ChevronLeft, RotateCw, CheckCircle2, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';
import ChatInput from '@/components/chat (previous)/ChatInput';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import assistantService, { APIError } from '@/services/assistantService';
import TypingIndicator from '@/components/assistant/TypingIndicator';
import SourceCitations from '@/components/assistant/SourceCitations';
import ConversationHistory from '@/components/assistant/ConversationHistory';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const FOCUS_RING =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950';

function formatTime(iso) {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

// ─── Message Bubble ───────────────────────────────────────────────────────────

const MessageBubble = ({ msg, isOwn }) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={cn('flex flex-col gap-1', isOwn ? 'items-end' : 'items-start')}
    >
      <div
        className={cn(
          'max-w-[88%] rounded-xl px-3 py-2.5 text-xs font-roboto leading-relaxed',
          isOwn
            ? 'bg-blue-600/25 border border-blue-500/30 text-white'
            : 'bg-zinc-900/60 border border-white/8 text-zinc-200'
        )}
      >
        {msg.content}
      </div>

      {/* Sources (grounded answers) */}
      {!isOwn && msg.sources && (
        <div className="w-full max-w-[88%]">
          <SourceCitations sources={msg.sources} confidence={msg.confidence} />
        </div>
      )}

      {/* Timestamp */}
      {msg.timestamp && (
        <span className="text-[9px] text-zinc-600 font-mono px-1">
          {formatTime(msg.timestamp)}
        </span>
      )}
    </motion.div>
  );
};

// ─── Action Confirmation Card (UX contract from integration guide) ─────────────

const ActionConfirmCard = ({ proposal, onConfirm, onCancel, loading }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.25, ease: 'easeOut' }}
    className="rounded-xl border border-amber-500/25 font-roboto overflow-hidden"
    style={{ background: 'linear-gradient(135deg, #1a1100 0%, #0a0a0a 100%)' }}
    role="dialog"
    aria-modal="false"
    aria-label={`Confirm action: ${proposal.action}`}
  >
    {/* Header */}
    <div className="flex items-center gap-2 px-3 py-2.5 border-b border-amber-500/15">
      <span className="flex items-center gap-1.5 text-[10px] font-semibold text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded-full px-2.5 py-1">
        <Sparkles size={9} aria-hidden="true" />
        Action Proposed
      </span>
    </div>

    {/* Body */}
    <div className="px-3 py-3">
      <p className="text-xs text-zinc-300 leading-relaxed mb-2.5">
        {proposal.description}
      </p>

      {/* Params */}
      {proposal.params && Object.keys(proposal.params).length > 0 && (
        <div className="mb-3 space-y-1">
          {Object.entries(proposal.params).map(([k, v]) => (
            <div key={k} className="flex items-baseline gap-2">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider w-20 shrink-0">{k}</span>
              <span className="text-[11px] text-zinc-300 truncate">{String(v)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Buttons */}
      <div className="flex items-center gap-2 mt-2">
        <button
          onClick={onConfirm}
          disabled={loading}
          className={cn(
            'flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2 rounded-xl transition-all duration-200',
            'bg-amber-500/90 hover:bg-amber-400 text-zinc-950 disabled:opacity-50 disabled:pointer-events-none',
            FOCUS_RING
          )}
          aria-label="Confirm and execute action"
        >
          {loading ? (
            <RotateCw size={12} className="animate-spin" aria-hidden="true" />
          ) : (
            <CheckCircle2 size={12} aria-hidden="true" />
          )}
          {loading ? 'Executing…' : 'Confirm'}
        </button>
        <button
          onClick={onCancel}
          disabled={loading}
          className={cn(
            'flex-1 text-xs font-semibold py-2 rounded-xl border border-white/10 text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-all duration-200 disabled:opacity-50',
            FOCUS_RING
          )}
          aria-label="Cancel action"
        >
          Cancel
        </button>
      </div>
    </div>
  </motion.div>
);

// ─── Error / Busy Banner ───────────────────────────────────────────────────────

const ErrorBanner = ({ message, isBusy, onRetry }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    className="rounded-xl border border-amber-500/25 bg-amber-500/8 px-3 py-2.5 flex items-start gap-2 font-roboto"
    role="alert"
  >
    <AlertTriangle size={13} className="text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
    <div className="flex-1 min-w-0">
      <p className="text-xs text-amber-200 leading-relaxed">
        {isBusy ? 'The assistant is busy right now.' : (message || 'Something went wrong.')}
      </p>
    </div>
    {onRetry && (
      <button
        onClick={onRetry}
        className={cn('text-[10px] font-semibold text-amber-400 hover:text-amber-300 transition-colors shrink-0', FOCUS_RING)}
      >
        Retry
      </button>
    )}
  </motion.div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AIAssistant({ isOpen, onClose, isMobile = false, callback = () => {} }) {
  const { user: currentUser } = useSelector((state) => state.auth);


  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null); // { message, isBusy, retryFn }
  const [conversationId, setConversationId] = useState(null);

  // Pending action proposal (action_proposed response)
  const [pendingAction, setPendingAction] = useState(null); // { proposal, originalMessage }
  const [isConfirming, setIsConfirming] = useState(false);

  const [showHistory, setShowHistory] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const messageEndRef = useRef(null);

  // Auto-scroll
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: shouldReduceMotion ? 'auto' : 'smooth' });
  }, [messages, isLoading, pendingAction, shouldReduceMotion]);

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setError(null);
      setShowHistory(false);
    }
  }, [isOpen]);

  const pushMessage = useCallback((content, role = 'user', extras = {}) => {
    const msg = {
      id: `${role}-${Date.now()}`,
      content,
      role,
      timestamp: new Date().toISOString(),
      ...extras,
    };
    setMessages((prev) => [...prev, msg]);
    return msg;
  }, []);

  // ── Send message ──────────────────────────────────────────────────────────

  const sendMessage = useCallback(
    async (content, executeFlag = false) => {
      if (!content?.trim()) return;

      setError(null);

      if (!executeFlag) {
        pushMessage(content.trim(), 'user');
        setDraft('');
      }

      setIsLoading(true);

      const doSend = async () => {
        try {
          const res = await assistantService.chat({
            message: content.trim(),
            conversationId,
            execute: executeFlag,
          });

          // Persist conversation thread
          if (res.conversation_id) setConversationId(res.conversation_id);

          if (res.type === 'answer') {
            pushMessage(res.answer || 'No response.', 'ai', {
              sources: res.sources,
              confidence: res.confidence,
            });
            setPendingAction(null);
          } else if (res.type === 'action_proposed') {
            setPendingAction({ proposal: res, originalMessage: content.trim() });
          } else if (res.type === 'action_executed') {
            setPendingAction(null);
            const successText =
              res.description || `Action "${res.action}" executed successfully.`;
            pushMessage(successText, 'ai');
          }
        } catch (e) {
          const isBusy = e instanceof APIError && e.isBusy;
          setError({
            message: e.message,
            isBusy,
            retryFn: () => doSend(),
          });
        } finally {
          setIsLoading(false);
        }
      };

      await doSend();
    },
    [conversationId, pushMessage]
  );

  // ── Action confirmation ───────────────────────────────────────────────────

  const handleConfirm = useCallback(async () => {
    if (!pendingAction) return;
    setIsConfirming(true);
    setPendingAction(null);
    await sendMessage(pendingAction.originalMessage, true);
    setIsConfirming(false);
  }, [pendingAction, sendMessage]);

  const handleCancel = useCallback(() => {
    setPendingAction(null);
    pushMessage('Action cancelled.', 'ai');
  }, [pushMessage]);

  // ── Restore conversation ──────────────────────────────────────────────────

  const handleSelectConversation = useCallback(async (id) => {
    setShowHistory(false);
    setIsLoading(true);
    setError(null);
    try {
      const msgs = await assistantService.getConversationMessages(id);
      const normalized = (Array.isArray(msgs) ? msgs : msgs?.messages ?? []).map((m) => ({
        id: m.id || `msg-${Math.random()}`,
        content: m.content || m.message || '',
        role: m.role || (m.sender_id === 'ai' ? 'ai' : 'user'),
        timestamp: m.created_at || m.timestamp,
        sources: m.sources,
        confidence: m.confidence,
      }));
      setMessages(normalized);
      setConversationId(id);
    } catch (e) {
      toast.error('Could not load conversation.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── File upload (admin) ───────────────────────────────────────────────────

  const handleFileUpload = useCallback(async (file) => {
    if (!file) return null;
    try {
      await assistantService.ingestFile(file, {});
      toast.success('File uploaded to knowledge base.');
    } catch {
      toast.error('Upload failed.');
    }
    return null;
  }, []);

  if (!currentUser) return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,700&family=Roboto:wght@300;400;500;700&display=swap');
        .font-editorial { font-family: 'Newsreader', Georgia, serif; }
        .font-roboto { font-family: 'Roboto', -apple-system, BlinkMacSystemFont, sans-serif; }
        @media (prefers-reduced-motion: reduce) {
          .motion-safe-transition { transition: none !important; transform: none !important; }
        }
      `}</style>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 280, damping: 28 }}
            className={cn(
              'fixed z-[1000000] flex font-roboto overflow-hidden',
              'border border-white/10 shadow-2xl',
              // Mobile: fullscreen
              'inset-0 rounded-none flex-col',
              // Desktop: floating panel
              'md:inset-auto md:bottom-20 md:right-4 md:w-[380px] md:h-[72vh] md:rounded-2xl md:flex-row'
            )}
            style={{ background: 'linear-gradient(160deg, #0d0d14 0%, #0a0a0f 100%)' }}
          >
            {/* ─── Conversation history sidebar (desktop only) ─────────── */}
            <AnimatePresence>
              {showHistory && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 160, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="hidden md:flex flex-col border-r border-white/8 bg-zinc-950/80 overflow-hidden shrink-0"
                >
                  <ConversationHistory
                    activeConversationId={conversationId}
                    onSelectConversation={handleSelectConversation}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* ─── Main chat area ──────────────────────────────────────── */}
            <div className="flex flex-col flex-1 min-w-0 h-full">
              {/* Header */}
              <div className="shrink-0 h-12 flex items-center justify-between px-3 bg-zinc-950/90 border-b border-white/8 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  {/* History toggle */}
                  <button
                    onClick={() => setShowHistory((v) => !v)}
                    className={cn(
                      'hidden md:flex p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800/60 transition-all duration-200',
                      showHistory && 'text-blue-400 bg-blue-500/10',
                      FOCUS_RING
                    )}
                    aria-label="Toggle conversation history"
                    aria-expanded={showHistory}
                  >
                    <ChevronLeft
                      size={14}
                      className={cn('transition-transform duration-200 motion-safe-transition', showHistory ? 'rotate-180' : '')}
                      aria-hidden="true"
                    />
                  </button>

                  <div className="p-1.5 rounded-lg bg-blue-500/15 border border-blue-500/20" aria-hidden="true">
                    <Sparkles size={13} className="text-blue-400" />
                  </div>
                  <span className="text-sm font-semibold text-white">SF Assistant</span>

                  {conversationId && (
                    <span className="text-[9px] text-zinc-600 font-mono hidden sm:block">
                      #{conversationId}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => {
                    onClose();
                    if (isMobile) callback();
                  }}
                  className={cn(
                    'p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-all duration-200',
                    FOCUS_RING
                  )}
                  aria-label="Close SF Assistant"
                >
                  <X size={15} aria-hidden="true" />
                </button>
              </div>

              {/* Messages */}
              <div
                className="flex-1 overflow-y-auto overscroll-contain py-3 px-3 space-y-3 bg-zinc-950/40"
                role="log"
                aria-label="Conversation"
                aria-live="polite"
              >
                {messages.length === 0 && !isLoading && (
                  <div className="flex flex-col items-center justify-center h-full py-8 text-center">
                    <div
                      className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-3"
                      aria-hidden="true"
                    >
                      <Sparkles size={18} className="text-blue-400" />
                    </div>
                    <p className="text-xs text-zinc-500 leading-relaxed max-w-[200px]">
                      Ask me anything about your documents and workspaces.
                    </p>
                  </div>
                )}

                {messages.map((msg) => (
                  <MessageBubble key={msg.id} msg={msg} isOwn={msg.role === 'user'} />
                ))}

                {/* Action Proposal Card */}
                {pendingAction && !isLoading && (
                  <ActionConfirmCard
                    proposal={pendingAction.proposal}
                    onConfirm={handleConfirm}
                    onCancel={handleCancel}
                    loading={isConfirming}
                  />
                )}

                {/* Typing indicator */}
                {isLoading && <TypingIndicator />}

                {/* Error banner */}
                {error && !isLoading && (
                  <ErrorBanner
                    message={error.message}
                    isBusy={error.isBusy}
                    onRetry={error.retryFn}
                  />
                )}

                <div ref={messageEndRef} />
              </div>

              {/* Input */}
              <div className="shrink-0 border-t border-white/8 bg-zinc-950/80">
                {currentUser.role === 'admin' && (
                  <p className="text-[10px] text-zinc-600 px-3 pt-2 italic font-roboto">
                    Admins can upload documents for context.
                  </p>
                )}
                <ChatInput
                  value={draft}
                  onChange={setDraft}
                  onSend={(content) => sendMessage(content)}
                  onFileUpload={handleFileUpload}
                  disabled={isLoading || isConfirming}
                  allowFiles={currentUser.role === 'admin'}
                  acceptMultipleFiles={false}
                  allowImages={false}
                  allowEmojis={false}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
