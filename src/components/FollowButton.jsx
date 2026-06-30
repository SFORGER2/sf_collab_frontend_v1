import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useSelector } from 'react-redux';
import { followAPI } from '@/utils/APIs/followAPI';

export function FollowButton({ targetUserId, onFollowChange }) {
  const { user, access_token } = useSelector((state) => state.auth);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSelf, setIsSelf] = useState(false);

  useEffect(() => {
    if (!targetUserId || !user) {
      setLoading(false);
      return;
    }
    if (user.id === targetUserId) {
      setIsSelf(true);
      setLoading(false);
      return;
    }
    const fetchStatus = async () => {
      try {
        const res = await followAPI.getFollowStatus(targetUserId);
        const data = res.data.data || res.data;
        setIsFollowing(data.isFollowing);
      } catch (err) {
        console.error('Failed to fetch follow status:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, [targetUserId, user]);

  const toggleFollow = async () => {
    if (!access_token || !targetUserId) return;
    setLoading(true);
    try {
      if (isFollowing) {
        await followAPI.unfollow(targetUserId);
        setIsFollowing(false);
        if (onFollowChange) onFollowChange(false);
      } else {
        await followAPI.follow(targetUserId);
        setIsFollowing(true);
        if (onFollowChange) onFollowChange(true);
      }
    } catch (err) {
      console.error('Follow action failed:', err);
    } finally {
      setLoading(false);
    }
  };

  if (isSelf || !user) return null;
  if (loading) {
    return <Button disabled><Loader2 className="w-4 h-4 animate-spin mr-2" />Loading</Button>;
  }

  return (
    <Button
      onClick={toggleFollow}
      disabled={loading}
      variant={isFollowing ? 'outline' : 'default'}
      className={isFollowing ? 'border-gray-600 text-gray-300' : 'bg-blue-600 hover:bg-blue-700'}
    >
      {isFollowing ? 'Unfollow' : 'Follow'}
    </Button>
  );
}