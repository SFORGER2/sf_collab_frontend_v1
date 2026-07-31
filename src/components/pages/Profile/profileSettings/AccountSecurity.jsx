import { AlertTriangle, Check, Eye, EyeOff, KeyRound, Mail, Shield, X } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";
import { CosmosButton } from "@/components/cosmos";
import { Field, FieldGrid, Notice, SectionHead, SettingsCard, TextInput } from "./SettingsUI";

/**
 * Account & Security.
 *
 * Rebuilt on the shared settings primitives. Two behavioural fixes alongside
 * the restyle:
 *
 * - The "Danger zone" was a bare pair of buttons with no heading and no text —
 *   nothing told you what deleting actually does. It now says so before you
 *   click, and the confirm step spells out that it is permanent.
 * - Password rules were rendered as two lines that both always showed, one red
 *   one green; they are now a live checklist that only marks what you have met.
 */
export default function AccountSecurity({
  confirmedDelete,
  setConfirmedDelete,
  deleteAccount,
  changePassword,
  changeEmail,
}) {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [emailPassword, setEmailPassword] = useState("");

  const rules = [
    { met: newPassword.length >= 8, label: "At least 8 characters" },
    { met: /[^a-zA-Z0-9]/.test(newPassword), label: "One symbol or number" },
    { met: !!newPassword && newPassword === confirmPassword, label: "Both entries match" },
  ];
  const canChangePassword = rules.every((r) => r.met) && !!currentPassword;

  const handlePasswordUpdate = () => {
    if (!canChangePassword) {
      toast.error("Fill in your current password and meet every rule below");
      return;
    }
    changePassword(currentPassword, newPassword);
  };

  const handleEmailUpdate = () => {
    if (!newEmail || !emailPassword) {
      toast.error("Both the new email and your current password are needed");
      return;
    }
    changeEmail(newEmail, emailPassword);
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-full min-w-0">
      <SectionHead
        icon={Shield}
        title="Account & Security"
        description="Credentials, email and account removal."
        accent="#4fd8ff"
      />

      {/* Password */}
      <SettingsCard
        title="Password"
        hint="Use something you don't use anywhere else."
        accent="#4fd8ff"
      >
        <FieldGrid>
          <Field label="Current password">
            <SecretInput
              value={currentPassword}
              onChange={setCurrentPassword}
              show={showCurrent}
              onToggle={() => setShowCurrent((s) => !s)}
              autoComplete="current-password"
            />
          </Field>
          <Field label="New password">
            <SecretInput
              value={newPassword}
              onChange={setNewPassword}
              show={showNew}
              onToggle={() => setShowNew((s) => !s)}
              autoComplete="new-password"
            />
          </Field>
          <Field label="Confirm new password">
            <SecretInput
              value={confirmPassword}
              onChange={setConfirmPassword}
              show={showConfirm}
              onToggle={() => setShowConfirm((s) => !s)}
              autoComplete="new-password"
            />
          </Field>
        </FieldGrid>

        <ul className="flex flex-wrap gap-x-6 gap-y-2 pt-3 border-t border-white/[0.04]">
          {rules.map((r) => (
            <li
              key={r.label}
              className="flex items-center gap-1.5 text-[0.81rem] font-medium transition-all duration-200"
              style={{ color: r.met ? "#3ee6a0" : "var(--color-dim)" }}
            >
              {r.met ? <Check size={13} className="shrink-0" /> : <X size={13} className="shrink-0 opacity-40" />}
              {r.label}
            </li>
          ))}
        </ul>

        <div className="flex flex-col sm:flex-row items-center gap-2.5 sm:gap-3.5 pt-1 w-full min-w-0">
          <CosmosButton
            variant="primary"
            size="sm"
            disabled={!canChangePassword}
            onClick={handlePasswordUpdate}
            className="w-full sm:w-auto min-h-[44px] justify-center"
          >
            <KeyRound size={14} /> Update password
          </CosmosButton>
          <button
            type="button"
            onClick={() => toast.info("Password reset by email needs the backend endpoint")}
            className="w-full sm:w-auto inline-flex items-center justify-center min-h-[44px] text-[0.82rem] font-medium text-dim/80 hover:text-star transition-colors px-1 cursor-pointer text-center sm:text-left"
          >
            Forgot your password?
          </button>
        </div>
      </SettingsCard>

      {/* Email */}
      <SettingsCard
        title="Email address"
        hint="Changing this signs you out of email verification until you confirm the new address."
        accent="#8b6cff"
      >
        <FieldGrid>
          <Field label="New email">
            <TextInput
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="new.email@example.com"
              autoComplete="email"
            />
          </Field>
          <Field label="Current password">
            <TextInput
              type="password"
              value={emailPassword}
              onChange={(e) => setEmailPassword(e.target.value)}
              placeholder="Confirm it's you"
              autoComplete="current-password"
            />
          </Field>
        </FieldGrid>

        <div>
          <CosmosButton variant="ghost" size="sm" onClick={handleEmailUpdate} className="w-full sm:w-auto min-h-[44px] justify-center">
            <Mail size={14} /> Change email
          </CosmosButton>
        </div>
      </SettingsCard>

      {/* Danger zone */}
      <SettingsCard title="Delete account" accent="#ff6f6f">
        <Notice tone="error">
          <span className="flex items-start gap-2.5">
            <AlertTriangle size={15} className="mt-0.5 shrink-0" />
            <span className="break-words">
              This removes your profile, your visions, your contributions and your wallet
              balance. It cannot be undone, and the same email cannot be reused.
            </span>
          </span>
        </Notice>

        <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 mt-5 w-full min-w-0">
          {!confirmedDelete ? (
            <button
              type="button"
              onClick={() => setConfirmedDelete(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2.5 min-h-[44px] rounded-xl border border-red-500/35 bg-red-500/5 text-[0.84rem] font-medium text-red-400 hover:bg-red-500/15 hover:border-red-500/50 active:scale-[0.98] transition-all duration-200 shadow-xs cursor-pointer"
            >
              Delete my account
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={deleteAccount}
                className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2.5 min-h-[44px] rounded-xl border border-red-500/70 bg-red-500/20 text-[0.84rem] font-semibold text-red-300 hover:bg-red-500/30 active:scale-[0.98] transition-all duration-200 shadow-[0_0_18px_-4px_rgba(255,112,112,0.3)] cursor-pointer"
              >
                Yes, delete it permanently
              </button>
              <button
                type="button"
                onClick={() => setConfirmedDelete(false)}
                className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2.5 min-h-[44px] rounded-xl border border-white/10 text-[0.84rem] font-medium text-dim hover:text-star hover:bg-white/[0.06] active:scale-[0.98] transition-all duration-200 cursor-pointer"
              >
                Keep my account
              </button>
            </>
          )}
        </div>
      </SettingsCard>
    </div>
  );
}

/** Password input with a reveal toggle that doesn't sit on top of the text. */
function SecretInput({ value, onChange, show, onToggle, ...props }) {
  return (
    <div className="relative">
      <TextInput
        {...props}
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pr-12"
      />
      <button
        type="button"
        onClick={onToggle}
        aria-label={show ? "Hide password" : "Show password"}
        className="absolute right-1 top-1/2 -translate-y-1/2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-dim/70 hover:text-star hover:bg-white/10 transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-white/20 cursor-pointer"
        style={{ minWidth: '44px', minHeight: '44px' }}
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}
