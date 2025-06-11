import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: { // Add resolve configuration
    alias: {
      '@': path.resolve(__dirname, './src'), // Define the @ alias
    },
  },
  css: {
    postcss: path.resolve(__dirname, 'postcss.config.cjs'),
  },
})
