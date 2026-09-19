import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: false,
      includeAssets: ['favicon.svg', 'app-icon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Layne Baby',
        short_name: 'Layne',
        description: 'Multi-caregiver baby tracker',
        theme_color: '#16120F',
        background_color: '#16120F',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          { src: '/app-icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
          { src: '/app-icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,woff2}'],
      },
    }),
  ],
})
