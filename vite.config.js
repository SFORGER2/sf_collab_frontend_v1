import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import path from "path";
import { BACKEND_URL } from './src/config/backendConfig.js';

const __dirname = path.resolve();

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'LOGO.png', 'robots.txt'],
      workbox: {
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024 // 10MB
      },
      manifest: {
        name: 'SFCOLAB',
        short_name: 'SFCOLAB',
        description: 'Startup Collaboration Platform',
        theme_color: '#000000',
        background_color: '#000000',
        display: 'standalone',
        icons: [
          {
            src: 'LOGO.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'LOGO.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setupTests.js',
    include: ['src/**/*.test.{js,jsx,ts,tsx}'],
  },
  server: {
    host: true,
    proxy: {
      '/api': {
        target: BACKEND_URL,
        changeOrigin: true,
      },
      '/uploads': {
        target: BACKEND_URL,
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
        ws: true,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
})
