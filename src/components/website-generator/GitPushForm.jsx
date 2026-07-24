import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, Globe, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

export function GitPushForm({ onSubmit, defaultRepoName = "", isSubmitting = false, inline = false }) {
  const [provider, setProvider] = useState("github");
  const [token, setToken] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [repoName, setRepoName] = useState(defaultRepoName);
  const [saveToken, setSaveToken] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setRepoName(defaultRepoName);
  }, [defaultRepoName]);

  const validateForm = () => {
    const tempErrors = {};
    if (!token.trim()) {
      tempErrors.token = "Personal Access Token is required";
    } else {
      if (provider === "github" && !token.startsWith("ghp_") && !token.startsWith("github_pat_")) {
        tempErrors.tokenWarning = "Note: GitHub tokens typically start with 'ghp_' or 'github_pat_'";
      }
      if (provider === "gitlab" && !token.startsWith("glpat-")) {
        tempErrors.tokenWarning = "Note: GitLab tokens typically start with 'glpat-'";
      }
    }
    if (repoName.trim() && !/^[a-zA-Z0-9-_.]+$/.test(repoName)) {
      tempErrors.repoName = "Invalid name. Use only alphanumeric characters, hyphens, underscores, or dots.";
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).filter(k => k !== "tokenWarning").length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit?.({ provider, token: token.trim(), repo_name: repoName.trim() || undefined, save_token: saveToken });
    }
  };

  const formFields = (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* autofill color override */}
      <style>{`
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0px 1000px #0a0a0a inset !important;
          -webkit-text-fill-color: #e4e4e7 !important;
          transition: background-color 5000s ease-in-out 0s;
        }
      `}</style>

      {/* Provider Selector */}
      <div className="flex flex-col gap-2">
        <label className="text-[10.5px] font-bold text-zinc-500 uppercase tracking-[0.12em]">Git Provider</label>
        <div className="grid grid-cols-2 gap-2.5">
          {[
            { id: "github", label: "GitHub" },
            { id: "gitlab", label: "GitLab" },
          ].map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => { setProvider(p.id); setErrors(prev => ({ ...prev, tokenWarning: null })); }}
              className={cn(
                "py-2.5 px-4 rounded-xl border text-[13px] font-semibold flex items-center justify-center gap-2 transition-all outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50",
                provider === p.id
                  ? "bg-white/[0.1] text-white border-white/[0.2]"
                  : "bg-white/[0.03] text-zinc-500 border-white/[0.07] hover:bg-white/[0.07] hover:text-zinc-300"
              )}
            >
              {p.id === "github" ? (
                <svg aria-hidden="true" width="15" height="15" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
                </svg>
              ) : (
                <svg aria-hidden="true" width="15" height="15" fill="currentColor" viewBox="0 0 16 16">
                  <path d="m15.97 8.47-.03-.09-1.99-6.14a.512.512 0 0 0-.97-.02L11.16 7.7H4.84L3.02 2.22a.512.512 0 0 0-.97.02L.06 8.38c-.01.03-.02.06-.03.09a1.51 1.51 0 0 0 .52 1.63l7.05 5.12c.12.09.28.09.4 0l7.05-5.12a1.51 1.51 0 0 0 .52-1.63z"/>
                </svg>
              )}
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Token Input */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="git-token" className="text-[10.5px] font-bold text-zinc-500 uppercase tracking-[0.12em]">
            Access Token
          </label>
          <span className="text-[10px] text-zinc-600 flex items-center gap-1">
            <Lock size={10} /> In-memory only
          </span>
        </div>
        <div className="relative">
          <input
            id="git-token"
            type={showToken ? "text" : "password"}
            value={token}
            onChange={(e) => { setToken(e.target.value); if (errors.token) setErrors(prev => ({ ...prev, token: null })); }}
            placeholder={`${provider === "github" ? "ghp_..." : "glpat-..."}`}
            className={cn(
              "w-full bg-black/40 border rounded-xl py-2.5 pl-3.5 pr-10 text-[13px] font-mono text-zinc-100 placeholder-zinc-700 outline-none transition-all",
              errors.token
                ? "border-red-500/40 focus:border-red-500 focus:ring-2 focus:ring-red-500/10"
                : "border-white/[0.08] focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/10"
            )}
          />
          <button
            type="button"
            onClick={() => setShowToken(!showToken)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors focus:outline-none"
          >
            {showToken ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
        {errors.token && (
          <span className="text-[11px] text-red-400 flex items-center gap-1">{errors.token}</span>
        )}
        {errors.tokenWarning && !errors.token && (
          <span className="text-[11px] text-amber-500/90 flex items-start gap-1.5">
            <ShieldAlert size={13} className="flex-shrink-0 mt-0.5" />
            <span>{errors.tokenWarning}</span>
          </span>
        )}
      </div>

      {/* Repository Name */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-2">
          <label htmlFor="repo-name" className="text-[10.5px] font-bold text-zinc-500 uppercase tracking-[0.12em]">
            Repo Name
            <span className="ml-1 text-zinc-700 normal-case font-normal text-[10px]">(optional)</span>
          </label>
          <span className="text-[10px] text-zinc-600 flex items-center gap-1 flex-shrink-0">
            <Globe size={10} /> Fallback to slug
          </span>
        </div>
        <input
          id="repo-name"
          type="text"
          value={repoName}
          onChange={(e) => { setRepoName(e.target.value); if (errors.repoName) setErrors(prev => ({ ...prev, repoName: null })); }}
          placeholder={defaultRepoName ? `e.g., ${defaultRepoName}` : "my-project"}
          className={cn(
            "w-full bg-black/40 border rounded-xl py-2.5 px-3.5 text-[13px] text-zinc-100 placeholder-zinc-700 outline-none transition-all",
            errors.repoName
              ? "border-red-500/40 focus:border-red-500"
              : "border-white/[0.08] focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/10"
          )}
        />
        {errors.repoName && (
          <span className="text-[11px] text-red-400">{errors.repoName}</span>
        )}
      </div>

      {/* Remember Token */}
      <div className="flex items-center justify-between p-3 bg-black/30 border border-white/[0.06] rounded-xl select-none">
        <div>
          <span className="block text-[12.5px] font-semibold text-zinc-300">Remember Token</span>
          <span className="block text-[11px] text-zinc-600 mt-0.5">Encrypted storage for re-use</span>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={saveToken}
            onChange={(e) => setSaveToken(e.target.checked)}
            className="sr-only peer"
          />
          <div className={cn(
            "w-10 h-[22px] rounded-full transition-all duration-300 relative peer-focus-visible:ring-2 peer-focus-visible:ring-violet-500/50",
            saveToken ? "bg-violet-600 shadow-[0_0_10px_rgba(124,58,237,0.4)]" : "bg-white/[0.08]"
          )}>
            <div className={cn(
              "absolute top-[3px] w-4 h-4 rounded-full transition-all duration-200 shadow-sm",
              saveToken ? "left-[22px] bg-white" : "left-[3px] bg-zinc-500"
            )} />
          </div>
        </label>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className={cn(
          "w-full py-3 rounded-xl text-[13px] font-bold transition-all flex items-center justify-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50",
          isSubmitting
            ? "bg-violet-700/40 text-zinc-500 cursor-not-allowed border border-violet-500/20"
            : "bg-gradient-to-r from-violet-600 to-violet-700 text-white hover:from-violet-500 hover:to-violet-600 shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:shadow-[0_0_28px_rgba(124,58,237,0.5)] active:scale-[0.99]"
        )}
      >
        {isSubmitting ? (
          <>
            <svg aria-hidden="true" className="animate-spin h-4 w-4 text-zinc-300" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Pushing...
          </>
        ) : (
          <>
            <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="18" r="3" /><circle cx="6" cy="6" r="3" />
              <path d="M13 6h3a2 2 0 0 1 2 2v7" /><line x1="6" y1="9" x2="6" y2="21" />
            </svg>
            Push to Remote
          </>
        )}
      </button>
    </form>
  );

  // Inline mode: just the form (parent provides the card shell)
  if (inline) return formFields;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.3 }}
      className="relative bg-gradient-to-b from-zinc-900/90 to-zinc-950 border border-white/[0.07] rounded-2xl p-6 flex flex-col gap-5 shadow-xl overflow-hidden"
    >
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.12] to-transparent" />
      <div>
        <h3 className="text-[16px] font-bold text-white tracking-tight">Push to Git Provider</h3>
        <p className="text-[12.5px] text-zinc-600 mt-1.5 leading-relaxed">
          Scaffold and deliver your codebase directly to a remote repository.
        </p>
      </div>
      {formFields}
    </motion.div>
  );
}

export default GitPushForm;
