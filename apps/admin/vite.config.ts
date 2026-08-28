import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'shared-types': path.resolve(__dirname, '../../packages/shared-types/index.ts'),
    },
  },
  server: {
    port: 3001,
    proxy: {
      '/admin/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
});
