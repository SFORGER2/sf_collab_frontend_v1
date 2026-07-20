import React, { useState, useRef } from "react";

// --- DUMMY ICONS ---
const DummyIcon = (props) => <span {...props} aria-hidden />;
const Upload = DummyIcon;
const X = DummyIcon;
const CheckCircle2 = DummyIcon;
const AlertCircle = DummyIcon;
const FileText = DummyIcon;
const Link2 = DummyIcon;
const Play = DummyIcon;
const ImageIcon = DummyIcon;

// --- MOCK DATA & HELPERS ---
const mockUsers = [
  { id: "u1", name: "Alice Chen", email: "alice@sf.dev", role: "founder" },
  { id: "u2", name: "Bob Dev", email: "bob@sf.dev", role: "member" },
  { id: "u3", name: "Carol Smith", email: "carol@sf.dev", role: "member" },
  { id: "u4", name: "David Admin", email: "david@sf.dev", role: "admin" },
  { id: "u5", name: "Eve Designer", email: "eve@sf.dev", role: "member" },
];

const mockProofs = [
  {
    id: "proof-1",
    taskId: "task-1",
    fileName: "landing-page-mockup.fig",
    fileType: "document",
    fileUrl: "https://example.com/landing-page-mockup.fig",
    uploadedBy: "u5",
    uploadedByName: "Eve Designer",
    uploadedAt: new Date("2026-05-15"),
    status: "approved",
    qualityRating: "excellent",
    reviewedBy: "u1",
    reviewedByName: "Alice Chen",
    reviewNotes: "Beautiful design, all requirements met.",
    multiplier: 1.5,
    reviewedAt: new Date("2026-05-15"),
  },
  {
    id: "proof-2",
    taskId: "task-2",
    fileName: "schema-migration.sql",
    fileType: "document",
    fileUrl: "https://example.com/schema-migration.sql",
    uploadedBy: "u2",
    uploadedByName: "Bob Dev",
    uploadedAt: new Date("2026-05-12"),
    status: "pending",
    multiplier: 1.0,
  },
  {
    id: "proof-3",
    taskId: "task-5",
    fileName: "proof-upload-demo.mp4",
    fileType: "video",
    fileUrl: "https://example.com/proof-upload-demo.mp4",
    uploadedBy: "u5",
    uploadedByName: "Eve Designer",
    uploadedAt: new Date("2026-05-12"),
    status: "pending",
    multiplier: 1.0,
  },
  {
    id: "proof-4",
    taskId: "task-7",
    fileName: "dashboard-screenshot.png",
    fileType: "image",
    fileUrl: "https://example.com/dashboard-screenshot.png",
    uploadedBy: "u3",
    uploadedByName: "Carol Smith",
    uploadedAt: new Date("2026-05-14"),
    status: "rejected",
    qualityRating: "accepted",
    reviewedBy: "u4",
    reviewedByName: "David Admin",
    reviewNotes: "Missing the contributor leaderboard section. Please include.",
    multiplier: 1.0,
    reviewedAt: new Date("2026-05-14"),
  },
];

const getUserById = (id) => mockUsers.find((u) => u.id === id);

const getQualityMultiplier = (rating) => {
  switch (rating) {
    case "rejected":
      return 0;
    case "accepted":
      return 1.0;
    case "good":
      return 1.2;
    case "excellent":
      return 1.5;
    case "exceptional":
      return 2.0;
    default:
      return 1.0;
  }
};
// ----------------------------

