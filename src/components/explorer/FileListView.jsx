import React, { useState, useRef, useEffect } from "react";
import { Folder, FileText, Image as ImageIcon, Table, MoreHorizontal, History, Link as LinkIcon, Share2 } from "lucide-react";

const formatBytes = (bytes) => {
  if (!bytes) return "--";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

const getIcon = (type) => {
  switch (type) {
    case "folder":      return <Folder    className="w-5 h-5 text-cyan-500 fill-cyan-500/20" />;
    case "image":       return <ImageIcon className="w-5 h-5 text-green-400" />;
    case "spreadsheet": return <Table     className="w-5 h-5 text-emerald-500" />;
    default:            return <FileText  className="w-5 h-5 text-slate-400" />;
  }
};

function RowMenu({ file, onOpenModal }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const actions = [
    { icon: History,   label: 'Version History', modal: 'version' },
    { icon: LinkIcon,  label: 'Link to…',        modal: 'link'    },
    { icon: Share2,    label: 'Share',            modal: 'share'   },
  ];

  return (
    <div ref={ref} className="relative" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={() => setOpen(p => !p)}
        className="text-slate-400 hover:text-white p-1.5 rounded-md hover:bg-slate-700 transition"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-8 z-50 w-44 bg-[#1e2130] border border-white/10 rounded-xl shadow-2xl overflow-hidden">
          {actions.map(({ icon: Icon, label, modal }) => (
            <button
              key={modal}
              onClick={() => { setOpen(false); onOpenModal(file, modal); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition font-mono"
            >
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export const FileListView = ({ files, onRowClick, onOpenModal }) => {
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
          {files && files.map((file) => (
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
              <td className="px-6 py-3">
                {file.type !== 'folder' && onOpenModal && (
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <RowMenu file={file} onOpenModal={onOpenModal} />
                  </div>
                )}
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