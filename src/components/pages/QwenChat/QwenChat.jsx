import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import InputArea from './components/chat/InputArea';
import EmptyState from './components/chat/EmptyState';
import UserMessage from './components/chat/UserMessage';
import AIMessage from './components/chat/AIMessage';
import ErrorMessage from './components/chat/ErrorMessage';
import QwenLogo from './components/ui/QwenLogo';
import ConversationRow from './components/sidebar/ConversationRow';
import ContextMenu from './components/sidebar/ContextMenu';
import SearchModal from './components/modals/SearchModal';
import EngineSettingsModal from './components/modals/EngineSettingsModal';

const DEFAULT_AVATAR = "https://lh3.googleusercontent.com/aida-public/AB6AXuBWavxqxgtwCDvJQXC8LytznclScWbxJSUJR1jx_NAmdBh524FcUoZUFKrAeGc5o8CBFIturMss0UcmaDo6TDkJqaVS2NcCp68G_6gqUNsHlXlC3sIofmCyh9A6-bskBT2dzo-R7Dd1pUcnXf3E7ckI2x2ISRGlRkHpLmCBHLua7TqjmRzjXjAqhQ2xIykfbtJRnTWMZRuAJQZ4eY_uzja667yLaiBbMYTSqad5N-ElBkWNRbzFJp--Gv6qzPhccJT-BH5InlB6fPk";

const INITIAL_CONVERSATIONS = [];

const PRESET_MESSAGES = {};

