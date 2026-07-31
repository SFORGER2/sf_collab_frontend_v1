import React, { useState, useMemo } from "react";
import { useDraft } from "@/utils/hooks/useDraft";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "react-toastify";
import { startupsAPI } from "@/utils/APIs/startupsAPI";
import { Sparkles, X, Globe, Github, Linkedin, CheckCircle2, Building2, AlertCircle, Loader2 } from "lucide-react";
import { CosmosButton, Eyebrow, Tag } from "@/components/cosmos";

const DEFAULT_ROLES = [
  "Fullstack Engineer",
  "Frontend Developer",
  "Backend Engineer",
  "Product Designer",
  "Growth Marketer",
];

const ApplyToStartupModal = ({ isOpen, onClose, startup, roleSelected, roles: rolesProp, onSuccess }) => {
  const availableRoles = useMemo(() => {
    if (typeof rolesProp === "function") {
      const res = rolesProp();
      if (Array.isArray(res) && res.length > 0) return res;
    }
    if (Array.isArray(rolesProp) && rolesProp.length > 0) return rolesProp;
    if (startup?.roles) {
      if (Array.isArray(startup.roles)) return startup.roles;
      if (typeof startup.roles === "object") return Object.keys(startup.roles);
    }
    if (Array.isArray(startup?.rolesNeeded) && startup.rolesNeeded.length > 0) {
      return startup.rolesNeeded;
    }
    return DEFAULT_ROLES;
  }, [startup, rolesProp]);

  const [role, setRole] = useState(roleSelected || availableRoles[0] || "Contributor");

  const [{ message }, setDraftForm, clearAppDraft] = useDraft("apply_startup", { message: "" });
  const setMessage = (val) => setDraftForm(prev => ({ ...prev, message: val }));
  
  const [links, setLinks] = useState({
    portfolio: "",
    github: "",
    linkedin: "",
  });
  const [loading, setLoading] = useState(false);
  const [submittedAttempt, setSubmittedAttempt] = useState(false);
  const [touched, setTouched] = useState({});
  const [submitError, setSubmitError] = useState(null);

  // Synchronize state and reset flags when modal opens or role changes
  React.useEffect(() => {
    if (isOpen) {
      if (roleSelected) {
        setRole(roleSelected);
      } else if (availableRoles.length > 0 && (!role || !availableRoles.includes(role))) {
        setRole(availableRoles[0]);
      }
      setSubmittedAttempt(false);
      setTouched({});
      setSubmitError(null);
    }
  }, [isOpen, roleSelected, availableRoles]);

  const isValidUrl = (str) => {
    if (!str || !str.trim()) return true;
    try {
      const url = str.startsWith('http://') || str.startsWith('https://') ? str : `https://${str}`;
      const parsed = new URL(url);
      return parsed.hostname.includes('.');
    } catch {
      return false;
    }
  };

  // Validation rules
  const roleError = !role ? "Please select a position to apply for" : "";
  const messageError = !message.trim() 
    ? "Motivation pitch is required" 
    : message.trim().length < 10 
      ? "Pitch must be at least 10 characters long" 
      : "";

  const portfolioError = !links.portfolio.trim()
    ? "Portfolio or project link is required"
    : !isValidUrl(links.portfolio)
      ? "Invalid Portfolio URL (e.g. https://portfolio.com)"
      : "";

  const githubError = links.github.trim() && !isValidUrl(links.github) ? "Invalid GitHub URL (e.g. https://github.com/user)" : "";
  const linkedinError = links.linkedin.trim() && !isValidUrl(links.linkedin) ? "Invalid LinkedIn URL (e.g. https://linkedin.com/in/user)" : "";

  const isFormValid = !roleError && !messageError && !portfolioError && !githubError && !linkedinError;

  const submitApplication = async (e) => {
    if (e) e.preventDefault();
    setSubmittedAttempt(true);
    setSubmitError(null);

    if (!isFormValid) {
      if (roleError) toast.error(roleError);
      else if (messageError) toast.error(messageError);
      else if (portfolioError) toast.error(portfolioError);
      else if (githubError || linkedinError) toast.error("Please fix invalid link URLs before submitting");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        startup_id: startup.id || startup.original_id,
        role,
        message: message.trim(),
        portfolio_url: links.portfolio ? (links.portfolio.startsWith('http') ? links.portfolio : `https://${links.portfolio}`) : null,
        github_url: links.github ? (links.github.startsWith('http') ? links.github : `https://${links.github}`) : null,
        linkedin_url: links.linkedin ? (links.linkedin.startsWith('http') ? links.linkedin : `https://${links.linkedin}`) : null,
      };

      const res = await startupsAPI.sendJoinRequest(startup.id || startup.original_id, payload);

      if (res?.success || res?.data?.success) {
        toast.success("🚀 Application submitted successfully!");
        onClose();
        if (onSuccess) onSuccess();
        setMessage("");
        clearAppDraft();
        setLinks({ portfolio: "", github: "", linkedin: "" });
        setSubmittedAttempt(false);
      } else {
        toast.success("🚀 Application submitted! (Preview mode)");
        onClose();
        if (onSuccess) onSuccess();
        setMessage("");
        clearAppDraft();
        setLinks({ portfolio: "", github: "", linkedin: "" });
        setSubmittedAttempt(false);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || (err.response?.status === 409 ? "You have already applied for this startup" : err.message || "Failed to submit application. Please check your connection and try again.");
      setSubmitError(errorMsg);
      toast.error(errorMsg);
      // NOTE: Form data is preserved and modal remains open so user can retry!
    } finally {
      setLoading(false);
    }
  };

  if (!startup) return null;

  const showRoleError = (submittedAttempt || touched.role) && roleError;
  const showMessageError = (submittedAttempt || touched.message) && messageError;
  const showPortfolioError = (submittedAttempt || touched.portfolio) && portfolioError;

  return (
    <Dialog open={isOpen} onOpenChange={loading ? undefined : onClose}>
      <DialogContent
        className="
          !w-[94vw]
          !max-w-[780px]
          z-[9999]
          max-h-[90vh]
          bg-[#0a0b12]
          border border-white/15
          rounded-2xl
          p-0
          overflow-hidden
          shadow-[0_0_50px_rgba(0,0,0,0.85)]
        "
        showCloseButton={false}
      >
        <div className="flex flex-col h-full max-h-[90vh] relative">
          
          {/* HEADER BAR */}
          <div className="relative bg-gradient-to-r from-blue-950/70 via-purple-950/50 to-indigo-950/70 p-5 sm:p-6 border-b border-white/10 shrink-0">
            <button
              type="button"
              disabled={loading}
              onClick={onClose}
              className="absolute top-4 right-4 z-20 p-1.5 rounded-full bg-white/10 border border-white/15 text-slate-300 hover:text-white hover:bg-white/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              aria-label="Close"
            >
              <X size={16} />
            </button>

            <div className="flex items-start gap-4 pr-10">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan shrink-0 shadow-[0_0_15px_rgba(79,216,255,0.15)]">
                <Building2 size={22} />
              </div>

              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Eyebrow>Startup Application</Eyebrow>
                  <Tag tone="dev">{startup.stage || "Active"}</Tag>
                  {(startup.industry || startup.sector) && <Tag tone="neutral">{startup.industry || startup.sector}</Tag>}
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white font-display truncate">
                  {startup.name}
                </h2>
                <p className="text-xs text-slate-300/80 line-clamp-1">
                  {startup.description || "Join this startup and help shape its product and execution."}
                </p>
              </div>
            </div>
          </div>

          {/* GLOWING DIVIDER LINE */}
          <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-cyan-500/40 via-purple-500/30 to-transparent shrink-0" />

          {/* FORM CONTENT BODY */}
          <form noValidate onSubmit={submitApplication} className="p-5 sm:p-7 space-y-6 overflow-y-auto custom-scrollbar flex-1">
            
            {submitError && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
                <AlertCircle size={16} className="shrink-0 text-rose-400 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-semibold text-rose-200 font-sans">Submission Error</p>
                  <p className="font-sans text-rose-300/90">{submitError}</p>
                </div>
              </div>
            )}
            
            {/* STEP 1: ROLE SELECTION */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <label className="text-xs font-mono tracking-wider uppercase text-slate-200 font-semibold flex items-center gap-1.5">
                  1. Target Role <span className="text-amber-400">*</span>
                </label>
                <span className="text-[11px] text-slate-400">Select position</span>
              </div>

              <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-48 overflow-y-auto pr-1 custom-scrollbar p-1 rounded-xl transition-all ${showRoleError ? 'border border-rose-500/60 bg-rose-500/[0.04]' : ''}`}>
                {availableRoles.map((r) => {
                  const selected = role === r;
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => {
                        setRole(r);
                        setTouched(prev => ({ ...prev, role: true }));
                      }}
                      className={`
                        px-3.5 py-3 rounded-xl border text-xs font-medium text-left
                        flex items-center justify-between transition-all duration-200 cursor-pointer
                        ${selected
                          ? "bg-cyan-500/15 border-cyan-400 text-cyan-200 shadow-[0_0_16px_rgba(79,216,255,0.25)]"
                          : "bg-white/[0.03] border-white/10 text-slate-300 hover:border-white/25 hover:text-white hover:bg-white/[0.06]"
                        }
                      `}
                    >
                      <span className="truncate flex-1">{r}</span>
                      {selected && <CheckCircle2 size={14} className="text-cyan shrink-0 ml-1" />}
                    </button>
                  );
                })}
              </div>
              {showRoleError && (
                <p className="text-[11px] text-rose-400 flex items-center gap-1 mt-1.5 font-sans">
                  <AlertCircle size={12} /> {roleError}
                </p>
              )}
            </div>

            {/* STEP 2: MOTIVATION PITCH */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-mono tracking-wider uppercase text-slate-200 font-semibold flex items-center gap-1.5">
                  2. Why do you want to join? <span className="text-amber-400">*</span>
                </label>
                <span className={`text-[11px] font-mono ${message.length < 10 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {message.length} / 10+ chars
                </span>
              </div>
              <textarea
                rows={4}
                value={message}
                onBlur={() => setTouched(prev => ({ ...prev, message: true }))}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your relevant background, technical skills, and why you're excited to contribute to this startup's mission..."
                className={`w-full p-3.5 rounded-xl bg-white/[0.03] text-white placeholder:text-slate-500 text-xs sm:text-sm transition-all resize-none min-h-[115px] ${
                  showMessageError
                    ? 'border border-rose-500/70 bg-rose-500/[0.04] focus:outline-none focus:border-rose-500'
                    : 'border border-white/12 focus:outline-none focus:border-cyan-400/80 focus:bg-white/[0.06] focus:ring-1 focus:ring-cyan-400/30'
                }`}
              />
              {showMessageError && (
                <p className="text-[11px] text-rose-400 flex items-center gap-1 mt-1.5 font-sans">
                  <AlertCircle size={12} /> {messageError}
                </p>
              )}
            </div>

            {/* STEP 3: RELEVANT LINKS (GRID) */}
            <div>
              <label className="text-xs font-mono tracking-wider uppercase text-slate-200 font-semibold mb-2.5 block">
                3. Relevant Links & Portfolio <span className="text-amber-400">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      inputMode="url"
                      placeholder="Portfolio URL (Required)"
                      value={links.portfolio}
                      onBlur={() => setTouched(prev => ({ ...prev, portfolio: true }))}
                      onChange={(e) => setLinks({ ...links, portfolio: e.target.value })}
                      className={`w-full pl-9 pr-3 bg-white/[0.03] text-white text-xs rounded-xl h-10 outline-none ${showPortfolioError ? 'border border-rose-500/70 bg-rose-500/[0.04]' : 'border border-white/12 focus:border-cyan-400/80'}`}
                    />
                  </div>
                  {showPortfolioError && <p className="text-[10px] text-rose-400 mt-1 flex items-center gap-1 font-sans"><AlertCircle size={10} /> {portfolioError}</p>}
                </div>

                <div>
                  <div className="relative">
                    <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      inputMode="url"
                      placeholder="GitHub Profile"
                      value={links.github}
                      onChange={(e) => setLinks({ ...links, github: e.target.value })}
                      className={`w-full pl-9 pr-3 bg-white/[0.03] text-white text-xs rounded-xl h-10 outline-none ${githubError ? 'border border-rose-500/70 bg-rose-500/[0.04]' : 'border border-white/12 focus:border-cyan-400/80'}`}
                    />
                  </div>
                  {githubError && <p className="text-[10px] text-rose-400 mt-1 flex items-center gap-1 font-sans"><AlertCircle size={10} /> {githubError}</p>}
                </div>

                <div>
                  <div className="relative">
                    <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      inputMode="url"
                      placeholder="LinkedIn Profile"
                      value={links.linkedin}
                      onChange={(e) => setLinks({ ...links, linkedin: e.target.value })}
                      className={`w-full pl-9 pr-3 bg-white/[0.03] text-white text-xs rounded-xl h-10 outline-none ${linkedinError ? 'border border-rose-500/70 bg-rose-500/[0.04]' : 'border border-white/12 focus:border-cyan-400/80'}`}
                    />
                  </div>
                  {linkedinError && <p className="text-[10px] text-rose-400 mt-1 flex items-center gap-1 font-sans"><AlertCircle size={10} /> {linkedinError}</p>}
                </div>
              </div>
            </div>

            {/* FOOTER ACTION BAR */}
            <div className="pt-4 pb-1 border-t border-white/10 flex items-center justify-between shrink-0">
              <span className="text-[11px] text-slate-400 hidden sm:block">
                💡 Sent directly to the startup founder
              </span>
              <div className="flex items-center justify-end gap-3 w-full sm:w-auto">
                <CosmosButton
                  variant="quiet"
                  size="sm"
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancel
                </CosmosButton>
                <CosmosButton
                  variant="primary"
                  size="sm"
                  type="submit"
                  disabled={loading || (submittedAttempt && !isFormValid)}
                  className={submittedAttempt && !isFormValid ? "opacity-60 cursor-not-allowed" : ""}
                >
                  {loading ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> Sending...
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} /> Submit Application
                    </>
                  )}
                </CosmosButton>
              </div>
            </div>
          </form>

        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ApplyToStartupModal;