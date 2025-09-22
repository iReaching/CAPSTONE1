import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  const isProd = mode === 'production'
  return {
    // Use env-configurable base path in production (defaults to '/')
    base: isProd ? (process.env.VITE_BASE || '/') : '/',
    plugins: [tailwindcss(), react()],
    build: { outDir: 'dist' },
  }
})
