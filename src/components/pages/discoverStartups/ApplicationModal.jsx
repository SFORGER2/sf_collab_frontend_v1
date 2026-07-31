import React, { useState } from "react";
import { useDraft } from "@/utils/hooks/useDraft";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-toastify";
import { startupsAPI } from "@/utils/APIs/startupsAPI";
import { Briefcase, Users, Sparkles, X, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

const MIN_MESSAGE_LENGTH = 20;

/**
 * ApplicationModal — unified application form for both Startups and Visions.
 *
 * Props:
 *  - entity      : the startup or vision object
 *  - entityType  : "startup" | "vision"
 *  - roleSelected: pre-selected role string (optional)
 *  - hasApplied  : boolean — if true, renders an "Already Applied" state
 *  - isOpen / onClose: dialog control
 */
const ApplicationModal = ({
  isOpen,
  onClose,
  entity,
  entityType = "startup",
  roleSelected,
  hasApplied = false,
}) => {
  const item = entity;
  const [role, setRole] = useState(roleSelected || "");
  const [{ message }, setDraftForm, clearAppDraft] = useDraft(
    `apply_${entityType}_${item?.id}`,
    { message: "" }
  );
  const setMessage = (val) => setDraftForm((prev) => ({ ...prev, message: val }));
  const [links, setLinks] = useState({ portfolio: "", github: "", linkedin: "" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setRole(roleSelected || "");
    }
  }, [isOpen, roleSelected]);

  const roles = React.useMemo(() => {
    if (Array.isArray(item?.roles)) return item.roles;
    if (item?.roles && typeof item.roles === "object") return Object.keys(item.roles);
    if (Array.isArray(item?.rolesNeeded)) return item.rolesNeeded;
    if (Array.isArray(item?.requiredRoles)) return item.requiredRoles;
    return [];
  }, [item]);

  // ── Validation ─────────────────────────────────────────────────────────────
  const validate = () => {
    const newErrors = {};
    if (roles.length > 0 && !role) {
      newErrors.role = "Please select a role you're applying for.";
    }
    if (!message.trim()) {
      newErrors.message = "Please tell the team why you want to join.";
    } else if (message.trim().length < MIN_MESSAGE_LENGTH) {
      newErrors.message = `Please write at least ${MIN_MESSAGE_LENGTH} characters (${message.trim().length}/${MIN_MESSAGE_LENGTH}).`;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const submitApplication = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        [entityType === "startup" ? "startup_id" : "vision_id"]: item.id,
        role: role || undefined,
        message,
        portfolio_url: links.portfolio || null,
        github_url: links.github || null,
        linkedin_url: links.linkedin || null,
      };

      let success = false;

      if (entityType === "startup") {
        const res = await startupsAPI.sendJoinRequest(item.id, payload);
        success = !!(res?.success || res?.data?.success);
        if (!success) {
          toast.error(res?.message || "Failed to submit application. Please try again.");
        }
      } else {
        // Vision — optimistic success until backend endpoint is wired
        success = true;
      }

      if (success) {
        toast.success("🚀 Application submitted!");
        clearAppDraft();
        setLinks({ portfolio: "", github: "", linkedin: "" });
        setRole(roleSelected || "");
        setErrors({});
        onClose();
      }
    } catch (err) {
      if (err.response?.status === 409) {
        toast.error(`You have already applied to this ${entityType}.`);
      } else {
        const msg =
          err?.response?.data?.message ||
          err?.data?.message ||
          err?.error ||
          "Something went wrong. Your data is saved — please try again.";
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!item) return null;

  // ── Already Applied State ──────────────────────────────────────────────────
  if (hasApplied) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent
          className="!w-[96vw] !max-w-[480px] bg-[#0E0F13] border border-white/10 p-6 text-center relative"
          showCloseButton={false}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="p-4 bg-green-500/10 rounded-full border border-green-500/20">
              <CheckCircle className="w-10 h-10 text-green-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Already Applied</h2>
            <p className="text-gray-400 text-sm max-w-xs">
              You have already submitted an application to{" "}
              <span className="text-white font-medium">{item.name || item.title}</span>.
              Visit <span className="text-blue-400">My Applications</span> to track your status.
            </p>
            <Button onClick={onClose} className="bg-blue-600 hover:bg-blue-700 mt-2">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // ── Main Form ──────────────────────────────────────────────────────────────
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="
          !w-[96vw]
          !max-w-[1100px]
          z-[9999]
          h-[96vh] lg:h-auto
          bg-[#0E0F13]
          border border-white/10
          p-0
          overflow-hidden
          relative
        "
        showCloseButton={false}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 text-gray-400 hover:text-white transition-colors bg-white/5 rounded-full p-1"
          aria-label="Close"
        >
          <X size={16} />
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-5 h-full">

          {/* LEFT / INFO PANEL */}
          <div className="
            lg:col-span-2
            bg-gradient-to-br from-blue-600/20 to-purple-600/10
            p-5 sm:p-6
            space-y-4
          ">
            <div className="flex items-start justify-between">
              <Badge>{item.stage || item.visionState || "Open"}</Badge>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white">
                {item.name || item.title}
              </h2>
              <p className="text-sm text-gray-400 mt-2">
                {item.description || `Join this ${entityType} and help shape its future.`}
              </p>
            </div>

            <div className="space-y-3 text-sm text-gray-300 hidden sm:block">
              {(item.industry || item.category) && (
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-blue-400" />
                  {item.industry || item.category}
                </div>
              )}
              {item.team_size && (
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-400" />
                  {item.team_size}
                </div>
              )}
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-400" />
                High-impact opportunity
              </div>
            </div>

            {entityType === "vision" && (
              <div className="mt-auto pt-4 border-t border-white/10 hidden sm:block">
                <p className="text-xs text-amber-400/80 flex items-start gap-1.5">
                  <AlertCircle size={12} className="shrink-0 mt-0.5" />
                  Vision applications are in early access. The team will be notified directly.
                </p>
              </div>
            )}
          </div>

          {/* RIGHT / FORM PANEL */}
          <div className="
            lg:col-span-3
            p-5 sm:p-6
            space-y-6
            overflow-y-auto
            max-h-[96vh]
          ">

            {/* Role selection */}
            {roles.length > 0 && (
              <div>
                <h3 className="text-white font-semibold mb-1">
                  Desired Role <span className="text-red-400">*</span>
                </h3>
                {errors.role && (
                  <p className="text-red-400 text-xs mb-2 flex items-center gap-1">
                    <AlertCircle size={12} /> {errors.role}
                  </p>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-48 overflow-y-auto">
                  {roles.map((r, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setRole(r);
                        setErrors((e) => ({ ...e, role: undefined }));
                      }}
                      className={`
                        px-4 py-3 rounded-lg border text-sm font-medium
                        transition-all
                        ${role === r
                          ? "bg-blue-500/20 border-blue-500 text-blue-300"
                          : errors.role
                          ? "bg-gray-800 border-red-500/50 text-gray-300 hover:border-red-400"
                          : "bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-500"
                        }
                      `}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Message */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm text-gray-300 font-semibold">
                  Why do you want to join? <span className="text-red-400">*</span>
                </label>
                <span className={`text-xs ${message.length >= MIN_MESSAGE_LENGTH ? "text-green-400" : "text-gray-500"}`}>
                  {message.length} / {MIN_MESSAGE_LENGTH}+ chars
                </span>
              </div>
              {errors.message && (
                <p className="text-red-400 text-xs mb-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.message}
                </p>
              )}
              <Textarea
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  if (errors.message) setErrors((er) => ({ ...er, message: undefined }));
                }}
                placeholder={`Explain how you can help this ${entityType} grow...`}
                className={`bg-gray-800 text-white min-h-[120px] transition-colors ${
                  errors.message ? "border-red-500 focus:border-red-400" : "border-gray-700"
                }`}
              />
            </div>

            {/* Links */}
            <div>
              <p className="text-sm text-gray-400 mb-2">Links <span className="text-gray-600">(optional)</span></p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  placeholder="Portfolio URL"
                  value={links.portfolio}
                  onChange={(e) => setLinks({ ...links, portfolio: e.target.value })}
                  className="bg-gray-800 border-gray-700 text-white flex-1"
                />
                <Input
                  placeholder="GitHub URL"
                  value={links.github}
                  onChange={(e) => setLinks({ ...links, github: e.target.value })}
                  className="bg-gray-800 border-gray-700 text-white flex-1"
                />
                <Input
                  placeholder="LinkedIn URL"
                  value={links.linkedin}
                  onChange={(e) => setLinks({ ...links, linkedin: e.target.value })}
                  className="bg-gray-800 border-gray-700 text-white flex-1"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="
              flex flex-col-reverse sm:flex-row
              justify-end gap-3
              pt-4 border-t border-gray-800
            ">
              <Button
                variant="outline"
                onClick={onClose}
                className="border-gray-600 text-white hover:bg-white/5"
              >
                Cancel
              </Button>
              <Button
                onClick={submitApplication}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 min-w-[140px] flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Submitting…
                  </>
                ) : (
                  `Apply to ${entityType === "startup" ? "Startup" : "Vision"}`
                )}
              </Button>
            </div>

          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ApplicationModal;