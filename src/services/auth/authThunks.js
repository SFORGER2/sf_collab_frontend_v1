import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  authAPI
} from '../../utils/APIs/authAPI';

// LOGIN
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authAPI.loginRequest(credentials);
      const data = response.data ?? response;

      const access_token =
        data.access_token ||
        data.accessToken ||
        data.token ||
        response.headers?.['x-access-token'] ||
        null;

      const refresh_token =
        data.refresh_token ||
        data.refreshToken ||
        null;

      const user = data.user || data.userData || null;

      if (!user) {
        return rejectWithValue('Login failed: no user data returned');
      }

      if (access_token) {
        localStorage.setItem('access_token', access_token);
      }
      if (refresh_token) {
        localStorage.setItem('refreshToken', refresh_token);
      }
      localStorage.setItem('user', JSON.stringify(user));

      return {
        user,
        access_token,
        refresh_token,
        token: access_token,
        refreshToken: refresh_token,
      };
    } catch (err) {
      const message =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        err?.error ||
        'Login failed';
      return rejectWithValue(message);
    }
  }
);

export const loginGoogleUser = createAsyncThunk(
  'auth/loginGoogleUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const data = await authAPI.loginGoogleRequest(credentials);
      localStorage.setItem('access_token', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// REGISTER
export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData, { rejectWithValue }) => {
    try {
      return await authAPI.registerRequest(userData);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// FETCH PROFILE
export const fetchUserProfile = createAsyncThunk(
  'auth/fetchUserProfile',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('No token found');
      return await authAPI.getProfileRequest(token);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// REFRESH TOKEN
export const refreshAccessToken = createAsyncThunk(
  'auth/refreshAccessToken',
  async (_, { rejectWithValue }) => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) throw new Error('No refresh token found');

      const data = await authAPI.refreshTokenRequest(refreshToken);

      // 🔥 Make sure to match backend response keys (Flask usually returns `access_token`)
      if (data.access_token) {
        localStorage.setItem('access_token', data.access_token);
      }
      if (data.refresh_token) {
        localStorage.setItem('refreshToken', data.refresh_token);
      }

      return data.access_token;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);


// LOGOUT
export const logoutUser = createAsyncThunk('auth/logoutUser', async () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
  return true;
});