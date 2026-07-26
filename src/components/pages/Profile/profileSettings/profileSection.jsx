import { toast } from "react-toastify";
import { countries } from "./countries";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { getProfilePicture } from "@/utils/getProfilePicture";
import { builderFocusOptions } from "./builderFocus";
import { motion } from "framer-motion";
import { User, MapPin, Briefcase, Globe, Link as LinkIcon } from "lucide-react";

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
export default function ProfileSection({ formData, setFormData, uploadProfilePicture }) {
  const timezones = useMemo(() => Intl.supportedValuesOf ? Intl.supportedValuesOf("timeZone") : ['UTC'], []);
  const [loadingCountry, setLoadingCountry] = useState(false);
  const [roles, setRoles] = useState([]);
  const { user } = useSelector((state) => state.auth);

  

  const handleImage = async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  try {
    const url = await uploadProfilePicture(file);
    setFormData(prev => ({ ...prev, profile: { ...prev.profile, picture: url } }));
    toast.success("Image uploaded successfully");
  } catch (error) {
    toast.error("Failed to upload image");
  }
};

  const handleAutoDetectTimezone = () => {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (!timeZone) {
      toast.info("Could not detect timezone");
      return;
    }
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        timezone: timeZone,
      }
    }));
  };

  const handleAutoDetectCountry = async () => {
    try {
      setLoadingCountry(true);
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      if (data.country_name && countries.includes(data.country_name)) {
        setFormData(prev => ({ ...prev, profile: { ...prev.profile, country: data.country_name } }));
      }
      if (data.city) {
        setFormData(prev => ({ ...prev, profile: { ...prev.profile, city: data.city } }));
      }
      if (!data.country_name && !data.city) {
        toast.info("Could not detect country or city");
        return;
      }
      handleAutoDetectTimezone();

    } catch {
      toast.error("Failed to detect location");
    } finally {
      setLoadingCountry(false);
    }
  };

  const fromSnakeToTitleCase = (str) => {
    return str
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  useEffect(() => {
    setRoles(['influencer', 'investor', 'builder', 'founder']);
  }, []);
  const isLocationSet = useMemo(() => {
    return !!formData.profile?.country && !!formData.profile?.city && !!user?.preferences?.timezone;
  }, [formData.profile?.country, formData.profile?.city, user?.preferences?.timezone]);
  console.log(isLocationSet, formData.profile?.country, formData.profile?.city, user?.preferences?.timezone);
  return (
    <motion.div
      className="space-y-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div variants={itemVariants}>
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-blue-600/20 rounded-lg">
            <User className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Profile Settings</h2>
            <p className="text-sm text-gray-400 mt-1">Manage your profile information</p>
          </div>
        </div>
      </motion.div>

      {/* Profile Picture */}
      <motion.div variants={itemVariants} className="p-6 bg-linear-to-r from-blue-600/10 to-cyan-600/10 rounded-xl border border-blue-700/30">
        <label className="block text-sm font-semibold text-gray-200 mb-4">Profile Picture</label>
        <div className="flex flex-wrap justify-center items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-gray-700 overflow-hidden border-2 border-gray-600">
            {(user?.profile?.picture || formData.profile?.picture) ? (
              <img loading="lazy" src={getProfilePicture(user) || formData.profile?.picture} className="w-full h-full object-cover" alt="profile" />
            ) : (
              <div className="flex items-center justify-center text-gray-400 text-sm h-full">No image</div>
            )}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={
                () => document.querySelector('#profileInput').click()
              }
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg cursor-pointer transition-colors font-medium">
              Upload
              <input id="profileInput" type="file" accept="image/*" className="hidden" onChange={handleImage} />
            </button>
            {formData.profile?.picture && (
              <button type="button" onClick={() => setFormData(prev => ({ ...prev, profile: { ...prev.profile, picture: null } }))} className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors font-medium border border-red-600/50">
                Remove
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Basic Info */}
      <motion.div variants={itemVariants} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-2">First Name</label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
              className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-gray-100 focus:border-blue-500 focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-2">Last Name</label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
              className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-gray-100 focus:border-blue-500 focus:outline-none transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-2">Email (read-only)</label>
            <input
              type="text"
              value={formData.email}
              readOnly
              className="w-full bg-gray-700/30 text-gray-400 cursor-not-allowed rounded-lg px-4 py-3 border border-gray-600"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-2">Account Status</label>
            <input
              type="text"
              value={formData.status}
              readOnly
              className="w-full bg-gray-700/30 text-gray-400 cursor-not-allowed rounded-lg px-4 py-3 capitalize border border-gray-600"
            />
          </div>
        </div>
      </motion.div>

      {/* Roles */}
      <motion.div variants={itemVariants}>
        <label className="block text-sm font-semibold text-gray-300 uppercase tracking-wide px-4 mb-4">Select Your Roles</label>
        {(formData.roles || []).length === 0 && (
          <div className="mb-4 p-3 bg-red-600/10 border border-red-600/50 rounded-lg">
            <p className="text-red-400 text-sm font-medium">You must select at least one role to continue</p>
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          {roles.map(role => (
            <motion.label key={role} whileHover={{ x: 2 }} className="flex items-center p-4 bg-gray-700/20 hover:bg-gray-700/30 border border-gray-700/50 rounded-lg cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={formData.roles?.includes(role)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setFormData(prev => ({ ...prev, roles: [...(prev.roles || []), role] }));
                  } else {
                    setFormData(prev => ({ ...prev, roles: (prev.roles || []).filter(r => r !== role) }));
                  }
                }}
                className="w-4 h-4 rounded border-gray-600"
              />
              <span className="ml-3 text-gray-200 font-medium capitalize">{fromSnakeToTitleCase(role)}</span>
            </motion.label>
          ))}
        </div>
      </motion.div>

      {/* Builder Focus */}
      {formData.roles?.includes("builder") && (
        <motion.div variants={itemVariants} className="p-6 bg-linear-to-r from-purple-600/10 to-pink-600/10 rounded-xl border border-purple-700/30">
          <label className="block text-sm font-semibold text-gray-200 mb-3">Builder Focus</label>
          <select
            value={formData.preferences?.builderPreferences || ""}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                preferences: {
                  ...prev.preferences,
                  builderPreferences: e.target.value,
                }
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
          </select>
        </motion.div>
      )}

      {/* Bio */}
      <motion.div variants={itemVariants}>
        <label className="block text-sm font-semibold text-gray-200 mb-2">Bio</label>
        <textarea
          value={formData.profile?.bio || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, profile: { ...prev.profile, bio: e.target.value } }))}
          rows={4}
          className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-gray-100 focus:border-blue-500 focus:outline-none transition-colors resize-none"
        />
        <p className="text-xs text-gray-400 mt-2">{(formData.profile?.bio || '').length}/300 characters</p>
      </motion.div>

      {/* Location */}
      <motion.div variants={itemVariants} className="p-6 bg-linear-to-r from-green-600/10 to-emerald-600/10 rounded-xl border border-green-700/30 space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <MapPin className="w-5 h-5 text-green-400" />
          <label className="text-sm font-semibold text-gray-200">Location</label>
        </div>
        {!isLocationSet && (
          <div className="mb-4 p-3 bg-red-600/10 border border-red-600/50 rounded-lg">
            <p className="text-red-400 text-sm font-medium">You have to set your location to enable all of our features</p>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2">Country</label>
            <select
              value={formData.profile?.country || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, profile: { ...prev.profile, country: e.target.value } }))}
              className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-gray-100 focus:border-green-500 focus:outline-none transition-colors"
            >
              <option value="">Select country</option>
              {countries && countries.map(country => <option key={country} value={country}>{country}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2">City</label>
            <input
              type="text"
              value={formData.profile?.city || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, profile: { ...prev.profile, city: e.target.value } }))}
              className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-gray-100 focus:border-green-500 focus:outline-none transition-colors"
            />
          </div>
          <div className="bg-linear-to-r md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <Globe className="w-5 h-5 text-indigo-400" />
              <label className="text-sm font-semibold text-gray-200">Timezone</label>
            </div>
            <select
              value={formData.preferences?.timezone}
              onChange={(e) => setFormData(prev => ({ ...prev, preferences: { ...prev.preferences, timezone: e.target.value } }))}
              className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-gray-100 focus:border-indigo-500 focus:outline-none transition-colors"
            >
              <option value="">Select timezone</option>
              {timezones.map(tz => <option key={tz} value={tz}>{tz}</option>)}
            </select>
          </div>
        </div>
        <button
          type="button"
          onClick={handleAutoDetectCountry}
          disabled={loadingCountry}
          className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 text-white rounded-lg transition-colors font-medium"
        >
          {loadingCountry ? "Detecting..." : "Auto Detect Location"}
        </button>
      </motion.div>

      {/* Work Info */}
      <motion.div variants={itemVariants} className="space-y-4">
        <div className="p-6 bg-linear-to-r from-orange-600/10 to-amber-600/10 rounded-xl border border-orange-700/30">
          <div className="flex items-center gap-3 mb-4">
            <Briefcase className="w-5 h-5 text-orange-400" />
            <label className="text-sm font-semibold text-gray-200">Work Information</label>
          </div>
          <input
            type="text"
            placeholder="Company name"
            value={formData.profile?.company || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, profile: { ...prev.profile, company: e.target.value } }))}
            className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-gray-100 focus:border-orange-500 focus:outline-none transition-colors"
          />
        </div>

        
      </motion.div>

      {/* Social Links */}
      <motion.div variants={itemVariants} className="p-6 bg-linear-to-r from-pink-600/10 to-rose-600/10 rounded-xl border border-pink-700/30">
        <div className="flex items-center gap-3 mb-4">
          <LinkIcon className="w-5 h-5 text-pink-400" />
          <label className="text-sm font-semibold text-gray-200">Social Links</label>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {["linkedin", "twitter", "github", "portfolio", "facebook", "instagram", "youtube", "dribbble", "behance"].map(platform => (
            <input
              key={platform}
              type="text"
              placeholder={platform}
              value={formData.profile?.socialLinks?.[platform] || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, profile: { ...prev.profile, socialLinks: { ...(prev.profile.socialLinks || {}), [platform]: e.target.value } } }))}
              className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-gray-100 focus:border-pink-500 focus:outline-none transition-colors text-sm"
            />
          ))}
        </div>
      </motion.div>

    </motion.div>
  );
}
