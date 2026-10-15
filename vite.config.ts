
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/v1/districts': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/api/v1/users': {
        target: 'http://127.0.0.1:8081',
        changeOrigin: true,
      },
    },
  },
})
