import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',
  resolve: {
    alias: {
      'react/': 'react',
      'react-dom/': 'react-dom',
    },
  },
}); 