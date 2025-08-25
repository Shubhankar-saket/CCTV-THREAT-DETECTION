import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), // Allows use of '@/App'
    },
  },
  server: {
    port: 5173, // You can change this if you want
    proxy: {
      '/api': {
        target: 'http://localhost:8000', // FastAPI backend
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
