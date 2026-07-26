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
import { CosmosButton, Eyebrow } from '@/components/cosmos';

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
      const pictureUrl = updatedUser?.profile?.picture || updatedUser?.profile_picture;
      if (pictureUrl) {
        setFormData(prev => ({
          ...prev,
          profile: { ...prev.profile, picture: pictureUrl },
        }));
      }
      toast.success('Profile picture updated');
      return pictureUrl;
    } catch (e) {
      toast.error(e.message || 'Failed to upload picture');
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

  if (loading) {
    return (
      <div className="min-h-[60vh] grid place-items-center text-dim">Loading settings…</div>
    );
  }

  const savable = activeSection === 'profile' || activeSection === 'notifications';

  return (
    <div className="min-h-screen text-star">
      <div className="max-w-[1180px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Masthead */}
        <div className="flex flex-wrap items-center gap-3 mb-7">
          <button
            onClick={back}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 text-[0.85rem] text-dim hover:text-star hover:bg-white/[0.05] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to profile
          </button>
          <div className="min-w-0">
            <Eyebrow>Account</Eyebrow>
            <h1 className="font-display text-[1.7rem] text-star leading-tight mt-1">Settings</h1>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[15rem_1fr]">
          {/* Section nav — a rail on desktop, a scrollable row on mobile */}
          <nav className="lg:sticky lg:top-20 lg:self-start">
            <div className="cosmos-panel p-2 flex lg:flex-col gap-1 overflow-x-auto">
              {sections.map((section) => {
                const isActive = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-[0.88rem] whitespace-nowrap transition-colors shrink-0"
                    style={
                      isActive
                        ? {
                            background: 'rgba(255,191,94,0.1)',
                            color: '#ffbf5e',
                            boxShadow: 'inset 2px 0 0 #ffbf5e',
                          }
                        : { color: 'var(--color-dim)' }
                    }
                  >
                    <section.icon className="w-4 h-4 shrink-0" />
                    {section.label}
                  </button>
                );
              })}
            </div>
          </nav>

          <div className="min-w-0">
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

            {/* Save bar. Account & Security has its own per-action buttons, so
                the generic Save is hidden there rather than showing a button
                that only ever explains itself in a toast. */}
            {savable && (
              <div className="flex flex-wrap items-center justify-end gap-3 mt-5 pt-5 border-t border-white/[0.07]">
                <span className="text-[0.8rem] text-dim mr-auto">
                  Changes apply across the whole ecosystem.
                </span>
                <CosmosButton variant="primary" size="sm" onClick={handleSave} disabled={saving}>
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