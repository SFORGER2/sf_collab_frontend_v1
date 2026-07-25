import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Library, FileText, CloudUpload, ActivitySquare, LayoutDashboard } from 'lucide-react';
import AssistantChat from '@/components/AssistantChat';
import AIDocumentsLibrary from './AIDocumentsLibrary';

const TABS = [
  { id: 'chat', label: 'Assistant Chat', icon: Sparkles },
  { id: 'library', label: 'Document Library', icon: Library },
  { id: 'writer', label: 'Document Writer', icon: FileText },
  { id: 'upload', label: 'Knowledge Sync', icon: CloudUpload },
  { id: 'audit', label: 'Action Audits', icon: ActivitySquare },
  { id: 'health', label: 'Diagnostics', icon: LayoutDashboard }
];

export default function AssistantCenter() {
  const [activeTab, setActiveTab] = useState('chat');

  return (
    <div className="w-full h-[calc(100vh-60px)] flex flex-col bg-[#050508] text-white">
      {/* Top Header */}
      <div className="shrink-0 px-8 py-6 border-b border-white/5 bg-black/40 backdrop-blur-md">
        <h1 className="text-2xl font-semibold flex items-center gap-3">
          <Sparkles className="text-indigo-400" />
          SF Assistant Center
        </h1>
        <p className="text-white/50 text-sm mt-1">
          Manage your AI assistant, documents, actions, and workspace health.
        </p>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Tabs */}
        <div className="w-64 shrink-0 bg-black/20 border-r border-white/5 p-4 flex flex-col gap-2">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === tab.id
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                  : 'hover:bg-white/5 text-white/60 hover:text-white border border-transparent'
              }`}
            >
              <tab.icon size={18} className={activeTab === tab.id ? 'text-indigo-400' : ''} />
              <span className="font-medium text-sm">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 p-6 overflow-y-auto custom-workspace-scrollbar relative">
          
          {/* Background Glow */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />

          {activeTab === 'chat' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="h-full max-w-4xl mx-auto"
            >
              <AssistantChat />
            </motion.div>
          )}

          {activeTab === 'library' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="h-full"
            >
              <AIDocumentsLibrary />
            </motion.div>
          )}

          {activeTab !== 'chat' && activeTab !== 'library' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="h-full flex items-center justify-center text-white/40 flex-col gap-4"
            >
              <Sparkles size={48} className="opacity-20" />
              <p>This module is under development.</p>
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
}
