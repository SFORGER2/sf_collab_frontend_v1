import React, { useState, lazy, Suspense } from "react";
import { BreadcrumbNav } from "./BreadcrumbNav";
import { FolderTree }    from "./FolderTree";
import { FileListView }  from "./FileListView";

// Lazy-load modals so a bad import never causes a blank page
const VersionHistoryModal = lazy(() => import("@/components/drive/VersionHistoryModal"));
const FileLinkModal       = lazy(() => import("@/components/drive/FileLinkModal"));
const FileShareModal      = lazy(() => import("@/components/drive/FileShareModal"));

const mockFileSystem = {
  id: "root",
  name: "Drive",
  type: "folder",
  updatedAt: "2026-04-20T10:00:00Z",
  children: [
    {
      id: "f1",
      name: "Startup Drive",
      type: "folder",
      updatedAt: "2026-04-22T10:00:00Z",
      children: [
        { id: "file1", name: "Q1_Financials.xlsx",  original_name: "Q1_Financials.xlsx",  type: "spreadsheet", size: 2400000,  updatedAt: "2026-04-25T14:30:00Z" },
        { id: "file2", name: "Pitch_Deck_v4.pptx",  original_name: "Pitch_Deck_v4.pptx",  type: "document",    size: 15100000, updatedAt: "2026-04-26T09:15:00Z" },
      ],
    },
    {
      id: "f2",
      name: "My Drive",
      type: "folder",
      updatedAt: "2026-04-27T10:00:00Z",
      children: [
        { id: "file3", name: "System_Architecture.png", original_name: "System_Architecture.png", type: "image", size: 842000, updatedAt: "2026-04-27T16:20:00Z" },
      ],
    },
  ],
};

export const FolderExplorerUI = () => {
  const [currentFolder, setCurrentFolder] = useState(mockFileSystem);
  const [path,          setPath]          = useState([mockFileSystem]);

  const [activeFile,   setActiveFile]   = useState(null);
  const [versionOpen,  setVersionOpen]  = useState(false);
  const [linkOpen,     setLinkOpen]     = useState(false);
  const [shareOpen,    setShareOpen]    = useState(false);

  const openModal = (file, modal) => {
    setActiveFile(file);
    if (modal === 'version') setVersionOpen(true);
    if (modal === 'link')    setLinkOpen(true);
    if (modal === 'share')   setShareOpen(true);
  };

  const handleNavigate = (targetNode) => {
    if (targetNode.type !== "folder") return;
    setCurrentFolder(targetNode);
    const idx = path.findIndex((n) => n.id === targetNode.id);
    setPath(idx !== -1 ? path.slice(0, idx + 1) : [...path, targetNode]);
  };

  return (
    <>
      <div className="flex h-[600px] bg-[#11131a] border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
        <aside className="w-64 border-r border-slate-800 bg-[#0a0b10] flex flex-col py-4 overflow-y-auto">
          <h3 className="px-6 mb-4 text-xs font-semibold tracking-widest text-slate-500 uppercase">Directory</h3>
          <FolderTree node={mockFileSystem} onSelectFolder={handleNavigate} activeFolderId={currentFolder.id} />
        </aside>
        <main className="flex-1 flex flex-col min-w-0">
          <BreadcrumbNav path={path} onNavigate={handleNavigate} />
          <FileListView files={currentFolder.children || []} onRowClick={handleNavigate} onOpenModal={openModal} />
        </main>
      </div>

      {/* Modals — wrapped in Suspense so load failures don't crash the page */}
      <Suspense fallback={null}>
        <VersionHistoryModal isOpen={versionOpen} onClose={() => setVersionOpen(false)} file={activeFile} />
        <FileLinkModal       isOpen={linkOpen}    onClose={() => setLinkOpen(false)}    file={activeFile} />
        <FileShareModal      isOpen={shareOpen}   onClose={() => setShareOpen(false)}   file={activeFile} />
      </Suspense>
    </>
  );
};