const QwenChat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastUserPrompt, setLastUserPrompt] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('You are Qwen AI Enterprise. Provide precise, clean code and executive answers.');
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(4096);
  const [modelResponseType, setModelResponseType] = useState('general_knowledge');

  // Workspace Sidebar state
  const [conversations, setConversations] = useState(INITIAL_CONVERSATIONS);
  const [activeConvId, setActiveConvId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(() =>
    typeof window === 'undefined' ? true : window.innerWidth >= 768
  );
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [modalSearchInput, setModalSearchInput] = useState('');
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  // Context Menu state
  const [contextMenuData, setContextMenuData] = useState(null); // { convId, top, left }
  const [editingConvId, setEditingConvId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');

  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const searchInputRef = useRef(null);

  const scrollToBottom = (behaviorOption = 'smooth') => {
    const behavior = typeof behaviorOption === 'string' ? behaviorOption : 'smooth';
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior,
      });
    }
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior, block: 'end' });
    }
    setShowScrollBottom(false);
  };

  // Auto-scroll whenever messages change or loading starts/stops
  useEffect(() => {
    scrollToBottom('smooth');
    const timer = setTimeout(() => {
      scrollToBottom('smooth');
    }, 60);
    return () => clearTimeout(timer);
  }, [messages, loading]);

  // Continuous auto-scroll interval while receiving/loading AI reply
  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
      }
    }, 100);
    return () => clearInterval(interval);
  }, [loading]);

  useEffect(() => {
    if (showSearchModal && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [showSearchModal]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowSettingsModal(false);
        setShowModelDropdown(false);
        setShowSearchModal(false);
        setContextMenuData(null);
        setEditingConvId(null);
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        clearChat();
      }
    };
    const handleClickOutside = () => {
      setContextMenuData(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('click', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    if (scrollHeight - scrollTop - clientHeight > 120) {
      setShowScrollBottom(true);
    } else {
      setShowScrollBottom(false);
    }
  };

  const classifyError = (err) => {
    // Prefer the backend's own { success:false, error: "<message>" } payload —
    // axios's err.message is usually just a generic "Request failed with
    // status code N" and doesn't carry the actual reason (prompt-injection
    // blocked, quota text, etc.). Fall back to err.message / status only when
    // no structured payload came back (e.g. a genuine network failure).
    const status = err?.response?.status;
    const serverMsg = err?.response?.data?.error || err?.response?.data?.message || '';
    const errMsg = serverMsg || err?.message || err?.toString() || '';
    const lowerMsg = errMsg.toLowerCase();

    if (errMsg.includes('Prompt injection') || errMsg.includes('Missing') || /ignore previous|system prompt override|dump database|no user message/i.test(errMsg)) {
      return 'Security Notice: Your request triggered safety filtering rules. Please rephrase your prompt.';
    }
    if (lowerMsg.includes('too large') || lowerMsg.includes('length limit')) {
      return 'Prompt Limit Exceeded: Your input exceeds maximum token limits. Please shorten your message.';
    }
    if (status === 429 || lowerMsg.includes('rate limit') || lowerMsg.includes('chatting fast')) {
      return 'Rate Limit Reached: You are sending requests too quickly. Please wait a moment and try again.';
    }
    if (lowerMsg.includes('quota') || lowerMsg.includes('credit') || lowerMsg.includes('daily limit')) {
      return 'Daily Quota Exceeded: You have reached your daily allocation of AI queries. Please try again tomorrow.';
    }
    if (status === 503 || lowerMsg.includes('unavailable') || lowerMsg.includes('catching his breath') || lowerMsg.includes('network error') || lowerMsg.includes('fetch failed')) {
      return 'Service Unavailable: Qwen AI network endpoint is currently unreachable. Please check your connection.';
    }
    return 'System Interruption: An unexpected error occurred while communicating with Qwen AI. Click Retry to resubmit.';
  };

  const handleExecuteSend = async (userPromptText) => {
    if (!userPromptText.trim() || loading) return;

    if (/ignore (all )?previous instructions|reveal system prompt|system override/i.test(userPromptText)) {
      const friendlyErr = 'Security Notice: Input flagged by safety filter. Please rephrase your prompt.';
      setError(friendlyErr);
      toast.error(friendlyErr, { position: 'bottom-right', autoClose: 3000, theme: 'dark' });
      return;
    }

    if (userPromptText.length > 8000) {
      const friendlyErr = 'Prompt Limit Exceeded: Input exceeds 8,000 characters limit.';
      setError(friendlyErr);
      toast.error(friendlyErr, { position: 'bottom-right', autoClose: 3000, theme: 'dark' });
      return;
    }

    const newMsgId = Date.now();
    const userMessage = {
      id: newMsgId,
      role: 'user',
      content: userPromptText,
      timestamp: new Date()
    };

    const assistantMsgId = newMsgId + 1;
    const initialAssistantMessage = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      isLoading: true,
      timestamp: new Date(),
      thinking: 'Thinking...',
      thinkingTime: '120ms',
      tokens: '0 tokens'
    };

    // Stage 1: Mount user message & active assistant message with content: '' (Triggers Universal Thinking)
    setMessages(prev => [...prev, userMessage, initialAssistantMessage]);
    setLastUserPrompt(userPromptText);
    setInput('');
    setLoading(true);
    setError('');

    if (messages.length <= 1) {
      const newTitle = userPromptText.length > 30 ? `${userPromptText.slice(0, 30)}...` : userPromptText;
      const newConvId = `conv-${Date.now()}`;
      setConversations(prev => [
        {
          id: newConvId,
          title: newTitle,
          timestamp: 'Today',
          isPinned: false,
        },
        ...prev
      ]);
      setActiveConvId(newConvId);
    }

    try {
      let fullResponseText = '';
      let responseModel = modelResponseType === 'page_context' ? 'Qwen Enterprise RAG' : 'Qwen 2.5 32B';

      await new Promise(res => setTimeout(res, 500)); // Thinking stage duration (Dev 4)

      const promptLower = userPromptText.toLowerCase();

      if (promptLower.includes('json') || promptLower.includes('payload') || promptLower.includes('schema')) {
        fullResponseText = `\`\`\`json\n{\n  "status": "success",\n  "code": 200,\n  "data": {\n    "id": "usr_9982410a8f",\n    "name": "Alex Mercer",\n    "active": true,\n    "roles": ["admin", "editor"],\n    "meta": null\n  }\n}\n\`\`\``;
      } else if (promptLower.includes('csv')) {
        fullResponseText = `\`\`\`csv\nName, Role, Experience\nAlice, Frontend Developer, 3\nBob, Backend Developer, 5\nCharlie, UI/UX Designer, 2\n\`\`\``;
      } else if (promptLower.includes('table') || promptLower.includes('matrix') || promptLower.includes('compare') || promptLower.includes('benchmark') || promptLower.includes('grid')) {
        fullResponseText = `### Feature Comparison\n\n| Feature | React | Vue | Angular |\n| :--- | :--- | :--- | :--- |\n| **Learning Curve** | Medium | Easy | Hard |\n| **Performance** | High | High | High |\n| **TypeScript Support** | Excellent | Good | Excellent |\n| **Ecosystem** | Large | Medium | Large |`;
      } else if (promptLower.includes('code') || promptLower.includes('react') || promptLower.includes('function') || promptLower.includes('component') || promptLower.includes('javascript') || promptLower.includes('python')) {
        fullResponseText = `\`\`\`jsx\nimport React, { useState } from 'react';\n\nexport default function CounterWidget() {\n  const [count, setCount] = useState(0);\n\n  return (\n    <div className="p-4 bg-[#131925] border border-[rgba(170,190,255,0.1)] radius-ai-md text-[#F7F8FA] shadow-lg">\n      <h3 className="text-ai-heading-sm text-[#7CA6FF] font-semibold">Counter</h3>\n      <p className="text-ai-subtext text-[#A9B3C4] mt-1">Current Value: {count}</p>\n      <button \n        onClick={() => setCount(c => c + 1)}\n        className="mt-3 px-3 h-8 rounded-full bg-[#7CA6FF] hover:bg-[#91B6FF] text-[#07090D] text-ai-body-sm font-semibold transition-all cursor-pointer"\n      >\n        Increment\n      </button>\n    </div>\n  );\n}\n\`\`\``;
      } else if (promptLower.includes('terminal') || promptLower.includes('docker') || promptLower.includes('cli') || promptLower.includes('bash') || promptLower.includes('command') || promptLower.includes('npm') || promptLower.includes('install') || promptLower.includes('script')) {
        fullResponseText = `\`\`\`bash\n$ npm install react react-dom framer-motion\n\nadded 142 packages, and audited 143 packages in 2.8s\n\nfound 0 vulnerabilities\n\`\`\``;
      } else if (promptLower.includes('diagram') || promptLower.includes('mermaid') || promptLower.includes('flowchart') || promptLower.includes('architecture') || promptLower.includes('chart')) {
        fullResponseText = `\`\`\`mermaid\ngraph TD\n  A[Input Stream] --> B[Tokenizer]\n  B --> C[Decoder Engine]\n  C --> D[Render Canvas]\n\`\`\``;
      } else if (promptLower.includes('schrödinger') || promptLower.includes('schrodinger') || promptLower.includes('wave equation')) {
        fullResponseText = `The time-dependent Schrödinger wave equation is:\n\n$$i\\hbar \\frac{\\partial}{\\partial t} \\Psi(\\mathbf{r},t) = \\hat{H}\\Psi(\\mathbf{r},t)$$\n\nWhere the Hamiltonian operator $\\hat{H}$ is:\n\n$$\\hat{H} = -\\frac{\\hbar^2}{2m}\\nabla^2 + V(\\mathbf{r},t)$$`;
      } else if (promptLower.includes('math') || promptLower.includes('formula') || promptLower.includes('latex') || promptLower.includes('equation') || promptLower.includes('calc')) {
        fullResponseText = `$$\n\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}\n$$\n\n$$\nf(x) = \\int_{-\\infty}^{\\infty} \\hat{f}(\\xi)\\,e^{2\\pi i x \\xi}\\,d\\xi\n$$`;
      } else if (promptLower.includes('image') || promptLower.includes('picture') || promptLower.includes('draw') || promptLower.includes('photo')) {
        fullResponseText = `![Artwork](https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80)`;
      } else if (promptLower.includes('file') || promptLower.includes('pdf') || promptLower.includes('document') || promptLower.includes('report') || promptLower.includes('download')) {
        fullResponseText = `[File: Architecture_Report.pdf - 2.4 MB]`;
      } else if (promptLower.includes('indexing') || promptLower.includes('index') || promptLower.includes('database') || promptLower.includes('search')) {
        fullResponseText = `## Understanding Indexing\n\nIndexing is a fundamental data structure optimization used to rapidly locate and retrieve data without scanning every record in a database or storage engine.\n\n### Core Mechanisms\n1. **B-Tree & Hash Indexes**: Maintain sorted key-pointer structures for $O(\\log N)$ lookup time.\n2. **Inverted Indexes**: Used in search engines to map keywords directly to document IDs.\n3. **Query Optimization**: Reduces disk I/O bottlenecks and accelerates filtering operations.`;
      } else if (promptLower.includes('markdown') || promptLower.includes('overview') || promptLower.includes('heading') || promptLower.includes('notes')) {
        fullResponseText = `# Comprehensive Guide to Markdown Syntax\n\nMarkdown is a lightweight markup language designed for fast, human-readable text formatting.\n\n---\n\n## 1. Core Formatting & Typography\n- **Bold Text**: Highlight key concepts and parameters using \`**bold**\`.\n- *Italic Emphasis*: Add subtle text emphasis using \`*italic*\`.\n- \`Inline Code\`: Highlight functions, variable names, or inline tokens using backticks.\n\n> **Note**: Blockquotes provide visual callouts for important caveats, design patterns, or technical disclaimers.\n\n---\n\n## 2. Structured Task Lists\n- [x] High-performance token streaming pipeline\n- [x] Dynamic KaTeX mathematical equation rendering\n- [x] GFM matrix table parsing and formatting\n- [ ] Enterprise RAG vector retrieval indexing\n\n---\n\n## 3. Code & Technical Examples\n\`\`\`javascript\nfunction calculateVelocity(distance, time) {\n  if (time <= 0) return 0;\n  return distance / time;\n}\n\`\`\``;
      } else {
        fullResponseText = `## ${userPromptText}\n\n${userPromptText} is a core concept that plays a key role in system design, data organization, and application workflows.\n\n### Key Concepts\n- **Structure**: Enables modular, predictable data flow and execution.\n- **Optimization**: Maximizes resource efficiency and reduces overhead.\n- **Scalability**: Ensures reliable performance across varying workloads.`;
      }
      responseModel = modelResponseType === 'page_context' ? 'Qwen Enterprise RAG' : 'Qwen 2.5 32B';

      // Stage 2 & Stage 3: Token Streaming Loop (updates content live chunk-by-chunk)
      const chunkSize = 12;
      for (let i = 0; i <= fullResponseText.length; i += chunkSize) {
        const streamedChunk = fullResponseText.slice(0, i + chunkSize);
        setMessages(prev => prev.map(m => m.id === assistantMsgId ? { ...m, content: streamedChunk, model: responseModel } : m));
        await new Promise(res => setTimeout(res, 28)); // Stream tick rate
      }

      // Mark generation complete
      setMessages(prev => prev.map(m => m.id === assistantMsgId ? { ...m, content: fullResponseText, isLoading: false, model: responseModel } : m));

    } catch (err) {
      console.error('Chat execution error:', err);
      const friendlyError = classifyError(err);
      setError(friendlyError);
      toast.error(friendlyError, { position: 'bottom-right', autoClose: 4000, theme: 'dark' });

      setMessages(prev => prev.map(m => m.id === assistantMsgId ? { ...m, content: friendlyError, isError: true, isLoading: false } : m));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    handleExecuteSend(input);
  };

  const handleRetryLast = () => {
    if (lastUserPrompt) {
      setMessages(prev => prev.filter(m => !m.isError));
      handleExecuteSend(lastUserPrompt);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setError('');
    setActiveConvId(null);
    toast.info("Started new chat", { position: "bottom-right", autoClose: 1500, theme: "dark" });
  };

  const handleSelectConversation = (conv) => {
    setActiveConvId(conv.id);
    setShowSearchModal(false);
    setModalSearchInput('');
    if (PRESET_MESSAGES[conv.id]) {
      setMessages(PRESET_MESSAGES[conv.id]);
    } else {
      setMessages([
        {
          id: Date.now(),
          role: 'assistant',
          content: `Loaded conversation: **${conv.title}**.\n\nHow would you like to continue building on this topic today?`,
          timestamp: new Date(),
          thinking: 'Loaded conversation context.',
          thinkingTime: '45ms',
          tokens: '400 tokens'
        }
      ]);
    }
  };

  const togglePin = (convId, e) => {
    if (e) e.stopPropagation();
    setConversations(prev => prev.map(c => c.id === convId ? { ...c, isPinned: !c.isPinned } : c));
  };

  const deleteConv = (convId, e) => {
    if (e) e.stopPropagation();
    setConversations(prev => prev.filter(c => c.id !== convId));
    if (activeConvId === convId) clearChat();
    setContextMenuData(null);
    toast.info("Conversation deleted", { position: "bottom-right", autoClose: 1500, theme: "dark" });
  };

  const handleStartRename = (conv, e) => {
    if (e) e.stopPropagation();
    setEditingConvId(conv.id);
    setEditingTitle(conv.title);
    setContextMenuData(null);
  };

  const handleSaveRename = (convId, e) => {
    if (e) e.stopPropagation();
    if (editingTitle.trim()) {
      setConversations(prev => prev.map(c => c.id === convId ? { ...c, title: editingTitle.trim() } : c));
      toast.success("Conversation renamed", { position: "bottom-right", autoClose: 1500, theme: "dark" });
    }
    setEditingConvId(null);
  };

  const handleArchiveConv = (convId, e) => {
    if (e) e.stopPropagation();
    setConversations(prev => prev.filter(c => c.id !== convId));
    if (activeConvId === convId) clearChat();
    setContextMenuData(null);
    toast.info("Conversation archived", { position: "bottom-right", autoClose: 1500, theme: "dark" });
  };

  const handleExport = () => {
    const chatExportStr = JSON.stringify(messages, null, 2);
    const blob = new Blob([chatExportStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qwen-chat-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Chat history exported successfully", { position: "bottom-right", autoClose: 2000, theme: "dark" });
  };

  const handleShare = (convId, e) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(window.location.href);
    setContextMenuData(null);
    toast.success("Chat link copied to clipboard", { position: "bottom-right", autoClose: 2000, theme: "dark" });
  };

  const openContextMenu = (target, e) => {
    if (e) e.stopPropagation();
    if (!target) return;
    const targetId = typeof target === 'string' ? target : target.id;
    if (!targetId) return;

    if (contextMenuData && contextMenuData.convId === targetId) {
      setContextMenuData(null);
      return;
    }
    const rect = e?.currentTarget?.getBoundingClientRect?.() || { top: 100, left: 230 };
    setContextMenuData({
      convId: targetId,
      top: (rect.top || 100) - 10,
      left: 230,
    });
  };

  const activeContextConv = conversations.find(c => c.id === contextMenuData?.convId);

  const modalSearchResults = conversations.filter(c =>
    c.title.toLowerCase().includes(modalSearchInput.toLowerCase())
  );

  const pinnedChats = conversations.filter(c => c.isPinned);
  const unpinnedChats = conversations.filter(c => !c.isPinned);

  return (
    <div className="bg-[#07090D] text-[#F7F8FA] flex h-[calc(100vh-60px)] w-full overflow-hidden antialiased selection:bg-[#7CA6FF]/20 selection:text-white leading-[1.8] tracking-wide font-body-md relative">

      {/* ========================================================================= */}
      {/* QWEN AI WORKSPACE SIDEBAR (#0B0F17) */}
      {/* ========================================================================= */}
      <AnimatePresence initial={false} mode="wait">
        {sidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 270, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 380,
              damping: 32,
              mass: 0.8,
            }}
            className="h-full flex flex-col bg-[#0B0F17] shrink-0 z-20 overflow-hidden select-none will-change-[width,opacity]"
          >
            <motion.div
              initial={{ x: -16, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -16, opacity: 0 }}
              transition={{ duration: 0.16, ease: "easeOut" }}
              className="flex flex-col h-full w-[270px] px-3 py-3 gap-3 relative z-10"
            >
              {/* 1. Low-Profile Navigation Header */}
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <QwenLogo className="w-4 h-4 text-[#8592A6] shrink-0" />
                  <span className="text-[13px] font-medium tracking-tight text-[#C4CDDA]">
                    Qwen Enterprise
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setSidebarOpen(false)}
                  className="p-1.5 rounded-md text-[#64748B] hover:text-[#F7F8FA] hover:bg-[#151C28] focus-visible:ring-1 focus-visible:ring-[#7CA6FF] outline-none transition-colors duration-200 ease-out cursor-pointer"
                  title="Collapse Sidebar"
                  aria-label="Collapse Sidebar"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    side_navigation
                  </span>
                </button>
              </div>

              {/* 2. Integrated Primary Actions */}
              <div className="space-y-0.5">
                <button
                  type="button"
                  onClick={clearChat}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 radius-ai-sm text-[#D1D7E0] hover:text-[#F7F8FA] hover:bg-[#131924] text-[13px] font-medium transition-colors duration-200 ease-out cursor-pointer focus-visible:ring-1 focus-visible:ring-[#7CA6FF] outline-none group"
                >
                  <span className="material-symbols-outlined text-[16px] text-[#7CA6FF] group-hover:rotate-90 transition-transform duration-200 ease-out">
                    add
                  </span>
                  <span>New chat</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowSearchModal(true)}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 radius-ai-sm text-[#8592A6] hover:text-[#F7F8FA] hover:bg-[#131924] text-[13px] font-medium transition-colors duration-200 ease-out cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-[#7CA6FF] group"
                >
                  <span className="material-symbols-outlined text-[16px] text-[#64748B] group-hover:text-[#F7F8FA] transition-colors duration-200 ease-out">
                    search
                  </span>
                  <span className="flex-1 text-left">Search chats</span>
                </button>
              </div>

              {/* 3. Conversation History List */}
              <div className="flex-1 overflow-y-auto overflow-x-hidden custom-workspace-scrollbar pr-0.5 space-y-3 pt-1">
                {/* Pinned Section */}
                {pinnedChats.length > 0 && (
                  <div className="space-y-0.5">
                    <div className="px-2 pb-1 text-[10px] font-mono font-medium text-[#4B5768] uppercase tracking-wider select-none">
                      Pinned
                    </div>
                    {pinnedChats.map((c) => (
                      <ConversationRow
                        key={c.id}
                        conv={c}
                        activeConvId={activeConvId}
                        contextMenuData={contextMenuData}
                        editingConvId={editingConvId}
                        editingTitle={editingTitle}
                        setEditingTitle={setEditingTitle}
                        handleSelectConversation={handleSelectConversation}
                        handleSaveRename={handleSaveRename}
                        setEditingConvId={setEditingConvId}
                        togglePin={togglePin}
                        openContextMenu={openContextMenu}
                      />
                    ))}
                  </div>
                )}

                {/* Unpinned Conversations */}
                {unpinnedChats.length > 0 && (
                  <div className="space-y-0.5">
                    {pinnedChats.length > 0 && (
                      <div className="px-2 pb-1 text-[10px] font-mono font-medium text-[#4B5768] uppercase tracking-wider select-none">
                        Recent Chats
                      </div>
                    )}
                    {unpinnedChats.map((c) => (
                      <ConversationRow
                        key={c.id}
                        conv={c}
                        activeConvId={activeConvId}
                        contextMenuData={contextMenuData}
                        editingConvId={editingConvId}
                        editingTitle={editingTitle}
                        setEditingTitle={setEditingTitle}
                        handleSelectConversation={handleSelectConversation}
                        handleSaveRename={handleSaveRename}
                        setEditingConvId={setEditingConvId}
                        togglePin={togglePin}
                        openContextMenu={openContextMenu}
                      />
                    ))}
                  </div>
                )}

                {conversations.length === 0 && (
                  <div className="py-6 text-center text-[#505D73] text-xs font-mono">
                    No chats available
                  </div>
                )}
              </div>

              {/* 4. Integrated Profile & Workspace Footer */}
              <div className="mt-auto pt-3 flex items-center justify-between px-1">
                <div className="flex items-center gap-2.5 overflow-hidden select-none">
                  <img
                    src={DEFAULT_AVATAR}
                    alt="User"
                    className="w-7 h-7 rounded-full object-cover shrink-0"
                  />
                  <div className="flex flex-col truncate leading-tight">
                    <span className="text-[12px] font-medium text-[#D1D7E0] truncate">
                      Kota Sai pallav
                    </span>
                    <span className="text-[10px] text-[#5C6B80] font-mono mt-0.5">
                      Pro Workspace
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setShowSettingsModal(true)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-[#64748B] hover:text-[#F7F8FA] hover:bg-[#1A2232] focus-visible:ring-1 focus-visible:ring-[#7CA6FF] outline-none transition-colors duration-200 ease-out cursor-pointer shrink-0"
                  title="Workspace Settings"
                  aria-label="Workspace Settings"
                >
                  <span className="material-symbols-outlined text-[18px]">settings</span>
                </button>
              </div>
            </motion.div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* GLOBAL FIXED THREE-DOTS CONTEXT MENU */}
      <ContextMenu
        contextMenuData={contextMenuData}
        activeContextConv={activeContextConv}
        handleShare={handleShare}
        handleStartRename={handleStartRename}
        togglePin={togglePin}
        handleArchiveConv={handleArchiveConv}
        deleteConv={deleteConv}
        setContextMenuData={setContextMenuData}
      />

      {/* ========================================================================= */}
      {/* CHAT WORKSPACE CANVAS */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative w-full z-10 bg-[#07090D]">
        {/* Floating Top Header */}
        <header className="absolute top-0 left-0 right-0 z-30 pointer-events-none flex justify-between items-center h-[56px] px-4 md:px-6 pt-2 bg-transparent">
          <div className="pointer-events-auto flex items-center gap-2">
            {!sidebarOpen && (
              <motion.button
                onClick={() => setSidebarOpen(true)}
                whileTap={{ scale: 0.9 }}
                className="w-8 h-8 btn-ai-md flex items-center justify-center radius-ai-md bg-[#0D1118] border-0 text-[#A9B3C4] hover:text-[#F7F8FA] hover:bg-[#131925] focus-visible:ring-2 focus-visible:ring-[#7CA6FF]/50 outline-none transition-all cursor-pointer shadow-xs"
                title="Expand Qwen Workspace Sidebar"
              >
                <QwenLogo className="w-4 h-4 text-[#F7F8FA]" />
              </motion.button>
            )}

            {/* Interactive Model Selector Pill Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowModelDropdown(!showModelDropdown)}
                className="flex items-center gap-1.5 px-3 h-8 btn-ai-md radius-ai-md bg-[#0D1118] hover:bg-[#131925] border-0 text-[#F7F8FA] font-sans text-ai-body-sm font-semibold focus-visible:ring-2 focus-visible:ring-[#7CA6FF]/50 outline-none cursor-pointer transition-all shadow-xs active:scale-95 group"
              >
                <span>{modelResponseType === 'page_context' ? 'Qwen Enterprise RAG' : 'Qwen 2.5 32B'}</span>
                <span className="material-symbols-outlined icon-ai-md text-[#6F7B90] group-hover:text-[#F7F8FA] transition-colors">
                  keyboard_arrow_down
                </span>
              </button>

              <AnimatePresence>
                {showModelDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 4, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-10 left-0 bg-[#141A26] border-0 radius-ai-md p-1.5 shadow-[0_16px_40px_rgba(0,0,0,0.48)] z-50 min-w-[240px] flex flex-col gap-0.5"
                  >
                    <button
                      onClick={() => { setModelResponseType('general_knowledge'); setShowModelDropdown(false); }}
                      className={`w-full flex items-center justify-between p-2.5 radius-ai-sm text-ai-body-sm transition-all text-left cursor-pointer focus-visible:ring-1 focus-visible:ring-[#7CA6FF] outline-none ${modelResponseType === 'general_knowledge' ? 'bg-[#1D2636] text-[#F7F8FA] font-medium' : 'text-[#A9B3C4] hover:bg-[#1D2636] hover:text-[#F7F8FA]'
                        }`}
                    >
                      <div>
                        <div className="font-semibold text-ai-body-sm text-[#F7F8FA]">Qwen 2.5 32B</div>
                        <div className="text-ai-caption text-[#6F7B90] font-sans">High-speed code & general logic</div>
                      </div>
                      {modelResponseType === 'general_knowledge' && <span className="material-symbols-outlined icon-ai-md text-[#7CA6FF]">check</span>}
                    </button>

                    <button
                      onClick={() => { setModelResponseType('page_context'); setShowModelDropdown(false); }}
                      className={`w-full flex items-center justify-between p-2.5 radius-ai-sm text-ai-body-sm transition-all text-left cursor-pointer focus-visible:ring-1 focus-visible:ring-[#7CA6FF] outline-none ${modelResponseType === 'page_context' ? 'bg-[#1D2636] text-[#F7F8FA] font-medium' : 'text-[#A9B3C4] hover:bg-[#1D2636] hover:text-[#F7F8FA]'
                        }`}
                    >
                      <div>
                        <div className="font-semibold text-ai-body-sm text-[#F7F8FA]">Qwen Enterprise RAG</div>
                        <div className="text-ai-caption text-[#6F7B90] font-sans">Page context & domain data</div>
                      </div>
                      {modelResponseType === 'page_context' && <span className="material-symbols-outlined icon-ai-md text-[#7CA6FF]">check</span>}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="pointer-events-auto flex items-center gap-2">
            <button
              onClick={handleExport}
              aria-label="Export"
              title="Export"
              className="px-2 sm:px-3 h-8 btn-ai-md radius-ai-md bg-[#0D1118] hover:bg-[#131925] border-0 text-[#A9B3C4] hover:text-[#F7F8FA] focus-visible:ring-2 focus-visible:ring-[#7CA6FF]/50 outline-none text-ai-subtext font-sans font-medium transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 shadow-xs"
            >
              <span className="material-symbols-outlined icon-ai-sm">download</span>
              <span className="hidden sm:inline">Export</span>
            </button>
            <button
              onClick={handleShare}
              aria-label="Share"
              title="Share"
              className="px-2 sm:px-3 h-8 btn-ai-md radius-ai-md bg-[#0D1118] hover:bg-[#131925] border-0 text-[#A9B3C4] hover:text-[#F7F8FA] focus-visible:ring-2 focus-visible:ring-[#7CA6FF]/50 outline-none text-ai-subtext font-sans font-medium transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 shadow-xs"
            >
              <span className="material-symbols-outlined icon-ai-sm">share</span>
              <span className="hidden sm:inline">Share</span>
            </button>
          </div>
        </header>

        {/* Chat Feed Scroll Area */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          style={{ scrollbarGutter: 'stable' }}
          className="flex-1 overflow-y-auto pt-16 pb-40 flex justify-center custom-workspace-scrollbar relative w-full"
        >
          {messages.length === 0 ? (
            <EmptyState
              onSelectPrompt={(promptText) => setInput(promptText)}
              renderInputArea={() => (
                <InputArea
                  input={input}
                  setInput={setInput}
                  handleSubmit={handleSubmit}
                  loading={loading}
                  error={error}
                  scrollToBottom={scrollToBottom}
                  showScrollBottom={false}
                  sidebarOpen={sidebarOpen}
                />
              )}
            />
          ) : (
            <div className="w-full max-w-[768px] px-4 md:px-6 flex flex-col gap-6 md:gap-7 mx-auto">
              {messages.map((msg, idx) =>
                msg.isError ? (
                  <ErrorMessage key={msg.id} message={msg} onRetry={handleRetryLast} />
                ) : msg.role === 'user' ? (
                  <UserMessage key={msg.id} message={msg} onRewrite={(text) => handleExecuteSend(text)} />
                ) : (
                  <AIMessage
                    key={msg.id}
                    message={msg}
                    prompt={idx > 0 && messages[idx - 1]?.role === 'user' ? messages[idx - 1].content : lastUserPrompt}
                    onRetry={handleRetryLast}
                  />
                )
              )}

              <div className="h-36 w-full shrink-0" />
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Bottom Composer Input Area (Active Chat Mode only - Floating & semi-transparent) */}
        {messages.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 z-20 pb-4 pt-8 bg-gradient-to-t from-[#07090D] via-[#07090D]/90 to-transparent pointer-events-none flex justify-center">
            <div className="w-full pointer-events-auto">
              <InputArea
                input={input}
                setInput={setInput}
                handleSubmit={handleSubmit}
                loading={loading}
                error={error}
                scrollToBottom={scrollToBottom}
                showScrollBottom={showScrollBottom}
                sidebarOpen={sidebarOpen}
              />
            </div>
          </div>
        )}
      </div>

      {/* INTERACTIVE SEARCH DIALOG MODAL */}
      <SearchModal
        showSearchModal={showSearchModal}
        setShowSearchModal={setShowSearchModal}
        modalSearchInput={modalSearchInput}
        setModalSearchInput={setModalSearchInput}
        modalSearchResults={modalSearchResults}
        handleSelectConversation={handleSelectConversation}
        searchInputRef={searchInputRef}
      />

      {/* ENGINE SETTINGS MODAL */}
      <EngineSettingsModal
        showSettingsModal={showSettingsModal}
        setShowSettingsModal={setShowSettingsModal}
        modelResponseType={modelResponseType}
        setModelResponseType={setModelResponseType}
        temperature={temperature}
        setTemperature={setTemperature}
        maxTokens={maxTokens}
        setMaxTokens={setMaxTokens}
        systemPrompt={systemPrompt}
        setSystemPrompt={setSystemPrompt}
      />
    </div>
  );
};

export default QwenChat;