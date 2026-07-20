import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../LoadingSpinner';

const OAuthCallback = () => {
  const navigate = useNavigate();
  const { handleOAuthCallback } = useAuth();
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const processCallback = async () => {
      try {
        const result = await handleOAuthCallback();

        if (cancelled) return;

        if (result?.success) {
          navigate('/dashboard', { replace: true });
        } else {
          throw new Error(result?.error || 'Authentication failed');
        }
      } catch (err) {
        if (cancelled) return;

        console.error('OAuth callback processing error:', err);
        setError(err.message || 'An unexpected error occurred');

        setTimeout(() => {
          if (!cancelled) navigate('/login', { replace: true });
        }, 3000);
      }
    };

    processCallback();

    return () => {
      cancelled = true;
    };
  }, [handleOAuthCallback, navigate]);

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-red-500 text-xl font-semibold">
            Authentication Error
          </div>
          <div className="text-gray-400">{error}</div>
          <div className="text-sm text-gray-500">
            Redirecting to login...
          </div>
        </div>
      </div>
    );
  }

  return <LoadingSpinner />;
};

export default OAuthCallback;
