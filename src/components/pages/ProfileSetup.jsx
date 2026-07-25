import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../../services/auth/authSlice";
import { Mail, User, Building, Globe, Clock, MapPin, Camera } from "lucide-react";
import { toast } from "react-toastify";
import LoadingSpinner from "../LoadingSpinner";
import { authAPI } from "@/utils/APIs/authAPI";

const COUNTRIES = [
  "United States", "Canada", "United Kingdom", "Australia", "India",
  "Germany", "France", "Japan", "China", "Brazil", "Mexico",
  "Singapore", "UAE", "Nigeria", "Other",
];

const TIMEZONES = [
  "UTC", "EST (UTC-5)", "CST (UTC-6)", "MST (UTC-7)", "PST (UTC-8)",
  "GMT (UTC+0)", "CET (UTC+1)", "IST (UTC+5:30)", "SGT (UTC+8)",
  "AEST (UTC+10)", "JST (UTC+9)", "WAT (UTC+1)",
];

const LANGUAGES = [
  "English", "Spanish", "French", "German", "Hindi",
  "Chinese", "Japanese", "Portuguese", "Russian", "Arabic",
];

export default function ProfileSetup() {
  const navigate  = useNavigate();
  const dispatch  = useDispatch();

  // FIX: get user from Redux — NOT from useAuth() which may not exist
  const { user } = useSelector((state) => state.auth);

  const [isLoading, setIsLoading]                   = useState(false);
  const [profileImage, setProfileImage]             = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    firstName: "",
    lastName:  "",
    email:     "",
    company:   "",
    country:   "",
    city:      "",
    timezone:  "UTC",
    language:  "English",
    bio:       "",
  });

  // Populate from Redux user on mount
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        email:     user.email      || "",
        firstName: user.first_name || user.firstName || "",
        lastName:  user.last_name  || user.lastName  || "",
      }));
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    setProfileImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setProfileImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    const newErrors = {};
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }
    if (!formData.country) {
      newErrors.country = "Please select a country";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setIsLoading(true);
    try {
      const data = new FormData();
      data.append("firstName", formData.firstName);
      data.append("lastName",  formData.lastName);
      data.append("company",   formData.company);
      data.append("country",   formData.country);
      data.append("city",      formData.city);
      data.append("timezone",  formData.timezone);
      data.append("language",  formData.language);
      data.append("bio",       formData.bio);
      if (profileImage) {
        data.append("profileImage", profileImage);
      }

      // FIX: authAPI.setupProfileRequest now hits the correct endpoint
      // (/auth/setup-profile) and uses the shared interceptor for auth —
      // no manual token argument needed
      const response = await authAPI.setupProfileRequest(data);

      if (response.success || response.user) {
        const updatedUser = response.user || response.data;
        dispatch(setUser(updatedUser));
        toast.success("Profile setup completed successfully!");
        setTimeout(() => navigate("/complete-profile"), 1000);
      } else {
        toast.error(response.message || "Failed to setup profile");
      }
    } catch (error) {
      console.error("Error setting up profile:", error);
      toast.error(
        error.response?.data?.message || "Failed to setup profile. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => navigate("/complete-profile");

  // Resolve profile picture URL — backend stores relative paths like /uploads/...
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5001";
  const currentPic = user?.profile_picture
    ? (user.profile_picture.startsWith("http")
        ? user.profile_picture
        : `${API_BASE}${user.profile_picture}`)
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Complete Your Profile</h1>
          <p className="text-gray-400">
            Help us get to know you better. This information will help personalise your experience.
          </p>
        </div>

        <div className="bg-slate-800 rounded-lg shadow-xl border border-slate-700 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Image */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center overflow-hidden border-4 border-slate-700">
                  {profileImagePreview || currentPic ? (
                    <img
                      src={profileImagePreview || currentPic}
                      alt="Profile preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-10 h-10 text-white" />
                  )}
                </div>
                <label className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full cursor-pointer shadow-lg transition">
                  <Camera className="w-4 h-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    aria-label="Upload profile image"
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-300 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  First Name *
                </label>
                <input
                  id="firstName"
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="John"
                  aria-invalid={!!errors.firstName}
                  aria-describedby={errors.firstName ? "firstName-error" : undefined}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  required
                />
                {errors.firstName && <p id="firstName-error" className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-2">
                  Last Name *
                </label>
                <input
                  id="lastName"
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Doe"
                  aria-invalid={!!errors.lastName}
                  aria-describedby={errors.lastName ? "lastName-error" : undefined}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  required
                />
                {errors.lastName && <p id="lastName-error" className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
              </div>
            </div>

            {/* Email (read-only) */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                <Mail className="w-4 h-4 inline mr-2" />
                Email
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                disabled
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-gray-400 placeholder-gray-500 focus:outline-none cursor-not-allowed"
              />
            </div>

            {/* Company + Country */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-300 mb-2">
                  <Building className="w-4 h-4 inline mr-2" />
                  Company
                </label>
                <input
                  id="company"
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  placeholder="Your Company"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-300 mb-2">
                  <Globe className="w-4 h-4 inline mr-2" />
                  Country *
                </label>
                <select
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  aria-invalid={!!errors.country}
                  aria-describedby={errors.country ? "country-error" : undefined}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a country</option>
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                {errors.country && <p id="country-error" className="text-red-500 text-xs mt-1">{errors.country}</p>}
              </div>
            </div>

            {/* City + Timezone + Language */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-300 mb-2">
                  <MapPin className="w-4 h-4 inline mr-2" />
                  City
                </label>
                <input
                  id="city"
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="Your City"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="timezone" className="block text-sm font-medium text-gray-300 mb-2">
                  <Clock className="w-4 h-4 inline mr-2" />
                  Timezone
                </label>
                <select
                  id="timezone"
                  name="timezone"
                  value={formData.timezone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  {TIMEZONES.map((tz) => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="language" className="block text-sm font-medium text-gray-300 mb-2">
                  Language
                </label>
                <select
                  id="language"
                  name="language"
                  value={formData.language}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Bio */}
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-300 mb-2">
                Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                placeholder="Tell us about yourself..."
                rows="4"
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-6">
              <button
                type="button" onClick={handleSkip}
                className="flex-1 px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition"
              >
                Skip for now
              </button>
              <button
                type="submit" disabled={isLoading}
                className="flex-1 px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? <><LoadingSpinner /> Setting up...</> : "Complete Setup"}
              </button>
            </div>
          </form>
        </div>

        <p className="text-center text-gray-500 text-sm mt-6">
          You can always update your profile information later in your account settings.
        </p>
      </div>
    </div>
  );
}