import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from 'vitest/config'

/** Bump when PWA icon assets change (manifest + HTML cache bust). */
const PWA_ICON_VERSION = '3'

export default defineConfig({
  base: '/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: [
        'favicon.svg',
        'favicon.ico',
        'favicon-16.png',
        'favicon-32.png',
        'og-image.png',
        'og-image.svg',
        'pwa-192.png',
        'pwa-512.png',
        'pwa-512-maskable.png',
        'apple-touch-icon.png',
        'robots.txt',
      ],
      manifest: {
        id: '/',
        name: 'DT Helper',
        short_name: 'DT Helper',
        description:
          'Companion for Star Wars Droid Tycoon — rebirths, inventory, and sell tips.',
        theme_color: '#0c121c',
        background_color: '#070b12',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        lang: 'en',
        icons: [
          {
            src: `/pwa-192.png?v=${PWA_ICON_VERSION}`,
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: `/pwa-512.png?v=${PWA_ICON_VERSION}`,
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: `/pwa-512-maskable.png?v=${PWA_ICON_VERSION}`,
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,webp,svg,png,json,woff2}'],
        navigateFallback: '/index.html',
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
})
