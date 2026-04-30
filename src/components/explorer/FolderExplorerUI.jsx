import React, { useState } from "react";
import { BreadcrumbNav } from "./BreadcrumbNav";
import { FolderTree } from "./FolderTree";
import { FileListView } from "./FileListView";

// Mock Data structure
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
        {
          id: "file1",
          name: "Q1_Financials.xlsx",
          type: "spreadsheet",
          size: 2400000,
          updatedAt: "2026-04-25T14:30:00Z",
        },
        {
          id: "file2",
          name: "Pitch_Deck_v4.pptx",
          type: "document",
          size: 15100000,
          updatedAt: "2026-04-26T09:15:00Z",
        },
      ],
    },
    {
      id: "f2",
      name: "My Drive",
      type: "folder",
      updatedAt: "2026-04-27T10:00:00Z",
      children: [
        {
          id: "file3",
          name: "System_Architecture.png",
          type: "image",
          size: 842000,
          updatedAt: "2026-04-27T16:20:00Z",
        },
      ],
    },
  ],
};

export const FolderExplorerUI = () => {
  const [currentFolder, setCurrentFolder] = useState(mockFileSystem);
  const [path, setPath] = useState([mockFileSystem]);

  const handleNavigate = (targetNode) => {
    if (targetNode.type !== "folder") return;

    setCurrentFolder(targetNode);

    const targetIndex = path.findIndex((n) => n.id === targetNode.id);
    if (targetIndex !== -1) {
      setPath(path.slice(0, targetIndex + 1));
    } else {
      setPath([...path, targetNode]);
    }
  };

  return (
    <div className="flex h-[600px] bg-[#11131a] border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      {/* Sidebar: Folder Tree */}
      <aside className="w-64 border-r border-slate-800 bg-[#0a0b10] flex flex-col py-4 overflow-y-auto">
        <h3 className="px-6 mb-4 text-xs font-semibold tracking-widest text-slate-500 uppercase">
          Directory
        </h3>
        <FolderTree
          node={mockFileSystem}
          onSelectFolder={handleNavigate}
          activeFolderId={currentFolder.id}
        />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        <BreadcrumbNav path={path} onNavigate={handleNavigate} />
        <FileListView
          files={currentFolder.children || []}
          onRowClick={handleNavigate}
        />
      </main>
    </div>
  );
};
