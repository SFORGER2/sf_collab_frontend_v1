"use client"

import { Check, User, X } from "lucide-react"
import { toast } from "react-toastify"
import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import { setUser } from "../../services/auth/authSlice"
import { usersAPI } from "@/utils/APIs/userAPI"

const ProfileSetting = () => {
  const navigate  = useNavigate()
  const dispatch  = useDispatch()
  const { user }  = useSelector((state) => state.auth)

  const [isLoading, setIsLoading] = useState(false)
  const [bioLength, setBioLength] = useState(0)

  // FIX: was entirely hardcoded ("sfcollab", placeholder URLs).
  // Now pre-populated from Redux user state so the user sees their real data.
  const [formData, setFormData] = useState({
    username:   "",
    profileUrl: "",
    bio:        "",
    facebook:   "",
    twitter:    "",
    linkedin:   "",
  })

  useEffect(() => {
    if (!user) return
    const links = user.profile_social_links || user.socialLinks || {}
    const bio   = user.profile_bio || user.bio || ""
    setFormData({
      username:   user.username || `${user.first_name || ""} ${user.last_name || ""}`.trim(),
      profileUrl: user.profileUrl || `https://sfcollab.com/users/${user.id}`,
      bio,
      facebook:   links.facebook  || "",
      twitter:    links.twitter   || "",
      linkedin:   links.linkedin  || "",
    })
    setBioLength(bio.length)
  }, [user])

  const handleBioChange = (e) => {
    setBioLength(e.target.value.length)
    setFormData((prev) => ({ ...prev, bio: e.target.value }))
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // FIX: was a simulated API call (setTimeout). Now calls usersAPI.updateProfile
  // with the correct field names that the backend profile_routes expects.
  // ProfileSetting.jsx - handleSubmit
const handleSubmit = async (e) => {
  e.preventDefault();
  if (!user) return;

  setIsLoading(true);
  try {
    const payload = {
      profile: {                         // ✅ wrap inside 'profile'
        bio: formData.bio,
        socialLinks: {
          facebook: formData.facebook,
          twitter: formData.twitter,
          linkedin: formData.linkedin,
        },
      },
      // If you later want to support username -> firstName/lastName, handle it separately
    };

    const token = localStorage.getItem("access_token");
    const response = await usersAPI.updateProfile(user.id, payload, token, "application/json");
    const updated = response?.data?.user || response?.user;
    if (updated) {
      dispatch(setUser(updated));
      localStorage.setItem("userData", JSON.stringify(updated));
    }
    toast.success("Profile updated successfully!");
  } catch (error) {
    console.error("Error updating profile:", error);
    toast.error(error?.response?.data?.error || "Failed to update profile.");
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="flex flex-row gap-6">
      <div className="flex-1">
        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Header */}
          <div className="border-b pb-4">
            <h2 className="text-2xl font-medium mb-2">Profile Details</h2>
            <p className="text-[#C4C4C4]">You can change your profile details here seamlessly.</p>
          </div>

          {/* Profile Picture */}
          <div className="flex w-full justify-between border-b pb-4">
            <div className="w-[50%]">
              <h3 className="text-xl font-medium">Profile Picture</h3>
              <p className="text-[#C4C4C4]">This is where people will see your actual face</p>
            </div>
            <div className="flex gap-4 items-center w-[50%]">
              <div className="w-24 h-24 rounded-full overflow-hidden text-center py-4 border border-white/10">
                <img
                  loading="lazy"
                  src={user?.profile_picture || user?.profilePicture || "/default-user.jpeg"}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full transition-colors"
                >
                  Change Picture
                </button>
                <button
                  type="button"
                  className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full transition-colors"
                >
                  Delete Picture
                </button>
              </div>
            </div>
          </div>

          {/* Public Profile */}
          <div className="flex justify-between border-b pb-4">
            <div className="w-[50%] space-y-2">
              <h3 className="text-xl font-medium">Public Profile</h3>
              <p className="text-[#C4C4C4]">
                This is the main profile that will be visible for everyone.
              </p>
            </div>
            <div className="flex flex-col gap-4 w-[50%]">
              <div className="space-y-2">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Username"
                    className="min-w-[500px] bg-[#232323] rounded-full p-2 pl-8"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <input
                  type="text"
                  name="profileUrl"
                  value={formData.profileUrl}
                  onChange={handleChange}
                  placeholder="Profile URL"
                  className="min-w-[500px] bg-[#232323] rounded-full p-2"
                />
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-4 flex justify-between border-b pb-4">
            <div className="w-[50%]">
              <h3 className="text-xl font-medium">Bio Description</h3>
              <p className="text-[#C4C4C4]">This will be your main story.</p>
            </div>
            <div className="space-y-2 w-[50%]">
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleBioChange}
                maxLength={350}
                rows={10}
                placeholder="Enter your bio here"
                className="w-full bg-[#232323] rounded-md p-2 min-h-[100px]"
              />
              <div className="text-right text-sm text-[#C4C4C4]">{bioLength}/350</div>
            </div>
          </div>

          {/* Social Media Links */}
          <div className="flex justify-between border-b pb-4">
            <div className="w-[50%]">
              <h3 className="text-xl font-medium">Social Media Links</h3>
              <p className="text-[#C4C4C4]">Links for your social media.</p>
            </div>
            <div className="space-y-2 w-[50%]">
              <div className="flex">
                <div className="bg-[#232323] rounded-l-md border-r border-white/10 p-2 whitespace-nowrap">
                  facebook.com/
                </div>
                <input
                  type="text"
                  name="facebook"
                  value={formData.facebook}
                  onChange={handleChange}
                  placeholder="your-handle"
                  className="flex-1 bg-[#232323] rounded-r-md p-2"
                />
              </div>
              <div className="flex">
                <div className="bg-[#232323] rounded-l-md border-r border-white/10 p-2 whitespace-nowrap">
                  twitter.com/
                </div>
                <input
                  type="text"
                  name="twitter"
                  value={formData.twitter}
                  onChange={handleChange}
                  placeholder="your-handle"
                  className="flex-1 bg-[#232323] rounded-r-md p-2"
                />
              </div>
              <div className="flex">
                <div className="bg-[#232323] rounded-l-md border-r border-white/10 p-2 whitespace-nowrap">
                  linkedin.com/
                </div>
                <input
                  type="text"
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleChange}
                  placeholder="in/your-name"
                  className="flex-1 bg-[#232323] rounded-r-md p-2"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="bg-[#232323] hover:bg-white/10 text-white px-4 py-2 rounded-full transition-colors flex items-center gap-2"
            >
              Cancel <span><X className="w-4 h-4" /></span>
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-white text-black hover:bg-white/90 px-4 py-2 rounded-full transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading ? "Saving..." : "Save Settings"}{" "}
              <span><Check className="w-4 h-4" /></span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ProfileSetting