import { createSlice } from '@reduxjs/toolkit';
import {
  loginUser,
  loginGoogleUser,
  registerUser,
  fetchUserProfile,
  refreshAccessToken,
  logoutUser,
} from './authThunks';

const initialState = {
  user: JSON.parse(localStorage.getItem('user')) || null,
  access_token: localStorage.getItem('access_token'),
  refreshToken: localStorage.getItem('refreshToken'),

  // ⚠️ KEEP THIS for compatibility
  isAuthenticated: !!localStorage.getItem('access_token'),

  // ⚠️ KEEP THIS
  loading: false,
  error: null,

  // ✅ ADD (non-breaking)
  // allows us to distinguish "booting" vs "logged out"
  hasCheckedProfile: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      localStorage.setItem('user', JSON.stringify(action.payload));
    },

    updateUser: (state, action) => {
      state.user = {
        ...state.user,
        ...action.payload,
      };
      localStorage.setItem('user', JSON.stringify(state.user));
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
      // ======================
      // LOGIN
      // ======================
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
      })
      .addCase(loginGoogleUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ======================
      // REGISTER
      // ======================
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
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ======================
      // PROFILE (🔥 FIXED)
      // ======================
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.hasCheckedProfile = true;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;

        // 🔥 CRITICAL FIX:
        // DO NOT force logout here.
        // Let guards decide based on hasCheckedProfile + token.
        state.hasCheckedProfile = true;
      })

      // ======================
      // REFRESH TOKEN
      // ======================
      .addCase(refreshAccessToken.fulfilled, (state, action) => {
        state.access_token = action.payload;
        state.isAuthenticated = true;
      })

      // ======================
      // LOGOUT
      // ======================
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.access_token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.hasCheckedProfile = true;
      });
  },
});

export const {
  setUser,
  setToken,
  logout,
  clearError,
  updateUser,
} = authSlice.actions;

export default authSlice.reducer;