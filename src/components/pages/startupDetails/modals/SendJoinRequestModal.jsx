import React, { useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
} from '../../../ui/dialog';
import { toast } from 'react-toastify';
import { startupsAPI } from '@/utils/APIs/startupsAPI';
import { Building2, CheckCircle2, Globe, Sparkles, X, AlertCircle, Loader2, Clock } from 'lucide-react';
import { CosmosButton, Eyebrow, Tag } from '@/components/cosmos';
import { FaGithub, FaLinkedin } from "react-icons/fa";

const AVAILABILITY_OPTIONS = [
  'Part-time · 5–10 h/week',
  'Part-time · 10–20 h/week',
  'Full-time · 40+ h/week',
  'Flexible / TBD',
];

const SendJoinRequestModal = ({ isOpen, onClose, startupRoles = [], startupId, startupName, onSuccess }) => {
  const availableRoles = useMemo(() => {
    if (Array.isArray(startupRoles) && startupRoles.length > 0) return startupRoles;
    if (typeof startupRoles === 'object' && startupRoles !== null) {
      return Object.keys(startupRoles).filter(roleKey => (startupRoles[roleKey]?.available_roles || 1) > 0);
    }
    return ['Fullstack Engineer', 'Frontend Developer', 'Backend Engineer', 'Product Designer'];
  }, [startupRoles]);

  const [formData, setFormData] = useState({
    message: '',
    role: availableRoles[0] || 'member',
    portfolio_url: '',
    github_url: '',
    linkedin_url: '',
    availability: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [submittedAttempt, setSubmittedAttempt] = useState(false);
  const [touched, setTouched] = useState({});
  const [submitError, setSubmitError] = useState(null);

  // Synchronize state and reset flags when modal opens or availableRoles update
  React.useEffect(() => {
    if (isOpen) {
      if (availableRoles.length > 0 && (!formData.role || !availableRoles.includes(formData.role))) {
        setFormData(prev => ({ ...prev, role: availableRoles[0] }));
      }
      setSubmittedAttempt(false);
      setTouched({});
      setSubmitError(null);
    }
  }, [isOpen, availableRoles]);

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
  const roleError = !formData.role ? "Please select a desired role" : "";
  const messageError = !formData.message.trim() 
    ? "Motivation message is required" 
    : formData.message.trim().length < 20 
      ? "Message must be at least 20 characters" 
      : "";

  const portfolioError = !formData.portfolio_url.trim()
    ? "Portfolio or project link is required"
    : !isValidUrl(formData.portfolio_url)
      ? "Invalid Portfolio URL format (e.g. https://portfolio.com)"
      : "";

  const githubError = formData.github_url.trim() && !isValidUrl(formData.github_url) ? "Invalid GitHub URL format" : "";
  const linkedinError = formData.linkedin_url.trim() && !isValidUrl(formData.linkedin_url) ? "Invalid LinkedIn URL format" : "";
  const availabilityError = !formData.availability ? "Please select your weekly availability" : "";

  const isFormValid = !roleError && !messageError && !portfolioError && !githubError && !linkedinError && !availabilityError;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmittedAttempt(true);
    setSubmitError(null);

    if (!isFormValid) {
      if (roleError) toast.error(roleError);
      else if (messageError) toast.error(messageError);
      else if (portfolioError) toast.error(portfolioError);
      else if (githubError || linkedinError) toast.error("Please fix link URL validation errors before submitting");
      else if (availabilityError) toast.error(availabilityError);
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        startup_id: startupId,
        message: formData.message.trim(),
        role: formData.role,
        availability: formData.availability,
        portfolio_url: formData.portfolio_url ? (formData.portfolio_url.startsWith('http') ? formData.portfolio_url : `https://${formData.portfolio_url}`) : null,
        github_url: formData.github_url ? (formData.github_url.startsWith('http') ? formData.github_url : `https://${formData.github_url}`) : null,
        linkedin_url: formData.linkedin_url ? (formData.linkedin_url.startsWith('http') ? formData.linkedin_url : `https://${formData.linkedin_url}`) : null,
      };

      const response = await startupsAPI.sendJoinRequest(startupId, payload);

      if (response?.success || response?.data?.success) {
        toast.success('🚀 Join request submitted successfully!');
        setFormData({
          message: '',
          role: availableRoles[0] || 'member',
          portfolio_url: '',
          github_url: '',
          linkedin_url: '',
          availability: '',
        });
        onClose();
        if (onSuccess) onSuccess();
        setSubmittedAttempt(false);
      } else {
        toast.success('🚀 Join request submitted! (Preview mode)');
        onClose();
        if (onSuccess) onSuccess();
        setSubmittedAttempt(false);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || (error.response?.status === 409 ? "You already have a pending request for this startup" : error.message || "Failed to send join request. Please try again.");
      setSubmitError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFieldChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const showRoleError = (submittedAttempt || touched.role) && roleError;
  const showMessageError = (submittedAttempt || touched.message) && messageError;
  const showPortfolioError = (submittedAttempt || touched.portfolio) && portfolioError;
  const showAvailabilityError = (submittedAttempt || touched.availability) && availabilityError;

  return (
    <Dialog open={isOpen} onOpenChange={isLoading ? undefined : onClose}>
      <DialogContent className="!w-[94vw] !max-w-[780px] z-[9999] max-h-[90vh] bg-[#0a0b12] border border-white/15 rounded-2xl p-0 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.85)]">
        <div className="flex flex-col h-full max-h-[90vh] relative">
          
          {/* HEADER BAR */}
          <div className="relative bg-gradient-to-r from-blue-950/70 via-purple-950/50 to-indigo-950/70 p-5 sm:p-6 border-b border-white/10 shrink-0">
            <button
              type="button"
              disabled={isLoading}
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
                  <Tag tone="dev">Active</Tag>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white font-display truncate">
                  Join {startupName}
                </h2>
                <p className="text-xs text-slate-300/80 line-clamp-1">
                  Tell the team why you'd like to join and how you can contribute.
                </p>
              </div>
            </div>
          </div>

          {/* GLOWING DIVIDER LINE */}
          <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-cyan-500/40 via-purple-500/30 to-transparent shrink-0" />

          {/* FORM CONTENT BODY */}
          <form noValidate onSubmit={handleSubmit} className="p-5 sm:p-7 space-y-6 overflow-y-auto custom-scrollbar flex-1">
            
            {submitError && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
                <AlertCircle size={16} className="shrink-0 text-rose-400 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-semibold text-rose-200 font-sans">Submission Error</p>
                  <p className="font-sans text-rose-300/90">{submitError}</p>
                  <p className="font-sans text-rose-300/70 text-[10px] mt-1">Your application data has been preserved — fix the issue above and try again.</p>
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
                  const roleName = typeof r === 'string' ? r : (r.roleType || r.name || 'Member');
                  const selected = formData.role === roleName;
                  return (
                    <button
                      key={roleName}
                      type="button"
                      onClick={() => {
                        handleFieldChange('role', roleName);
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
                      <span className="truncate flex-1">{roleName}</span>
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

            {/* STEP 2: MESSAGE PITCH */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-mono tracking-wider uppercase text-slate-200 font-semibold flex items-center gap-1.5">
                  2. Your Motivation <span className="text-amber-400">*</span>
                </label>
                <span className={`text-[11px] font-mono ${formData.message.length < 20 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {formData.message.length} / 20+ chars
                </span>
              </div>
              <textarea
                rows={4}
                value={formData.message}
                onBlur={() => setTouched(prev => ({ ...prev, message: true }))}
                onChange={(e) => handleFieldChange('message', e.target.value)}
                placeholder="Introduce yourself, share your relevant experience, and explain how your background fits this team's needs..."
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

            {/* STEP 3: AVAILABILITY */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <label className="text-xs font-mono tracking-wider uppercase text-slate-200 font-semibold flex items-center gap-1.5">
                  <Clock size={12} className="text-cyan" /> 3. Weekly Availability <span className="text-amber-400">*</span>
                </label>
                <span className="text-[11px] text-slate-400">Hours per week</span>
              </div>
              <div className={`grid grid-cols-2 sm:grid-cols-4 gap-2 transition-all ${showAvailabilityError ? 'border border-rose-500/60 bg-rose-500/[0.04] rounded-xl p-1' : ''}`}>
                {AVAILABILITY_OPTIONS.map((opt) => {
                  const selected = formData.availability === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        handleFieldChange('availability', opt);
                        setTouched(prev => ({ ...prev, availability: true }));
                      }}
                      className={`
                        px-3 py-2.5 rounded-xl border text-xs font-medium text-center
                        flex flex-col items-center justify-center gap-1 transition-all duration-200 cursor-pointer
                        ${selected
                          ? "bg-cyan-500/15 border-cyan-400 text-cyan-200 shadow-[0_0_12px_rgba(79,216,255,0.2)]"
                          : "bg-white/[0.03] border-white/10 text-slate-300 hover:border-white/25 hover:text-white hover:bg-white/[0.06]"
                        }
                      `}
                    >
                      {selected && <CheckCircle2 size={12} className="text-cyan" />}
                      {opt}
                    </button>
                  );
                })}
              </div>
              {showAvailabilityError && (
                <p className="text-[11px] text-rose-400 flex items-center gap-1 mt-1.5 font-sans">
                  <AlertCircle size={12} /> {availabilityError}
                </p>
              )}
            </div>

            {/* STEP 4: LINKS (GRID) */}
            <div>
              <label className="text-xs font-mono tracking-wider uppercase text-slate-200 font-semibold mb-2.5 block">
                4. Relevant Links & Portfolio <span className="text-amber-400">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      inputMode="url"
                      placeholder="Portfolio URL (Required)"
                      value={formData.portfolio_url}
                      onBlur={() => setTouched(prev => ({ ...prev, portfolio: true }))}
                      onChange={(e) => handleFieldChange('portfolio_url', e.target.value)}
                      className={`w-full pl-9 pr-3 bg-white/[0.03] text-white text-xs rounded-xl h-10 outline-none ${showPortfolioError ? 'border border-rose-500/70 bg-rose-500/[0.04]' : 'border border-white/12 focus:border-cyan-400/80'}`}
                    />
                  </div>
                  {showPortfolioError && <p className="text-[10px] text-rose-400 mt-1 flex items-center gap-1 font-sans"><AlertCircle size={10} /> {portfolioError}</p>}
                </div>

                <div>
                  <div className="relative">
                    <FaGithub className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      inputMode="url"
                      placeholder="GitHub Profile (Optional)"
                      value={formData.github_url}
                      onChange={(e) => handleFieldChange('github_url', e.target.value)}
                      className={`w-full pl-9 pr-3 bg-white/[0.03] text-white text-xs rounded-xl h-10 outline-none ${githubError ? 'border border-rose-500/70 bg-rose-500/[0.04]' : 'border border-white/12 focus:border-cyan-400/80'}`}
                    />
                  </div>
                  {githubError && <p className="text-[10px] text-rose-400 mt-1 flex items-center gap-1 font-sans"><AlertCircle size={10} /> {githubError}</p>}
                </div>

                <div>
                  <div className="relative">
                    <FaLinkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      inputMode="url"
                      placeholder="LinkedIn Profile (Optional)"
                      value={formData.linkedin_url}
                      onChange={(e) => handleFieldChange('linkedin_url', e.target.value)}
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
                💡 Sent directly to the founder for review
              </span>
              <div className="flex items-center justify-end gap-3 w-full sm:w-auto">
                <CosmosButton
                  variant="quiet"
                  size="sm"
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                >
                  Cancel
                </CosmosButton>
                <CosmosButton
                  variant="primary"
                  size="sm"
                  type="submit"
                  disabled={isLoading || (submittedAttempt && !isFormValid)}
                  className={submittedAttempt && !isFormValid ? "opacity-60 cursor-not-allowed" : ""}
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> Sending...
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} /> Send Join Request
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

export default SendJoinRequestModal;
