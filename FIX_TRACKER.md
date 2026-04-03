# Frontend Fix Tracker

Date: 2026-04-03

## 1) Backend API Port Alignment
- Issue: Multiple fallbacks pointed to `localhost:5001` while backend runs on `5000`.
- Fix: Updated frontend localhost API fallbacks to `localhost:5000` across source files.
- Key files:
  - `src/utils/config.js`
  - `src/contexts/AuthContext.jsx`
  - `src/contexts/SocketContext.jsx`
  - `src/components/auth/Login.jsx`
  - other API consumer files under `src/components/**`, `src/context/**`, `src/utils/**`

## 2) OAuth Popup Origin/Flow Compatibility
- Issue: Login popup/origin validation was inconsistent with local backend port.
- Fix:
  - Updated OAuth-related localhost allowed origins/URLs to port 5000.
- Key files:
  - `src/components/auth/Login.jsx`
  - `src/components/auth/SignUp.jsx`

## 3) Profile Completion 401 / Session Expired Loop
- Issue A: Profile update API client could send `Authorization: Bearer undefined`.
- Fix A:
  - Only set Authorization header when token exists.
- File:
  - `src/utils/APIs/userAPI.js`

- Issue B: Complete-profile popup relied on Redux token only in some cases.
- Fix B:
  - Added token fallback to localStorage.
  - Improved error message handling for 401 vs other API errors.
- File:
  - `src/Layout/CompleteEmailPopUp.jsx`

- Issue C: Token refresh stored access token under wrong key (`accessToken` vs `access_token`).
- Fix C:
  - Standardized storage key to `access_token`.
- File:
  - `src/services/auth/authThunks.js`

## 4) Runtime Stability During Debugging
- Issue: Multiple Vite instances started and moved to random ports.
- Fix:
  - Restarted with single process pinned to `http://localhost:5173`.

## Notes
- If auth anomalies persist in browser, clear localStorage keys once:
  - `access_token`
  - `refreshToken`
  - `user`
- Then re-login to establish fresh token state with current backend config.
