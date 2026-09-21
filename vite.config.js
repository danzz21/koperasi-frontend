import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // Service worker digenerate otomatis saat `npm run build`
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      // Aktifkan juga saat dev supaya manifest & prompt install bisa dicek di
      // http://localhost:5173. Matikan (enabled: false) bila HMR terasa aneh.
      devOptions: { enabled: true, suppressWarnings: true, navigateFallback: 'index.html' },
      workbox: {
        // Cache shell aplikasi
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        // Bersihkan cache usang tiap update
        cleanupOutdatedCaches: true,
        // Jangan precache manifest/backend — selalu fresh
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          {
            // Halaman SPA → network dulu (selalu fresh), fallback cache saat offline
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'koperasi-pages',
              expiration: { maxEntries: 30, maxAgeSeconds: 7 * 24 * 60 * 60 },
              networkTimeoutSeconds: 5,
            },
          },
          {
            // Data API Laravel → network dulu, cache 5 menit sebagai cadangan offline
            urlPattern: ({ url }) => url.pathname.startsWith('/api/'),
            handler: 'NetworkFirst',
            method: 'GET',
            options: {
              cacheName: 'koperasi-api',
              expiration: { maxEntries: 100, maxAgeSeconds: 5 * 60 },
              networkTimeoutSeconds: 8,
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Gambar → cache dulu biar hemat kuota
            urlPattern: ({ request }) =>
              ['image', 'font'].includes(request.destination),
            handler: 'CacheFirst',
            options: {
              cacheName: 'koperasi-assets',
              expiration: { maxEntries: 100, maxAgeSeconds: 30 * 24 * 60 * 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      includeAssets: ['favicon.svg', 'icons/*.png', 'icons.svg'],
      manifest: {
        name: 'K-Samara — Koperasi Syariah',
        short_name: 'K-Samara',
        description:
          'Aplikasi anggota Koperasi Syariah K-Samara: simpanan, pembiayaan, angsuran, dan PPOB.',
        id: '/',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#064e3b',
        theme_color: '#059669',
        lang: 'id',
        dir: 'ltr',
        categories: ['finance', 'business', 'utilities'],
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      // Proxy semua request /api ke Laravel backend
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
