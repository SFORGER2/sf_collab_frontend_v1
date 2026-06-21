import React, { useState, useEffect, useRef, useMemo } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  X,
  Clock,
  CheckCircle2,
  ShieldCheck,
  Zap,
  AlertCircle,
  AlignLeft,
  Trash2,
} from "lucide-react";
import gsap from "gsap";
import { cn } from "../../../lib/utils";
import { Button } from "../../../ui/button";
import ProofUploader from "../proof/ProofUploader";
import ProofReviewer from "../proof/ProofReviewer";

const useTaskAuthorization = (task, initialQuality) => {
  const [quality, setQuality] = useState(initialQuality || "Accepted");

  const multipliers = useMemo(
    () => ({
      quality: { Rejected: 0, Accepted: 1, Good: 1.2, Excellent: 1.5 }[quality],
      proof: task?.hasProof ? 1.25 : 1,
      deadline: task?.deadline === "Yesterday" ? 0.7 : 1,
    }),
    [quality, task?.hasProof, task?.deadline],
  );

  const projectedPoints = Math.round(
    (task?.basePoints || 0) *
      multipliers.quality *
      multipliers.proof *
      multipliers.deadline,
  );

  return { quality, setQuality, projectedPoints, multipliers };
};

const TaskDetailModal = ({
  isOpen,
  onClose,
  task,
  role = "Admin",
  onUpdate,
  onDelete,
}) => {
  const { quality, setQuality, projectedPoints } = useTaskAuthorization(
    task,
    task?.qualityRating,
  );
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setForm] = useState(task || {});

  const pointsRef = useRef(null);
  const displayPointsRef = useRef(0);

  useEffect(() => {
    if (task) setForm(task);
  }, [task]);

  // GSAP Animation for points
  useEffect(() => {
    if (pointsRef.current) {
      gsap.to(displayPointsRef, {
        current: projectedPoints,
        duration: 0.8,
        ease: "power2.out",
        onUpdate: () => {
          if (pointsRef.current) {
            pointsRef.current.innerText = Math.round(displayPointsRef.current);
          }
        },
      });
    }
  }, [projectedPoints]);

  if (!task) return null;

  const isAdmin = role === "Admin";
  const isDone = task.status === "Done";
  const isApproved = task.status === "Approved";
  const isRejected = task.status === "Rejected";

  const handleSaveEdits = () => {
    onUpdate(task.id, editForm);
    setIsEditing(false);
  };

  const updateField = (key, val) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const handleApprove = () => {
    onUpdate(task.id, {
      status: "Approved",
      qualityRating: quality,
      points: projectedPoints,
    });
    onClose();
  };

  const handleReject = () => {
    onUpdate(task.id, { status: "Rejected" });
    onClose();
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-in fade-in duration-300" />

        <Dialog.Content className="fixed top-1/2 left-1/2 w-full max-w-xl max-h-[90vh] overflow-y-auto custom-scrollbar -translate-x-1/2 -translate-y-1/2 bg-[#151B2B] border border-white/10 rounded-2xl p-0 z-50 shadow-2xl focus:outline-none animate-in zoom-in-95 duration-200">
          <header className="flex items-center justify-between px-6 py-5 border-b border-white/5 bg-[#0B101E]/50">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                <ShieldCheck className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-white tracking-wide">
                  Task Details
                </h2>
                <div className="text-xs font-medium text-slate-500 uppercase tracking-widest">
                  {task.id}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isAdmin && (
                <button
                  onClick={() => {
                    if (confirm("Are you sure you want to delete this task?"))
                      onDelete(task.id);
                  }}
                  className="h-8 w-8 rounded-lg bg-transparent hover:bg-red-500/10 flex items-center justify-center text-slate-400 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              {!isApproved && !isRejected && (
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="h-8 px-3 rounded-lg bg-transparent hover:bg-white/5 text-xs font-medium text-slate-300 transition-colors border border-transparent hover:border-white/5"
                >
                  {isEditing ? "Cancel" : "Edit"}
                </button>
              )}
              <Dialog.Close className="h-8 w-8 rounded-lg bg-transparent hover:bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </Dialog.Close>
            </div>
          </header>

          <div className="p-6 space-y-8">
            <div className="space-y-6">
              {isEditing ? (
                <input
                  value={editForm.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  className="w-full bg-[#0F1423] border border-white/10 rounded-lg px-4 py-3 text-lg font-semibold text-white focus:outline-none focus:border-blue-500"
                  placeholder="Task Title"
                />
              ) : (
                <h3 className="text-xl font-bold text-slate-100 tracking-tight">
                  {task.title}
                </h3>
              )}

              <div className="flex flex-wrap gap-8 pt-4 border-t border-white/5">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    Assignee
                  </span>
                  {isEditing ? (
                    <input
                      value={editForm.assignee}
                      onChange={(e) => updateField("assignee", e.target.value)}
                      className="bg-[#0F1423] border border-white/10 rounded px-2 py-1 text-sm text-blue-400 focus:outline-none focus:border-blue-500 w-32"
                    />
                  ) : (
                    <div className="text-sm font-medium text-blue-400">
                      {task.assignee || "Unassigned"}
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    Created By
                  </span>
                  <div className="text-sm font-medium text-slate-300">
                    {task.createdBy || "System"}
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    Deadline
                  </span>
                  {isEditing ? (
                    <input
                      value={editForm.deadline}
                      onChange={(e) => updateField("deadline", e.target.value)}
                      className="bg-[#0F1423] border border-white/10 rounded px-2 py-1 text-sm text-slate-300 focus:outline-none focus:border-blue-500 w-32"
                    />
                  ) : (
                    <div className="text-sm font-medium text-slate-300">
                      {task.deadline}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                <AlignLeft className="w-4 h-4" /> Description
              </div>
              {isEditing ? (
                <textarea
                  value={editForm.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  className="w-full bg-[#0F1423] border border-white/10 rounded-lg px-4 py-3 text-sm text-slate-300 min-h-[100px] focus:outline-none focus:border-blue-500"
                  placeholder="Task description..."
                />
              ) : (
                <p className="text-sm text-slate-400 leading-relaxed max-w-xl">
                  {task.description}
                </p>
              )}
            </div>

            {isEditing && (
              <div className="space-y-5 bg-[#0B101E]/50 p-5 rounded-xl border border-white/5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      Complexity
                    </label>
                    <select
                      value={editForm.complexity}
                      onChange={(e) =>
                        updateField("complexity", e.target.value)
                      }
                      className="w-full bg-[#0F1423] border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                    >
                      {["Small", "Medium", "Large", "Critical"].map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      Priority
                    </label>
                    <select
                      value={editForm.priority}
                      onChange={(e) => updateField("priority", e.target.value)}
                      className="w-full bg-[#0F1423] border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                    >
                      {["Low", "Medium", "High"].map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="space-y-0.5">
                    <span className="text-sm font-medium text-slate-200">
                      Require Proof
                    </span>
                    <p className="text-xs text-slate-500">
                      Mandatory attachment for verification
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      updateField("requiresProof", !editForm.requiresProof)
                    }
                    className={cn(
                      "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none",
                      editForm.requiresProof ? "bg-blue-500" : "bg-slate-700",
                    )}
                  >
                    <span
                      className={cn(
                        "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                        editForm.requiresProof
                          ? "translate-x-6"
                          : "translate-x-1",
                      )}
                    />
                  </button>
                </div>
              </div>
            )}

            {isEditing ? (
              <Button
                onClick={handleSaveEdits}
                className="w-full h-11 bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white font-medium rounded-lg shadow-lg shadow-blue-500/20 transition-all border border-blue-400/20 mt-4"
              >
                Save Changes
              </Button>
            ) : (
              <>
                <div className="space-y-4 bg-[#0F1423] border border-white/5 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
                      <Zap className="w-4 h-4 text-amber-500" /> Verification
                      Vault
                    </div>
                    {isApproved && (
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                        Verified
                      </span>
                    )}
                  </div>

                  {isAdmin ? (
                    isDone || isApproved || isRejected ? (
                      <ProofReviewer
                        proofFiles={task.proofFiles || []}
                        onApprove={() => onUpdate(task.id, { hasProof: true })}
                        onReject={() => onUpdate(task.id, { hasProof: false })}
                      />
                    ) : (
                      <div className="flex items-center gap-3 text-slate-400 bg-white/5 rounded-lg p-3 border border-white/5">
                        <AlertCircle className="w-4 h-4 text-amber-500/70" />{" "}
                        <span className="text-sm">
                          Awaiting submission from assignee.
                        </span>
                      </div>
                    )
                  ) : (
                    <ProofUploader
                      onUpload={() => onUpdate(task.id, { hasProof: true })}
                    />
                  )}
                </div>

                <div
                  className={cn(
                    "flex items-center justify-between p-5 rounded-xl border transition-all mt-4",
                    isApproved
                      ? "bg-emerald-500/5 border-emerald-500/10"
                      : isRejected
                        ? "bg-red-500/5 border-red-500/10 opacity-70"
                        : "bg-blue-500/5 border-blue-500/10",
                  )}
                >
                  <div className="space-y-1">
                    <span
                      className={cn(
                        "text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5",
                        isApproved
                          ? "text-emerald-500"
                          : isRejected
                            ? "text-red-500"
                            : "text-blue-400",
                      )}
                    >
                      {isApproved
                        ? "Points Awarded"
                        : isRejected
                          ? "Points Voided"
                          : "Projected Points"}
                    </span>
                    <div className="flex items-baseline gap-1.5">
                      <span
                        ref={pointsRef}
                        className="text-3xl font-bold text-white tracking-tight"
                      >
                        {projectedPoints}
                      </span>
                      <span className="text-sm font-medium text-slate-400">
                        PTS
                      </span>
                    </div>
                  </div>

                  {!isApproved && !isRejected && (
                    <div className="flex flex-col items-end gap-1.5 opacity-60 animate-in fade-in duration-300">
                      <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
                        <ShieldCheck className="w-5 h-5 text-slate-400" />
                      </div>
                    </div>
                  )}
                  {isApproved && (
                    <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 animate-in zoom-in spin-in-12 duration-500">
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>

                {isAdmin && isDone && !isApproved && !isRejected && (
                  <div className="space-y-5 pt-6 border-t border-white/5">
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        Assess Quality Multiplier
                      </label>
                      <div className="grid grid-cols-2 gap-3 sm:flex sm:gap-2">
                        {["Rejected", "Accepted", "Good", "Excellent"].map(
                          (lvl) => (
                            <button
                              key={lvl}
                              onClick={() => setQuality(lvl)}
                              className={cn(
                                "flex-1 py-2.5 rounded-lg text-xs font-semibold transition-all border",
                                quality === lvl
                                  ? "bg-blue-500/10 border-blue-500 text-blue-400"
                                  : "bg-transparent border-white/10 text-slate-400 hover:border-white/20 hover:text-slate-200",
                              )}
                            >
                              {lvl}
                            </button>
                          ),
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                      {task.complexity === "Critical" && !task.hasProof && (
                        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs font-medium text-red-400">
                          <AlertCircle className="w-4 h-4 shrink-0" /> Critical
                          tasks require proof upload.
                        </div>
                      )}

                      <div className="flex-1 flex gap-3">
                        <Button
                          onClick={handleApprove}
                          disabled={
                            task.complexity === "Critical" && !task.hasProof
                          }
                          className="flex-1 h-11 bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white font-medium rounded-lg shadow-lg shadow-blue-500/20 transition-all border border-blue-400/20 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
                        >
                          Authorize Payout
                        </Button>
                        <Button
                          onClick={handleReject}
                          variant="outline"
                          className="flex-1 h-11 bg-transparent border border-white/10 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 text-slate-300 font-medium rounded-lg transition-colors"
                        >
                          Reject Task
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default TaskDetailModal;
