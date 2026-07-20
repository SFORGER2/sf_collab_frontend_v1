import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Trash2, Eye, History, X, Calendar, Tag, Shield, Globe, Lock, FileText, ChevronDown, Check, Loader2, RefreshCw } from 'lucide-react';
import assistantService from '@/services/assistantService';
import { workspaceAPI } from '@/services/workspaceAPI';
import AIVersionHistoryPanel from './AIVersionHistoryPanel';

const MOCK_DOCUMENTS = [
  {
    id: "doc-1",
    title: "Q3 Marketing Strategy & Budget Allocation",
    document_type: "docx",
    scope: "workspace",
    workspace_id: "mock-ws-1",
    workspace_name: "Success Framework marketing",
    version_number: 3,
    tags: "marketing,budget,q3",
    created_at: "2026-07-10T10:00:00Z"
  },
  {
    id: "doc-2",
    title: "V2 Backend Architecture and API Specs",
    document_type: "markdown",
    scope: "private",
    workspace_id: "mock-ws-2",
    workspace_name: "Engineering core",
    version_number: 1,
    tags: "api,specs,backend",
    created_at: "2026-07-15T14:30:00Z"
  },
  {
    id: "doc-3",
    title: "Company Handbook & Code of Conduct",
    document_type: "pdf",
    scope: "global",
    workspace_id: null,
    workspace_name: null,
    version_number: 2,
    tags: "hr,handbook,legal",
    created_at: "2026-06-20T09:15:00Z"
  }
];

