import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../auth/authSlice';
import { tokenMiddleware } from '../auth/authMiddleware';

export const store = configureStore({
  reducer: {
    auth: authReducer,

  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(tokenMiddleware),
});
