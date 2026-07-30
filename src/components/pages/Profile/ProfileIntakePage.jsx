import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { usersAPI } from '@/utils/APIs/userAPI';
import { updateUser as updateUserSlice } from '@/services/auth/authSlice';
import { fieldPayload, toSchemaProfile } from '@/services/profile/profileAdapter';
import ProfileIntake from './ProfileIntake';

/**
 * Route wrapper for the profile intake flow (/profile-intake).
 *
 * Kept separate from the form so the form stays reusable — it is also the right
 * component to drop into onboarding after signup, and into the dashboard as a
 * dismissible prompt for anyone whose profile is thin.
 *
 * Saves field-by-field through the same adapter the inline profile editor uses,
 * so there is exactly one place that knows how the API splits a person across
 * `user`, `user.profile` and `profile.socialLinks`.
 */
export default function ProfileIntakePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, access_token } = useSelector((state) => state.auth);

  const profile = toSchemaProfile(user);

  const handleSave = async (fields) => {
    // One request per field. Chatty, but the PUT merges blobs and a single
    // combined payload would need the adapter to merge three shapes at once —
    // when PATCH /api/users/:id lands this collapses into one call.
    for (const [key, value] of Object.entries(fields)) {
      const payload = fieldPayload(key, value, user);
      if (!payload) continue;

      const res = await usersAPI.updateProfile(
        user.id, payload, access_token, 'application/json'
      );
      const result = res?.data || res;
      if (result?.error) throw new Error(result.error);

      const updated = result?.user || result?.data?.user;
      if (updated) dispatch(updateUserSlice(updated));
    }

    navigate('/user-profile');
  };

  return (
    <div className="w-full max-w-[900px] mx-auto px-4 sm:px-6 py-8">
      <ProfileIntake profile={profile} onSave={handleSave} />
    </div>
  );
}
