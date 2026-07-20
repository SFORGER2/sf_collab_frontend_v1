// src/components/hooks/usePitchDeck.js
// Module 6 — API Integration
// Handles all pitch deck API calls with JWT auth from localStorage.

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const BASE = '/api/pitch-deck';

/**
 * Custom hook for the Pitch Deck Generator API.
 *
 * Usage:
 *   const { generateDeck, fetchMyDecks, downloadDeck, deleteDeck, loading, error } = usePitchDeck();
 *
 * Auth: reads Bearer token from localStorage("access_token") — same pattern
 * used throughout SFCollab service layer.
 */
export function usePitchDeck() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // ─── helpers ─────────────────────────────────────────────────────────────

  const getAuthHeaders = () => {
    const token = localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  };

  /**
   * Handle 401 responses — token expired mid-request or session invalid.
   * Redirects to /login so the user can re-authenticate.
   */
  const handle401 = useCallback(() => {
    navigate('/login', { replace: true });
  }, [navigate]);

  // ─── generateDeck ────────────────────────────────────────────────────────

  /**
   * POST /api/pitch-deck/generate
   * Takes 10–25 seconds. Caller should show the GeneratingLoader component.
   *
   * @param {object} formData — cleaned form payload (see pitchDeckFormState.js)
   * @returns {object} { deck_id, file_name, template, download_url } on 201
   * @returns {object} { file_name, template, isPartial: true } on 207 (PPTX
   *   generated but not saved to DB — show download-once success, no My Decks link)
   * @throws on 400 / 500 / network error
   */
  const generateDeck = useCallback(async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BASE}/generate`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(formData),
        // fetch has no default timeout — safe for 25s generation window
      });

      // 207: PPTX built but DB save failed — partial success
      if (res.status === 207) {
        const data = await res.json();
        return { ...data.data, isPartial: true };
      }

      if (res.status === 401) {
        handle401();
        throw new Error('Session expired. Please log in again.');
      }

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Generation failed. Please try again.');
      }

      return data.data; // { deck_id, file_name, template, download_url }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [handle401]);

  // ─── fetchMyDecks ────────────────────────────────────────────────────────

  /**
   * GET /api/pitch-deck/my-decks
   * Returns all decks for the logged-in user, newest first.
   *
   * @returns {Array} Array of deck objects
   */
  const fetchMyDecks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BASE}/my-decks`, {
        headers: getAuthHeaders(),
      });

      if (res.status === 401) {
        handle401();
        throw new Error('Session expired. Please log in again.');
      }

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to load your decks.');
      }

      return data.data; // array of deck objects
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [handle401]);

  // ─── downloadDeck ────────────────────────────────────────────────────────

  /**
   * GET /api/pitch-deck/download/:deckId
   *
   * Uses the Blob + anchor trick — required because the auth header cannot be
   * passed via a direct URL (which would open in a new tab without auth).
   * Never opens a new browser tab.
   *
   * @param {number} deckId
   * @param {string} fileName — e.g. "Acme_AI_a3f2b1c0.pptx"
   */
  const downloadDeck = useCallback(async (deckId, fileName) => {
    const token = localStorage.getItem('access_token');
    try {
      const res = await fetch(`${BASE}/download/${deckId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        handle401();
        throw new Error('Session expired.');
      }

      if (res.status === 404) {
        throw new Error('This deck is no longer available. It may have been deleted.');
      }

      if (!res.ok) {
        throw new Error('Download failed. Please try again.');
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();

      // Cleanup
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [handle401]);

  // ─── deleteDeck ─────────────────────────────────────────────────────────

  /**
   * DELETE /api/pitch-deck/delete/:deckId
   * Permanently deletes the deck and its file.
   * Caller should remove the card from local state immediately (optimistic UI).
   *
   * @param {number} deckId
   * @returns {boolean} true on success
   */
  const deleteDeck = useCallback(async (deckId) => {
    try {
      const res = await fetch(`${BASE}/delete/${deckId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (res.status === 401) {
        handle401();
        throw new Error('Session expired.');
      }

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to delete deck.');
      }

      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [handle401]);

  return {
    generateDeck,
    fetchMyDecks,
    downloadDeck,
    deleteDeck,
    loading,
    error,
  };
}
