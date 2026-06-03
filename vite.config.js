import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
        // ✅ Add this — fixes IPv6 localhost issues
        configure: (proxy) => {
          proxy.on('error', (err) => console.log('proxy error', err));
          proxy.on('proxyReq', (_, req) => console.log('Proxying:', req.method, req.url));
        }
      }
    }
  }
})