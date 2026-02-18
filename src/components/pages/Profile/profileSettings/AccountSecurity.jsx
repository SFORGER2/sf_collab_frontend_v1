import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";

/* ---------------------- AccountSecurity ---------------------- */
export default function AccountSecurity ({ formData, onChange, confirmedDelete, setConfirmedDelete, changePassword, changeEmail, deleteAccount }) {
  const security = formData.accountSecurity || {};
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // local state for passwords/email
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  const [deletePassword, setDeletePassword] = useState('');

  const canChangePassword = newPassword.length >= 8 && newPassword === confirmPassword;

  return (
    <div className="space-y-10">
      <h2 className="text-2xl font-bold mb-6">Account & Security</h2>
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 mb-8">
        <p className="text-gray-300 text-sm">🔄 More security features coming soon...</p>
      </div>
{/* 
      <div className="space-y-6">
        <h3 className="text-xl font-semibold">Password</h3>
        <p className="text-gray-400 text-sm">Manage your login password. Choose a strong, unique password.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm mb-2 text-gray-400">Current Password</label>
            <div className="relative">
              <input type={showCurrent ? "text" : "password"} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 pr-12" />
              <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute left-3 top-3 text-gray-300">{showCurrent ? <EyeOff size={20} /> : <Eye size={20} />}</button>
            </div>
          </div>

          <div className="flex items-end">
            <button type="button" onClick={() => toast.info('Password reset email (server) required')} className="text-blue-400 underline text-sm">Forgot password?</button>
          </div>

          <div>
            <label className="block text-sm mb-2 text-gray-400">New Password</label>
            <div className="relative">
              <input type={showNew ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 pr-12" />
              <button type="button" onClick={() => setShowNew(!showNew)} className="absolute left-3 top-3 text-gray-300">{showNew ? <EyeOff size={20} /> : <Eye size={20} />}</button>
            </div>
          </div>

          <div>
            <label className="block text-sm mb-2 text-gray-400">Confirm New Password</label>
            <div className="relative">
              <input type={showConfirm ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 pr-12" />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute left-3 top-3 text-gray-300">{showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}</button>
            </div>
          </div>
        </div>

        <div className="text-sm text-gray-400 space-y-1">
          <div>{newPassword.length < 8 ? <span className="text-red-400">• Must be at least 8 characters</span> : <span className="text-green-400">• Length OK</span>}</div>
          <div>{newPassword !== confirmPassword ? <span className="text-red-400">• Passwords do not match</span> : <span className="text-green-400">• Passwords match</span>}</div>
        </div>

        <button disabled={!canChangePassword} onClick={() => changePassword(currentPassword, newPassword)} className={`px-6 py-3 rounded-lg mt-4 transition-colors ${canChangePassword ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-600 cursor-not-allowed text-gray-400"}`}>Update Password</button>
      </div>

      <div className="space-y-6 pt-10">
        <h3 className="text-xl font-semibold">Change Email</h3>
        <p className="text-gray-400 text-sm">Change the email tied to your account (will require re-verification).</p>

        <div className="grid grid-cols-2 gap-4">
          <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="new.email@example.com" className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3" />
          <input type="password" value={emailPassword} onChange={(e) => setEmailPassword(e.target.value)} placeholder="current password" className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3" />
        </div>
        <div className="flex gap-4 justify-end">
          <button onClick={() => changeEmail(newEmail, emailPassword)} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg">Change Email</button>
        </div>
      </div> */}

      <div className="space-y-6 pt-10 mb-4">
        {/* <h3 className="text-xl font-semibold text-red-400">Danger Zone</h3> */}
        <div className={`bg-gray-800/40 border ${confirmedDelete ? "border-red-700" : "border-transparent"} rounded-lg p-6 space-y-4`}>
          {/* <button onClick={() => toast.info('Export endpoint not implemented on backend')} className="w-full px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg">Export My Data</button> */}

          <div className="space-y-2">
            {/* <input type="password" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} placeholder="Enter password to confirm" className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3" /> */}
            <div className="flex gap-4 justify-end">
              {confirmedDelete && <button onClick={() => setConfirmedDelete(false)} className="px-4 py-2 bg-gray-700 rounded-lg">Cancel</button>}
              {
                !confirmedDelete ? (
                  <button onClick={() => setConfirmedDelete(true)} className="px-4 py-2 bg-slate-700 border-red-600 hover:bg-red-700 rounded-lg">Delete My Account</button>
                ) : (
                  <span className="px-4 py-2 bg-red-600 font-medium rounded-lg">Confirm Delete</span>
                )
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
