import { refreshAccessToken } from './authThunks';

export const tokenMiddleware = (store) => (next) => async (action) => {
  if (action.type.endsWith('/rejected') && action.payload?.includes('401')) {
    try {
      await store.dispatch(refreshAccessToken());
    } catch (err) {
      console.warn('Token refresh failed:', err);
    }
  }
  return next(action);
};
