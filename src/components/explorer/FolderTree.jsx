import React, { useState } from "react";
import { ChevronRight, ChevronDown, Folder } from "lucide-react";

export const FolderTree = ({ node, onSelectFolder, activeFolderId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const isFolder = node.type === "folder";
  const isActive = node.id === activeFolderId;

  if (!isFolder) return null;

  const handleToggle = (e) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const handleSelect = () => {
    onSelectFolder(node);
    if (!isOpen) setIsOpen(true);
  };

  return (
    <div className="pl-4 select-none">
      <div
        className={`flex items-center py-1.5 px-2 rounded-md cursor-pointer transition-colors ${
          isActive
            ? "bg-purple-900/20 text-purple-400"
            : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
        }`}
        onClick={handleSelect}
      >
        <span
          onClick={handleToggle}
          className="mr-1 p-0.5 rounded hover:bg-slate-700"
        >
          {node.children && node.children.length > 0 ? (
            isOpen ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )
          ) : (
            <span className="w-3.5 h-3.5 inline-block" />
          )}
        </span>
        <Folder
          className={`w-4 h-4 mr-2 ${isActive ? "fill-purple-500/20" : ""}`}
        />
        <span className="text-sm truncate">{node.name}</span>
      </div>

      {isOpen && node.children && (
        <div className="border-l border-slate-800 ml-3 mt-1">
          {node.children.map((child) => (
            <FolderTree
              key={child.id}
              node={child}
              onSelectFolder={onSelectFolder}
              activeFolderId={activeFolderId}
            />
          ))}
        </div>
      )}
    </div>
  );
};
