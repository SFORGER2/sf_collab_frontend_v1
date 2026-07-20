import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, X, Check, Loader2, Sparkles, AlertCircle, Plus, FolderPlus, Calendar, CheckSquare, Bell, FileText, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import assistantService from '@/services/assistantService';

// Standard helper for rendering markdown/text
const MessageText = ({ text }) => {
  return <div className="whitespace-pre-wrap leading-relaxed text-sm">{text}</div>;
};

// Action Confirmation Card Component
const ActionConfirmationCard = ({ action, description, params, onConfirm, onCancel, isExecuting, isConfirmed }) => {
  return (
    <div className="bg-indigo-900/20 border border-indigo-500/30 rounded-xl p-4 mt-2 mb-2 w-full max-w-sm">
      <div className="flex items-center gap-2 mb-2">
        <div className="bg-indigo-500/20 p-1.5 rounded-lg text-indigo-400">
          <Sparkles size={16} />
        </div>
        <h4 className="font-semibold text-indigo-100 text-sm">
          {isConfirmed ? 'Action Confirmed' : 'Action Proposed'}
        </h4>
        {isConfirmed && (
          <span className="ml-auto text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
            <Check size={10} /> Confirmed
          </span>
        )}
      </div>

      {action && (
        <div className="text-[10px] font-bold font-mono text-indigo-400 uppercase tracking-wider mb-2">
          Action: {action.replace(/_/g, ' ')}
        </div>
      )}

      <p className="text-sm text-indigo-200/80 mb-3">{description || `I can help you with: ${action}`}</p>

      {params && Object.keys(params).length > 0 && (
        <div className="bg-black/20 rounded-lg p-2.5 mb-4 text-xs font-mono text-indigo-300">
          {Object.entries(params).map(([key, value]) => (
            <div key={key} className="flex gap-2">
              <span className="opacity-60 min-w-16">{key}:</span>
              <span className="truncate">{String(value)}</span>
            </div>
          ))}
        </div>
      )}

      {!isConfirmed && (
        <div className="flex gap-2 mt-3">
          <button
            onClick={onConfirm}
            disabled={isExecuting}
            className="flex-1 flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
          >
            {isExecuting ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            Confirm
          </button>
          <button
            onClick={onCancel}
            disabled={isExecuting}
            className="flex-1 flex items-center justify-center gap-1.5 bg-white/5 hover:bg-white/10 text-white py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
          >
            <X size={14} />
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default function AssistantChat({ workspaceId, initialConversationId = null }) {
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState(initialConversationId);
  const messagesEndRef = useRef(null);

  // Quick Actions Panel State
  const [showActionsPanel, setShowActionsPanel] = useState(false);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  useEffect(() => scrollToBottom(), [messages]);

  const handleSend = async (text, executeOverride = false, originalMessage = null, proposedMsgId = null) => {
    const messageContent = text || draft.trim();
    if (!messageContent && !originalMessage) return;

    if (!executeOverride) {
      // Add user message to UI
      const userMsg = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: messageContent,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, userMsg]);
      setDraft('');
    }

    setIsLoading(true);



    try {
      // Chat API call (from our new assistantService)
      const res = await assistantService.chat({
        message: originalMessage || messageContent,
        workspaceId,
        conversationId,
        execute: executeOverride
      });

      // Handle envelope structure (assuming { success, data, error })
      const data = res?.data || res;
      if (data.conversation_id && !conversationId) {
        setConversationId(data.conversation_id);
      }

      // Determine response type based on integration guide
      const aiMsg = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        type: data.type || 'answer', // 'answer', 'action_proposed', 'action_executed'
        content: data.answer || data.description || '',
        sources: data.sources || [],
        confidence: data.confidence,
        action: data.action,
        params: data.params,
        result: data.result,
        original_request: originalMessage || messageContent, // to re-trigger execute
        timestamp: new Date().toISOString()
      };

      setMessages(prev => {
        let updated = prev;
        if (proposedMsgId) {
          updated = updated.map(m => m.id === proposedMsgId ? { ...m, isExecuting: false, isConfirmed: true } : m);
        }
        return [...updated, aiMsg];
      });
    } catch (error) {
      console.error("Assistant chat error:", error);
      let errorMsg = "Something went wrong.";
      if (error.response?.status === 429) errorMsg = "I'm receiving too many requests right now. Please try again in a moment.";
      if (error.response?.status === 502 || error.response?.status === 503) errorMsg = "The AI service is currently unavailable. Please try again later.";

      setMessages(prev => {
        let updated = prev;
        if (proposedMsgId) {
          updated = updated.map(m => m.id === proposedMsgId ? { ...m, isExecuting: false } : m);
        }
        return [...updated, {
          id: `err-${Date.now()}`,
          role: 'assistant',
          type: 'error',
          content: errorMsg,
          timestamp: new Date().toISOString()
        }];
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleConfirmAction = (msgId, originalRequest) => {
    // Mark the message as 'executing' in UI
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, isExecuting: true } : m));
    // Trigger the actual execution call
    handleSend(originalRequest, true, originalRequest, msgId);
  };

  const handleCancelAction = (msgId) => {
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, type: 'action_cancelled', content: 'Action cancelled.' } : m));
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0a0f] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">

      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 bg-black/40 border-b border-white/5 shrink-0">
        <Sparkles className="text-indigo-400 w-5 h-5" />
        <h3 className="font-medium text-white/90 text-sm tracking-wide">SF Assistant</h3>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-workspace-scrollbar">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-white/40 space-y-3">
            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-indigo-500/50" />
            </div>
            <p className="text-sm">How can I help you today?</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-sm'
                  : 'bg-white/5 border border-white/10 text-white/90 rounded-bl-sm'
                  }`}
              >
                {msg.type === 'action_proposed' ? (
                  <ActionConfirmationCard
                    action={msg.action}
                    description={msg.content}
                    params={msg.params}
                    isExecuting={msg.isExecuting}
                    isConfirmed={msg.isConfirmed}
                    onConfirm={() => handleConfirmAction(msg.id, msg.original_request)}
                    onCancel={() => handleCancelAction(msg.id)}
                  />
                ) : msg.type === 'error' ? (
                  <div className="flex items-start gap-2 text-rose-400">
                    <AlertCircle size={16} className="mt-0.5 shrink-0" />
                    <MessageText text={msg.content} />
                  </div>
                ) : msg.type === 'action_executed' ? (
                  <div>
                    <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold mb-1">
                      <Check size={14} /> Action Executed
                    </div>
                    <MessageText text={msg.content} />
                  </div>
                ) : msg.type === 'action_cancelled' ? (
                  <div className="text-white/50 text-sm italic">{msg.content}</div>
                ) : (
                  <MessageText text={msg.content} />
                )}
              </div>

              {/* Timestamp */}
              <div className="text-[10px] text-white/30 mt-1 px-1">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-start">
            <div className="bg-white/5 border border-white/10 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1 items-center">
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 bg-black/40 border-t border-white/5 shrink-0">

        {/* Quick Actions Panel */}
        <AnimatePresence>
          {showActionsPanel && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-[#0f0f15]/90 border border-white/10 rounded-xl p-3 mb-3 overflow-hidden text-sm shadow-xl"
            >
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-indigo-300 text-xs tracking-wider uppercase">Quick Actions</span>
                  <button onClick={() => setShowActionsPanel(false)} className="text-white/40 hover:text-white">
                    <X size={14} />
                  </button>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 custom-workspace-scrollbar">
                  <div
                    className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-white/5 hover:bg-indigo-600/20 hover:border-indigo-500/30 border border-white/5 min-w-[90px] text-center transition-all duration-300"
                  >
                    <FolderPlus size={20} className="text-indigo-400" />
                    <span className="text-[11px] font-medium text-white/90">Workspace</span>
                  </div>
                  <div
                    className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-white/5 hover:bg-indigo-600/20 hover:border-indigo-500/30 border border-white/5 min-w-[90px] text-center transition-all duration-300"
                  >
                    <Calendar size={20} className="text-indigo-400" />
                    <span className="text-[11px] font-medium text-white/90">Meeting</span>
                  </div>
                  <div
                    className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-white/5 hover:bg-indigo-600/20 hover:border-indigo-500/30 border border-white/5 min-w-[90px] text-center transition-all duration-300"
                  >
                    <CheckSquare size={20} className="text-indigo-400" />
                    <span className="text-[11px] font-medium text-white/90">Task</span>
                  </div>
                  <div
                    className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-white/5 hover:bg-indigo-600/20 hover:border-indigo-500/30 border border-white/5 min-w-[90px] text-center transition-all duration-300"
                  >
                    <Bell size={20} className="text-indigo-400" />
                    <span className="text-[11px] font-medium text-white/90">Reminder</span>
                  </div>
                  <div
                    className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-white/5 hover:bg-indigo-600/20 hover:border-indigo-500/30 border border-white/5 min-w-[90px] text-center transition-all duration-300"
                  >
                    <FileText size={20} className="text-indigo-400" />
                    <span className="text-[11px] font-medium text-white/90">Write Doc</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative flex items-end gap-2 bg-white/5 border border-white/10 rounded-xl p-1 focus-within:border-indigo-500/50 focus-within:ring-1 focus-within:ring-indigo-500/50 transition-all">
          <button
            onClick={() => setShowActionsPanel(!showActionsPanel)}
            className={`shrink-0 w-8 h-8 flex items-center justify-center rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white transition-all mb-1 ml-1 cursor-pointer ${showActionsPanel ? 'rotate-45 border-indigo-500/30 text-indigo-400' : ''}`}
            title="Toggle Quick Actions"
          >
            <Plus size={16} />
          </button>

          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask AI or request an action..."
            className="flex-1 max-h-32 min-h-[40px] bg-transparent resize-none outline-none text-sm text-white px-3 py-2.5 custom-workspace-scrollbar"
            rows={1}
            disabled={isLoading}
          />
          <button
            onClick={() => handleSend()}
            disabled={!draft.trim() || isLoading}
            className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-white/5 disabled:text-white/30 text-white transition-colors mb-1 mr-1 cursor-pointer"
          >
            <Send size={14} className={draft.trim() ? "translate-x-[1px] translate-y-[-1px]" : ""} />
          </button>
        </div>
        <div className="text-center mt-2">
          <p className="text-[10px] text-white/30">Press Enter to send, Shift + Enter for newline</p>
        </div>
      </div>
    </div>
  );
}