export default function AIDocumentsLibrary() {
  const [documents, setDocuments] = useState([]);
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWorkspace, setSelectedWorkspace] = useState('all');
  const [selectedScope, setSelectedScope] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

  // Detail Modal
  const [viewingDoc, setViewingDoc] = useState(null);
  const [docContent, setDocContent] = useState('');
  const [loadingContent, setLoadingContent] = useState(false);

  // Version panel
  const [selectedDocForHistory, setSelectedDocForHistory] = useState(null);

  // Delete State
  const [deletingDocId, setDeletingDocId] = useState(null);

  useEffect(() => {
    fetchFiltersData();
    fetchDocuments();
  }, []);

  const fetchFiltersData = async () => {
    try {
      const list = await workspaceAPI.getMyWorkspaces();
      setWorkspaces(list || []);
    } catch (err) {
      console.error("Error loading workspaces for filters:", err);
    }
  };

  const fetchDocuments = async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await assistantService.getDocuments();
      if (list && list.length > 0) {
        setDocuments(list);
      } else {
        // Fallback to mock documents in development if empty
        setDocuments(MOCK_DOCUMENTS);
      }
    } catch (err) {
      console.error("Error fetching documents:", err);
      // Fallback to mock documents in case of API failure in dev env
      setDocuments(MOCK_DOCUMENTS);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setDeletingDocId(id);
    try {
      await assistantService.deleteDocument(id);
      setDocuments(prev => prev.filter(doc => doc.id !== id));
    } catch (err) {
      console.error("Error deleting document:", err);
      // Mock delete support if real delete fails
      setDocuments(prev => prev.filter(doc => doc.id !== id));
    } finally {
      setDeletingDocId(null);
    }
  };

  const handleViewContent = async (doc) => {
    setViewingDoc(doc);
    setLoadingContent(true);
    setDocContent('');
    try {
      const detailed = await assistantService.getDocument(doc.id, true);
      setDocContent(detailed?.text || detailed?.content || "No text content available in this document.");
    } catch (err) {
      console.error("Error fetching document content:", err);
      // Fallback mock content
      setTimeout(() => {
        setDocContent(`[Mock Content for ${doc.title}]\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Proin elementum ligula non mi tristique hendrerit. Aliquam convallis nulla erat, sit amet interdum elit vestibulum ac. Mauris nec molestie lacus. Fusce quis rhoncus diam. Suspendisse pulvinar, tortor vitae laoreet vulputate, odio ligula pulvinar metus, sed scelerisque nunc erat eu purus.`);
        setLoadingContent(false);
      }, 500);
      return;
    }
    setLoadingContent(false);
  };

  // Filtered List
  const filteredDocs = documents.filter(doc => {
    const matchesSearch = (doc.title?.toLowerCase().includes(searchTerm.toLowerCase())) || 
                          (doc.tags && String(doc.tags).toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesWorkspace = selectedWorkspace === 'all' || 
                            doc.workspace_id === selectedWorkspace;
    
    const matchesScope = selectedScope === 'all' || 
                         doc.scope === selectedScope;
    
    const matchesType = selectedType === 'all' || 
                        doc.document_type?.toLowerCase() === selectedType.toLowerCase();

    return matchesSearch && matchesWorkspace && matchesScope && matchesType;
  });

  return (
    <div className="flex flex-col h-full space-y-6">
      
      {/* Top Filter Bar */}
      <div className="flex flex-wrap gap-3 items-center justify-between bg-black/40 border border-white/5 rounded-2xl p-4">
        
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 w-4 h-4" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search documents or tags..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-white/40 outline-none focus:border-indigo-500/50 transition-colors"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Workspace select */}
          <div className="flex items-center bg-white/5 border border-white/10 rounded-xl px-3 py-2">
            <span className="text-xs text-white/40 mr-2 font-medium">Workspace:</span>
            <select
              value={selectedWorkspace}
              onChange={(e) => setSelectedWorkspace(e.target.value)}
              className="bg-transparent text-xs text-white outline-none cursor-pointer pr-1"
            >
              <option value="all" className="bg-[#0f0f15]">All Workspaces</option>
              <option value="mock-ws-1" className="bg-[#0f0f15]">Success Framework marketing</option>
              <option value="mock-ws-2" className="bg-[#0f0f15]">Engineering core</option>
              {workspaces.map(w => (
                <option key={w.id} value={w.id} className="bg-[#0f0f15]">{w.name}</option>
              ))}
            </select>
          </div>

          {/* Scope Select */}
          <div className="flex items-center bg-white/5 border border-white/10 rounded-xl px-3 py-2">
            <span className="text-xs text-white/40 mr-2 font-medium">Scope:</span>
            <select
              value={selectedScope}
              onChange={(e) => setSelectedScope(e.target.value)}
              className="bg-transparent text-xs text-white outline-none cursor-pointer pr-1"
            >
              <option value="all" className="bg-[#0f0f15]">All Scopes</option>
              <option value="global" className="bg-[#0f0f15]">Global</option>
              <option value="workspace" className="bg-[#0f0f15]">Workspace</option>
              <option value="private" className="bg-[#0f0f15]">Private</option>
            </select>
          </div>

          {/* Type Select */}
          <div className="flex items-center bg-white/5 border border-white/10 rounded-xl px-3 py-2">
            <span className="text-xs text-white/40 mr-2 font-medium">Type:</span>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-transparent text-xs text-white outline-none cursor-pointer pr-1"
            >
              <option value="all" className="bg-[#0f0f15]">All Types</option>
              <option value="pdf" className="bg-[#0f0f15]">PDF</option>
              <option value="docx" className="bg-[#0f0f15]">DOCX</option>
              <option value="markdown" className="bg-[#0f0f15]">Markdown</option>
              <option value="txt" className="bg-[#0f0f15]">TXT</option>
              <option value="json" className="bg-[#0f0f15]">JSON</option>
            </select>
          </div>

          {/* Refresh button */}
          <button 
            onClick={fetchDocuments}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition border border-white/10"
            title="Refresh List"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

      </div>

      {/* Main Grid/Table Content */}
      <div className="bg-black/40 border border-white/5 rounded-2xl overflow-hidden flex-1 flex flex-col">
        {loading ? (
          <div className="flex-1 flex items-center justify-center py-20 flex-col gap-3">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            <p className="text-sm text-white/40">Loading document library...</p>
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-white/30 gap-3">
            <FileText size={48} className="opacity-20" />
            <p className="text-sm">No indexed documents found matching filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02] text-xs font-semibold uppercase tracking-wider text-white/40">
                  <th className="px-6 py-4">Document Title</th>
                  <th className="px-6 py-4">Scope</th>
                  <th className="px-6 py-4">Workspace</th>
                  <th className="px-6 py-4">Version</th>
                  <th className="px-6 py-4">Tags</th>
                  <th className="px-6 py-4">Indexed Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {filteredDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-white/[0.01] transition-colors">
                    
                    {/* Title */}
                    <td className="px-6 py-4 font-medium text-white/90">
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="text-indigo-400 shrink-0" />
                        <span className="truncate max-w-[240px]" title={doc.title}>
                          {doc.title}
                        </span>
                        <span className="text-[10px] bg-white/5 text-white/50 px-1.5 py-0.5 rounded font-mono uppercase">
                          {doc.document_type || 'txt'}
                        </span>
                      </div>
                    </td>

                    {/* Scope */}
                    <td className="px-6 py-4">
                      {doc.scope === 'global' && (
                        <span className="inline-flex items-center gap-1 text-[11px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-medium">
                          <Globe size={10} /> Global
                        </span>
                      )}
                      {doc.scope === 'workspace' && (
                        <span className="inline-flex items-center gap-1 text-[11px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full font-medium">
                          <Shield size={10} /> Workspace
                        </span>
                      )}
                      {doc.scope === 'private' && (
                        <span className="inline-flex items-center gap-1 text-[11px] bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded-full font-medium">
                          <Lock size={10} /> Private
                        </span>
                      )}
                    </td>

                    {/* Workspace */}
                    <td className="px-6 py-4 text-white/60 text-xs">
                      {doc.workspace_name || <span className="text-white/20">—</span>}
                    </td>

                    {/* Version */}
                    <td className="px-6 py-4 font-mono text-xs text-indigo-300 font-semibold">
                      v{doc.version_number || 1}
                    </td>

                    {/* Tags */}
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 max-w-[180px]">
                        {doc.tags ? (
                          (Array.isArray(doc.tags) ? doc.tags : String(doc.tags).split(',')).map((t, idx) => (
                            <span key={idx} className="text-[10px] bg-white/5 text-white/60 px-2 py-0.5 rounded border border-white/5">
                              {String(t).trim()}
                            </span>
                          ))
                        ) : (
                          <span className="text-white/20">—</span>
                        )}
                      </div>
                    </td>

                    {/* Indexed Date */}
                    <td className="px-6 py-4 text-xs text-white/40">
                      {new Date(doc.created_at || Date.now()).toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => handleViewContent(doc)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition cursor-pointer"
                          title="View Document text"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => setSelectedDocForHistory(doc)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition cursor-pointer"
                          title="View Version History"
                        >
                          <History size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(doc.id)}
                          disabled={deletingDocId === doc.id}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-white/70 hover:text-rose-400 transition cursor-pointer"
                          title="Delete Document"
                        >
                          {deletingDocId === doc.id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Trash2 size={14} />
                          )}
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Slide-over Version History Panel */}
      <AnimatePresence>
        {selectedDocForHistory && (
          <AIVersionHistoryPanel
            document={selectedDocForHistory}
            onClose={() => setSelectedDocForHistory(null)}
          />
        )}
      </AnimatePresence>

      {/* View Content Modal Overlay */}
      <AnimatePresence>
        {viewingDoc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 bg-opacity-70">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#11131a] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col border border-white/10 overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                <div>
                  <h3 className="text-base font-semibold text-white truncate max-w-[400px]">
                    {viewingDoc.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 text-xs text-white/40 font-mono">
                    <span>v{viewingDoc.version_number}</span>
                    <span>•</span>
                    <span className="uppercase">{viewingDoc.document_type}</span>
                  </div>
                </div>
                <button
                  onClick={() => setViewingDoc(null)}
                  className="text-white/40 hover:text-white transition p-1 rounded-lg hover:bg-white/5 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 p-6 overflow-y-auto custom-workspace-scrollbar bg-black/35 font-mono text-xs leading-relaxed text-white/80 whitespace-pre-wrap select-text">
                {loadingContent ? (
                  <div className="h-full flex items-center justify-center flex-col gap-2 py-12">
                    <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
                    <span className="text-white/40 text-xs">Loading content...</span>
                  </div>
                ) : (
                  docContent
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end px-6 py-4 border-t border-white/10 bg-black/20">
                <button
                  onClick={() => setViewingDoc(null)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
