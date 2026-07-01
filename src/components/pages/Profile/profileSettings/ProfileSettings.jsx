// ProfileSettings.jsx
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Eye, EyeOff } from "lucide-react";
import { ArrowLeft, Save, User, Bell, Shield, Palette, Globe, Bookmark, ExternalLink, Trash2, Share2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import NotificationSection from './NotificationSection';
import PrivacySection from './PrivacySection';
import AppearanceSection from './AppearanceSection';
import PreferencesSection from './PreferencesSection';
import SavedSection from './SavedSection';
import AccountSecurity from './AccountSecurity';
import ProfileSection from './profileSection';
import axios from 'axios';
import { API_URL } from '@/utils/config';
import { updateUser as updateUserSlice } from '@/services/auth/authSlice';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { usersAPI } from '@/utils/APIs/userAPI';
import { authAPI } from '@/utils/APIs/authAPI';
/**
 * Updated Settings UI wired to backend routes:
  - GET /auth/me
  - PUT /users/:id
  - DELETE /users/:id
  - POST /auth/logout
 */



const ProfileSettings = ({ back, activeSection: initialActiveSection }) => {
  const navigate = useNavigate();
  const [queryParams] = useSearchParams()
  const page = queryParams.get('page')
  const [activeSection, setActiveSection] = useState(initialActiveSection || page || 'profile');
  useEffect(() => {
    if (activeSection === 'settings') {
      setActiveSection('profile');
    }
  }, [activeSection]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { user, access_token } = useSelector((state) => state.auth);
  const getAuthHeaders = (json = true) => ({
    ...(json ? { "Content-Type": "application/json" } : {}),
    Authorization: `Bearer ${access_token}`,
  });
  // Unified formData that mirrors backend models:
  const [formData, setFormData] = useState({});
  // Initialize formData with default values from user data

useEffect(() => {
  if (user) {
    setFormData(prev => ({
      ...prev,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      status: user.status || 'active',
      role: user.role || '',
      roles: user.roles || [],
      profile: {
        picture: user.profile?.picture || null,
        bio: user.profile?.bio || '',
        company: user.profile?.company || '',
        socialLinks: user.profile?.socialLinks || {}
      },
      preferences: {
        emailNotifications: user.preferences?.emailNotifications ?? true,
        pushNotifications: user.preferences?.pushNotifications ?? true,
        privacy: user.preferences?.privacy || 'public',
        language: user.preferences?.language || 'en',
        timezone: user.preferences?.timezone || 'UTC',
        theme: user.preferences?.theme || 'light',
        builderPreferences: user.preferences?.builderPreferences || ''
      },
      notificationSettings: {
        newComments: user.notificationSettings?.newComments ?? true,
        newLikes: user.notificationSettings?.newLikes ?? true,
        newSuggestions: user.notificationSettings?.newSuggestions ?? true,
        joinRequests: user.notificationSettings?.joinRequests ?? true,
        approvals: user.notificationSettings?.approvals ?? true,
        storyViews: user.notificationSettings?.storyViews ?? true,
        postEngagement: user.notificationSettings?.postEngagement ?? true,
        emailDigest: user.notificationSettings?.emailDigest || 'weekly',
        quietHours: user.notificationSettings?.quietHours || { enabled: false, start: '22:00', end: '08:00' }
      },
      account: {
        isEmailVerified: user.isEmailVerified || false,
        createdAt: user.createdAt || null,
        lastLogin: user.lastLogin || null
      }
    }));
    setLoading(false);
  }
}, [user]);
  const sections = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'accountSecurity', label: 'Account & Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    // { id: 'privacy', label: 'Privacy', icon: Shield },
    // { id: 'appearance', label: 'Appearance', icon: Palette },
    // { id: 'preferences', label: 'Preferences', icon: Globe },
    // { id: 'saved', label: 'Saved Items', icon: Bookmark }
  ];

  // Initial load (for now with local == no race condition)
  // useEffect(() => {
  //   async function loadAll() {
  //     setLoading(true);
  //     try {

  //       const response = await fetch(`${API_URL}/auth/me`, {
  //         headers: {
  //           ...getAuthHeaders()
  //         }
  //       });

  //       if (response.ok) {
  //         const p = await response.json();
  //         // server returns { profile: { firstName,lastName,email, profile, createdAt,... } }
  //         const serverProfile = p.user || {};

  //         setFormData(prev => ({
  //           ...prev,
  //           firstName: serverProfile.firstName || '',
  //           lastName: serverProfile.lastName || '',
  //           email: serverProfile.email || prev.email,
  //           profile: {
  //             picture: (serverProfile.profile && serverProfile.profile.picture) || prev.profile.picture,
  //             bio: (serverProfile.profile && serverProfile.profile.bio) || '',
  //             company: (serverProfile.profile && serverProfile.profile.company) || '',
  //             socialLinks: (serverProfile.profile && serverProfile.profile.socialLinks) || {}
  //           }
  //         }));
  //       }
  //     } catch (err) {
  //       console.error('Load settings error', err);
  //     } finally {
  //       setLoading(false);
  //     }
  //   }
  //   loadAll();
  // }, [access_token]);




  const saveNotificationSettings = async () => {
    setSaving(true);
    try {
      await updateUser({ notificationSettings: formData.notificationSettings });
      toast.success('Notification settings updated');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update notifications');
    } finally {
      setSaving(false);
    }
  };


  /* -----------------------------------------
     Load user into form (ONCE)
  ----------------------------------------- */
  useEffect(() => {
    if (!user) return;

    setFormData((prev) => ({
      ...prev,
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      role: user.role || "",
      roles: user.roles || [],
      profile: {
        ...prev.profile,
        ...(user.profile || {}),
      },
      preferences: {
        ...prev.preferences,
        ...(user.preferences || {}),
      },
      notificationSettings: {
        ...prev.notificationSettings,
        ...(user.notificationSettings || {}),
      },
    }));
  }, [user]);

  /* -----------------------------------------
     Core update helper
  ----------------------------------------- */
  const dispatch = useDispatch();
  const updateUser = async (payload, isMultipart = false) => {
    // FIX: for FormData, don't set Content-Type — axios must add boundary automatically
    const contentType = isMultipart ? undefined : 'application/json';
    const data = await usersAPI.updateProfile(user.id, payload, access_token, contentType);

    if (!data.success) {
      throw new Error(data.error || "Update failed");
    }
    const updatedUser = data?.data?.user || data?.user || data;
    if (updatedUser?.id) dispatch(updateUserSlice(updatedUser));
    return data;
  };

  /* -----------------------------------------
     Handlers
  ----------------------------------------- */

  const saveProfile = async () => {
    setSaving(true);
    try {
      if (!formData.firstName) {
        throw new Error("First name is required");
      }
      if (!formData.email) {
        throw new Error("Email is required");
      }
      if ((formData?.profile?.bio || '').length > 300) {
        throw new Error("Bio cannot exceed 300 characters");
      }
      if (formData.roles.length === 0) {
        throw new Error("At least one role must be selected");
      }
      if (!formData.profile.country || !formData.preferences.timezone) {
        throw new Error("Location must be set");
      }
      let requiresInfluencerApplication = false;
      if (formData.roles.includes('influencer') && !user?.roles?.includes('influencer')) {
        requiresInfluencerApplication = true;
        formData.roles = formData.roles.filter(role => role !== 'influencer');
      }
      if (formData.roles.includes('builder') && !formData.preferences.builderPreferences) {
        toast.error(
          "You must set up your Builder preferences"
        )
        return
      }
      await updateUser(formData, false);
      toast.success("Profile updated");

      if (requiresInfluencerApplication) {
        toast.info("Please fill out the Influencer Application Form to complete your request.", { autoClose: 6000 });
        navigate("/apply-influencer");
        return;
      }

      back();
      window.location.reload();

    } catch (e) {
      toast.error(e.error);
    } finally {
      setSaving(false);
    }
  };

  const savePreferences = async () => {
    setSaving(true);
    try {
      await updateUser({ preferences: formData.preferences });
      toast.success("Preferences updated");
    } catch (e) {
      toast.error(e.error);
    } finally {
      setSaving(false);
    }
  };


  const uploadProfilePicture = async (file) => {
    const form = new FormData();
    form.append("profile_picture", file);

    try {
      await updateUser(form, true);
      toast.success("Profile picture updated");
    } catch (e) {
      toast.error(e.message);
    }
  };

  // const changeEmail = async (newEmail, password) => {
  //   try {
  //     const res = await updateUser({
  //       newEmail,
  //       password
  //     });
  //     if (!res.ok) {
  //       const err = await res.json().catch(() => ({}));
  //       throw new Error(err.message || 'Change email failed');
  //     }
  //     toast.success('Email changed — verify your new email');
  //     // optionally refresh profile
  //   } catch (err) {
  //     console.error(err);
  //     toast.error(err.message || 'Failed to change email');
  //   }
  // };
  const [confirmedDelete, setConfirmedDelete] = useState(false);
  const deleteAccount = async () => {
    if (!confirmedDelete) {
      setConfirmedDelete(true);
      return;
    }
    try {
      const res = await usersAPI.delete(user.id, access_token);
      if (!res.success) {
        throw new Error(res.message || 'Delete account failed');
      }
      toast.success('Account deletion submitted');
      const logoutResponse = await authAPI.logoutRequest(access_token);
      if (logoutResponse.success) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refreshToken');
        // Clear local auth state - adjust as needed for your auth management
        window.location.href = '/login'; // Redirect to login or homepage
      }
      // optionally redirect / logout
    } catch (err) {
      console.error(err);
      toast.error(err.error || 'Failed to delete account');
    }
  };

  // Helper: global Save based on active section
  const handleSave = async () => {
    if (saving) return;
    if (activeSection === 'profile') await saveProfile();
    else if (activeSection === 'preferences') await savePreferences();
    else if (activeSection === 'notifications') await saveNotificationSettings();
    else if (activeSection === 'accountSecurity') {
      // no-op here; password/email/delete use their own buttons inside section
      toast.info('Use the specific actions inside Account & Security to update password/email/delete account.');
    } else {
      // other sections - no server persistence currently
      toast.info('Nothing to save for this section (handled locally).');
    }
  };

  if (loading) {
    return <div className="p-8 text-gray-300">Loading settings...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={back} className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Profile
          </button>
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-2xl p-6">
              <nav className="space-y-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                      activeSection === section.id ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'
                    }`}
                  >
                    <section.icon className="w-4 h-4" />
                    {section.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-2xl p-2 md:p-8">
              {/* Render sections */}
              {activeSection === 'profile' && (
                <ProfileSection
                  formData={formData}
                  setFormData={setFormData}
                  uploadProfilePicture={uploadProfilePicture}

                />
              )}

              {activeSection === 'accountSecurity' && (
                <AccountSecurity
                  formData={formData}
                  onChange={(patch) => setFormData(prev => ({ ...prev, ...patch }))}
                  confirmedDelete={confirmedDelete}
                  setConfirmedDelete={setConfirmedDelete}
                  deleteAccount={deleteAccount}
                />
              )}

              {activeSection === 'notifications' && (
                <NotificationSection formData={formData}  onChange={(patch) => setFormData(prev => ({ ...prev, notificationSettings: { ...(prev.notifications || {}), ...patch } }))} />
              )}

              {activeSection === 'privacy' && (
                <PrivacySection formData={formData} onChange={(patch) => setFormData(prev => ({ ...prev, privacySettings: { ...(prev.privacySettings || {}), ...patch } }))} />
              )}

              {activeSection === 'appearance' && (
                <AppearanceSection formData={formData} onChange={(patch) => setFormData(prev => ({ ...prev, preferences: { ...(prev.preferences || {}), ...patch } }))} />
              )}

              {activeSection === 'preferences' && (
                <PreferencesSection formData={formData} onChange={(patch) => setFormData(prev => ({ ...prev, preferences: { ...(prev.preferences || {}), ...patch } }))} />
              )}

              {activeSection === 'saved' && <SavedSection formData={formData} setFormData={setFormData} />}

              {/* Global Save Button */}
              <div className="flex justify-end mt-6 pt-6 border-t border-gray-700">
                <button onClick={handleSave} className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;