import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { ideaAPI } from '@/utils/APIs/ideaAPI';
import { startupsAPI } from '@/utils/APIs/startupsAPI';

/**
 * useUserVision Hook
 * Checks whether the current logged-in user has registered at least one Vision or Startup.
 * Used across the application to enforce the Vision -> Workspace creation pipeline.
 */
export function useUserVision() {
  const { user } = useSelector((state) => state.auth);
  const [hasVision, setHasVision] = useState(false);
  const [userVision, setUserVision] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkVision = useCallback(async () => {
    if (!user) {
      setHasVision(false);
      setUserVision(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // 1. Check local storage cache for newly registered visions in current session
      const localVisions = JSON.parse(localStorage.getItem('sf_user_registered_visions') || '[]');
      if (localVisions && localVisions.length > 0) {
        setHasVision(true);
        setUserVision(localVisions[0]);
        setLoading(false);
        return;
      }

      // 2. Check user object state
      if (user.active_workspace_id || user.has_vision || user.startup_id) {
        setHasVision(true);
        setUserVision({ id: user.startup_id || user.active_workspace_id, title: 'Registered Vision' });
        setLoading(false);
        return;
      }

      // 3. Query backend APIs
      const [ideasRes, startupsRes] = await Promise.allSettled([
        ideaAPI.getAllIdeas({ my_ideas: true }),
        startupsAPI.getAll({ my_startups: true }),
      ]);

      let foundVision = null;

      if (ideasRes.status === 'fulfilled') {
        const ideas = ideasRes.value?.data?.ideas || ideasRes.value?.ideas || ideasRes.value?.data || [];
        if (Array.isArray(ideas) && ideas.length > 0) {
          foundVision = ideas[0];
        }
      }

      if (!foundVision && startupsRes.status === 'fulfilled') {
        const startups = startupsRes.value?.data?.startups || startupsRes.value?.startups || startupsRes.value?.data || [];
        if (Array.isArray(startups) && startups.length > 0) {
          foundVision = startups[0];
        }
      }

      if (foundVision) {
        setHasVision(true);
        setUserVision(foundVision);
      } else {
        setHasVision(false);
        setUserVision(null);
      }
    } catch (err) {
      console.warn('Failed to fetch user visions:', err);
      // Fallback check on user active workspace
      if (user?.active_workspace_id) {
        setHasVision(true);
        setUserVision({ id: user.active_workspace_id, title: 'Workspace Vision' });
      } else {
        setHasVision(false);
        setUserVision(null);
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    checkVision();
  }, [checkVision]);

  return { hasVision, userVision, loading, refreshVision: checkVision };
}

export default useUserVision;
