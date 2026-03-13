// frontend/vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,  // 👈 РАЗРЕШАЕМ ДОСТУП ИЗВНЕ
    watch: {
      usePolling: true  // 👈 ДЛЯ РАБОТЫ В DOCKER НА WINDOWS
    }
  }
})