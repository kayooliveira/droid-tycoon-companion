import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from 'vitest/config'

/** Bump when PWA icon assets change (manifest + HTML cache bust). */
const PWA_ICON_VERSION = '5'

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
        'robots.txt',
      ],
      manifest: {
        id: '/',
        name: 'DroidDeck',
        short_name: 'DroidDeck',
        description:
          'Companion for Star Wars Droid Tycoon: rebirths, inventory, and sell tips.',
        theme_color: '#0c121c',
        background_color: '#070b12',
        display: 'standalone',
        display_override: ['standalone'],
        orientation: 'portrait',
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
          {
            src: `/pwa-monochrome.png?v=${PWA_ICON_VERSION}`,
            sizes: '512x512',
            type: 'image/png',
            purpose: 'monochrome',
          },
        ],
        shortcuts: [
          {
            name: 'Progresso',
            short_name: 'Progresso',
            url: '/progress',
            icons: [{ src: `/pwa-192.png?v=${PWA_ICON_VERSION}`, sizes: '192x192' }],
          },
          {
            name: 'Vender',
            short_name: 'Vender',
            url: '/sell',
            icons: [{ src: `/pwa-192.png?v=${PWA_ICON_VERSION}`, sizes: '192x192' }],
          },
        ],
        screenshots: [
          {
            src: `/screenshots/mobile-narrow.png?v=${PWA_ICON_VERSION}`,
            sizes: '390x844',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'Progresso no ciclo',
          },
          {
            src: `/screenshots/mobile-wide.png?v=${PWA_ICON_VERSION}`,
            sizes: '844x390',
            type: 'image/png',
            form_factor: 'wide',
            label: 'DroidDeck home',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,webp,json,woff2,svg,ttf,png}'],
        globIgnores: [
          '**/manifest.webmanifest',
          '**/pwa-*.png',
          '**/pwa-monochrome.png',
          '**/apple-touch-icon.png',
          '**/favicon*.png',
          '**/og-image.png',
          '**/screenshots/**',
        ],
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
        navigateFallback: '/index.html',
        cleanupOutdatedCaches: true,
        skipWaiting: false,
        clientsClaim: true,
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
})
