// src/components/pages/assistant/AssistantChatPage.jsx
// Task 2 — Full-page conversational AI interface
// Task 7 — Entry point for document/workspace-specific AI queries
// API: POST /api/assistant/chat + GET /api/assistant/conversations

import React, { useState, useCallback, useRef, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Sparkles, Send, RotateCw, AlertTriangle, CheckCircle2,
  MessageSquare, ChevronLeft, FileText, X, ChevronRight, Plus, Pencil,
} from 'lucide-react';
import assistantService, { APIError } from '@/services/assistantService';
import SourceCitations from '@/components/assistant/SourceCitations';
import TypingIndicator from '@/components/assistant/TypingIndicator';
import ConversationHistory from '@/components/assistant/ConversationHistory';
import { cn } from '@/lib/utils';

// ─── Styles injected once ─────────────────────────────────────────────────────
const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,700&family=Roboto:wght@300;400;500;700&display=swap');
  .font-editorial { font-family: 'Newsreader', Georgia, serif; }
  .font-roboto { font-family: 'Roboto', -apple-system, BlinkMacSystemFont, sans-serif; }
  .assistant-scrollbar::-webkit-scrollbar { width: 4px; }
  .assistant-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .assistant-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 4px; }
  @media (prefers-reduced-motion: reduce) { .motion-safe-t { transition: none !important; transform: none !important; } }
