import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// GitHub Pages serves the app from /album-vis/, Netlify serves it from the
// site root. Netlify sets NETLIFY=true during its builds.
export default defineConfig({
  plugins: [react()],
  base: process.env.NETLIFY === 'true' ? '/' : '/album-vis/',
})
