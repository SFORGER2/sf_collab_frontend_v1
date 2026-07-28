import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { ideaAPI } from '@/utils/APIs/ideaAPI';
import { startupsAPI } from '@/utils/APIs/startupsAPI';

/**
 * useUserVision Hook
 * Checks whether the current logged-in user has registered at least one Vision (Idea) or Startup.
 * Used across the application to enforce the Vision -> Workspace creation pipeline.
 *
 * NOTE: We deliberately do NOT shortcut on user.active_workspace_id because a user can
 * have a workspace from being invited to someone else's — that does not satisfy the
 * "register your own Vision first" requirement. We check actual Vision/Idea records only.
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
      // 1. Check localStorage cache — immediately reflects a Vision just created
      //    in the current session before the backend state fully propagates.
      const localVisions = JSON.parse(localStorage.getItem('sf_user_registered_visions') || '[]');
      if (localVisions && localVisions.length > 0) {
        setHasVision(true);
        setUserVision(localVisions[0]);
        setLoading(false);
        return;
      }

      // 2. Query backend — Ideas (Visions) and Startups are the two canonical
      //    proof-of-Vision records. We query both in parallel for speed.
      const [ideasRes, startupsRes] = await Promise.allSettled([
        ideaAPI.getAllIdeas({ my_ideas: true }),
        startupsAPI.getAll({ my_startups: true }),
      ]);

      let foundVision = null;

      if (ideasRes.status === 'fulfilled') {
        const ideas =
          ideasRes.value?.data?.ideas ||
          ideasRes.value?.ideas ||
          ideasRes.value?.data ||
          [];
        if (Array.isArray(ideas) && ideas.length > 0) {
          foundVision = ideas[0];
        }
      }

      if (!foundVision && startupsRes.status === 'fulfilled') {
        const startups =
          startupsRes.value?.data?.startups ||
          startupsRes.value?.startups ||
          startupsRes.value?.data ||
          [];
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
      // 3. Last-resort fallback: if both APIs are unreachable, grant access to
      //    anyone who at least has an active workspace to avoid locking out
      //    existing users during outages.
      console.warn('[useUserVision] API unreachable, using fallback:', err);
      if (user?.active_workspace_id) {
        setHasVision(true);
        setUserVision({ id: user.active_workspace_id, title: 'Workspace (fallback)' });
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
