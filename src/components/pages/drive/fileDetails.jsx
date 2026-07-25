'use client';

import React, { lazy, Suspense, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  FileText, Download, Share2, Edit3, Clock,
  Link as LinkIcon, Tag, Eye, ArrowLeft, MoreHorizontal, History,
} from 'lucide-react';
import driveService from '@/services/driveService';
import axios from 'axios';
import { requestInterceptor, requestErrorInterceptor, responseInterceptor, responseErrorInterceptor } from '@/utils/APIs/interceptors';
import AskAIButton from '@/components/pages/assistant/AskAIButton';

const driveApi = axios.create({ baseURL: '/api/drive' });
driveApi.interceptors.request.use(requestInterceptor, requestErrorInterceptor);
driveApi.interceptors.response.use(responseInterceptor, responseErrorInterceptor);

const VersionHistoryModal = lazy(() => import('@/components/drive/VersionHistoryModal'));
const FileLinkModal       = lazy(() => import('@/components/drive/FileLinkModal'));
const FileShareModal      = lazy(() => import('@/components/drive/FileShareModal'));

const STATUS_COLOR = {
  completed:   'bg-emerald-400',
  'in-progress':'bg-amber-400',
  in_progress: 'bg-amber-400',
  pending:     'bg-white/30',
  to_do:       'bg-white/30',
};

const FileDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector(s => s.auth);

  const [file,     setFile]     = useState(null);
  const [versions, setVersions] = useState([]);
  const [links,    setLinks]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  const [versionOpen, setVersionOpen] = useState(false);
  const [linkOpen,    setLinkOpen]    = useState(false);
  const [shareOpen,   setShareOpen]   = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      try {
        const [fRes, vRes, lRes] = await Promise.allSettled([
          driveApi.get(`/files/${id}`),
          driveService.getVersions(id),
          driveService.getLinkedObjects(id),
        ]);
        if (fRes.status === 'fulfilled') {
          const raw = fRes.value?.data?.data ?? fRes.value?.data;
          setFile(raw);
        }
        if (vRes.status === 'fulfilled') setVersions(vRes.value?.versions || []);
        if (lRes.status === 'fulfilled') setLinks(lRes.value?.links || []);
      } catch (e) {
        setError('Could not load file details.');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleDownload = async () => {
    const filename = file?.filename || file?.name || `file_${id}`;
    try {
      await driveService.downloadFile(id, filename);
    } catch {
      // Fallback: open the file API endpoint directly
      window.open(`/api/drive/files/${id}/download`, '_blank');
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-zinc-800 border-t-purple-400 rounded-full animate-spin" />
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center text-red-400">{error}</div>
  );

  const tags = file?.metadata?.tags || file?.tags_json || [];
  const name = file?.filename || file?.name || (file ? `File #${file.file_id || id}` : `File #${id}`);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white font-mono overflow-hidden">

      {/* Top Bar */}
      <div className="border-b border-white/10 bg-black/60 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-900/50 to-cyan-900/30 rounded-xl flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h1 className="text-xl font-semibold tracking-tight">{name}</h1>
                <p className="text-xs text-white/50">
                  {file?.mime_type || file?.extension || 'File'}
                  {file?.size_bytes ? ` • ${(file.size_bytes / 1024 / 1024).toFixed(1)} MB` : ''}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <AskAIButton workspaceId={user?.active_workspace_id} label="Ask AI" />
            <button onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-sm transition-all">
              <Download className="w-4 h-4" /> Download
            </button>
            <button onClick={() => setShareOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-sm transition-all">
              <Share2 className="w-4 h-4" /> Share
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8 grid grid-cols-12 gap-8">

        {/* Left Column */}
        <div className="col-span-12 lg:col-span-8 space-y-8">

          {/* File info */}
          <div className="bg-[#12121a] border border-white/10 rounded-3xl p-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <span className="text-purple-400">◉</span> FILE INFO
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-white/50 block mb-1">State</span><p className="text-white capitalize">{file?.state || '—'}</p></div>
              <div><span className="text-white/50 block mb-1">Visibility</span><p className="text-white capitalize">{file?.visibility_scope || file?.visibility || '—'}</p></div>
              <div><span className="text-white/50 block mb-1">Uploaded</span><p className="text-white">{file?.uploaded_at ? new Date(file.uploaded_at).toLocaleDateString('en-GB', {day:'numeric',month:'short',year:'numeric'}) : '—'}</p></div>
              <div><span className="text-white/50 block mb-1">Modified</span><p className="text-white">{file?.updated_at ? new Date(file.updated_at).toLocaleDateString('en-GB', {day:'numeric',month:'short',year:'numeric'}) : '—'}</p></div>
              <div><span className="text-white/50 block mb-1">Type</span><p className="text-white">{file?.mime_type || file?.extension || '—'}</p></div>
              <div><span className="text-white/50 block mb-1">Size</span><p className="text-white">{file?.size_bytes ? `${(file.size_bytes/1024).toFixed(1)} KB` : '—'}</p></div>
            </div>
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="bg-[#12121a] border border-white/10 rounded-3xl p-8">
              <div className="flex items-center gap-2 mb-6">
                <Tag className="w-5 h-5 text-purple-400" />
                <h2 className="text-lg font-semibold">TAGS</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, i) => (
                  <div key={i} className="px-4 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-sm transition-colors cursor-pointer">
                    #{tag}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="col-span-12 lg:col-span-4 space-y-8">

          {/* Linked Objects */}
          <div className="bg-[#12121a] border border-white/10 rounded-3xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <LinkIcon className="w-5 h-5 text-purple-400" /> LINKED OBJECTS
              </h2>
              <button onClick={() => setLinkOpen(true)}
                className="text-xs text-purple-400 hover:text-purple-300 transition">
                + Link
              </button>
            </div>
            {links.length === 0 ? (
              <p className="text-sm text-white/40">No linked objects yet.</p>
            ) : (
              <div className="space-y-4">
                {links.map((link, i) => (
                  <div key={i} className="group p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all flex gap-4">
                    <div className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 bg-purple-400`} />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{link.entity_name || `${link.entity_type} #${link.entity_id}`}</div>
                      <div className="text-xs text-white/50 mt-0.5 capitalize">{link.entity_type}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Version History */}
          <div className="bg-[#12121a] border border-white/10 rounded-3xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-400" /> VERSION HISTORY
              </h2>
              <button onClick={() => setVersionOpen(true)}
                className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 transition">
                <History className="w-3 h-3" /> View All
              </button>
            </div>
            {versions.length === 0 ? (
              <p className="text-sm text-white/40">No versions yet.</p>
            ) : (
              <div className="space-y-6">
                {versions.slice(0, 5).map((ver, idx) => (
                  <div key={idx} className="flex gap-4 group">
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-purple-900/50 to-cyan-900/30 border border-white/10 rounded-2xl flex items-center justify-center text-xs font-mono">
                      v{ver.version_number}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{ver.created_at ? new Date(ver.created_at).toLocaleDateString() : '—'}</div>
                      <div className="text-xs text-white/50 mt-0.5">
                        {ver.size_bytes ? `${(ver.size_bytes / 1024).toFixed(1)} KB` : ''}
                      </div>
                    </div>
                    <button onClick={() => driveService.downloadFile(id, name)}
                      className="opacity-0 group-hover:opacity-100 self-center p-2 hover:bg-white/10 rounded-xl transition-all">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Suspense fallback={null}>
        <VersionHistoryModal isOpen={versionOpen} onClose={() => setVersionOpen(false)} file={{ id, name }} />
        <FileLinkModal       isOpen={linkOpen}    onClose={() => setLinkOpen(false)}    file={{ id, name }} />
        <FileShareModal      isOpen={shareOpen}   onClose={() => setShareOpen(false)}   file={{ id, name }} />
      </Suspense>
    </div>
  );
};

export default FileDetailPage;