import { createSlice } from '@reduxjs/toolkit';
import {
  loginUser,
  loginGoogleUser,
  registerUser,
  fetchUserProfile,
  refreshAccessToken,
  logoutUser,
} from './authThunks';

// Helper function to safely get user from localStorage
const getStoredUser = () => {
  const stored = localStorage.getItem('user');
  if (!stored || stored === 'undefined' || stored === 'null') {
    return null;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    console.error('Failed to parse stored user', e);
    return null;
  }
};

const initialState = {
  user: getStoredUser(),
  access_token: localStorage.getItem('access_token'),
  refreshToken: localStorage.getItem('refreshToken'),
  isAuthenticated: !!localStorage.getItem('access_token'),
  loading: false,
  error: null,
  hasCheckedProfile: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      if (action.payload) {
        localStorage.setItem('user', JSON.stringify(action.payload));
      } else {
        localStorage.removeItem('user');
      }
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      if (state.user) {
        localStorage.setItem('user', JSON.stringify(state.user));
      } else {
        localStorage.removeItem('user');
      }
    },
    setToken: (state, action) => {
      state.access_token = action.payload;
      state.isAuthenticated = true;
      localStorage.setItem('access_token', action.payload);
    },
    logout: (state) => {
      state.user = null;
      state.access_token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.hasCheckedProfile = true;
      localStorage.removeItem('user');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refreshToken');
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.access_token = action.payload.access_token ?? action.payload.token;
        state.refreshToken = action.payload.refresh_token ?? action.payload.refreshToken;
        state.isAuthenticated = !!(state.access_token || action.payload.user);
        state.hasCheckedProfile = true;
        state.error = null;
        if (state.user) {
          localStorage.setItem('user', JSON.stringify(state.user));
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(loginGoogleUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(loginGoogleUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.access_token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        state.hasCheckedProfile = true;
        if (state.user) {
          localStorage.setItem('user', JSON.stringify(state.user));
        }
      })
      .addCase(loginGoogleUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.access_token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        state.hasCheckedProfile = true;
        if (state.user) {
          localStorage.setItem('user', JSON.stringify(state.user));
        }
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.hasCheckedProfile = true;
        if (state.user) {
          localStorage.setItem('user', JSON.stringify(state.user));
        }
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.hasCheckedProfile = true;
      })
      .addCase(refreshAccessToken.fulfilled, (state, action) => {
        state.access_token = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.access_token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.hasCheckedProfile = true;
        localStorage.removeItem('user');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refreshToken');
      });
  },
});

export const { setUser, setToken, logout, clearError, updateUser } = authSlice.actions;
export default authSlice.reducer;