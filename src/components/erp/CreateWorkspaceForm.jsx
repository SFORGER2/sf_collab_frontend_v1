// src/components/erp/CreateWorkspaceForm.jsx
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { workspaceAPI } from '@/services/workspaceAPI';
import { setUser } from '@/services/auth/authSlice';
import { fetchUserProfile } from '@/services/auth/authThunks';

export function CreateWorkspaceForm({ onSuccess }) {
  const dispatch = useDispatch();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Workspace name is required');
      return;
    }
    const workspaceSlug = slug.trim() || name.toLowerCase().replace(/\s+/g, '-');
    setLoading(true);
    setError('');
    try {
      await workspaceAPI.createWorkspace(name, workspaceSlug);
      // Refresh user to get new workspace
      const userData = await dispatch(fetchUserProfile()).unwrap();
      dispatch(setUser(userData));
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create workspace');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#121215] border border-zinc-800 rounded-2xl p-8 w-full max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center text-white">Welcome to ERP</h1>
      <p className="text-zinc-400 text-center mb-6">You don't have a workspace yet. Create one to get started.</p>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-1">Workspace Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            placeholder="My Workspace"
            autoFocus
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-1">Slug (URL identifier)</label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            placeholder="my-workspace"
          />
          <p className="text-xs text-gray-500 mt-1">Auto‑generated from name. Can be edited.</p>
        </div>
        {error && (
          <div className="mb-4 p-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}
        <button
          type="submit"
          disabled={loading || !name.trim()}
          className="w-full py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Creating...' : 'Create Workspace'}
        </button>
      </form>
    </div>
  );
}