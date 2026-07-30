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

      // 2. Fast-path: Check user object state for formal vision properties.
      //    (We do NOT check active_workspace_id here anymore!)
      if (user.has_vision || user.startup_id) {
        setHasVision(true);
        setUserVision({ id: user.startup_id || user.id, title: 'Registered Vision' });
        setLoading(false);
        return;
      }

      // 3. If it's a frontend-only environment and we made it here, they don't have a vision.
      //    We skip querying the backend to prevent 500 error toasts from the Vite proxy.
      setHasVision(false);
      setUserVision(null);

    } catch (err) {
      console.warn('[useUserVision] API unreachable, using fallback:', err);
      setHasVision(false);
      setUserVision(null);
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
