import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // treat .glb (binary glTF) files as static assets so Vite serves them as URLs
  assetsInclude: ['**/*.glb'],
})
