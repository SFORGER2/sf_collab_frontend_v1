import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { useState, useMemo, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { updateUser as updateUserSlice } from "@/services/auth/authSlice";
import { API_URL } from "@/utils/config";
import { Globe, Briefcase, X } from "lucide-react";
import { builderFocusOptions } from "@/components/pages/Profile/profileSettings/builderFocus";
import { usersAPI } from "@/utils/APIs/userAPI";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

export default function CompleteProfilePopUp() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user, access_token } = useSelector((state) => state.auth);
  const timezones = useMemo(() => Intl.supportedValuesOf ? Intl.supportedValuesOf("timeZone") : ['UTC'], []);

  const [formData, setFormData] = useState({
    roles: [],
    timezone: '',
    preferences: {
      builderPreferences: ''
    }
  });
  const [loading, setLoading] = useState(false);
  const [roles] = useState(['influencer', 'investor', 'builder', 'founder']);

  useEffect(() => {
    if (user) {
      setFormData({
        roles: user.roles || [],
        timezone: user.preferences?.timezone || '',
        preferences: {
          ...user.preferences,
          builderPreferences: user.preferences?.builderPreferences || ''
        }
      });
    }
  }, [user]);

  const handleSave = async () => {
    if (formData.roles.length === 0) {
      toast.error("You must select at least one role");
      return;
    }
    if (!formData.timezone) {
      toast.error("You must select a timezone");
      return;
    }
    if (formData.roles.includes('builder') && !formData.preferences?.builderPreferences) {
      toast.error("You must select a builder focus");
      return;
    }

    setLoading(true);
    try {
      if (!user?.id) return;
      const token = access_token || localStorage.getItem("access_token") || "";
      const res = await usersAPI.updateProfile(user.id, formData, token, "application/json");
      console.log("Profile update response:", res);
      const updatedUser = res?.data?.user || res?.user;
      if (updatedUser) {
        dispatch(updateUserSlice(updatedUser));
      }
      toast.success("Profile completed successfully!");
    } catch (err) {
      console.error(err);
      const status = err?.response?.status;
      if (status === 401) {
        toast.error("Session expired. Please log in again.");
      } else {
        toast.error(err?.response?.data?.error || err.message || "Failed to update profile");
      }
    } finally {
      setLoading(false);
    }
  };

  const isIncomplete = !user?.roles?.length || !user?.preferences?.timezone || 
    (user?.roles?.includes('builder') && !user?.preferences?.builderPreferences);

  if (location.pathname === "/user-profile" || !isIncomplete) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-linear-to-b from-gray-800 to-gray-900 text-white p-8 rounded-xl max-w-2xl w-full shadow-2xl border border-gray-700 max-h-[90vh] overflow-y-auto"
      >
        <div className="mb-6">
          <h2 className="text-3xl font-bold mb-2">Complete Your Profile</h2>
          <p className="text-gray-300 text-sm">
            Please complete the required fields to unlock all features.
          </p>
        </div>

        <motion.div
          className="space-y-6"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Roles Selection */}
          <motion.div variants={itemVariants}>
            <label className="block text-sm font-semibold text-gray-200 uppercase tracking-wide mb-4">
              Select Your Roles <span className="text-red-400">*</span>
            </label>
            {formData.roles.length === 0 && (
              <div className="mb-4 p-3 bg-red-600/10 border border-red-600/50 rounded-lg">
                <p className="text-red-400 text-sm font-medium">You must select at least one role</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              {roles.map(role => (
                <motion.label
                  key={role}
                  whileHover={{ x: 2 }}
                  className="flex items-center p-4 bg-gray-700/20 hover:bg-gray-700/30 border border-gray-700/50 rounded-lg cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={formData.roles.includes(role)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData(prev => ({ ...prev, roles: [...prev.roles, role] }));
                      } else {
                        setFormData(prev => ({
                          ...prev,
                          roles: prev.roles.filter(r => r !== role),
                          preferences: role === 'builder' ? { ...prev.preferences, builderPreferences: '' } : prev.preferences
                        }));
                      }
                    }}
                    className="w-4 h-4 rounded border-gray-600 cursor-pointer"
                  />
                  <span className="ml-3 text-gray-200 font-medium capitalize">
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </span>
                </motion.label>
              ))}
            </div>
          </motion.div>

          {/* Builder Focus */}
          {formData.roles.includes("builder") && (
            <motion.div variants={itemVariants} className="p-6 bg-linear-to-r from-purple-600/10 to-pink-600/10 rounded-xl border border-purple-700/30">
              <div className="flex items-center gap-3 mb-4">
                <Briefcase className="w-5 h-5 text-purple-400" />
                <label className="block text-sm font-semibold text-gray-200">
                  Builder Focus <span className="text-red-400">*</span>
                </label>
              </div>
              {!formData.preferences?.builderPreferences && (
                <div className="mb-4 p-3 bg-red-600/10 border border-red-600/50 rounded-lg">
                  <p className="text-red-400 text-sm font-medium">You must select a builder focus</p>
                </div>
              )}
              <select
                value={formData.preferences?.builderPreferences || ''}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    preferences: { ...prev.preferences, builderPreferences: e.target.value },
                  }))
                }
                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-gray-100 focus:border-purple-500 focus:outline-none transition-colors"
              >
                <option value="" disabled>Select an option</option>
                {builderFocusOptions.map((option) => (
                  <option key={option} value={option} className="text-black bg-white">
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </option>
                ))}
                <option value="other" className="text-black bg-white">Other</option>
              </select>
            </motion.div>
          )}

          {/* Timezone Selection */}
          <motion.div variants={itemVariants}>
            <div className="flex items-center gap-3 mb-4">
              <Globe className="w-5 h-5 text-blue-400" />
              <label className="block text-sm font-semibold text-gray-200">
                Timezone <span className="text-red-400">*</span>
              </label>
            </div>
            {!formData.timezone && (
              <div className="mb-4 p-3 bg-red-600/10 border border-red-600/50 rounded-lg">
                <p className="text-red-400 text-sm font-medium">You must select a timezone</p>
              </div>
            )}
            <select
              value={formData.timezone}
              onChange={(e) => setFormData(prev => ({ ...prev, timezone: e.target.value }))}
              className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-gray-100 focus:border-blue-500 focus:outline-none transition-colors"
            >
              <option value="">Select timezone</option>
              {timezones.map(tz => (
                <option key={tz} value={tz} className="text-black bg-white">
                  {tz}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => {
                const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
                if (timeZone) {
                  setFormData(prev => ({ ...prev, timezone: timeZone }));
                  toast.success(`Timezone set to ${timeZone}`);
                }
              }}
              className="w-full mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
            >
              Auto Detect Timezone
            </button>
          </motion.div>
        </motion.div>

        <div className="flex gap-3 justify-end mt-8 pt-6 border-t border-gray-700">
          <button
            className="px-4 py-2.5 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-all"
            onClick={() => navigate("/login")}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="px-6 py-2.5 bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 rounded-lg font-medium transition-all shadow-lg"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? "Saving..." : "Complete Profile"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
