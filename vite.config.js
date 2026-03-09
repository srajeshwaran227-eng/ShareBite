import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  base: '/ShareBite/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'ShareBite',
        short_name: 'ShareBite',
        description: 'A smart food redistribution platform',
        theme_color: '#22c55e',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'logo.png',
            sizes: '192x192 512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      'firebase/app': path.resolve(__dirname, './src/mockFirebase.js'),
      'firebase/auth': path.resolve(__dirname, './src/mockFirebase.js'),
      'firebase/firestore': path.resolve(__dirname, './src/mockFirebase.js'),
      'firebase/storage': path.resolve(__dirname, './src/mockFirebase.js')
    }
  }
})
