import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
  },
  build: {
    rollupOptions: {
      output: {
        // Ensure proper asset handling
        entryFileNames: `assets/[name].[hash].js`,
        chunkFileNames: `assets/[name].[hash].js`,
        assetFileNames: `assets/[name].[hash].[ext]`
      }
    },
    // Enable SPA mode for client-side routing
    outDir: 'dist',
    assetsInlineLimit: 0,
    cssCodeSplit: true,
    manifest: true,
    sourcemap: true,
    minify: 'terser'
  },
  // Enable history API fallback
  base: '/',
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom']
  }
})