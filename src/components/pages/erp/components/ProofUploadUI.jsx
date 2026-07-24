import React, { useState } from "react";
import { motion } from "framer-motion";
import { Upload, Link as LinkIcon, CheckCircle2, XCircle, Clock, FileText } from "lucide-react";
import { toast } from "react-toastify";

export const ProofUploadUI = ({ task, currentUserRole, onApprove, onReject, onUpload }) => {
  const [uploadType, setUploadType] = useState("url"); // 'url' or 'file'
  const [url, setUrl] = useState("");
  const [rejectionNotes, setRejectionNotes] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);

  // Simulated status
  const proofStatus = task.proofStatus || "pending_upload"; // pending_upload, awaiting_review, approved, rejected

  const handleUpload = () => {
    if (!url && uploadType === "url") return;
    onUpload({ type: uploadType, url: url || "File_Mock_123.pdf" });
    toast.success("Proof submitted for review!");
    setUrl("");
  };

  const handleReject = () => {
    if (!rejectionNotes) return toast.error("Please provide rejection notes.");
    onReject(rejectionNotes);
    setShowRejectInput(false);
    setRejectionNotes("");
  };

  // Badges
  const StatusBadge = () => {
    if (proofStatus === "approved") return <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20 uppercase tracking-widest"><CheckCircle2 size={10}/> Approved</span>;
    if (proofStatus === "rejected") return <span className="flex items-center gap-1 text-[10px] font-bold text-red-400 bg-red-500/10 px-2 py-1 rounded-md border border-red-500/20 uppercase tracking-widest"><XCircle size={10}/> Rejected</span>;
    if (proofStatus === "awaiting_review") return <span className="flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-1 rounded-md border border-amber-500/20 uppercase tracking-widest"><Clock size={10}/> Awaiting Review</span>;
    return <span className="flex items-center gap-1 text-[10px] font-bold text-zinc-400 bg-zinc-500/10 px-2 py-1 rounded-md border border-zinc-500/20 uppercase tracking-widest"><FileText size={10}/> Pending Upload</span>;
  };

  const isReviewer = currentUserRole === "Admin" || currentUserRole === "Founder" || currentUserRole === "Leader";

  return (
    <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-5 mt-4">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-xs font-bold text-white flex items-center gap-2">PROOF OF WORK <StatusBadge /></h4>
      </div>

      {proofStatus === "pending_upload" || proofStatus === "rejected" ? (
        <div className="space-y-4">
          {proofStatus === "rejected" && task.rejectionNotes && (
             <div className="bg-red-500/5 border border-red-500/10 p-4 rounded-xl text-xs">
               <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">Rejection Notes:</p>
               <p className="text-red-200/80 leading-relaxed">{task.rejectionNotes}</p>
             </div>
          )}
          
          <div className="flex gap-2 bg-zinc-950 p-1 rounded-xl border border-white/5 w-fit">
            <button onClick={() => setUploadType("url")} className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${uploadType === 'url' ? 'bg-white/10 text-white' : 'text-zinc-500'}`}>URL / Link</button>
            <button onClick={() => setUploadType("file")} className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${uploadType === 'file' ? 'bg-white/10 text-white' : 'text-zinc-500'}`}>File Drop</button>
          </div>

          {uploadType === "url" ? (
            <div className="relative">
              <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={14} />
              <input type="text" value={url} onChange={e => setUrl(e.target.value)} placeholder="Paste PR link, Figma URL, Google Doc..." className="w-full bg-zinc-950 border border-white/5 rounded-xl py-4 pl-10 pr-4 text-xs text-white focus:border-indigo-500/50 outline-none transition-colors" />
            </div>
          ) : (
            <div className="border border-dashed border-white/10 rounded-xl p-8 text-center hover:border-indigo-500/50 transition-colors cursor-pointer bg-zinc-950/50 group">
              <Upload className="mx-auto text-zinc-500 mb-3 group-hover:text-indigo-400 transition-colors" size={24} />
              <p className="text-xs font-bold text-zinc-300">Click to upload or drag and drop</p>
              <p className="text-[10px] text-zinc-600 mt-1">SVG, PNG, JPG or PDF (max. 5MB)</p>
            </div>
          )}

          <button onClick={handleUpload} disabled={uploadType === "url" && !url} className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white py-3.5 rounded-xl text-[10px] tracking-widest uppercase font-black transition-all">
            Submit Proof
          </button>
        </div>
      ) : proofStatus === "awaiting_review" ? (
        <div className="space-y-4">
          <div className="bg-zinc-950 p-4 rounded-xl border border-white/5 flex justify-between items-center">
             <div className="flex items-center gap-4">
               <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400"><LinkIcon size={16} /></div>
               <div>
                 <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-0.5">Submitted Proof</p>
                 <a href={task.proofUrl} target="_blank" rel="noreferrer" className="text-xs text-indigo-400 font-medium hover:underline truncate max-w-[200px] block">{task.proofUrl || "View Attached File"}</a>
               </div>
             </div>
          </div>

          {isReviewer ? (
            <div className="border-t border-white/5 pt-4 space-y-3">
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Admin Review Actions</p>
              
              {showRejectInput ? (
                <motion.div initial={{opacity: 0, height: 0}} animate={{opacity: 1, height: 'auto'}} className="space-y-3">
                  <textarea value={rejectionNotes} onChange={e => setRejectionNotes(e.target.value)} placeholder="Explain why this proof is rejected..." className="w-full bg-zinc-950 border border-white/10 rounded-xl p-4 text-xs text-white resize-none outline-none focus:border-red-500/50" rows={3}/>
                  <div className="flex gap-3">
                    <button onClick={handleReject} className="flex-1 bg-red-600 hover:bg-red-500 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Confirm Reject</button>
                    <button onClick={() => setShowRejectInput(false)} className="px-6 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Cancel</button>
                  </div>
                </motion.div>
              ) : (
                <div className="flex gap-3">
                  <button onClick={onApprove} className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"><CheckCircle2 size={14}/> Approve & Complete</button>
                  <button onClick={() => setShowRejectInput(true)} className="flex-1 flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"><XCircle size={14}/> Reject Proof</button>
                </div>
              )}
            </div>
          ) : (
             <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl text-center">
               <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Waiting for Founder approval</p>
             </div>
          )}
        </div>
      ) : (
         <div className="bg-emerald-500/5 p-4 rounded-xl border border-emerald-500/10 flex items-center gap-4">
           <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400"><CheckCircle2 size={16} /></div>
           <div>
             <p className="text-xs font-bold text-white mb-0.5">Proof Accepted</p>
             <p className="text-[10px] text-emerald-200/60">This task has been successfully verified and completed.</p>
           </div>
         </div>
      )}
    </div>
  );
};
