import { init as initTheme } from './services/theme/theme';
initTheme();
//import { createRoot } from "react-dom/client";
import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client'; 
import App from './App.jsx';
import './index.css';
import './i18n.js';
import { Provider } from 'react-redux';
import { store } from "./services/store/store"; 
import { registerSW } from 'virtual:pwa-register';

if (import.meta.env.DEV) {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister().then((success) => {
          if (success) {
            console.log('Unregistered active service worker in development mode.');
          }
        });
      }
    });
  }
} else {
  // autoUpdate mode (vite.config.js): reload automatically when the service
  // worker finds a new version, so every browser serves the same fresh bundle.
  // No confirm() prompt — a stale cached build left different browsers on
  // different layouts until the user happened to accept the reload.
  registerSW({
    onNeedRefresh() {
      window.location.reload();
    },
    onOfflineReady() {
      // App shell is cached and ready for offline use — nothing to do.
    },
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
    <Provider store={store}>
      <Suspense fallback={<div>Loading...</div>}>
        <App />
      </Suspense>
    </Provider>
);
