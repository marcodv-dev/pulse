import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'logo_pulse.jpeg'],
      manifest: {
        name: 'Pulse',
        short_name: 'Pulse',
        description: 'Pulse — Allenamenti offline con Visual Rest Timer',
        theme_color: '#0D030C',
        background_color: '#0D030C',
        display: 'standalone',
        orientation: 'portrait',
        lang: 'it',
        icons: [
          {
            src: '/logo_pulse.jpeg',
            sizes: '192x192',
            type: 'image/jpeg'
          },
          {
            src: '/logo_pulse.jpeg',
            sizes: '512x512',
            type: 'image/jpeg'
          },
          {
            src: '/logo_pulse.jpeg',
            sizes: '512x512',
            type: 'image/jpeg',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,json}']
      }
    })
  ]
})
