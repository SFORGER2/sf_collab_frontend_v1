import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '@/utils/config';
import { Heart } from 'lucide-react'; // or any icon
import { toast } from 'react-toastify';
import { useAuth } from '@/contexts/AuthContext'; // your auth hook

const getToken = () =>
  localStorage.getItem('accessToken') ||
  localStorage.getItem('token') ||
  sessionStorage.getItem('accessToken') || '';

const api = axios.create({ baseURL: API_BASE_URL });
api.interceptors.request.use(cfg => {
  const t = getToken();
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

export default function LikeButton({ entityType, entityId, initialLiked = false, initialCount = 0, onToggle }) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  // Fetch initial state if not provided
  useEffect(() => {
    if (!user) return;
    const fetchState = async () => {
      try {
        const [checkRes, countRes] = await Promise.all([
          api.get(`/reactions/check?entity_type=${entityType}&entity_id=${entityId}`),
          api.get(`/reactions/count?entity_type=${entityType}&entity_id=${entityId}`)
        ]);
        setLiked(checkRes.data.user_reacted);
        setCount(countRes.data.count);
      } catch (err) {
        console.error('Failed to fetch like state:', err);
      }
    };
    fetchState();
  }, [entityType, entityId, user]);

  const handleToggle = async () => {
    if (!user) {
      toast.info('Please log in to like this.');
      return;
    }
    if (loading) return;

    // Optimistic update
    const previousLiked = liked;
    const previousCount = count;
    setLiked(!liked);
    setCount(prev => (previousLiked ? prev - 1 : prev + 1));
    setLoading(true);

    try {
      const res = await api.post('/reactions/toggle', {
        entity_type: entityType,
        entity_id: entityId,
        reaction_type: 'like'
      });
      // Ensure final state matches server
      const newLiked = res.data.status === 'liked';
      setLiked(newLiked);
      // Re-fetch count to be safe (or use server response)
      const countRes = await api.get(`/reactions/count?entity_type=${entityType}&entity_id=${entityId}`);
      setCount(countRes.data.count);
      if (onToggle) onToggle(newLiked);
    } catch (err) {
      // Rollback on failure
      setLiked(previousLiked);
      setCount(previousCount);
      toast.error('Failed to update like. Please try again.');
      console.error('Like toggle error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading || !user}
      className={`flex items-center gap-1 transition-colors ${
        liked ? 'text-red-500' : 'text-gray-400 hover:text-red-400'
      } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <Heart className={`w-5 h-5 ${liked ? 'fill-red-500' : ''}`} />
      <span className="text-sm font-medium">{count}</span>
    </button>
  );
}