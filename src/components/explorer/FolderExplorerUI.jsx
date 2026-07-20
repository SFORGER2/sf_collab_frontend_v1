import React, { useState, lazy, Suspense, useEffect, useCallback, useRef } from "react";
import { useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { Upload, FolderPlus, X, Database } from "lucide-react";
import { BreadcrumbNav } from "./BreadcrumbNav";
import { FolderTree } from "./FolderTree";
import { FileListView } from "./FileListView";
import driveService from "@/services/driveService";

// Lazy-load modals so a bad import never causes a blank page
const VersionHistoryModal = lazy(() => import("@/components/drive/VersionHistoryModal"));
const FileLinkModal = lazy(() => import("@/components/drive/FileLinkModal"));
const FileShareModal = lazy(() => import("@/components/drive/FileShareModal"));

// ── Root virtual node (UI anchor) ─────────────────────────────────────────
const ROOT = { id: "root", name: "Drive", type: "folder", updatedAt: new Date().toISOString(), children: [] };

// ── Shape normaliser — backend → UI ──────────────────────────────────────
// Backend DriveFile uses file_id, filename, size_bytes, updated_at
// FileListView expects: { id, name, type, size, updatedAt, original_name }
const normaliseFile = (f) => ({
  ...f,
  id: f.file_id ?? f.id,
  name: f.filename ?? f.name,
  original_name: f.filename ?? f.original_name ?? f.name,
  type: guessType(f.extension ?? f.mime_type ?? ""),
  size: f.size_bytes ?? f.size ?? 0,
  updatedAt: f.updated_at ?? f.updatedAt ?? new Date().toISOString(),
});

const normaliseFolder = (f) => ({
  ...f,
  id: f.id,
  name: f.name,
  type: "folder",
  updatedAt: f.updated_at ?? f.created_at ?? new Date().toISOString(),
  children: [],   // populated on demand when user navigates in
});

const guessType = (hint = "") => {
  const h = hint.toLowerCase();
  if (["png", "jpg", "jpeg", "gif", "webp", "svg"].some((e) => h.includes(e))) return "image";
  if (["xlsx", "xls", "csv"].some((e) => h.includes(e))) return "spreadsheet";
  return "document";
};

// ── Component ─────────────────────────────────────────────────────────────
export const FolderExplorerUI = () => {
  const { user } = useSelector((s) => s.auth);
  // Drive uses user.id as workspace_id — no startup required
  const workspaceId = user?.id ?? null;
  const navigate = useNavigate();

  // ── state ──────────────────────────────────────────────────────────────
  const [rootNode, setRootNode] = useState({ ...ROOT });
  const [currentFolder, setCurrentFolder] = useState({ ...ROOT });
  const [path, setPath] = useState([{ ...ROOT }]);
  const [items, setItems] = useState([]);   // current view (folders + files)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeFile, setActiveFile] = useState(null);
  const [versionOpen, setVersionOpen] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  // ── upload ─────────────────────────────────────────────────────────────
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadNotice, setUploadNotice] = useState(null);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadNotice(null);
    try {
      await driveService.uploadFile(file, {
        ownerScopeType: 'personal',
        ownerScopeId: workspaceId,
        workspaceId: workspaceId,
        folderId: currentFolder.id !== 'root' ? currentFolder.id : null,
      });
      setUploadNotice({ ok: true, msg: `"${file.name}" uploaded.` });
      loadRoot();
    } catch (err) {
      setUploadNotice({ ok: false, msg: err?.response?.data?.error || 'Upload failed.' });
    } finally {
      setUploading(false);
      e.target.value = '';
      setTimeout(() => setUploadNotice(null), 4000);
    }
  };

  // ── new folder ─────────────────────────────────────────────────────────
  const [showFolderInput, setShowFolderInput] = useState(false);
  const [folderName, setFolderName] = useState('');

  const handleCreateFolder = async () => {
    if (!folderName.trim()) return;
    try {
      await driveService.createFolder(
        workspaceId,
        folderName.trim(),
        currentFolder.id !== 'root' ? currentFolder.id : null
      );
      setFolderName('');
      setShowFolderInput(false);
      loadRoot();
    } catch { /* silent */ }
  };

  // ── delete file ───────────────────────────────────────────────────────────
  const handleDeleteFile = async (file) => {
    if (!window.confirm(`Delete "${file.name}"?`)) return;
    try {
      await driveService.deleteFile(file.id);
      setItems(prev => prev.filter(i => i.id !== file.id));
    } catch { /* silent */ }
  };

  // ── file row click ─────────────────────────────────────────────────────────
  const handleRowClick = (node) => {
    if (node.type === "folder") {
      handleNavigate(node);
    } else {
      // Navigate to file detail page
      navigate(`/drive/file/${node.id}`);
    }
  };

  // ── load root contents ─────────────────────────────────────────────────
  const loadRoot = useCallback(async () => {
    if (!workspaceId) return;
    setLoading(true);
    setError(null);
    try {
      const [foldersRaw, filesRaw] = await Promise.all([
        driveService.getFolders(workspaceId),
        driveService.getFiles(workspaceId, null),
      ]);

      const folders = (Array.isArray(foldersRaw) ? foldersRaw : foldersRaw?.folders ?? [])
        .filter((f) => !f.parent_id)          // only top-level folders at root
        .map(normaliseFolder);

      const files = (Array.isArray(filesRaw) ? filesRaw : filesRaw?.files ?? [])
        .filter((f) => !f.folder_id && !f.parent_folder_id)  // root-level files
        .map(normaliseFile);

      const rootWithChildren = { ...ROOT, children: [...folders, ...files] };
      setRootNode(rootWithChildren);
      setCurrentFolder(rootWithChildren);
      setPath([rootWithChildren]);
      setItems([...folders, ...files]);
    } catch (e) {
      const msg = e?.response?.status === 403
        ? "Drive requires the updated drive_routes.py — replace app/routes/drive_routes.py with the output file and restart Flask."
        : e?.response?.status === 500
          ? "Drive tables not created yet — run: python -c \"from app import create_app, db; from app.models.drive_file import DriveFile; from app.models.drive_folder import DriveFolder; app=create_app(); app.app_context().push(); db.create_all()\""
          : "Could not load Drive. Check your workspace access.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => { loadRoot(); }, [loadRoot]);

  // ── load folder contents on navigate ──────────────────────────────────
  const loadFolder = useCallback(async (folderId) => {
    if (!workspaceId) return [];
    try {
      const [foldersRaw, filesRaw] = await Promise.all([
        driveService.getFolders(workspaceId).then(
          (all) => (Array.isArray(all) ? all : all?.folders ?? []).filter((f) => f.parent_id === folderId)
        ),
        driveService.getFiles(workspaceId, folderId),
      ]);
      const folders = foldersRaw.map(normaliseFolder);
      const files = (Array.isArray(filesRaw) ? filesRaw : filesRaw?.files ?? []).map(normaliseFile);
      return [...folders, ...files];
    } catch {
      return [];
    }
  }, [workspaceId]);

  // ── navigation ─────────────────────────────────────────────────────────
  const handleNavigate = async (targetNode) => {
    if (targetNode.type !== "folder") return;

    if (targetNode.id === "root") {
      setCurrentFolder(rootNode);
      setPath([rootNode]);
      setItems(rootNode.children || []);
      return;
    }

    const idx = path.findIndex((n) => n.id === targetNode.id);
    const newPath = idx !== -1 ? path.slice(0, idx + 1) : [...path, targetNode];

    setLoading(true);
    const children = await loadFolder(targetNode.id);
    const updated = { ...targetNode, children };
    setCurrentFolder(updated);
    setPath(newPath.map((n) => n.id === updated.id ? updated : n));
    setItems(children);
    setLoading(false);
  };

  // ── modal trigger ──────────────────────────────────────────────────────
  const openModal = (file, modal) => {
    setActiveFile(file);
    if (modal === "version") setVersionOpen(true);
    if (modal === "link") setLinkOpen(true);
    if (modal === "share") setShareOpen(true);
  };

  // ── render ─────────────────────────────────────────────────────────────
  return (
    <>
      {/* Notices */}
      {uploadNotice && (
        <div className={`mb-3 px-4 py-3 rounded-xl text-sm font-medium ${uploadNotice.ok ? 'bg-emerald-900/40 text-emerald-300 border border-emerald-700' : 'bg-red-900/40 text-red-300 border border-red-700'}`}>
          {uploadNotice.msg}
        </div>
      )}
      <div className="flex flex-col gap-3 px-4 pt-4 lg:pl-6 relative z-10">
        {/* Toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Upload file */}
          <input ref={fileInputRef} type="file" className="hidden" onChange={handleUpload} />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || !workspaceId}
            className="flex items-center gap-2 px-4 py-2 bg-violet-700 hover:bg-violet-600 disabled:opacity-40 text-white text-sm font-medium rounded-xl transition-colors"
          >
            <Upload className="w-4 h-4" />
            {uploading ? 'Uploading…' : 'Upload File'}
          </button>

          {/* New folder */}
          <button
            onClick={() => setShowFolderInput(!showFolderInput)}
            disabled={!workspaceId}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-white text-sm font-medium rounded-xl border border-zinc-700 transition-colors"
          >
            <FolderPlus className="w-4 h-4" /> New Folder
          </button>

          {/* Index My Drive */}
          <Link
            to="/assistant/documents?tab=drive"
            className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-blue-900/50 text-zinc-300 hover:text-blue-300 text-sm font-medium rounded-xl border border-zinc-700 hover:border-blue-500/40 transition-all duration-200"
            title="Index this drive in the AI knowledge base"
          >
            <Database className="w-4 h-4" /> Index My Drive
          </Link>
        </div>

        {/* New folder input */}
        {showFolderInput && (
          <div className="flex items-center gap-2">
            <input
              autoFocus
              type="text"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleCreateFolder(); if (e.key === 'Escape') { setShowFolderInput(false); setFolderName(''); } }}
              placeholder="Folder name…"
              className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500"
            />
            <button onClick={handleCreateFolder} className="px-4 py-2 bg-violet-700 hover:bg-violet-600 text-white text-sm rounded-xl">Create</button>
            <button onClick={() => { setShowFolderInput(false); setFolderName(''); }} className="p-2 text-zinc-500 hover:text-white"><X className="w-4 h-4" /></button>
          </div>
        )}

        {/* File explorer */}
        <div className="flex h-[560px] bg-[#11131a] border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
          {/* Sidebar */}
          <aside className="w-64 border-r border-slate-800 bg-[#0a0b10] flex flex-col py-4 overflow-y-auto">
            <h3 className="px-6 mb-4 text-xs font-semibold tracking-widest text-slate-500 uppercase">Directory</h3>
            {loading && path.length === 1 ? (
              <p className="px-6 text-xs text-slate-600">Loading…</p>
            ) : (
              <FolderTree
                node={rootNode}
                onSelectFolder={handleNavigate}
                activeFolderId={currentFolder.id}
              />
            )}
          </aside>

          {/* Main */}
          <main className="flex-1 flex flex-col min-w-0">
            <BreadcrumbNav path={path} onNavigate={handleNavigate} />

            {loading ? (
              <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
                <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mr-3" />
                Loading…
              </div>
            ) : error ? (
              <div className="flex-1 flex items-center justify-center text-red-400 text-sm px-8 text-center">
                {error}
              </div>
            ) : (
              <FileListView
                files={items}
                onRowClick={handleRowClick}
                onOpenModal={openModal}
                onDeleteFile={handleDeleteFile}
                onDownloadFile={(file) => driveService.downloadFile(file.id, file.name)}
              />
            )}
          </main>
        </div>

        {/* Modals */}
        <Suspense fallback={null}>
          <VersionHistoryModal isOpen={versionOpen} onClose={() => setVersionOpen(false)} file={activeFile} />
          <FileLinkModal isOpen={linkOpen} onClose={() => setLinkOpen(false)} file={activeFile} />
          <FileShareModal isOpen={shareOpen} onClose={() => setShareOpen(false)} file={activeFile} />
        </Suspense>
      </div>
    </>
  );
};