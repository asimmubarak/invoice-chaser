import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/auth': 'http://127.0.0.1:8000',
      '/clients': 'http://127.0.0.1:8000',
      '/invoices': 'http://127.0.0.1:8000',
      '/dashboard': 'http://127.0.0.1:8000',
    }
  }
})