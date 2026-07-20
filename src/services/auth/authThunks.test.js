import { describe, expect, it, vi } from 'vitest';

vi.mock('../../utils/APIs/authAPI', () => ({
  authAPI: {
    refreshTokenRequest: vi.fn(),
  },
}));

import { authAPI } from '../../utils/APIs/authAPI';
import { refreshAccessToken } from './authThunks';

describe('refreshAccessToken thunk', () => {
  it('stores new access and refresh tokens on success', async () => {
    localStorage.setItem('refreshToken', 'old-refresh-token');
    authAPI.refreshTokenRequest.mockResolvedValue({
      access_token: 'new-access-token',
      refresh_token: 'new-refresh-token',
    });

    const dispatch = vi.fn();
    const getState = vi.fn();

    const result = await refreshAccessToken()(dispatch, getState, undefined);

    expect(result.type).toBe('auth/refreshAccessToken/fulfilled');
    expect(localStorage.getItem('access_token')).toBe('new-access-token');
    expect(localStorage.getItem('refreshToken')).toBe('new-refresh-token');
  });

  it('rejects when refresh token is missing', async () => {
    const dispatch = vi.fn();
    const getState = vi.fn();

    const result = await refreshAccessToken()(dispatch, getState, undefined);

    expect(result.type).toBe('auth/refreshAccessToken/rejected');
  });
});
