import React from "react";
import {
  FileText,
  Image as ImageIcon,
  Eye,
  Download,
  Check,
  X,
  ExternalLink,
  Github,
  Globe,
  FileCode,
  PlayCircle,
} from "lucide-react";
import { Button } from "../../../ui/button";

const ProofReviewer = ({ proofFiles = [], onApprove, onReject }) => {
  // UI Helper: Determine icon based on file/link type
  const getProofIcon = (file) => {
    if (file.type === "link") {
      const linkIcons = {
        github: <Github className="w-5 h-5 text-slate-300" />,
        design: <FileCode className="w-5 h-5 text-purple-400" />,
        video: <PlayCircle className="w-5 h-5 text-amber-400" />,
        web: <Globe className="w-5 h-5 text-blue-400" />,
      };
      return linkIcons[file.linkType] || linkIcons.web;
    }

    return file.fileType?.includes("image") ? (
      <ImageIcon className="w-5 h-5 text-blue-400" />
    ) : (
      <FileText className="w-5 h-5 text-slate-400" />
    );
  };

  // UI Helper: Get short label for the proof item
  const getTacticalLabel = (file) => {
    if (file.type === "link") {
      const labels = {
        github: "GitHub",
        design: "Figma",
        video: "Video",
        web: "URL",
      };
      return labels[file.linkType] || "Link";
    }
    return "File";
  };

  return (
    <div className="space-y-5">
      {/* Grid: Inspection Queue */}
      <div className="grid grid-cols-1 gap-3">
        {proofFiles.map((file, index) => (
          <div
            key={index}
            className="flex items-center gap-4 p-3 sm:p-4 bg-[#151B2B] border border-white/5 rounded-xl group transition-all hover:border-white/10 hover:shadow-md"
          >
            {/* Visual: Identity Block */}
            <div className="w-12 h-12 rounded-lg bg-[#0B101E] flex items-center justify-center border border-white/5 shrink-0 relative">
              {getProofIcon(file)}
            </div>

            {/* Text: Proof Metadata */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-200 truncate mb-1">
                {file.name}
              </p>
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded">
                  {getTacticalLabel(file)}
                </span>

                {file.type === "link" && (
                  <a
                    href={file.url || file.name}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
                  >
                    Open Link <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>

            {/* Actions: Item-Level Inspection */}
            <div className="flex items-center gap-2 shrink-0">
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-transparent border border-white/10 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors">
                <Eye className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Inspect</span>
              </button>
              {file.type !== "link" && (
                <button
                  className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors border border-transparent hover:border-white/10"
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* State: Empty Queue */}
      {proofFiles.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 border border-dashed border-white/10 rounded-xl bg-[#0F1423]/50">
          <FileText className="w-6 h-6 text-slate-600 mb-2" />
          <p className="text-sm font-medium text-slate-500">
            No proof attachments found.
          </p>
        </div>
      )}

      {/* Control: Final Audit Actions */}
      <footer className="flex gap-3 pt-2">
        <Button
          onClick={onReject}
          variant="outline"
          className="flex-1 h-10 border border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300 hover:border-red-500/50 text-xs font-semibold rounded-lg transition-colors bg-transparent"
        >
          <X className="w-4 h-4 mr-1.5" />
          Reject Proof
        </Button>

        <Button
          onClick={onApprove}
          className="flex-1 h-10 bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white text-xs font-semibold rounded-lg shadow-lg shadow-blue-500/20 transition-all border border-blue-400/20"
        >
          <Check className="w-4 h-4 mr-1.5" />
          Verify Proof
        </Button>
      </footer>
    </div>
  );
};

export default ProofReviewer;
