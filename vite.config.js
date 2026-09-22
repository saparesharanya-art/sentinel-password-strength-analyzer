import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/sentinel-password-strength-analyzer/',
  plugins: [react()],
})
