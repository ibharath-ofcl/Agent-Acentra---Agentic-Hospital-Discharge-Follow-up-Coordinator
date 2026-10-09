import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'three-vendor': ['three', '@react-three/fiber', '@react-three/drei', 'postprocessing', '@react-three/postprocessing'],
          'ui-vendor': ['lucide-react', 'framer-motion'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
})

