import React from "react";
import {
  Folder,
  FileText,
  Image as ImageIcon,
  Table,
  MoreHorizontal,
} from "lucide-react";

const formatBytes = (bytes) => {
  if (!bytes) return "--";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

const getIcon = (type) => {
  switch (type) {
    case "folder":
      return <Folder className="w-5 h-5 text-cyan-500 fill-cyan-500/20" />;
    case "image":
      return <ImageIcon className="w-5 h-5 text-green-400" />;
    case "spreadsheet":
      return <Table className="w-5 h-5 text-emerald-500" />;
    default:
      return <FileText className="w-5 h-5 text-slate-400" />;
  }
};

export const FileListView = ({ files, onRowClick }) => {
  return (
    <div className="overflow-auto flex-1">
      <table className="w-full text-left text-sm border-collapse">
        <thead className="sticky top-0 bg-[#11131a] z-10 border-b border-slate-800">
          <tr className="text-slate-500">
            <th className="font-medium px-6 py-3">Name</th>
            <th className="font-medium px-6 py-3 w-40">Last Modified</th>
            <th className="font-medium px-6 py-3 w-32">Size</th>
            <th className="font-medium px-6 py-3 w-16"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/50">
          {files &&
            files.map((file) => (
              <tr
                key={file.id}
                onClick={() => onRowClick(file)}
                className="group hover:bg-[#151822] transition-colors cursor-pointer"
              >
                <td className="px-6 py-3 flex items-center gap-3">
                  {getIcon(file.type)}
                  <span className="text-slate-200 font-medium group-hover:text-purple-300 transition-colors">
                    {file.name}
                  </span>
                </td>
                <td className="px-6 py-3 text-slate-500 font-mono text-xs">
                  {new Date(file.updatedAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-3 text-slate-500 font-mono text-xs">
                  {formatBytes(file.size)}
                </td>
                <td className="px-6 py-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    className="text-slate-400 hover:text-white p-1.5 rounded-md hover:bg-slate-700"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>

      {(!files || files.length === 0) && (
        <div className="flex flex-col items-center justify-center h-40 text-slate-500">
          <p>This folder is empty.</p>
        </div>
      )}
    </div>
  );
};