export default function ProofUploadUI() {
  const formatDate = (d) => {
    if (!d) return "";
    const dt =
      typeof d === "string" ? new Date(d) : d instanceof Date ? d : new Date(d);
    try {
      return dt.toISOString().split("T")[0];
    } catch {
      // Removed the unused 'e' binding here to fix the lint error
      return String(d);
    }
  };

  const [proofs, setProofs] = useState(mockProofs);
  const [selectedProof, setSelectedProof] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const fileInputRef = useRef(null);

  // Upload state
  const [uploadData, setUploadData] = useState({
    fileName: "",
    fileType: "document",
    fileUrl: "",
    taskId: "task-1",
    uploading: false,
  });

  // Approval state
  const [approvalData, setApprovalData] = useState({
    qualityRating: "accepted",
    reviewNotes: "",
  });

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Determine file type
    let fileType = "document";
    const mimeType = file.type;

    if (mimeType.startsWith("image/")) fileType = "image";
    else if (mimeType.startsWith("video/")) fileType = "video";
    else if (
      mimeType.includes("pdf") ||
      mimeType.includes("document") ||
      mimeType.includes("word")
    )
      fileType = "document";

    setUploadData({
      fileName: file.name,
      fileType,
      fileUrl: URL.createObjectURL(file),
      taskId: uploadData.taskId,
      uploading: false,
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];

      let fileType = "document";
      const mimeType = file.type;

      if (mimeType.startsWith("image/")) fileType = "image";
      else if (mimeType.startsWith("video/")) fileType = "video";

      setUploadData({
        fileName: file.name,
        fileType,
        fileUrl: URL.createObjectURL(file),
        taskId: uploadData.taskId,
        uploading: false,
      });
    }
  };

  const handleUploadProof = () => {
    if (!uploadData.fileName || !uploadData.fileUrl || !uploadData.taskId) {
      alert("Please select a file and task");
      return;
    }

    const newProof = {
      id: `proof-${Date.now()}`,
      taskId: uploadData.taskId,
      fileName: uploadData.fileName,
      fileType: uploadData.fileType,
      fileUrl: uploadData.fileUrl,
      uploadedBy: "u2",
      uploadedByName: getUserById("u2")?.name || "Unknown",
      uploadedAt: new Date(),
      status: "pending",
      multiplier: 1.0,
    };

    setProofs([...proofs, newProof]);
    resetUpload();
    alert("Proof uploaded successfully! Waiting for reviewer approval.");
  };

  const handleApproveProof = (proofId) => {
    const multiplier = getQualityMultiplier(approvalData.qualityRating);

    setProofs(
      proofs.map((p) =>
        p.id === proofId
          ? {
              ...p,
              status: "approved",
              qualityRating: approvalData.qualityRating,
              reviewedBy: "u4",
              reviewedByName: getUserById("u4")?.name || "Unknown",
              reviewNotes: approvalData.reviewNotes,
              multiplier: multiplier,
              reviewedAt: new Date(),
            }
          : p,
      ),
    );
    closeDetail();
  };

  const handleRejectProof = (proofId) => {
    setProofs(
      proofs.map((p) =>
        p.id === proofId
          ? {
              ...p,
              status: "rejected",
              qualityRating: "rejected",
              reviewedBy: "u4",
              reviewedByName: getUserById("u4")?.name || "Unknown",
              reviewNotes: approvalData.reviewNotes,
              multiplier: 0,
              reviewedAt: new Date(),
            }
          : p,
      ),
    );
    closeDetail();
  };

  const resetUpload = () => {
    setUploadData({
      fileName: "",
      fileType: "document",
      fileUrl: "",
      taskId: "task-1",
      uploading: false,
    });
    setApprovalData({
      qualityRating: "accepted",
      reviewNotes: "",
    });
  };

  const closeDetail = () => {
    setSelectedProof(null);
    resetUpload();
  };

  const filteredProofs = proofs.filter((proof) => {
    if (filterStatus !== "all" && proof.status !== filterStatus) return false;
    return true;
  });

  const getStatusBadge = (status) => {
    const colors = {
      pending: "bg-amber-500/10 border-amber-500/20 text-amber-400",
      approved: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
      rejected: "bg-red-500/10 border-red-500/20 text-red-400",
      none: "bg-slate-500/10 border-slate-500/20 text-slate-400",
    };
    return colors[status];
  };

  const getFileIcon = (fileType) => {
    switch (fileType) {
      case "image":
        return <ImageIcon size={16} />;
      case "video":
        return <Play size={16} />;
      case "document":
        return <FileText size={16} />;
      case "link":
        return <Link2 size={16} />;
      default:
        return <FileText size={16} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0B101E] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-lg font-semibold text-white tracking-wide">
            Proof Upload & Verification
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Upload task proofs and manage reviewer approval workflow
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Upload Section */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <div className="bg-[#151B2B] border border-white/10 rounded-xl p-6">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-4">
                  Upload Proof
                </p>

                {/* Task Selector */}
                <div className="mb-4">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    Task
                  </label>
                  <select
                    value={uploadData.taskId}
                    onChange={(e) =>
                      setUploadData({ ...uploadData, taskId: e.target.value })
                    }
                    className="w-full bg-[#0F1423] border border-white/10 rounded-lg px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-colors mt-2"
                  >
                    <option value="task-1">Design Landing Page (Task 1)</option>
                    <option value="task-2">
                      Setup Database Schema (Task 2)
                    </option>
                    <option value="task-4">
                      Implement Task Approval (Task 4)
                    </option>
                    <option value="task-5">Build Proof Upload (Task 5)</option>
                    <option value="task-6">Write Unit Tests (Task 6)</option>
                  </select>
                </div>

                {/* Drag Drop Zone */}
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-[#0F1423]/50 border-2 border-dashed border-white/10 hover:border-blue-500/50 rounded-lg p-8 text-center cursor-pointer transition-colors mb-4"
                >
                  <Upload size={24} className="mx-auto text-slate-400 mb-2" />
                  <p className="text-sm text-slate-400">
                    Drag files here or click to browse
                  </p>
                  <p className="text-[10px] text-slate-500 mt-2">
                    Images, videos, PDFs, documents
                  </p>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  accept="image/*,video/*,.pdf,.doc,.docx"
                  className="hidden"
                />

                {/* Selected File Display */}
                {uploadData.fileName && (
                  <div className="bg-[#0F1423]/50 border border-white/5 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      {getFileIcon(uploadData.fileType)}
                      <p className="text-sm text-white truncate">
                        {uploadData.fileName}
                      </p>
                    </div>
                    <p className="text-[10px] text-slate-500">
                      Type: {uploadData.fileType}
                    </p>
                  </div>
                )}

                {/* Upload Controls */}
                <div className="flex gap-2">
                  {uploadData.fileName ? (
                    <>
                      <button
                        onClick={() =>
                          setUploadData({
                            ...uploadData,
                            fileName: "",
                            fileUrl: "",
                          })
                        }
                        className="flex-1 h-11 bg-transparent border border-white/10 hover:bg-white/5 text-slate-300 text-sm font-semibold rounded-lg transition-colors"
                      >
                        Clear
                      </button>
                      <button
                        onClick={handleUploadProof}
                        className="flex-1 h-11 bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white text-sm font-semibold rounded-lg shadow-lg shadow-blue-500/20 border border-blue-400/20 transition-all"
                      >
                        Upload
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-11 bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white text-sm font-semibold rounded-lg shadow-lg shadow-blue-500/20 border border-blue-400/20 transition-all"
                    >
                      Browse Files
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Proof List */}
          <div className="lg:col-span-2">
            {/* Filters */}
            <div className="flex items-center gap-3 mb-6">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                Filter
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-[#0F1423] border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
              >
                <option value="all">All Proofs</option>
                <option value="pending">Pending Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
              <div className="ml-auto text-[10px] font-bold uppercase tracking-widest text-slate-500">
                {filteredProofs.length} Proof
                {filteredProofs.length !== 1 ? "s" : ""}
              </div>
            </div>

            {/* Proof Cards */}
            <div className="space-y-4">
              {filteredProofs.length === 0 ? (
                <div className="bg-[#0F1423]/50 border border-white/5 rounded-lg p-12 text-center">
                  <p className="text-slate-400">No proofs to display</p>
                </div>
              ) : (
                filteredProofs.map((proof) => (
                  <div
                    key={proof.id}
                    onClick={() => {
                      setSelectedProof(proof);
                      setApprovalData({
                        qualityRating: "accepted",
                        reviewNotes: "",
                      });
                    }}
                    className="bg-[#151B2B] border border-white/5 rounded-xl p-5 shadow-sm transition-all hover:border-white/10 hover:shadow-md cursor-pointer"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="text-slate-400">
                            {getFileIcon(proof.fileType)}
                          </div>
                          <h3 className="text-sm font-medium text-white">
                            {proof.fileName}
                          </h3>
                          <span
                            className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${getStatusBadge(proof.status)}`}
                          >
                            {proof.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-[10px]">
                          <div>
                            <span className="font-bold uppercase tracking-widest text-slate-500">
                              Uploaded By
                            </span>
                            <p className="text-slate-300 mt-1">
                              {proof.uploadedByName}
                            </p>
                          </div>
                          <div>
                            <span className="font-bold uppercase tracking-widest text-slate-500">
                              Uploaded
                            </span>
                            <p className="text-slate-300 mt-1">
                              {formatDate(proof.uploadedAt)}
                            </p>
                          </div>

                          {proof.reviewedByName && (
                            <>
                              <div>
                                <span className="font-bold uppercase tracking-widest text-slate-500">
                                  Reviewed By
                                </span>
                                <p className="text-slate-300 mt-1">
                                  {proof.reviewedByName}
                                </p>
                              </div>
                              <div>
                                <span className="font-bold uppercase tracking-widest text-slate-500">
                                  Quality Rating
                                </span>
                                <p className="text-slate-300 mt-1 capitalize">
                                  {proof.qualityRating}
                                </p>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                          Multiplier
                        </p>
                        <p className="text-2xl font-bold text-white tracking-tight">
                          {proof.multiplier.toFixed(2)}x
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Proof Detail Modal */}
      {selectedProof && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#151B2B] border border-white/10 rounded-xl max-w-3xl w-full max-h-screen overflow-y-auto">
            {/* Preview Section */}
            <div className="bg-[#0F1423] border-b border-white/5 p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    Preview
                  </p>
                  <h3 className="text-lg font-semibold text-white tracking-wide mt-2">
                    {selectedProof.fileName}
                  </h3>
                </div>
                <button
                  onClick={closeDetail}
                  className="text-slate-400 hover:text-white"
                >
                  <X size={24} />
                </button>
              </div>

              {/* File Preview */}
              <div className="bg-[#151B2B] rounded-lg p-8 min-h-64 flex items-center justify-center">
                {selectedProof.fileType === "image" && (
                  <img
                    src={selectedProof.fileUrl}
                    alt={selectedProof.fileName}
                    className="max-w-full max-h-64 rounded-lg"
                  />
                )}

                {selectedProof.fileType === "video" && (
                  <video
                    controls
                    className="max-w-full max-h-64 rounded-lg bg-black"
                  >
                    <source src={selectedProof.fileUrl} />
                    Your browser does not support video playback
                  </video>
                )}

                {selectedProof.fileType === "document" && (
                  <div className="text-center">
                    <FileText
                      size={48}
                      className="mx-auto text-slate-400 mb-4"
                    />
                    <p className="text-slate-400">{selectedProof.fileName}</p>
                    <a
                      href={selectedProof.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-400 mt-4 inline-block text-sm"
                    >
                      Download Document
                    </a>
                  </div>
                )}

                {selectedProof.fileType === "link" && (
                  <div className="text-center">
                    <Link2 size={48} className="mx-auto text-slate-400 mb-4" />
                    <a
                      href={selectedProof.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-400 break-all"
                    >
                      {selectedProof.fileUrl}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Details Section */}
            <div className="p-6">
              <div className="grid grid-cols-2 gap-6 mb-6 pb-6 border-b border-white/5">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    Status
                  </p>
                  <p className="text-white mt-2 capitalize">
                    {selectedProof.status}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    File Type
                  </p>
                  <p className="text-white mt-2 capitalize">
                    {selectedProof.fileType}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    Uploaded By
                  </p>
                  <p className="text-white mt-2">
                    {selectedProof.uploadedByName}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    Uploaded At
                  </p>
                  <p className="text-white mt-2">
                    {formatDate(selectedProof.uploadedAt)}
                  </p>
                </div>
              </div>

              {/* Multiplier Display */}
              <div className="bg-[#0F1423]/50 border border-white/5 rounded-lg p-4 mb-6">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  Quality Multiplier
                </p>
                <p className="text-4xl font-bold text-white tracking-tight mt-3">
                  {selectedProof.multiplier.toFixed(2)}x
                </p>
                <p className="text-sm text-slate-400 mt-2">
                  Applied to base points for final contribution score
                </p>
              </div>

              {/* Review Notes if Reviewed */}
              {selectedProof.reviewNotes && (
                <div className="bg-[#0F1423]/50 border border-white/5 rounded-lg p-4 mb-6">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    Reviewer Notes
                  </p>
                  <p className="text-slate-300 mt-2">
                    {selectedProof.reviewNotes}
                  </p>
                </div>
              )}

              {/* Approval Section - Only for Pending */}
              {selectedProof.status === "pending" && (
                <>
                  <div className="mb-6 pb-6 border-b border-white/5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-4">
                      Quality Rating
                    </p>
                    <div className="space-y-2">
                      {[
                        {
                          value: "rejected",
                          label: "Rejected (0x)",
                          desc: "Does not meet requirements",
                        },
                        {
                          value: "accepted",
                          label: "Accepted (1.0x)",
                          desc: "Meets basic requirements",
                        },
                        {
                          value: "good",
                          label: "Good (1.2x)",
                          desc: "Above average quality",
                        },
                        {
                          value: "excellent",
                          label: "Excellent (1.5x)",
                          desc: "High quality work",
                        },
                        {
                          value: "exceptional",
                          label: "Exceptional (2.0x)",
                          desc: "Exceeds expectations",
                        },
                      ].map((option) => (
                        <label
                          key={option.value}
                          className="flex items-start gap-3 cursor-pointer p-3 rounded-lg hover:bg-white/5 transition-colors"
                        >
                          <input
                            type="radio"
                            name="quality"
                            value={option.value}
                            checked={
                              approvalData.qualityRating === option.value
                            }
                            onChange={(e) =>
                              setApprovalData({
                                ...approvalData,
                                qualityRating: e.target.value,
                              })
                            }
                            className="w-4 h-4 mt-1 rounded-full border-white/10 accent-blue-500"
                          />
                          <div>
                            <p className="text-sm text-white">{option.label}</p>
                            <p className="text-[10px] text-slate-400">
                              {option.desc}
                            </p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      Review Notes
                    </label>
                    <textarea
                      value={approvalData.reviewNotes}
                      onChange={(e) =>
                        setApprovalData({
                          ...approvalData,
                          reviewNotes: e.target.value,
                        })
                      }
                      placeholder="Add any reviewer comments or feedback..."
                      className="w-full bg-[#0F1423] border border-white/10 rounded-lg px-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors mt-2 h-24"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApproveProof(selectedProof.id)}
                      className="flex-1 h-11 bg-gradient-to-b from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white text-sm font-semibold rounded-lg shadow-lg shadow-emerald-500/20 border border-emerald-400/20 transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 size={18} />
                      Approve
                    </button>
                    <button
                      onClick={() => handleRejectProof(selectedProof.id)}
                      className="flex-1 h-11 bg-transparent border border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <AlertCircle size={18} />
                      Reject
                    </button>
                  </div>
                </>
              )}

              <div className="flex gap-3 justify-end pt-4 mt-6 border-t border-white/5">
                <button
                  onClick={closeDetail}
                  className="h-11 bg-transparent border border-white/10 hover:bg-white/5 text-slate-300 text-sm font-semibold rounded-lg transition-colors px-6"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
