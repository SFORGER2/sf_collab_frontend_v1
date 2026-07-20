// src/config/backendConfig.js
// Centralized configuration to easily connect to your backend without creating .env files.

// 1. If running backend locally, adjust this port to match your local server port (e.g. 5000, 5001, 8000)
export const BACKEND_PORT = 5001; 

// 2. If running backend on a remote server, set this to the remote API URL (e.g. "https://api.example.com")
// Leave as null if you are using localhost.
export const REMOTE_BACKEND_URL = null; 

// Computed backend targets used by the Vite dev server proxy and browser requests
export const LOCAL_BACKEND_URL = `http://localhost:${BACKEND_PORT}`;
export const BACKEND_URL = REMOTE_BACKEND_URL || LOCAL_BACKEND_URL;
