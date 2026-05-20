import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
  ],
  optimizeDeps: {
    exclude: ['@solvera/pace-core', 'react-router-dom'],
    // Pre-bundle CJS deps used by react-router (avoids splitCookiesString ESM export error in dev).
    include: ['cookie', 'set-cookie-parser'],
  },
  resolve: {
    alias: {
      '@': path.resolve(process.cwd(), 'src'),
    },
    dedupe: ['react', 'react-dom', 'react-router-dom'],
  },
});
