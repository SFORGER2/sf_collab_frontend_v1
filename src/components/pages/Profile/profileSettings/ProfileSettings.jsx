// src/components/settings/ProfileSettings.jsx
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { ArrowLeft, Save, User, Bell, Shield } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';  // ← added useSearchParams
import NotificationSection from './NotificationSection';
import PrivacySection from './PrivacySection';
import AppearanceSection from './AppearanceSection';
import PreferencesSection from './PreferencesSection';
import SavedSection from './SavedSection';
import AccountSecurity from './AccountSecurity';
import ProfileSection from './ProfileSection';
import { updateUser as updateUserSlice } from '@/services/auth/authSlice';
import { usersAPI } from '@/utils/APIs/userAPI';
import { authAPI } from '@/utils/APIs/authAPI';
import { CosmosButton, Eyebrow, TutorialsControl } from '@/components/cosmos';

const ProfileSettings = ({ back, activeSection: propActiveSection, initialActiveSection }) => {
  const navigate = useNavigate();
  const [queryParams] = useSearchParams();  // now defined
  const page = queryParams.get('page');
  const [activeSection, setActiveSection] = useState(propActiveSection || initialActiveSection || page || 'profile');

  useEffect(() => {
    const target = propActiveSection || initialActiveSection || page || 'profile';
    if (target === 'settings') {
      setActiveSection('profile');
    } else {
      setActiveSection(target);
    }
  }, [propActiveSection, initialActiveSection, page]);

  useEffect(() => {
    if (activeSection === 'settings') {
      setActiveSection('profile');
    }
  }, [activeSection]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { user, access_token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  /**
   * Seeded with the full nested shape.
   *
   * This was `useState({})`, so the first render of every child section hit
   * `formData.profile?.country` on an undefined `profile` and threw — the
   * settings page never painted at all. The init effect below only runs *after*
   * that first render, so the default has to be structurally complete.
   */
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    status: 'active',
    role: '',
    roles: [],
    profile: { picture: null, bio: '', company: '', socialLinks: {}, country: '', city: '' },
    preferences: {
      emailNotifications: true, pushNotifications: true, privacy: 'public',
      language: 'en', timezone: 'UTC', theme: 'light', builderPreferences: '',
    },
    notificationSettings: {},
  });

  // ── Initialize formData from user ────────────────────────────────
  useEffect(() => {
    if (!user) return;
    setFormData({
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
        socialLinks: user.profile?.socialLinks || {},
        country: user.profile?.country || '',
        city: user.profile?.city || '',
      },
      preferences: {
        emailNotifications: user.preferences?.emailNotifications ?? true,
        pushNotifications: user.preferences?.pushNotifications ?? true,
        privacy: user.preferences?.privacy || 'public',
        language: user.preferences?.language || 'en',
        timezone: user.preferences?.timezone || 'UTC',
        theme: user.preferences?.theme || 'light',
        builderPreferences: user.preferences?.builderPreferences || '',
      },
      notificationSettings: {
        systemWarnings: user.notificationSettings?.systemWarnings ?? true,
        financialAlerts: user.notificationSettings?.financialAlerts ?? true,
        taskReminders: user.notificationSettings?.taskReminders ?? true,
        mentions: user.notificationSettings?.mentions ?? true,
        newComments: user.notificationSettings?.newComments ?? true,
        newLikes: user.notificationSettings?.newLikes ?? true,
        newSuggestions: user.notificationSettings?.newSuggestions ?? true,
        joinRequests: user.notificationSettings?.joinRequests ?? true,
        approvals: user.notificationSettings?.approvals ?? true,
        storyViews: user.notificationSettings?.storyViews ?? true,
        postEngagement: user.notificationSettings?.postEngagement ?? true,
        emailDigest: user.notificationSettings?.emailDigest || 'weekly',
        quietHours: user.notificationSettings?.quietHours || { enabled: false, start: '22:00', end: '08:00' },
      },
      account: {
        isEmailVerified: user.isEmailVerified || false,
        createdAt: user.createdAt || null,
        lastLogin: user.lastLogin || null,
      },
    });
    setLoading(false);
  }, [user]);

  // ── Sidebar sections ──────────────────────────────────────────────
  const sections = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'accountSecurity', label: 'Account & Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  // ── API update helper ─────────────────────────────────────────────
  const updateUser = async (payload, isMultipart = false) => {
    const contentType = isMultipart ? 'multipart/form-data' : 'application/json';
    try {
      const response = await usersAPI.updateProfile(user.id, payload, access_token, contentType);
      const result = response.data || response;
      if (result.error) {
        throw new Error(result.error);
      }
      if (result.success === false) {
        throw new Error(result.message || 'Update failed');
      }
      const updatedUser = result.user || result.data?.user || null;
      if (updatedUser) {
        dispatch(updateUserSlice(updatedUser));
      } else {
        console.warn('No user object in response, but update may have succeeded.');
      }
      return result;
    } catch (error) {
      throw error;
    }
  };

  // ── Profile picture upload ────────────────────────────────────────
  const uploadProfilePicture = async (file) => {
    const form = new FormData();
    form.append('profile_picture', file);
    try {
      const result = await updateUser(form, true);
      const updatedUser = result.user || result.data?.user || null;
      const pictureUrl = updatedUser?.profile?.picture || updatedUser?.profile_picture || updatedUser?.avatar;
      if (pictureUrl) {
        setFormData(prev => ({
          ...prev,
          profile: { ...(prev.profile || {}), picture: pictureUrl },
        }));
      }
      toast.success('Profile picture updated');
      return pictureUrl;
    } catch (e) {
      const msg = e?.response?.data?.error || e?.message || 'Failed to upload picture';
      toast.error(msg);
      throw e;
    }
  };

  // ── Save Profile ──────────────────────────────────────────────────
  const saveProfile = async () => {
    setSaving(true);
    try {
      if (!formData.firstName) throw new Error('First name is required');
      if (!formData.email) throw new Error('Email is required');
      if ((formData.profile?.bio || '').length > 300) throw new Error('Bio cannot exceed 300 characters');
      if ((formData.roles || []).length === 0) throw new Error('At least one role must be selected');
      if (!formData.profile?.country || !formData.preferences?.timezone) {
        throw new Error('Location must be set (country & timezone)');
      }

      let requiresInfluencerApplication = false;
      if ((formData.roles || []).includes('influencer') && !user?.roles?.includes('influencer')) {
        requiresInfluencerApplication = true;
        formData.roles = formData.roles.filter(r => r !== 'influencer');
      }
      if ((formData.roles || []).includes('builder') && !formData.preferences?.builderPreferences) {
        toast.error('You must set up your Builder preferences');
        return;
      }

      await updateUser(formData, false);
      toast.success('Profile updated');

      if (requiresInfluencerApplication) {
        toast.info('Please fill out the Influencer Application Form.', { autoClose: 6000 });
        navigate('/apply-influencer');
        return;
      }

      back(); // go back to profile page
    } catch (e) {
      toast.error(e.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  // ── Save Notifications ────────────────────────────────────────────
  const saveNotificationSettings = async () => {
    setSaving(true);
    try {
      await updateUser({ notificationSettings: formData.notificationSettings });
      toast.success('Notification settings updated');
    } catch (err) {
      toast.error(err.message || 'Failed to update notifications');
    } finally {
      setSaving(false);
    }
  };

  // ── Account Security actions ──────────────────────────────────────
  const changePassword = async (currentPassword, newPassword) => {
    try {
      await updateUser({ currentPassword, password: newPassword });
      toast.success('Password updated successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to change password');
    }
  };

  const changeEmail = async (newEmail, password) => {
    try {
      await updateUser({ email: newEmail, currentPassword: password });
      toast.success('Email updated. Please verify your new email.');
    } catch (err) {
      toast.error(err.message || 'Failed to change email');
    }
  };

  const [confirmedDelete, setConfirmedDelete] = useState(false);
  const deleteAccount = async () => {
    if (!confirmedDelete) {
      setConfirmedDelete(true);
      return;
    }
    try {
      const res = await usersAPI.delete(user.id, access_token);
      if (!res.success) throw new Error(res.error || 'Delete failed');
      toast.success('Account deletion submitted');
      await authAPI.logoutRequest(access_token);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
    } catch (err) {
      toast.error(err.message || 'Failed to delete account');
    }
  };

  // ── Global Save handler ───────────────────────────────────────────
  const handleSave = async () => {
    if (saving) return;
    switch (activeSection) {
      case 'profile':
        await saveProfile();
        break;
      case 'notifications':
        await saveNotificationSettings();
        break;
      case 'accountSecurity':
        toast.info('Use the specific actions inside Account & Security to update password/email/delete account.');
        break;
      default:
        toast.info('Nothing to save for this section.');
    }
  };



  const handleKeyDown = (e, index) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = (index + 1) % sections.length;
      setActiveSection(sections[nextIndex].id);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = (index - 1 + sections.length) % sections.length;
      setActiveSection(sections[prevIndex].id);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] grid place-items-center text-dim">Loading settings…</div>
    );
  }

  const savable = activeSection === 'profile' || activeSection === 'notifications';

  return (
    <div className="text-star w-full max-w-full min-w-0 overflow-x-hidden">
      <div className="max-w-[1180px] w-full max-w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-8 pb-4 sm:pb-8 min-w-0">
        {/* Masthead */}
        <div className="relative flex items-center justify-center mb-5 sm:mb-8 min-w-0 w-full min-h-[50px]">
          <button
            type="button"
            onClick={back}
            aria-label="Back"
            className="absolute left-0 inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 min-h-[38px] sm:min-h-[42px] rounded-xl border border-white/10 bg-white/[0.04] text-[0.82rem] sm:text-[0.85rem] font-medium text-dim hover:text-star hover:bg-white/[0.08] hover:border-white/20 active:scale-[0.98] transition-all duration-200 shadow-sm cursor-pointer shrink-0 z-10"
          >
            <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Back</span>
          </button>
          <div className="text-center min-w-0 mx-auto">
            <Eyebrow className="text-center">Account</Eyebrow>
            <h1 className="font-display text-[1.35rem] sm:text-[1.75rem] font-bold text-star leading-tight tracking-tight mt-0.5 break-words text-center">Settings</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[15rem_minmax(0,1fr)] gap-5 sm:gap-8 w-full max-w-full min-w-0">
          {/* Section nav — sticky top 3-column equal-width segmented control on mobile/tablet, sticky rail on desktop */}
          <nav
            aria-label="Account settings sections"
            className="sticky top-0 lg:top-20 z-20 py-1 sm:py-0 lg:self-start w-full max-w-full min-w-0 flex justify-center lg:block"
          >
            <div
              role="tablist"
              aria-orientation="horizontal"
              className="grid grid-cols-3 lg:flex lg:flex-col gap-1 sm:gap-1.5 w-full max-w-md lg:max-w-none mx-auto p-1 sm:p-1.5 rounded-2xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-xl shadow-lg select-none lg:w-full"
            >
              {sections.map((section, idx) => {
                const isActive = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    role="tab"
                    id={`settings-tab-${section.id}`}
                    aria-selected={isActive}
                    aria-controls={`settings-panel-${section.id}`}
                    tabIndex={isActive ? 0 : -1}
                    onClick={() => setActiveSection(section.id)}
                    onKeyDown={(e) => handleKeyDown(e, idx)}
                    className={`group flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-0.5 sm:gap-2.5 px-1.5 sm:px-3 lg:px-4 py-1.5 sm:py-2.5 min-h-[46px] sm:min-h-[44px] rounded-xl text-[0.66rem] sm:text-[0.84rem] lg:text-[0.88rem] leading-tight transition-all duration-200 w-full text-center lg:text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 touch-manipulation ${
                      isActive
                        ? 'bg-amber-500/15 text-amber-400 font-semibold border border-amber-500/30 shadow-[0_0_15px_rgba(255,191,94,0.2)]'
                        : 'text-dim hover:text-star hover:bg-white/[0.04] border border-transparent'
                    }`}
                  >
                    <section.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 transition-transform duration-200 group-hover:scale-105 pointer-events-none" />
                    <span className="pointer-events-none leading-tight font-medium">
                      {section.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </nav>

          <div className="min-w-0 w-full max-w-full pb-4 sm:pb-0">
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
                  changePassword={changePassword}
                  changeEmail={changeEmail}
                />
              )}
              {activeSection === 'notifications' && (
                <NotificationSection
                  formData={formData}
                  onChange={(patch) =>
                    setFormData(prev => ({
                      ...prev,
                      notificationSettings: { ...(prev.notificationSettings || {}), ...patch },
                    }))
                  }
                />
              )}

              {/* Hidden sections – kept for compatibility, but not shown in sidebar */}
              {activeSection === 'privacy' && <PrivacySection formData={formData} onChange={(patch) => setFormData(prev => ({ ...prev, privacySettings: patch }))} />}
              {activeSection === 'appearance' && <AppearanceSection formData={formData} onChange={(patch) => setFormData(prev => ({ ...prev, preferences: { ...prev.preferences, ...patch } }))} />}
              {activeSection === 'preferences' && <PreferencesSection formData={formData} onChange={(patch) => setFormData(prev => ({ ...prev, preferences: { ...prev.preferences, ...patch } }))} />}
              {activeSection === 'saved' && <SavedSection formData={formData} setFormData={setFormData} />}

            {/* Save bar — floating/sticky mobile action bar on phones, border-t bar on desktop */}
            {savable && (
              <div className="sticky bottom-4 sm:static z-30 p-3.5 sm:p-0 rounded-2xl sm:rounded-none bg-[#120e24]/95 sm:bg-transparent backdrop-blur-2xl sm:backdrop-blur-none border border-white/15 sm:border-t sm:border-white/[0.08] sm:border-x-0 sm:border-b-0 shadow-[0_15px_40px_rgba(0,0,0,0.8)] sm:shadow-none flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-3.5 mt-5 sm:pt-4 w-full max-w-full min-w-0">
                <span className="text-[0.78rem] sm:text-[0.82rem] font-medium text-dim/85 flex items-center justify-center sm:justify-start gap-1.5 break-words max-w-full text-center sm:text-left">
                  Changes apply across the whole ecosystem.
                </span>
                <CosmosButton variant="primary" size="sm" onClick={handleSave} disabled={saving} className="w-full sm:w-auto min-h-[46px] justify-center shadow-[0_0_20px_rgba(255,191,94,0.35)] font-semibold">
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving…' : 'Save changes'}
                </CosmosButton>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;