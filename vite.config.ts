import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // permite acceso desde la red local
    port: 5176, // puedes cambiar el puerto si deseas
    proxy: {
      '/presigned_url': {
        target: 'http://localhost:5000', // URL de tu backend
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