`;

const FOCUS_RING =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950';

// ─── Quick prompts ────────────────────────────────────────────────────────────
const QUICK_PROMPTS = [
  'Summarize my latest documents',
  'What are the open tasks in this workspace?',
  'Schedule a meeting for tomorrow',
  'Create a task for the team',
];

// ─── Message bubble ───────────────────────────────────────────────────────────
const Bubble = ({ msg, isOwn, shouldReduceMotion }) => {
  if (!isOwn && msg.isSuccess) {
    return (
      <motion.div
        initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: 'easeOut' }}
        className="flex flex-col gap-1.5 items-start w-full max-w-[80%]"
      >
        <span className="text-[9px] font-roboto text-zinc-600 px-1">
          SF Assistant
        </span>
        <div className="w-full rounded-2xl border border-emerald-500/20 bg-emerald-950/20 backdrop-blur-sm p-4 font-roboto shadow-lg shadow-emerald-950/10">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
              <CheckCircle2 size={16} aria-hidden="true" />
            </div>
            <div className="space-y-1.5 flex-1 min-w-0">
              <h4 className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold">
                Action Executed Successfully
              </h4>
              <p className="text-sm font-semibold text-zinc-100 font-mono truncate">
                {msg.actionName}
              </p>
              {msg.actionDesc && (
                <p className="text-xs text-zinc-400 leading-relaxed font-roboto">
                  {msg.actionDesc}
                </p>
              )}

              {msg.params && Object.keys(msg.params).length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-emerald-500/10 space-y-1.5">
                  <span className="block text-[9px] text-zinc-500 uppercase tracking-wider font-mono">Parameters</span>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(msg.params).map(([k, v]) => (
                      <span key={k} className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-mono bg-zinc-900/60 border border-white/5 text-zinc-300">
                        <span className="text-zinc-500 mr-1">{k}:</span>
                        <span>{String(v)}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        {msg.timestamp && (
          <span className="text-[9px] font-mono text-zinc-700 px-1">
            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
      className={cn('flex flex-col gap-1.5', isOwn ? 'items-end' : 'items-start')}
    >
      {/* Author chip */}
      <span className="text-[9px] font-roboto text-zinc-600 px-1">
        {isOwn ? 'You' : 'SF Assistant'}
      </span>

      <div
        className={cn(
          'max-w-[80%] rounded-xl px-4 py-3 text-sm font-roboto leading-relaxed',
          isOwn
            ? 'bg-blue-600/20 border border-blue-500/30 text-white'
            : 'bg-zinc-900/60 border border-white/8 text-zinc-200'
        )}
      >
        {msg.content}
      </div>

      {/* Sources for AI answers */}
      {!isOwn && msg.sources && (
        <div className="w-full max-w-[80%]">
          <SourceCitations sources={msg.sources} confidence={msg.confidence} />
        </div>
      )}

      {/* Timestamp */}
      {msg.timestamp && (
        <span className="text-[9px] font-mono text-zinc-700 px-1">
          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      )}
    </motion.div>
  );
};

// ─── Action confirmation card (UX contract per integration guide) ─────────────
const ActionCard = ({ proposal, onConfirm, onCancel, confirming, onChangeDescription, onChangeParam, onChangeAction }) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempActionName, setTempActionName] = useState(proposal.action || '');

  // Synchronize internal state when proposal changes
  useEffect(() => {
    setTempActionName(proposal.action || '');
  }, [proposal.action]);

  const handleSaveActionName = () => {
    if (onChangeAction) {
      onChangeAction(tempActionName);
    }
    setIsEditingName(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 16, scale: 0.98 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      role="dialog"
      aria-label={`Confirm action: ${proposal.action}`}
      className="relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/70 backdrop-blur-xl max-w-xl mr-auto shadow-2xl shadow-zinc-950/50 w-full font-roboto"
    >
      {/* Decorative top amber glow bar */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-500/20 via-amber-500 to-amber-500/20" />

      {/* Header */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-white/5 bg-white/[0.01]">
        <div className="flex items-center gap-2">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </div>
          <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-semibold">
            Action Proposed
          </span>
        </div>
        <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
          Pending authorization
        </span>
      </div>

      <div className="p-6 space-y-5">
        {/* Action Name Field */}
        <div className="space-y-1.5">
          <label htmlFor="action-card-name" className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
            Action Name
          </label>
          {isEditingName ? (
            <div className="flex items-center gap-2">
              <input
                id="action-card-name"
                type="text"
                value={tempActionName}
                onChange={(e) => setTempActionName(e.target.value)}
                className="flex-1 text-sm bg-zinc-950 border border-white/10 rounded-xl px-3.5 py-2 text-white font-mono focus:outline-none focus:ring-1 focus:ring-amber-500/30 focus:border-amber-500/50 transition-all"
                // eslint-disable-next-line jsx-a11y/no-autofocus
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveActionName();
                  if (e.key === 'Escape') {
                    setTempActionName(proposal.action || '');
                    setIsEditingName(false);
                  }
                }}
              />
              <button
                onClick={handleSaveActionName}
                className="px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-400 hover:bg-amber-500/20 font-medium transition-all"
              >
                Save
              </button>
              <button
                onClick={() => setIsEditingName(false)}
                className="px-3 py-2 rounded-xl text-xs text-zinc-500 hover:text-zinc-400 font-medium transition-all"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="group flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.01] px-4 py-3 hover:bg-white/[0.02] hover:border-white/10 transition-all duration-200">
              <span className="text-sm font-mono text-zinc-200 font-medium">
                {proposal.action}
              </span>
              <button
                onClick={() => setIsEditingName(true)}
                disabled={confirming}
                className="opacity-0 group-hover:opacity-100 focus:opacity-100 text-zinc-500 hover:text-zinc-300 transition-all duration-150 p-1 hover:bg-white/5 rounded-lg"
                aria-label="Edit action name"
              >
                <Pencil size={13} />
              </button>
            </div>
          )}
        </div>

        {/* Parameters Grid */}
        {proposal.params && Object.keys(proposal.params).length > 0 &&
          Object.entries(proposal.params).filter(([k]) => k.toLowerCase() !== 'description').length > 0 && (
          <div className="space-y-2">
            <span className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
              Parameters
            </span>
            <div className="rounded-xl border border-white/5 bg-white/[0.01] overflow-hidden divide-y divide-white/5">
              {Object.entries(proposal.params)
                .filter(([k]) => k.toLowerCase() !== 'description')
                .map(([k, v]) => (
                  <div key={k} className="flex items-center px-4 py-2.5 hover:bg-white/[0.01] transition-colors gap-4">
                    <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider w-1/3 shrink-0">
                      {k}
                    </span>
                    <input
                      type="text"
                      value={String(v)}
                      onChange={(e) => onChangeParam && onChangeParam(k, e.target.value)}
                      disabled={confirming}
                      className="flex-1 text-xs bg-transparent border border-transparent hover:border-white/5 focus:border-amber-500/30 focus:bg-zinc-950/40 rounded-lg px-3 py-1.5 text-zinc-300 focus:outline-none focus:ring-1 focus:ring-amber-500/20 transition-all font-mono disabled:opacity-60"
                    />
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Description Section at the bottom */}
        <div className="space-y-1.5 pt-1">
          <label htmlFor="action-card-description" className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
            Description <span className="text-[9px] text-zinc-600 font-normal lowercase tracking-normal">(optional)</span>
          </label>
          <textarea
            id="action-card-description"
            value={proposal.params?.description !== undefined ? proposal.params.description : (proposal.description || '')}
            onChange={(e) => onChangeDescription && onChangeDescription(e.target.value)}
            disabled={confirming}
            rows={2}
            className="w-full text-xs bg-white/[0.01] border border-white/5 hover:border-white/10 focus:border-amber-500/30 focus:bg-zinc-950/40 rounded-xl px-4 py-3 text-zinc-200 focus:outline-none focus:ring-1 focus:ring-amber-500/20 resize-none font-roboto leading-relaxed transition-all duration-200 disabled:opacity-60 placeholder:text-zinc-600"
            placeholder="Add some context or optional notes for this execution..."
          />
        </div>

        {/* Action Buttons & Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-2">
          <div className="flex items-center gap-1.5 text-zinc-500 text-[10px] font-roboto italic">
            <span>{proposal.hint || 'Requires approval to execute'}</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onCancel}
              disabled={confirming}
              className={cn(
                'px-4 py-2 rounded-xl text-xs font-semibold border border-white/10 text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-all duration-200 disabled:opacity-40',
                FOCUS_RING
              )}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={confirming}
              className={cn(
                'px-5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-lg',
                'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 transition-all duration-200 disabled:opacity-50 shadow-amber-500/10',
                FOCUS_RING
              )}
            >
              {confirming ? (
                <RotateCw size={12} className="animate-spin" aria-hidden="true" />
              ) : (
                <CheckCircle2 size={12} aria-hidden="true" />
              )}
              {confirming ? 'Executing…' : 'Confirm'}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ─── Error banner ─────────────────────────────────────────────────────────────
const ErrorBanner = ({ message, isBusy, onRetry }) => (
  <div
    role="alert"
    className="flex items-start gap-3 px-4 py-3 rounded-xl border border-amber-500/20 bg-amber-500/8 font-roboto"
  >
    <AlertTriangle size={14} className="text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
    <p className="flex-1 text-xs text-amber-200 leading-relaxed">
      {isBusy ? 'The assistant is busy — please try again in a moment.' : message}
    </p>
    {onRetry && (
      <button
        onClick={onRetry}
        className={cn('text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors shrink-0', FOCUS_RING)}
      >
        Retry
      </button>
    )}
  </div>
);

// ─── Main page ────────────────────────────────────────────────────────────────
export default function AssistantChatPage() {
  const shouldReduceMotion = useReducedMotion();

  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [pendingAction, setPendingAction] = useState(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState(null);
  const [showHistory, setShowHistory] = useState(false);

  // Propose custom action commands state
  const [showMenu, setShowMenu] = useState(false);
  const [showSuggest, setShowSuggest] = useState(false);

  const inputRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: shouldReduceMotion ? 'auto' : 'smooth' });
  }, [messages, isLoading, pendingAction, shouldReduceMotion]);

  const pushMessage = useCallback((content, role, extras = {}) => {
    setMessages((prev) => [
      ...prev,
      { id: `${role}-${Date.now()}`, content, role, timestamp: new Date().toISOString(), ...extras },
    ]);
  }, []);

  const sendMessage = useCallback(
    async (content, executeFlag = false, customDescription = null) => {
      if (!content?.trim()) return;
      setError(null);

      const cleanText = content.trim();
      const isCustomPropose = cleanText.startsWith('/action ') || cleanText.startsWith('[Propose Action] ');

      if (isCustomPropose) {
        if (!executeFlag) {
          const actionDesc = cleanText.replace(/^\/action\s+/i, '').replace(/^\[Propose Action\]\s+/i, '');
          pushMessage(actionDesc || 'custom_action', 'user');
          setDraft('');
          setIsLoading(true);

          setTimeout(() => {
            setIsLoading(false);
            setPendingAction({
              proposal: {
                type: 'action_proposed',
                conversation_id: conversationId ?? 12345,
                description: '',
                action: actionDesc || 'custom_action',
                params: {},
                hint: 'Confirm to execute this action.',
              },
              originalMessage: cleanText,
            });
          }, 800);
          return;
        } else {
          setIsLoading(true);
          setTimeout(() => {
            setIsLoading(false);
            const finalDesc = customDescription || '';
            const paramsStr = pendingAction?.proposal?.params && Object.keys(pendingAction.proposal.params).length > 0
              ? ` with parameters: ${JSON.stringify(pendingAction.proposal.params)}`
              : '';
            setPendingAction(null);
            pushMessage(`Custom action executed successfully: "${finalDesc}"${paramsStr}`, 'ai', {
              isSuccess: true,
              actionName: pendingAction?.proposal?.action || 'custom_action',
              actionDesc: finalDesc || '',
              params: pendingAction?.proposal?.params
            });
          }, 1500);
          return;
        }
      }

      if (!executeFlag) {
        pushMessage(cleanText, 'user');
        setDraft('');
      }
      setIsLoading(true);

      const doSend = async () => {
        try {
          const res = await assistantService.chat({
            message: cleanText,
            conversationId,
            execute: executeFlag,
          });
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
            const finalDesc = customDescription || res.description || '';
            const paramsStr = pendingAction?.proposal?.params && Object.keys(pendingAction.proposal.params).length > 0
              ? ` with parameters: ${JSON.stringify(pendingAction.proposal.params)}`
              : '';
            pushMessage(`Action executed successfully: "${finalDesc}"${paramsStr}`, 'ai', {
              isSuccess: true,
              actionName: pendingAction?.proposal?.action || res.action || 'action',
              actionDesc: finalDesc || '',
              params: pendingAction?.proposal?.params
            });
          }
        } catch (e) {
          setError({
            message: e.message,
            isBusy: e instanceof APIError && e.isBusy,
            retryFn: doSend,
          });
        } finally {
          setIsLoading(false);
          inputRef.current?.focus();
        }
      };

      await doSend();
    },
    [conversationId, pushMessage, pendingAction]
  );

  const handleConfirm = useCallback(async () => {
    if (!pendingAction) return;
    const { originalMessage, proposal } = pendingAction;
    setIsConfirming(true);
    await sendMessage(originalMessage, true, proposal.description);
    setIsConfirming(false);
  }, [pendingAction, sendMessage]);

  const handleCancel = useCallback(() => {
    setPendingAction(null);
    pushMessage('Action cancelled.', 'ai');
  }, [pushMessage]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(draft);
    }
  };

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
    } catch {
      setError({ message: 'Could not load conversation.', isBusy: false, retryFn: null });
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div
      className="flex h-[calc(100dvh-60px)] w-full font-roboto text-white overflow-hidden"
      style={{ background: 'transparent' }}
    >
      <style>{STYLE}</style>

      {/* ── History sidebar ────────────────────────────────────────────── */}
      <AnimatePresence>
        {showHistory && (
          <motion.aside
            initial={shouldReduceMotion ? { opacity: 1 } : { x: -260, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { x: -260, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
            className="w-64 border-r border-white/8 bg-zinc-950/80 flex-col hidden md:flex shrink-0"
            aria-label="Conversation history"
          >
            <ConversationHistory
              activeConversationId={conversationId}
              onSelectConversation={handleSelectConversation}
            />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ── Main column ────────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0 h-full">

        {/* Header */}
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="shrink-0 flex items-center justify-between px-4 sm:px-6 py-4 border-b border-white/8 bg-zinc-950/60 backdrop-blur-sm"
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowHistory((v) => !v)}
              className={cn(
                'hidden md:flex p-2 rounded-xl text-zinc-500 hover:text-white hover:bg-zinc-800/60 transition-all duration-200',
                showHistory && 'text-blue-400 bg-blue-500/10',
                FOCUS_RING
              )}
              aria-label="Toggle conversation history"
              aria-expanded={showHistory}
            >
              <ChevronLeft
                size={16}
                className={cn('transition-transform duration-200 motion-safe-t', showHistory && 'rotate-180')}
                aria-hidden="true"
              />
            </button>
            <div className="p-2 rounded-xl bg-blue-500/15 border border-blue-500/25" aria-hidden="true">
              <Sparkles size={18} className="text-blue-400" />
            </div>
            <div>
              <h1 className="font-editorial text-xl font-bold text-white leading-tight">SF Assistant</h1>
              <p className="text-[11px] text-zinc-500 font-roboto">
                AI-powered workspace intelligence
              </p>
            </div>
          </div>

          {messages.length > 0 && (
            <button
              onClick={() => { setMessages([]); setConversationId(null); setPendingAction(null); setError(null); }}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-roboto text-zinc-500 hover:text-white hover:bg-zinc-800/60 border border-white/8 transition-all duration-200',
                FOCUS_RING
              )}
              aria-label="Start new conversation"
            >
              <X size={12} aria-hidden="true" />
              New chat
            </button>
          )}
        </motion.div>

        {/* Messages area */}
        <div
          className="flex-1 overflow-y-auto overscroll-contain py-6 px-4 sm:px-6 space-y-4 assistant-scrollbar"
          role="log"
          aria-label="Conversation"
          aria-live="polite"
        >
          {/* Empty state */}
          {messages.length === 0 && !isLoading && (
            <motion.div
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center justify-center h-full text-center py-16"
            >
              {/* Glow blobs */}
              <div className="absolute top-1/4 left-1/3 w-64 h-40 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />
              <div className="absolute bottom-1/4 right-1/3 w-48 h-32 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />

              <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 border border-blue-500/20 flex items-center justify-center mb-5" aria-hidden="true">
                <Sparkles size={28} className="text-blue-400" />
              </div>
              <h2 className="font-editorial text-2xl font-bold text-white mb-2">Ask Anything</h2>
              <p className="text-sm text-zinc-500 font-roboto max-w-sm leading-relaxed mb-8">
                I can answer questions from your documents, write content, and execute platform actions.
              </p>

              {/* Quick prompts */}
              <div className="flex flex-wrap justify-center gap-2 max-w-lg">
                {QUICK_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => sendMessage(prompt)}
                    className={cn(
                      'px-3 py-2 rounded-xl text-xs font-roboto text-zinc-300 border border-white/8 bg-zinc-900/60',
                      'hover:border-white/20 hover:bg-zinc-800/80 hover:text-white transition-all duration-200',
                      FOCUS_RING
                    )}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Messages */}
          {messages.map((msg) => (
            <Bubble key={msg.id} msg={msg} isOwn={msg.role === 'user'} shouldReduceMotion={shouldReduceMotion} />
          ))}

          {/* Action confirmation */}
          {pendingAction && (
            <ActionCard
              proposal={pendingAction.proposal}
              onConfirm={handleConfirm}
              onCancel={handleCancel}
              confirming={isConfirming}
              onChangeDescription={(val) => {
                setPendingAction((prev) => {
                  if (!prev) return null;
                  return {
                    ...prev,
                    proposal: {
                      ...prev.proposal,
                      description: val,
                    },
                  };
                });
              }}
              onChangeParam={(key, val) => {
                setPendingAction((prev) => {
                  if (!prev) return null;
                  return {
                    ...prev,
                    proposal: {
                      ...prev.proposal,
                      params: {
                        ...prev.proposal.params,
                        [key]: val,
                      },
                    },
                  };
                });
              }}
              onChangeAction={(val) => {
                setPendingAction((prev) => {
                  if (!prev) return null;
                  return {
                    ...prev,
                    proposal: {
                      ...prev.proposal,
                      action: val,
                    },
                  };
                });
              }}
            />
          )}

          {/* Typing */}
          {isLoading && <TypingIndicator />}

          {/* Error */}
          {error && !isLoading && (
            <ErrorBanner message={error.message} isBusy={error.isBusy} onRetry={error.retryFn} />
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input bar */}
        <div className="shrink-0 px-4 sm:px-6 py-4 border-t border-white/8 bg-zinc-950/60 backdrop-blur-sm">
          <div className="max-w-3xl mx-auto relative">
            {/* Unified bordered input container */}
            <div className={cn(
              'flex items-center gap-2 rounded-xl px-3 py-1.5 border transition-all duration-200 bg-zinc-900/80 border-white/10',
              'focus-within:border-blue-500/50 focus-within:ring-1 focus-within:ring-blue-500/30'
            )}>
              {/* Plus button / Custom trigger */}
              <div className="relative shrink-0">
                <button
                  onClick={() => {
                    setShowSuggest(false);
                    setShowMenu((v) => !v);
                  }}
                  disabled={isLoading || isConfirming}
                  className={cn(
                    'p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800/60 transition-all duration-200',
                    FOCUS_RING
                  )}
                  aria-label="Add action option"
                >
                  <Plus size={18} aria-hidden="true" />
                </button>

                <AnimatePresence>
                  {showMenu && (
                    <>
                      <button className="fixed inset-0 z-10 w-full h-full cursor-default bg-transparent" onClick={() => setShowMenu(false)} aria-label="Close menu" />
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute bottom-full left-0 mb-3 w-48 rounded-xl bg-zinc-900 border border-white/10 p-1.5 shadow-xl z-20"
                      >
                        <button
                          onClick={() => {
                            setDraft('/action ');
                            setShowMenu(false);
                            inputRef.current?.focus();
                          }}
                          className="w-full text-left px-3 py-2 rounded-lg text-xs text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors flex items-center gap-2"
                        >
                          <Sparkles size={14} className="text-blue-400" />
                          <span>Action</span>
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              {/* Textarea area */}
              <div className="flex-1 min-w-0">
                {/* Slash autocomplete overlay */}
                <AnimatePresence>
                  {showSuggest && (
                    <>
                      <button className="fixed inset-0 z-10 w-full h-full cursor-default bg-transparent" onClick={() => setShowSuggest(false)} aria-label="Close suggestions" />
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute bottom-full left-0 mb-3 w-56 rounded-xl bg-zinc-900 border border-white/10 p-1.5 shadow-xl z-20"
                      >
                        <div className="px-3 py-1.5 text-[10px] text-zinc-500 uppercase tracking-widest border-b border-white/5 mb-1 font-semibold">
                          AI Commands
                        </div>
                        <button
                          onClick={() => {
                            setDraft((prev) => {
                              const idx = prev.lastIndexOf('/');
                              if (idx !== -1) {
                                return prev.substring(0, idx) + '/action ';
                              }
                              return prev + 'action ';
                            });
                            setShowSuggest(false);
                            inputRef.current?.focus();
                          }}
                          className="w-full text-left px-3 py-2 rounded-lg text-xs text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors flex items-center gap-2"
                        >
                          <Sparkles size={14} className="text-blue-400" />
                          <div className="flex-1">
                            <div className="font-medium text-white">/action</div>
                            <div className="text-[10px] text-zinc-500 mt-0.5">Propose a custom AI action card</div>
                          </div>
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>

                <textarea
                  id="assistant-input"
                  ref={inputRef}
                  rows={1}
                  value={draft}
                  onChange={(e) => {
                    const val = e.target.value;
                    setDraft(val);
                    if (val.endsWith('/')) {
                      setShowMenu(false);
                      setShowSuggest(true);
                    } else if (!val.includes('/')) {
                      setShowSuggest(false);
                    }
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Message SF Assistant..."
                  disabled={isLoading || isConfirming}
                  className="w-full bg-transparent border-0 focus:ring-0 focus:outline-none text-sm font-roboto text-white placeholder:text-zinc-600 resize-none max-h-40 py-1.5 overflow-y-auto leading-relaxed"
                  style={{ minHeight: '24px' }}
                  aria-label="Message SF Assistant"
                />
              </div>

              {/* Send button */}
              <button
                onClick={() => sendMessage(draft)}
                disabled={!draft.trim() || isLoading || isConfirming}
                className={cn(
                  'p-1.5 rounded-lg text-blue-500 hover:text-blue-400 hover:bg-blue-500/10 transition-all duration-200 disabled:opacity-30 disabled:pointer-events-none shrink-0',
                  FOCUS_RING
                )}
                aria-label="Send message"
              >
                <Send size={18} aria-hidden="true" />
              </button>
            </div>
          </div>
          <p className="text-center text-[10px] text-zinc-700 font-roboto mt-2">
            Enter to send · Shift+Enter for newline
          </p>
        </div>
      </div>
    </div>
  );
}
